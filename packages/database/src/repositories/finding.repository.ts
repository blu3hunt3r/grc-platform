/**
 * @file finding.repository.ts
 * @description Repository for Finding model - manages compliance gaps and findings
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
 * - Manages compliance findings/gaps identified by agents
 * - Tracks finding lifecycle (open, in_progress, resolved, accepted_risk)
 * - Links findings to controls, audits, and remediation tasks
 * - Provides queries for gap analysis and remediation tracking
 *
 * Dependencies:
 * - @prisma/client: Database ORM
 * - ./base.repository: Abstract base class
 *
 * Related components:
 * - Gap Analyzer Agent creates findings
 * - Control Validator Agent identifies control failures
 * - Policy Generator Agent queries findings for policy requirements
 * - Remediation workflow creates tasks from findings
 */

import {
  PrismaClient,
  Finding,
  Severity,
  FindingStatus,
  Prisma,
} from '@prisma/client';
import { BaseRepository } from './base.repository';

/**
 * Input type for creating findings
 */
export interface CreateFindingInput {
  auditId: string;
  controlId?: string;
  executionId?: string;
  severity: Severity;
  status?: FindingStatus;
  title: string;
  description: string;
  currentState: string;
  requiredState: string;
  impact: string;
  recommendation: string;
  dueDate?: Date;
}

/**
 * Input type for updating findings
 */
export interface UpdateFindingInput {
  severity?: Severity;
  status?: FindingStatus;
  title?: string;
  description?: string;
  currentState?: string;
  requiredState?: string;
  impact?: string;
  recommendation?: string;
  dueDate?: Date;
  resolvedAt?: Date;
}

/**
 * Query filters for findings
 */
export interface FindingFilters {
  auditId?: string;
  controlId?: string;
  executionId?: string;
  severity?: Severity;
  status?: FindingStatus;
  identifiedAfter?: Date;
  identifiedBefore?: Date;
  dueBefore?: Date;
}

/**
 * Finding statistics
 */
export interface FindingStats {
  totalFindings: number;
  open: number;
  inProgress: number;
  resolved: number;
  acceptedRisk: number;
  falsePositive: number;
  bySeverity: Record<string, number>;
  byControl: Record<string, number>;
  overdue: number;
  avgResolutionTime: number | null; // milliseconds
  resolutionRate: number;
}

/**
 * Repository for Finding model
 */
