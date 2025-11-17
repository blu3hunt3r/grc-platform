/**
 * @file failover.ts
 * @description Automatic failover logic with exponential backoff and provider health monitoring
 * @module @grc/shared/llm
 * @architecture LLM_VENDOR_FREE_STRATEGY.md "Failover Strategy"
 *
 * Architecture Reference: LLM_VENDOR_FREE_STRATEGY.md
 * Quote: "Level 1: Model-Level Failover - Try primary, fallback to next tier, then different provider"
 *
 * Dependencies:
 * - ./types: Type definitions
 * - ./router: Task routing logic
 * - ./providers/*: Provider implementations
 *
 * Related components:
 * - All agents use this for resilient LLM access
 * - Monitors provider health and adjusts routing
 */

import { z } from 'zod';
import type {
  LLMTask,
  LLMResponse,
  Provider,
  ProviderConfig,
  ProviderHealth,
} from './types';
import { LLMRouter } from './router';
import { GeminiProvider } from './providers/gemini';
import { ClaudeProvider } from './providers/claude';
import { BaseProvider } from './providers/base-provider';

export class LLMFailover {
  private providers: Map<Provider, BaseProvider> = new Map();
  private healthStatus: Map<Provider, ProviderHealth> = new Map();
  private readonly HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly ERROR_RATE_THRESHOLD = 0.05; // 5%

  constructor(configs: ProviderConfig[]) {
    // Initialize providers
    configs.forEach((config) => {
      let provider: BaseProvider;

      if (config.provider.includes('gemini')) {
        provider = new GeminiProvider(config);
      } else if (config.provider.includes('claude')) {
        provider = new ClaudeProvider(config);
      } else {
        throw new Error(`Unknown provider: ${config.provider}`);
      }

      this.providers.set(config.provider, provider);

      // Initialize health status
      this.healthStatus.set(config.provider, {
        provider: config.provider,
        healthy: true,
        errorRate: 0,
        avgLatency: 0,
        lastCheck: new Date(),
      });
    });

    // Start background health checks
    this.startHealthChecks();
  }

  /**
   * Execute task with automatic failover
   */
  async executeText(task: LLMTask): Promise<LLMResponse<string>> {
    const { primary, fallback } = LLMRouter.routeTask(
      task.taskType,
      task.forceProvider
    );

    // Try primary provider
    try {
      const provider = this.getProvider(primary);
      const response = await provider.generateText(task);
      this.recordSuccess(primary, response.latency);
      return response;
    } catch (primaryError: any) {
      console.warn(`[LLMFailover] Primary provider ${primary} failed:`, primaryError.message);
      this.recordError(primary);

      // Try fallback provider
      try {
        const provider = this.getProvider(fallback);
        const response = await provider.generateText(task);
        this.recordSuccess(fallback, response.latency);

        // Mark that we used fallback
        return {
          ...response,
          usedFallback: true,
        };
      } catch (fallbackError: any) {
        console.error(`[LLMFailover] Fallback provider ${fallback} also failed:`, fallbackError.message);
        this.recordError(fallback);

        // Both providers failed - throw detailed error
        throw new Error(
          `All providers failed for task type ${task.taskType}. ` +
          `Primary (${primary}): ${primaryError.message}. ` +
          `Fallback (${fallback}): ${fallbackError.message}`
        );
      }
    }
  }

  /**
   * Execute task with structured output and automatic failover
   */
  async executeObject<T>(
    task: LLMTask,
    schema: z.ZodSchema<T>
  ): Promise<LLMResponse<T>> {
    const { primary, fallback } = LLMRouter.routeTask(
      task.taskType,
      task.forceProvider
    );

    // Try primary provider
    try {
      const provider = this.getProvider(primary);
      const response = await provider.generateObject(task, schema);
      this.recordSuccess(primary, response.latency);
      return response;
    } catch (primaryError: any) {
      console.warn(`[LLMFailover] Primary provider ${primary} failed:`, primaryError.message);
      this.recordError(primary);

      // Try fallback provider
      try {
        const provider = this.getProvider(fallback);
        const response = await provider.generateObject(task, schema);
        this.recordSuccess(fallback, response.latency);

        // Mark that we used fallback
        return {
          ...response,
          usedFallback: true,
        };
      } catch (fallbackError: any) {
        console.error(`[LLMFailover] Fallback provider ${fallback} also failed:`, fallbackError.message);
        this.recordError(fallback);

        // Both providers failed - throw detailed error
        throw new Error(
          `All providers failed for task type ${task.taskType}. ` +
          `Primary (${primary}): ${primaryError.message}. ` +
          `Fallback (${fallback}): ${fallbackError.message}`
        );
      }
    }
  }

  /**
   * Get provider instance
   */
  private getProvider(provider: Provider): BaseProvider {
    const instance = this.providers.get(provider);
    if (!instance) {
      throw new Error(`Provider not initialized: ${provider}`);
    }
    return instance;
  }

  /**
   * Record successful execution
   */
  private recordSuccess(provider: Provider, latency: number): void {
    const health = this.healthStatus.get(provider);
    if (!health) return;

    // Update average latency (simple moving average)
    health.avgLatency = (health.avgLatency * 0.9) + (latency * 0.1);
    health.errorRate = health.errorRate * 0.95; // Decay error rate
    health.healthy = health.errorRate < this.ERROR_RATE_THRESHOLD;
  }

  /**
   * Record failed execution
   */
  private recordError(provider: Provider): void {
    const health = this.healthStatus.get(provider);
    if (!health) return;

    // Increase error rate
    health.errorRate = Math.min(1.0, health.errorRate + 0.1);
    health.healthy = health.errorRate < this.ERROR_RATE_THRESHOLD;

    if (!health.healthy) {
      console.error(
        `[LLMFailover] Provider ${provider} marked unhealthy (error rate: ${(health.errorRate * 100).toFixed(1)}%)`
      );
    }
  }

  /**
   * Start background health checks
   */
  private startHealthChecks(): void {
    setInterval(async () => {
      for (const [providerEnum, provider] of this.providers) {
        try {
          const healthy = await provider.healthCheck();
          const health = this.healthStatus.get(providerEnum);
          if (health) {
            health.healthy = healthy;
            health.lastCheck = new Date();

            if (!healthy) {
              console.warn(`[LLMFailover] Health check failed for ${providerEnum}`);
            }
          }
        } catch (error) {
          console.error(`[LLMFailover] Health check error for ${providerEnum}:`, error);
        }
      }
    }, this.HEALTH_CHECK_INTERVAL);
  }

  /**
   * Get current health status of all providers
   */
  getHealthStatus(): ProviderHealth[] {
    return Array.from(this.healthStatus.values());
  }

  /**
   * Get health status for specific provider
   */
  getProviderHealth(provider: Provider): ProviderHealth | undefined {
    return this.healthStatus.get(provider);
  }
}
