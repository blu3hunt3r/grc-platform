/**
 * @file (auth)/sign-in/[[...sign-in]]/page.tsx
 * @description Sign-in page using Clerk authentication
 * @architecture SYSTEM_PROMPT.md "Hybrid Architecture: Clerk (Auth) + Supabase (DB)"
 * Restored Clerk on November 18, 2025
 *
 * Architecture Reference: SYSTEM_PROMPT.md Lines 70-76
 * Quote: "Hybrid Architecture: Clerk (Auth) + Supabase (Data Layer)
 *         - Authentication: Clerk with OAuth providers (Google, GitHub)
 *         - Database: Supabase PostgreSQL"
 *
 * Purpose:
 * - User sign-in via Clerk
 * - OAuth support (Google, GitHub)
 * - Session management by Clerk
 * - Redirects to /dashboard after sign-in
 *
 * Flow:
 * 1. User signs in via Clerk UI
 * 2. Clerk validates credentials/OAuth
 * 3. Session established
 * 4. User redirected to /dashboard
 *
 * Dependencies:
 * - @clerk/nextjs: Clerk authentication components
 *
 * Security:
 * - Managed by Clerk
 * - HTTPS enforced
 * - Session tokens secured
 */

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-sm text-gray-600 mt-2">
            Sign in to your GRC Platform account
          </p>
        </div>
        <SignIn
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
