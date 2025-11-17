/**
 * @file types.ts
 * @description Type definitions for vendor-agnostic LLM provider system
 * @module @grc/shared/llm
 * @architecture architecture/03_system_architecture.md Section 2.1 "Multi-Agent System"
 *
 * Architecture Reference: architecture/03_system_architecture.md
 * Quote: "The system uses multiple LLM providers with automatic failover to prevent vendor lock-in"
 *
 * Dependencies:
 * - zod: Runtime type validation
 *
 * Related components:
 * - All agents use this for LLM access
 * - Router determines which provider to use
 */

import { z } from 'zod';

// Provider enum
export enum Provider {
  GEMINI_FLASH_LITE = 'gemini-2.5-flash-lite',
  GEMINI_FLASH = 'gemini-2.5-flash',
  GEMINI_PRO = 'gemini-2.5-pro',
  CLAUDE_SONNET = 'claude-sonnet-4-5',
  // Easy to add: GPT_4_TURBO, MISTRAL_LARGE, etc.
}

// Task types for routing
export enum TaskType {
  FAST_AGENTIC = 'fast-agentic',           // Discovery, scanning → Gemini Flash-Lite
  VISION = 'vision',                        // Screenshot analysis → Gemini Flash
  COMPLEX_REASONING = 'complex-reasoning', // Gap analysis → Gemini Pro or Claude
  POLICY_GENERATION = 'policy-generation', // Long-form content → Claude
  CODE_ANALYSIS = 'code-analysis',         // SAST → Gemini Pro
  CONVERSATIONAL = 'conversational',        // Copilot chat → Gemini Flash
}

// LLM task input (vendor-agnostic)
export const LLMTaskSchema = z.object({
  taskType: z.nativeEnum(TaskType),
  prompt: z.string().min(1),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(100000).default(4096),
  schema: z.any().optional(), // Zod schema for structured output
  forceProvider: z.nativeEnum(Provider).optional(),
});

export type LLMTask = z.infer<typeof LLMTaskSchema>;

// Token usage tracking
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number; // USD
}

// LLM response (vendor-agnostic)
export interface LLMResponse<T = string> {
  result: T;
  provider: Provider;
  model: string;
  usage: TokenUsage;
  latency: number; // milliseconds
  usedFallback: boolean;
  timestamp: string;
}

// Provider configuration
export interface ProviderConfig {
  provider: Provider;
  apiKey: string;
  maxRetries: number;
  retryDelayMs: number;
  timeoutMs: number;
}

// Provider health status
export interface ProviderHealth {
  provider: Provider;
  healthy: boolean;
  errorRate: number; // 0-1
  avgLatency: number; // milliseconds
  lastCheck: Date;
}
