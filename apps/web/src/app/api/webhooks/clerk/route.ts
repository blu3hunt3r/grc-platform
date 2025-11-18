/**
 * @file api/webhooks/clerk/route.ts
 * @description Clerk webhook handler for user lifecycle events
 * @architecture SYSTEM_PROMPT.md "Hybrid Architecture: Clerk (Auth) + Supabase (DB)"
 *
 * Architecture Reference: SYSTEM_PROMPT.md Lines 70-76
 * Quote: "Hybrid Architecture: Clerk (Auth) + Supabase (Data Layer)
 *         - Authentication: Clerk with OAuth providers
 *         - Database: Supabase PostgreSQL with connection pooling"
 *
 * Purpose:
 * - Sync Clerk user events to Supabase database
 * - Auto-create user + company on signup
 * - Update user data on profile changes
 * - Handle user deletion
 *
 * Webhook Events:
 * - user.created: Create user + default company
 * - user.updated: Sync user profile changes
 * - user.deleted: Remove user from database
 *
 * Security:
 * - Verifies webhook signatures using Svix
 * - Validates request headers and payload
 * - Uses atomic transactions for data consistency
 *
 * Dependencies:
 * - svix: Webhook signature verification
 * - @clerk/nextjs: Clerk types and utilities
 * - @grc/database: User and Company repositories
 *
 * Related components:
 * - Sign-up flow (apps/web/src/app/(auth)/sign-up)
 * - User repository (packages/database/src/repositories/user.repository.ts)
 * - Company repository (packages/database/src/repositories/company.repository.ts)
 */

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma, UserRepository, CompanyRepository } from '@grc/database';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Clerk webhook signing secret
 * Get this from Clerk Dashboard → Webhooks → Signing Secret
 *
 * IMPORTANT: Add this to .env.local and Vercel:
 * CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
 *
 * Note: This is validated at runtime (in POST handler) to allow builds
 * to succeed even if the secret is not set during build time.
 */

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

/**
 * POST /api/webhooks/clerk
 * Handles Clerk webhook events
 *
 * Flow:
 * 1. Verify webhook signature (Svix)
 * 2. Parse event type and data
 * 3. Execute corresponding handler
 * 4. Return 200 OK to Clerk
 *
 * Error Handling:
 * - 400: Invalid signature or payload
 * - 500: Database or processing error
 * - Logs all errors for monitoring
 */
