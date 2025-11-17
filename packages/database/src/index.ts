/**
 * @file index.ts
 * @description Database package entry point - exports Prisma client and repositories
 * @module @grc/database
 * @architecture Section 8 - Data Architecture (architecture/05_data_and_apis.md)
 *
 * Dependencies:
 * - @prisma/client: ORM for PostgreSQL (Neon)
 *
 * Exports:
 * - prisma: Singleton Prisma client instance
 * - All Prisma types and enums
 * - Repository classes for data access layer
 */

import { PrismaClient } from '@prisma/client';

// ============================================================================
// PRISMA CLIENT SINGLETON
// ============================================================================

/**
 * Global Prisma client singleton
 * Prevents multiple instances in development (hot reload)
 *
 * Architecture Reference: Section 8.1 - Database Layer
 * Quote: "Use Prisma ORM with connection pooling for production efficiency"
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ============================================================================
// EXPORTS
// ============================================================================

// Re-export all Prisma types and enums
export * from '@prisma/client';

// Export repositories (to be created)
export * from './repositories';
