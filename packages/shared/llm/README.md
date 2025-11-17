# LLM Provider Abstraction (@grc/shared/llm)

**Status:** ✅ Production-Ready (Phase 1 Complete)
**Architecture:** LLM_VENDOR_FREE_STRATEGY.md
**Test Coverage:** 80%+ (4 comprehensive test suites)

---

## Overview

Vendor-agnostic LLM provider system with automatic failover, task-based routing, and cost optimization. Designed for **zero vendor lock-in** with ability to add new providers in <1 hour.

### Key Features

✅ **Multi-Provider:** Gemini 2.5 (3 tiers) + Claude Sonnet 4.5
✅ **Automatic Failover:** Primary → Fallback → Error (with retry)
✅ **Task-Based Routing:** Route to cheapest capable model
✅ **Cost Tracking:** Real-time monitoring per provider/task
✅ **Health Monitoring:** Automatic provider health checks
✅ **Structured Output:** Type-safe with Zod schemas
✅ **Singleton Pattern:** Global instance for consistency

---

## Quick Start

### 1. Initialize (Once)

```typescript
import { LLM } from '@grc/shared/llm';

// Initialize on app startup
const llm = LLM.getInstance({
  geminiApiKey: process.env.GOOGLE_API_KEY!,
  claudeApiKey: process.env.ANTHROPIC_API_KEY!,
  maxRetries: 3,        // Optional, default: 3
  retryDelayMs: 1000,   // Optional, default: 1000
  timeoutMs: 30000,     // Optional, default: 30000
});
```

### 2. Generate Text

```typescript
import { LLM, TaskType } from '@grc/shared/llm';

const llm = LLM.getInstance();

const response = await llm.executeText({
  taskType: TaskType.FAST_AGENTIC,
  prompt: 'Analyze this system for SOC 2 compliance gaps...',
  systemPrompt: 'You are a GRC compliance expert.',
  temperature: 0.7,
  maxTokens: 4096,
});

console.log(response.result);           // Generated text
console.log(response.provider);         // Which provider was used
console.log(response.usage.cost);       // Cost in USD
console.log(response.latency);          // Latency in ms
console.log(response.usedFallback);     // Did it fail over?
```

### 3. Generate Structured Output

```typescript
import { z } from 'zod';

const GapAnalysisSchema = z.object({
  score: z.number().min(0).max(1),
  gaps: z.array(z.object({
    control: z.string(),
    severity: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    description: z.string(),
  })),
  recommendations: z.array(z.string()),
});

const response = await llm.executeObject(
  {
    taskType: TaskType.COMPLEX_REASONING,
    prompt: 'Analyze this audit report for gaps...',
  },
  GapAnalysisSchema
);

// response.result is type-safe!
console.log(response.result.score);     // number
console.log(response.result.gaps);      // array of gap objects
```

---

## Task Routing

The system automatically routes tasks to the cheapest capable model:

| Task Type | Primary Provider | Cost (per 1M tokens) | Fallback |
|-----------|-----------------|---------------------|----------|
| **FAST_AGENTIC** | Gemini Flash-Lite | $0.10 input / $0.40 output | Gemini Flash |
| **VISION** | Gemini Flash | $0.30 / $2.50 | Claude Sonnet |
| **COMPLEX_REASONING** | Gemini Pro | $1.25 / $10.0 | Claude Sonnet |
| **POLICY_GENERATION** | Claude Sonnet | $3.0 / $15.0 | Gemini Pro |
| **CODE_ANALYSIS** | Gemini Pro | $1.25 / $10.0 | Claude Sonnet |
| **CONVERSATIONAL** | Gemini Flash | $0.30 / $2.50 | Gemini Flash-Lite |

### Override Routing

```typescript
// Force a specific provider (e.g., for testing)
const response = await llm.executeText({
  taskType: TaskType.FAST_AGENTIC,
  prompt: 'Test prompt',
  forceProvider: Provider.CLAUDE_SONNET, // Override
});
```

---

## Automatic Failover

### Level 1: Model-Level Failover

```
Task: Discovery Analysis
├─ Try: Gemini 2.5 Flash-Lite (primary)
│  └─ Fail (rate limit)
├─ Try: Gemini 2.5 Flash (fallback)
│  └─ Success ✓
```

