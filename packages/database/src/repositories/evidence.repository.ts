/**
 * @file evidence.repository.ts
 * @description Repository for Evidence model - manages compliance evidence collection
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
 * - Manages evidence lifecycle (collection, validation, storage)
 * - Tracks evidence status (pending, collected, validated, rejected)
 * - Links evidence to controls and audits
 * - Provides queries for evidence retrieval and gap detection
 *
 * Dependencies:
 * - @prisma/client: Database ORM
 * - ./base.repository: Abstract base class
 *
 * Related components:
 * - Evidence Collector Agent uses this to store evidence
 * - Vision Analyzer Agent uses this to store AI analysis
 * - Control Validator Agent queries this for validation
 * - Gap Analyzer Agent queries this to detect missing evidence
 */

import {
  PrismaClient,
  Evidence,
  EvidenceType,
  EvidenceStatus,
  Prisma,
} from '@prisma/client';
import { BaseRepository } from './base.repository';

/**
 * Input type for creating evidence
 */
export interface CreateEvidenceInput {
  auditId: string;
  controlId?: string;
  controlName: string;
  type: EvidenceType;
  status?: EvidenceStatus;
  description?: string;
  fileUrl?: string;
  screenshotUrl?: string;
  apiResponse?: string;
  aiAnalysis?: string;
  validated?: boolean;
  collectedAt?: Date;
}

/**
 * Input type for updating evidence
 */
export interface UpdateEvidenceInput {
  status?: EvidenceStatus;
  description?: string;
  fileUrl?: string;
  screenshotUrl?: string;
  apiResponse?: string;
  aiAnalysis?: string;
  validated?: boolean;
  collectedAt?: Date;
}

/**
 * Query filters for evidence
 */
export interface EvidenceFilters {
  auditId?: string;
  controlId?: string;
  controlName?: string;
  type?: EvidenceType;
  status?: EvidenceStatus;
  validated?: boolean;
  collectedAfter?: Date;
  collectedBefore?: Date;
}

/**
 * Evidence statistics
 */
export interface EvidenceStats {
  totalEvidence: number;
  pending: number;
  collected: number;
  validated: number;
  rejected: number;
  expired: number;
  byType: Record<string, number>;
  byControl: Record<string, number>;
  validationRate: number;
  completionRate: number;
}

/**
 * Evidence gap information
 */
export interface EvidenceGap {
  controlId: string;
  controlName: string;
  requiredTypes: EvidenceType[];
  missingTypes: EvidenceType[];
  existingEvidence: Evidence[];
}

/**
 * Repository for Evidence model
 */
