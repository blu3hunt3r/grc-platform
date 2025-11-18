/**
 * LLM Provider Abstraction Layer
 *
 * Multi-provider architecture with automatic failover
 * - Primary: Google Gemini 2.0 Flash (fast, cost-effective, agentic)
 * - Fallback: Claude Sonnet 4.5 (complex reasoning, extended thinking)
 *
 * Benefits:
 * - No vendor lock-in
 * - Automatic failover if provider is down
 * - Task-specific optimization (use best model for each job)
 * - Cost optimization
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText, generateObject, streamText } from 'ai';
import { z } from 'zod';

// ============================================================================
// PROVIDER CONFIGURATION
// ============================================================================

export type LLMProvider = 'gemini' | 'claude';

export type TaskType =
  | 'fast-agentic'        // Discovery, scanning, quick analysis
  | 'vision'              // Screenshot analysis, OCR
  | 'complex-reasoning'   // Gap analysis, remediation planning
  | 'policy-generation'   // Document creation
  | 'code-analysis';      // Code scanning, security review

/**
 * Task-to-Provider mapping
 * Routes tasks to the optimal LLM based on strengths
 */
const TASK_PROVIDER_MAP: Record<TaskType, LLMProvider> = {
  'fast-agentic': 'gemini',        // Gemini is 3x faster
  'vision': 'gemini',              // Gemini is 50% cheaper for images
  'complex-reasoning': 'claude',   // Claude has better reasoning depth
  'policy-generation': 'claude',   // Claude excels at long-form content
  'code-analysis': 'gemini',       // Gemini good at code
};

// Initialize providers
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================================================
// MODEL SELECTION
// ============================================================================

export function getModel(taskType: TaskType, forceProvider?: LLMProvider) {
  const provider = forceProvider || TASK_PROVIDER_MAP[taskType];

  switch (provider) {
    case 'gemini':
      return {
        provider: 'gemini' as const,
        model: google('gemini-2.0-flash-exp'), // Latest experimental model
        fallback: google('gemini-1.5-pro'),    // Stable fallback
      };
    case 'claude':
      return {
        provider: 'claude' as const,
        model: anthropic('claude-sonnet-4-20250514'), // Sonnet 4.5
        fallback: anthropic('claude-3-5-sonnet-20241022'),
      };
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// ============================================================================
// LLM OPERATIONS WITH AUTOMATIC FAILOVER
// ============================================================================

export interface GenerateTextOptions {
  taskType: TaskType;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  forceProvider?: LLMProvider;
}

/**
 * Generate text with automatic failover
 */
export async function generateTextWithFallback(options: GenerateTextOptions) {
  const { taskType, prompt, systemPrompt, temperature = 0.7, maxTokens = 4096, forceProvider } = options;
  const { model, fallback, provider } = getModel(taskType, forceProvider);

  try {
    const result = await generateText({
      model,
      prompt,
      system: systemPrompt,
      temperature,
      maxTokens,
    } as any);

    return {
      text: result.text,
      provider,
      model: model.modelId,
      usage: result.usage,
    };
  } catch (error: any) {
    console.warn(`[LLM] Primary model failed (${provider}), trying fallback:`, error.message);

    try {
      const result = await generateText({
        model: fallback,
        prompt,
        system: systemPrompt,
        temperature,
        maxTokens,
      } as any);

      return {
        text: result.text,
        provider,
        model: fallback.modelId,
        usage: result.usage,
        usedFallback: true,
      };
    } catch (fallbackError: any) {
      console.error(`[LLM] Fallback model also failed:`, fallbackError.message);
      throw new Error(`Both primary and fallback models failed: ${error.message}`);
    }
  }
}

/**
 * Generate structured object with automatic failover
 */
export async function generateObjectWithFallback<T>(options: GenerateTextOptions & {
  schema: z.ZodSchema<T>;
}) {
  const { taskType, prompt, systemPrompt, schema, temperature = 0.7, maxTokens = 4096, forceProvider } = options;
  const { model, fallback, provider } = getModel(taskType, forceProvider);

  try {
    const result = await generateObject({
      model,
      prompt,
      system: systemPrompt,
      schema,
      temperature,
      maxTokens,
    } as any);

    return {
      object: result.object,
      provider,
      model: model.modelId,
      usage: result.usage,
    };
  } catch (error: any) {
    console.warn(`[LLM] Primary model failed (${provider}), trying fallback:`, error.message);

    try {
      const result = await generateObject({
        model: fallback,
        prompt,
        system: systemPrompt,
        schema,
        temperature,
        maxTokens,
      });

      return {
        object: result.object,
        provider,
        model: fallback.modelId,
        usage: result.usage,
        usedFallback: true,
      };
    } catch (fallbackError: any) {
      console.error(`[LLM] Fallback model also failed:`, fallbackError.message);
      throw new Error(`Both primary and fallback models failed: ${error.message}`);
    }
  }
}

/**
 * Stream text with automatic fallback (for real-time responses)
 */
export async function streamTextWithFallback(options: GenerateTextOptions) {
  const { taskType, prompt, systemPrompt, temperature = 0.7, maxTokens = 4096, forceProvider } = options;
  const { model, fallback, provider } = getModel(taskType, forceProvider);

  try {
    return await streamText({
      model,
      prompt,
      system: systemPrompt,
      temperature,
      maxTokens,
    } as any);
  } catch (error: any) {
    console.warn(`[LLM] Primary model failed (${provider}), trying fallback:`, error.message);

    return await streamText({
      model: fallback,
      prompt,
      system: systemPrompt,
      temperature,
      maxTokens,
    } as any);
  }
}

// ============================================================================
// COST TRACKING
// ============================================================================

export function estimateCost(provider: LLMProvider, inputTokens: number, outputTokens: number): number {
  // Pricing per 1M tokens (as of 2025)
  const pricing = {
    gemini: {
      input: 0.075,    // $0.075 per 1M input tokens
      output: 0.30,    // $0.30 per 1M output tokens
    },
    claude: {
      input: 3.00,     // $3.00 per 1M input tokens (Sonnet 4)
      output: 15.00,   // $15.00 per 1M output tokens
    },
  };

  const config = pricing[provider];
  const inputCost = (inputTokens / 1_000_000) * config.input;
  const outputCost = (outputTokens / 1_000_000) * config.output;

  return inputCost + outputCost;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  generateText,
  generateObject,
  streamText,
};
