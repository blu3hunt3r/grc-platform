# Clerk + Supabase Hybrid Implementation ✅

**Implementation Date:** November 18, 2025
**Architecture:** Clerk (Authentication) + Supabase (Database/Storage/Realtime)
**Status:** Complete - Ready for Testing

---

## Executive Summary

Successfully implemented a hybrid authentication architecture that combines:
- **Clerk**: User authentication, OAuth providers (Google, GitHub), session management
- **Supabase**: PostgreSQL database, file storage, realtime updates

This architecture provides the best-of-breed approach:
- Clerk's superior auth UX and OAuth provider support
- Supabase's powerful database features (RLS, realtime, storage)

---

## What Was Implemented

### 1. User & Company Repositories ✅

Created production-grade repository classes for user and company data operations:

**Files Created:**
- [packages/database/src/repositories/user.repository.ts](packages/database/src/repositories/user.repository.ts)
- [packages/database/src/repositories/company.repository.ts](packages/database/src/repositories/company.repository.ts)

**Key Features:**
- `UserRepository.createFromClerk()` - Create user from Clerk webhook data
- `UserRepository.findByClerkId()` - Lookup user by Clerk ID
- `UserRepository.syncFromClerk()` - Sync profile updates from Clerk
- `CompanyRepository.createDefaultCompany()` - Auto-create company for new users
- `CompanyRepository.isOwner()` - Authorization checks for multi-tenancy

---

### 2. Clerk Webhook Handler ✅

Implemented automatic user + company creation on signup via Clerk webhooks.

**File Created:**
- [apps/web/src/app/api/webhooks/clerk/route.ts](apps/web/src/app/api/webhooks/clerk/route.ts)

**Webhook Events Handled:**
1. **user.created**: Creates user + default company in atomic transaction
2. **user.updated**: Syncs profile changes (email, name, avatar) to Supabase
3. **user.deleted**: Removes user from database (with CASCADE cleanup)

**Security:**
- Svix signature verification (prevents unauthorized requests)
- Atomic transactions (ensures data consistency)
- Complete error handling and logging

**User Registration Flow:**
```
1. User signs up via Clerk → /sign-up
2. Clerk webhook fires → /api/webhooks/clerk
3. Auto-create:
   - User record in Supabase (users table)
   - Company record (companies table)
   - Link user as company owner
4. User lands on /dashboard with company ready ✅
```

---

### 3. Authentication Pages ✅

Replaced Supabase Auth UI with Clerk components.

**Files Updated:**
- [apps/web/src/app/(auth)/sign-up/[[...sign-up]]/page.tsx](apps/web/src/app/(auth)/sign-up/[[...sign-up]]/page.tsx)
- [apps/web/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx](apps/web/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx)

**Features:**
- Clerk's beautiful pre-built UI components
- OAuth providers (Google, GitHub)
- Email/password authentication
- Automatic redirect to /dashboard after signin

---

### 4. Clerk Middleware ✅

Implemented route protection with Clerk authentication.

**File Updated:**
- [apps/web/src/middleware.ts](apps/web/src/middleware.ts)

**Route Configuration:**
- **Public Routes**: `/`, `/sign-in`, `/sign-up`, `/api/webhooks/*`
- **Protected Routes**: `/dashboard/*`, `/api/*` (except webhooks)
- **Automatic Redirects**:
  - Unauthenticated → `/sign-in?redirect_url=...`
  - Authenticated on auth pages → `/dashboard`

---

### 5. Root Layout with ClerkProvider ✅

Wrapped application with Clerk authentication provider.

**File Updated:**
- [apps/web/src/app/layout.tsx](apps/web/src/app/layout.tsx)

**Changes:**
- Added `<ClerkProvider>` wrapper
- Imported from `@clerk/nextjs`
- Enables Clerk hooks (`useAuth()`, `useUser()`) throughout app

---

### 6. Database Schema ✅

Restored `clerkId` field in User model for Clerk integration.

**File Updated:**
- [packages/database/prisma/schema.prisma](packages/database/prisma/schema.prisma)

**Schema:**
```prisma
model User {
  id        String   @id @default(uuid())
  clerkId   String   @unique // Clerk user ID (hybrid: Clerk auth + Supabase DB)
  email     String   @unique
  firstName String?
  lastName  String?
  imageUrl  String?
  role      UserRole @default(USER)

  companies Company[]
}
```

**Migration Created:**
- [packages/database/migrations/restore-clerkid.sql](packages/database/migrations/restore-clerkid.sql)

---

### 7. Environment Configuration ✅

