/**
 * @file lib/auth/server.ts
 * @description Clerk authentication helpers for server components and API routes
 * @architecture SYSTEM_PROMPT.md "Hybrid Architecture: Clerk (Auth) + Supabase (DB)"
 *
 * Architecture Reference: SYSTEM_PROMPT.md Lines 70-76
 * Quote: "Hybrid Architecture: Clerk (Auth) + Supabase (Data Layer)
 *         - Authentication: Clerk with OAuth providers
 *         - Authorization: Multi-tenant via companyId in Supabase"
 *
 * Purpose:
 * - Centralize all auth operations for API routes and server components
 * - Provide consistent auth patterns across the application
 * - Bridge Clerk authentication with Supabase database
 * - Handle errors uniformly
 *
 * Usage:
 * ```typescript
 * // In API routes
 * import { requireAuth, getCurrentDbUser } from "@/lib/auth/server";
 *
 * export async function GET() {
 *   const userId = await requireAuth(); // Throws 401 if not authenticated
 *   const dbUser = await getCurrentDbUser(); // Gets database user
 * }
 * ```
 *
 * Dependencies:
 * - @clerk/nextjs/server: Clerk auth functions
 * - @grc/database: Database access
 *
 * Related components:
 * - API routes (apps/web/src/app/api)
 * - Dashboard pages (apps/web/src/app/dashboard)
 * - Clerk webhook (apps/web/src/app/api/webhooks/clerk)
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@grc/database';
import { AuthenticationError, type SessionUser } from './types';

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Get Clerk user ID from current session
 * Throws AuthenticationError if not authenticated
 *
 * @returns Clerk userId (user_xxx format)
 * @throws AuthenticationError if no valid session
 *
 * @example
 * ```typescript
 * export async function GET() {
 *   try {
 *     const userId = await requireAuth();
 *     // User is authenticated, proceed with operation
 *   } catch (error) {
 *     if (error instanceof AuthenticationError) {
 *       return NextResponse.json({ error: error.message }, { status: 401 });
 *     }
 *     throw error;
 *   }
 * }
 * ```
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    console.warn('[Auth] Unauthorized access attempt detected');
    throw new AuthenticationError(
      'UNAUTHORIZED',
      'Authentication required. Please sign in.'
    );
  }

  return userId;
}

/**
 * Get current Clerk user object
 * Contains user metadata from Clerk (name, email, avatar, etc.)
 *
 * @returns Clerk User object
 * @throws AuthenticationError if not authenticated
 *
 * @example
 * ```typescript
 * export default async function DashboardPage() {
 *   const clerkUser = await getCurrentUser();
 *   return <h1>Welcome, {clerkUser.firstName}!</h1>;
 * }
 * ```
 */
export async function getCurrentUser() {
  const user = await currentUser();

  if (!user) {
    console.warn('[Auth] No current user found in session');
    throw new AuthenticationError(
      'UNAUTHORIZED',
      'Authentication required. Please sign in.'
    );
  }

  return user;
}

/**
 * Get current database user by looking up Clerk ID
 * Contains user data from Supabase (database ID, role, companies, etc.)
 *
 * @returns Database User object with companies relation
 * @throws AuthenticationError if not authenticated or user not in database
 *
 * @example
 * ```typescript
 * export async function GET() {
 *   const dbUser = await getCurrentDbUser();
 *   const companyIds = dbUser.companies.map(c => c.id);
 *   // Query data for user's companies
 * }
 * ```
 */
export async function getCurrentDbUser() {
  // First, ensure user is authenticated
  const userId = await requireAuth();

  // Look up user in database by clerkId
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      companies: {
        where: { deletedAt: null }, // Exclude soft-deleted companies
        select: {
          id: true,
          name: true,
          createdById: true,
          createdAt: true,
        },
      },
    },
  });

  if (!dbUser) {
    console.error(`[Auth] User not found in database: clerkId=${userId}`);
    throw new AuthenticationError(
      'USER_NOT_FOUND',
      'User account not found. Please contact support.'
    );
  }

  return dbUser;
}

