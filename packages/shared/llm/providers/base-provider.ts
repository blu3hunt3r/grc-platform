/**
 * @file base-provider.ts
 * @description Abstract base class for all LLM providers - ensures consistency
 * @module @grc/shared/llm/providers
 * @architecture architecture/03_system_architecture.md "Agent Communication Patterns"
 *
 * Architecture Reference: architecture/03_system_architecture.md
 * Quote: "All LLM access must go through provider abstraction to avoid vendor lock-in"
 *
 * Dependencies:
 * - ../types: Provider types
 * - zod: Schema validation
 *
 * Related components:
 * - GeminiProvider extends this
 * - ClaudeProvider extends this
 * - Ensures all providers have same interface
 */

import { z } from 'zod';
import type { LLMTask, LLMResponse, ProviderConfig, TokenUsage } from '../types';

export abstract class BaseProvider {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  /**
   * Generate text response (must be implemented by provider)
   */
  abstract generateText(task: LLMTask): Promise<LLMResponse<string>>;

  /**
   * Generate structured object (must be implemented by provider)
   */
  abstract generateObject<T>(
    task: LLMTask,
    schema: z.ZodSchema<T>
  ): Promise<LLMResponse<T>>;

  /**
   * Health check (must be implemented by provider)
   */
  abstract healthCheck(): Promise<boolean>;

  /**
   * Get provider name
   */
  abstract getProviderName(): string;

  /**
   * Retry logic with exponential backoff
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        console.warn(
          `[${this.getProviderName()}] ${context} failed (attempt ${attempt}/${this.config.maxRetries}):`,
          error.message
        );

        if (attempt < this.config.maxRetries) {
          const delay = this.config.retryDelayMs * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(
      `[${this.getProviderName()}] ${context} failed after ${this.config.maxRetries} attempts: ${lastError?.message}`
    );
  }

  protected async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Calculate token usage and cost
   */
  protected calculateUsage(
    inputTokens: number,
    outputTokens: number
  ): TokenUsage {
    // Implemented by child classes with provider-specific pricing
    return {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      cost: 0, // Override in child
    };
  }
}
