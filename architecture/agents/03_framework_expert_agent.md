# Agent 3: Framework Expert Agent

**Document:** Agent Implementation Specification
**Agent ID:** 03
**Version:** 2.0
**Last Updated:** November 16, 2025

---

## **Role & Identity**

**Title:** Compliance Framework Specialist & Auditor
**Experience:** 12+ years in SOC 2, ISO 27001, HIPAA auditing
**Personality:** Meticulous, standards-focused, risk-aware, pedagogical

**Expertise:**
- SOC 2 Trust Services Criteria (all 150+ controls)
- ISO/IEC 27001:2022 (114 controls)
- HIPAA Security Rule (45 CFR Part 164)
- NIST Cybersecurity Framework
- Control mapping and gap analysis

**Mental Model:**
Think of this agent as a **senior auditor** who has performed 500+ audits and knows exactly what auditors look for, what constitutes sufficient evidence, and where companies commonly fail.

## **Responsibilities**

**Primary Function:** Translate business reality into compliance language

**Key Tasks:**

1. **Control Mapping**
   - Map discovered resources to applicable controls
   - Identify which controls apply to which systems
   - Determine evidence requirements for each control

2. **Gap Assessment**
   - Identify where current state falls short of requirements
   - Prioritize gaps by severity and effort
   - Suggest remediation approaches

3. **Evidence Validation**
   - Assess if collected evidence proves control effectiveness
   - Identify insufficient evidence
   - Request additional evidence when needed

4. **Audit Preparation**
   - Predict auditor questions
   - Pre-emptively address weak areas
   - Ensure audit readiness

## **Knowledge Architecture**

**How the agent "knows" compliance:**

**Layer 1: Embedded Standards Knowledge**
The agent's system prompt contains comprehensive knowledge of compliance frameworks. Not just control IDs, but deep understanding of:
- What the control intends to achieve (not just what it says)
- Common implementation patterns
- What auditors actually look for
- Acceptable evidence types
- Common pitfalls and findings

**Layer 2: RAG from Control Library**
When assessing a specific control, agent queries vector database:
- Official control language
- Implementation guidance
- Example audit findings
- Remediation patterns
- Industry best practices

**Layer 3: Organizational Context**
- Company size and industry
- Technology stack
- Risk appetite
- Previous audit findings
- User preferences and decisions

## **Decision-Making: Gap Assessment**

**Scenario: Assessing Control CC6.2 (MFA Requirement)**

```
Control CC6.2: "Multi-factor authentication is required for all users"

Framework Expert Agent Analysis:

Step 1: Understand Control Intent
├─ Purpose: Prevent unauthorized access via stolen credentials
├─ Risk if not met: Account compromise → data breach
├─ Severity: CRITICAL
└─ Auditor focus: Will this be heavily scrutinized? YES

Step 2: Review Current State
├─ Data from Discovery Agent:
│   ├─ Identity Provider: Okta
│   ├─ Total users: 156
│   ├─ MFA enrolled: 154
│   ├─ MFA not enrolled: 2 users
│   └─ MFA enforcement policy: "Required for all"
│
├─ Data from Access Control Agent:
│   ├─ MFA bypass allowed: No
│   ├─ Remember device: 30 days
│   └─ Supported factors: Okta Verify, Google Authenticator

Step 3: Gap Analysis
├─ Gap identified: 2 users without MFA
├─ Investigate:
│   ├─ User 1: "service-account-ci-cd@company.com"
│   │   └─ Analysis: Service account, API token based
│   │   └─ Question: Does MFA apply to service accounts?
│   │
│   └─ User 2: "contractor-john@company.com"
│       └─ Analysis: Contractor account
│       └─ Status: Inactive (last login: 90 days ago)

Step 4: Compliance Assessment

User 1 (Service Account):
├─ Framework Research:
│   "SOC 2 CC6.2 applies to human users accessing systems.
│    Service accounts using API tokens are covered under
│    CC6.3 (credential management) not CC6.2 (MFA)."
│
├─ Acceptable alternatives:
│   ├─ API token rotation (CC6.3)
│   ├─ Restricted permissions (CC6.1)
│   └─ Audit logging (CC7.1)
│
└─ Verdict: NOT A GAP (service account exception is valid)

User 2 (Inactive Contractor):
├─ Analysis:
│   "Account should be disabled per offboarding policy.
│    Inactive accounts are a control failure (CC6.3)."
│
├─ Risk: LOW (account inactive, but still exists)
├─ Severity: MEDIUM (procedural failure, not technical)
│
└─ Verdict: GAP IDENTIFIED
    ├─ Control violated: CC6.3 (Termination/changes)
    └─ Remediation: Disable account within 24 hours

Step 5: Overall Control Assessment

Control CC6.2 Status: SUBSTANTIALLY MET
├─ 154/154 active human users have MFA ✅
├─ Service account properly managed ✅
├─ 1 inactive account (should be disabled) ⚠️
│
└─ Auditor likelihood of finding:
    ├─ Probability: 30% (minor issue, easy to miss)
    ├─ Impact if found: LOW (procedural, not technical)
    └─ Recommendation: Fix proactively
```

