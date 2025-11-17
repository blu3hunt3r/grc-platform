/**
 * @file index.ts
 * @description Unified LLM interface - single entry point for all agents
 * @module @grc/shared/llm
 * @architecture LLM_VENDOR_FREE_STRATEGY.md "Implementation Architecture"
 *
 * Architecture Reference: LLM_VENDOR_FREE_STRATEGY.md
 * Quote: "Vendor-agnostic task interface - Add new providers in <1 hour"
 *
 * Usage Example:
 * ```typescript
 * import { LLM, TaskType } from '@grc/shared/llm';
 *
 * // Initialize once
 * const llm = LLM.getInstance({
 *   geminiApiKey: process.env.GOOGLE_API_KEY,
 *   claudeApiKey: process.env.ANTHROPIC_API_KEY,
 * });
 *
 * // Use anywhere
 * const response = await llm.executeText({
 *   taskType: TaskType.FAST_AGENTIC,
 *   prompt: 'Analyze this system for compliance gaps...',
 * });
 * ```
 *
 * Related components:
 * - All agents use this as single entry point
 * - Handles routing, failover, monitoring automatically
 */

import { z } from 'zod';
import type {
  LLMTask,
  LLMResponse,
  Provider,
  ProviderConfig,
  ProviderHealth,
  TaskType,
  TokenUsage,
} from './types';
import { LLMFailover } from './failover';
import { LLMMonitoring } from './monitoring';
import { LLMRouter } from './router';

// Re-export types for convenience
export type {
  LLMTask,
  LLMResponse,
  Provider,
  ProviderConfig,
  ProviderHealth,
  TaskType,
  TokenUsage,
};

export { TaskType, Provider } from './types';
export { LLMRouter } from './router';

/**
 * Configuration for LLM system
 */
export interface LLMConfig {
  geminiApiKey: string;
  claudeApiKey: string;
  maxRetries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
}

/**
 * Main LLM class - Singleton pattern for global access
 */
export class LLM {
  private static instance: LLM | null = null;
  private failover: LLMFailover;
  private monitoring: LLMMonitoring;

  private constructor(config: LLMConfig) {
    const {
      maxRetries = 3,
      retryDelayMs = 1000,
      timeoutMs = 30000,
    } = config;

    // Create provider configurations
    const providerConfigs: ProviderConfig[] = [
      {
        provider: Provider.GEMINI_FLASH_LITE,
        apiKey: config.geminiApiKey,
        maxRetries,
        retryDelayMs,
        timeoutMs,
      },
      {
        provider: Provider.GEMINI_FLASH,
        apiKey: config.geminiApiKey,
        maxRetries,
        retryDelayMs,
        timeoutMs,
      },
      {
        provider: Provider.GEMINI_PRO,
        apiKey: config.geminiApiKey,
        maxRetries,
        retryDelayMs,
        timeoutMs,
      },
      {
        provider: Provider.CLAUDE_SONNET,
        apiKey: config.claudeApiKey,
        maxRetries,
        retryDelayMs,
        timeoutMs,
      },
    ];

    this.failover = new LLMFailover(providerConfigs);
    this.monitoring = new LLMMonitoring();
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: LLMConfig): LLM {
    if (!LLM.instance) {
      if (!config) {
        throw new Error('LLM.getInstance() requires config on first call');
      }
      LLM.instance = new LLM(config);
    }
    return LLM.instance;
  }

  /**
   * Reset singleton (useful for testing)
   */
  static resetInstance(): void {
    LLM.instance = null;
  }

  /**
   * Execute text generation with automatic failover
   */
  async executeText(task: LLMTask): Promise<LLMResponse<string>> {
    let success = true;
    let response: LLMResponse<string>;

    try {
      response = await this.failover.executeText(task);
    } catch (error) {
      success = false;
      throw error;
    } finally {
      // @ts-ignore - response will be defined if no error
      if (response!) {
        this.monitoring.recordCall(response!, task.taskType, success);
      }
    }

    return response!;
  }

  /**
   * Execute structured output generation with automatic failover
   */
  async executeObject<T>(
    task: LLMTask,
    schema: z.ZodSchema<T>
  ): Promise<LLMResponse<T>> {
    let success = true;
    let response: LLMResponse<T>;

    try {
      response = await this.failover.executeObject(task, schema);
    } catch (error) {
      success = false;
      throw error;
    } finally {
      // @ts-ignore - response will be defined if no error
      if (response!) {
        this.monitoring.recordCall(response!, task.taskType, success);
      }
    }

    return response!;
  }

  /**
   * Get health status of all providers
   */
  getHealthStatus(): ProviderHealth[] {
    return this.failover.getHealthStatus();
  }

  /**
   * Get monitoring metrics
   */
  getMonitoring(): LLMMonitoring {
    return this.monitoring;
  }

  /**
   * Get estimated cost for a task
   */
  estimateCost(
    taskType: TaskType,
    inputTokens: number,
    outputTokens: number
  ): number {
    const { primary } = LLMRouter.routeTask(taskType);
    return LLMRouter.estimateCost(primary, inputTokens, outputTokens);
  }
}

/**
 * Convenience function for quick text generation
 */
export async function generateText(
  taskType: TaskType,
  prompt: string,
  options?: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    forceProvider?: Provider;
  }
): Promise<string> {
  const llm = LLM.getInstance();
  const response = await llm.executeText({
    taskType,
    prompt,
    ...options,
  });
  return response.result;
}

/**
 * Convenience function for quick structured output generation
 */
export async function generateObject<T>(
  taskType: TaskType,
  prompt: string,
  schema: z.ZodSchema<T>,
  options?: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    forceProvider?: Provider;
  }
): Promise<T> {
  const llm = LLM.getInstance();
  const response = await llm.executeObject(
    {
      taskType,
      prompt,
      ...options,
    },
    schema
  );
  return response.result;
}
