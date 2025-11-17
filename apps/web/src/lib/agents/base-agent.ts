/**
 * Base Agent Class
 *
 * All 16 specialized agents inherit from this base class.
 * Provides common functionality:
 * - LLM integration with multi-provider support
 * - Execution tracking in database
 * - Decision recording
 * - Approval request handling
 * - Error handling and retries
 */

import { prisma } from '@grc/database';
import { AgentType, AuditStatus, ExecutionStatus, Priority, ApprovalType, ApprovalStatus } from '@grc/database';
import { generateTextWithFallback, generateObjectWithFallback, TaskType } from '../llm/providers';
import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

export interface AgentExecutionContext {
  auditId?: string;
  userId: string;
  companyId: string;
  input?: Record<string, any>;
}

export interface AgentDecisionInput {
  type: string;
  description: string;
  reasoning: string;
  confidence: number; // 0.0 to 1.0
  evidence?: Record<string, any>;
  alternatives?: Record<string, any>[];
}

export interface ApprovalRequest {
  title: string;
  description: string;
  type: ApprovalType;
  priority?: Priority;
  metadata?: Record<string, any>;
}

export interface AgentConfig {
  agentType: AgentType;
  agentName: string;
  phase: AuditStatus;
  llmTaskType: TaskType;
  systemPrompt: string;
  maxRetries?: number;
  retryDelayMs?: number;
}

