/**
 * @file (auth)/sign-up/[[...sign-up]]/page.tsx
 * @description Sign-up page using Clerk authentication
 * @architecture SYSTEM_PROMPT.md "Hybrid Architecture: Clerk (Auth) + Supabase (DB)"
 * Restored Clerk on November 18, 2025
 *
 * Architecture Reference: SYSTEM_PROMPT.md Lines 70-76
 * Quote: "Hybrid Architecture: Clerk (Auth) + Supabase (Data Layer)
 *         - Authentication: Clerk with OAuth providers (Google, GitHub)
 *         - Database: Supabase PostgreSQL"
 *
 * Purpose:
 * - User registration via Clerk
 * - OAuth support (Google, GitHub)
 * - Webhook triggers user + company creation
 * - Redirects to /dashboard after signup
 *
 * Flow:
 * 1. User signs up via Clerk UI
 * 2. Clerk webhook fires (user.created)
 * 3. Backend creates User + Company in Supabase
 * 4. User lands on /dashboard with company ready
 *
 * Dependencies:
 * - @clerk/nextjs: Clerk authentication components
 *
 * Security:
 * - Managed by Clerk
 * - HTTPS enforced
 * - OAuth providers verified
 */

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to GRC Platform</h1>
          <p className="text-sm text-gray-600 mt-2">
            Create your account to get started
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-lg',
            },
          }}
        />
      </div>
    </div>
  );
}
