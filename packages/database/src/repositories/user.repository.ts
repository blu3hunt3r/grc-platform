/**
 * @file user.repository.ts
 * @description Repository for User data access operations
 * @module @grc/database/repositories
 * @architecture SYSTEM_PROMPT.md "Pattern 3: Agent-to-Database via Repository Pattern"
 *
 * Architecture Reference: SYSTEM_PROMPT.md Lines 239-244
 * Quote: "Pattern 3: Agent-to-Database via Repository Pattern
 *         Abstracts database operations from business logic"
 *
 * Purpose:
 * - Centralized user data operations
 * - Supports Clerk + Supabase hybrid authentication
 * - Handles user creation from Clerk webhooks
 * - Provides type-safe user queries
 *
 * Dependencies:
 * - @prisma/client: Database ORM
 * - BaseRepository: Common CRUD operations
 *
 * Related components:
 * - Clerk webhook for user creation
 * - Authentication flows
 * - User management features
 */

import { PrismaClient, User, UserRole, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Input for creating a new user (from Clerk webhook)
 */
export interface CreateUserInput {
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  role?: UserRole;
}

/**
 * Input for updating user profile
 */
export interface UpdateUserInput {
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  role?: UserRole;
}

/**
 * Filters for querying users
 */
export interface UserFilters {
  role?: UserRole;
  email?: string;
  search?: string; // Search in name or email
}

// ============================================================================
// REPOSITORY CLASS
// ============================================================================

export class UserRepository extends BaseRepository<User> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'user');
  }

  // ============================================================================
  // CREATE OPERATIONS
  // ============================================================================

  /**
   * Create a new user from Clerk data
   * Called from Clerk webhook on user.created event
   *
   * @param input - User data from Clerk
   * @returns Created user record
   * @throws Error if clerkId or email already exists
   *
   * Architecture: Part of Clerk + Supabase hybrid auth flow
   * 1. User signs up via Clerk
   * 2. Clerk webhook fires
   * 3. This method creates user in Supabase
   * 4. User is ready for authorization checks
   */
  async createFromClerk(input: CreateUserInput): Promise<User> {
    try {
      // Check if user already exists
      const existing = await this.findByClerkId(input.clerkId);
      if (existing) {
        console.warn(`[UserRepository] User already exists with clerkId: ${input.clerkId}`);
        return existing;
      }

      // Create user record
      const user = await this.prisma.user.create({
        data: {
          clerkId: input.clerkId,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          imageUrl: input.imageUrl,
          role: input.role ?? UserRole.USER,
        },
      });

      console.log(`[UserRepository] Created user: ${user.id} (${user.email})`);
      return user;
    } catch (error) {
      this.handleError('createFromClerk', error, { input });
      throw error;
    }
  }

  // ============================================================================
  // QUERY OPERATIONS
  // ============================================================================

  /**
   * Find user by Clerk ID
   * Primary lookup method for authenticated requests
   *
   * @param clerkId - Clerk user ID from auth()
   * @returns User record or null
   */
  async findByClerkId(clerkId: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { clerkId },
        include: {
          companies: true,
        },
      });
      return user;
    } catch (error) {
      this.handleError('findByClerkId', error, { clerkId });
      throw error;
    }
  }

  /**
   * Find user by email
   * Used for lookups and duplicate checks
   *
   * @param email - User email address
   * @returns User record or null
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      return user;
    } catch (error) {
      this.handleError('findByEmail', error, { email });
      throw error;
    }
  }

  /**
   * Find users with filters
   * Supports role filtering and search
   *
   * @param filters - Query filters
   * @returns Array of matching users
   */
  async findWithFilters(filters: UserFilters): Promise<User[]> {
    try {
      const where: Prisma.UserWhereInput = {};

      if (filters.role) {
        where.role = filters.role;
      }

      if (filters.email) {
        where.email = filters.email;
      }

      if (filters.search) {
        where.OR = [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const users = await this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return users;
    } catch (error) {
      this.handleError('findWithFilters', error, { filters });
      throw error;
    }
  }

  // ============================================================================
  // UPDATE OPERATIONS
  // ============================================================================

  /**
   * Update user profile
   * Called from profile settings or admin panel
   *
   * @param userId - User UUID
   * @param input - Fields to update
   * @returns Updated user record
   */
  async updateProfile(userId: string, input: UpdateUserInput): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: input,
      });

      console.log(`[UserRepository] Updated user: ${user.id}`);
      return user;
    } catch (error) {
      this.handleError('updateProfile', error, { userId, input });
      throw error;
    }
  }

  /**
   * Update user role
   * Admin-only operation for role management
   *
   * @param userId - User UUID
   * @param role - New role
   * @returns Updated user record
   */
  async updateRole(userId: string, role: UserRole): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { role },
      });

      console.log(`[UserRepository] Updated user role: ${user.id} -> ${role}`);
      return user;
    } catch (error) {
      this.handleError('updateRole', error, { userId, role });
      throw error;
    }
  }

  /**
   * Sync user data from Clerk
   * Called from Clerk webhook on user.updated event
   *
   * @param clerkId - Clerk user ID
   * @param input - Updated user data
   * @returns Updated user record
   */
  async syncFromClerk(clerkId: string, input: UpdateUserInput): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { clerkId },
        data: input,
      });

      console.log(`[UserRepository] Synced user from Clerk: ${user.id}`);
      return user;
    } catch (error) {
      this.handleError('syncFromClerk', error, { clerkId, input });
      throw error;
    }
  }

  // ============================================================================
  // DELETE OPERATIONS
  // ============================================================================

  /**
   * Delete user (hard delete)
   * Called from Clerk webhook on user.deleted event
   *
   * WARNING: This permanently deletes the user and all related data
   * Consider implementing soft delete instead
   *
   * @param clerkId - Clerk user ID
   * @returns Deleted user record
   */
  async deleteByClerkId(clerkId: string): Promise<User> {
    try {
      const user = await this.prisma.user.delete({
        where: { clerkId },
      });

      console.warn(`[UserRepository] Deleted user: ${user.id} (${user.email})`);
      return user;
    } catch (error) {
      this.handleError('deleteByClerkId', error, { clerkId });
      throw error;
    }
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  /**
   * Get user statistics by role
   * Used for admin dashboard analytics
   *
   * @returns User counts by role
   */
  async getUserStats(): Promise<{ role: UserRole; count: number }[]> {
    try {
      const stats = await this.prisma.user.groupBy({
        by: ['role'],
        _count: {
          role: true,
        },
      });

      return stats.map((stat: any) => ({
        role: stat.role,
        count: stat._count.role,
      }));
    } catch (error) {
      this.handleError('getUserStats', error, {});
      throw error;
    }
  }

  /**
   * Get total user count
   *
   * @returns Total number of users
   */
  async getTotalUsers(): Promise<number> {
    try {
      return await this.count();
    } catch (error) {
      this.handleError('getTotalUsers', error, {});
      throw error;
    }
  }
}