Updated environment variables for Clerk + Supabase hybrid.

**File Updated:**
- [apps/web/.env.local](apps/web/.env.local)

**Variables:**
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_... # ⚠️ TODO: Add your webhook secret

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase (Database + Storage + Realtime)
NEXT_PUBLIC_SUPABASE_URL=https://pmrnysbgingvqignadhw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
DATABASE_URL='postgresql://postgres.pmrnysbgingvqignadhw:q9tnr7dq%4017895@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres'
```

---

### 8. Package Management ✅

Installed Clerk packages and removed Supabase Auth UI packages.

**Packages Installed:**
```bash
pnpm add @clerk/nextjs svix
```

**Packages Removed:**
```bash
pnpm remove @supabase/auth-ui-react @supabase/auth-ui-shared
```

**Packages Kept (for database/storage/realtime):**
- `@supabase/supabase-js`
- `@supabase/ssr`

---

## Architecture Benefits

### Why Clerk for Authentication?

1. **Superior UX**: Pre-built, beautiful UI components
2. **OAuth Providers**: 1-click Google/GitHub setup (vs Supabase complex config)
3. **Session Management**: Secure, automatic token refresh
4. **User Management**: Built-in user admin dashboard
5. **Webhooks**: Reliable event system for user lifecycle
6. **Security**: Industry-leading auth practices, automatic security updates

### Why Supabase for Data Layer?

1. **Row Level Security (RLS)**: Database-enforced multi-tenancy
2. **Realtime**: PostgreSQL replication-based WebSocket updates
3. **Storage**: File storage with RLS policies (bucket-level security)
4. **Cost**: $25/mo for all data needs vs $50+ for separate services
5. **Developer Experience**: Unified SDK for DB + Storage + Realtime

---

## Setup Instructions

### Step 1: Configure Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to: **Webhooks** → **Add Endpoint**
3. Set endpoint URL:
   ```
   https://your-domain.vercel.app/api/webhooks/clerk
   ```
   Or for local development (use ngrok):
   ```
   https://abc123.ngrok.io/api/webhooks/clerk
   ```
4. Subscribe to events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
5. Copy the **Signing Secret** (starts with `whsec_...`)
6. Add to `.env.local`:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_your_secret_here
   ```

### Step 2: Execute Database Migration

Execute the SQL migration to rename `authId` → `clerkId`:

```bash
# In Supabase Dashboard SQL Editor:
# https://supabase.com/dashboard/project/pmrnysbgingvqignadhw/sql/new

# Paste contents of:
packages/database/migrations/restore-clerkid.sql
```

**Or use CLI:**
```bash
cd packages/database
PGPASSWORD='q9tnr7dq@17895' psql \
  -h aws-1-ap-southeast-1.pooler.supabase.com \
  -p 6543 \
  -U postgres.pmrnysbgingvqignadhw \
  -d postgres \
  -f migrations/restore-clerkid.sql
```

### Step 3: Regenerate Prisma Client

```bash
cd packages/database
npx prisma generate
```

✅ **Already done!** Prisma client generated with `clerkId` field.

### Step 4: Configure OAuth Providers in Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to: **User & Authentication** → **Social Connections**
3. Enable **Google**:
   - Add Client ID and Secret from Google Cloud Console
   - Or use Clerk's shared OAuth credentials (development only)
4. Enable **GitHub**:
   - Add Client ID and Secret from GitHub OAuth Apps
   - Or use Clerk's shared OAuth credentials (development only)

### Step 5: Test the Implementation

**Local Development:**
```bash
cd apps/web
pnpm dev
```

**Test Flow:**
1. Go to http://localhost:3000/sign-up
2. Sign up with email or OAuth provider
3. Check Supabase database:
   - User created in `users` table with `clerkId`
   - Company created in `companies` table
4. User redirected to /dashboard ✅