// ============================================================================
// BASE AGENT CLASS
// ============================================================================

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected executionId?: string;
  protected context?: AgentExecutionContext;

  constructor(config: AgentConfig) {
    this.config = {
      maxRetries: 3,
      retryDelayMs: 1000,
      ...config,
    };
  }

  // ==========================================================================
  // ABSTRACT METHODS (must be implemented by child agents)
  // ==========================================================================

  /**
   * Main execution logic - each agent implements this differently
   */
  abstract execute(context: AgentExecutionContext): Promise<any>;

  // ==========================================================================
  // EXECUTION TRACKING
  // ==========================================================================

  /**
   * Start agent execution and create database record
   */
  protected async startExecution(context: AgentExecutionContext): Promise<string> {
    this.context = context;

    const execution = await prisma.agentExecution.create({
      data: {
        auditId: context.auditId,
        agentType: this.config.agentType,
        agentName: this.config.agentName,
        phase: this.config.phase,
        status: ExecutionStatus.RUNNING,
        input: JSON.stringify(context.input || {}),
      },
    });

    this.executionId = execution.id;
    console.log(`[${this.config.agentName}] Execution started: ${this.executionId}`);

    return execution.id;
  }

  /**
   * Complete execution successfully
   */
  protected async completeExecution(output: any): Promise<void> {
    if (!this.executionId) throw new Error('No execution started');

    const startTime = await this.getExecutionStartTime();
    const duration = Date.now() - startTime.getTime();

    await prisma.agentExecution.update({
      where: { id: this.executionId },
      data: {
        status: ExecutionStatus.COMPLETED,
        completedAt: new Date(),
        duration,
        output: JSON.stringify(output),
      },
    });

    console.log(`[${this.config.agentName}] Execution completed in ${duration}ms`);
  }

  /**
   * Mark execution as failed
   */
  protected async failExecution(error: Error): Promise<void> {
    if (!this.executionId) return;

    const startTime = await this.getExecutionStartTime();
    const duration = Date.now() - startTime.getTime();

    await prisma.agentExecution.update({
      where: { id: this.executionId },
      data: {
        status: ExecutionStatus.FAILED,
        completedAt: new Date(),
        duration,
        error: error.message,
      },
    });

    console.error(`[${this.config.agentName}] Execution failed:`, error.message);
  }

  private async getExecutionStartTime(): Promise<Date> {
    if (!this.executionId) throw new Error('No execution started');
    const execution = await prisma.agentExecution.findUnique({
      where: { id: this.executionId },
      select: { startedAt: true },
    });
    return execution!.startedAt;
  }

  // ==========================================================================
  // LLM INTEGRATION
  // ==========================================================================

  /**
   * Call LLM with automatic failover and retry logic
   */
  protected async callLLM(prompt: string, options?: {
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    const { temperature = 0.7, maxTokens = 4096 } = options || {};

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= this.config.maxRetries!; attempt++) {
      try {
        const result = await generateTextWithFallback({
          taskType: this.config.llmTaskType,
          prompt,
          systemPrompt: this.config.systemPrompt,
          temperature,
          maxTokens,
        });

        console.log(`[${this.config.agentName}] LLM call succeeded (${result.provider}/${result.model})`);
        return result.text;
      } catch (error: any) {
        lastError = error;
        console.warn(`[${this.config.agentName}] LLM call failed (attempt ${attempt}/${this.config.maxRetries})`);

        if (attempt < this.config.maxRetries!) {
          await this.sleep(this.config.retryDelayMs! * attempt); // Exponential backoff
        }
      }
    }

    throw new Error(`LLM call failed after ${this.config.maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Call LLM and get structured output
   */
  protected async callLLMStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<T> {
    const { temperature = 0.7, maxTokens = 4096 } = options || {};

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= this.config.maxRetries!; attempt++) {
      try {
        const result = await generateObjectWithFallback({
          taskType: this.config.llmTaskType,
          prompt,
          systemPrompt: this.config.systemPrompt,
          schema,
          temperature,
          maxTokens,
        });

        console.log(`[${this.config.agentName}] Structured LLM call succeeded (${result.provider}/${result.model})`);
        return result.object;
      } catch (error: any) {
        lastError = error;
        console.warn(`[${this.config.agentName}] Structured LLM call failed (attempt ${attempt}/${this.config.maxRetries})`);

        if (attempt < this.config.maxRetries!) {
          await this.sleep(this.config.retryDelayMs! * attempt);
        }
      }
    }

    throw new Error(`Structured LLM call failed after ${this.config.maxRetries} attempts: ${lastError?.message}`);
  }

  // ==========================================================================
  // DECISION RECORDING
  // ==========================================================================

  /**
   * Record an AI decision in the database
   */
  protected async recordDecision(decision: AgentDecisionInput): Promise<void> {
    if (!this.executionId) throw new Error('No execution started');

    await prisma.agentDecision.create({
      data: {
        executionId: this.executionId,
        decisionType: decision.type,
        description: decision.description,
        reasoning: decision.reasoning,
        confidence: decision.confidence,
        evidence: decision.evidence ? JSON.stringify(decision.evidence) : null,
        alternatives: decision.alternatives ? JSON.stringify(decision.alternatives) : null,
      },
    });

    console.log(`[${this.config.agentName}] Decision recorded: ${decision.type} (confidence: ${decision.confidence})`);
  }

  // ==========================================================================
  // APPROVAL HANDLING
  // ==========================================================================

  /**
   * Request human approval and wait for response
   * In MVP, we'll just create the approval record
   * In production, this would block until user responds
   */
  protected async requestApproval(request: ApprovalRequest): Promise<boolean> {
    if (!this.executionId) throw new Error('No execution started');

    const approval = await prisma.approval.create({
      data: {
        executionId: this.executionId,
        title: request.title,
        description: request.description,
        type: request.type,
        priority: request.priority || Priority.MEDIUM,
        status: ApprovalStatus.PENDING,
        metadata: request.metadata ? JSON.stringify(request.metadata) : null,
      },
    });

    console.log(`[${this.config.agentName}] Approval requested: ${request.title}`);

    // Update execution status to awaiting approval
    await prisma.agentExecution.update({
      where: { id: this.executionId },
      data: { status: ExecutionStatus.AWAITING_APPROVAL },
    });

    // TODO: In production, implement WebSocket notification and wait for response
    // For MVP, we'll just return true (auto-approve)
    return true;
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  protected async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Run the agent with full execution tracking
   */
  async run(context: AgentExecutionContext): Promise<any> {
    try {
      await this.startExecution(context);
      const result = await this.execute(context);
      await this.completeExecution(result);
      return result;
    } catch (error: any) {
      await this.failExecution(error);
      throw error;
    }
  }
}