export class FindingRepository extends BaseRepository<Finding> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'finding');
  }

  /**
   * Create a new finding
   */
  async createFinding(input: CreateFindingInput): Promise<Finding> {
    try {
      return await this.create({
        auditId: input.auditId,
        controlId: input.controlId,
        executionId: input.executionId,
        severity: input.severity,
        status: input.status ?? FindingStatus.OPEN,
        title: input.title,
        description: input.description,
        currentState: input.currentState,
        requiredState: input.requiredState,
        impact: input.impact,
        recommendation: input.recommendation,
        dueDate: input.dueDate,
      });
    } catch (error) {
      this.handleError('createFinding', error, { input });
      throw error;
    }
  }

  /**
   * Update a finding
   */
  async updateFinding(
    id: string,
    input: UpdateFindingInput
  ): Promise<Finding> {
    try {
      const updateData: Prisma.FindingUpdateInput = {};

      if (input.severity) {
        updateData.severity = input.severity;
      }

      if (input.status) {
        updateData.status = input.status;
      }

      if (input.title !== undefined) {
        updateData.title = input.title;
      }

      if (input.description !== undefined) {
        updateData.description = input.description;
      }

      if (input.currentState !== undefined) {
        updateData.currentState = input.currentState;
      }

      if (input.requiredState !== undefined) {
        updateData.requiredState = input.requiredState;
      }

      if (input.impact !== undefined) {
        updateData.impact = input.impact;
      }

      if (input.recommendation !== undefined) {
        updateData.recommendation = input.recommendation;
      }

      if (input.dueDate !== undefined) {
        updateData.dueDate = input.dueDate;
      }

      if (input.resolvedAt !== undefined) {
        updateData.resolvedAt = input.resolvedAt;
      }

      return await this.update(id, updateData);
    } catch (error) {
      this.handleError('updateFinding', error, { id, input });
      throw error;
    }
  }

  /**
   * Mark finding as in progress
   */
  async markInProgress(id: string): Promise<Finding> {
    try {
      return await this.updateFinding(id, {
        status: FindingStatus.IN_PROGRESS,
      });
    } catch (error) {
      this.handleError('markInProgress', error, { id });
      throw error;
    }
  }

  /**
   * Mark finding as resolved
   */
  async markResolved(id: string): Promise<Finding> {
    try {
      return await this.updateFinding(id, {
        status: FindingStatus.RESOLVED,
        resolvedAt: new Date(),
      });
    } catch (error) {
      this.handleError('markResolved', error, { id });
      throw error;
    }
  }

  /**
   * Mark finding as accepted risk (won't fix)
   */
  async markAcceptedRisk(id: string, reason: string): Promise<Finding> {
    try {
      return await this.updateFinding(id, {
        status: FindingStatus.ACCEPTED_RISK,
        description: `${(await this.findById(id))?.description}\n\nRisk Acceptance: ${reason}`,
        resolvedAt: new Date(),
      });
    } catch (error) {
      this.handleError('markAcceptedRisk', error, { id, reason });
      throw error;
    }
  }

  /**
   * Mark finding as false positive
   */
  async markFalsePositive(id: string, reason: string): Promise<Finding> {
    try {
      return await this.updateFinding(id, {
        status: FindingStatus.FALSE_POSITIVE,
        description: `${(await this.findById(id))?.description}\n\nFalse Positive: ${reason}`,
        resolvedAt: new Date(),
      });
    } catch (error) {
      this.handleError('markFalsePositive', error, { id, reason });
      throw error;
    }
  }

  /**
   * Find findings by filters
   */
  async findByFilters(
    filters: FindingFilters,
    options?: {
      skip?: number;
      take?: number;
      orderBy?: Prisma.FindingOrderByWithRelationInput;
      include?: Prisma.FindingInclude;
    }
  ): Promise<Finding[]> {
    try {
      const where: Prisma.FindingWhereInput = {};

      if (filters.auditId) {
        where.auditId = filters.auditId;
      }

      if (filters.controlId) {
        where.controlId = filters.controlId;
      }

      if (filters.executionId) {
        where.executionId = filters.executionId;
      }

      if (filters.severity) {
        where.severity = filters.severity;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.identifiedAfter || filters.identifiedBefore) {
        where.identifiedAt = {};
        if (filters.identifiedAfter) {
          where.identifiedAt.gte = filters.identifiedAfter;
        }
        if (filters.identifiedBefore) {
          where.identifiedAt.lte = filters.identifiedBefore;
        }
      }

      if (filters.dueBefore) {
        where.dueDate = {
          lte: filters.dueBefore,
        };
      }

      return await this.findMany(where, {
        skip: options?.skip,
        take: options?.take,
        orderBy: options?.orderBy ?? [
          { severity: 'desc' }, // CRITICAL first
          { identifiedAt: 'desc' },
        ],
        include: options?.include,
      });
    } catch (error) {
      this.handleError('findByFilters', error, { filters, options });
      throw error;
    }
  }

  /**
   * Find all findings for an audit
   */
  async findByAuditId(
    auditId: string,
    options?: {
      include?: Prisma.FindingInclude;
    }
  ): Promise<Finding[]> {
    try {
      return await this.findMany(
        { auditId },
        {
          orderBy: [{ severity: 'desc' }, { identifiedAt: 'desc' }],
          include: options?.include,
        }
      );
    } catch (error) {
      this.handleError('findByAuditId', error, { auditId, options });
      throw error;
    }
  }

  /**
   * Find findings for a control
   */
  async findByControlId(
    controlId: string,
    status?: FindingStatus
  ): Promise<Finding[]> {
    try {
      const where: Prisma.FindingWhereInput = { controlId };

      if (status) {
        where.status = status;
      }

      return await this.findMany(where, {
        orderBy: [{ severity: 'desc' }, { identifiedAt: 'desc' }],
      });
    } catch (error) {
      this.handleError('findByControlId', error, { controlId, status });
      throw error;
    }
  }

  /**
   * Find findings by severity
   */
  async findBySeverity(
    severity: Severity,
    auditId?: string,
    status?: FindingStatus
  ): Promise<Finding[]> {
    try {
      const where: Prisma.FindingWhereInput = { severity };

      if (auditId) {
        where.auditId = auditId;
      }

      if (status) {
        where.status = status;
      }

      return await this.findMany(where, {
        orderBy: { identifiedAt: 'desc' },
      });
    } catch (error) {
      this.handleError('findBySeverity', error, { severity, auditId, status });
      throw error;
    }
  }

  /**
   * Find open findings
   */
  async findOpen(auditId?: string): Promise<Finding[]> {
    try {
      const where: Prisma.FindingWhereInput = {
        status: {
          in: [FindingStatus.OPEN, FindingStatus.IN_PROGRESS],
        },
      };

      if (auditId) {
        where.auditId = auditId;
      }

      return await this.findMany(where, {
        orderBy: [{ severity: 'desc' }, { identifiedAt: 'asc' }],
      });
    } catch (error) {
      this.handleError('findOpen', error, { auditId });
      throw error;
    }
  }

  /**
   * Find overdue findings (past due date and not resolved)
   */
  async findOverdue(auditId?: string): Promise<Finding[]> {
    try {
      const where: Prisma.FindingWhereInput = {
        status: {
          in: [FindingStatus.OPEN, FindingStatus.IN_PROGRESS],
        },
        dueDate: {
          lt: new Date(),
        },
      };

      if (auditId) {
        where.auditId = auditId;
      }

      return await this.findMany(where, {
        orderBy: [{ severity: 'desc' }, { dueDate: 'asc' }],
      });
    } catch (error) {
      this.handleError('findOverdue', error, { auditId });
      throw error;
    }
  }

  /**
   * Find critical findings (CRITICAL or HIGH severity)
   */
  async findCritical(auditId?: string, includeResolved?: boolean): Promise<Finding[]> {
    try {
      const where: Prisma.FindingWhereInput = {
        severity: {
          in: [Severity.CRITICAL, Severity.HIGH],
        },
      };

      if (auditId) {
        where.auditId = auditId;
      }

      if (!includeResolved) {
        where.status = {
          in: [FindingStatus.OPEN, FindingStatus.IN_PROGRESS],
        };
      }

      return await this.findMany(where, {
        orderBy: [{ severity: 'desc' }, { identifiedAt: 'desc' }],
      });
    } catch (error) {
      this.handleError('findCritical', error, { auditId, includeResolved });
      throw error;
    }
  }

  /**
   * Get finding with all related data
   */
  async findByIdWithRelations(id: string): Promise<Finding | null> {
    try {
      const findings = await this.findMany(
        { id },
        {
          include: {
            audit: true,
            control: true,
            execution: true,
            tasks: {
              orderBy: { createdAt: 'desc' },
            },
          },
        }
      );

      return findings[0] || null;
    } catch (error) {
      this.handleError('findByIdWithRelations', error, { id });
      throw error;
    }
  }

  /**
   * Get finding statistics
   */
  async getFindingStats(
    auditId?: string,
    controlId?: string
  ): Promise<FindingStats> {
    try {
      const where: Prisma.FindingWhereInput = {};

      if (auditId) {
        where.auditId = auditId;
      }

      if (controlId) {
        where.controlId = controlId;
      }

      const findings = await this.prisma.finding.findMany({
        where,
        include: {
          control: {
            select: {
              controlName: true,
            },
          },
        },
      });

      const stats: FindingStats = {
        totalFindings: findings.length,
        open: 0,
        inProgress: 0,
        resolved: 0,
        acceptedRisk: 0,
        falsePositive: 0,
        bySeverity: {},
        byControl: {},
        overdue: 0,
        avgResolutionTime: null,
        resolutionRate: 0,
      };

      let totalResolutionTime = 0;
      let resolvedCount = 0;
      const now = new Date();

      findings.forEach((finding) => {
        // Count by status
        if (finding.status === FindingStatus.OPEN) stats.open++;
        if (finding.status === FindingStatus.IN_PROGRESS) stats.inProgress++;
        if (finding.status === FindingStatus.RESOLVED) {
          stats.resolved++;
          resolvedCount++;
        }
        if (finding.status === FindingStatus.ACCEPTED_RISK) {
          stats.acceptedRisk++;
          resolvedCount++;
        }
        if (finding.status === FindingStatus.FALSE_POSITIVE) {
          stats.falsePositive++;
        }

        // Count by severity
        stats.bySeverity[finding.severity] =
          (stats.bySeverity[finding.severity] || 0) + 1;

        // Count by control
        const controlName = finding.control?.controlName || 'Unassigned';
        stats.byControl[controlName] = (stats.byControl[controlName] || 0) + 1;

        // Check if overdue
        if (
          finding.dueDate &&
          finding.dueDate < now &&
          (finding.status === FindingStatus.OPEN ||
            finding.status === FindingStatus.IN_PROGRESS)
        ) {
          stats.overdue++;
        }

        // Calculate resolution time
        if (finding.resolvedAt) {
          const resolutionTime =
            finding.resolvedAt.getTime() - finding.identifiedAt.getTime();
          totalResolutionTime += resolutionTime;
        }
      });

      // Calculate averages
      if (resolvedCount > 0) {
        stats.avgResolutionTime = Math.round(
          totalResolutionTime / resolvedCount
        );
      }

      if (findings.length > 0) {
        stats.resolutionRate = resolvedCount / findings.length;
      }

      return stats;
    } catch (error) {
      this.handleError('getFindingStats', error, { auditId, controlId });
      throw error;
    }
  }

  /**
   * Get findings due soon (within X days)
   */
  async findDueSoon(days: number = 7, auditId?: string): Promise<Finding[]> {
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);

      const where: Prisma.FindingWhereInput = {
        status: {
          in: [FindingStatus.OPEN, FindingStatus.IN_PROGRESS],
        },
        dueDate: {
          gte: new Date(),
          lte: targetDate,
        },
      };

      if (auditId) {
        where.auditId = auditId;
      }

      return await this.findMany(where, {
        orderBy: [{ dueDate: 'asc' }, { severity: 'desc' }],
      });
    } catch (error) {
      this.handleError('findDueSoon', error, { days, auditId });
      throw error;
    }
  }

  /**
   * Get recent findings for audit trail
   */
  async getRecentFindings(
    limit: number = 20,
    auditId?: string
  ): Promise<Finding[]> {
    try {
      const where: Prisma.FindingWhereInput = {};

      if (auditId) {
        where.auditId = auditId;
      }

      return await this.findMany(where, {
        take: limit,
        orderBy: { identifiedAt: 'desc' },
        include: {
          control: {
            select: {
              controlId: true,
              controlName: true,
              category: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError('getRecentFindings', error, { limit, auditId });
      throw error;
    }
  }

  /**
   * Get audit readiness score (0-100)
   * Based on open findings and their severity
   */
  async getAuditReadinessScore(auditId: string): Promise<number> {
    try {
      // Fetch all findings for this audit
      const findings = await this.findByFilters({ auditId });

      if (findings.length === 0) {
        return 100; // No findings = perfect score
      }

      // Weight findings by severity
      const severityWeights = {
        [Severity.CRITICAL]: 10,
        [Severity.HIGH]: 5,
        [Severity.MEDIUM]: 2,
        [Severity.LOW]: 1,
      };

      let totalWeight = 0;
      let openWeight = 0;

      findings.forEach((finding) => {
        const weight = severityWeights[finding.severity] || 1;
        totalWeight += weight;

        // Count open/in-progress findings
        if (
          finding.status === FindingStatus.OPEN ||
          finding.status === FindingStatus.IN_PROGRESS
        ) {
          openWeight += weight;
        }
      });

      if (totalWeight === 0) {
        return 100;
      }

      // Score = (1 - openWeight/totalWeight) * 100
      const score = Math.round(((totalWeight - openWeight) / totalWeight) * 100);
      return Math.max(0, Math.min(100, score));
    } catch (error) {
      this.handleError('getAuditReadinessScore', error, { auditId });
      throw error;
    }
  }

  /**
   * Check if control is compliant (no open findings)
   */
  async isControlCompliant(controlId: string): Promise<boolean> {
    try {
      const openFindings = await this.findByControlId(
        controlId,
        FindingStatus.OPEN
      );

      const inProgressFindings = await this.findByControlId(
        controlId,
        FindingStatus.IN_PROGRESS
      );

      return openFindings.length === 0 && inProgressFindings.length === 0;
    } catch (error) {
      this.handleError('isControlCompliant', error, { controlId });
      throw error;
    }
  }
}
