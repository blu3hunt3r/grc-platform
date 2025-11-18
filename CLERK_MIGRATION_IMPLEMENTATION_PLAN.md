# Clerk + Supabase Hybrid Implementation Plan

**Date:** November 18, 2025
**Architecture:** Clerk (Authentication) + Supabase (Database/Storage/Realtime)
**Status:** In Progress - Auth Conflict Resolution Required

---

## Executive Summary

This document outlines the complete implementation plan to migrate from the broken dual-auth system (Clerk UI + Supabase Auth backend) to a clean Clerk + Supabase hybrid architecture where:
- **Clerk** handles ALL authentication (UI, sessions, API protection)
- **Supabase** provides database, storage, and realtime ONLY (no auth)

---

## Current State Analysis

### ✅ What's Correctly Implemented

1. **Database Schema**
   - `users` table has `clerkId` field (not `authId`)
   - All foreign keys and indexes correct
   - Prisma client generated with correct types

2. **Repository Layer**
   - `UserRepository` with `createFromClerk()`, `findByClerkId()`, `syncFromClerk()`
   - `CompanyRepository` with `createDefaultCompany()`, `isOwner()`
   - Properly exported from `@grc/database`

3. **Webhook Handler**
   - `/api/webhooks/clerk/route.ts` handles user lifecycle
   - Atomic transactions for user+company creation
   - Svix signature verification

4. **Authentication UI**
   - Sign-in page uses `<SignIn />` from Clerk
   - Sign-up page uses `<SignUp />` from Clerk
   - Middleware uses `clerkMiddleware`
   - Root layout wraps with `<ClerkProvider>`

5. **Package Configuration**
   - `@clerk/nextjs` installed
   - `svix` installed for webhooks
   - `@supabase/supabase-js` kept (for DB/Storage/Realtime)

### ❌ Critical Issues

