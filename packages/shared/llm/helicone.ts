/**
 * @file helicone.ts
 * @description Helicone integration for LLM observability, caching, and cost optimization
 * @module @grc/shared/llm
 * @architecture GRC_Platform_Architecture_COMPLETE_ENHANCED.md "LLM Gateway Layer"
 *
 * Architecture Reference: GRC_Platform_Architecture_COMPLETE_ENHANCED.md Lines 288-293
 * Quote: "LLM GATEWAY LAYER
 *         - Helicone (caching + monitoring)
 *         - LiteLLM (multi-provider normalization)
 *         - Intelligent routing and fallback"
 *
 * Purpose:
 * - Response caching (30-50% cost savings)
 * - Request/response logging for debugging
 * - Prompt management and versioning
 * - Cost tracking per agent/user
 * - Request deduplication
 *
 * Dependencies:
 * - @helicone/helicone: Helicone SDK
 *
 * Related components:
 * - Used by all LLM providers (Gemini, Claude)
 * - Transparent to agents (wrapped in provider layer)
 */

import { HeliconeManualLogger } from '@helicone/helicone';
import type { Provider, TaskType } from './types';

export interface HeliconeConfig {
  apiKey: string;
  cacheEnabled?: boolean;
  cacheTTL?: number; // seconds
  retryEnabled?: boolean;
  maxRetries?: number;
}

export interface HeliconeMetadata {
  taskType: TaskType;
  provider: Provider;
  agentName?: string;
  userId?: string;
  sessionId?: string;
  tags?: string[];
}

export class HeliconeClient {
  private logger: HeliconeManualLogger;
  private config: HeliconeConfig;

  constructor(config: HeliconeConfig) {
    this.config = {
      cacheEnabled: true,
      cacheTTL: 86400, // 24 hours default
      retryEnabled: true,
      maxRetries: 3,
      ...config,
    };

    this.logger = new HeliconeManualLogger({
      apiKey: this.config.apiKey,
      headers: {
        'Helicone-Cache-Enabled': this.config.cacheEnabled ? 'true' : 'false',
        ...(this.config.cacheTTL && {
          'Helicone-Cache-TTL': this.config.cacheTTL.toString(),
        }),
      },
    });
  }

  /**
   * Log a request to Helicone
   * Returns request ID for tracking
   */
  async logRequest(
    provider: string,
    model: string,
    prompt: string,
    metadata: HeliconeMetadata
  ): Promise<string> {
    try {
      const requestId = await this.logger.logRequest({
        model,
        provider,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        properties: {
          taskType: metadata.taskType,
          agentName: metadata.agentName || 'unknown',
          userId: metadata.userId,
          sessionId: metadata.sessionId,
          tags: metadata.tags || [],
        },
      });

      return requestId;
    } catch (error) {
      // Helicone failure shouldn't block LLM calls
      console.error('[Helicone] Failed to log request:', error);
      return 'helicone-error';
    }
  }

  /**
   * Log a response to Helicone
   */
  async logResponse(
    requestId: string,
    response: string,
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    },
    latency: number
  ): Promise<void> {
    try {
      await this.logger.logResponse({
        requestId,
        response: {
          choices: [
            {
              message: {
                role: 'assistant',
                content: response,
              },
            },
          ],
          usage: {
            prompt_tokens: usage.promptTokens,
            completion_tokens: usage.completionTokens,
            total_tokens: usage.totalTokens,
          },
        },
        timing: {
          latency,
        },
      });
    } catch (error) {
      // Helicone failure shouldn't block LLM calls
      console.error('[Helicone] Failed to log response:', error);
    }
  }

  /**
   * Log an error to Helicone
   */
  async logError(requestId: string, error: Error): Promise<void> {
    try {
      await this.logger.logError({
        requestId,
        error: {
          message: error.message,
          stack: error.stack,
        },
      });
    } catch (err) {
      console.error('[Helicone] Failed to log error:', err);
    }
  }

  /**
   * Get cache headers for request
   * Used by providers to enable caching
   */
  getCacheHeaders(cacheTTL?: number): Record<string, string> {
    if (!this.config.cacheEnabled) {
      return {};
    }

    return {
      'Helicone-Cache-Enabled': 'true',
      'Helicone-Cache-TTL': (cacheTTL || this.config.cacheTTL!).toString(),
    };
  }

  /**
   * Get custom properties for agent tracking
   */
  getPropertiesHeaders(metadata: HeliconeMetadata): Record<string, string> {
    const headers: Record<string, string> = {
      'Helicone-Property-TaskType': metadata.taskType,
      'Helicone-Property-Provider': metadata.provider,
    };

    if (metadata.agentName) {
      headers['Helicone-Property-AgentName'] = metadata.agentName;
    }

    if (metadata.userId) {
      headers['Helicone-Property-UserId'] = metadata.userId;
    }

    if (metadata.sessionId) {
      headers['Helicone-Property-SessionId'] = metadata.sessionId;
    }

    if (metadata.tags && metadata.tags.length > 0) {
      headers['Helicone-Property-Tags'] = metadata.tags.join(',');
    }

    return headers;
  }

  /**
   * Calculate cache key for request
   * Used to deduplicate similar requests
   */
  getCacheKey(prompt: string, metadata: HeliconeMetadata): string {
    // Create deterministic cache key
    const key = `${metadata.taskType}:${metadata.provider}:${this.hashString(prompt)}`;
    return key;
  }

  /**
   * Simple string hash for cache keys
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get retry configuration headers
   */
  getRetryHeaders(): Record<string, string> {
    if (!this.config.retryEnabled) {
      return {};
    }

    return {
      'Helicone-Retry-Enabled': 'true',
      'Helicone-Retry-Num': this.config.maxRetries!.toString(),
    };
  }

  /**
   * Get all Helicone headers for a request
   */
  getAllHeaders(metadata: HeliconeMetadata, cacheTTL?: number): Record<string, string> {
    return {
      ...this.getCacheHeaders(cacheTTL),
      ...this.getPropertiesHeaders(metadata),
      ...this.getRetryHeaders(),
    };
  }
}

/**
 * Singleton instance of Helicone client
 */
let heliconeInstance: HeliconeClient | null = null;

export function getHeliconeClient(config?: HeliconeConfig): HeliconeClient {
  if (!heliconeInstance) {
    if (!config) {
      throw new Error('Helicone config required for first initialization');
    }
    heliconeInstance = new HeliconeClient(config);
  }
  return heliconeInstance;
}

export function resetHeliconeClient(): void {
  heliconeInstance = null;
}
