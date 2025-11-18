/**
 * @file company.repository.ts
 * @description Repository for Company data access operations
 * @module @grc/database/repositories
 * @architecture SYSTEM_PROMPT.md "Pattern 3: Agent-to-Database via Repository Pattern"
 *
 * Architecture Reference: SYSTEM_PROMPT.md Lines 239-244
 * Quote: "Pattern 3: Agent-to-Database via Repository Pattern
 *         Abstracts database operations from business logic"
 *
 * Purpose:
 * - Centralized company data operations
 * - Supports multi-tenant architecture
 * - Handles company creation from Clerk webhooks
 * - Provides type-safe company queries
 *
 * Dependencies:
 * - @prisma/client: Database ORM
 * - BaseRepository: Common CRUD operations
 *
 * Related components:
 * - Clerk webhook for auto-company creation
 * - Multi-tenant RLS policies
 * - Company management features
 */

import { PrismaClient, Company, CompanySize, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Input for creating a new company
 */
export interface CreateCompanyInput {
  name: string;
  domain?: string | null;
  description?: string | null;
  size?: CompanySize | null;
  industry?: string | null;
  createdById: string; // User UUID who owns this company
}

/**
 * Input for updating company details
 */
export interface UpdateCompanyInput {
  name?: string;
  domain?: string | null;
  description?: string | null;
  size?: CompanySize | null;
  industry?: string | null;
}

/**
 * Filters for querying companies
 */
export interface CompanyFilters {
  createdById?: string;
  industry?: string;
  size?: CompanySize;
  search?: string; // Search in name or domain
  includeDeleted?: boolean; // Include soft-deleted companies
}

/**
 * Company with related data
 */
export interface CompanyWithRelations extends Company {
  createdBy: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  audits?: any[];
}

// ============================================================================
// REPOSITORY CLASS
// ============================================================================

export class CompanyRepository extends BaseRepository<Company> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'company');
  }

  // ============================================================================
  // CREATE OPERATIONS
  // ============================================================================

  /**
   * Create a new company
   * Called from Clerk webhook after user signup or from UI
   *
   * @param input - Company data
   * @returns Created company record
   *
   * Architecture: Multi-tenant isolation via companyId
   * Every user gets their own company on signup
   */
  async createCompany(input: CreateCompanyInput): Promise<Company> {
    try {
      const company = await this.prisma.company.create({
        data: {
          name: input.name,
          domain: input.domain,
          description: input.description,
          size: input.size,
          industry: input.industry,
          createdById: input.createdById,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      console.log(`[CompanyRepository] Created company: ${company.id} (${company.name})`);
      return company;
    } catch (error) {
      this.handleError('createCompany', error, { input });
      throw error;
    }
  }

  /**
   * Create default company for new user
   * Called from Clerk webhook on user.created event
   *
   * @param userId - User UUID
   * @param userEmail - User email for default company name
   * @returns Created company record
   */
  async createDefaultCompany(userId: string, userEmail: string): Promise<Company> {
    try {
      // Extract company name from email domain or use default
      const domain = userEmail.split('@')[1];
      const defaultName = domain
        ? domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
        : 'My Company';

      const company = await this.createCompany({
        name: defaultName,
        domain: domain || null,
        description: 'Default company created on signup',
        createdById: userId,
      });

      console.log(`[CompanyRepository] Created default company for user: ${userId}`);
      return company;
    } catch (error) {
      this.handleError('createDefaultCompany', error, { userId, userEmail });
      throw error;
    }
  }

  // ============================================================================
  // QUERY OPERATIONS
  // ============================================================================

  /**
   * Find company by ID with relations
   *
   * @param id - Company UUID
   * @returns Company with relations or null
   */
  async findByIdWithRelations(id: string): Promise<CompanyWithRelations | null> {
    try {
      const company = await this.prisma.company.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          audits: {
            where: { deletedAt: null }, // Exclude soft-deleted audits
            orderBy: { createdAt: 'desc' },
            take: 10, // Limit to recent audits
          },
        },
      });

      return company as CompanyWithRelations | null;
    } catch (error) {
      this.handleError('findByIdWithRelations', error, { id });
      throw error;
    }
  }

  /**
   * Find companies by user (owner)
   * Used to show user's companies in UI
   *
   * @param userId - User UUID
   * @returns Array of companies owned by user
   */
  async findByUserId(userId: string): Promise<Company[]> {
    try {
      const companies = await this.prisma.company.findMany({
        where: {
          createdById: userId,
          deletedAt: null, // Exclude soft-deleted
        },
        orderBy: { createdAt: 'desc' },
      });

      return companies;
    } catch (error) {
      this.handleError('findByUserId', error, { userId });
      throw error;
    }
  }

  /**
   * Find companies with filters
   * Supports search, industry, size filtering
   *
   * @param filters - Query filters
   * @returns Array of matching companies
   */
  async findWithFilters(filters: CompanyFilters): Promise<Company[]> {
    try {
      const where: Prisma.CompanyWhereInput = {};

      // Apply soft delete filter
      if (!filters.includeDeleted) {
        where.deletedAt = null;
      }

      if (filters.createdById) {
        where.createdById = filters.createdById;
      }

      if (filters.industry) {
        where.industry = filters.industry;
      }

      if (filters.size) {
        where.size = filters.size;
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { domain: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const companies = await this.prisma.company.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return companies;
    } catch (error) {
      this.handleError('findWithFilters', error, { filters });
      throw error;
    }
  }

  /**
   * Check if user owns company
   * Used for authorization checks
   *
   * @param companyId - Company UUID
   * @param userId - User UUID
   * @returns True if user owns company
   */
  async isOwner(companyId: string, userId: string): Promise<boolean> {
    try {
      const company = await this.prisma.company.findFirst({
        where: {
          id: companyId,
          createdById: userId,
          deletedAt: null,
        },
      });

      return company !== null;
    } catch (error) {
      this.handleError('isOwner', error, { companyId, userId });
      throw error;
    }
  }

  // ============================================================================
  // UPDATE OPERATIONS
  // ============================================================================

  /**
   * Update company details
   * Only owner can update company
   *
   * @param companyId - Company UUID
   * @param input - Fields to update
   * @returns Updated company record
   */
  async updateCompany(companyId: string, input: UpdateCompanyInput): Promise<Company> {
    try {
      const company = await this.prisma.company.update({
        where: { id: companyId },
        data: input,
      });

      console.log(`[CompanyRepository] Updated company: ${company.id}`);
      return company;
    } catch (error) {
      this.handleError('updateCompany', error, { companyId, input });
      throw error;
    }
  }

  // ============================================================================
  // DELETE OPERATIONS
  // ============================================================================

  /**
   * Soft delete company
   * Sets deletedAt timestamp instead of removing record
   *
   * @param companyId - Company UUID
   * @returns Soft-deleted company record
   */
  async softDelete(companyId: string): Promise<Company> {
    try {
      const company = await this.prisma.company.update({
        where: { id: companyId },
        data: { deletedAt: new Date() },
      });

      console.warn(`[CompanyRepository] Soft deleted company: ${company.id}`);
      return company;
    } catch (error) {
      this.handleError('softDelete', error, { companyId });
      throw error;
    }
  }

  /**
   * Restore soft-deleted company
   *
   * @param companyId - Company UUID
   * @returns Restored company record
   */
  async restore(companyId: string): Promise<Company> {
    try {
      const company = await this.prisma.company.update({
        where: { id: companyId },
        data: { deletedAt: null },
      });

      console.log(`[CompanyRepository] Restored company: ${company.id}`);
      return company;
    } catch (error) {
      this.handleError('restore', error, { companyId });
      throw error;
    }
  }

  /**
   * Hard delete company
   * Permanently removes record and all related data
   *
   * WARNING: This is irreversible! Use soft delete instead.
   *
   * @param companyId - Company UUID
   * @returns Deleted company record
   */
  async hardDelete(companyId: string): Promise<Company> {
    try {
      const company = await this.prisma.company.delete({
        where: { id: companyId },
      });

      console.warn(`[CompanyRepository] Hard deleted company: ${company.id}`);
      return company;
    } catch (error) {
      this.handleError('hardDelete', error, { companyId });
      throw error;
    }
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  /**
   * Get company statistics by size
   * Used for admin dashboard analytics
   *
   * @returns Company counts by size
   */
  async getCompanyStats(): Promise<{
    total: number;
    bySize: { size: CompanySize | null; count: number }[];
    byIndustry: { industry: string | null; count: number }[];
  }> {
    try {
      const [total, bySize, byIndustry] = await Promise.all([
        this.count({ deletedAt: null }),
        this.prisma.company.groupBy({
          by: ['size'],
          where: { deletedAt: null },
          _count: { size: true },
        }),
        this.prisma.company.groupBy({
          by: ['industry'],
          where: { deletedAt: null },
          _count: { industry: true },
          orderBy: { _count: { industry: 'desc' } },
          take: 10, // Top 10 industries
        }),
      ]);

      return {
        total,
        bySize: bySize.map((stat: any) => ({
          size: stat.size,
          count: stat._count.size,
        })),
        byIndustry: byIndustry.map((stat: any) => ({
          industry: stat.industry,
          count: stat._count.industry,
        })),
      };
    } catch (error) {
      this.handleError('getCompanyStats', error, {});
      throw error;
    }
  }
}
