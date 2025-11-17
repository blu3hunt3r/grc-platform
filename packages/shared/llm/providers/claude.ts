/**
 * @file claude.ts
 * @description Anthropic Claude Sonnet 4.5 provider implementation (fallback)
 * @module @grc/shared/llm/providers
 * @architecture LLM_VENDOR_FREE_STRATEGY.md "Fallback: Anthropic Claude Sonnet 4.5"
 *
 * Architecture Reference: LLM_VENDOR_FREE_STRATEGY.md
 * Quote: "Fallback: Anthropic Claude Sonnet 4.5 - Best reasoning depth when Gemini struggles"
 *
 * Dependencies:
 * - @ai-sdk/anthropic: Vercel AI SDK Anthropic provider
 * - ai: Vercel AI SDK core
 * - zod: Schema validation
 *
 * Related components:
 * - Used as fallback when Gemini fails or rate-limited
 * - Primary for policy generation (superior quality)
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';
import { BaseProvider } from './base-provider';
import type { LLMTask, LLMResponse, ProviderConfig } from '../types';
import { LLMRouter } from '../router';

export class ClaudeProvider extends BaseProvider {
  /**
   * Map our provider enum to actual Claude model names
   */
  private getModelName(): string {
    // Using Claude Sonnet 4.5 (latest as of Nov 2025)
    return 'claude-sonnet-4-5-20250929';
  }

  /**
   * Generate text response
   */
  async generateText(task: LLMTask): Promise<LLMResponse<string>> {
    const startTime = Date.now();

    return this.withRetry(async () => {
      const modelName = this.getModelName();
      const model = anthropic(modelName);

      const result = await generateText({
        model,
        prompt: task.prompt,
        system: task.systemPrompt,
        temperature: task.temperature ?? 0.7,
        maxTokens: task.maxTokens ?? 4096,
      });

      const latency = Date.now() - startTime;
      const usage = this.calculateUsage(
        result.usage.promptTokens,
        result.usage.completionTokens
      );

      return {
        result: result.text,
        provider: this.config.provider,
        model: modelName,
        usage,
        latency,
        usedFallback: false,
        timestamp: new Date().toISOString(),
      };
    }, 'Generate text');
  }

  /**
   * Generate structured object
   */
  async generateObject<T>(
    task: LLMTask,
    schema: z.ZodSchema<T>
  ): Promise<LLMResponse<T>> {
    const startTime = Date.now();

    return this.withRetry(async () => {
      const modelName = this.getModelName();
      const model = anthropic(modelName);

      const result = await generateObject({
        model,
        schema,
        prompt: task.prompt,
        system: task.systemPrompt,
        temperature: task.temperature ?? 0.7,
        maxTokens: task.maxTokens ?? 4096,
      });

      const latency = Date.now() - startTime;
      const usage = this.calculateUsage(
        result.usage.promptTokens,
        result.usage.completionTokens
      );

      return {
        result: result.object,
        provider: this.config.provider,
        model: modelName,
        usage,
        latency,
        usedFallback: false,
        timestamp: new Date().toISOString(),
      };
    }, 'Generate object');
  }

  /**
   * Health check - verifies API access
   */
  async healthCheck(): Promise<boolean> {
    try {
      const modelName = this.getModelName();
      const model = anthropic(modelName);

      await generateText({
        model,
        prompt: 'Health check',
        maxTokens: 10,
      });

      return true;
    } catch (error) {
      console.error(`[ClaudeProvider] Health check failed:`, error);
      return false;
    }
  }

  /**
   * Get provider name for logging
   */
  getProviderName(): string {
    return 'ClaudeProvider(claude-sonnet-4-5)';
  }

  /**
   * Calculate token usage and cost (Claude-specific pricing)
   */
  protected calculateUsage(inputTokens: number, outputTokens: number) {
    const cost = LLMRouter.estimateCost(
      this.config.provider,
      inputTokens,
      outputTokens
    );

    return {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      cost,
    };
  }
}
