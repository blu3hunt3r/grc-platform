/**
 * @file base.repository.ts
 * @description Abstract base repository providing common CRUD operations
 * @module @grc/database/repositories
 * @architecture SYSTEM_PROMPT.md "Pattern 3: Agent-to-Database via Repository Pattern"
 *
 * Architecture Reference: SYSTEM_PROMPT.md Lines 239-244
 * Quote: "Pattern 3: Agent-to-Database via Repository Pattern
 *         class EvidenceRepository {
 *           async save(evidence: Evidence): Promise<void> {
 *             // Prisma implementation
 *           }
 *         }"
 *
 * Purpose:
 * - Abstracts Prisma operations from agents
 * - Provides consistent error handling
 * - Enables easy testing with mock repositories
 * - Enforces transaction patterns
 *
 * Dependencies:
 * - @prisma/client: Database ORM
 *
 * Related components:
 * - All agents use repositories (NO direct Prisma)
 * - Ensures data layer consistency
 */

import { PrismaClient } from '@prisma/client';

export abstract class BaseRepository<T> {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  /**
   * Find a record by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      // @ts-ignore - Dynamic model access
      const result = await this.prisma[this.modelName].findUnique({
        where: { id },
      });
      return result as T | null;
    } catch (error) {
      this.handleError('findById', error, { id });
      throw error;
    }
  }

  /**
   * Find all records matching criteria
   */
  async findMany(where: any = {}, options: any = {}): Promise<T[]> {
    try {
      // @ts-ignore - Dynamic model access
      const results = await this.prisma[this.modelName].findMany({
        where,
        ...options,
      });
      return results as T[];
    } catch (error) {
      this.handleError('findMany', error, { where, options });
      throw error;
    }
  }

  /**
   * Find first record matching criteria
   */
  async findFirst(where: any): Promise<T | null> {
    try {
      // @ts-ignore - Dynamic model access
      const result = await this.prisma[this.modelName].findFirst({
        where,
      });
      return result as T | null;
    } catch (error) {
      this.handleError('findFirst', error, { where });
      throw error;
    }
  }

  /**
   * Create a new record
   */
  async create(data: any): Promise<T> {
    try {
      // @ts-ignore - Dynamic model access
      const result = await this.prisma[this.modelName].create({
        data,
      });
      return result as T;
    } catch (error) {
      this.handleError('create', error, { data });
      throw error;
    }
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: any): Promise<T> {
    try {
      // @ts-ignore - Dynamic model access
      const result = await this.prisma[this.modelName].update({
        where: { id },
        data,
      });
      return result as T;
    } catch (error) {
      this.handleError('update', error, { id, data });
      throw error;
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<T> {
    try {
      // @ts-ignore - Dynamic model access
      const result = await this.prisma[this.modelName].delete({
        where: { id },
      });
      return result as T;
    } catch (error) {
      this.handleError('delete', error, { id });
      throw error;
    }
  }

  /**
   * Count records matching criteria
   */
  async count(where: any = {}): Promise<number> {
    try {
      // @ts-ignore - Dynamic model access
      const count = await this.prisma[this.modelName].count({
        where,
      });
      return count;
    } catch (error) {
      this.handleError('count', error, { where });
      throw error;
    }
  }

  /**
   * Check if record exists
   */
  async exists(where: any): Promise<boolean> {
    try {
      const count = await this.count(where);
      return count > 0;
    } catch (error) {
      this.handleError('exists', error, { where });
      throw error;
    }
  }

  /**
   * Execute multiple operations in a transaction
   */
  async transaction<R>(
    operations: (tx: any) => Promise<R>
  ): Promise<R> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        return await operations(tx);
      });
    } catch (error) {
      this.handleError('transaction', error, {});
      throw error;
    }
  }

  /**
   * Handle errors with consistent logging
   */
  protected handleError(operation: string, error: unknown, context: any): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(`[${this.modelName}Repository] ${operation} failed:`, {
      error: errorMessage,
      context,
      timestamp: new Date().toISOString(),
    });

    // In production, send to error tracking (Sentry)
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, { extra: { operation, context } });
    // }
  }

  /**
   * Paginate results
   */
  async paginate(
    where: any = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * pageSize;

      const [data, total] = await Promise.all([
        this.findMany(where, { skip, take: pageSize }),
        this.count(where),
      ]);

      return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      this.handleError('paginate', error, { where, page, pageSize });
      throw error;
    }
  }
}
