/**
 * @file failover.test.ts
 * @description Tests for LLM failover and retry logic
 * @module @grc/shared/llm/__tests__
 */

import { LLMFailover } from '../failover';
import { Provider, TaskType, ProviderConfig } from '../types';

// Mock the providers to avoid real API calls
jest.mock('../providers/gemini');
jest.mock('../providers/claude');

import { GeminiProvider } from '../providers/gemini';
import { ClaudeProvider } from '../providers/claude';

describe('LLMFailover', () => {
  let configs: ProviderConfig[];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    configs = [
      {
        provider: Provider.GEMINI_FLASH_LITE,
        apiKey: 'test-gemini-key',
        maxRetries: 2,
        retryDelayMs: 100,
        timeoutMs: 5000,
      },
      {
        provider: Provider.GEMINI_FLASH,
        apiKey: 'test-gemini-key',
        maxRetries: 2,
        retryDelayMs: 100,
        timeoutMs: 5000,
      },
      {
        provider: Provider.GEMINI_PRO,
        apiKey: 'test-gemini-key',
        maxRetries: 2,
        retryDelayMs: 100,
        timeoutMs: 5000,
      },
      {
        provider: Provider.CLAUDE_SONNET,
        apiKey: 'test-claude-key',
        maxRetries: 2,
        retryDelayMs: 100,
        timeoutMs: 5000,
      },
    ];
  });

  describe('initialization', () => {
    it('should initialize all providers', () => {
      const failover = new LLMFailover(configs);
      const health = failover.getHealthStatus();

      expect(health.length).toBe(4);
      health.forEach((h) => {
        expect(h.healthy).toBe(true);
        expect(h.errorRate).toBe(0);
      });
    });

    it('should throw error for unknown provider', () => {
      const badConfig = [
        {
          provider: 'unknown-provider' as Provider,
          apiKey: 'test',
          maxRetries: 2,
          retryDelayMs: 100,
          timeoutMs: 5000,
        },
      ];

      expect(() => new LLMFailover(badConfig)).toThrow('Unknown provider');
    });
  });

  describe('executeText with failover', () => {
    it('should use primary provider when successful', async () => {
      const mockResponse = {
        result: 'Success',
        provider: Provider.GEMINI_FLASH_LITE,
        model: 'gemini-2.0-flash-lite',
        usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150, cost: 0.00002 },
        latency: 200,
        usedFallback: false,
        timestamp: new Date().toISOString(),
      };

      (GeminiProvider.prototype.generateText as jest.Mock).mockResolvedValue(mockResponse);

      const failover = new LLMFailover(configs);
      const result = await failover.executeText({
        taskType: TaskType.FAST_AGENTIC,
        prompt: 'Test prompt',
      });

      expect(result.provider).toBe(Provider.GEMINI_FLASH_LITE);
      expect(result.usedFallback).toBe(false);
      expect(GeminiProvider.prototype.generateText).toHaveBeenCalledTimes(1);
    });

    it('should failover to secondary provider when primary fails', async () => {
      const primaryError = new Error('Rate limit exceeded');
      const fallbackResponse = {
        result: 'Success from fallback',
        provider: Provider.GEMINI_FLASH,
        model: 'gemini-2.0-flash-8b',
        usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150, cost: 0.00045 },
        latency: 300,
        usedFallback: false,
        timestamp: new Date().toISOString(),
      };

      (GeminiProvider.prototype.generateText as jest.Mock)
        .mockRejectedValueOnce(primaryError)
        .mockResolvedValueOnce(fallbackResponse);

      const failover = new LLMFailover(configs);
      const result = await failover.executeText({
        taskType: TaskType.FAST_AGENTIC,
        prompt: 'Test prompt',
      });

      expect(result.provider).toBe(Provider.GEMINI_FLASH);
      expect(result.usedFallback).toBe(true);
      expect(GeminiProvider.prototype.generateText).toHaveBeenCalledTimes(2);
    });

    it('should throw error when all providers fail', async () => {
      const error = new Error('API error');

      (GeminiProvider.prototype.generateText as jest.Mock).mockRejectedValue(error);

      const failover = new LLMFailover(configs);

      await expect(
        failover.executeText({
          taskType: TaskType.FAST_AGENTIC,
          prompt: 'Test prompt',
        })
      ).rejects.toThrow('All providers failed');
    });

    it('should update health metrics after success', async () => {
      const mockResponse = {
        result: 'Success',
        provider: Provider.GEMINI_FLASH_LITE,
        model: 'gemini-2.0-flash-lite',
        usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150, cost: 0.00002 },
        latency: 200,
        usedFallback: false,
        timestamp: new Date().toISOString(),
      };

      (GeminiProvider.prototype.generateText as jest.Mock).mockResolvedValue(mockResponse);

      const failover = new LLMFailover(configs);
      await failover.executeText({
        taskType: TaskType.FAST_AGENTIC,
        prompt: 'Test prompt',
      });

      const health = failover.getProviderHealth(Provider.GEMINI_FLASH_LITE);
      expect(health?.healthy).toBe(true);
      expect(health?.avgLatency).toBeGreaterThan(0);
    });

    it('should update health metrics after error', async () => {
      (GeminiProvider.prototype.generateText as jest.Mock)
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'));

      const failover = new LLMFailover(configs);

      try {
        await failover.executeText({
          taskType: TaskType.FAST_AGENTIC,
          prompt: 'Test prompt',
        });
      } catch (error) {
        // Expected to fail
      }

      const health = failover.getProviderHealth(Provider.GEMINI_FLASH_LITE);
      expect(health?.errorRate).toBeGreaterThan(0);
    });
  });

  describe('executeObject with failover', () => {
    it('should execute structured output with failover', async () => {
      const mockResponse = {
        result: { analysis: 'test' },
        provider: Provider.GEMINI_PRO,
        model: 'gemini-2.0-pro',
        usage: { inputTokens: 500, outputTokens: 200, totalTokens: 700, cost: 0.00825 },
        latency: 800,
        usedFallback: false,
        timestamp: new Date().toISOString(),
      };

      (GeminiProvider.prototype.generateObject as jest.Mock).mockResolvedValue(mockResponse);

      const failover = new LLMFailover(configs);
      const schema = { parse: (val: any) => val } as any;

      const result = await failover.executeObject(
        {
          taskType: TaskType.COMPLEX_REASONING,
          prompt: 'Analyze this',
        },
        schema
      );

      expect(result.result).toEqual({ analysis: 'test' });
      expect(result.provider).toBe(Provider.GEMINI_PRO);
    });

    it('should failover for structured output', async () => {
      const primaryError = new Error('Schema validation failed');
      const fallbackResponse = {
        result: { analysis: 'fallback result' },
        provider: Provider.CLAUDE_SONNET,
        model: 'claude-sonnet-4-5',
        usage: { inputTokens: 500, outputTokens: 200, totalTokens: 700, cost: 0.0450 },
        latency: 1200,
        usedFallback: false,
        timestamp: new Date().toISOString(),
      };

      (GeminiProvider.prototype.generateObject as jest.Mock).mockRejectedValue(primaryError);
      (ClaudeProvider.prototype.generateObject as jest.Mock).mockResolvedValue(fallbackResponse);

      const failover = new LLMFailover(configs);
      const schema = { parse: (val: any) => val } as any;

      const result = await failover.executeObject(
        {
          taskType: TaskType.COMPLEX_REASONING,
          prompt: 'Analyze this',
        },
        schema
      );

      expect(result.provider).toBe(Provider.CLAUDE_SONNET);
      expect(result.usedFallback).toBe(true);
    });
  });

  describe('health checks', () => {
    it('should return health status for all providers', () => {
      const failover = new LLMFailover(configs);
      const health = failover.getHealthStatus();

      expect(health.length).toBe(4);
      expect(health[0].provider).toBe(Provider.GEMINI_FLASH_LITE);
      expect(health[0].healthy).toBe(true);
    });

    it('should return health status for specific provider', () => {
      const failover = new LLMFailover(configs);
      const health = failover.getProviderHealth(Provider.GEMINI_FLASH);

      expect(health).toBeDefined();
      expect(health?.provider).toBe(Provider.GEMINI_FLASH);
      expect(health?.healthy).toBe(true);
    });
  });
});
