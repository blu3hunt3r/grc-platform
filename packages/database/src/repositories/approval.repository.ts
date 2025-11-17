/**
 * @file approval.repository.ts
 * @description Repository for Approval model - tracks human-in-the-loop approvals
 * @module @grc/database/repositories
 * @architecture SYSTEM_PROMPT.md "Pattern 4: Human-in-the-Loop Approval Workflow"
 *
 * Architecture Reference: SYSTEM_PROMPT.md Lines 245-251
 * Quote: "Pattern 4: Human-in-the-Loop Approval Workflow
 *         class ApprovalQueue {
 *           async requestApproval(decision: Decision): Promise<Approval> {
 *             // Create approval request
 *             // Notify user
 *             // Wait for response
 *           }
 *         }"
 *
 * Purpose:
 * - Manages approval requests from agents for critical decisions
 * - Tracks approval lifecycle (pending, approved, rejected, expired)
 * - Links approvals to agent executions for audit trail
 * - Provides queries for pending approvals and approval history
 *
 * Dependencies:
 * - @prisma/client: Database ORM
 * - ./base.repository: Abstract base class
 *
 * Related components:
 * - All agents can request approvals for high-stakes decisions
 * - Orchestrator monitors approval queue
 * - Frontend displays pending approvals to users
 * - Audit trail references approval decisions
 */

import {
  PrismaClient,
  Approval,
  ApprovalType,
  ApprovalStatus,
  Priority,
  Prisma,
} from '@prisma/client';
import { BaseRepository } from './base.repository';

/**
 * Input type for creating approval requests
 */
export interface CreateApprovalInput {
  executionId: string;
  title: string;
  description: string;
  type: ApprovalType;
  priority?: Priority;
  metadata?: Record<string, any>;
}

/**
 * Input type for responding to approvals
 */
export interface RespondToApprovalInput {
  approvedBy: string;
  decision: boolean; // true = approved, false = rejected
  comments?: string;
}

/**
 * Query filters for approvals
 */
export interface ApprovalFilters {
  executionId?: string;
  type?: ApprovalType;
  status?: ApprovalStatus;
  priority?: Priority;
  requestedAfter?: Date;
  requestedBefore?: Date;
}

/**
 * Approval statistics
 */
