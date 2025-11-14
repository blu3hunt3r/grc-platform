/**
 * @file (auth)/sign-in/[[...sign-in]]/page.tsx
 * @description Sign-in page using Clerk
 * @architecture Reference: System Prompt - Authentication (Clerk)
 *
 * Dependencies:
 * - Clerk (authentication UI)
 *
 * Security:
 * - Managed by Clerk
 * - Redirects to /dashboard after sign-in
 */

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn />
    </div>
  );
}
