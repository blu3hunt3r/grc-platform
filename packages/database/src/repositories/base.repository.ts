/**
 * @file base.repository.ts
 * @description Base repository class for common CRUD operations
 * @module @grc/database/repositories
 * @architecture SYSTEM_PROMPT.md "Repository Pattern"
 *
 * Purpose:
 * - Provide common CRUD methods for all repositories
 * - Reduce code duplication
 * - Type-safe database operations
 *
 * Usage:
 * ```typescript
 * export class UserRepository extends BaseRepository<User> {
 *   constructor(prisma: PrismaClient) {
 *     super(prisma, 'user');
 *   }
 * }
 * ```
 */

import { PrismaClient } from '@prisma/client';

export abstract class BaseRepository<T> {
  constructor(
    protected readonly prisma: PrismaClient | any,
    protected readonly modelName: string
  ) {}

  /**
   * Find a record by ID
   */
  async findById(id: string): Promise<T | null> {
    return await (this.prisma[this.modelName] as any).findUnique({
      where: { id },
    });
  }

  /**
   * Find all records with optional filters
   */
  async findMany(where: any = {}): Promise<T[]> {
    return await (this.prisma[this.modelName] as any).findMany({
      where,
    });
  }

  /**
   * Create a new record
   */
  async create(data: any): Promise<T> {
    return await (this.prisma[this.modelName] as any).create({
      data,
    });
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: any): Promise<T> {
    return await (this.prisma[this.modelName] as any).update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<T> {
    return await (this.prisma[this.modelName] as any).delete({
      where: { id },
    });
  }

  /**
   * Count records with optional filters
   */
  async count(where: any = {}): Promise<number> {
    return await (this.prisma[this.modelName] as any).count({
      where,
    });
  }

  /**
   * Handle and log errors
   */
  protected handleError(operation: string, error: any, context?: any): void {
    console.error(`[${this.modelName}Repository] ${operation} failed:`, {
      error: error instanceof Error ? error.message : error,
      context,
      timestamp: new Date().toISOString(),
    });
  }
}