### Level 2: Provider-Level Failover

```
Provider: Google Gemini
├─ Health Check: FAILED (>5% error rate)
├─ Switch All Traffic → Anthropic Claude
└─ Retry Gemini every 5 minutes
```

### Handling Failures

```typescript
try {
  const response = await llm.executeText({
    taskType: TaskType.FAST_AGENTIC,
    prompt: 'Analyze...',
  });

  if (response.usedFallback) {
    console.warn(`Primary failed, used ${response.provider}`);
  }
} catch (error) {
  // All providers failed
  console.error('All LLM providers unavailable:', error);
}
```

---

## Cost Monitoring

### Get Real-Time Metrics

```typescript
const monitoring = llm.getMonitoring();

// Task-specific metrics
const metrics = monitoring.getTaskMetrics(
  TaskType.FAST_AGENTIC,
  Provider.GEMINI_FLASH_LITE
);

console.log(metrics.count);        // Number of calls
console.log(metrics.totalCost);    // Total cost (USD)
console.log(metrics.avgLatency);   // Average latency (ms)
console.log(metrics.successCount); // Successful calls
console.log(metrics.errorCount);   // Failed calls

// Provider metrics
const providerMetrics = monitoring.getProviderMetrics(Provider.GEMINI_FLASH_LITE);
console.log(providerMetrics.totalCalls);  // Total calls to this provider
console.log(providerMetrics.errorRate);   // Error rate (0-1)
console.log(providerMetrics.uptime);      // Uptime percentage

// Cost breakdown
const breakdown = monitoring.getCostBreakdown(
  new Date('2025-11-01'),
  new Date('2025-11-30')
);

console.log(breakdown.totalCost);                           // Total spend
console.log(breakdown.byProvider[Provider.GEMINI_FLASH]);   // Per provider
console.log(breakdown.byTaskType[TaskType.FAST_AGENTIC]);   // Per task type
```

### Cost Optimization Suggestions

```typescript
const suggestions = monitoring.getCostOptimizationSuggestions();

suggestions.forEach((suggestion) => {
  console.log(suggestion);
});

// Example output:
// "Task type 'CONVERSATIONAL' using claude-sonnet-4-5 costs $0.0180 per call.
//  Consider testing with Gemini Flash-Lite ($0.10/1M tokens)."
```

---

## Health Monitoring

```typescript
// Get health status of all providers
const health = llm.getHealthStatus();

health.forEach((h) => {
  console.log(`${h.provider}: ${h.healthy ? 'HEALTHY' : 'UNHEALTHY'}`);
  console.log(`  Error Rate: ${(h.errorRate * 100).toFixed(1)}%`);
  console.log(`  Avg Latency: ${h.avgLatency}ms`);
  console.log(`  Last Check: ${h.lastCheck}`);
});
```

---

## Convenience Functions

For simple use cases, use the convenience functions:

```typescript
import { generateText, generateObject, TaskType } from '@grc/shared/llm';

// Quick text generation
const text = await generateText(
  TaskType.FAST_AGENTIC,
  'Analyze this system...'
);

// With options
const text2 = await generateText(
  TaskType.COMPLEX_REASONING,
  'Deep analysis...',
  {
    systemPrompt: 'You are an expert...',
    temperature: 0.3,
    maxTokens: 8000,
  }
);

// Quick structured output
const analysis = await generateObject(
  TaskType.CODE_ANALYSIS,
  'Analyze this code...',
  AnalysisSchema
);
```

---

## Architecture

### File Structure

```
packages/shared/llm/
├── index.ts                    # Main entry point (LLM singleton)
├── types.ts                    # Type definitions
├── router.ts                   # Task routing logic
├── failover.ts                 # Failover & retry logic
├── monitoring.ts               # Cost & performance tracking
├── providers/
│   ├── base-provider.ts        # Abstract base class
│   ├── gemini.ts               # Gemini 2.5 implementation
│   └── claude.ts               # Claude Sonnet 4.5 implementation
└── __tests__/
    ├── router.test.ts          # Router tests
    ├── monitoring.test.ts      # Monitoring tests
    ├── failover.test.ts        # Failover tests
    └── integration.test.ts     # End-to-end tests
```

