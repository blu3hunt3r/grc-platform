# Part 5: Data & APIs

**Document:** 05_data_and_apis.md
**Version:** 1.0 - Complete Data Architecture
**Last Updated:** November 16, 2025
**Status:** Production-Ready Architecture
**Philosophy:** Agent-First Data Model with Real-Time Everything

---

## 📋 **TABLE OF CONTENTS**

1. [Data Architecture Overview](#1-overview)
2. [Complete Database Schema](#2-database-schema)
3. [Agent-First Data Model](#3-agent-model)
4. [API Architecture](#4-api-architecture)
5. [Real-Time Architecture](#5-realtime)
6. [Integration Layer](#6-integrations)
7. [Caching Strategy](#7-caching)
8. [Vector Database (RAG)](#8-vector-database)
9. [Object Storage](#9-object-storage)
10. [Data Flow Examples](#10-data-flows)
11. [Migration Strategy](#11-migrations)
12. [Performance Optimization](#12-performance)

---

## **1. DATA ARCHITECTURE OVERVIEW** {#1-overview}

### **1.1 The Five Data Stores**

Our architecture uses **five specialized data stores**, each optimized for its specific purpose:

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATA ARCHITECTURE                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  POSTGRESQL (Supabase) - Primary Database           │      │
│  │  ─────────────────────────────────────────           │      │
│  │  Purpose: All structured data                        │      │
│  │  Tables: 30+ tables (users, organizations, controls, │      │
│  │          evidence, approvals, agent executions, etc.)│      │
│  │  Why: ACID compliance, relationships, transactions   │      │
│  │  Access: Prisma ORM (type-safe queries)              │      │
│  │  Migration: From Neon on November 17, 2025          │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  REDIS (Upstash) - High-Speed Cache                  │      │
│  │  ─────────────────────────────────────────           │      │
│  │  Purpose: Performance optimization + pub/sub         │      │
│  │  Uses: API response caching, session storage,        │      │
│  │        real-time pub/sub for live updates            │      │
│  │  Why: Sub-millisecond reads, reduces DB load 80%+    │      │
│  │  TTL Strategy: 5min-24hr depending on data type      │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  PINECONE - Vector Database (RAG)                    │      │
│  │  ─────────────────────────────────────────           │      │
│  │  Purpose: Semantic search for compliance knowledge   │      │
│  │  Content: SOC 2 controls, audit questions, policies, │      │
│  │          best practices, learned patterns             │      │
│  │  Why: Enables Compliance Copilot, context retrieval  │      │
│  │  Embeddings: OpenAI text-embedding-3-large (3072d)   │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  SUPABASE STORAGE - Object Storage (Evidence Files) │      │
│  │  ─────────────────────────────────────────           │      │
│  │  Purpose: Store binary evidence (screenshots, PDFs)  │      │
│  │  Buckets: evidence-files, policy-documents, reports  │      │
│  │  Organization: /org-id/evidence/control-id/file.pdf  │      │
│  │  Why: Integrated with DB, RLS policies, CDN delivery │      │
│  │  Access: Pre-signed URLs (security + performance)    │      │
│  │  Migration: From AWS S3 on November 17, 2025        │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  TEMPORAL - Workflow Persistence                     │      │
│  │  ─────────────────────────────────────────           │      │
│  │  Purpose: Durable workflow state                     │      │
│  │  Content: Long-running audit workflows, task queues  │      │
│  │  Why: Survives crashes, provides audit trail         │      │
│  │  Access: Temporal SDK (workflow definitions)         │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### **1.2 Data Flow Philosophy**

**Write Path:**
```
User Action → API → Agent Execution → Database Write → Cache Invalidation → Real-Time Broadcast

Example: User approves vendor assessment
1. UI sends approval via tRPC
2. API validates user has permission
3. Database: Update approval status
4. Redis: Invalidate vendor cache
5. Supabase Realtime: Broadcast approval to all connected clients
6. Agent: Trigger next workflow step (e.g., add to registry)
```

**Read Path:**
```
User Request → Check Cache → Database Query → Cache Update → Return Data

Example: User loads dashboard
1. UI requests dashboard data via tRPC
2. API checks Redis for cached dashboard
3. If miss: Query PostgreSQL, compute metrics
4. Store results in Redis (TTL: 5 minutes)
5. Return data to UI
6. Next request within 5 min: Instant from cache
```

### **1.3 Data Consistency Model**

We use **eventual consistency** for non-critical data and **strong consistency** for critical decisions:

**Strong Consistency (Immediate):**
- User authentication (login/logout)
- Approvals (control decision-making)
- Agent execution status (prevent race conditions)
- Billing/subscription changes

**Eventual Consistency (Seconds):**
- Dashboard metrics (up to 5 min stale acceptable)
- Evidence counts (daily collection, no need for real-time)
- Activity feeds (seconds delay acceptable)
- Agent suggestions (background processing)

**Trade-off Rationale:**

Strong consistency requires database reads on every request (slow). Eventual consistency allows caching (fast). We optimize for **fast user experience** on read-heavy operations (dashboards, lists) while ensuring **correctness** on write-critical operations (approvals, billing).

---

## **2. COMPLETE DATABASE SCHEMA** {#2-database-schema}

### **2.1 Core Entity Tables**

#### **Table: organizations**

The root entity - every object belongs to an organization.

```
Purpose: Multi-tenant isolation + organizational context
Relationships: Has many users, controls, evidence, audits
Indexing: Primary key (UUID), unique on slug

Fields:
├─ id (UUID): Unique identifier
├─ name (String): "Acme Corp"
├─ slug (String): "acme-corp" (used in URLs)
├─ domain (String): "acme.com" (for email validation)
├─ industry (Enum): SaaS | Healthcare | Finance | Other
├─ size (Enum): 1-10 | 11-50 | 51-200 | 201-500 | 500+
├─ subscription_tier (Enum): Free | Starter | Professional | Enterprise
├─ subscription_status (Enum): Trial | Active | Canceled | Expired
├─ trial_ends_at (DateTime): When trial expires
├─ billing_email (String): "billing@acme.com"
├─ settings (JSON): Flexible organizational preferences
│   ├─ features_enabled: ["vision_evidence", "questionnaire_automation"]
│   ├─ integrations: {"aws": true, "okta": true}
│   └─ approval_thresholds: {"vendor_assessment": 85}
├─ created_at (DateTime)
├─ updated_at (DateTime)
└─ deleted_at (DateTime | null): Soft delete for data retention
```

**Key Decisions:**

- **Multi-tenancy approach**: Schema per tenant vs. Row-level isolation
  - Decision: Row-level isolation (all orgs share tables)
  - Why: Simpler deployment, easier cross-org analytics for us
  - Security: Prisma middleware enforces org_id filtering on all queries

- **Soft deletes**: Preserve audit trail even after org cancels
  - Retention: 90 days for free tier, 1 year for paid

---

#### **Table: users**

Individual user accounts within organizations.

```
Purpose: Authentication, authorization, activity tracking
Relationships: Belongs to organization, has many approvals, has many activities

Fields:
├─ id (UUID)
├─ organization_id (UUID FK → organizations.id)
├─ email (String, unique per org)
├─ name (String): "Jane Smith"
├─ avatar_url (String | null): Link to profile picture
├─ role (Enum): Owner | Admin | Member | Auditor (read-only)
├─ permissions (JSON): Fine-grained permissions
│   ├─ compliance: ["view", "approve"]
│   ├─ vendors: ["view", "assess", "approve"]
│   ├─ agents: ["view", "configure"]
│   └─ settings: ["view", "edit"]
├─ auth_user_id (String, unique): Link to Supabase Auth (migrated from Clerk on Nov 17, 2025)
├─ last_active_at (DateTime): For session tracking
├─ preferences (JSON): User-specific UI preferences
│   ├─ dashboard_layout: "compact" | "detailed"
│   ├─ notifications: {"email": true, "slack": false}
│   └─ timezone: "America/Los_Angeles"
├─ created_at (DateTime)
├─ updated_at (DateTime)
└─ deleted_at (DateTime | null)
```

**Role-Based Permissions Matrix:**

| Action | Owner | Admin | Member | Auditor |
|--------|-------|-------|--------|---------|
| **View compliance data** | ✅ | ✅ | ✅ | ✅ |
| **Approve vendor assessments** | ✅ | ✅ | ❌ | ❌ |
| **Configure agents** | ✅ | ✅ | ❌ | ❌ |
| **Manage users** | ✅ | ✅ | ❌ | ❌ |
| **Billing & subscriptions** | ✅ | ❌ | ❌ | ❌ |
| **Delete organization** | ✅ | ❌ | ❌ | ❌ |

**Implementation Note**: Permission checks happen at API layer (tRPC middleware) before any database query executes.

---

#### **Table: frameworks**

Compliance frameworks (SOC 2, ISO 27001, HIPAA, etc.)

```
Purpose: Define compliance standards and their controls
Relationships: Has many controls, referenced by audits

Fields:
├─ id (UUID)
├─ name (String): "SOC 2 Type II"
├─ short_name (String): "SOC2" (for display)
├─ version (String): "2017" (frameworks evolve)
├─ category (Enum): Security | Privacy | Healthcare | Financial
├─ description (Text): Full framework description
├─ control_count (Int): 150 (for progress tracking)
├─ official_url (String): Link to AICPA/ISO documentation
├─ is_active (Boolean): Whether framework is still used
├─ metadata (JSON): Framework-specific data
│   ├─ trust_criteria: ["Security", "Availability", "Confidentiality"]
│   ├─ common_criteria_count: 64
│   └─ category_specific_count: 86
├─ created_at (DateTime)
└─ updated_at (DateTime)
```

**Seeded Data**: Pre-populate with:
- SOC 2 Trust Services Criteria (2017)
- ISO/IEC 27001:2022
- HIPAA Security Rule
- PCI DSS v4.0
- GDPR (data protection requirements)
- NIST Cybersecurity Framework v1.1

---

#### **Table: controls**

Individual controls within frameworks (e.g., CC6.2: Multi-factor authentication)

```
Purpose: Granular compliance requirements + evidence mapping
Relationships: Belongs to framework, has many evidence items, referenced by gaps

Fields:
├─ id (UUID)
├─ framework_id (UUID FK → frameworks.id)
├─ control_id (String): "CC6.2" (framework's own ID)
├─ title (String): "Multi-Factor Authentication"
├─ description (Text): Full control requirement
├─ category (String): "Logical Access" (for grouping)
├─ objective (Text): What this control aims to achieve
├─ testing_procedures (Text[]): How auditors test this control
├─ evidence_types (String[]): ["configuration_screenshot", "user_report", "MFA_logs"]
├─ collection_frequency (Enum): Daily | Weekly | Monthly | Quarterly | Annual | Point-in-Time
├─ difficulty (Enum): Low | Medium | High | Very High
├─ common_gaps (String[]): Known issues companies face
├─ remediation_guidance (Text): How to fix if failing
├─ related_controls (UUID[]): Other controls that are similar
├─ ai_prompt_template (Text): How agents should approach this control
├─ created_at (DateTime)
└─ updated_at (DateTime)
```

**AI Prompt Template Example** (for CC6.2):
```
You are assessing multi-factor authentication (MFA) implementation.

Check:
1. Is MFA enabled for all user accounts (not just admins)?
2. What MFA methods are allowed (SMS, TOTP, hardware keys)?
3. Are there any bypass mechanisms or exceptions?
4. Is MFA enforcement configured at the IDP level or per-app?

Evidence to collect:
- Screenshot of MFA policy configuration
- User enrollment report (% of users with MFA enabled)
- Sample authentication logs showing MFA challenges

Red flags:
- MFA is "optional" rather than "required"
- SMS-only MFA (vulnerable to SIM swap)
- Exceptions for certain user groups without justification
```

**Why This Matters**: When an agent assesses a control, it uses this template to know exactly what to look for and how to evaluate evidence.

---

### **2.2 Agent Execution Tables**

#### **Table: agent_executions**

Every time an agent runs, we record the execution.

```
Purpose: Audit trail + debugging + performance monitoring
Relationships: Belongs to organization, references agent, produces evidence

Fields:
├─ id (UUID)
├─ organization_id (UUID FK → organizations.id)
├─ agent_id (String): "access-control-agent" (from Part 4)
├─ agent_name (String): "Access Control Agent" (display name)
├─ task_type (Enum): Discovery | Assessment | Evidence Collection | Remediation | Questionnaire Response
├─ status (Enum): Pending | Running | Completed | Failed | Canceled
├─ triggered_by (Enum): User | Schedule | Event | Another Agent
├─ trigger_context (JSON): Why this agent was invoked
│   ├─ user_id: UUID (if user-triggered)
│   ├─ schedule: "daily_mfa_check" (if scheduled)
│   ├─ event: "new_vendor_discovered" (if event-driven)
│   └─ parent_execution_id: UUID (if triggered by another agent)
├─ inputs (JSON): What the agent received as inputs
├─ outputs (JSON): What the agent produced
├─ reasoning (Text): Agent's chain-of-thought explanation
├─ confidence_score (Int 0-100): How confident the agent is
├─ tools_used (String[]): ["aws_sdk", "claude_vision", "playwright"]
├─ llm_calls (Int): Number of LLM API calls made
├─ total_tokens (Int): Sum of input + output tokens
├─ cost_usd (Decimal): Estimated cost (for tracking)
├─ started_at (DateTime)
├─ completed_at (DateTime | null)
├─ duration_ms (Int | null): Execution time in milliseconds
├─ error_message (Text | null): If status = Failed
├─ error_stack (Text | null): For debugging
├─ retry_count (Int): How many times this execution was retried
├─ created_at (DateTime)
└─ updated_at (DateTime)
```

**Performance Metrics We Track:**

- Average execution time per agent type
- Success rate (completed / total)
- Cost per execution (for budget monitoring)
- Token usage trends (optimize prompts to reduce tokens)
- Retry patterns (identify flaky integrations)

**Querying Examples:**

```sql
-- Which agent costs the most to run?
SELECT
  agent_id,
  COUNT(*) as executions,
  AVG(cost_usd) as avg_cost,
  SUM(cost_usd) as total_cost
FROM agent_executions
WHERE organization_id = 'org-123'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY agent_id
ORDER BY total_cost DESC;

-- Which executions are taking too long?
SELECT
  id, agent_name, task_type, duration_ms
FROM agent_executions
WHERE status = 'Running'
  AND started_at < NOW() - INTERVAL '1 hour';
```

---

#### **Table: agent_decisions**

When agents make recommendations that need human approval.

```
Purpose: Human-in-the-loop workflow + learning from feedback
Relationships: Belongs to execution, referenced by approval

Fields:
├─ id (UUID)
├─ organization_id (UUID FK)
├─ execution_id (UUID FK → agent_executions.id)
├─ agent_id (String)
├─ decision_type (Enum): Vendor Approval | Evidence Acceptance | Gap Prioritization | Policy Recommendation
├─ recommendation (String): "APPROVE vendor XYZ as LOW RISK"
├─ reasoning (Text): Multi-paragraph explanation
├─ evidence_supporting (JSON[]): References to evidence
├─ alternatives_considered (JSON[]): What else agent thought about
├─ confidence_score (Int 0-100)
├─ risk_level (Enum): Low | Medium | High | Critical
├─ requires_approval (Boolean): True if human must approve
├─ auto_approved (Boolean): True if confidence > threshold
├─ approval_status (Enum): Pending | Approved | Rejected | Expired
├─ approved_by_user_id (UUID FK | null)
├─ approval_reasoning (Text | null): Why human approved/rejected
├─ approved_at (DateTime | null)
├─ expires_at (DateTime): Decisions expire after 7 days
├─ created_at (DateTime)
└─ updated_at (DateTime)
```

**Decision Lifecycle:**

```
1. Agent Execute → Creates decision record (status: Pending)
2. If confidence > 95% AND low risk → Auto-approve
3. Else → Send to approval queue
4. Human reviews → Approves or Rejects
5. Agent learns from feedback → Adjusts future confidence thresholds
```

**Learning Loop:**

When a human approves a decision at 85% confidence, the agent learns: "Decisions at 85% confidence for this decision_type are acceptable." Next time, agent may auto-approve at 85% instead of requiring review.

When a human rejects a decision at 92% confidence, the agent learns: "I was overconfident. Increase scrutiny for this pattern."

---

### **2.3 Evidence & Compliance Tables**

#### **Table: evidence**

All evidence collected by agents (screenshots, reports, logs, etc.)

```
Purpose: Store evidence that demonstrates control effectiveness
Relationships: Belongs to organization, references control, references execution

Fields:
├─ id (UUID)
├─ organization_id (UUID FK)
├─ control_id (UUID FK → controls.id)
├─ collection_method (Enum): API | Vision | Manual Upload
├─ evidence_type (Enum): Screenshot | PDF Document | CSV Report | JSON Export | Video Recording
├─ file_path (String): S3/R2 path to actual file
├─ file_size_bytes (Int)
├─ file_hash (String): SHA-256 for integrity verification
├─ collected_at (DateTime): When evidence was gathered
├─ collection_period_start (Date): Evidence covers from this date
├─ collection_period_end (Date): Evidence covers until this date
├─ agent_execution_id (UUID FK | null): Which agent collected this
├─ manual_upload_by (UUID FK | null): If user uploaded manually
├─ validation_status (Enum): Pending | Validated | Rejected | Expired
├─ validated_by_agent_id (String | null): Evidence Management Agent
├─ validated_at (DateTime | null)
├─ validation_notes (Text | null): Why evidence was accepted/rejected
├─ metadata (JSON): Evidence-specific data
│   ├─ screenshot_url: "https://..."
│   ├─ page_title: "Okta Admin Console - MFA Settings"
│   ├─ timestamp_in_screenshot: "2025-11-16 14:32 UTC"
│   ├─ detected_values: {"mfa_enabled": true, "users_enrolled": 247}
│   └─ audit_findings: [] (if auditor questioned this evidence)
├─ tags (String[]): ["mfa", "okta", "q4_2025"]
├─ is_public (Boolean): Can this be shown in Trust Center?
├─ retention_until (Date): When evidence can be deleted (7 years for SOC 2)
├─ created_at (DateTime)
└─ updated_at (DateTime)
```

**Evidence Lifecycle:**

```
1. Collection → Agent gathers evidence (status: Pending)
2. Validation → Evidence Management Agent reviews (status: Validated/Rejected)
3. Audit → Auditor reviews during audit
4. Retention → Evidence kept for 7 years
5. Expiration → Automated deletion after retention period
```

**Storage Calculation:**

If an organization collects 1,500 evidence items per year at average 2MB each:
- Storage: 3GB/year
- 7-year retention: 21GB total
- Cost at $0.02/GB/month: $4.20/year (very affordable)

---

#### **Table: audits**

Formal audits (SOC 2 Type II, ISO 27001, etc.)

```
Purpose: Track audit lifecycle from planning to completion
Relationships: Belongs to organization, references framework

Fields:
├─ id (UUID)
├─ organization_id (UUID FK)
├─ framework_id (UUID FK → frameworks.id)
├─ audit_type (Enum): Type I | Type II | Surveillance | Certification
├─ status (Enum): Planning | In Progress | Fieldwork | Review | Complete | Failed
├─ audit_firm (String): "Deloitte" | "PwC" | "EY" | "KPMG"
├─ lead_auditor_name (String): "Sarah Chen"
├─ lead_auditor_email (String): "sarah.chen@deloitte.com"
├─ audit_period_start (Date): 2025-01-01
├─ audit_period_end (Date): 2025-12-31 (12 months for Type II)
├─ fieldwork_start_date (Date): When auditors begin on-site work
├─ fieldwork_end_date (Date): When fieldwork concludes
├─ report_expected_date (Date): When we expect audit report
├─ report_received_date (Date | null): When report was delivered
├─ opinion (Enum | null): Unqualified | Qualified | Adverse | Disclaimer
├─ findings_count (Int): Number of audit findings
├─ observations_count (Int): Number of observations (minor issues)
├─ evidence_package_path (String): Link to full evidence ZIP
├─ audit_report_path (String | null): S3 path to final report PDF
├─ cost_usd (Decimal): How much we paid for the audit
├─ created_at (DateTime)
├─ updated_at (DateTime)
└─ completed_at (DateTime | null)
```

**Audit Timeline (SOC 2 Type II Example):**

```
Month -6: Planning phase (status: Planning)
├─ Select audit firm
├─ Define scope
└─ Prepare evidence

Month -3 to 0: Evidence collection (status: In Progress)
├─ Agents collect evidence daily/weekly
├─ Evidence Management validates completeness
└─ Audit Coordinator prepares package

Month 0: Fieldwork (status: Fieldwork)
├─ Auditors review evidence package
├─ Conduct interviews
├─ Test controls (sample 25 items)
└─ Identify findings

Month 0-1: Report drafting (status: Review)
├─ Draft findings shared with management
├─ Management responses prepared
├─ Final report issued

Month 1: Completion (status: Complete)
└─ Report published + opinion issued
```

---

#### **Table: audit_findings**

Issues identified by auditors during fieldwork.

```
Purpose: Track deficiencies and corrective actions
Relationships: Belongs to audit, references control

Fields:
├─ id (UUID)
├─ audit_id (UUID FK → audits.id)
├─ control_id (UUID FK → controls.id)
├─ finding_type (Enum): Control Deficiency | Material Weakness | Observation | Best Practice
├─ severity (Enum): Critical | High | Medium | Low
├─ title (String): "Emergency changes lacked post-approval"
├─ description (Text): Full finding description from auditor
├─ root_cause (Text): Management's root cause analysis
├─ management_response (Text): Our response to finding
├─ corrective_action_plan (Text): How we'll fix it
├─ remediation_owner_id (UUID FK → users.id): Who's responsible
├─ remediation_due_date (Date)
├─ remediation_status (Enum): Open | In Progress | Remediated | Accepted | Closed
├─ remediation_evidence_id (UUID FK | null): Evidence of fix
├─ auditor_validated (Boolean): Did auditor accept remediation?
├─ created_at (DateTime)
└─ updated_at (DateTime)
```

**Finding Lifecycle:**

```
1. Identified → Auditor discovers issue (status: Open)
2. Response → Management writes corrective action plan (status: In Progress)
3. Implementation → Team fixes the issue (status: Remediated)
4. Validation → Auditor verifies fix (auditor_validated: true)
5. Closure → Finding closed (status: Closed)
```

---

### **2.4 Vendor & Third-Party Risk Tables**

#### **Table: vendors**

All third-party vendors/suppliers.

```
Purpose: Vendor inventory + risk assessment tracking
Relationships: Has many assessments, integrations, contracts

Fields:
├─ id (UUID)
├─ organization_id (UUID FK)
├─ name (String): "Stripe"
├─ website (String): "stripe.com"
├─ primary_contact_name (String): "Account Manager Name"
├─ primary_contact_email (String): "am@stripe.com"
├─ discovery_method (Enum): Expense Report | SSO Logs | Manual Entry | API Discovery
├─ discovered_by_agent_id (String | null): Which agent found this vendor
├─ discovered_at (DateTime)
├─ vendor_type (Enum): SaaS | Infrastructure | Professional Services | Hardware | Other
├─ services_provided (Text): What does this vendor do for us?
├─ data_processed (Enum[]): None | PII | PHI | Financial | Source Code
├─ criticality (Enum): Critical | High | Medium | Low
│   ├─ Critical: Downtime causes business outage
│   ├─ High: Important but has workarounds
│   ├─ Medium: Useful but not essential
│   └─ Low: Nice to have
├─ annual_spend_usd (Decimal): How much we pay them/year
├─ user_count (Int): How many of our employees use this
├─ status (Enum): Active | Inactive | Offboarding | Offboarded
├─ risk_score (Int 0-100): Calculated risk (higher = riskier)
├─ last_assessment_date (Date | null)
├─ next_assessment_due (Date | null): Based on criticality
├─ has_soc2 (Boolean): Do they have SOC 2?
├─ soc2_report_date (Date | null)
├─ soc2_report_path (String | null): S3 path to their report
├─ has_iso27001 (Boolean)
├─ iso27001_cert_date (Date | null)
├─ has_hipaa_baa (Boolean): Business Associate Agreement
├─ contract_start_date (Date)
├─ contract_end_date (Date)
├─ auto_renewal (Boolean)
├─ created_at (DateTime)
└─ updated_at (DateTime)
```

**Vendor Criticality Assessment Logic:**

```
Critical vendors (require immediate attention):
├─ Process customer PII/PHI/financial data
├─ Can cause business outage if down
├─ Annual spend > $100K
└─ Used by >50% of employees

High criticality vendors:
├─ Process sensitive data OR cause major impact
├─ Annual spend $25K-$100K
└─ Used by >25% of employees

Medium/Low: Everything else
```

**Reassessment Frequency:**

```
Critical vendors: Quarterly
High vendors: Semi-annually
Medium vendors: Annually
Low vendors: Every 2 years or on contract renewal
```

---

#### **Table: vendor_assessments**

Security assessments of vendors (questionnaires, SOC 2 reviews).

```
Purpose: Track vendor security posture over time
Relationships: Belongs to vendor

Fields:
├─ id (UUID)
├─ vendor_id (UUID FK → vendors.id)
├─ assessment_type (Enum): Security Questionnaire | SOC 2 Review | ISO 27001 Review | On-Site Audit | Penetration Test Review
├─ assessment_date (Date)
├─ assessed_by_user_id (UUID FK | null): Human reviewer
├─ assessed_by_agent_id (String | null): "vendor-risk-agent"
├─ risk_rating (Enum): Low | Medium | High | Critical
├─ risk_score (Int 0-100): Calculated score
├─ findings (JSON[]): Issues discovered
│   ├─ [{
│   │   category: "Access Control",
│   │   issue: "No MFA for admin accounts",
│   │   severity: "High",
│   │   recommendation: "Require MFA for all admin access"
│   │  }]
├─ strengths (String[]): Positive findings
├─ questionnaire_responses (JSON | null): If questionnaire-based
├─ soc2_review_notes (Text | null): If SOC 2 report reviewed
├─ approval_status (Enum): Pending | Approved | Rejected | Conditionally Approved
├─ approval_conditions (String[] | null): "Must enable MFA by 2026-01-01"
├─ approved_by_user_id (UUID FK | null)
├─ approved_at (DateTime | null)
├─ next_assessment_due (Date): When to reassess
├─ created_at (DateTime)
└─ updated_at (DateTime)
```

**Agent-Powered Assessment Process:**

```
1. Vendor Discovery → Vendor Risk Agent finds new vendor in expense report
2. Enrichment → Agent searches for vendor website, SOC 2 report
3. Initial Assessment → Agent analyzes public information
4. Risk Scoring → Agent calculates preliminary risk score (0-100)
5. Human Review → If score > threshold, send to approval queue
6. Approval → Human reviews agent's assessment + approves/rejects
7. Monitoring → Agent schedules next assessment based on criticality
```

---

### **2.5 Approval Workflow Tables**

#### **Table: approvals**

All items awaiting human approval (agent decisions, vendor assessments, policy changes).

```
Purpose: Central approval queue for human-in-the-loop
Relationships: Can reference multiple entity types (polymorphic)

Fields:
├─ id (UUID)
├─ organization_id (UUID FK)
├─ approval_type (Enum): Vendor Assessment | Evidence Validation | Gap Remediation | Policy Change | Questionnaire Response | Agent Decision
├─ entity_type (String): "vendor_assessment" | "agent_decision" | "policy"
├─ entity_id (UUID): Foreign key to relevant table
├─ title (String): "Approve Stripe as low-risk vendor"
├─ description (Text): Context for approver
├─ requested_by_agent_id (String): Which agent is asking
├─ requested_by_user_id (UUID FK | null): If user-initiated
├─ agent_recommendation (Enum): Approve | Reject | More Info Needed
├─ agent_reasoning (Text): Why agent recommends this action
├─ agent_confidence (Int 0-100)
├─ evidence_links (String[]): URLs to supporting evidence
├─ priority (Enum): Low | Medium | High | Urgent
├─ status (Enum): Pending | Approved | Rejected | Expired
├─ assigned_to_user_id (UUID FK | null): Specific user or role-based
├─ reviewed_by_user_id (UUID FK | null)
├─ review_decision (Enum | null): Approve | Reject | Request Changes
├─ review_reasoning (Text | null): Why human decided this way
├─ reviewed_at (DateTime | null)
├─ expires_at (DateTime): Auto-reject if not reviewed by this time
├─ created_at (DateTime)
└─ updated_at (DateTime)
```

**Approval Queue Management:**

Users see approvals in priority order:
1. Urgent (SLA: 4 hours)
2. High (SLA: 24 hours)
3. Medium (SLA: 3 days)
4. Low (SLA: 7 days)

Expired approvals automatically reject with notification to requester.

**Learning from Approvals:**

Every approval/rejection trains the agents:

```
If user approves agent recommendation at 85% confidence:
  → Agent learns: "This user trusts my decisions at 85%+"
  → Next time: May auto-approve similar items at 85%

If user rejects agent recommendation at 92% confidence:
  → Agent learns: "I was overconfident on this pattern"
  → Next time: Lower confidence threshold, require review
```

---

## **3. AGENT-FIRST DATA MODEL** {#3-agent-model}

### **3.1 Why "Agent-First" Matters**

**Traditional GRC Data Model:**
```
User creates record → System stores it → Report shows it

Tables focused on:
- Assets (manually entered)
- Controls (manually mapped)
- Evidence (manually uploaded)
```

**Our Agent-First Data Model:**
```
Agent discovers data → Agent creates record → User reviews → System stores

Tables focused on:
- Agent executions (who did what, when, why)
- Agent decisions (recommendations + reasoning)
- Human approvals (oversight + feedback)
- Learning feedback (improve over time)
```

### **3.2 Agent Execution as First-Class Entity**

Every agent action is recorded with full context:

**What We Track:**

```
WHEN did agent run?
├─ started_at, completed_at, duration_ms

WHY did agent run?
├─ triggered_by: User | Schedule | Event | Another Agent
├─ trigger_context: Detailed explanation

WHAT did agent do?
├─ inputs: What data agent received
├─ outputs: What agent produced
├─ tools_used: ["aws_sdk", "claude_vision"]

HOW did agent think?
├─ reasoning: Chain-of-thought explanation
├─ confidence_score: How certain is the agent?
├─ alternatives_considered: What else agent thought about

DID it work?
├─ status: Completed | Failed
├─ error_message: If failed, why?
├─ retry_count: How many attempts?

HOW much did it cost?
├─ llm_calls: Number of API calls
├─ total_tokens: Input + output tokens
├─ cost_usd: Estimated cost
```

**Why This Granularity?**

1. **Debugging**: When agent fails, we know exactly what went wrong
2. **Performance**: Track slow executions and optimize
3. **Cost Control**: Monitor LLM usage to stay within budget
4. **Audit Trail**: Complete history for compliance
5. **Learning**: Analyze successful patterns to improve

### **3.3 Decision Provenance**

Every decision an agent makes is traceable:

```
Decision Record:
├─ What: "Approve Stripe as low-risk vendor"
├─ Why: "Valid SOC 2 Type II report, no breach history, used by 1000+ companies"
├─ How Confident: 92% (high confidence)
├─ What Evidence: [soc2_report.pdf, breach_search_results.json]
├─ What Alternatives: "Could request on-site audit, but SOC 2 is sufficient for low-data vendors"
├─ Human Decision: Approved
├─ Learning: "User approved 92% confidence vendor assessment → increase auto-approval threshold to 90%"
```

This creates a **decision graph** where we can trace:
- Why did we approve this vendor? (Answer: Agent ABC recommended it on DATE because REASONING)
- Why did agent recommend approval? (Answer: Found SOC 2 report + no breaches)
- Where did agent get SOC 2 report? (Answer: Execution XYZ collected it via Vision from vendor website)

**Auditor Value**: During audits, we can show complete decision provenance, not just "we approved this vendor" but WHY and WHO (agent + human) made that decision.

---

## **4. API ARCHITECTURE** {#4-api-architecture}

### **4.1 API Layers**

We use a **three-tier API architecture**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    TIER 1: tRPC (Internal)                       │
│  ──────────────────────────────────────────────────────          │
│  Purpose: Type-safe API for Next.js frontend                    │
│  Authentication: Supabase Auth session-based                     │
│  Transport: HTTP POST to /api/trpc                               │
│  Validation: Zod schemas                                         │
│  Performance: Response caching with Redis                        │
│                                                                  │
│  Example Routes:                                                 │
│  ├─ dashboard.getMetrics()                                      │
│  ├─ approvals.list({ status: 'pending' })                      │
│  ├─ agents.execute({ agentId: 'discovery', params: {...} })    │
│  └─ evidence.upload({ controlId, file })                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   TIER 2: REST API (External)                    │
│  ──────────────────────────────────────────────────────          │
│  Purpose: Third-party integrations + webhooks                    │
│  Authentication: API keys (Bearer token)                         │
│  Transport: RESTful HTTP (GET/POST/PUT/DELETE)                  │
│  Documentation: OpenAPI 3.0 spec                                │
│  Rate Limiting: 1000 req/hour per API key                       │
│                                                                  │
│  Example Endpoints:                                              │
│  ├─ GET  /api/v1/controls                                       │
│  ├─ POST /api/v1/evidence                                       │
│  ├─ POST /api/v1/webhooks/agent-completed                       │
│  └─ GET  /api/v1/audits/{id}/report                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              TIER 3: Supabase Realtime (Real-Time)               │
│  ──────────────────────────────────────────────────────          │
│  Purpose: Live updates to connected clients                      │
│  Authentication: Supabase Auth session token in handshake        │
│  Transport: WebSocket over WSS (PostgreSQL replication)          │
│  Events: Database changes broadcast to subscribed clients        │
│  Benefits: RLS enforced, automatic reconnection                  │
│                                                                  │
│  Example Events:                                                 │
│  ├─ agent_executions INSERT/UPDATE                              │
│  ├─ approvals INSERT/UPDATE                                     │
│  ├─ evidence INSERT/UPDATE                                      │
│  └─ Real-time progress tracking for all tables                  │
└─────────────────────────────────────────────────────────────────┘
```

### **4.2 tRPC Router Structure**

**Why tRPC?**

Traditional REST APIs have a fundamental problem:
```typescript
// Frontend: No type safety
const response = await fetch('/api/controls');
const data = await response.json(); // What type is this? 🤷

// Backend: Separate type definitions
app.get('/api/controls', async (req, res) => {
  // TypeScript can't connect these two worlds
});
```

**tRPC Solution:**
```typescript
// Backend defines procedure with input/output types
export const controlsRouter = router({
  list: publicProcedure
    .input(z.object({ frameworkId: z.string().uuid() }))
    .output(z.array(ControlSchema))
    .query(async ({ input, ctx }) => {
      return await ctx.db.control.findMany({
        where: { frameworkId: input.frameworkId }
      });
    })
});

// Frontend gets FULL type safety (autocomplete + errors)
const controls = await trpc.controls.list.query({ frameworkId: '...' });
// TypeScript knows controls is Control[] - autocomplete works!
```

**Router Organization:**

```
app/
└─ api/
   └─ trpc/
      └─ routers/
         ├─ dashboard.ts      → Dashboard metrics, charts
         ├─ approvals.ts      → Approval queue operations
         ├─ agents.ts         → Agent execution, status
         ├─ evidence.ts       → Evidence upload, validation
         ├─ controls.ts       → Control mappings, gaps
         ├─ frameworks.ts     → Framework data
         ├─ vendors.ts        → Vendor management
         ├─ audits.ts         → Audit lifecycle
         ├─ users.ts          → User management
         └─ copilot.ts        → Compliance Q&A (RAG)
```

**Example: Approval Router**

```
approvals.ts:

Procedures:
├─ list({ status, limit, offset })
│   Input: { status?: 'pending' | 'approved' | 'rejected', limit: int, offset: int }
│   Output: { approvals: Approval[], total: int, hasMore: boolean }
│   Auth: Requires authenticated user
│   Query: SELECT * FROM approvals WHERE status = ? AND org_id = user.org_id
│
├─ getById({ id })
│   Input: { id: UUID }
│   Output: Approval with related entities (vendor, evidence, etc.)
│   Auth: User must be in same org as approval
│   Query: SELECT with JOINs to get full context
│
├─ approve({ id, reasoning })
│   Input: { id: UUID, reasoning: string }
│   Output: { success: boolean, approval: Approval }
│   Auth: User must have approval permission
│   Mutation: UPDATE approvals SET status='approved', reviewed_by=user.id
│   Side Effects:
│     ├─ Trigger agent to proceed with next step
│     ├─ Record learning feedback (agent was right!)
│     ├─ Send WebSocket event (approval.updated)
│     └─ Send notification to requester
│
├─ reject({ id, reasoning })
│   Similar to approve but opposite
│
└─ bulkApprove({ ids, reasoning })
    Input: { ids: UUID[], reasoning: string }
    Output: { approved: int, failed: int }
    Use case: Approve 10 similar vendor assessments at once
```

**Caching Strategy:**

Expensive queries are cached in Redis:

```
Cacheable (5min TTL):
├─ Dashboard metrics (recalculated every 5min)
├─ Control list (rarely changes)
├─ Framework data (static)

Not Cacheable (always fresh):
├─ Approval queue (needs real-time accuracy)
├─ Agent execution status (changes constantly)
├─ Evidence validation (security-critical)
```

### **4.3 REST API (External Integrations)**

**Authentication:**

```
POST /api/v1/auth/api-key
{
  "name": "Production Integration",
  "scopes": ["evidence:write", "controls:read"]
}

Response:
{
  "api_key": "grc_live_kj32h4kj23h4kj2h34kjh",
  "key_id": "key_abc123",
  "scopes": ["evidence:write", "controls:read"],
  "rate_limit": 1000,
  "expires_at": null
}

Usage:
curl -H "Authorization: Bearer grc_live_kj32h4kj23h4kj2h34kjh" \
     https://api.grc.com/v1/controls
```

**Key Endpoints:**

```
Controls:
├─ GET    /v1/controls           → List all controls
├─ GET    /v1/controls/{id}      → Get control details
├─ GET    /v1/controls/{id}/evidence → Get evidence for control

Evidence:
├─ POST   /v1/evidence           → Upload evidence
├─ GET    /v1/evidence/{id}      → Get evidence details
├─ DELETE /v1/evidence/{id}      → Delete evidence

Audits:
├─ GET    /v1/audits             → List audits
├─ GET    /v1/audits/{id}/report → Download audit report PDF
├─ POST   /v1/audits/{id}/findings → Submit audit finding

Webhooks:
├─ POST   /v1/webhooks/register  → Register webhook endpoint
├─ DELETE /v1/webhooks/{id}      → Unregister webhook
└─ POST   /v1/webhooks/test      → Test webhook delivery
```

**Webhook Events:**

Third parties can subscribe to events:

```
Available Events:
├─ agent.execution.completed
├─ evidence.collected
├─ approval.required
├─ audit.started
└─ audit.completed

Webhook Payload Example:
{
  "event": "evidence.collected",
  "timestamp": "2025-11-16T14:32:47Z",
  "organization_id": "org-abc123",
  "data": {
    "evidence_id": "ev-xyz789",
    "control_id": "CC6.2",
    "collection_method": "vision",
    "file_url": "https://evidence.grc.com/signed-url"
  }
}

Webhook Delivery:
├─ Retry policy: 3 retries with exponential backoff
├─ Timeout: 30 seconds
├─ Security: HMAC signature in X-GRC-Signature header
└─ Status: Track delivery success/failure in dashboard
```

---

## **5. REAL-TIME ARCHITECTURE** {#5-realtime}

### **5.1 Why Real-Time Matters**

**The User Experience Problem:**

Traditional GRC tools feel slow and opaque:
```
User: "Is the evidence collection done?"
System: (no answer - refresh page manually)

User: (Refreshes)
System: "Still in progress..." (no idea how much longer)

User: (Refreshes again 5 minutes later)
System: "Complete!" (but user wasted 5 minutes checking)
```

**Our Real-Time Solution:**

```
User: "Is the evidence collection done?"
System: (WebSocket live updates)
  ├─ "Started collecting evidence (0/47 controls)"
  ├─ "Progress: 12/47 controls complete (26%)"
  ├─ "Progress: 23/47 controls complete (49%)"
  ├─ "Progress: 47/47 controls complete (100%)"
  └─ "Evidence collection complete! 3 items need your review."

User: (Never refreshes, gets live updates as they happen)
```

### **5.2 WebSocket Event Architecture**

**Connection Lifecycle:**

```
1. Client connects:
   ws://api.grc.com/ws?token=<clerk_session_token>

2. Server authenticates:
   ├─ Validate Clerk token
   ├─ Extract user_id + organization_id
   ├─ Store connection in Redis: ws:connections:{org_id} → [conn1, conn2, ...]
   └─ Send welcome message: {"type": "connected", "user": {...}}

3. Client subscribes to channels:
   {
     "type": "subscribe",
     "channels": ["approvals", "agents", "dashboard"]
   }

4. Server sends relevant events:
   ├─ Filter events by organization_id (security)
   ├─ Filter events by subscribed channels
   └─ Send JSON over WebSocket

5. Client disconnects:
   ├─ Remove connection from Redis
   └─ Clean up subscriptions
```

**Event Broadcasting:**

When something changes in the database, we broadcast to all connected clients:

```
Example: User approves a vendor assessment

1. tRPC mutation executes:
   └─ UPDATE approvals SET status='approved'

2. Mutation publishes event to Redis pub/sub:
   PUBLISH approvals:updated {
     "approval_id": "apr-123",
     "status": "approved",
     "entity_type": "vendor_assessment",
     "entity_id": "va-456"
   }

3. WebSocket server receives pub/sub message:
   ├─ Looks up connections for this organization
   ├─ Filters to connections subscribed to "approvals" channel
   └─ Sends event to each connection

4. Connected clients receive event:
   {
     "type": "approval.updated",
     "data": {
       "approval_id": "apr-123",
       "status": "approved",
       "title": "Stripe vendor assessment",
       "approved_by": "Jane Smith",
       "timestamp": "2025-11-16T14:32:47Z"
     }
   }

5. Frontend React updates UI:
   ├─ Remove approval from pending queue
   ├─ Show success notification
   ├─ Update dashboard metrics (pending count -1)
   └─ Trigger confetti animation 🎉
```

**Event Types:**

```
Agent Events:
├─ agent.execution.started
├─ agent.execution.progress ({ step: "Scanning AWS", progress: 45 })
├─ agent.execution.completed
├─ agent.execution.failed
└─ agent.decision.created (new item in approval queue)

Approval Events:
├─ approval.created
├─ approval.updated (approved/rejected)
└─ approval.expired

Evidence Events:
├─ evidence.collected
├─ evidence.validated
└─ evidence.rejected

Dashboard Events:
├─ dashboard.metrics.updated
├─ dashboard.alert.created
└─ dashboard.progress.updated

Audit Events:
├─ audit.started
├─ audit.finding.created
└─ audit.completed
```

### **5.3 Scalability: Redis Pub/Sub**

**The Problem:**

With 100 organizations, each with 5 users = 500 concurrent WebSocket connections. If we store connection state in-memory on a single server:

- Server crashes → all 500 connections lost
- Can't scale horizontally (connections tied to one server)
- No way to broadcast from background jobs (different process)

**The Solution: Redis Pub/Sub**

```
┌─────────────────────────────────────────────────────────────────┐
│                        REDIS (Central Hub)                       │
│  ──────────────────────────────────────────────────────          │
│  Channels:                                                       │
│  ├─ org:abc123:approvals                                        │
│  ├─ org:abc123:agents                                           │
│  └─ org:abc123:dashboard                                        │
└─────────────────────────────────────────────────────────────────┘
         ↑ PUBLISH                    ↓ SUBSCRIBE
    ┌────┴─────┐              ┌────────┴──────────┐
    │          │              │                   │
┌───▼────┐ ┌──▼─────┐  ┌─────▼────┐  ┌──────────▼────┐
│ Next.js│ │Background│  │WebSocket │  │  WebSocket   │
│  API   │ │  Worker  │  │ Server 1 │  │  Server 2    │
│        │ │          │  │          │  │              │
│Publishes│ │Publishes │  │Subscribes│  │Subscribes    │
│ events │ │  events  │  │ & sends  │  │ & sends      │
│        │ │          │  │to clients│  │to clients    │
└────────┘ └──────────┘  └──────────┘  └──────────────┘
                           ↓                  ↓
                      ┌────────────┐    ┌────────────┐
                      │Client 1-250│    │Client 251-500│
                      └────────────┘    └────────────┘
```

**How It Works:**

1. **Publishing**: Any process (API, background worker, agent) publishes events to Redis channels
2. **Subscribing**: WebSocket servers subscribe to relevant Redis channels
3. **Broadcasting**: When event arrives, WebSocket server forwards to connected clients
4. **Horizontal Scaling**: Add more WebSocket servers as load increases (all share Redis)

**Channel Naming Convention:**

```
org:{organization_id}:{event_category}

Examples:
├─ org:abc123:approvals     → All approval events for org abc123
├─ org:abc123:agents        → All agent events
├─ org:abc123:dashboard     → Dashboard updates
└─ org:xyz789:approvals     → Different org, isolated

Security:
├─ Clients can ONLY subscribe to their own organization's channels
├─ WebSocket server validates organization_id from auth token
└─ Redis prevents cross-org event leakage
```

### **5.4 Fallback: Server-Sent Events (SSE)**

For environments where WebSockets are blocked (corporate firewalls, old browsers):

```
GET /api/sse?token=<clerk_session_token>

Server Response (HTTP stream):
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

event: agent.execution.started
data: {"execution_id": "ex-123", "agent": "discovery"}

event: agent.execution.progress
data: {"execution_id": "ex-123", "progress": 45}

event: agent.execution.completed
data: {"execution_id": "ex-123", "status": "success"}
```

Frontend detects WebSocket support and falls back to SSE automatically.

---

## **6. INTEGRATION LAYER** {#6-integrations}

### **6.1 Integration Architecture**

We integrate with 50+ external systems. Each integration follows a common pattern:

```
Integration Structure:
lib/integrations/{service}/
├─ client.ts         → API client (SDK wrapper)
├─ types.ts          → TypeScript types for this service
├─ auth.ts           → OAuth/API key management
├─ mappers.ts        → Transform their data → our data model
├─ cache.ts          → Caching strategy for this integration
└─ vision-fallback.ts → Playwright flows if API unavailable
```

**Example: AWS Integration**

```
lib/integrations/aws/
├─ client.ts
│   Purpose: Wrapper around AWS SDK
│   Handles: Credential management, region iteration, rate limiting
│   Cache: 15min TTL for infrastructure lists
│
├─ services/
│   ├─ ec2.ts        → List EC2 instances
│   ├─ s3.ts         → List buckets, check encryption
│   ├─ rds.ts        → List databases, check encryption
│   ├─ iam.ts        → List users, roles, policies
│   └─ cloudwatch.ts → Fetch logs, metrics
│
├─ mappers.ts
│   Transform AWS EC2 instance → our Asset model
│   Transform AWS S3 bucket → our Evidence model
│
└─ vision-fallback.ts
    If AWS API credentials invalid:
    ├─ Launch Playwright
    ├─ Navigate to AWS Console
    ├─ Screenshot EC2 dashboard
    └─ Claude Vision extracts instance list
```

### **6.2 OAuth Integration Pattern**

For services requiring OAuth (Okta, Google Workspace, Slack):

```
OAuth Flow:

1. User clicks "Connect Okta"
   ├─ Frontend: Redirect to /api/oauth/okta/authorize
   └─ Backend: Generate state token (CSRF protection)

2. Backend redirects to Okta OAuth page
   URL: https://okta.com/oauth/authorize
        ?client_id=our_client_id
        &redirect_uri=https://grc.com/api/oauth/okta/callback
        &state=random_token_123
        &scope=okta.users.read okta.apps.read

3. User approves on Okta
   └─ Okta redirects back: /api/oauth/okta/callback?code=abc&state=random_token_123

4. Backend validates state token
   └─ Exchange code for access token + refresh token

5. Store tokens securely
   Table: integration_credentials
   ├─ organization_id
   ├─ service: "okta"
   ├─ access_token: <encrypted>
   ├─ refresh_token: <encrypted>
   ├─ expires_at: timestamp
   └─ scopes: ["okta.users.read", "okta.apps.read"]

6. Use tokens for API calls
   └─ Auto-refresh when expired
```

**Token Encryption:**

All OAuth tokens are encrypted at rest using AES-256:

```
Encryption Process:
├─ Master key: Stored in environment variable (rotated quarterly)
├─ Per-token encryption: AES-256-GCM
├─ Storage: Encrypted token in database
└─ Decryption: Only happens in-memory during API calls (never logged)
```

### **6.3 Integration Health Monitoring**

We track integration health to detect issues early:

```
Table: integration_health
├─ organization_id
├─ service: "okta" | "aws" | "github" | ...
├─ status: Healthy | Degraded | Down
├─ last_successful_call: timestamp
├─ last_failed_call: timestamp
├─ failure_count_24h: int
├─ error_message: string
└─ next_retry_at: timestamp

Health Check Logic:
├─ Every integration call updates health status
├─ If 3+ failures in 10 minutes: Mark as Degraded
├─ If 10+ failures in 1 hour: Mark as Down
├─ If down: Send alert to user + switch to vision fallback
└─ Auto-recovery: If call succeeds, mark as Healthy
```

**User Experience:**

When integration is degraded:
```
UI shows warning:
┌─────────────────────────────────────────────────────┐
│ ⚠️ AWS Integration Degraded                         │
│                                                      │
│ We're having trouble connecting to AWS. This may    │
│ cause slower evidence collection. We're using       │
│ vision-based fallback in the meantime.              │
│                                                      │
│ [Reconnect AWS] [View Details]                      │
└─────────────────────────────────────────────────────┘
```

---

## **7. CACHING STRATEGY** {#7-caching}

### **7.1 Redis Caching Layers**

**Layer 1: API Response Cache (Short TTL)**

Frequently accessed, rarely changing data:

```
Cache Key Structure:
cache:api:{route}:{params_hash}

Examples:
├─ cache:api:controls:list:abc123          (5min TTL)
├─ cache:api:frameworks:get:soc2           (1hr TTL)
├─ cache:api:dashboard:metrics:org-abc123  (5min TTL)

Invalidation:
├─ Time-based: Expire after TTL
├─ Event-based: Delete on related mutation
│   Example: When control is updated → delete cache:api:controls:*
```

**Layer 2: Database Query Cache (Medium TTL)**

Expensive database queries:

```
Cache Key: cache:query:{query_signature}

Example: Dashboard metrics calculation
Query:
  SELECT COUNT(*) FROM controls WHERE status = 'implemented'
  GROUP BY framework_id

Without cache: 2.3s query time
With cache: 8ms cache hit

TTL: 5 minutes (balance freshness vs performance)
```

**Layer 3: Computed Data Cache (Long TTL)**

Expensive computations that rarely change:

```
Cache Key: cache:computed:{type}:{id}

Examples:
├─ cache:computed:risk_score:vendor-xyz     (24hr TTL)
│   Computing vendor risk score requires:
│   ├─ Fetching all assessments
│   ├─ Analyzing SOC 2 reports
│   ├─ Checking for breaches
│   └─ Running ML model (expensive)
│
└─ cache:computed:audit_readiness:org-abc   (1hr TTL)
    Computing audit readiness requires:
    ├─ Checking 150 controls
    ├─ Validating evidence for each
    ├─ Running gap analysis
    └─ Expensive calculation (10s+)
```

### **7.2 Cache Invalidation Strategy**

**Time-to-Live (TTL) Based:**

Most caches use TTL for simplicity:
```
Short-lived (5 min): Dashboard metrics, approval counts
Medium-lived (1 hr): Framework data, control lists
Long-lived (24 hr): Vendor risk scores, audit reports
```

**Event-Driven Invalidation:**

Critical paths use event-driven invalidation:

```
Event: User approves vendor assessment

Invalidations:
├─ DELETE cache:api:approvals:list:*
├─ DELETE cache:api:vendors:get:{vendor_id}
├─ DELETE cache:api:dashboard:metrics:*
└─ DELETE cache:computed:risk_score:{vendor_id}

Why: Ensure UI shows updated data immediately
```

**Stale-While-Revalidate:**

For acceptable staleness:

```
1. Check cache → If hit, return cached data
2. If cache is >50% expired → trigger background refresh
3. Next request gets fresh data

Example: Framework control list
├─ Cache TTL: 1 hour
├─ If cache is 35 min old: Return cached data + refresh in background
└─ User always gets instant response (even if slightly stale)
```

### **7.3 Cache Performance Metrics**

We track cache effectiveness:

```
Metrics:
├─ Hit rate: hits / (hits + misses)
│   Target: >80% for frequently accessed data
│
├─ Average response time:
│   ├─ Cache hit: <10ms
│   └─ Cache miss: 50-500ms (depends on query)
│
├─ Cache size: Monitor Redis memory usage
│   Alert if >80% of allocated memory
│
└─ Eviction rate: How often Redis evicts keys
    High eviction = need more memory or shorter TTLs
```

---

## **8. VECTOR DATABASE (RAG)** {#8-vector-database}

### **8.1 Pinecone for Compliance Knowledge**

**Purpose**: Enable Compliance Copilot to answer questions using RAG (Retrieval-Augmented Generation).

**What We Store:**

```
Vector Database Contents:
├─ SOC 2 Control Definitions (150 controls)
│   Example: "CC6.2: Multi-factor authentication requirement"
│   Embedding: OpenAI text-embedding-3-large (3072 dimensions)
│
├─ Audit Questions & Answers (500+ historical Q&A pairs)
│   Example: "How do we demonstrate MFA is enforced?"
│   Answer: "Provide Okta MFA policy screenshot + user enrollment report"
│
├─ Best Practices (200+ guides)
│   Example: "How to implement least privilege access"
│   Content: Step-by-step implementation guide
│
├─ Learned Patterns (grows over time)
│   Example: "Users with 'Admin' role should have MFA"
│   Source: Approved by user 15 times → becomes pattern
│
└─ Company Policies (organization-specific)
    Example: "Acme Corp Access Control Policy v2.1"
    Private: Only accessible to Acme Corp users
```

### **8.2 Embedding Strategy**

**Document Chunking:**

SOC 2 controls are long documents. We chunk them for better retrieval:

```
Original Control (CC6.2):
"The entity restricts physical and logical access to system
 resources and information assets. The entity authorizes,
 modifies, or removes access based on rules ... [2000 words]"

Chunked:
Chunk 1 (Title): "CC6.2 - Logical Access Restriction"
Chunk 2 (Objective): "Restrict logical access to prevent unauthorized use"
Chunk 3 (Implementation): "Use multi-factor authentication for all users..."
Chunk 4 (Testing): "Auditors will review MFA policy and user enrollment..."
Chunk 5 (Evidence): "Required evidence includes policy screenshots..."

Each chunk embedded separately → better semantic search
```

**Metadata for Filtering:**

Each vector includes metadata for filtering:

```
Vector Metadata:
├─ framework: "SOC2" | "ISO27001" | "HIPAA"
├─ control_id: "CC6.2"
├─ category: "Logical Access"
├─ organization_id: "org-abc" (for private docs) | null (for public docs)
├─ document_type: "control" | "best_practice" | "policy" | "qa_pair"
└─ last_updated: timestamp
```

**Why Metadata Matters:**

When Compliance Copilot searches:
```
User asks: "How do we implement MFA?"

Query with metadata filtering:
├─ Embed query: "how to implement multi-factor authentication"
├─ Semantic search in Pinecone with filters:
│   ├─ framework: ["SOC2", "ISO27001"] (only relevant frameworks)
│   ├─ organization_id: "org-abc" OR null (include public + private docs)
│   └─ document_type: ["control", "best_practice", "policy"]
├─ Top 5 results returned
└─ Feed to Claude: "Based on these docs, answer the user's question"
```

### **8.3 RAG Query Flow**

```
1. User asks question in Copilot:
   "What evidence do I need for access control?"

2. Frontend sends to Compliance Copilot Agent

3. Agent embeds query:
   OpenAI Embedding API → 3072-dim vector

4. Agent queries Pinecone:
   ├─ Find top 10 semantically similar vectors
   ├─ Filter: organization_id = user.org OR null
   ├─ Filter: framework IN user's active frameworks
   └─ Returns: Relevant control definitions + best practices

5. Agent constructs Claude prompt:
   """
   You are a compliance expert. Answer the user's question based on these documents:

   [Document 1: CC6.1 - Access Control]
   [Document 2: CC6.2 - MFA Requirement]
   [Document 3: Best Practice: Implementing Access Reviews]
   ...

   User question: "What evidence do I need for access control?"

   Provide a detailed answer with specific evidence examples.
   """

6. Claude generates answer:
   "For access control (SOC 2 CC6.x), you'll need:
    1. MFA policy screenshot (CC6.2)
    2. Quarterly access review reports (CC6.1)
    3. User provisioning/deprovisioning logs (CC6.3)
    ..."

7. Return answer to user with source citations
```

**Source Citations:**

Every answer includes sources:
```
Answer:
"For access control, you need evidence of MFA enforcement..."

Sources:
├─ SOC 2 CC6.2 - Multi-Factor Authentication [View]
├─ Best Practice: Implementing MFA with Okta [View]
└─ Acme Corp Access Control Policy v2.1 [View]
```

This builds trust - users can verify the answer's accuracy.

---

## **9. OBJECT STORAGE** {#9-object-storage}

### **9.1 S3/R2 for Evidence Files**

**Why Object Storage?**

Evidence files (screenshots, PDFs, videos) can't go in PostgreSQL:
- Database bloat (1000 screenshots = GB of data)
- Slow queries (fetching binary data over SQL connection)
- No CDN integration (can't cache images efficiently)

Object storage (S3/Cloudflare R2) is purpose-built for files:
- Cheap: $0.01-0.02/GB/month
- Fast: CDN integration for global delivery
- Scalable: Handles petabytes
- Durable: 99.999999999% durability

**Folder Structure:**

```
grc-evidence/
├─ {organization_id}/
│   ├─ evidence/
│   │   ├─ {control_id}/
│   │   │   ├─ {evidence_id}-screenshot.png
│   │   │   ├─ {evidence_id}-report.pdf
│   │   │   └─ {evidence_id}-config.json
│   │   │
│   │   └─ archives/
│   │       └─ {year}/
│   │           └─ {control_id}/
│   │               └─ old-evidence.png
│   │
│   ├─ audits/
│   │   └─ {audit_id}/
│   │       ├─ evidence-package.zip
│   │       └─ audit-report.pdf
│   │
│   └─ exports/
│       └─ compliance-export-2025-11-16.csv
│
└─ public/ (accessible without auth)
    └─ {organization_id}/
        └─ trust-center/
            ├─ logo.png
            ├─ soc2-seal.png
            └─ policy-summary.pdf
```

### **9.2 Pre-Signed URLs for Security**

**Problem**: We can't make S3 buckets public (security risk)
**Solution**: Generate temporary URLs that expire

```
Upload Flow:

1. Frontend requests upload URL:
   POST /api/evidence/upload-url
   {
     "control_id": "CC6.2",
     "file_name": "okta-mfa-screenshot.png",
     "file_type": "image/png",
     "file_size": 245678
   }

2. Backend generates pre-signed URL:
   ├─ S3 key: {org_id}/evidence/CC6.2/{uuid}-okta-mfa-screenshot.png
   ├─ Expiration: 15 minutes
   └─ Allowed operations: PUT only

   Response:
   {
     "upload_url": "https://s3.amazonaws.com/grc-evidence/...<signature>",
     "evidence_id": "ev-xyz789",
     "expires_at": "2025-11-16T14:47:00Z"
   }

3. Frontend uploads directly to S3:
   PUT <upload_url>
   Content-Type: image/png
   Body: <binary file data>

4. Frontend confirms upload:
   POST /api/evidence/upload-complete
   { "evidence_id": "ev-xyz789" }

5. Backend records in database:
   INSERT INTO evidence (id, file_path, control_id, ...)
```

**Download Flow:**

```
1. Frontend requests file:
   GET /api/evidence/{id}/download

2. Backend generates pre-signed download URL:
   ├─ Verify user has permission (same org)
   ├─ Generate S3 pre-signed URL (expires in 5 min)
   └─ Return URL

   Response:
   {
     "download_url": "https://cloudfront.net/...<signature>",
     "expires_at": "2025-11-16T14:52:00Z"
   }

3. Frontend redirects user to URL or displays inline
```

**CDN Integration (Cloudflare R2 + CDN):**

For frequently accessed files (Trust Center assets, SOC 2 seal):
```
Static files → R2 → Cloudflare CDN → Global edge locations
├─ First request: Fetch from R2, cache in CDN
├─ Subsequent requests: Serve from nearest CDN edge (< 50ms)
└─ Cost: $0 bandwidth (R2 has free egress)
```

### **9.3 Evidence Retention & Lifecycle**

**Compliance Requirements:**

SOC 2 requires 7-year evidence retention. We automate this:

```
Evidence Lifecycle:

Year 0-1: Active evidence
├─ Location: {org_id}/evidence/{control_id}/
├─ Access: Frequent (auditors, users)
└─ Storage class: S3 Standard

Year 1-3: Recent historical evidence
├─ Location: {org_id}/evidence/archives/{year}/
├─ Access: Occasional (dispute resolution)
└─ Storage class: S3 Infrequent Access (cheaper)

Year 3-7: Long-term retention
├─ Location: {org_id}/evidence/archives/{year}/
├─ Access: Rare (legal holds)
└─ Storage class: S3 Glacier (90% cost reduction)

Year 7+: Deletion
└─ Automatic deletion (unless legal hold applied)
```

**S3 Lifecycle Policy:**

```
Rules:
├─ Transition to Infrequent Access after 365 days
├─ Transition to Glacier after 1095 days (3 years)
└─ Delete after 2555 days (7 years)

Legal Hold:
If organization has active lawsuit or investigation:
├─ Apply legal hold tag to relevant evidence
├─ Prevent deletion even after retention period
└─ Manual release when legal hold lifts
```

**Cost Optimization:**

```
Example organization: 1,500 evidence items/year, 2MB average

Storage costs (7-year retention):
├─ Year 1 (Standard): 3GB × $0.023/GB = $0.84/year
├─ Years 2-3 (Infrequent): 6GB × $0.0125/GB = $0.90/year
├─ Years 4-7 (Glacier): 12GB × $0.004/GB = $0.58/year
└─ Total 7-year cost: ~$2.32/year (negligible)
```

---

## **10. DATA FLOW EXAMPLES** {#10-data-flows}

### **10.1 End-to-End Flow: Evidence Collection**

Let's trace a complete evidence collection workflow from user click to database storage:

```
USER ACTION: "Collect MFA Evidence"
↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: User Interface (Next.js)                                 │
└─────────────────────────────────────────────────────────────────┘

User clicks "Collect Evidence" button on CC6.2 (MFA) control

Frontend executes:
├─ const result = await trpc.agents.execute.mutate({
│   agentId: 'access-control-agent',
│   task: 'collect_mfa_evidence',
│   controlId: 'CC6.2'
│  })
└─ UI shows loading state: "Access Control Agent is collecting evidence..."

↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: API Layer (tRPC Mutation)                               │
└─────────────────────────────────────────────────────────────────┘

Server receives request:
1. Validate user authentication (Clerk middleware)
2. Verify user has permission to execute agents
3. Create agent execution record:

   INSERT INTO agent_executions (
     id, organization_id, agent_id, status,
     triggered_by, trigger_context
   ) VALUES (
     'ex-abc123', 'org-xyz', 'access-control-agent', 'pending',
     'user', {'user_id': '...', 'control_id': 'CC6.2'}
   )

4. Publish WebSocket event:
   → "agent.execution.started" (real-time UI update)

5. Enqueue agent task in Temporal

↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Temporal Workflow Execution                             │
└─────────────────────────────────────────────────────────────────┘

Temporal picks up task:
├─ Starts durable workflow: EvidenceCollectionWorkflow
├─ Workflow state persisted (survives crashes)
└─ Invokes Access Control Agent activity

↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Agent Execution (Access Control Agent)                  │
└─────────────────────────────────────────────────────────────────┘

Agent executes multi-step collection:

PHASE 1: Determine Collection Method
├─ Check: Does organization have Okta API credentials?
├─ Query: integration_credentials table for Okta
├─ Result: YES → Use API-based collection
└─ Update: execution record with status='running'

PHASE 2: API Collection (Okta SDK)
├─ Tool: Okta SDK with stored credentials
├─ API Call 1: GET /api/v1/policies/mfa
│   Response: {"status": "ACTIVE", "type": "MFA_REQUIRED"}
│
├─ API Call 2: GET /api/v1/users?filter=status eq "ACTIVE"
│   Response: 247 active users
│
└─ API Call 3: GET /api/v1/users?filter=mfaEnrolled eq true
    Response: 247 users (100% enrolled)

PHASE 3: Vision-Based Verification (Screenshot)
├─ Launch Playwright browser
├─ Navigate to Okta admin console
├─ Take screenshot of MFA settings page
├─ Upload screenshot to S3:
│   Path: {org_id}/evidence/CC6.2/{uuid}-okta-mfa-settings.png
│
└─ Claude Vision analysis:
    Prompt: "Does this screenshot show MFA is REQUIRED?"
    Response: "Yes, the policy clearly states 'MFA REQUIRED FOR ALL USERS'"
    Confidence: 98%

PHASE 4: Create Evidence Records
├─ INSERT INTO evidence (
│   id, organization_id, control_id,
│   collection_method, evidence_type, file_path,
│   collected_at, validation_status
│  ) VALUES (
│   'ev-123', 'org-xyz', 'CC6.2',
│   'api', 'json_export', '{org}/evidence/CC6.2/mfa-api-export.json',
│   NOW(), 'validated'
│  )
│
├─ INSERT INTO evidence (
│   id, organization_id, control_id,
│   collection_method, evidence_type, file_path,
│   collected_at, validation_status
│  ) VALUES (
│   'ev-456', 'org-xyz', 'CC6.2',
│   'vision', 'screenshot', '{org}/evidence/CC6.2/screenshot.png',
│   NOW(), 'validated'
│  )
│
└─ UPDATE agent_executions
    SET status='completed',
        outputs='{"evidence_collected": 2, "mfa_status": "compliant"}',
        confidence_score=98,
        completed_at=NOW()
    WHERE id='ex-abc123'

↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Evidence Validation (Evidence Management Agent)         │
└─────────────────────────────────────────────────────────────────┘

Evidence Management Agent automatically triggered:
├─ Validates evidence completeness
├─ Checks evidence covers full audit period
├─ Verifies file integrity (checksums)
└─ Updates validation_status if issues found

↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Real-Time Updates (WebSocket)                           │
└─────────────────────────────────────────────────────────────────┘

Broadcast events to connected clients:

Event 1: agent.execution.progress
{
  "execution_id": "ex-abc123",
  "progress": 50,
  "step": "Collecting from Okta API"
}

Event 2: agent.execution.completed
{
  "execution_id": "ex-abc123",
  "status": "completed",
  "evidence_count": 2
}

Event 3: evidence.collected
{
  "control_id": "CC6.2",
  "evidence_ids": ["ev-123", "ev-456"],
  "collection_method": "api+vision"
}

↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: Frontend Updates                                        │
└─────────────────────────────────────────────────────────────────┘

React components respond to WebSocket events:
├─ Update progress bar: 0% → 50% → 100%
├─ Show completion notification: "✅ MFA evidence collected"
├─ Update control status: "Not Started" → "Completed"
├─ Refresh evidence list (tRPC re-fetch)
└─ Update dashboard metrics (+1 control complete)

↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 8: Cache Updates                                           │
└─────────────────────────────────────────────────────────────────┘

Redis cache invalidation:
├─ DELETE cache:api:controls:CC6.2
├─ DELETE cache:api:evidence:list:org-xyz
├─ DELETE cache:api:dashboard:metrics:org-xyz
└─ Next request will fetch fresh data from DB

TOTAL TIME: ~15 seconds
├─ API calls: 3 seconds
├─ Vision collection: 10 seconds (browser + screenshot)
├─ Database writes: 1 second
└─ Cache invalidation: 1 second
```

### **10.2 Flow: Vendor Assessment Approval**

**Scenario:** Vendor Risk Agent discovers new vendor, assesses risk, requests human approval.

```
TRIGGER: Vendor Risk Agent discovers "Stripe" in expense report

┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: Vendor Discovery                                       │
└─────────────────────────────────────────────────────────────────┘

1. Agent queries QuickBooks API → Finds $50K payment to "Stripe Inc"
2. Agent searches: Do we already have this vendor?
   ├─ Query: SELECT * FROM vendors WHERE name ILIKE '%Stripe%'
   └─ Result: Not found

3. Agent enriches data:
   ├─ Search web for "Stripe security"
   ├─ Find Stripe.com → Extract company info
   └─ Search "Stripe SOC 2 report" → Find report on vendor's Trust Center

4. Create vendor record:
   INSERT INTO vendors (
     id, organization_id, name, website,
     discovery_method, vendor_type, criticality
   ) VALUES (
     'v-123', 'org-xyz', 'Stripe', 'stripe.com',
     'expense_report', 'SaaS', 'high'
   )

↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 2: Risk Assessment                                        │
└─────────────────────────────────────────────────────────────────┘

1. Agent downloads SOC 2 report (PDF from Stripe Trust Center)
2. Claude Vision analyzes report:
   ├─ Report Type: SOC 2 Type II
   ├─ Issue Date: 2024-08-15
   ├─ Opinion: Unqualified (clean)
   ├─ Findings: 0
   └─ Validity: Report is current (< 1 year old)

3. Agent calculates risk score:
   Risk Factors:
   ├─ Data processed: Payment data (HIGH risk)
   ├─ Has SOC 2: YES (+50 points)
   ├─ Clean audit: YES (+30 points)
   ├─ Criticality: High (-20 points, more scrutiny)
   └─ Final Score: 60/100 (Medium-Low risk)

4. Create assessment record:
   INSERT INTO vendor_assessments (
     id, vendor_id, risk_rating, risk_score,
     approval_status, assessed_by_agent_id
   ) VALUES (
     'va-456', 'v-123', 'low', 60,
     'pending', 'vendor-risk-agent'
   )

↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 3: Decision & Approval Request                            │
└─────────────────────────────────────────────────────────────────┘

1. Agent creates decision:
   INSERT INTO agent_decisions (
     id, execution_id, agent_id, decision_type,
     recommendation, reasoning, confidence_score
   ) VALUES (
     'd-789', 'ex-abc', 'vendor-risk-agent', 'vendor_approval',
     'APPROVE Stripe as LOW RISK',
     'Valid SOC 2 Type II report (unqualified opinion, 0 findings).
      Company is well-established payment processor used by 100k+ companies.
      Data processed: Payment info (PCI DSS Level 1 certified).
      Risk: Low - strong security posture',
     85
   )

2. Check auto-approval threshold:
   ├─ Confidence: 85%
   ├─ Organization threshold: 90% (require review below 90%)
   └─ Decision: SEND TO APPROVAL QUEUE

3. Create approval:
   INSERT INTO approvals (
     id, organization_id, approval_type,
     entity_type, entity_id, title, priority,
     requested_by_agent_id, agent_recommendation
   ) VALUES (
     'apr-999', 'org-xyz', 'vendor_assessment',
     'vendor_assessment', 'va-456',
     'Approve Stripe as low-risk vendor', 'medium',
     'vendor-risk-agent', 'approve'
   )

4. Publish WebSocket event:
   → "approval.created" (user sees it instantly)

↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 4: Human Review                                           │
└─────────────────────────────────────────────────────────────────┘

User reviews approval in UI:
┌──────────────────────────────────────────────────────┐
│ Vendor Risk Agent recommends:                        │
│ ✅ APPROVE Stripe as LOW RISK                        │
│                                                       │
│ Reasoning:                                            │
│ • Valid SOC 2 Type II (expires 2025-08-15)           │
│ • Unqualified opinion, 0 findings                    │
│ • PCI DSS Level 1 certified                          │
│ • Used by 100,000+ companies                         │
│                                                       │
│ Data Processed: Payment information                   │
│ Annual Spend: $50,000                                 │
│ Confidence: 85%                                       │
│                                                       │
│ [Approve] [Reject] [View SOC 2 Report]              │
└──────────────────────────────────────────────────────┘

User clicks "Approve"

↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 5: Approval Processing                                    │
└─────────────────────────────────────────────────────────────────┘

1. tRPC mutation executes:
   UPDATE approvals
   SET status='approved',
       reviewed_by_user_id='user-123',
       review_decision='approve',
       reviewed_at=NOW()
   WHERE id='apr-999'

2. Update vendor assessment:
   UPDATE vendor_assessments
   SET approval_status='approved',
       approved_by_user_id='user-123',
       approved_at=NOW()
   WHERE id='va-456'

3. Update vendor status:
   UPDATE vendors
   SET status='active',
       risk_score=60,
       last_assessment_date=NOW(),
       next_assessment_due=NOW() + INTERVAL '6 months'
   WHERE id='v-123'

4. Record learning feedback:
   "User approved vendor_assessment at 85% confidence
    → Pattern: User trusts agent at this threshold
    → Action: Future similar assessments may auto-approve at 85%"

5. Publish events:
   ├─ WebSocket: "approval.updated"
   ├─ WebSocket: "vendor.approved"
   └─ Redis pub/sub: Invalidate vendor caches

↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 6: Follow-Up Actions                                      │
└─────────────────────────────────────────────────────────────────┘

1. Schedule next assessment:
   ├─ Create calendar reminder for 6 months from now
   └─ Vendor Risk Agent will auto-trigger reassessment

2. Update compliance metrics:
   ├─ Vendor registry count: +1
   ├─ Vendors with current assessments: +1
   └─ Overall vendor risk score: Recalculated

3. Send notification:
   ├─ Slack: "New vendor Stripe approved (low risk)"
   └─ Email: Monthly vendor report includes this approval

TOTAL TIME: 45 seconds (automated) + 2 minutes (human review) = ~3 min
```

---

## **11. MIGRATION STRATEGY** {#11-migrations}

### **11.1 Database Migration Philosophy**

**Guiding Principles:**

```
1. Zero Downtime: Migrations run without taking app offline
2. Backward Compatible: Old code can run on new schema temporarily
3. Incremental: Small changes, not big-bang rewrites
4. Tested: All migrations tested in staging before production
5. Reversible: Every migration has a rollback plan
```

### **11.2 Migration Workflow**

**Development → Staging → Production:**

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Local Development                                       │
└─────────────────────────────────────────────────────────────────┘

Engineer creates migration:
├─ prisma/schema.prisma
│   Add new column: vendor_logo_url String?
│
├─ Generate migration:
│   $ npx prisma migrate dev --name add-vendor-logo
│
└─ Migration file created:
    prisma/migrations/20251116_add_vendor_logo/migration.sql

    ALTER TABLE "vendors" ADD COLUMN "vendor_logo_url" TEXT;

↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Code Review                                             │
└─────────────────────────────────────────────────────────────────┘

Team reviews:
├─ Is column nullable? YES → safe (won't break existing rows)
├─ Does it have default? N/A (nullable, so default is NULL)
├─ Index needed? NO (not queried)
└─ Approved: Merge to main

↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Staging Deployment                                      │
└─────────────────────────────────────────────────────────────────┘

CI/CD runs migration on staging:
├─ Database: Neon staging instance
├─ Command: npx prisma migrate deploy
├─ Result: Column added to vendors table
├─ Test: Run full test suite
└─ Verify: Check staging app works with new column

↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Production Deployment (Zero Downtime)                   │
└─────────────────────────────────────────────────────────────────┘

Deploy to production:

Phase 1: Run migration (5 seconds)
├─ npx prisma migrate deploy
├─ ALTER TABLE runs on production DB
└─ Table now has vendor_logo_url column

Phase 2: Deploy new code (30 seconds)
├─ Vercel builds new app version
├─ New version references vendor_logo_url
└─ Old version (still running) ignores column (safe)

Phase 3: Cutover (0 seconds downtime)
├─ Vercel switches traffic to new version
├─ Old version drains connections
└─ 100% traffic on new version

Result: No downtime, new column available
```

### **11.3 Complex Migration: Schema Changes**

**Scenario:** Rename table `approvals` → `approval_queue`

**Problem:** Breaking change - old code won't work on renamed table.

**Solution:** Multi-step migration with views:

```
STEP 1: Create new table alongside old table

Migration 001:
CREATE TABLE "approval_queue" (LIKE "approvals" INCLUDING ALL);
INSERT INTO "approval_queue" SELECT * FROM "approvals";

Result: Both tables exist with same data

↓
STEP 2: Create database view for backward compatibility

Migration 002:
CREATE VIEW "approvals" AS SELECT * FROM "approval_queue";

Result: Old code can still SELECT from "approvals" view

↓
STEP 3: Deploy code that uses new table name

Code change:
- Old: db.approval.findMany()
+ New: db.approvalQueue.findMany()

Result: New code uses approval_queue, old code uses approvals view

↓
STEP 4: Wait for all old code to stop running

Wait period: 24 hours (ensure no old deploys are still active)

↓
STEP 5: Drop view and old table

Migration 003:
DROP VIEW "approvals";
DROP TABLE "approvals"; -- Original table, now unused

Result: Clean schema with only approval_queue
```

**Timeline:** 1 week from start to finish (ensures safety)

### **11.4 Data Backfill Migrations**

**Scenario:** Add `risk_score` column to `vendors` table, need to calculate scores for 500 existing vendors.

**Naive Approach (DON'T DO THIS):**

```sql
-- BAD: This locks the table for minutes!
ALTER TABLE vendors ADD COLUMN risk_score INT;
UPDATE vendors SET risk_score = calculate_risk_score(id);
```

**Problem:** UPDATE locks rows, blocking other queries.

**Good Approach: Batch Processing**

```
Migration:
ALTER TABLE vendors ADD COLUMN risk_score INT; -- Instant, nullable

Backfill script (runs separately):
For each batch of 100 vendors:
  1. SELECT 100 vendors WHERE risk_score IS NULL
  2. Calculate risk scores in application code
  3. UPDATE vendors SET risk_score = ? WHERE id IN (...)
  4. Sleep 1 second (avoid overwhelming DB)
  5. Repeat until all vendors processed

Progress tracking:
├─ SELECT COUNT(*) FROM vendors WHERE risk_score IS NULL
├─ Show: "Backfilling risk scores: 350/500 remaining"
└─ Takes: 5 minutes total, but app remains responsive
```

**Best Approach: Background Job**

```
Migration:
ALTER TABLE vendors ADD COLUMN risk_score INT;

Background job (Temporal workflow):
├─ Runs continuously after migration
├─ Processes 10 vendors/minute (gentle load)
├─ Completes in: 50 minutes
└─ App logic handles NULL risk_scores gracefully:
    if (vendor.risk_score === null) {
      // Calculate on-the-fly for now
      vendor.risk_score = await calculateRiskScore(vendor);
    }
```

---

## **12. PERFORMANCE OPTIMIZATION** {#12-performance}

### **12.1 Database Query Optimization**

**Problem: Slow Dashboard Load**

```sql
-- BEFORE: Slow query (3.2 seconds)
SELECT
  c.id,
  c.title,
  c.status,
  COUNT(e.id) as evidence_count,
  MAX(e.collected_at) as latest_evidence
FROM controls c
LEFT JOIN evidence e ON e.control_id = c.id
WHERE c.organization_id = 'org-xyz'
GROUP BY c.id
ORDER BY c.category, c.control_id;

-- Problem: Counts evidence for EVERY control, even if 0 evidence
-- Time: 3.2 seconds for 150 controls
```

**Solution: Materialized View + Caching**

```sql
-- Create materialized view (refreshed hourly)
CREATE MATERIALIZED VIEW control_evidence_summary AS
SELECT
  c.id as control_id,
  c.organization_id,
  COUNT(e.id) as evidence_count,
  MAX(e.collected_at) as latest_evidence,
  COUNT(CASE WHEN e.validation_status = 'validated' THEN 1 END) as validated_count
FROM controls c
LEFT JOIN evidence e ON e.control_id = c.id
GROUP BY c.id, c.organization_id;

CREATE INDEX ON control_evidence_summary(organization_id);

-- AFTER: Fast query (120ms)
SELECT
  c.id,
  c.title,
  c.status,
  s.evidence_count,
  s.latest_evidence,
  s.validated_count
FROM controls c
LEFT JOIN control_evidence_summary s ON s.control_id = c.id
WHERE c.organization_id = 'org-xyz'
ORDER BY c.category, c.control_id;

-- Improvement: 3.2s → 120ms (96% faster)
```

**Refresh Strategy:**

```
Refresh materialized view:
├─ Scheduled: Every hour (background job)
├─ On-demand: After major evidence collection
├─ Cost: Refresh takes 2 seconds (run when DB is idle)
└─ Trade-off: Dashboard shows data up to 1 hour stale (acceptable)
```

### **12.2 N+1 Query Problem**

**Problem: Loading Approval Queue**

```typescript
// BEFORE: N+1 queries
const approvals = await db.approval.findMany({
  where: { organization_id: org.id, status: 'pending' }
});

for (const approval of approvals) {
  // Extra query for EACH approval (N+1 problem!)
  const vendor = await db.vendor.findUnique({
    where: { id: approval.entity_id }
  });
  approval.vendor = vendor;
}

// Total queries: 1 + N (if 50 approvals = 51 queries = slow!)
```

**Solution: JOIN or DataLoader**

```typescript
// AFTER: Single query with JOIN
const approvals = await db.approval.findMany({
  where: { organization_id: org.id, status: 'pending' },
  include: {
    vendor: true,        // Prisma automatically JOINs
    user: true,          // Multiple includes = multiple JOINs
    agentExecution: true // All in one query
  }
});

// Total queries: 1 (50x faster!)
```

### **12.3 Index Strategy**

**Indexes We Created:**

```sql
-- Frequently queried columns
CREATE INDEX idx_evidence_organization_control
ON evidence(organization_id, control_id);

CREATE INDEX idx_approvals_organization_status
ON approvals(organization_id, status);

CREATE INDEX idx_agent_executions_organization_date
ON agent_executions(organization_id, created_at DESC);

-- Composite index for complex queries
CREATE INDEX idx_evidence_search
ON evidence(organization_id, control_id, validation_status, collected_at DESC);

-- Partial index (only pending approvals)
CREATE INDEX idx_approvals_pending
ON approvals(organization_id)
WHERE status = 'pending';
```

**How We Choose Indexes:**

```
Index if:
├─ Column is in WHERE clause frequently
├─ Column is used for JOIN
├─ Column is used for ORDER BY
└─ Query is slow without index (<100ms target)

Don't index if:
├─ Column has low cardinality (few unique values)
├─ Table is small (<1000 rows)
├─ Column is rarely queried
└─ Index would be larger than the table
```

**Monitoring:**

```sql
-- Find slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
WHERE mean_time > 100 -- Queries slower than 100ms
ORDER BY total_time DESC
LIMIT 10;

-- Find missing indexes
SELECT
  schemaname,
  tablename,
  seq_scan,
  idx_scan,
  seq_scan / NULLIF(idx_scan, 0) AS ratio
FROM pg_stat_user_tables
WHERE seq_scan > 1000 -- Table scanned frequently
  AND idx_scan < 100  -- But rarely using index
ORDER BY ratio DESC;
```

### **12.4 Application-Level Caching**

**Cache Everything That's Expensive:**

```typescript
// Framework data (rarely changes)
const frameworks = await cache.getOrSet(
  'frameworks:all',
  () => db.framework.findMany(),
  { ttl: 3600 } // 1 hour
);

// Control list (changes occasionally)
const controls = await cache.getOrSet(
  `controls:${frameworkId}`,
  () => db.control.findMany({ where: { frameworkId } }),
  { ttl: 900 } // 15 minutes
);

// Dashboard metrics (expensive calculation)
const metrics = await cache.getOrSet(
  `dashboard:metrics:${orgId}`,
  async () => {
    // Complex aggregations across multiple tables
    return calculateDashboardMetrics(orgId);
  },
  { ttl: 300 } // 5 minutes
);
```

**Cache Implementation (Redis):**

```typescript
class Cache {
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    options: { ttl: number }
  ): Promise<T> {
    // Try cache first
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    // Cache miss: Execute function
    const result = await fn();

    // Store in cache
    await redis.setex(key, options.ttl, JSON.stringify(result));

    return result;
  }

  async invalidate(pattern: string): Promise<void> {
    // Delete all keys matching pattern
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
```

### **12.5 Connection Pooling**

**Problem:** Opening new database connection for every request = slow

**Solution:** Connection pool

```
Prisma Connection Pool:
├─ Pool size: 10 connections (for small workload)
├─ Max wait time: 10 seconds
├─ Connection timeout: 30 seconds
└─ Idle timeout: 600 seconds (10 minutes)

Performance:
├─ New connection: ~500ms to establish
├─ Pooled connection: <5ms to acquire
└─ Improvement: 100x faster
```

**Configuration:**

```
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=10"
```

**Monitoring:**

```sql
-- Check active connections
SELECT
  count(*),
  state,
  wait_event_type
FROM pg_stat_activity
WHERE datname = 'grc_production'
GROUP BY state, wait_event_type;

-- Alert if connections > 80% of limit
-- (10 connections → alert at 8+)
```

---

## **SUMMARY & NEXT STEPS**

### **What We've Covered:**

✅ **Five Data Stores**: PostgreSQL, Redis, Pinecone, S3/R2, Temporal
✅ **Complete Database Schema**: 30+ tables with relationships
✅ **Agent-First Model**: Executions, decisions, approvals as first-class entities
✅ **Three-Tier APIs**: tRPC (internal), REST (external), WebSocket (real-time)
✅ **Real-Time Architecture**: WebSocket + Redis pub/sub for live updates
✅ **50+ Integrations**: OAuth flows, API clients, vision fallbacks
✅ **Caching Strategy**: Multi-layer caching with Redis (80% load reduction)
✅ **Vector Database**: Pinecone RAG for Compliance Copilot
✅ **Object Storage**: S3/R2 with pre-signed URLs and 7-year retention
✅ **Data Flows**: End-to-end examples of evidence collection and approvals
✅ **Migrations**: Zero-downtime strategy with backward compatibility
✅ **Performance**: Query optimization, indexing, connection pooling

### **Implementation Checklist:**

**Week 1: Database Setup**
- [ ] Deploy Neon PostgreSQL
- [ ] Apply Prisma schema migrations
- [ ] Seed initial data (frameworks, controls)
- [ ] Create database indexes
- [ ] Setup connection pooling

**Week 2: Caching Layer**
- [ ] Deploy Upstash Redis
- [ ] Implement cache wrapper functions
- [ ] Add cache invalidation to mutations
- [ ] Monitor cache hit rates

**Week 3: API Implementation**
- [ ] Build tRPC routers (all 10 routers)
- [ ] Add authentication middleware
- [ ] Implement rate limiting
- [ ] Write API documentation

**Week 4: Real-Time**
- [ ] Setup WebSocket server
- [ ] Implement Redis pub/sub
- [ ] Add event broadcasting
- [ ] Test with multiple clients

**Week 5: Integrations**
- [ ] OAuth setup (Okta, AWS, GitHub)
- [ ] API client wrappers
- [ ] Vision fallback flows
- [ ] Integration health monitoring

**Week 6: Vector Database**
- [ ] Deploy Pinecone index
- [ ] Load knowledge base (SOC 2 controls)
- [ ] Implement RAG queries
- [ ] Test Compliance Copilot

**Week 7: Object Storage**
- [ ] Setup S3/R2 buckets
- [ ] Implement pre-signed URLs
- [ ] Configure lifecycle policies
- [ ] Test evidence upload/download

**Week 8: Performance**
- [ ] Create materialized views
- [ ] Add missing indexes
- [ ] Optimize slow queries
- [ ] Load testing (1000 concurrent users)

---

**Status:** ✅ Part 5 Complete
**Next Document:** [Part 6: Security & Deployment](./06_security_deployment_operations.md)
**Total Pages:** ~50 pages (comprehensive data architecture)

