/**
 * @file agent-execution.repository.ts
 * @description Repository for AgentExecution model - tracks agent workflow executions
 * @module @grc/database/repositories
 * @architecture SYSTEM_PROMPT.md "Pattern 3: Agent-to-Database via Repository Pattern"
 *
 * Architecture Reference: SYSTEM_PROMPT.md Lines 239-244
 * Quote: "Pattern 3: Agent-to-Database via Repository Pattern
 *         class EvidenceRepository {
 *           async save(evidence: Evidence): Promise<void> {
 *             // Prisma implementation
 *           }
 *         }"
 *
 * Purpose:
 * - Tracks agent execution lifecycle (start, running, completed, failed)
 * - Records agent inputs/outputs for audit trail
 * - Links executions to audits and related entities
 * - Provides queries for execution history and status
 *
 * Dependencies:
 * - @prisma/client: Database ORM
 * - ./base.repository: Abstract base class
 *
 * Related components:
 * - All agents use this repository to track their execution
 * - Orchestrator uses this to monitor agent progress
 * - Approval workflows link to agent executions
 * - Audit trail references agent executions
 */

import {
  PrismaClient,
  AgentExecution,
  AgentType,
  ExecutionStatus,
  AuditStatus,
  Prisma,
} from '@prisma/client';
import { BaseRepository } from './base.repository';

/**
 * Input type for creating agent executions
 */
export interface CreateAgentExecutionInput {
  auditId?: string;
  agentType: AgentType;
  agentName: string;
  phase: AuditStatus;
  status?: ExecutionStatus;
  input?: Record<string, any>;
  error?: string;
}

/**
 * Input type for updating agent executions
 */
export interface UpdateAgentExecutionInput {
  status?: ExecutionStatus;
  output?: Record<string, any>;
  error?: string;
  completedAt?: Date;
  duration?: number;
}

/**
 * Query filters for agent executions
 */
export interface AgentExecutionFilters {
  auditId?: string;
  agentType?: AgentType;
  status?: ExecutionStatus;
  phase?: AuditStatus;
  startedAfter?: Date;
  startedBefore?: Date;
}

/**
 * Execution summary statistics
 */
export interface ExecutionStats {
  totalExecutions: number;
  successful: number;
  failed: number;
  running: number;
  avgDuration: number | null;
  byAgentType: Record<string, number>;
  byStatus: Record<string, number>;
}

/**
 * Repository for AgentExecution model
 */
