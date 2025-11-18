/**
 * @file jest.setup.js
 * @description Jest setup file to load test environment variables
 * @architecture Reference: Part 6 - Security & Testing
 * Created on November 17, 2025 for Supabase migration
 */

// Set DATABASE_URL for tests to use Supabase pooler
// Using correct pooler connection with proper region (ap-southeast-1)
// Password contains @ symbol, encoded as %40 in URL
process.env.DATABASE_URL = 'postgresql://postgres.pmrnysbgingvqignadhw:q9tnr7dq%4017895@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

console.log('Test environment loaded: Using Supabase pooler (ap-southeast-1) for tests');
