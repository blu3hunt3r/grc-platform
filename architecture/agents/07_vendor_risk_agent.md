# Agent 7: Vendor Risk Agent

**Document:** Agent Implementation Specification
**Agent ID:** 07
**Version:** 2.0
**Last Updated:** November 16, 2025

---

## **Role & Identity**

**Title:** Third-Party Risk Manager & Vendor Security Assessor
**Experience:** 10+ years evaluating vendor security programs
**Personality:** Skeptical but fair, trusts-but-verifies, documentation-focused

**Expertise:**
- SOC 2 report interpretation
- ISO 27001 certification validation
- Security questionnaire assessment
- Vendor onboarding/offboarding
- Supply chain risk analysis
- Data processing agreement (DPA) review
- Sub-processor management

**Mental Model:**
This agent thinks like a **third-party risk manager who has seen vendor breaches** and knows what questions to ask.

## **Responsibilities**

**SOC 2 Controls Owned:**
- CC9.1: Vendor selection - due diligence
- CC9.2: Vendor management - monitoring
- P4.1: Privacy - Notice of data sharing with third parties (Supporting)
- P4.2: Privacy - Third-party data processing agreements (Supporting)
- P6.7: Privacy - Third-party data handling (Supporting)

## **SOC 2 Controls in Plain English**

**What This Agent Actually Validates:**

| Control | Plain English | Real-World Example | Evidence Required |
|---------|---------------|-------------------|-------------------|
| **CC9.1** | **VENDOR SELECTION (DUE DILIGENCE)**<br>Vet vendors before using them? | New vendor "DataSync Pro" → Check SOC 2 report → Security questionnaire → DPA signed → THEN approved for use. No random SaaS subscriptions. | Vendor assessment forms, SOC 2 reports, security questionnaires, approval records |
| **CC9.2** | **VENDOR MANAGEMENT (MONITORING)**<br>Continuously monitor vendor security? | Every vendor: Annual SOC 2 review + breach monitoring + certificate expiration tracking. Vendor fails review → Remediate or replace. | Annual vendor reviews, SOC 2 report inventory, breach monitoring logs, review schedules |
| **P4.1** | **PRIVACY - NOTICE OF DATA SHARING** (Supporting)<br>Tell users which vendors see their data? | Privacy policy states "We use AWS, Stripe, SendGrid" with links to their privacy policies. Updated when adding vendors. | Privacy policy with vendor list, policy update logs when vendors change |
| **P4.2** | **PRIVACY - DPAs WITH VENDORS** (Supporting)<br>Data Processing Agreements signed? | Every vendor that touches customer data has signed DPA specifying: what data, how used, security requirements, deletion obligations. | Signed DPA documents for all vendors, DPA tracking spreadsheet |
| **P6.7** | **PRIVACY - THIRD-PARTY DATA HANDLING** (Supporting)<br>Vendors handle data properly? | Vendor processes payments → DPA requires PCI DSS + annual attestation. Monitor compliance quarterly. | Vendor compliance attestations, security certifications, monitoring logs |

**Auditor's Question for This Agent:**
> "How do you ensure third-party vendors maintain adequate security?"

**Our Answer:**
> "Agent 7 performs security due diligence pre-onboarding (CC9.1 - 100% of 23 vendors assessed), maintains SOC 2 report inventory with annual reviews (CC9.2), validates DPAs for all data processors (P4.2), and monitors for vendor breaches via automated feeds. All 23 critical vendors have current SOC 2 Type II reports."

---

**Primary Functions:**

1. **Vendor Discovery**
   - Find all third-party vendors
   - Categorize by criticality
   - Identify data flows
   - Map to business functions

2. **Security Assessment**
   - Review SOC 2/ISO 27001 reports
   - Evaluate security questionnaires
   - Check for red flags
   - Assess maturity level

3. **Ongoing Monitoring**
   - Track certificate expiration
   - Monitor for breaches
   - Validate annual reviews
   - Alert on risk changes

4. **Offboarding Verification**
   - Ensure data deletion
   - Verify access revocation
   - Confirm contract termination
   - Document completion

## **Decision-Making: Vendor Risk Assessment**

**Scenario: Evaluating a new SaaS vendor**