/**
 * Get both Clerk user and database user in single call
 * Optimized for pages that need both auth provider data and database data
 *
 * @returns Object with clerkUser and dbUser
 * @throws AuthenticationError if not authenticated or user not in database
 *
 * @example
 * ```typescript
 * export default async function ProfilePage() {
 *   const { clerkUser, dbUser } = await getSessionUser();
 *
 *   return (
 *     <div>
 *       <img src={clerkUser.imageUrl} alt="Avatar" />
 *       <h1>{clerkUser.firstName} {clerkUser.lastName}</h1>
 *       <p>Role: {dbUser.role}</p>
 *       <p>Companies: {dbUser.companies.length}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export async function getSessionUser(): Promise<SessionUser> {
  // Get userId first (throws if not authenticated)
  const userId = await requireAuth();

  // Fetch both Clerk user and database user in parallel
  const [clerkUser, dbUser] = await Promise.all([
    currentUser(),
    prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        companies: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            createdById: true,
          },
        },
      },
    }),
  ]);

  // Validate both users exist
  if (!clerkUser) {
    throw new AuthenticationError(
      'INVALID_SESSION',
      'Session invalid. Please sign in again.'
    );
  }

  if (!dbUser) {
    console.error(`[Auth] User not found in database: clerkId=${userId}`);
    throw new AuthenticationError(
      'USER_NOT_FOUND',
      'User account not found. Please contact support.'
    );
  }

  return { clerkUser, dbUser };
}

// ============================================================================
// AUTHORIZATION FUNCTIONS
// ============================================================================

/**
 * Check if current user owns a specific company
 * Used for authorization checks before allowing company-level operations
 *
 * @param companyId - Company UUID to check ownership
 * @returns true if user owns company, false otherwise
 * @throws AuthenticationError if not authenticated
 *
 * @example
 * ```typescript
 * export async function DELETE(req: Request, { params }: { params: { id: string } }) {
 *   const isOwner = await userOwnsCompany(params.id);
 *
 *   if (!isOwner) {
 *     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 *   }
 *
 *   // Proceed with deletion
 * }
 * ```
 */
export async function userOwnsCompany(companyId: string): Promise<boolean> {
  const dbUser = await getCurrentDbUser();

  // Check if company is in user's companies list
  const ownsCompany = dbUser.companies.some((c) => c.id === companyId);

  if (!ownsCompany) {
    console.warn(
      `[Auth] Unauthorized company access attempt: userId=${dbUser.id}, companyId=${companyId}`
    );
  }

  return ownsCompany;
}

/**
 * Require user to own a specific company or throw 403
 * Convenience function for authorization checks
 *
 * @param companyId - Company UUID to check ownership
 * @throws AuthenticationError if not authenticated or not owner
 *
 * @example
 * ```typescript
 * export async function PATCH(req: Request, { params }: { params: { id: string } }) {
 *   await requireCompanyOwnership(params.id); // Throws if not owner
 *
 *   // User is owner, proceed with update
 * }
 * ```
 */
export async function requireCompanyOwnership(companyId: string): Promise<void> {
  const isOwner = await userOwnsCompany(companyId);

  if (!isOwner) {
    throw new AuthenticationError(
      'FORBIDDEN',
      'You do not have permission to access this company.'
    );
  }
}

/**
 * Check if current user has access to a specific audit
 * An audit is accessible if it belongs to one of the user's companies
 *
 * @param auditId - Audit UUID to check access
 * @returns true if user has access, false otherwise
 * @throws AuthenticationError if not authenticated
 *
 * @example
 * ```typescript
 * export async function GET(req: Request, { params }: { params: { id: string } }) {
 *   const hasAccess = await userHasAuditAccess(params.id);
 *
 *   if (!hasAccess) {
 *     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 *   }
 *
 *   // Fetch audit data
 * }
 * ```
 */
export async function userHasAuditAccess(auditId: string): Promise<boolean> {
  const dbUser = await getCurrentDbUser();

  // Get company IDs user has access to
  const companyIds = dbUser.companies.map((c) => c.id);

  // Check if audit belongs to one of user's companies
  const audit = await prisma.audit.findFirst({
    where: {
      id: auditId,
      companyId: { in: companyIds },
    },
    select: { id: true },
  });

  if (!audit) {
    console.warn(
      `[Auth] Unauthorized audit access attempt: userId=${dbUser.id}, auditId=${auditId}`
    );
    return false;
  }

  return true;
}

/**
 * Require user to have access to specific audit or throw 403
 * Convenience function for authorization checks
 *
 * @param auditId - Audit UUID to check access
 * @throws AuthenticationError if not authenticated or no access
 *
 * @example
 * ```typescript
 * export async function DELETE(req: Request, { params }: { params: { id: string } }) {
 *   await requireAuditAccess(params.id); // Throws if no access
 *
 *   // User has access, proceed with deletion
 * }
 * ```
 */
export async function requireAuditAccess(auditId: string): Promise<void> {
  const hasAccess = await userHasAuditAccess(auditId);

  if (!hasAccess) {
    throw new AuthenticationError(
      'FORBIDDEN',
      'You do not have permission to access this audit.'
    );
  }
}
