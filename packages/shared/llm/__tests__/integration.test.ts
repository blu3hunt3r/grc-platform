/**
 * @file integration.test.ts
 * @description Integration tests for the complete LLM system
 * @module @grc/shared/llm/__tests__
 *
 * Note: These tests use mocked providers to avoid real API calls
 * For live API testing, use manual test scripts
 */

import { LLM, TaskType, Provider } from '../index';

// Mock the providers
jest.mock('../providers/gemini');
jest.mock('../providers/claude');

import { GeminiProvider } from '../providers/gemini';
import { ClaudeProvider } from '../providers/claude';

describe('LLM Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    LLM.resetInstance();
  });

  describe('Singleton pattern', () => {
    it('should create singleton instance', () => {
      const config = {
        geminiApiKey: 'test-gemini',
        claudeApiKey: 'test-claude',
      };

      const llm1 = LLM.getInstance(config);
      const llm2 = LLM.getInstance();

      expect(llm1).toBe(llm2);
    });

    it('should throw error if getInstance called without config first time', () => {
      expect(() => LLM.getInstance()).toThrow(
        'LLM.getInstance() requires config on first call'
      );
    });

    it('should reset instance', () => {
      const config = {
        geminiApiKey: 'test-gemini',
        claudeApiKey: 'test-claude',
      };

      LLM.getInstance(config);
      LLM.resetInstance();

      expect(() => LLM.getInstance()).toThrow();
    });
  });

  describe('Text generation', () => {
    it('should generate text successfully', async () => {
      const mockResponse = {
        result: 'Generated text',
        provider: Provider.GEMINI_FLASH_LITE,
        model: 'gemini-2.0-flash-lite',
        usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150, cost: 0.00002 },
        latency: 200,
        usedFallback: false,
        timestamp: new Date().toISOString(),
      };

      (GeminiProvider.prototype.generateText as jest.Mock).mockResolvedValue(mockResponse);

      const config = {
        geminiApiKey: 'test-gemini',
        claudeApiKey: 'test-claude',
      };

      const llm = LLM.getInstance(config);
      const result = await llm.executeText({
        taskType: TaskType.FAST_AGENTIC,
        prompt: 'Test prompt',
      });

      expect(result.result).toBe('Generated text');
      expect(result.provider).toBe(Provider.GEMINI_FLASH_LITE);
    });

    it('should record metrics after call', async () => {
      const mockResponse = {
        result: 'Generated text',
        provider: Provider.GEMINI_FLASH,
        model: 'gemini-2.0-flash-8b',
        usage: { inputTokens: 200, outputTokens: 100, totalTokens: 300, cost: 0.00085 },
        latency: 300,
        usedFallback: false,
        timestamp: new Date().toISOString(),
      };

      (GeminiProvider.prototype.generateText as jest.Mock).mockResolvedValue(mockResponse);

      const config = {
        geminiApiKey: 'test-gemini',
        claudeApiKey: 'test-claude',
      };

      const llm = LLM.getInstance(config);
      await llm.executeText({
        taskType: TaskType.CONVERSATIONAL,
        prompt: 'Test prompt',
      });

      const monitoring = llm.getMonitoring();
      const metrics = monitoring.getTaskMetrics(
        TaskType.CONVERSATIONAL,
        Provider.GEMINI_FLASH
      );

      expect(metrics).toBeDefined();
      expect(metrics?.count).toBe(1);
    });
  });

  describe('Structured output generation', () => {
    it('should generate structured object successfully', async () => {
      const mockResponse = {
        result: { score: 0.95, findings: ['Finding 1', 'Finding 2'] },
        provider: Provider.GEMINI_PRO,
        model: 'gemini-2.0-pro',
        usage: { inputTokens: 1000, outputTokens: 300, totalTokens: 1300, cost: 0.00425 },
        latency: 1000,
        usedFallback: false,
        timestamp: new Date().toISOString(),
      };

      (GeminiProvider.prototype.generateObject as jest.Mock).mockResolvedValue(mockResponse);

      const config = {
        geminiApiKey: 'test-gemini',
        claudeApiKey: 'test-claude',
      };

      const llm = LLM.getInstance(config);
      const schema = { parse: (val: any) => val } as any;

      const result = await llm.executeObject(
        {
          taskType: TaskType.CODE_ANALYSIS,
          prompt: 'Analyze this code',
        },
        schema
      );

      expect(result.result).toEqual({
        score: 0.95,
        findings: ['Finding 1', 'Finding 2'],
      });
    });
  });

  describe('Cost estimation', () => {
    it('should estimate cost correctly', () => {
      const config = {
        geminiApiKey: 'test-gemini',
        claudeApiKey: 'test-claude',
      };

      const llm = LLM.getInstance(config);
      const cost = llm.estimateCost(TaskType.FAST_AGENTIC, 1000, 500);

      // Fast agentic routes to Gemini Flash-Lite
      // (1000/1M * 0.10) + (500/1M * 0.40) = 0.0001 + 0.0002 = 0.0003
      expect(cost).toBeCloseTo(0.0003, 6);
    });
  });

  describe('Health monitoring', () => {
    it('should get health status', () => {
      const config = {
        geminiApiKey: 'test-gemini',
        claudeApiKey: 'test-claude',
      };

      const llm = LLM.getInstance(config);
      const health = llm.getHealthStatus();

      expect(health.length).toBe(4);
      health.forEach((h) => {
        expect(h.healthy).toBe(true);
      });
    });
  });

  describe('End-to-end workflows', () => {
    it('should handle complete workflow with multiple task types', async () => {
      const responses = {
        discovery: {
          result: 'Discovery complete',
          provider: Provider.GEMINI_FLASH_LITE,
          model: 'gemini-2.0-flash-lite',
          usage: { inputTokens: 500, outputTokens: 200, totalTokens: 700, cost: 0.00013 },
          latency: 250,
          usedFallback: false,
          timestamp: new Date().toISOString(),
        },
        analysis: {
          result: { gaps: ['Gap 1', 'Gap 2'], score: 0.7 },
          provider: Provider.GEMINI_PRO,
          model: 'gemini-2.0-pro',
          usage: { inputTokens: 2000, outputTokens: 800, totalTokens: 2800, cost: 0.01050 },
          latency: 1500,
          usedFallback: false,
          timestamp: new Date().toISOString(),
        },
        policy: {
          result: 'Policy document generated',
          provider: Provider.CLAUDE_SONNET,
          model: 'claude-sonnet-4-5',
          usage: { inputTokens: 3000, outputTokens: 2000, totalTokens: 5000, cost: 0.03900 },
          latency: 2000,
          usedFallback: false,
          timestamp: new Date().toISOString(),
        },
      };

      (GeminiProvider.prototype.generateText as jest.Mock)
        .mockResolvedValueOnce(responses.discovery);

      (GeminiProvider.prototype.generateObject as jest.Mock)
        .mockResolvedValueOnce(responses.analysis);

      (ClaudeProvider.prototype.generateText as jest.Mock)
        .mockResolvedValueOnce(responses.policy);

      const config = {
        geminiApiKey: 'test-gemini',
        claudeApiKey: 'test-claude',
      };

      const llm = LLM.getInstance(config);

      // Discovery (fast, Gemini Flash-Lite)
      const discovery = await llm.executeText({
        taskType: TaskType.FAST_AGENTIC,
        prompt: 'Discover resources',
      });
      expect(discovery.provider).toBe(Provider.GEMINI_FLASH_LITE);

      // Gap analysis (complex reasoning, Gemini Pro)
      const analysis = await llm.executeObject(
        {
          taskType: TaskType.COMPLEX_REASONING,
          prompt: 'Analyze gaps',
        },
        { parse: (val: any) => val } as any
      );
      expect(analysis.provider).toBe(Provider.GEMINI_PRO);

      // Policy generation (long-form, Claude)
      const policy = await llm.executeText({
        taskType: TaskType.POLICY_GENERATION,
        prompt: 'Generate policy',
      });
      expect(policy.provider).toBe(Provider.CLAUDE_SONNET);

      // Verify monitoring tracked all calls
      const monitoring = llm.getMonitoring();
      const allMetrics = monitoring.getAllTaskMetrics();
      expect(allMetrics.length).toBeGreaterThanOrEqual(3);
    });
  });
});