export async function POST(req: Request) {
  try {
    // ============================================================================
    // STEP 0: Validate Webhook Secret (Runtime Check)
    // ============================================================================

    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error('[Clerk Webhook] CLERK_WEBHOOK_SECRET not set in environment variables');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // ============================================================================
    // STEP 1: Verify Webhook Signature
    // ============================================================================

    // Get headers
    const headerPayload = await headers();
    const svixId = headerPayload.get('svix-id');
    const svixTimestamp = headerPayload.get('svix-timestamp');
    const svixSignature = headerPayload.get('svix-signature');

    // Validate required headers
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('[Clerk Webhook] Missing svix headers');
      return NextResponse.json(
        { error: 'Missing svix headers' },
        { status: 400 }
      );
    }

    // Get raw body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Verify signature using Svix
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('[Clerk Webhook] Signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // ============================================================================
    // STEP 2: Route to Event Handler
    // ============================================================================

    const eventType = evt.type;
    console.log(`[Clerk Webhook] Received event: ${eventType}`);

    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt);
        break;

      case 'user.updated':
        await handleUserUpdated(evt);
        break;

      case 'user.deleted':
        await handleUserDeleted(evt);
        break;

      default:
        console.log(`[Clerk Webhook] Unhandled event type: ${eventType}`);
    }

    // ============================================================================
    // STEP 3: Return Success
    // ============================================================================

    return NextResponse.json(
      { message: 'Webhook processed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Clerk Webhook] Processing error:', error);

    // Return 500 to Clerk (will trigger retry)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle user.created event
 *
 * Flow:
 * 1. Extract user data from Clerk event
 * 2. Create user in Supabase
 * 3. Create default company for user
 * 4. Link user as company owner
 *
 * Transaction: Atomic operation (all-or-nothing)
 * If company creation fails, user creation is rolled back
 */
async function handleUserCreated(evt: WebhookEvent) {
  try {
    console.log('[Clerk Webhook] Processing user.created event');

    // Extract user data from event
    if (evt.type !== 'user.created') {
      throw new Error('Invalid event type for handleUserCreated');
    }

    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Validate required fields
    const primaryEmail = email_addresses.find((e) => e.id === evt.data.primary_email_address_id);
    if (!primaryEmail) {
      throw new Error('No primary email found in user data');
    }

    console.log(`[Clerk Webhook] Creating user: ${primaryEmail.email_address}`);

    // ============================================================================
    // Atomic Transaction: Create User + Company
    // ============================================================================

    const result = await prisma.$transaction(async (tx) => {
      // Initialize repositories with transaction client
      const userRepo = new UserRepository(tx as any);
      const companyRepo = new CompanyRepository(tx as any);

      // Step 1: Create user
      const user = await userRepo.createFromClerk({
        clerkId: id,
        email: primaryEmail.email_address,
        firstName: first_name || null,
        lastName: last_name || null,
        imageUrl: image_url || null,
      });

      console.log(`[Clerk Webhook] Created user: ${user.id}`);

      // Step 2: Create default company
      const company = await companyRepo.createDefaultCompany(
        user.id,
        user.email
      );

      console.log(`[Clerk Webhook] Created company: ${company.id}`);

      return { user, company };
    });

    console.log(
      `[Clerk Webhook] ✅ User signup complete: ${result.user.email} → Company: ${result.company.name}`
    );
  } catch (error) {
    console.error('[Clerk Webhook] user.created handler failed:', error);
    throw error; // Propagate to main handler
  }
}

/**
 * Handle user.updated event
 *
 * Syncs user profile changes from Clerk to Supabase
 * Updates: email, firstName, lastName, imageUrl
 */
async function handleUserUpdated(evt: WebhookEvent) {
  try {
    console.log('[Clerk Webhook] Processing user.updated event');

    // Extract user data from event
    if (evt.type !== 'user.updated') {
      throw new Error('Invalid event type for handleUserUpdated');
    }

    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Get primary email
    const primaryEmail = email_addresses.find((e) => e.id === evt.data.primary_email_address_id);
    if (!primaryEmail) {
      throw new Error('No primary email found in user data');
    }

    console.log(`[Clerk Webhook] Updating user: ${primaryEmail.email_address}`);

    // Update user in database
    const userRepo = new UserRepository(prisma);
    const user = await userRepo.syncFromClerk(id, {
      email: primaryEmail.email_address,
      firstName: first_name || null,
      lastName: last_name || null,
      imageUrl: image_url || null,
    });

    console.log(`[Clerk Webhook] ✅ User updated: ${user.id}`);
  } catch (error) {
    console.error('[Clerk Webhook] user.updated handler failed:', error);
    throw error;
  }
}

/**
 * Handle user.deleted event
 *
 * Removes user from Supabase database
 * Related data (companies, audits) handled by CASCADE
 */
async function handleUserDeleted(evt: WebhookEvent) {
  try {
    console.log('[Clerk Webhook] Processing user.deleted event');

    // Extract user data from event
    if (evt.type !== 'user.deleted') {
      throw new Error('Invalid event type for handleUserDeleted');
    }

    const { id } = evt.data;

    if (!id) {
      throw new Error('User ID is missing from user.deleted event');
    }

    console.log(`[Clerk Webhook] Deleting user: ${id}`);

    // Delete user from database
    const userRepo = new UserRepository(prisma);
    const user = await userRepo.deleteByClerkId(id);

    console.log(`[Clerk Webhook] ✅ User deleted: ${user.id} (${user.email})`);
  } catch (error) {
    console.error('[Clerk Webhook] user.deleted handler failed:', error);
    throw error;
  }
}
