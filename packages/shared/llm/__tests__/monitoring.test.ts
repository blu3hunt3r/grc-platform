/**
 * @file monitoring.test.ts
 * @description Tests for LLM monitoring and cost tracking
 * @module @grc/shared/llm/__tests__
 */

import { LLMMonitoring } from '../monitoring';
import { Provider, TaskType, LLMResponse } from '../types';

describe('LLMMonitoring', () => {
  let monitoring: LLMMonitoring;

  beforeEach(() => {
    monitoring = new LLMMonitoring();
  });

  describe('recordCall', () => {
    it('should record successful call', () => {
      const response: LLMResponse<string> = {
        result: 'test',
        provider: Provider.GEMINI_FLASH_LITE,
        model: 'gemini-2.0-flash-lite',
        usage: {
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150,
          cost: 0.00002,
        },
        latency: 250,
        usedFallback: false,
        timestamp: new Date().toISOString(),
      };

      monitoring.recordCall(response, TaskType.FAST_AGENTIC, true);

      const metrics = monitoring.getTaskMetrics(
        TaskType.FAST_AGENTIC,
        Provider.GEMINI_FLASH_LITE
      );

      expect(metrics).toBeDefined();
      expect(metrics?.count).toBe(1);
      expect(metrics?.successCount).toBe(1);
      expect(metrics?.errorCount).toBe(0);
      expect(metrics?.totalCost).toBe(0.00002);
    });

    it('should record failed call', () => {
      const response: LLMResponse<string> = {
        result: '',
        provider: Provider.GEMINI_FLASH_LITE,
        model: 'gemini-2.0-flash-lite',
        usage: {
          inputTokens: 100,
          outputTokens: 0,
          totalTokens: 100,
          cost: 0.00001,
        },
        latency: 100,
        usedFallback: false,
        timestamp: new Date().toISOString(),
      };

      monitoring.recordCall(response, TaskType.FAST_AGENTIC, false);

      const metrics = monitoring.getTaskMetrics(
        TaskType.FAST_AGENTIC,
        Provider.GEMINI_FLASH_LITE
      );

      expect(metrics?.errorCount).toBe(1);
      expect(metrics?.successCount).toBe(0);
    });

    it('should aggregate multiple calls correctly', () => {
      for (let i = 0; i < 10; i++) {
        const response: LLMResponse<string> = {
          result: 'test',
          provider: Provider.GEMINI_FLASH,
          model: 'gemini-2.0-flash-8b',
          usage: {
            inputTokens: 1000,
            outputTokens: 500,
            totalTokens: 1500,
            cost: 0.00155,
          },
          latency: 300 + i * 10, // Varying latency
          usedFallback: false,
          timestamp: new Date().toISOString(),
        };

        monitoring.recordCall(response, TaskType.VISION, true);
      }

      const metrics = monitoring.getTaskMetrics(
        TaskType.VISION,
        Provider.GEMINI_FLASH
      );

      expect(metrics?.count).toBe(10);
      expect(metrics?.successCount).toBe(10);
      expect(metrics?.totalCost).toBeCloseTo(0.0155, 4);
      expect(metrics?.avgLatency).toBeGreaterThan(300);
      expect(metrics?.avgLatency).toBeLessThan(400);
    });
  });

  describe('getCostBreakdown', () => {
    it('should calculate cost breakdown correctly', () => {
      const now = new Date();
      const responses: LLMResponse<string>[] = [
        {
          result: 'test1',
          provider: Provider.GEMINI_FLASH_LITE,
          model: 'gemini-2.0-flash-lite',
          usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150, cost: 0.00002 },
          latency: 200,
          usedFallback: false,
          timestamp: new Date(now.getTime() - 1000).toISOString(),
        },
        {
          result: 'test2',
          provider: Provider.CLAUDE_SONNET,
          model: 'claude-sonnet-4-5',
          usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150, cost: 0.00045 },
          latency: 500,
          usedFallback: true,
          timestamp: new Date(now.getTime() - 500).toISOString(),
        },
      ];

      responses.forEach((r) => {
        const taskType = r.provider.includes('gemini')
          ? TaskType.FAST_AGENTIC
          : TaskType.POLICY_GENERATION;
        monitoring.recordCall(r, taskType, true);
      });

      const breakdown = monitoring.getCostBreakdown(
        new Date(now.getTime() - 2000),
        new Date(now.getTime() + 1000)
      );

      expect(breakdown.totalCost).toBeCloseTo(0.00047, 5);
      expect(breakdown.byProvider[Provider.GEMINI_FLASH_LITE]).toBeCloseTo(0.00002, 5);
      expect(breakdown.byProvider[Provider.CLAUDE_SONNET]).toBeCloseTo(0.00045, 5);
    });
  });

  describe('getCostOptimizationSuggestions', () => {
    it('should suggest cheaper alternatives for expensive tasks', () => {
      // Record expensive calls
      for (let i = 0; i < 100; i++) {
        const response: LLMResponse<string> = {
          result: 'test',
          provider: Provider.CLAUDE_SONNET,
          model: 'claude-sonnet-4-5',
          usage: {
            inputTokens: 10000,
            outputTokens: 5000,
            totalTokens: 15000,
            cost: 0.105, // Expensive
          },
          latency: 1000,
          usedFallback: false,
          timestamp: new Date().toISOString(),
        };

        monitoring.recordCall(response, TaskType.CONVERSATIONAL, true);
      }

      const suggestions = monitoring.getCostOptimizationSuggestions();

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toContain('Gemini Flash-Lite');
    });

    it('should suggest different provider for high error rates', () => {
      // Record many failed calls
      for (let i = 0; i < 100; i++) {
        const response: LLMResponse<string> = {
          result: '',
          provider: Provider.GEMINI_FLASH,
          model: 'gemini-2.0-flash-8b',
          usage: { inputTokens: 100, outputTokens: 0, totalTokens: 100, cost: 0.00003 },
          latency: 200,
          usedFallback: false,
          timestamp: new Date().toISOString(),
        };

        monitoring.recordCall(response, TaskType.VISION, false);
      }

      const suggestions = monitoring.getCostOptimizationSuggestions();

      const errorSuggestion = suggestions.find((s) => s.includes('error rate'));
      expect(errorSuggestion).toBeDefined();
    });
  });

  describe('reset', () => {
    it('should clear all metrics', () => {
      const response: LLMResponse<string> = {
        result: 'test',
        provider: Provider.GEMINI_FLASH_LITE,
        model: 'gemini-2.0-flash-lite',
        usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150, cost: 0.00002 },
        latency: 200,
        usedFallback: false,
        timestamp: new Date().toISOString(),
      };

      monitoring.recordCall(response, TaskType.FAST_AGENTIC, true);

      expect(monitoring.getAllTaskMetrics().length).toBeGreaterThan(0);

      monitoring.reset();

      expect(monitoring.getAllTaskMetrics().length).toBe(0);
      expect(monitoring.getAllProviderMetrics().length).toBe(0);
      expect(monitoring.getRecentCalls().length).toBe(0);
    });
  });
});
