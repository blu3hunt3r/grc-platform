/**
 * @file client.ts
 * @description Supabase browser client for client components
 * @module @/lib/supabase
 *
 * Architecture Reference: Part 6 - Security & Authentication
 * Migrated from Clerk to Supabase Auth on November 17, 2025
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Create server-side Supabase client for storage operations
 * Note: Auth is handled by Clerk, this is only for storage/database access
 */
export function createServerClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
