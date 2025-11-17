/**
 * @file gemini.ts
 * @description Google Gemini 2.5 provider implementation (Flash-Lite, Flash, Pro)
 * @module @grc/shared/llm/providers
 * @architecture LLM_VENDOR_FREE_STRATEGY.md "Primary: Google Gemini 2.5"
 *
 * Architecture Reference: LLM_VENDOR_FREE_STRATEGY.md
 * Quote: "Primary: Google Gemini 2.5 (Three Tiers) - 75-95% cheaper than Claude for most tasks"
 *
 * Dependencies:
 * - @ai-sdk/google: Vercel AI SDK Google provider
 * - ai: Vercel AI SDK core
 * - zod: Schema validation
 *
 * Related components:
 * - Used as primary provider for most tasks
 * - Fallback to Claude for critical decisions
 */

import { google } from '@ai-sdk/google';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';
import { BaseProvider } from './base-provider';
import type { LLMTask, LLMResponse, ProviderConfig, Provider } from '../types';
import { LLMRouter } from '../router';

export class GeminiProvider extends BaseProvider {
  /**
   * Map our provider enum to actual Gemini model names
   */
  private getModelName(provider: Provider): string {
    const modelMap: Record<string, string> = {
      'gemini-2.5-flash-lite': 'gemini-2.0-flash-lite',
      'gemini-2.5-flash': 'gemini-2.0-flash-8b',
      'gemini-2.5-pro': 'gemini-2.0-pro',
    };
    return modelMap[provider] || 'gemini-2.0-flash-8b';
  }

  /**
   * Generate text response
   */
  async generateText(task: LLMTask): Promise<LLMResponse<string>> {
    const startTime = Date.now();

    return this.withRetry(async () => {
      const modelName = this.getModelName(this.config.provider);
      const model = google(modelName);

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
      const modelName = this.getModelName(this.config.provider);
      const model = google(modelName);

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
      const modelName = this.getModelName(this.config.provider);
      const model = google(modelName);

      await generateText({
        model,
        prompt: 'Health check',
        maxTokens: 10,
      });

      return true;
    } catch (error) {
      console.error(`[GeminiProvider] Health check failed:`, error);
      return false;
    }
  }

  /**
   * Get provider name for logging
   */
  getProviderName(): string {
    return `GeminiProvider(${this.config.provider})`;
  }

  /**
   * Calculate token usage and cost (Gemini-specific pricing)
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