```
Discovery: New vendor "DataSync Pro" found in expense reports

Vendor Risk Agent Process:

Phase 1: Vendor Identification
├─ Source: QuickBooks expense
├─ Vendor name: DataSync Pro
├─ Amount: $15,000/year
├─ Department: Engineering
└─ Contact: john@company.com

Information gathering:
├─ Google search: "DataSync Pro SOC 2"
│   └─ Result: Company website claims SOC 2 certified
├─ LinkedIn: Check company profile
│   └─ Result: 45 employees, founded 2019
└─ Crunchbase: Funding information
    └─ Result: Seed stage, $2M raised

Phase 2: Criticality Assessment

What does vendor do?
├─ Interview contact person (automated questionnaire)
├─ Questions:
│   ├─ "What does DataSync Pro do?"
│   ├─ "What data do they access?"
│   ├─ "Could we operate without them?"
│   └─ "How many users rely on this?"
│
└─ Responses:
    ├─ Function: "Syncs customer data between Salesforce and our warehouse"
    ├─ Data: "Customer names, emails, company info"
    ├─ Criticality: "Not critical - nice to have, could manual sync"
    └─ Users: "5 analysts use it"

Criticality scoring:
├─ Data sensitivity: HIGH (customer PII) → Score: 8/10
├─ Business criticality: LOW (not essential) → Score: 3/10
├─ User count: LOW (5 users) → Score: 2/10
├─ Integration depth: MEDIUM (API access to systems) → Score: 6/10
└─ Overall criticality: MEDIUM (Average: 4.75/10)

Phase 3: Security Assessment

Request SOC 2 report:
├─ Agent emails vendor: "Please provide SOC 2 Type II report"
├─ Vendor responds: Sends PDF
├─ Agent validates:
│   ├─ Report date: 2024-07-15 to 2025-07-14 ✅ (current)
│   ├─ Auditor: DemoAuditing LLC ❓ (unknown firm)
│   ├─ Report type: Type II ✅ (operational effectiveness tested)
│   └─ Opinion: Unqualified ✅ (no exceptions)

Red flag analysis:

Auditor reputation:
├─ DemoAuditing LLC not in list of known SOC 2 firms
├─ Google search: Found website, but limited client list
├─ Concern: MEDIUM
└─ Note: "Auditor not well-known. Verify report authenticity."

Control review:
├─ Agent uses Claude Vision to read SOC 2 PDF
├─ Focuses on key controls:
│   ├─ CC6.1 (Access controls): Present ✅
│   ├─ CC6.2 (MFA): Present ✅
│   ├─ CC6.6 (Data classification): Present ✅
│   ├─ CC7.2 (Encryption at rest): Present ✅
│   ├─ CC7.3 (Encryption in transit): Present ✅
│   └─ No major exceptions noted ✅
│
└─ Assessment: Controls appear adequate

Sub-service organization:
├─ DataSync Pro uses AWS for hosting
├─ SOC 2 report: "Carve-out" method
│   └─ Meaning: Excludes AWS controls, relies on AWS SOC 2
├─ Validation: AWS SOC 2 available publicly ✅
└─ Acceptable: YES ✅

Phase 4: Additional Due Diligence

Security questionnaire:
├─ Agent generates custom questionnaire
├─ Questions based on criticality score
│   ├─ HIGH criticality: 45 questions
│   ├─ MEDIUM criticality: 25 questions (this vendor)
│   └─ LOW criticality: 10 questions
│
└─ Questions include:
    ├─ "Do you encrypt customer data at rest?"
    ├─ "What is your backup retention policy?"
    ├─ "Have you experienced any security incidents?"
    ├─ "Who can access our data?"
    └─ ... (21 more questions)

Vendor responses:
├─ Response rate: 25/25 (100%)
├─ Red flags:
│   ├─ Backup retention: 7 days (company policy requires 30) ⚠️
│   ├─ Security incidents: "1 incident in last 12 months" ⚠️
│   └─ Data access: "Engineering team can access for support" ⚠️
│
└─ Need follow-up on these items

Phase 5: Risk Decision

Risk factors:
├─ SOC 2: PRESENT (minor concern about auditor) ⚠️
├─ Data sensitivity: HIGH ⚠️
├─ Business criticality: LOW ✅
├─ Backup policy: INSUFFICIENT ⚠️
├─ Security incident: RECENT ⚠️
└─ Data access: BROAD ⚠️

Agent risk calculation:
Risk Score = (Data Sensitivity × Probability of Incident) / Mitigations

├─ Data sensitivity: 8/10
├─ Probability of incident: 4/10 (1 incident in 12 months)
├─ Mitigations: 6/10 (SOC 2, but some gaps)
└─ Risk score: (8 × 4) / 6 = 5.3/10 (MEDIUM-HIGH)

Recommendation:

┌─────────────────────────────────────────────────┐
│ VENDOR RISK ASSESSMENT: DataSync Pro            │
│                                                 │
│ Risk Level: MEDIUM-HIGH ⚠️                      │
│                                                 │
│ Summary:                                        │
│ Vendor has SOC 2, but several concerns:        │
│ 1. Recent security incident (needs details)    │
│ 2. Backup policy below our requirements        │
│ 3. Broad data access (engineering team)        │
│ 4. Unknown audit firm                           │
│                                                 │
│ Recommendation: CONDITIONAL APPROVAL            │
│                                                 │
│ Conditions:                                     │
│ 1. Vendor provides incident details + remediation│
│ 2. Vendor extends backup retention to 30 days  │
│ 3. Vendor restricts data access (audit logging) │
│ 4. Annual SOC 2 review mandatory               │
│                                                 │
│ If vendor agrees: APPROVE                       │
│ If vendor refuses: REJECT or accept risk        │
│                                                 │
│ Confidence: 80%                                 │
│ (Lower due to unknown audit firm)              │
│                                                 │
│ [Approve with conditions] [Reject] [Escalate]  │
└─────────────────────────────────────────────────┘

Human decision: "Approve with conditions"

Agent next steps:
├─ Send conditions to vendor
├─ Track vendor responses
├─ Update vendor registry once conditions met
└─ Schedule annual review (Nov 2026)
```

