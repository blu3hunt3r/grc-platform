/**
 * @file lib/auth/types.ts
 * @description TypeScript types for authentication
 * @architecture SYSTEM_PROMPT.md "Hybrid Architecture: Clerk (Auth) + Supabase (DB)"
 *
 * Purpose:
 * - Centralize auth-related types
 * - Provide type safety for auth operations
 * - Export common auth interfaces
 *
 * Dependencies:
 * - @clerk/nextjs: Clerk types
 * - @grc/database: Database user type
 */

import type { User as ClerkUser } from '@clerk/nextjs/server';
import type { User as DbUser } from '@grc/database';

/**
 * Session user combining Clerk and database user data
 * Used when both auth provider data and database data are needed
 */
export interface SessionUser {
  /** Clerk user object (for UI display, metadata) */
  clerkUser: ClerkUser;

  /** Database user object (for data queries, relations) */
  dbUser: DbUser & {
    companies: Array<{
      id: string;
      name: string;
      createdById: string;
    }>;
  };
}

/**
 * Auth error types for consistent error handling
 */
export type AuthError =
  | 'UNAUTHORIZED'           // No valid session
  | 'USER_NOT_FOUND'         // User not in database
  | 'FORBIDDEN'              // User lacks permission
  | 'INVALID_SESSION';       // Session invalid or expired

/**
 * Auth error class for standardized error handling
 */
export class AuthenticationError extends Error {
  constructor(
    public type: AuthError,
    message: string
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}
