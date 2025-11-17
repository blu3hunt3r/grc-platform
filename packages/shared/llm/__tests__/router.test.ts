/**
 * @file router.test.ts
 * @description Tests for LLM task routing logic
 * @module @grc/shared/llm/__tests__
 */

import { LLMRouter } from '../router';
import { TaskType, Provider } from '../types';

describe('LLMRouter', () => {
  describe('routeTask', () => {
    it('should route FAST_AGENTIC to Gemini Flash-Lite', () => {
      const result = LLMRouter.routeTask(TaskType.FAST_AGENTIC);

      expect(result.primary).toBe(Provider.GEMINI_FLASH_LITE);
      expect(result.fallback).toBe(Provider.GEMINI_FLASH);
    });

    it('should route VISION to Gemini Flash', () => {
      const result = LLMRouter.routeTask(TaskType.VISION);

      expect(result.primary).toBe(Provider.GEMINI_FLASH);
      expect(result.fallback).toBe(Provider.CLAUDE_SONNET);
    });

    it('should route COMPLEX_REASONING to Gemini Pro', () => {
      const result = LLMRouter.routeTask(TaskType.COMPLEX_REASONING);

      expect(result.primary).toBe(Provider.GEMINI_PRO);
      expect(result.fallback).toBe(Provider.CLAUDE_SONNET);
    });

    it('should route POLICY_GENERATION to Claude Sonnet', () => {
      const result = LLMRouter.routeTask(TaskType.POLICY_GENERATION);

      expect(result.primary).toBe(Provider.CLAUDE_SONNET);
      expect(result.fallback).toBe(Provider.GEMINI_PRO);
    });

    it('should route CODE_ANALYSIS to Gemini Pro', () => {
      const result = LLMRouter.routeTask(TaskType.CODE_ANALYSIS);

      expect(result.primary).toBe(Provider.GEMINI_PRO);
      expect(result.fallback).toBe(Provider.CLAUDE_SONNET);
    });

    it('should route CONVERSATIONAL to Gemini Flash', () => {
      const result = LLMRouter.routeTask(TaskType.CONVERSATIONAL);

      expect(result.primary).toBe(Provider.GEMINI_FLASH);
      expect(result.fallback).toBe(Provider.GEMINI_FLASH_LITE);
    });

    it('should honor forceProvider override', () => {
      const result = LLMRouter.routeTask(
        TaskType.FAST_AGENTIC,
        Provider.CLAUDE_SONNET
      );

      expect(result.primary).toBe(Provider.CLAUDE_SONNET);
      expect(result.fallback).toBe(Provider.GEMINI_FLASH_LITE);
    });

    it('should route all task types without error', () => {
      const taskTypes = Object.values(TaskType);

      taskTypes.forEach((taskType) => {
        const result = LLMRouter.routeTask(taskType);
        expect(result.primary).toBeDefined();
        expect(result.fallback).toBeDefined();
      });
    });
  });

  describe('estimateCost', () => {
    it('should calculate cost for Gemini Flash-Lite correctly', () => {
      const cost = LLMRouter.estimateCost(
        Provider.GEMINI_FLASH_LITE,
        1_000_000, // 1M input tokens
        1_000_000  // 1M output tokens
      );

      // $0.10 input + $0.40 output = $0.50
      expect(cost).toBeCloseTo(0.50, 2);
    });

    it('should calculate cost for Gemini Flash correctly', () => {
      const cost = LLMRouter.estimateCost(
        Provider.GEMINI_FLASH,
        1_000_000,
        1_000_000
      );

      // $0.30 input + $2.50 output = $2.80
      expect(cost).toBeCloseTo(2.80, 2);
    });

    it('should calculate cost for Gemini Pro correctly', () => {
      const cost = LLMRouter.estimateCost(
        Provider.GEMINI_PRO,
        1_000_000,
        1_000_000
      );

      // $1.25 input + $10.0 output = $11.25
      expect(cost).toBeCloseTo(11.25, 2);
    });

    it('should calculate cost for Claude Sonnet correctly', () => {
      const cost = LLMRouter.estimateCost(
        Provider.CLAUDE_SONNET,
        1_000_000,
        1_000_000
      );

      // $3.0 input + $15.0 output = $18.0
      expect(cost).toBeCloseTo(18.0, 2);
    });

    it('should handle small token counts', () => {
      const cost = LLMRouter.estimateCost(
        Provider.GEMINI_FLASH_LITE,
        1000,  // 1K tokens
        500    // 500 tokens
      );

      // (1000/1M * 0.10) + (500/1M * 0.40) = 0.0001 + 0.0002 = 0.0003
      expect(cost).toBeCloseTo(0.0003, 6);
    });

    it('should handle zero tokens', () => {
      const cost = LLMRouter.estimateCost(
        Provider.GEMINI_FLASH_LITE,
        0,
        0
      );

      expect(cost).toBe(0);
    });

    it('should verify Gemini is cheaper than Claude for most tasks', () => {
      const geminiCost = LLMRouter.estimateCost(
        Provider.GEMINI_FLASH_LITE,
        1_000_000,
        1_000_000
      );

      const claudeCost = LLMRouter.estimateCost(
        Provider.CLAUDE_SONNET,
        1_000_000,
        1_000_000
      );

      expect(geminiCost).toBeLessThan(claudeCost);

      // Should be ~97% cheaper (0.50 vs 18.0)
      const savings = ((claudeCost - geminiCost) / claudeCost) * 100;
      expect(savings).toBeGreaterThan(95);
    });
  });
});
