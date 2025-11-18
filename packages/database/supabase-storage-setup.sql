-- Supabase Storage Buckets Setup
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/pmrnysbgingvqignadhw/sql/new
-- Created on November 17, 2025

-- Note: Buckets are created via the Supabase Dashboard Storage UI, not SQL
-- This file documents the configuration and creates RLS policies

-- ============================================================================
-- STORAGE BUCKETS (Create these in Supabase Dashboard > Storage)
-- ============================================================================

-- 1. evidence-files
--    - Purpose: Store evidence documents, screenshots, logs, configurations
--    - Public: false (requires authentication)
--    - File size limit: 50MB
--    - Allowed MIME types: image/*, application/pdf, text/*, application/json

-- 2. policy-documents
--    - Purpose: Store generated policies, procedures, documentation
--    - Public: false (requires authentication)
--    - File size limit: 10MB
--    - Allowed MIME types: application/pdf, application/msword, application/vnd.*

-- 3. audit-reports
--    - Purpose: Store final audit reports, compliance documentation
--    - Public: false (requires authentication)
--    - File size limit: 25MB
--    - Allowed MIME types: application/pdf, application/vnd.*

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR STORAGE
-- ============================================================================

-- Enable RLS on storage.objects (should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- EVIDENCE FILES BUCKET POLICIES
-- ============================================================================

-- Policy: Users can upload evidence files to their own audits
CREATE POLICY "Users can upload evidence files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'evidence-files'
  AND auth.uid() IN (
    SELECT u.id::text
    FROM users u
    JOIN companies c ON c."createdById" = u.id
    JOIN audits a ON a."companyId" = c.id
    WHERE (storage.foldername(name))[1] = a.id::text
  )
);

-- Policy: Users can view evidence files from their own audits
CREATE POLICY "Users can view evidence files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'evidence-files'
  AND auth.uid() IN (
    SELECT u.id::text
    FROM users u
    JOIN companies c ON c."createdById" = u.id
    JOIN audits a ON a."companyId" = c.id
    WHERE (storage.foldername(name))[1] = a.id::text
  )
);

-- Policy: Users can delete evidence files from their own audits
CREATE POLICY "Users can delete evidence files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'evidence-files'
  AND auth.uid() IN (
    SELECT u.id::text
    FROM users u
    JOIN companies c ON c."createdById" = u.id
    JOIN audits a ON a."companyId" = c.id
    WHERE (storage.foldername(name))[1] = a.id::text
  )
);

-- ============================================================================
-- POLICY DOCUMENTS BUCKET POLICIES
-- ============================================================================

-- Policy: Users can upload policy documents to their own companies
CREATE POLICY "Users can upload policy documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'policy-documents'
  AND auth.uid() IN (
    SELECT u.id::text
    FROM users u
    JOIN companies c ON c."createdById" = u.id
    WHERE (storage.foldername(name))[1] = c.id::text
  )
);

-- Policy: Users can view policy documents from their own companies
CREATE POLICY "Users can view policy documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'policy-documents'
  AND auth.uid() IN (
    SELECT u.id::text
    FROM users u
    JOIN companies c ON c."createdById" = u.id
    WHERE (storage.foldername(name))[1] = c.id::text
  )
);

-- Policy: Users can delete policy documents from their own companies
CREATE POLICY "Users can delete policy documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'policy-documents'
  AND auth.uid() IN (
    SELECT u.id::text
    FROM users u
    JOIN companies c ON c."createdById" = u.id
    WHERE (storage.foldername(name))[1] = c.id::text
  )
);

-- ============================================================================
-- AUDIT REPORTS BUCKET POLICIES
-- ============================================================================

-- Policy: Users can upload audit reports to their own audits
CREATE POLICY "Users can upload audit reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audit-reports'
  AND auth.uid() IN (
    SELECT u.id::text
    FROM users u
    JOIN companies c ON c."createdById" = u.id
    JOIN audits a ON a."companyId" = c.id
    WHERE (storage.foldername(name))[1] = a.id::text
  )
);

-- Policy: Users can view audit reports from their own audits
CREATE POLICY "Users can view audit reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'audit-reports'
  AND auth.uid() IN (
    SELECT u.id::text
    FROM users u
    JOIN companies c ON c."createdById" = u.id
    JOIN audits a ON a."companyId" = c.id
    WHERE (storage.foldername(name))[1] = a.id::text
  )
);

-- Policy: Users can delete audit reports from their own audits
CREATE POLICY "Users can delete audit reports"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'audit-reports'
  AND auth.uid() IN (
    SELECT u.id::text
    FROM users u
    JOIN companies c ON c."createdById" = u.id
    JOIN audits a ON a."companyId" = c.id
    WHERE (storage.foldername(name))[1] = a.id::text
  )
);

-- Success message
SELECT 'Storage RLS policies created successfully! Now create the buckets in the Supabase Dashboard.' as message;