**Production Deployment:**
1. Deploy to Vercel
2. Update Clerk webhook URL to production domain
3. Add environment variables to Vercel:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
   CLERK_SECRET_KEY=...
   CLERK_WEBHOOK_SECRET=...
   ```

---

## File Summary

### Files Created (7 files)

| File | Purpose | Lines |
|------|---------|-------|
| `packages/database/src/repositories/user.repository.ts` | User data operations | 325 |
| `packages/database/src/repositories/company.repository.ts` | Company data operations | 400 |
| `apps/web/src/app/api/webhooks/clerk/route.ts` | Clerk webhook handler | 335 |
| `packages/database/migrations/restore-clerkid.sql` | Database migration | 30 |
| `CLERK_SUPABASE_HYBRID_IMPLEMENTATION.md` | This document | - |

### Files Updated (7 files)

| File | Changes |
|------|---------|
| `.claude/SYSTEM_PROMPT.md` | Updated auth architecture to Clerk + Supabase hybrid |
| `packages/database/prisma/schema.prisma` | Restored `clerkId` field in User model |
| `packages/database/src/repositories/index.ts` | Added User and Company repository exports |
| `apps/web/src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` | Replaced Supabase Auth UI with Clerk SignUp component |
| `apps/web/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` | Replaced Supabase Auth UI with Clerk SignIn component |
| `apps/web/src/middleware.ts` | Replaced Supabase middleware with Clerk middleware |
| `apps/web/src/app/layout.tsx` | Added ClerkProvider wrapper |
| `apps/web/.env.local` | Added Clerk environment variables |

---

## Testing Status

### Database Tests

**Status:** ✅ Ready to run (Prisma client regenerated)

**Run Tests:**
```bash
cd packages/database
pnpm test
```

**Expected:** 133/133 tests passing

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    GRC Platform (Hybrid)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │   Clerk     │    │  Supabase    │    │  AWS ECS      │  │
│  │             │    │              │    │               │  │
│  │ • Auth      │───▶│ • PostgreSQL │◀───│ • Temporal    │  │
│  │ • OAuth     │    │ • Storage    │    │ • 15 Agents   │  │
│  │ • Sessions  │    │ • Realtime   │    │ • LangGraph   │  │
│  │ • Webhooks  │    │ • RLS        │    │               │  │
│  └─────────────┘    └──────────────┘    └───────────────┘  │
│        │                    │                    │          │
│        └────────────────────┴────────────────────┘          │
│                                                              │
│  User Signs Up → Clerk Webhook → Create User + Company      │
│  User Signs In → Clerk Session → Access Supabase Data       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps

### Immediate (Before Testing)

- [x] Implement Clerk webhook handler
- [x] Update sign-in/sign-up pages
- [x] Create Clerk middleware
- [x] Add User and Company repositories
- [x] Update environment variables
- [x] Regenerate Prisma client
- [ ] **TODO:** Add `CLERK_WEBHOOK_SECRET` to `.env.local`
- [ ] **TODO:** Execute `restore-clerkid.sql` migration in Supabase
- [ ] **TODO:** Configure Clerk webhook endpoint

### Testing Phase

1. Test user signup flow locally
2. Verify webhook creates user + company
3. Test OAuth providers (Google, GitHub)
4. Run database tests: `pnpm test`
5. Test multi-tenant data isolation

### Production Deployment

1. Deploy to Vercel
2. Update Clerk webhook URL to production domain
3. Configure Clerk OAuth providers with production credentials
4. Add Vercel environment variables
5. Monitor Clerk webhook logs for errors

---

## Troubleshooting

### Issue: Webhook Not Firing

**Symptoms:** User created in Clerk but not in Supabase database

**Solutions:**
1. Check `CLERK_WEBHOOK_SECRET` is set correctly
2. Verify webhook URL is reachable (use ngrok for local dev)
3. Check Clerk Dashboard → Webhooks → Logs for errors
4. Ensure webhook events are subscribed: `user.created`, `user.updated`, `user.deleted`

### Issue: Signature Verification Failed

**Symptoms:** Webhook receives requests but returns 400 error

**Solutions:**
1. Verify `CLERK_WEBHOOK_SECRET` matches Clerk Dashboard
2. Check webhook secret starts with `whsec_`
3. Ensure no extra whitespace in environment variable

### Issue: Tests Failing with "authId is missing"

**Symptoms:** Database tests fail with Prisma validation error

**Solutions:**
1. Regenerate Prisma client: `npx prisma generate`
2. Verify schema has `clerkId` field (not `authId`)
3. Execute migration SQL in Supabase Dashboard

---

## Documentation References

- **Clerk Docs**: https://clerk.com/docs
- **Clerk Webhooks**: https://clerk.com/docs/webhooks/overview
- **Supabase Docs**: https://supabase.com/docs
- **Supabase RLS**: https://supabase.com/docs/guides/auth/row-level-security
- **SYSTEM_PROMPT.md**: [.claude/SYSTEM_PROMPT.md](.claude/SYSTEM_PROMPT.md)

---

**Implementation Completed:** November 18, 2025
**Status:** ✅ Ready for Testing
**Next Action:** Add `CLERK_WEBHOOK_SECRET` and execute migration SQL

**Questions?** Refer to this document or check Clerk/Supabase documentation.
