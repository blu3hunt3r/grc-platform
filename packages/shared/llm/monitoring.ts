/**
 * @file monitoring.ts
 * @description Cost and performance tracking for LLM usage
 * @module @grc/shared/llm
 * @architecture LLM_VENDOR_FREE_STRATEGY.md "Monitoring & Optimization"
 *
 * Architecture Reference: LLM_VENDOR_FREE_STRATEGY.md
 * Quote: "Real-Time Metrics - Cost per task, Latency per provider, Error rate per provider, Quality score"
 *
 * Dependencies:
 * - ./types: Type definitions
 *
 * Related components:
 * - Tracks all LLM calls across all providers
 * - Provides cost optimization insights
 */

import type { LLMResponse, Provider, TaskType } from './types';

export interface TaskMetrics {
  taskType: TaskType;
  provider: Provider;
  count: number;
  totalCost: number;
  avgLatency: number;
  errorCount: number;
  successCount: number;
}

export interface ProviderMetrics {
  provider: Provider;
  totalCalls: number;
  totalCost: number;
  avgLatency: number;
  errorRate: number;
  uptime: number; // percentage
}

export interface CostBreakdown {
  totalCost: number;
  byProvider: Record<Provider, number>;
  byTaskType: Record<TaskType, number>;
  periodStart: Date;
  periodEnd: Date;
}

export class LLMMonitoring {
  private taskMetrics: Map<string, TaskMetrics> = new Map();
  private providerMetrics: Map<Provider, ProviderMetrics> = new Map();
  private recentCalls: LLMResponse<any>[] = [];
  private readonly MAX_RECENT_CALLS = 1000;

  /**
   * Record an LLM call for monitoring
   */
  recordCall<T>(response: LLMResponse<T>, taskType: TaskType, success: boolean): void {
    // Add to recent calls
    this.recentCalls.push(response);
    if (this.recentCalls.length > this.MAX_RECENT_CALLS) {
      this.recentCalls.shift();
    }

    // Update task metrics
    const taskKey = `${taskType}-${response.provider}`;
    let taskMetric = this.taskMetrics.get(taskKey);

    if (!taskMetric) {
      taskMetric = {
        taskType,
        provider: response.provider,
        count: 0,
        totalCost: 0,
        avgLatency: 0,
        errorCount: 0,
        successCount: 0,
      };
      this.taskMetrics.set(taskKey, taskMetric);
    }

    taskMetric.count++;
    taskMetric.totalCost += response.usage.cost;
    taskMetric.avgLatency =
      (taskMetric.avgLatency * (taskMetric.count - 1) + response.latency) /
      taskMetric.count;

    if (success) {
      taskMetric.successCount++;
    } else {
      taskMetric.errorCount++;
    }

    // Update provider metrics
    let providerMetric = this.providerMetrics.get(response.provider);

    if (!providerMetric) {
      providerMetric = {
        provider: response.provider,
        totalCalls: 0,
        totalCost: 0,
        avgLatency: 0,
        errorRate: 0,
        uptime: 100,
      };
      this.providerMetrics.set(response.provider, providerMetric);
    }

    providerMetric.totalCalls++;
    providerMetric.totalCost += response.usage.cost;
    providerMetric.avgLatency =
      (providerMetric.avgLatency * (providerMetric.totalCalls - 1) + response.latency) /
      providerMetric.totalCalls;

    const totalTaskCalls = taskMetric.successCount + taskMetric.errorCount;
    providerMetric.errorRate = taskMetric.errorCount / totalTaskCalls;
    providerMetric.uptime = (taskMetric.successCount / totalTaskCalls) * 100;
  }

  /**
   * Get metrics for a specific task type + provider combination
   */
  getTaskMetrics(taskType: TaskType, provider: Provider): TaskMetrics | undefined {
    const taskKey = `${taskType}-${provider}`;
    return this.taskMetrics.get(taskKey);
  }

  /**
   * Get all task metrics
   */
  getAllTaskMetrics(): TaskMetrics[] {
    return Array.from(this.taskMetrics.values());
  }

  /**
   * Get metrics for a specific provider
   */
  getProviderMetrics(provider: Provider): ProviderMetrics | undefined {
    return this.providerMetrics.get(provider);
  }

  /**
   * Get all provider metrics
   */
  getAllProviderMetrics(): ProviderMetrics[] {
    return Array.from(this.providerMetrics.values());
  }

  /**
   * Get cost breakdown for a time period
   */
  getCostBreakdown(startDate: Date, endDate: Date): CostBreakdown {
    const relevantCalls = this.recentCalls.filter((call) => {
      const callDate = new Date(call.timestamp);
      return callDate >= startDate && callDate <= endDate;
    });

    const byProvider: Record<Provider, number> = {} as Record<Provider, number>;
    const byTaskType: Record<TaskType, number> = {} as Record<TaskType, number>;
    let totalCost = 0;

    relevantCalls.forEach((call) => {
      totalCost += call.usage.cost;

      // By provider
      if (!byProvider[call.provider]) {
        byProvider[call.provider] = 0;
      }
      byProvider[call.provider] += call.usage.cost;
    });

    // By task type (from task metrics)
    this.taskMetrics.forEach((metric) => {
      if (!byTaskType[metric.taskType]) {
        byTaskType[metric.taskType] = 0;
      }
      byTaskType[metric.taskType] += metric.totalCost;
    });

    return {
      totalCost,
      byProvider,
      byTaskType,
      periodStart: startDate,
      periodEnd: endDate,
    };
  }

  /**
   * Get recent calls (for debugging)
   */
  getRecentCalls(limit: number = 100): LLMResponse<any>[] {
    return this.recentCalls.slice(-limit);
  }

  /**
   * Get cost optimization suggestions
   */
  getCostOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const metrics = this.getAllTaskMetrics();

    // Find expensive task types that could use cheaper models
    metrics.forEach((metric) => {
      const avgCost = metric.totalCost / metric.count;

      // If average cost > $0.01 per call, suggest optimization
      if (avgCost > 0.01 && metric.provider !== 'gemini-2.5-flash-lite') {
        suggestions.push(
          `Task type "${metric.taskType}" using ${metric.provider} costs $${avgCost.toFixed(4)} per call. ` +
          `Consider testing with Gemini Flash-Lite ($0.10/1M tokens).`
        );
      }

      // If error rate > 10%, suggest different provider
      const errorRate = metric.errorCount / metric.count;
      if (errorRate > 0.1) {
        suggestions.push(
          `Task type "${metric.taskType}" on ${metric.provider} has ${(errorRate * 100).toFixed(1)}% error rate. ` +
          `Consider switching to a different provider.`
        );
      }
    });

    return suggestions;
  }

  /**
   * Reset all metrics (useful for testing)
   */
  reset(): void {
    this.taskMetrics.clear();
    this.providerMetrics.clear();
    this.recentCalls = [];
  }
}