1. **Auth System Conflict**
   - 21+ files use Supabase Auth helpers (`requireAuth`, `getCurrentUser`)
   - API routes check for Supabase session (doesn't exist)
   - Dashboard pages check for Supabase user (doesn't exist)
   - Users can sign in (Clerk) but can't access app (Supabase auth check fails)

2. **Orphaned Supabase Auth Files**
   - `apps/web/src/lib/supabase/server.ts` - Auth helpers
   - `apps/web/src/lib/supabase/middleware.ts` - Session management
   - `apps/web/src/app/auth/callback/route.ts` - OAuth callback

3. **Missing Clerk Auth Helpers**
   - No centralized auth helper for API routes
   - No helper to get database user from Clerk session
   - Inconsistent auth patterns across files

---

## Implementation Plan

### Phase 1: Create Clerk Auth Helpers ⏱️ 30 min

**Goal:** Create centralized auth utilities for API routes and server components

**Files to Create:**
1. `apps/web/src/lib/auth/server.ts` - Clerk auth helpers
2. `apps/web/src/lib/auth/types.ts` - TypeScript types

**Deliverables:**
- `requireAuth()` - Get Clerk userId or throw 401
- `getCurrentUser()` - Get Clerk user object
- `getCurrentDbUser()` - Get database user by clerkId
- `getSessionUser()` - Get both Clerk + DB user
- Proper error handling and logging

---

### Phase 2: Remove Supabase Auth Files ⏱️ 10 min

**Goal:** Delete all Supabase authentication code (keep DB/Storage/Realtime)

**Files to Delete:**
1. `apps/web/src/lib/supabase/server.ts` - Auth helpers
2. `apps/web/src/lib/supabase/middleware.ts` - Session update
3. `apps/web/src/app/auth/callback/route.ts` - OAuth callback

**Files to Keep:**
- `apps/web/src/lib/supabase/client.ts` - For Realtime subscriptions and Storage
- All Supabase database packages

**Verification:**
```bash
grep -r "supabase.auth" apps/web/src
# Should return 0 results (no auth usage)
```

---

### Phase 3: Update API Routes (21+ files) ⏱️ 2-3 hours

**Goal:** Replace Supabase auth with Clerk auth in all API routes

**Pattern to Apply:**

**OLD (Supabase Auth):**
```typescript
import { requireAuth } from "@/lib/supabase/server";

export async function GET() {
  const user = await requireAuth(); // ❌ Supabase session
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id } // ❌ Wrong field
  });
}
```

**NEW (Clerk Auth):**
```typescript
import { requireAuth, getCurrentDbUser } from "@/lib/auth/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const dbUser = await getCurrentDbUser(); // ✅ Clerk → DB lookup

    // Use dbUser.id, dbUser.companies, etc.

  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
```

**Files to Update:**

**API Routes (6 files):**
1. `apps/web/src/app/api/companies/route.ts` (GET, POST)
2. `apps/web/src/app/api/audits/route.ts` (GET, POST)
3. `apps/web/src/app/api/audits/[id]/route.ts` (GET, PATCH, DELETE)
4. `apps/web/src/app/api/audits/[id]/agent-executions/route.ts`
5. `apps/web/src/app/api/audits/[id]/evidence/route.ts`
6. `apps/web/src/app/api/audits/[id]/findings/route.ts`

**Additional Routes (if they exist):**
- Check for other API routes in `apps/web/src/app/api/`

---

### Phase 4: Update Dashboard Pages ⏱️ 1 hour

**Goal:** Replace Supabase auth with Clerk auth in dashboard pages

**Pattern to Apply:**

**OLD (Supabase Auth):**
```typescript
import { getCurrentUser } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const user = await getCurrentUser(); // ❌ Supabase user
  const firstName = user?.user_metadata?.firstName || "there";
}
```

**NEW (Clerk Auth):**
```typescript
import { currentUser } from "@clerk/nextjs/server";
import { getCurrentDbUser } from "@/lib/auth/server";

export default async function DashboardPage() {
  const clerkUser = await currentUser(); // ✅ Clerk user (for UI)
  const dbUser = await getCurrentDbUser(); // ✅ DB user (for data)

  const firstName = clerkUser?.firstName || dbUser.firstName || "there";
}
```

**Files to Update:**
1. `apps/web/src/app/dashboard/page.tsx`
2. `apps/web/src/app/dashboard/companies/page.tsx` (if exists)
3. `apps/web/src/app/dashboard/audits/page.tsx` (if exists)
4. `apps/web/src/app/dashboard/audits/[id]/page.tsx` (if exists)

---

### Phase 5: Update Component Files ⏱️ 30 min

**Goal:** Update any components using Supabase auth

**Search for Usage:**
```bash
grep -r "requireAuth\|getCurrentUser" apps/web/src/components
grep -r "supabase.auth" apps/web/src/components
```

**Files to Update:**
- Any components that import from `@/lib/supabase/server`
- Any components checking auth state

---

### Phase 6: Environment Variables ⏱️ 5 min

**Goal:** Add real Clerk webhook secret

**File:** `apps/web/.env.local`

**Action:**
1. Go to [Clerk Dashboard → Webhooks](https://dashboard.clerk.com)
2. Create webhook endpoint: `https://your-domain/api/webhooks/clerk`
3. Enable events: `user.created`, `user.updated`, `user.deleted`
4. Copy **Signing Secret**
5. Update `.env.local`:
```env
CLERK_WEBHOOK_SECRET=whsec_actual_secret_here  # Not placeholder
```

---

### Phase 7: Testing & Validation ⏱️ 1 hour

**Goal:** Verify end-to-end user flow works

**Test Cases:**

**1. User Signup Flow**
- [ ] User can access `/sign-up`
- [ ] User can sign up with email/password
- [ ] User can sign up with Google OAuth
- [ ] Webhook fires and creates user + company in DB
- [ ] User redirected to `/dashboard`
- [ ] Dashboard loads without errors

**2. User Login Flow**
- [ ] User can access `/sign-in`
- [ ] User can sign in with credentials
- [ ] User redirected to `/dashboard`
- [ ] Dashboard shows user's name and companies

**3. API Route Protection**
- [ ] GET `/api/companies` returns user's companies
- [ ] POST `/api/companies` creates new company
- [ ] GET `/api/audits` returns user's audits
- [ ] Unauthenticated requests return 401

**4. Route Protection**
- [ ] Unauthenticated user can't access `/dashboard`
- [ ] Unauthenticated user redirected to `/sign-in`
- [ ] Authenticated user can't access `/sign-in` (redirects to `/dashboard`)

**5. Database Integration**
- [ ] User record created with `clerkId`
- [ ] Company record created and linked to user
- [ ] User can query their data via API
- [ ] Multi-tenant isolation works (users only see their data)

---

## Implementation Checklist

### Phase 1: Create Clerk Auth Helpers
- [ ] Create `apps/web/src/lib/auth/server.ts`
- [ ] Create `apps/web/src/lib/auth/types.ts`
- [ ] Export `requireAuth()` function
- [ ] Export `getCurrentUser()` function
- [ ] Export `getCurrentDbUser()` function
- [ ] Export `getSessionUser()` function
- [ ] Add proper error handling
- [ ] Add logging for debugging

### Phase 2: Remove Supabase Auth Files
- [ ] Delete `apps/web/src/lib/supabase/server.ts`
- [ ] Delete `apps/web/src/lib/supabase/middleware.ts`
- [ ] Delete `apps/web/src/app/auth/callback/route.ts`
- [ ] Verify `apps/web/src/lib/supabase/client.ts` remains (for DB/Storage)
- [ ] Run `grep -r "supabase.auth" apps/web/src` (should be 0 results)

### Phase 3: Update API Routes
- [ ] Update `apps/web/src/app/api/companies/route.ts` (GET)
- [ ] Update `apps/web/src/app/api/companies/route.ts` (POST)
- [ ] Update `apps/web/src/app/api/audits/route.ts` (GET)
- [ ] Update `apps/web/src/app/api/audits/route.ts` (POST)
- [ ] Update `apps/web/src/app/api/audits/[id]/route.ts` (GET)
- [ ] Update `apps/web/src/app/api/audits/[id]/route.ts` (PATCH)
- [ ] Update `apps/web/src/app/api/audits/[id]/route.ts` (DELETE)
- [ ] Update other API routes (find with grep)
- [ ] Verify all imports changed from `@/lib/supabase/server` → `@/lib/auth/server`
- [ ] Verify all `user.id` changed to `dbUser.clerkId` or `dbUser.id`

### Phase 4: Update Dashboard Pages
- [ ] Update `apps/web/src/app/dashboard/page.tsx`
- [ ] Update `apps/web/src/app/dashboard/companies/page.tsx`
- [ ] Update `apps/web/src/app/dashboard/audits/page.tsx`
- [ ] Update `apps/web/src/app/dashboard/audits/[id]/page.tsx`
- [ ] Verify Clerk user object used for UI display
- [ ] Verify DB user object used for data queries

### Phase 5: Update Components
- [ ] Search for components using Supabase auth
- [ ] Update to use Clerk auth hooks (`useUser()`, `useAuth()`)
- [ ] Verify no client-side Supabase auth usage

### Phase 6: Environment Variables
- [ ] Create Clerk webhook in dashboard
- [ ] Copy webhook signing secret
- [ ] Update `CLERK_WEBHOOK_SECRET` in `.env.local`
- [ ] Verify all required env vars present

### Phase 7: Testing & Validation
- [ ] Test user signup with email/password
- [ ] Test user signup with Google OAuth
- [ ] Test webhook creates user + company
- [ ] Test user login flow
- [ ] Test dashboard loads correctly
- [ ] Test API route protection
- [ ] Test unauthenticated access blocked
- [ ] Test multi-tenant data isolation
- [ ] Run database tests: `pnpm test`
- [ ] Run build: `pnpm build`

---

## Success Criteria

**The implementation is complete when:**

1. ✅ All 21+ files use Clerk auth (not Supabase auth)
2. ✅ No Supabase auth code remains (`grep -r "supabase.auth"` = 0 results)
3. ✅ User can sign up and land on dashboard
4. ✅ Dashboard shows user data correctly
5. ✅ API routes return user's data correctly
6. ✅ Unauthenticated requests properly blocked
7. ✅ Database tests pass (133/133)
8. ✅ Application builds without errors
9. ✅ Webhook secret configured (not placeholder)

---

## Rollback Plan

If critical issues arise:

1. **Revert Commits:**
```bash
git log --oneline -20  # Find commit before migration
git revert <commit-hash>
```

2. **Restore Supabase Auth:**
```bash
git checkout HEAD~1 -- apps/web/src/lib/supabase/server.ts
git checkout HEAD~1 -- apps/web/src/lib/supabase/middleware.ts
pnpm add @supabase/auth-ui-react @supabase/auth-ui-shared
```

3. **Redeploy Previous Version:**
```bash
vercel rollback
```

---

## Timeline Estimate

| Phase | Duration | Complexity |
|-------|----------|------------|
| Phase 1: Create Auth Helpers | 30 min | Medium |
| Phase 2: Remove Supabase Auth | 10 min | Low |
| Phase 3: Update API Routes | 2-3 hours | High |
| Phase 4: Update Dashboard Pages | 1 hour | Medium |
| Phase 5: Update Components | 30 min | Low |
| Phase 6: Environment Variables | 5 min | Low |
| Phase 7: Testing | 1 hour | Medium |
| **TOTAL** | **5-6 hours** | **High** |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking API routes | High | Critical | Test each route after update |
| Missing auth checks | Medium | High | Grep for all auth usage before/after |
| Webhook secret misconfigured | Low | High | Test webhook locally with ngrok |
| Database connection issues | Low | Critical | Already verified connection works |
| Type errors after migration | Medium | Medium | TypeScript will catch at build time |

---

## Post-Implementation Tasks

After successful migration:

1. **Update Documentation**
   - Update README with new auth flow
   - Update API documentation
   - Update developer onboarding guide

2. **Monitor Production**
   - Check Clerk webhook logs
   - Monitor API error rates
   - Check user signup success rate

3. **Cleanup**
   - Remove this plan document
   - Archive old migration documents
   - Update architecture diagrams

---

## Notes

- This plan follows SYSTEM_PROMPT.md best practices (no placeholders, complete implementations, 80% test coverage)
- All code will include proper error handling and logging
- All functions will have complete TypeScript types
- All files will have proper documentation headers
- No TODOs or FIXMEs allowed (complete implementations only)

---

**Plan Created:** November 18, 2025
**Plan Status:** Ready for Execution
**Next Action:** Execute Phase 1 - Create Clerk Auth Helpers
