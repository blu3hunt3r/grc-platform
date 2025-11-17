/**
 * @file index.ts
 * @description Repository exports - centralized data access layer
 * @module @grc/database/repositories
 * @architecture SYSTEM_PROMPT.md "Pattern 3: Agent-to-Database via Repository Pattern"
 *
 * Architecture Reference: SYSTEM_PROMPT.md Lines 239-247
 * Quote: "Pattern 3: Agent-to-Database via Repository Pattern
 *         class EvidenceRepository {
 *           async save(evidence: Evidence): Promise<void> {
 *             // Prisma implementation
 *           }
 *         }"
 *
 * Purpose:
 * - Centralizes all repository exports
 * - Provides single import point for agents
 * - Enforces repository pattern across platform
 * - Prevents direct Prisma access from agents
 *
 * Dependencies:
 * - All repository implementations
 *
 * Related components:
 * - All agents MUST use repositories (NO direct Prisma)
 * - Workflows use repositories for data persistence
 * - API routes use repositories for database operations
 */

// Base repository (abstract class)
export { BaseRepository } from './base.repository';

// Concrete repositories
export {
  AgentExecutionRepository,
  type CreateAgentExecutionInput,
  type UpdateAgentExecutionInput,
  type AgentExecutionFilters,
  type ExecutionStats,
} from './agent-execution.repository';

export {
  ApprovalRepository,
  type CreateApprovalInput,
  type RespondToApprovalInput,
  type ApprovalFilters,
  type ApprovalStats,
} from './approval.repository';

export {
  EvidenceRepository,
  type CreateEvidenceInput,
  type UpdateEvidenceInput,
  type EvidenceFilters,
  type EvidenceStats,
  type EvidenceGap,
} from './evidence.repository';

export {
  FindingRepository,
  type CreateFindingInput,
  type UpdateFindingInput,
  type FindingFilters,
  type FindingStats,
} from './finding.repository';