### Adding a New Provider

1. Create provider file: `providers/openai.ts`
2. Extend `BaseProvider`
3. Implement 4 methods: `generateText`, `generateObject`, `healthCheck`, `getProviderName`
4. Add to `Provider` enum in `types.ts`
5. Add to routing matrix in `router.ts`
6. Initialize in `failover.ts` constructor

**Time:** <1 hour

---

## Cost Savings

### Monthly Audit Cost (1,000 audits, 150 controls each)

**All Claude Sonnet 4.5:**
- Input: 900M tokens × $3/1M = $2,700
- Output: 225M tokens × $15/1M = $3,375
- **Total: $6,075/month**

**Smart Routing (Gemini + Claude):**
- Discovery (30%): Gemini Flash-Lite → $54
- Evidence (50%): Gemini Flash → $697
- Gap Analysis (15%): Gemini Pro → $507
- Policy Gen (5%): Claude Sonnet → $304
- **Total: $1,562/month**

**Savings: 74% ($4,513/month)**

---

## Best Practices

### 1. Initialize Once

```typescript
// ✅ Good: Initialize on app startup
const llm = LLM.getInstance(config);

// ❌ Bad: Don't re-initialize
const llm = LLM.getInstance(); // Use existing instance
```

### 2. Choose Appropriate Task Type

```typescript
// ✅ Good: Use cheapest capable model
const discovery = await llm.executeText({
  taskType: TaskType.FAST_AGENTIC, // Routes to Flash-Lite
  prompt: 'Quick classification task',
});

// ❌ Bad: Overpaying for simple tasks
const discovery = await llm.executeText({
  taskType: TaskType.COMPLEX_REASONING, // Routes to Pro ($1.25)
  prompt: 'Quick classification task',
});
```

### 3. Monitor Costs

```typescript
// Check costs weekly
const monitoring = llm.getMonitoring();
const suggestions = monitoring.getCostOptimizationSuggestions();

if (suggestions.length > 0) {
  console.warn('Cost optimization opportunities:', suggestions);
}
```

### 4. Handle Fallbacks

```typescript
const response = await llm.executeText(task);

if (response.usedFallback) {
  // Log for investigation
  console.warn(`Fallback used: ${response.provider}`);

  // Check provider health
  const health = llm.getHealthStatus();
  const unhealthy = health.filter((h) => !h.healthy);

  if (unhealthy.length > 0) {
    // Alert ops team
  }
}
```

---

## Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage (80% minimum)
pnpm test:coverage
```

### Test Files

- `router.test.ts` - Task routing logic
- `monitoring.test.ts` - Cost tracking & metrics
- `failover.test.ts` - Failover & retry logic
- `integration.test.ts` - End-to-end workflows

---

## Environment Variables

```env
# Required
GOOGLE_API_KEY=your-gemini-api-key
ANTHROPIC_API_KEY=your-claude-api-key

# Optional (defaults shown)
LLM_MAX_RETRIES=3
LLM_RETRY_DELAY_MS=1000
LLM_TIMEOUT_MS=30000
```

---

## Troubleshooting

### Issue: All providers failing

**Check:**
1. API keys valid?
2. Network connectivity?
3. Provider health status?

```typescript
const health = llm.getHealthStatus();
health.forEach((h) => console.log(h));
```

### Issue: High costs

**Check:**
1. Using appropriate task types?
2. Review cost breakdown by provider
3. Check optimization suggestions

```typescript
const monitoring = llm.getMonitoring();
const suggestions = monitoring.getCostOptimizationSuggestions();
console.log(suggestions);
```

### Issue: High latency

**Check:**
1. Provider health metrics
2. Network latency
3. Token counts (large prompts = slower)

```typescript
const providerMetrics = monitoring.getProviderMetrics(Provider.GEMINI_FLASH);
console.log(`Avg Latency: ${providerMetrics.avgLatency}ms`);
```

---

**Last Updated:** November 16, 2025
**Status:** Production-Ready ✅
**Test Coverage:** 80%+
**Architecture:** LLM_VENDOR_FREE_STRATEGY.md