export class EvidenceRepository extends BaseRepository<Evidence> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'evidence');
  }

  /**
   * Create a new evidence record
   */
  async createEvidence(input: CreateEvidenceInput): Promise<Evidence> {
    try {
      return await this.create({
        auditId: input.auditId,
        controlId: input.controlId,
        controlName: input.controlName,
        type: input.type,
        status: input.status ?? EvidenceStatus.PENDING,
        description: input.description,
        fileUrl: input.fileUrl,
        screenshotUrl: input.screenshotUrl,
        apiResponse: input.apiResponse,
        aiAnalysis: input.aiAnalysis,
        validated: input.validated ?? false,
        collectedAt: input.collectedAt,
      });
    } catch (error) {
      this.handleError('createEvidence', error, { input });
      throw error;
    }
  }

  /**
   * Update evidence
   */
  async updateEvidence(
    id: string,
    input: UpdateEvidenceInput
  ): Promise<Evidence> {
    try {
      const updateData: Prisma.EvidenceUpdateInput = {};

      if (input.status) {
        updateData.status = input.status;
      }

      if (input.description !== undefined) {
        updateData.description = input.description;
      }

      if (input.fileUrl !== undefined) {
        updateData.fileUrl = input.fileUrl;
      }

      if (input.screenshotUrl !== undefined) {
        updateData.screenshotUrl = input.screenshotUrl;
      }

      if (input.apiResponse !== undefined) {
        updateData.apiResponse = input.apiResponse;
      }

      if (input.aiAnalysis !== undefined) {
        updateData.aiAnalysis = input.aiAnalysis;
      }

      if (input.validated !== undefined) {
        updateData.validated = input.validated;
      }

      if (input.collectedAt !== undefined) {
        updateData.collectedAt = input.collectedAt;
      }

      return await this.update(id, updateData);
    } catch (error) {
      this.handleError('updateEvidence', error, { id, input });
      throw error;
    }
  }

  /**
   * Mark evidence as collected
   */
  async markCollected(
    id: string,
    data: {
      fileUrl?: string;
      screenshotUrl?: string;
      apiResponse?: string;
    }
  ): Promise<Evidence> {
    try {
      return await this.updateEvidence(id, {
        status: EvidenceStatus.COLLECTED,
        collectedAt: new Date(),
        ...data,
      });
    } catch (error) {
      this.handleError('markCollected', error, { id, data });
      throw error;
    }
  }

  /**
   * Mark evidence as validated (with AI analysis)
   */
  async markValidated(id: string, aiAnalysis: string): Promise<Evidence> {
    try {
      return await this.updateEvidence(id, {
        status: EvidenceStatus.VALIDATED,
        aiAnalysis,
        validated: true,
      });
    } catch (error) {
      this.handleError('markValidated', error, { id, aiAnalysis });
      throw error;
    }
  }

  /**
   * Mark evidence as rejected
   */
  async markRejected(id: string, reason: string): Promise<Evidence> {
    try {
      return await this.updateEvidence(id, {
        status: EvidenceStatus.REJECTED,
        aiAnalysis: reason,
        validated: false,
      });
    } catch (error) {
      this.handleError('markRejected', error, { id, reason });
      throw error;
    }
  }

  /**
   * Find evidence by filters
   */
  async findByFilters(
    filters: EvidenceFilters,
    options?: {
      skip?: number;
      take?: number;
      orderBy?: Prisma.EvidenceOrderByWithRelationInput;
      include?: Prisma.EvidenceInclude;
    }
  ): Promise<Evidence[]> {
    try {
      const where: Prisma.EvidenceWhereInput = {};

      if (filters.auditId) {
        where.auditId = filters.auditId;
      }

      if (filters.controlId) {
        where.controlId = filters.controlId;
      }

      if (filters.controlName) {
        where.controlName = {
          contains: filters.controlName,
          mode: 'insensitive',
        };
      }

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.validated !== undefined) {
        where.validated = filters.validated;
      }

      if (filters.collectedAfter || filters.collectedBefore) {
        where.collectedAt = {};
        if (filters.collectedAfter) {
          where.collectedAt.gte = filters.collectedAfter;
        }
        if (filters.collectedBefore) {
          where.collectedAt.lte = filters.collectedBefore;
        }
      }

      return await this.findMany(where, {
        skip: options?.skip,
        take: options?.take,
        orderBy: options?.orderBy ?? { createdAt: 'desc' },
        include: options?.include,
      });
    } catch (error) {
      this.handleError('findByFilters', error, { filters, options });
      throw error;
    }
  }

  /**
   * Find all evidence for an audit
   */
  async findByAuditId(
    auditId: string,
    options?: {
      include?: Prisma.EvidenceInclude;
    }
  ): Promise<any[]> {
    try {
      return await this.prisma.evidence.findMany({
        where: { auditId },
        orderBy: { createdAt: 'desc' },
        include: options?.include,
      });
    } catch (error) {
      this.handleError('findByAuditId', error, { auditId, options });
      throw error;
    }
  }

  /**
   * Find evidence for a specific control
   */
  async findByControlId(
    controlId: string,
    options?: {
      status?: EvidenceStatus;
      validated?: boolean;
    }
  ): Promise<Evidence[]> {
    try {
      const where: Prisma.EvidenceWhereInput = { controlId };

      if (options?.status) {
        where.status = options.status;
      }

      if (options?.validated !== undefined) {
        where.validated = options.validated;
      }

      return await this.findMany(where, {
        orderBy: { collectedAt: 'desc' },
      });
    } catch (error) {
      this.handleError('findByControlId', error, { controlId, options });
      throw error;
    }
  }

  /**
   * Find evidence by control name (fuzzy search)
   */
  async findByControlName(controlName: string): Promise<Evidence[]> {
    try {
      return await this.findMany(
        {
          controlName: {
            contains: controlName,
            mode: 'insensitive',
          },
        },
        {
          orderBy: { createdAt: 'desc' },
        }
      );
    } catch (error) {
      this.handleError('findByControlName', error, { controlName });
      throw error;
    }
  }

  /**
   * Find evidence by type
   */
  async findByType(
    type: EvidenceType,
    auditId?: string
  ): Promise<Evidence[]> {
    try {
      const where: Prisma.EvidenceWhereInput = { type };

      if (auditId) {
        where.auditId = auditId;
      }

      return await this.findMany(where, {
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.handleError('findByType', error, { type, auditId });
      throw error;
    }
  }

  /**
   * Find pending evidence (needs collection)
   */
  async findPending(auditId?: string): Promise<Evidence[]> {
    try {
      const where: Prisma.EvidenceWhereInput = {
        status: EvidenceStatus.PENDING,
      };

      if (auditId) {
        where.auditId = auditId;
      }

      return await this.findMany(where, {
        orderBy: { createdAt: 'asc' }, // Oldest first
      });
    } catch (error) {
      this.handleError('findPending', error, { auditId });
      throw error;
    }
  }

  /**
   * Find evidence needing validation (collected but not validated)
   */
  async findNeedingValidation(auditId?: string): Promise<Evidence[]> {
    try {
      const where: Prisma.EvidenceWhereInput = {
        status: EvidenceStatus.COLLECTED,
        validated: false,
      };

      if (auditId) {
        where.auditId = auditId;
      }

      return await this.findMany(where, {
        orderBy: { collectedAt: 'asc' },
      });
    } catch (error) {
      this.handleError('findNeedingValidation', error, { auditId });
      throw error;
    }
  }

  /**
   * Get evidence with control and audit details
   */
  async findByIdWithRelations(id: string) {
    try {
      return await this.prisma.evidence.findUnique({
        where: { id },
        include: {
          audit: true,
          control: true,
        },
      });
    } catch (error) {
      this.handleError('findByIdWithRelations', error, { id });
      throw error;
    }
  }

  /**
   * Get evidence statistics
   */
  async getEvidenceStats(
    auditId?: string,
    controlId?: string
  ): Promise<EvidenceStats> {
    try {
      const where: Prisma.EvidenceWhereInput = {};

      if (auditId) {
        where.auditId = auditId;
      }

      if (controlId) {
        where.controlId = controlId;
      }

      const evidenceList = await this.findMany(where);

      const stats: EvidenceStats = {
        totalEvidence: evidenceList.length,
        pending: 0,
        collected: 0,
        validated: 0,
        rejected: 0,
        expired: 0,
        byType: {},
        byControl: {},
        validationRate: 0,
        completionRate: 0,
      };

      let validatedCount = 0;
      let completedCount = 0;

      evidenceList.forEach((evidence) => {
        // Count by status
        if (evidence.status === EvidenceStatus.PENDING) stats.pending++;
        if (evidence.status === EvidenceStatus.COLLECTED) stats.collected++;
        if (evidence.status === EvidenceStatus.VALIDATED) {
          stats.validated++;
          validatedCount++;
        }
        if (evidence.status === EvidenceStatus.REJECTED) stats.rejected++;
        if (evidence.status === EvidenceStatus.EXPIRED) stats.expired++;

        // Count by type
        stats.byType[evidence.type] = (stats.byType[evidence.type] || 0) + 1;

        // Count by control
        stats.byControl[evidence.controlName] =
          (stats.byControl[evidence.controlName] || 0) + 1;

        // Track completion
        if (
          evidence.status === EvidenceStatus.VALIDATED ||
          evidence.status === EvidenceStatus.COLLECTED
        ) {
          completedCount++;
        }
      });

      // Calculate rates
      if (evidenceList.length > 0) {
        stats.validationRate = validatedCount / evidenceList.length;
        stats.completionRate = completedCount / evidenceList.length;
      }

      return stats;
    } catch (error) {
      this.handleError('getEvidenceStats', error, { auditId, controlId });
      throw error;
    }
  }

  /**
   * Detect evidence gaps for an audit
   * Returns controls that are missing required evidence
   */
  async detectGaps(auditId: string): Promise<EvidenceGap[]> {
    try {
      // Get all evidence for the audit with control details
      const evidence = await this.prisma.evidence.findMany({
        where: { auditId },
        include: {
          control: true,
        },
      });

      // Group by control
      const byControl = new Map<string, any[]>();
      evidence.forEach((ev: any) => {
        const controlId = ev.controlId || ev.controlName;
        if (!byControl.has(controlId)) {
          byControl.set(controlId, []);
        }
        byControl.get(controlId)!.push(ev);
      });

      // Detect gaps (controls with incomplete evidence)
      const gaps: EvidenceGap[] = [];

      for (const [controlId, evidenceList] of byControl.entries()) {
        const firstEvidence = evidenceList[0];
        const control = firstEvidence.control;

        if (!control) {
          // Control not yet linked - skip gap detection
          continue;
        }

        // Get required evidence types from control
        const requiredTypes = (control.evidenceTypes as string[]).map(
          (type) => type as EvidenceType
        );

        // Get existing evidence types
        const existingTypes = new Set(
          evidenceList
            .filter(
              (ev) =>
                ev.status === EvidenceStatus.VALIDATED ||
                ev.status === EvidenceStatus.COLLECTED
            )
            .map((ev) => ev.type)
        );

        // Find missing types
        const missingTypes = requiredTypes.filter(
          (type) => !existingTypes.has(type)
        );

        if (missingTypes.length > 0) {
          gaps.push({
            controlId: control.id,
            controlName: control.controlName,
            requiredTypes,
            missingTypes,
            existingEvidence: evidenceList,
          });
        }
      }

      return gaps;
    } catch (error) {
      this.handleError('detectGaps', error, { auditId });
      throw error;
    }
  }

  /**
   * Get evidence completion percentage for an audit
   */
  async getCompletionPercentage(auditId: string): Promise<number> {
    try {
      const stats = await this.getEvidenceStats(auditId);

      if (stats.totalEvidence === 0) {
        return 0;
      }

      return Math.round(stats.completionRate * 100);
    } catch (error) {
      this.handleError('getCompletionPercentage', error, { auditId });
      throw error;
    }
  }

  /**
   * Mark expired evidence (evidence older than X days)
   */
  async markExpired(expirationDays: number = 90): Promise<number> {
    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() - expirationDays);

      const expiredEvidence = await this.findMany({
        status: {
          in: [EvidenceStatus.COLLECTED, EvidenceStatus.VALIDATED],
        },
        collectedAt: {
          lt: expirationDate,
        },
      });

      // Update all expired evidence
      const updatePromises = expiredEvidence.map((evidence) =>
        this.update(evidence.id, {
          status: EvidenceStatus.EXPIRED,
        })
      );

      await Promise.all(updatePromises);

      return expiredEvidence.length;
    } catch (error) {
      this.handleError('markExpired', error, { expirationDays });
      throw error;
    }
  }

  /**
   * Get recent evidence for audit trail
   */
  async getRecentEvidence(
    limit: number = 20,
    auditId?: string
  ): Promise<Evidence[]> {
    try {
      const where: Prisma.EvidenceWhereInput = {};

      if (auditId) {
        where.auditId = auditId;
      }

      return await this.findMany(where, {
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      this.handleError('getRecentEvidence', error, { limit, auditId });
      throw error;
    }
  }

  /**
   * Check if control has sufficient evidence
   */
  async hasSufficientEvidence(controlId: string): Promise<boolean> {
    try {
      const evidence = await this.prisma.evidence.findMany({
        where: {
          controlId,
          status: EvidenceStatus.VALIDATED,
        },
        include: {
          control: true,
        },
      });

      // Get control to check requirements
      const firstEvidence = evidence[0];
      if (!firstEvidence || !firstEvidence.control) {
        return false;
      }

      const control = firstEvidence.control;
      const requiredTypes = (control.evidenceTypes as string[]).map(
        (type) => type as EvidenceType
      );

      const existingTypes = new Set(evidence.map((ev) => ev.type));

      // All required types must be present
      return requiredTypes.every((type) => existingTypes.has(type));
    } catch (error) {
      this.handleError('hasSufficientEvidence', error, { controlId });
      throw error;
    }
  }
}
