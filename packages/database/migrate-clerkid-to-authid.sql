-- Migration: Rename clerkId to authId in users table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/pmrnysbgingvqignadhw/sql/new
-- Migrated from Clerk to Supabase Auth on November 17, 2025

-- Rename the column
ALTER TABLE users RENAME COLUMN "clerkId" TO "authId";

-- Update the comment
COMMENT ON COLUMN users."authId" IS 'Supabase auth.users.id (migrated from clerkId on Nov 17, 2025)';

-- Success message
SELECT 'Successfully migrated clerkId to authId!' as message;
