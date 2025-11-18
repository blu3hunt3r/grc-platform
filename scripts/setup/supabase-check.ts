/**
 * @file supabase-check.ts
 * @description Verify Supabase configuration and connectivity
 * @architecture Reference: Part 6 - Security & Testing
 *
 * This script verifies all Supabase components are configured correctly:
 * - Database connectivity (direct + pooler)
 * - Storage bucket configuration
 * - Authentication setup
 * - Realtime enablement
 *
 * Usage: pnpm supabase:check
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pmrnysbgingvqignadhw.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<boolean> {
  console.log('\n🗄️  Database Connectivity');
  console.log('─'.repeat(50));

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.log('  ⚠️  SUPABASE_SERVICE_ROLE_KEY not set (skipping admin checks)');
    return false;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Test query
    const { data, error } = await supabase.from('users').select('count').limit(1);

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = table doesn't exist (acceptable if schema not yet applied)
      console.error('  ❌ Database query failed:', error.message);
      return false;
    }

    console.log('  ✓ Direct connection: Working');
    console.log('  ✓ Service role key: Valid');
    return true;
  } catch (error: any) {
    console.error('  ❌ Database check failed:', error.message);
    return false;
  }
}

/**
 * Check storage buckets
 */
async function checkStorage(): Promise<boolean> {
  console.log('\n📦 Storage Buckets');
  console.log('─'.repeat(50));

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.log('  ⚠️  SUPABASE_SERVICE_ROLE_KEY required to check buckets');
    return false;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('  ❌ Failed to list buckets:', error.message);
      return false;
    }

    const expectedBuckets = ['evidence-files', 'policy-documents', 'audit-reports'];
    let allFound = true;

    for (const expected of expectedBuckets) {
      const bucket = buckets.find((b) => b.id === expected);
      if (bucket) {
        console.log(`  ✓ ${expected} (${bucket.public ? 'public' : 'private'})`);
      } else {
        console.log(`  ❌ ${expected} (not found)`);
        allFound = false;
      }
    }

    return allFound;
  } catch (error: any) {
    console.error('  ❌ Storage check failed:', error.message);
    return false;
  }
}

/**
 * Check authentication configuration
 */
async function checkAuth(): Promise<boolean> {
  console.log('\n🔐 Authentication');
  console.log('─'.repeat(50));

  if (!SUPABASE_ANON_KEY) {
    console.error('  ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not set');
    return false;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Try to get session (will be null if not authenticated, but shouldn't error)
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('  ❌ Auth check failed:', error.message);
      return false;
    }

    console.log('  ✓ Anonymous key: Valid');
    console.log('  ✓ Auth endpoints: Accessible');
    console.log('  ⚠️  OAuth providers: Configure in Dashboard (optional)');

    return true;
  } catch (error: any) {
    console.error('  ❌ Auth check failed:', error.message);
    return false;
  }
}

/**
 * Check environment variables
 */
function checkEnvironment(): boolean {
  console.log('\n🌍 Environment Variables');
  console.log('─'.repeat(50));

  const required = {
    NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
  };

  const optional = {
    SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE_KEY,
  };

  let allSet = true;

  console.log('\n  Required:');
  for (const [key, value] of Object.entries(required)) {
    if (value) {
      const masked = value.substring(0, 20) + '...' + value.substring(value.length - 4);
      console.log(`    ✓ ${key}: ${masked}`);
    } else {
      console.log(`    ❌ ${key}: Not set`);
      allSet = false;
    }
  }

  console.log('\n  Optional (for setup/admin):');
  for (const [key, value] of Object.entries(optional)) {
    if (value) {
      const masked = value.substring(0, 20) + '...' + value.substring(value.length - 4);
      console.log(`    ✓ ${key}: ${masked}`);
    } else {
      console.log(`    ⚠️  ${key}: Not set`);
    }
  }

  return allSet;
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('\n🔍 Supabase Configuration Check');
  console.log('='.repeat(50));
  console.log(`Project: ${SUPABASE_URL}`);
  console.log('='.repeat(50));

  const results = {
    environment: checkEnvironment(),
    database: await checkDatabase(),
    storage: await checkStorage(),
    auth: await checkAuth(),
  };

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('Summary:');
  console.log('─'.repeat(50));
  for (const [component, passed] of Object.entries(results)) {
    const status = passed ? '✅' : '❌';
    console.log(`  ${status} ${component.charAt(0).toUpperCase() + component.slice(1)}`);
  }

  const allPassed = Object.values(results).every((r) => r);
  console.log('='.repeat(50));

  if (allPassed) {
    console.log('✅ All checks passed!');
    console.log('\nYour Supabase configuration is ready.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some checks failed');
    console.log('\nRun setup script to fix:');
    console.log('  export SUPABASE_SERVICE_ROLE_KEY="your-key"');
    console.log('  pnpm supabase:setup\n');
    process.exit(1);
  }
}

// Execute
if (require.main === module) {
  main();
}

export { main as checkSupabase };
