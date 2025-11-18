-- Supabase Database Schema Setup
-- Generated from Prisma schema for GRC Platform
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/pmrnysbgingvqignadhw/sql/new

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'AUDITOR');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "CompanySize" AS ENUM ('STARTUP', 'SMALL', 'MEDIUM', 'LARGE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "Framework" AS ENUM ('SOC2_TYPE1', 'SOC2_TYPE2', 'ISO27001', 'HIPAA', 'PCI_DSS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "AuditStatus" AS ENUM ('NOT_STARTED', 'DISCOVERY', 'GAP_ASSESSMENT', 'IMPLEMENTATION', 'EVIDENCE_COLLECTION', 'AUDIT_PREP', 'IN_AUDIT', 'COMPLETED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "EvidenceType" AS ENUM ('SCREENSHOT', 'DOCUMENT', 'API_RESPONSE', 'LOG_FILE', 'CONFIGURATION', 'MANUAL_UPLOAD');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "EvidenceStatus" AS ENUM ('PENDING', 'COLLECTED', 'VALIDATED', 'REJECTED', 'EXPIRED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "AgentType" AS ENUM ('ORCHESTRATOR', 'DISCOVERY', 'FRAMEWORK_EXPERT', 'ACCESS_CONTROL', 'INFRASTRUCTURE_SECURITY', 'CHANGE_MANAGEMENT', 'VENDOR_RISK', 'HR_COMPLIANCE', 'POLICY_GENERATION', 'CODE_SCANNER', 'INFRASTRUCTURE_SCANNER', 'COMPLIANCE_COPILOT', 'QUESTIONNAIRE_AUTOMATION', 'EVIDENCE_MANAGEMENT', 'AUDIT_COORDINATOR', 'INCIDENT_RESPONSE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'AWAITING_APPROVAL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ApprovalType" AS ENUM ('SCOPE_APPROVAL', 'GAP_REMEDIATION', 'POLICY_APPROVAL', 'VENDOR_APPROVAL', 'EVIDENCE_APPROVAL', 'CONTROL_IMPLEMENTATION', 'AUDIT_READINESS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "CollectionFrequency" AS ENUM ('ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'CONTINUOUS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "FindingStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'ACCEPTED_RISK', 'FALSE_POSITIVE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "TaskType" AS ENUM ('REMEDIATION', 'POLICY_CREATION', 'CONFIGURATION', 'DOCUMENTATION', 'VENDOR_ASSESSMENT', 'EVIDENCE_COLLECTION', 'REVIEW');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create tables
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "authId" TEXT UNIQUE NOT NULL,  -- Supabase auth.users.id (migrated from clerkId on Nov 17, 2025)
    "email" TEXT UNIQUE NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "imageUrl" TEXT,
    "role" "UserRole" DEFAULT 'USER' NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "companies" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "description" TEXT,
    "size" "CompanySize",
    "industry" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" UUID NOT NULL,
    CONSTRAINT "companies_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "audits" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "companyId" UUID NOT NULL,
    "framework" "Framework" DEFAULT 'SOC2_TYPE2' NOT NULL,
    "trustCriteria" TEXT,
    "status" "AuditStatus" DEFAULT 'NOT_STARTED' NOT NULL,
    "scope" TEXT,
    "startDate" TIMESTAMP(3),
    "targetDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "progressPercentage" INTEGER DEFAULT 0 NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "audits_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "controls" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "framework" "Framework" NOT NULL,
    "controlId" TEXT NOT NULL,
    "controlName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "testProcedure" TEXT NOT NULL,
    "evidenceTypes" TEXT[] NOT NULL,
    "frequency" "CollectionFrequency" NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "controls_framework_controlId_key" UNIQUE ("framework", "controlId")
);

CREATE TABLE IF NOT EXISTS "evidence" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "auditId" UUID NOT NULL,
    "controlId" UUID,
    "controlName" TEXT NOT NULL,
    "type" "EvidenceType" NOT NULL,
    "status" "EvidenceStatus" DEFAULT 'PENDING' NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT,
    "screenshotUrl" TEXT,
    "apiResponse" TEXT,
    "aiAnalysis" TEXT,
    "validated" BOOLEAN DEFAULT false NOT NULL,
    "collectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "evidence_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "audits"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "evidence_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "controls"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "agent_executions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "auditId" UUID,
    "agentType" "AgentType" NOT NULL,
    "agentName" TEXT NOT NULL,
    "phase" "AuditStatus" NOT NULL,
    "status" "ExecutionStatus" DEFAULT 'RUNNING' NOT NULL,
    "startedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "input" TEXT,
    "output" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "agent_executions_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "audits"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "agent_decisions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "executionId" UUID NOT NULL,
    "decisionType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "evidence" TEXT,
    "alternatives" TEXT,
    "overridden" BOOLEAN DEFAULT false NOT NULL,
    "overrideBy" TEXT,
    "overrideReason" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "agent_decisions_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "agent_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "approvals" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "executionId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ApprovalType" NOT NULL,
    "priority" "Priority" DEFAULT 'MEDIUM' NOT NULL,
    "status" "ApprovalStatus" DEFAULT 'PENDING' NOT NULL,
    "requestedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "respondedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "decision" BOOLEAN,
    "comments" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "approvals_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "agent_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "findings" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "auditId" UUID NOT NULL,
    "controlId" UUID,
    "executionId" UUID,
    "severity" "Severity" NOT NULL,
    "status" "FindingStatus" DEFAULT 'OPEN' NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "currentState" TEXT NOT NULL,
    "requiredState" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "identifiedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueDate" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "findings_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "audits"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "findings_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "controls"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "findings_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "agent_executions"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "tasks" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "findingId" UUID,
    "executionId" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "TaskType" NOT NULL,
    "priority" "Priority" DEFAULT 'MEDIUM' NOT NULL,
    "status" "TaskStatus" DEFAULT 'TODO' NOT NULL,
    "assignedTo" TEXT,
    "assignedBy" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tasks_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "findings"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tasks_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "agent_executions"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "agent_executions_auditId_agentType_idx" ON "agent_executions"("auditId", "agentType");
CREATE INDEX IF NOT EXISTS "agent_executions_status_startedAt_idx" ON "agent_executions"("status", "startedAt");
CREATE INDEX IF NOT EXISTS "agent_decisions_executionId_idx" ON "agent_decisions"("executionId");
CREATE INDEX IF NOT EXISTS "approvals_status_priority_idx" ON "approvals"("status", "priority");
CREATE INDEX IF NOT EXISTS "approvals_requestedAt_idx" ON "approvals"("requestedAt");
CREATE INDEX IF NOT EXISTS "controls_framework_idx" ON "controls"("framework");
CREATE INDEX IF NOT EXISTS "findings_auditId_severity_status_idx" ON "findings"("auditId", "severity", "status");
CREATE INDEX IF NOT EXISTS "tasks_status_priority_idx" ON "tasks"("status", "priority");
CREATE INDEX IF NOT EXISTS "tasks_assignedTo_idx" ON "tasks"("assignedTo");

-- Success message
SELECT 'GRC Platform schema created successfully!' as message;