export interface ApprovalStats {
  totalApprovals: number;
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
  avgResponseTime: number | null; // milliseconds
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

/**
 * Repository for Approval model
 */
export class ApprovalRepository extends BaseRepository<Approval> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'approval');
  }

  /**
   * Create a new approval request
   */
  async createApproval(input: CreateApprovalInput): Promise<Approval> {
    try {
      return await this.create({
        executionId: input.executionId,
        title: input.title,
        description: input.description,
        type: input.type,
        priority: input.priority ?? Priority.MEDIUM,
        status: ApprovalStatus.PENDING,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      });
    } catch (error) {
      this.handleError('createApproval', error, { input });
      throw error;
    }
  }

  /**
   * Respond to an approval request (approve or reject)
   */
  async respondToApproval(
    id: string,
    response: RespondToApprovalInput
  ): Promise<Approval> {
    try {
      const approval = await this.findById(id);
      if (!approval) {
        throw new Error(`Approval ${id} not found`);
      }

      if (approval.status !== ApprovalStatus.PENDING) {
        throw new Error(
          `Cannot respond to approval with status ${approval.status}`
        );
      }

      return await this.update(id, {
        status: response.decision
          ? ApprovalStatus.APPROVED
          : ApprovalStatus.REJECTED,
        approvedBy: response.approvedBy,
        decision: response.decision,
        comments: response.comments,
        respondedAt: new Date(),
      });
    } catch (error) {
      this.handleError('respondToApproval', error, { id, response });
      throw error;
    }
  }

  /**
   * Approve a request
   */
  async approve(
    id: string,
    approvedBy: string,
    comments?: string
  ): Promise<Approval> {
    try {
      return await this.respondToApproval(id, {
        approvedBy,
        decision: true,
        comments,
      });
    } catch (error) {
      this.handleError('approve', error, { id, approvedBy, comments });
      throw error;
    }
  }

  /**
   * Reject a request
   */
  async reject(
    id: string,
    rejectedBy: string,
    comments?: string
  ): Promise<Approval> {
    try {
      return await this.respondToApproval(id, {
        approvedBy: rejectedBy,
        decision: false,
        comments,
      });
    } catch (error) {
      this.handleError('reject', error, { id, rejectedBy, comments });
      throw error;
    }
  }

  /**
   * Find approvals by filters
   */
  async findByFilters(
    filters: ApprovalFilters,
    options?: {
      skip?: number;
      take?: number;
      orderBy?: Prisma.ApprovalOrderByWithRelationInput;
      include?: Prisma.ApprovalInclude;
    }
  ): Promise<Approval[]> {
    try {
      const where: Prisma.ApprovalWhereInput = {};

      if (filters.executionId) {
        where.executionId = filters.executionId;
      }

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.priority) {
        where.priority = filters.priority;
      }

      if (filters.requestedAfter || filters.requestedBefore) {
        where.requestedAt = {};
        if (filters.requestedAfter) {
          where.requestedAt.gte = filters.requestedAfter;
        }
        if (filters.requestedBefore) {
          where.requestedAt.lte = filters.requestedBefore;
        }
      }

      return await this.findMany(where, {
        skip: options?.skip,
        take: options?.take,
        orderBy: options?.orderBy ?? { requestedAt: 'desc' },
        include: options?.include,
      });
    } catch (error) {
      this.handleError('findByFilters', error, { filters, options });
      throw error;
    }
  }

  /**
   * Find all pending approvals
   */
  async findPending(options?: {
    priority?: Priority;
    type?: ApprovalType;
    orderBy?: 'priority' | 'requestedAt';
  }): Promise<Approval[]> {
    try {
      const where: Prisma.ApprovalWhereInput = {
        status: ApprovalStatus.PENDING,
      };

      if (options?.priority) {
        where.priority = options.priority;
      }

      if (options?.type) {
        where.type = options.type;
      }

      const orderBy: Prisma.ApprovalOrderByWithRelationInput =
        options?.orderBy === 'priority'
          ? { priority: 'desc' }
          : { requestedAt: 'asc' };

      return await this.findMany(where, {
        orderBy,
        include: {
          execution: {
            select: {
              agentName: true,
              agentType: true,
              phase: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError('findPending', error, { options });
      throw error;
    }
  }

  /**
   * Find pending approvals by priority (for urgent approvals)
   */
  async findPendingByPriority(): Promise<Approval[]> {
    try {
      return await this.findMany(
        { status: ApprovalStatus.PENDING },
        {
          orderBy: [
            { priority: 'desc' }, // CRITICAL first, then HIGH, etc.
            { requestedAt: 'asc' }, // Older first within same priority
          ],
          include: {
            execution: {
              select: {
                agentName: true,
                agentType: true,
                phase: true,
              },
            },
          },
        }
      );
    } catch (error) {
      this.handleError('findPendingByPriority', error, {});
      throw error;
    }
  }

  /**
   * Find approvals for an execution
   */
  async findByExecutionId(executionId: string): Promise<Approval[]> {
    try {
      return await this.findMany(
        { executionId },
        {
          orderBy: { requestedAt: 'desc' },
        }
      );
    } catch (error) {
      this.handleError('findByExecutionId', error, { executionId });
      throw error;
    }
  }

  /**
   * Find approvals by type
   */
  async findByType(
    type: ApprovalType,
    status?: ApprovalStatus
  ): Promise<Approval[]> {
    try {
      const where: Prisma.ApprovalWhereInput = { type };

      if (status) {
        where.status = status;
      }

      return await this.findMany(where, {
        orderBy: { requestedAt: 'desc' },
      });
    } catch (error) {
      this.handleError('findByType', error, { type, status });
      throw error;
    }
  }

  /**
   * Get approval with execution details
   */
  async findByIdWithExecution(id: string) {
    try {
      return await this.prisma.approval.findUnique({
        where: { id },
        include: {
          execution: {
            include: {
              audit: true,
            },
          },
        },
      });
    } catch (error) {
      this.handleError('findByIdWithExecution', error, { id });
      throw error;
    }
  }

  /**
   * Mark expired approvals (after a certain time period)
   */
  async markExpired(expirationHours: number = 72): Promise<number> {
    try {
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() - expirationHours);

      const expiredApprovals = await this.findMany({
        status: ApprovalStatus.PENDING,
        requestedAt: {
          lt: expirationDate,
        },
      });

      // Update all expired approvals
      const updatePromises = expiredApprovals.map((approval) =>
        this.update(approval.id, {
          status: ApprovalStatus.EXPIRED,
          respondedAt: new Date(),
        })
      );

      await Promise.all(updatePromises);

      return expiredApprovals.length;
    } catch (error) {
      this.handleError('markExpired', error, { expirationHours });
      throw error;
    }
  }

  /**
   * Get approval statistics
   */
  async getApprovalStats(
    executionId?: string,
    type?: ApprovalType
  ): Promise<ApprovalStats> {
    try {
      const where: Prisma.ApprovalWhereInput = {};

      if (executionId) {
        where.executionId = executionId;
      }

      if (type) {
        where.type = type;
      }

      const approvals = await this.findMany(where);

      const stats: ApprovalStats = {
        totalApprovals: approvals.length,
        pending: 0,
        approved: 0,
        rejected: 0,
        expired: 0,
        avgResponseTime: null,
        byType: {},
        byPriority: {},
      };

      let totalResponseTime = 0;
      let responseCount = 0;

      approvals.forEach((approval) => {
        // Count by status
        if (approval.status === ApprovalStatus.PENDING) stats.pending++;
        if (approval.status === ApprovalStatus.APPROVED) stats.approved++;
        if (approval.status === ApprovalStatus.REJECTED) stats.rejected++;
        if (approval.status === ApprovalStatus.EXPIRED) stats.expired++;

        // Count by type
        stats.byType[approval.type] = (stats.byType[approval.type] || 0) + 1;

        // Count by priority
        stats.byPriority[approval.priority] =
          (stats.byPriority[approval.priority] || 0) + 1;

        // Calculate average response time
        if (approval.respondedAt) {
          const responseTime =
            approval.respondedAt.getTime() - approval.requestedAt.getTime();
          totalResponseTime += responseTime;
          responseCount++;
        }
      });

      if (responseCount > 0) {
        stats.avgResponseTime = Math.round(totalResponseTime / responseCount);
      }

      return stats;
    } catch (error) {
      this.handleError('getApprovalStats', error, { executionId, type });
      throw error;
    }
  }

  /**
   * Get approval rate (approved / total responded)
   */
  async getApprovalRate(
    type?: ApprovalType,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    try {
      const where: Prisma.ApprovalWhereInput = {
        status: {
          in: [ApprovalStatus.APPROVED, ApprovalStatus.REJECTED],
        },
      };

      if (type) {
        where.type = type;
      }

      if (startDate || endDate) {
        where.respondedAt = {};
        if (startDate) {
          where.respondedAt.gte = startDate;
        }
        if (endDate) {
          where.respondedAt.lte = endDate;
        }
      }

      const responded = await this.findMany(where);

      if (responded.length === 0) {
        return 0;
      }

      const approved = responded.filter(
        (a) => a.status === ApprovalStatus.APPROVED
      ).length;

      return approved / responded.length;
    } catch (error) {
      this.handleError('getApprovalRate', error, { type, startDate, endDate });
      throw error;
    }
  }

  /**
   * Get recent approvals for audit trail
   */
  async getRecentApprovals(limit: number = 20): Promise<Approval[]> {
    try {
      return await this.findMany(
        {},
        {
          take: limit,
          orderBy: { requestedAt: 'desc' },
          include: {
            execution: {
              select: {
                agentName: true,
                agentType: true,
                phase: true,
              },
            },
          },
        }
      );
    } catch (error) {
      this.handleError('getRecentApprovals', error, { limit });
      throw error;
    }
  }

  /**
   * Check if execution has pending approvals
   */
  async hasPendingApprovals(executionId: string): Promise<boolean> {
    try {
      const count = await this.count({
        executionId,
        status: ApprovalStatus.PENDING,
      });

      return count > 0;
    } catch (error) {
      this.handleError('hasPendingApprovals', error, { executionId });
      throw error;
    }
  }

  /**
   * Get oldest pending approval (for SLA tracking)
   */
  async getOldestPending(): Promise<Approval | null> {
    try {
      const approvals = await this.findMany(
        { status: ApprovalStatus.PENDING },
        {
          take: 1,
          orderBy: { requestedAt: 'asc' },
        }
      );

      return approvals[0] || null;
    } catch (error) {
      this.handleError('getOldestPending', error, {});
      throw error;
    }
  }
}