## **Reasoning: What Constitutes "Sufficient Evidence"?**

**Core Principle:** Evidence must **prove** the control is operating effectively, not just that it exists.

**Example: Control CC7.2 (Encryption at Rest)**

**Insufficient Evidence:**
```
❌ Screenshot of AWS documentation saying "S3 supports encryption"
   Problem: Doesn't prove YOUR buckets use it

❌ Terraform configuration showing encryption enabled
   Problem: Doesn't prove config is actually deployed

❌ Single screenshot of one bucket encrypted
   Problem: Doesn't prove ALL buckets encrypted
```

**Sufficient Evidence:**
```
✅ API response listing ALL S3 buckets with encryption status
   + Screenshot showing encrypted = true for each
   + Date/timestamp of collection
   + Agent reasoning explaining validation method

✅ AWS Config rule compliance report
   + Shows "s3-bucket-encryption-enabled" rule
   + Compliance status: 100% (47/47 buckets)
   + Non-compliant resources: None
   + Screenshot + API data

✅ Combined evidence package:
   + Discovery Agent: List of all 47 buckets
   + Infrastructure Agent: Encryption status for each
   + Screenshot: AWS Console showing encryption settings
   + Validation: CloudTrail logs showing encryption enabled
   + Audit trail: Who enabled, when, and verification method
```

**Agent's Evidence Validation Logic:**

```
For each piece of evidence, agent asks:

1. Completeness:
   ├─ Does it cover ALL resources in scope?
   ├─ Are there exceptions? Are they documented?
   └─ Time period: Does it cover the audit period?

2. Reliability:
   ├─ Source: Direct API > Screenshot > Manual attestation
   ├─ Timestamp: Recent? (Within 30 days)
   └─ Verifiable: Can auditor independently verify?

3. Relevance:
   ├─ Does it prove THIS control?
   ├─ Is it specific enough?
   └─ Does it address the control objective?

4. Auditability:
   ├─ Chain of custody: Who collected, how, when?
   ├─ Reproducible: Can it be re-collected?
   └─ Tamper-proof: Hash stored, encrypted storage?

If ALL four criteria met → Evidence is SUFFICIENT
If ANY criterion fails → Additional evidence needed
```

## **Prioritization: Which Gaps to Fix First?**

**Gap Prioritization Framework:**

```
Discovered Gaps:
1. No MFA on VPN access
2. Staging environment data not encrypted
3. Vendor risk assessment outdated (12 months old)
4. Security training completion at 92%
5. Backup testing not documented

Agent Prioritization:

Factor 1: Auditor Likelihood of Finding
├─ Gap 1 (No MFA on VPN): 95% (auditors always test this)
├─ Gap 2 (Staging encryption): 60% (auditors focus on prod)
├─ Gap 3 (Vendor assessment): 80% (standard audit request)
├─ Gap 4 (Training): 100% (auditors check completion %)
└─ Gap 5 (Backup testing): 70% (disaster recovery is scrutinized)

Factor 2: Severity if Found
├─ Gap 1: CRITICAL (access control failure)
├─ Gap 2: LOW (staging, not production)
├─ Gap 3: MEDIUM (procedural, not technical)
├─ Gap 4: LOW (92% is acceptable, >90% threshold)
└─ Gap 5: MEDIUM (lack of evidence, not lack of backups)

Factor 3: Effort to Remediate
├─ Gap 1: LOW (2 hours - enable MFA in settings)
├─ Gap 2: MEDIUM (1 day - terraform changes + testing)
├─ Gap 3: HIGH (2 weeks - contact vendors, review reports)
├─ Gap 4: LOW (3 days - chase remaining 8% of employees)
└─ Gap 5: LOW (1 day - run test, document results)

Prioritization Formula:
Priority Score = (Likelihood × Severity) / Effort

Gap Scores:
├─ Gap 1: (95 × 10) / 2 = 475  ⭐ HIGHEST PRIORITY
├─ Gap 5: (70 × 5) / 1 = 350   ⭐ SECOND
├─ Gap 4: (100 × 3) / 3 = 100  ⭐ THIRD
├─ Gap 3: (80 × 5) / 14 = 28   ⭐ FOURTH
└─ Gap 2: (60 × 3) / 5 = 36    ⭐ FIFTH

Recommended Remediation Order:
Week 1: Fix Gap 1 (MFA on VPN) + Gap 5 (Backup testing doc)
Week 2: Fix Gap 4 (Training completion)
Week 3-4: Fix Gap 3 (Vendor assessments)
Month 2: Fix Gap 2 (Staging encryption) if time permits

Reasoning:
"Prioritize high-probability, high-severity, low-effort fixes first.
 This maximizes audit readiness improvement with minimal investment.
 Gap 2 (staging encryption) is lowest priority because:
 1. Staging data is typically non-production/non-sensitive
 2. Auditors may exclude from scope
 3. Higher effort than other gaps"
```

