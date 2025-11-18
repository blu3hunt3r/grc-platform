-- Supabase Realtime Configuration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/pmrnysbgingvqignadhw/sql/new
-- Created on November 17, 2025

-- ============================================================================
-- ENABLE REALTIME FOR TABLES
-- ============================================================================

-- Enable realtime for agent_executions table
ALTER PUBLICATION supabase_realtime ADD TABLE agent_executions;

-- Enable realtime for approvals table
ALTER PUBLICATION supabase_realtime ADD TABLE approvals;

-- Enable realtime for evidence table
ALTER PUBLICATION supabase_realtime ADD TABLE evidence;

-- Enable realtime for findings table
ALTER PUBLICATION supabase_realtime ADD TABLE findings;

-- Enable realtime for tasks table
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;

-- Enable realtime for agent_decisions table
ALTER PUBLICATION supabase_realtime ADD TABLE agent_decisions;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) FOR REALTIME
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES FOR AGENT_EXECUTIONS
-- ============================================================================

-- Users can view agent executions from their own audits
CREATE POLICY "Users can view their agent executions"
ON agent_executions FOR SELECT
TO authenticated
USING (
  "auditId" IN (
    SELECT a.id
    FROM audits a
    JOIN companies c ON c.id = a."companyId"
    JOIN users u ON u.id = c."createdById"
    WHERE u."authId" = auth.uid()::text
  )
);

-- Users can insert agent executions for their own audits
CREATE POLICY "Users can insert agent executions"
ON agent_executions FOR INSERT
TO authenticated
WITH CHECK (
  "auditId" IN (
    SELECT a.id
    FROM audits a
    JOIN companies c ON c.id = a."companyId"
    JOIN users u ON u.id = c."createdById"
    WHERE u."authId" = auth.uid()::text
  )
);

-- Users can update agent executions for their own audits
CREATE POLICY "Users can update their agent executions"
ON agent_executions FOR UPDATE
TO authenticated
USING (
  "auditId" IN (
    SELECT a.id
    FROM audits a
    JOIN companies c ON c.id = a."companyId"
    JOIN users u ON u.id = c."createdById"
    WHERE u."authId" = auth.uid()::text
  )
);

-- ============================================================================
-- RLS POLICIES FOR APPROVALS
-- ============================================================================

-- Users can view approvals from their own audits
CREATE POLICY "Users can view their approvals"
ON approvals FOR SELECT
TO authenticated
USING (
  "executionId" IN (
    SELECT ae.id
    FROM agent_executions ae
    JOIN audits a ON a.id = ae."auditId"
    JOIN companies c ON c.id = a."companyId"
    JOIN users u ON u.id = c."createdById"
    WHERE u."authId" = auth.uid()::text
  )
);

-- Users can update approvals for their own audits
CREATE POLICY "Users can update their approvals"
ON approvals FOR UPDATE
TO authenticated
USING (
  "executionId" IN (
    SELECT ae.id
    FROM agent_executions ae
    JOIN audits a ON a.id = ae."auditId"
    JOIN companies c ON c.id = a."companyId"
    JOIN users u ON u.id = c."createdById"
    WHERE u."authId" = auth.uid()::text
  )
);

-- ============================================================================
-- RLS POLICIES FOR EVIDENCE
-- ============================================================================

-- Users can view evidence from their own audits
CREATE POLICY "Users can view their evidence"
ON evidence FOR SELECT
TO authenticated
USING (
  "auditId" IN (
    SELECT a.id
    FROM audits a
    JOIN companies c ON c.id = a."companyId"
    JOIN users u ON u.id = c."createdById"
    WHERE u."authId" = auth.uid()::text
  )
);

-- Users can insert evidence for their own audits
CREATE POLICY "Users can insert evidence"
ON evidence FOR INSERT
TO authenticated
WITH CHECK (
  "auditId" IN (
    SELECT a.id
    FROM audits a
    JOIN companies c ON c.id = a."companyId"
    JOIN users u ON u.id = c."createdById"
    WHERE u."authId" = auth.uid()::text
  )
);

-- Users can update evidence for their own audits
CREATE POLICY "Users can update their evidence"
ON evidence FOR UPDATE
TO authenticated
USING (
  "auditId" IN (
    SELECT a.id
    FROM audits a
    JOIN companies c ON c.id = a."companyId"
    JOIN users u ON u.id = c."createdById"
    WHERE u."authId" = auth.uid()::text
  )
);