export class AgentExecutionRepository extends BaseRepository<AgentExecution> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'agentExecution');
  }

  /**
   * Create a new agent execution record
   */
  async createExecution(
    input: CreateAgentExecutionInput
  ): Promise<AgentExecution> {
    try {
      return await this.create({
        auditId: input.auditId,
        agentType: input.agentType,
        agentName: input.agentName,
        phase: input.phase,
        status: input.status ?? ExecutionStatus.RUNNING,
        input: input.input ? JSON.stringify(input.input) : null,
        error: input.error,
      });
    } catch (error) {
      this.handleError('createExecution', error, { input });
      throw error;
    }
  }

  /**
   * Update an execution (typically to mark as completed/failed)
   */
  async updateExecution(
    id: string,
    input: UpdateAgentExecutionInput
  ): Promise<AgentExecution> {
    try {
      const updateData: Prisma.AgentExecutionUpdateInput = {};

      if (input.status) {
        updateData.status = input.status;
      }

      if (input.output) {
        updateData.output = JSON.stringify(input.output);
      }

      if (input.error) {
        updateData.error = input.error;
      }

      if (input.completedAt) {
        updateData.completedAt = input.completedAt;
      }

      if (input.duration !== undefined) {
        updateData.duration = input.duration;
      }

      return await this.update(id, updateData);
    } catch (error) {
      this.handleError('updateExecution', error, { id, input });
      throw error;
    }
  }

  /**
   * Mark execution as completed with output
   */
  async completeExecution(
    id: string,
    output: Record<string, any>
  ): Promise<AgentExecution> {
    try {
      const execution = await this.findById(id);
      if (!execution) {
        throw new Error(`Execution ${id} not found`);
      }

      const duration = execution.startedAt
        ? Date.now() - execution.startedAt.getTime()
        : null;

      return await this.updateExecution(id, {
        status: ExecutionStatus.COMPLETED,
        output,
        completedAt: new Date(),
        duration: duration ?? undefined,
      });
    } catch (error) {
      this.handleError('completeExecution', error, { id, output });
      throw error;
    }
  }

  /**
   * Mark execution as failed with error
   */
  async failExecution(id: string, error: string): Promise<AgentExecution> {
    try {
      const execution = await this.findById(id);
      if (!execution) {
        throw new Error(`Execution ${id} not found`);
      }

      const duration = execution.startedAt
        ? Date.now() - execution.startedAt.getTime()
        : null;

      return await this.updateExecution(id, {
        status: ExecutionStatus.FAILED,
        error,
        completedAt: new Date(),
        duration: duration ?? undefined,
      });
    } catch (error) {
      this.handleError('failExecution', error, { id, error });
      throw error;
    }
  }

  /**
   * Find executions by filters
   */
  async findByFilters(
    filters: AgentExecutionFilters,
    options?: {
      skip?: number;
      take?: number;
      orderBy?: Prisma.AgentExecutionOrderByWithRelationInput;
      include?: Prisma.AgentExecutionInclude;
    }
  ): Promise<AgentExecution[]> {
    try {
      const where: Prisma.AgentExecutionWhereInput = {};

      if (filters.auditId) {
        where.auditId = filters.auditId;
      }

      if (filters.agentType) {
        where.agentType = filters.agentType;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.phase) {
        where.phase = filters.phase;
      }

      if (filters.startedAfter || filters.startedBefore) {
        where.startedAt = {};
        if (filters.startedAfter) {
          where.startedAt.gte = filters.startedAfter;
        }
        if (filters.startedBefore) {
          where.startedAt.lte = filters.startedBefore;
        }
      }

      return await this.findMany(where, {
        skip: options?.skip,
        take: options?.take,
        orderBy: options?.orderBy ?? { startedAt: 'desc' },
        include: options?.include,
      });
    } catch (error) {
      this.handleError('findByFilters', error, { filters, options });
      throw error;
    }
  }

  /**
   * Find all executions for an audit
   */
  async findByAuditId(
    auditId: string,
    options?: {
      include?: Prisma.AgentExecutionInclude;
    }
  ): Promise<AgentExecution[]> {
    try {
      return await this.findMany(
        { auditId },
        {
          orderBy: { startedAt: 'desc' },
          include: options?.include,
        }
      );
    } catch (error) {
      this.handleError('findByAuditId', error, { auditId, options });
      throw error;
    }
  }

  /**
   * Find executions by agent type
   */
  async findByAgentType(
    agentType: AgentType,
    options?: {
      status?: ExecutionStatus;
      limit?: number;
    }
  ): Promise<AgentExecution[]> {
    try {
      const where: Prisma.AgentExecutionWhereInput = { agentType };

      if (options?.status) {
        where.status = options.status;
      }

      return await this.findMany(where, {
        take: options?.limit,
        orderBy: { startedAt: 'desc' },
      });
    } catch (error) {
      this.handleError('findByAgentType', error, { agentType, options });
      throw error;
    }
  }

  /**
   * Find currently running executions
   */
  async findRunning(auditId?: string): Promise<AgentExecution[]> {
    try {
      const where: Prisma.AgentExecutionWhereInput = {
        status: ExecutionStatus.RUNNING,
      };

      if (auditId) {
        where.auditId = auditId;
      }

      return await this.findMany(where, {
        orderBy: { startedAt: 'asc' },
      });
    } catch (error) {
      this.handleError('findRunning', error, { auditId });
      throw error;
    }
  }

  /**
   * Find executions awaiting approval
   */
  async findAwaitingApproval(auditId?: string): Promise<AgentExecution[]> {
    try {
      const where: Prisma.AgentExecutionWhereInput = {
        status: ExecutionStatus.AWAITING_APPROVAL,
      };

      if (auditId) {
        where.auditId = auditId;
      }

      return await this.findMany(where, {
        orderBy: { startedAt: 'asc' },
        include: {
          approvals: {
            where: {
              status: 'PENDING',
            },
          },
        },
      });
    } catch (error) {
      this.handleError('findAwaitingApproval', error, { auditId });
      throw error;
    }
  }

  /**
   * Get execution with all related data
   */
  async findByIdWithRelations(id: string) {
    try {
      return await this.prisma.agentExecution.findUnique({
        where: { id },
        include: {
          audit: true,
          decisions: {
            orderBy: { createdAt: 'desc' },
          },
          approvals: {
            orderBy: { requestedAt: 'desc' },
          },
          tasks: {
            orderBy: { createdAt: 'desc' },
          },
          findings: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } catch (error) {
      this.handleError('findByIdWithRelations', error, { id });
      throw error;
    }
  }

  /**
   * Get execution statistics
   */
  async getExecutionStats(
    auditId?: string,
    agentType?: AgentType
  ): Promise<ExecutionStats> {
    try {
      const where: Prisma.AgentExecutionWhereInput = {};

      if (auditId) {
        where.auditId = auditId;
      }

      if (agentType) {
        where.agentType = agentType;
      }

      const executions = await this.findMany(where);

      const stats: ExecutionStats = {
        totalExecutions: executions.length,
        successful: 0,
        failed: 0,
        running: 0,
        avgDuration: null,
        byAgentType: {},
        byStatus: {},
      };

      let totalDuration = 0;
      let durationCount = 0;

      executions.forEach((exec) => {
        // Count by status
        if (exec.status === ExecutionStatus.COMPLETED) stats.successful++;
        if (exec.status === ExecutionStatus.FAILED) stats.failed++;
        if (exec.status === ExecutionStatus.RUNNING) stats.running++;

        // Count by agent type
        stats.byAgentType[exec.agentType] =
          (stats.byAgentType[exec.agentType] || 0) + 1;

        // Count by status
        stats.byStatus[exec.status] = (stats.byStatus[exec.status] || 0) + 1;

        // Calculate average duration
        if (exec.duration) {
          totalDuration += exec.duration;
          durationCount++;
        }
      });

      if (durationCount > 0) {
        stats.avgDuration = Math.round(totalDuration / durationCount);
      }

      return stats;
    } catch (error) {
      this.handleError('getExecutionStats', error, { auditId, agentType });
      throw error;
    }
  }

  /**
   * Get recent execution history for an agent type
   */
  async getRecentHistory(
    agentType: AgentType,
    limit: number = 10
  ): Promise<AgentExecution[]> {
    try {
      return await this.findMany(
        { agentType },
        {
          take: limit,
          orderBy: { startedAt: 'desc' },
        }
      );
    } catch (error) {
      this.handleError('getRecentHistory', error, { agentType, limit });
      throw error;
    }
  }

  /**
   * Check if an execution is still running (not stuck)
   */
  async isHealthy(id: string, maxDurationMs: number = 300000): Promise<boolean> {
    try {
      const execution = await this.findById(id);
      if (!execution) {
        return false;
      }

      if (execution.status !== ExecutionStatus.RUNNING) {
        return true; // Completed/failed executions are considered "healthy"
      }

      const runningTime = Date.now() - execution.startedAt.getTime();
      return runningTime < maxDurationMs;
    } catch (error) {
      this.handleError('isHealthy', error, { id, maxDurationMs });
      throw error;
    }
  }

  /**
   * Find stuck executions (running for too long)
   */
  async findStuckExecutions(maxDurationMs: number = 300000): Promise<AgentExecution[]> {
    try {
      const threshold = new Date(Date.now() - maxDurationMs);

      return await this.findMany({
        status: ExecutionStatus.RUNNING,
        startedAt: {
          lt: threshold,
        },
      });
    } catch (error) {
      this.handleError('findStuckExecutions', error, { maxDurationMs });
      throw error;
    }
  }

  /**
   * Cancel a running execution
   */
  async cancelExecution(id: string, reason?: string): Promise<AgentExecution> {
    try {
      const execution = await this.findById(id);
      if (!execution) {
        throw new Error(`Execution ${id} not found`);
      }

      if (execution.status !== ExecutionStatus.RUNNING) {
        throw new Error(`Cannot cancel execution with status ${execution.status}`);
      }

      const duration = execution.startedAt
        ? Date.now() - execution.startedAt.getTime()
        : null;

      return await this.updateExecution(id, {
        status: ExecutionStatus.CANCELLED,
        error: reason ?? 'Execution cancelled by user',
        completedAt: new Date(),
        duration: duration ?? undefined,
      });
    } catch (error) {
      this.handleError('cancelExecution', error, { id, reason });
      throw error;
    }
  }
}
