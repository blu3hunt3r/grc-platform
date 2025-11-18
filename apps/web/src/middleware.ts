/**
 * @file middleware.ts
 * @description Clerk authentication middleware for route protection
 * @architecture SYSTEM_PROMPT.md "Hybrid Architecture: Clerk (Auth) + Supabase (DB)"
 *
 * Architecture Reference: SYSTEM_PROMPT.md Lines 70-76
 * Quote: "Hybrid Architecture: Clerk (Auth) + Supabase (Data Layer)
 *         - Authentication: Clerk with OAuth providers
 *         - Authorization: Multi-tenant via companyId in Supabase"
 *
 * Purpose:
 * - Protect authenticated routes (dashboard, api)
 * - Allow public access to landing page, sign-in, sign-up
 * - Redirect unauthenticated users to sign-in
 * - Redirect authenticated users away from auth pages
 *
 * Protected Routes:
 * - /dashboard/*: Main application
 * - /api/*: API endpoints (except webhooks)
 *
 * Public Routes:
 * - /: Landing page
 * - /sign-in: Sign-in page
 * - /sign-up: Sign-up page
 * - /api/webhooks/*: Webhook endpoints (no auth required)
 *
 * Dependencies:
 * - @clerk/nextjs: Clerk middleware for Next.js
 *
 * Related components:
 * - Sign-in page (apps/web/src/app/(auth)/sign-in)
 * - Sign-up page (apps/web/src/app/(auth)/sign-up)
 * - Dashboard layout (apps/web/src/app/dashboard)
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// ============================================================================
// ROUTE MATCHERS
// ============================================================================

/**
 * Public routes that don't require authentication
 * Users can access these whether logged in or not
 */
const isPublicRoute = createRouteMatcher([
  '/',              // Landing page
  '/sign-in(.*)',   // Sign-in and nested routes
  '/sign-up(.*)',   // Sign-up and nested routes
  '/api/webhooks(.*)', // Webhook endpoints (verified via signatures)
]);

/**
 * Authentication routes (sign-in, sign-up)
 * Authenticated users should be redirected away from these
 */
const isAuthRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  // ============================================================================
  // RULE 1: Public routes are always accessible
  // ============================================================================
  if (isPublicRoute(req)) {
    // For auth pages, redirect if already logged in
    if (userId && isAuthRoute(req)) {
      const dashboardUrl = new URL('/dashboard', req.url);
      return Response.redirect(dashboardUrl);
    }
    return; // Allow access
  }

  // ============================================================================
  // RULE 2: Protected routes require authentication
  // ============================================================================
  if (!userId) {
    // User is not authenticated, redirect to sign-in
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return Response.redirect(signInUrl);
  }

  // ============================================================================
  // RULE 3: Authenticated - allow access to protected routes
  // ============================================================================
  return; // User is authenticated, proceed
});

// ============================================================================
// MIDDLEWARE MATCHER CONFIGURATION
// ============================================================================

/**
 * Configure which routes this middleware runs on
 *
 * Includes:
 * - All routes starting with /dashboard
 * - All API routes (except static files)
 * - Root path /
 * - Auth routes (sign-in, sign-up)
 *
 * Excludes:
 * - Static files (_next/static)
 * - Images (_next/image)
 * - Favicon and other public files
 */
export const config = {
  matcher: [
    // Include all routes except static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