-- Users can delete evidence from their own audits
CREATE POLICY "Users can delete their evidence"
ON evidence FOR DELETE
TO authenticated
USING (
  "auditId" IN (
    SELECT a.id
    FROM audits a
    JOIN companies c ON c.id = a."companyId"
    JOIN users u ON u.id = c."createdById"
    WHERE u."authId" = auth.uid()::text
  )
);

-- ============================================================================
-- RLS POLICIES FOR FINDINGS
-- ============================================================================

-- Users can view findings from their own audits
CREATE POLICY "Users can view their findings"
ON findings FOR SELECT
TO authenticated
USING (
  "auditId" IN (
    SELECT a.id
    FROM audits a
    JOIN companies c ON c.id = a."companyId"
    JOIN users u ON u.id = c."createdById"
    WHERE u."authId" = auth.uid()::text
  )
);

-- Users can update findings for their own audits
CREATE POLICY "Users can update their findings"
ON findings FOR UPDATE
TO authenticated
USING (
  "auditId" IN (
    SELECT a.id
    FROM audits a
    JOIN companies c ON c.id = a."companyId"
    JOIN users u ON u.id = c."createdById"
    WHERE u."authId" = auth.uid()::text
  )
);

-- ============================================================================
-- RLS POLICIES FOR AUDITS
-- ============================================================================

-- Users can view their own audits
CREATE POLICY "Users can view their audits"
ON audits FOR SELECT
TO authenticated
USING (
  "companyId" IN (
    SELECT c.id
    FROM companies c
    JOIN users u ON u.id = c."createdById"
    WHERE u."authId" = auth.uid()::text
  )
);

-- Users can insert audits for their own companies
CREATE POLICY "Users can insert audits"
ON audits FOR INSERT
TO authenticated
WITH CHECK (
  "companyId" IN (
    SELECT c.id
    FROM companies c
    JOIN users u ON u.id = c."createdById"
    WHERE u."authId" = auth.uid()::text
  )
);

-- Users can update their own audits
CREATE POLICY "Users can update their audits"
ON audits FOR UPDATE
TO authenticated
USING (
  "companyId" IN (
    SELECT c.id
    FROM companies c
    JOIN users u ON u.id = c."createdById"
    WHERE u."authId" = auth.uid()::text
  )
);

-- Users can delete their own audits
CREATE POLICY "Users can delete their audits"
ON audits FOR DELETE
TO authenticated
USING (
  "companyId" IN (
    SELECT c.id
    FROM companies c
    JOIN users u ON u.id = c."createdById"
    WHERE u."authId" = auth.uid()::text
  )
);

-- ============================================================================
-- RLS POLICIES FOR COMPANIES
-- ============================================================================

-- Users can view their own companies
CREATE POLICY "Users can view their companies"
ON companies FOR SELECT
TO authenticated
USING (
  "createdById" IN (
    SELECT u.id
    FROM users u
    WHERE u."authId" = auth.uid()::text
  )
);

-- Users can insert their own companies
CREATE POLICY "Users can insert companies"
ON companies FOR INSERT
TO authenticated
WITH CHECK (
  "createdById" IN (
    SELECT u.id
    FROM users u
    WHERE u."authId" = auth.uid()::text
  )
);

-- Users can update their own companies
CREATE POLICY "Users can update their companies"
ON companies FOR UPDATE
TO authenticated
USING (
  "createdById" IN (
    SELECT u.id
    FROM users u
    WHERE u."authId" = auth.uid()::text
  )
);

-- Users can delete their own companies
CREATE POLICY "Users can delete their companies"
ON companies FOR DELETE
TO authenticated
USING (
  "createdById" IN (
    SELECT u.id
    FROM users u
    WHERE u."authId" = auth.uid()::text
  )
);

-- ============================================================================
-- RLS POLICIES FOR USERS
-- ============================================================================

-- Users can view their own user record
CREATE POLICY "Users can view their own record"
ON users FOR SELECT
TO authenticated
USING ("authId" = auth.uid()::text);

-- Users can update their own user record
CREATE POLICY "Users can update their own record"
ON users FOR UPDATE
TO authenticated
USING ("authId" = auth.uid()::text);

-- Success message
SELECT 'Realtime enabled and RLS policies created successfully!' as message;
