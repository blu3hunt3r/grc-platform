/**
 * @file restore-clerkid.sql
 * @description Rename authId back to clerkId for Clerk + Supabase hybrid
 * @date November 18, 2025
 *
 * Architecture: Clerk (auth) + Supabase (database/storage/realtime)
 *
 * This migration restores the clerkId column name to support Clerk authentication
 * while keeping all Supabase database/storage/realtime infrastructure
 */

-- Rename column from authId to clerkId
ALTER TABLE users RENAME COLUMN "authId" TO "clerkId";

-- Update column comment
COMMENT ON COLUMN users."clerkId" IS 'Clerk user ID (hybrid: Clerk auth + Supabase DB)';

-- Verify the change
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'clerkId'
  ) THEN
    RAISE NOTICE 'Successfully renamed authId to clerkId';
  ELSE
    RAISE EXCEPTION 'Column rename failed - clerkId not found';
  END IF;
END $$;
