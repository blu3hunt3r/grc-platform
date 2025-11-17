/**
 * @file router.ts
 * @description Task routing logic - determines which LLM provider to use
 * @module @grc/shared/llm
 * @architecture LLM_VENDOR_FREE_STRATEGY.md "Task Routing Matrix"
 *
 * Architecture Reference: LLM_VENDOR_FREE_STRATEGY.md
 * Quote: "Route tasks to cheapest capable model with automatic failover"
 *
 * Dependencies:
 * - ./types: Type definitions
 *
 * Related components:
 * - Used by all agents to determine provider
 * - Monitors provider health and adjusts routing
 */

import { TaskType, Provider } from './types';

// Task routing matrix (based on cost & capability)
const TASK_ROUTING: Record<TaskType, { primary: Provider; fallback: Provider }> = {
  [TaskType.FAST_AGENTIC]: {
    primary: Provider.GEMINI_FLASH_LITE,  // $0.10 input, fastest
    fallback: Provider.GEMINI_FLASH,       // $0.30 input
  },
  [TaskType.VISION]: {
    primary: Provider.GEMINI_FLASH,        // Good vision, $0.30
    fallback: Provider.CLAUDE_SONNET,      // Best vision, $3.00
  },
  [TaskType.COMPLEX_REASONING]: {
    primary: Provider.GEMINI_PRO,          // $1.25 input, good reasoning
    fallback: Provider.CLAUDE_SONNET,      // $3.00 input, best reasoning
  },
  [TaskType.POLICY_GENERATION]: {
    primary: Provider.CLAUDE_SONNET,       // Best long-form content
    fallback: Provider.GEMINI_PRO,         // Good alternative
  },
  [TaskType.CODE_ANALYSIS]: {
    primary: Provider.GEMINI_PRO,          // Excellent code understanding
    fallback: Provider.CLAUDE_SONNET,      // Also excellent
  },
  [TaskType.CONVERSATIONAL]: {
    primary: Provider.GEMINI_FLASH,        // Fast, good for chat
    fallback: Provider.GEMINI_FLASH_LITE,  // Even faster, cheaper
  },
};

export class LLMRouter {
  /**
   * Determine which provider to use for a task
   */
  static routeTask(taskType: TaskType, forceProvider?: Provider): {
    primary: Provider;
    fallback: Provider;
  } {
    if (forceProvider) {
      // If provider forced, use it as primary
      // Fallback is the normal primary for this task
      const normal = TASK_ROUTING[taskType];
      return {
        primary: forceProvider,
        fallback: normal.primary,
      };
    }

    return TASK_ROUTING[taskType];
  }

  /**
   * Calculate estimated cost for a task
   */
  static estimateCost(
    provider: Provider,
    inputTokens: number,
    outputTokens: number
  ): number {
    const pricing: Record<Provider, { input: number; output: number }> = {
      [Provider.GEMINI_FLASH_LITE]: { input: 0.10, output: 0.40 },
      [Provider.GEMINI_FLASH]: { input: 0.30, output: 2.50 },
      [Provider.GEMINI_PRO]: { input: 1.25, output: 10.0 },
      [Provider.CLAUDE_SONNET]: { input: 3.0, output: 15.0 },
    };

    const config = pricing[provider];
    const inputCost = (inputTokens / 1_000_000) * config.input;
    const outputCost = (outputTokens / 1_000_000) * config.output;

    return inputCost + outputCost;
  }
}
