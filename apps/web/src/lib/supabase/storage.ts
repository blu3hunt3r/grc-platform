/**
 * @file storage.ts
 * @description Supabase Storage utilities for evidence files
 * @architecture Reference: Part 6 - Security & Authentication
 * @module @/lib/supabase
 *
 * Storage Buckets:
 * - evidence-files: Evidence documents, screenshots, logs
 * - policy-documents: Generated policies, procedures
 * - audit-reports: Final audit reports, compliance documentation
 *
 * Created on November 17, 2025
 */

import { createClient, createServerClient } from './client'

export const STORAGE_BUCKETS = {
  EVIDENCE_FILES: 'evidence-files',
  POLICY_DOCUMENTS: 'policy-documents',
  AUDIT_REPORTS: 'audit-reports',
} as const

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS]

/**
 * Upload a file to Supabase Storage (client-side)
 */
export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Upload error:', error)
    return { error: error.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return { url: publicUrl, path: data.path }
}

/**
 * Upload a file to Supabase Storage (server-side)
 */
export async function uploadFileServer(
  bucket: StorageBucket,
  path: string,
  file: File | Buffer,
  contentType?: string
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = createServerClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Server upload error:', error)
    return { error: error.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return { url: publicUrl, path: data.path }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  bucket: StorageBucket,
  path: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    console.error('Delete error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Get signed URL for private file access (valid for 1 hour)
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn: number = 3600
): Promise<{ url: string } | { error: string }> {
  const supabase = createServerClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    console.error('Signed URL error:', error)
    return { error: error.message }
  }

  return { url: data.signedUrl }
}

/**
 * List files in a bucket path
 */
export async function listFiles(
  bucket: StorageBucket,
  path: string = ''
): Promise<{ files: any[]; error?: string }> {
  const supabase = createServerClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    })

  if (error) {
    console.error('List files error:', error)
    return { files: [], error: error.message }
  }

  return { files: data || [] }
}

/**
 * Generate a unique file path for evidence
 * Format: {auditId}/{controlId}/{timestamp}-{filename}
 */
export function generateEvidencePath(
  auditId: string,
  controlId: string,
  filename: string
): string {
  const timestamp = Date.now()
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${auditId}/${controlId}/${timestamp}-${sanitizedFilename}`
}

/**
 * Generate a unique file path for policy documents
 * Format: {companyId}/{policyType}/{timestamp}-{filename}
 */
export function generatePolicyPath(
  companyId: string,
  policyType: string,
  filename: string
): string {
  const timestamp = Date.now()
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${companyId}/${policyType}/${timestamp}-${sanitizedFilename}`
}

/**
 * Generate a unique file path for audit reports
 * Format: {auditId}/{reportType}/{timestamp}-{filename}
 */
export function generateReportPath(
  auditId: string,
  reportType: string,
  filename: string
): string {
  const timestamp = Date.now()
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${auditId}/${reportType}/${timestamp}-${sanitizedFilename}`
}
