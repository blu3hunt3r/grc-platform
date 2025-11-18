/**
 * @file components/auth/user-button.tsx
 * @description User button component using Clerk UserButton
 * @architecture Reference: Part 6 - Security & Authentication
 *
 * Migration History:
 * - Migrated from Clerk to Supabase Auth on November 17, 2025
 * - Restored Clerk authentication on November 18, 2025
 */

'use client'

import { UserButton as ClerkUserButton } from '@clerk/nextjs'

interface UserButtonProps {
  afterSignOutUrl?: string
}

/**
 * Wrapper around Clerk's UserButton component
 * Provides consistent user menu with profile, settings, and sign out
 */
export function UserButton({ afterSignOutUrl = '/' }: UserButtonProps) {
  return (
    <ClerkUserButton
      afterSignOutUrl={afterSignOutUrl}
      appearance={{
        elements: {
          avatarBox: 'h-8 w-8',
        },
      }}
    />
  )
}
