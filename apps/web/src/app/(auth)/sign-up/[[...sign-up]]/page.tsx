/**
 * @file (auth)/sign-up/[[...sign-up]]/page.tsx
 * @description Sign-up page using Clerk
 * @architecture Reference: System Prompt - Authentication (Clerk)
 *
 * Dependencies:
 * - Clerk (authentication UI)
 *
 * Security:
 * - Managed by Clerk
 * - Redirects to /dashboard after sign-up
 */

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignUp />
    </div>
  );
}