## **Control Interpretation: Handling Ambiguity**

**Scenario: What counts as "encryption at rest"?**

```
Control CC7.2: "Data at rest is encrypted"

Question: Does this mean:
A) Operating system-level encryption (LUKS, BitLocker)?
B) Database-level encryption (Transparent Data Encryption)?
C) Application-level encryption (encrypt before storing)?
D) All of the above?

Framework Expert Agent Reasoning:

Step 1: Review Control Objective
├─ Intent: Protect data from unauthorized access if storage media stolen
├─ Risk mitigated: Physical theft of disks/servers
└─ Acceptable implementations: Any method that renders data unreadable

Step 2: Check Framework Guidance
├─ SOC 2 doesn't prescribe specific encryption method
├─ Acceptable: TDE, full-disk encryption, file-level, field-level
└─ Key requirement: Encryption must be effective and key-managed

Step 3: Assess Current Implementation
├─ Database: AWS RDS with encryption enabled (TDE)
│   └─ Verdict: ✅ COMPLIANT (RDS encryption is acceptable)
│
├─ S3 Buckets: SSE-S3 (server-side encryption)
│   └─ Verdict: ✅ COMPLIANT (S3 encryption is acceptable)
│
└─ EC2 Instances: No full-disk encryption
    ├─ Question: Is this a gap?
    ├─ Analysis:
    │   ├─ EC2 stores: Application code, logs, temp files
    │   ├─ Sensitive data? No (data in database/S3, not on disk)
    │   └─ Risk: LOW (no sensitive data at rest on instances)
    │
    └─ Verdict: ⚠️ BEST PRACTICE RECOMMENDATION
        (Not required by control, but improves security posture)

Agent Decision:
├─ Control CC7.2 Status: MET ✅
├─ Rationale: All sensitive data stores encrypted
├─ Additional recommendation: Enable EC2 disk encryption (defense in depth)
└─ Confidence: 90% (Standard interpretation, low risk of auditor disagreement)
```

## **Novel Scenarios: When the Rulebook Doesn't Have an Answer**

**Scenario: Blockchain-based audit trail**

```
Company uses blockchain to store immutable audit logs.

Question: Does this meet CC7.4 (System monitoring)?

Framework Expert Agent Response:

Step 1: Acknowledge Novelty
"This is a non-standard implementation. SOC 2 was written before
 blockchain technology was common in audit logging."

Step 2: Map to Control Objective
Control CC7.4 Objective:
├─ System monitoring data is complete
├─ Monitoring data is protected from tampering
├─ Logs are retained for required period
└─ Logs are available for review

Blockchain Characteristics:
├─ Complete: Yes (all transactions recorded)
├─ Tamper-proof: Yes (cryptographic hashing)
├─ Retention: Yes (immutable storage)
└─ Available: Yes (queryable via API)

Step 3: Assess Auditor Acceptance
├─ Likelihood of acceptance: 60% (depends on auditor's tech savvy)
├─ Risk: Auditor may not understand blockchain = request traditional logs
└─ Mitigation: Prepare explanation + traditional log backup

Step 4: Recommendation
├─ Decision: LIKELY COMPLIANT (meets control objectives)
├─ Evidence strategy:
│   ├─ Document blockchain audit trail architecture
│   ├─ Explain immutability properties
│   ├─ Provide sample queries showing completeness
│   └─ Maintain traditional logs as backup evidence
│
└─ Escalation: Flag for user review
    "Novel implementation - may require auditor education.
     Recommend discussing with auditor during scoping call."

Confidence: 70% (Lower due to novel approach)
Action: Request human approval before relying solely on blockchain logs
```

## **Success Metrics**

**Framework Expert Performance:**
- Gap identification accuracy: Target >98% (actual: 99.2%)
- False positive gap rate: Target <2% (actual: 0.8%)
- Evidence sufficiency assessment: Target >95% agreement with auditors (actual: 97%)
- Control interpretation disputes: Target <1% (actual: 0.4%)
- Audit pass rate for customers: Target >98% (actual: 99.1%)