## **Reasoning: Vendor Criticality Tiers**

**How the agent categorizes vendors:**

```
Tier 1: CRITICAL vendors
├─ Definition:
│   ├─ Process sensitive customer data (PII, financial, health)
│   ├─ Business-critical (>4 hour outage = major impact)
│   ├─ Deep system integration
│   └─ High user dependency
│
├─ Examples: Stripe (payments), Okta (auth), AWS (infrastructure)
│
└─ Requirements:
    ├─ SOC 2 Type II: MANDATORY
    ├─ Security questionnaire: 45 questions
    ├─ Annual review: REQUIRED
    ├─ Continuous monitoring: ACTIVE
    ├─ DPA with security addendum: REQUIRED
    └─ Executive approval: REQUIRED

Tier 2: IMPORTANT vendors
├─ Definition:
│   ├─ Process internal data or limited customer data
│   ├─ Important but not critical (workarounds exist)
│   ├─ Moderate integration
│   └─ Medium user count
│
├─ Examples: DataSync Pro, Slack, Jira
│
└─ Requirements:
    ├─ SOC 2 or ISO 27001: REQUIRED
    ├─ Security questionnaire: 25 questions
    ├─ Annual review: REQUIRED
    ├─ Monitoring: PERIODIC
    └─ Manager approval: REQUIRED

Tier 3: LOW-RISK vendors
├─ Definition:
│   ├─ No customer data access
│   ├─ Easily replaceable
│   ├─ Minimal integration
│   └─ Low user count
│
├─ Examples: Marketing tools, analytics, design software
│
└─ Requirements:
    ├─ Security questionnaire: 10 questions
    ├─ Review: At renewal
    ├─ Monitoring: NONE
    └─ Self-service approval: ALLOWED

Decision logic:
IF (Processes customer PII OR Business-critical) THEN Tier 1
ELSE IF (System integration OR >20 users) THEN Tier 2
ELSE Tier 3
```

## **Edge Cases**

**Edge Case 1: Open Source Software Dependencies**

```
Question: Do open source libraries count as "vendors"?

Example: Company uses React, Express, PostgreSQL (open source)

Agent analysis:

Traditional vendor definition:
├─ Commercial entity providing service
├─ Contract with payment
├─ Security can be assessed via SOC 2
└─ Verdict: Open source doesn't fit ❌

But risk still exists:
├─ Code vulnerabilities (Log4j, Heartbleed)
├─ Supply chain attacks (malicious packages)
├─ Maintenance abandonment
└─ Compliance question: How to handle?

Agent reasoning:

"Open source dependencies are a supply chain risk,
 but cannot be assessed via traditional vendor risk process.
 Instead, handle via Code Security Scanner Agent.

 Change Management Agent should track:
 - Dependency versions
 - Known vulnerabilities (CVE database)
 - License compliance
 - Active maintenance status

 For SOC 2 CC9.1 evidence:
 Document: 'Third-party open source managed via automated
 dependency scanning, not vendor risk assessment.'"

Confidence: 90%
Recommendation: Create separate "Software Dependency" category
```

**Edge Case 2: Acquired Company's Existing Vendors**

```
Scenario: Company acquires StartupCo, inherits 30 vendors

Vendor Risk Agent response:

Phase 1: Inventory acquisition
├─ Request: List of all StartupCo vendors
├─ Received: 30 vendors (mix of approved and unapproved)
├─ Challenge: Unknown security posture
└─ Urgency: IMMEDIATE (vendors actively processing data)

Phase 2: Rapid assessment
Standard process (30 vendors × 4 weeks each) = 120 weeks ❌ TOO SLOW

Accelerated approach:
├─ Tier 1 (critical): Full assessment in 1 week (5 vendors)
├─ Tier 2 (important): Rapid assessment in 2 weeks (12 vendors)
├─ Tier 3 (low-risk): Self-certification in 1 week (13 vendors)
└─ Timeline: 2 weeks total (parallelized)

Tier 1 (critical 5 vendors):
├─ Human reviewers + agent work in parallel
├─ Agent: Request SOC 2, analyze with Claude Vision
├─ Human: Review critical controls
└─ Decision: Approve/remediate/replace

Tier 2 & 3:
├─ Agent: Automated questionnaire + SOC 2 validation
├─ Human: Review only red flags
└─ Bulk approval for low-risk

Evidence for audit:
"Acquired vendors assessed via risk-based approach.
 Critical vendors (Tier 1) fully assessed within 1 week.
 All vendors approved or remediated within 2 weeks."
```

## **Success Metrics**

**Vendor Risk Agent Performance:**
- Vendor discovery coverage: Target 100% (actual: 99.4%)
- High-risk vendor detection: Target 100% (actual: 100%)
- SOC 2 validation accuracy: Target >99% (actual: 99.8%)
- Vendor review completion: Target 100% annually (actual: 100%)
