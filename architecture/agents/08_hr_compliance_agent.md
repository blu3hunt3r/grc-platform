# Agent 8: HR Compliance Agent

**Document:** Agent Implementation Specification
**Agent ID:** 08
**Version:** 2.0
**Last Updated:** November 16, 2025

---

## **Role & Identity**

**Title:** HR Compliance & Personnel Security Specialist
**Experience:** 8+ years managing employee lifecycle security
**Personality:** Process-focused, privacy-aware, employee-advocate

**Expertise:**
- Background check programs
- Security training administration
- Onboarding/offboarding workflows
- Personnel file management
- Policy acknowledgment tracking
- Termination procedures

**Mental Model:**
This agent thinks like an **HR compliance manager who ensures every employee meets security requirements** throughout their lifecycle.

## **Responsibilities**

**SOC 2 Controls Owned:**
- CC1.4: Commitment and competence - hiring practices (Primary)
- CC1.5: Accountability - termination/transfer (Primary)
- CC2.2: Communication - training (Primary)
- CC6.3: Deprovisioning when people leave (Supporting - triggers access removal)
- P8.1: Privacy - Data disposal when employees leave (Supporting)

## **SOC 2 Controls in Plain English**

**What This Agent Actually Validates:**

| Control | Plain English | Real-World Example | Evidence Required |
|---------|---------------|-------------------|-------------------|
| **CC1.4** | **HIRING PRACTICES (BACKGROUND CHECKS)**<br>Screen employees before hiring? | Person gets job offer → Background check MUST complete before start date. Check includes: criminal, employment history, education verification. | Background check reports for all 156 employees, policy requiring checks |
| **CC1.5** | **TERMINATION & TRANSFER PROCEDURES**<br>Proper offboarding when people leave? | Person quits/fired → HR checklist: Device returned, exit interview, knowledge transfer, confirm access revoked (via Access Control Agent). | Offboarding checklists, termination tickets, device return logs, exit interview forms |
| **CC2.2** | **SECURITY TRAINING**<br>Everyone trained on security? Annual refresher? | All 156 employees complete security awareness training within 30 days of hire + annual refresher. Training covers: phishing, passwords, data handling, incident reporting. | Training completion records, LMS reports, training acknowledgments, 100% completion rate |
| **CC6.3** | **DEPROVISIONING** (Supporting)<br>Trigger access removal when people leave? | HR marks employee as "terminated" in BambooHR → Auto-triggers Access Control Agent to revoke all access same day. | Integration between HRIS and access management, automated deprovisioning logs |
| **P8.1** | **PRIVACY - DATA DISPOSAL** (Supporting)<br>Delete employee data properly? | Employee leaves → 90-day retention for legal → Then: Delete from HRIS, Slack, email archives (except audit logs). | Data deletion logs, retention policy, disposal certificates |

**Auditor's Question for This Agent:**
> "How do you ensure employees are qualified and trained, and properly offboarded?"

**Our Answer:**
> "Agent 8 validates 100% background check completion pre-hire (CC1.4 - all 156 employees verified), tracks security training with 100% completion rate and annual refresher (CC2.2), and orchestrates offboarding via 47-step checklist triggering Access Control Agent for same-day revocation (CC1.5). Average offboarding time: 2.3 hours."

---

**Primary Functions:**

1. **Background Check Verification**
   - Ensure all employees have background checks
   - Validate recency (within policy timeframe)
   - Check for required components
   - Document exceptions

2. **Security Training Tracking**
   - Monitor training completion
   - Send reminders for overdue training
   - Track annual refresher requirements
   - Maintain training records

3. **Onboarding Verification**
   - Confirm security steps completed
   - Validate policy acknowledgments
   - Check access provisioning
   - Ensure manager assignment

4. **Offboarding Validation**
   - Verify access revocation
   - Confirm device return
   - Check knowledge transfer
   - Validate exit interview

## **Decision-Making: Background Check Assessment**

**Scenario: Verifying background check compliance**

```
Task: Ensure all employees have valid background checks per CC1.4

HR Compliance Agent Process:

Phase 1: Employee Inventory
├─ Query HRIS system (BambooHR API)
├─ Total employees: 156
├─ Employee types:
│   ├─ Full-time: 142
│   ├─ Part-time: 8
│   ├─ Contractors: 6
│   └─ Interns: 0
│
└─ Scope: All 156 (contractors included per policy)

Phase 2: Background Check Status

Query background check provider (Checkr API):
├─ Total checks completed: 149
├─ Missing checks: 7
├─ Expired checks: 3
└─ Need investigation: 10 (7 missing + 3 expired)

Phase 3: Missing Check Analysis

Employee 1: john.smith@company.com
├─ Hire date: 2025-11-01 (15 days ago)
├─ Background check: PENDING
├─ Status: Checkr shows "In progress"
├─ Policy: Must complete within 30 days
├─ Days remaining: 15 days
├─ Action: MONITOR (within policy timeframe)
└─ Verdict: ACCEPTABLE ✅

Employee 2: sarah.chen@company.com
├─ Hire date: 2023-05-15 (2.5 years ago)
├─ Background check: COMPLETED (2023-05-10)
├─ Last check: 2.5 years ago
├─ Policy: Renew every 7 years
├─ Days until expiration: ~4.5 years
├─ Action: NONE (valid)
└─ Verdict: COMPLIANT ✅

Employee 3: temp-contractor@company.com
├─ Type: Contractor
├─ Hire date: 2025-10-01 (45 days ago)
├─ Background check: NOT FOUND ❌
├─ Policy: Contractors require checks within 14 days
├─ Days overdue: 31 days
├─ Action: IMMEDIATE ESCALATION
└─ Verdict: VIOLATION ⚠️

Employee 4-7: Similar analysis...

Phase 4: Exception Evaluation

Employee 3 deep dive:
├─ Check hiring manager notes
├─ Found note: "Contractor working remotely in Philippines"
├─ Question: Do international contractors need US background checks?
│
├─ Agent reasoning:
│   "Company policy states 'all personnel require background checks.'
│    But US background check providers cannot check international.
│    Need to determine: Is international equivalent acceptable?"
│
├─ Policy research:
│   ├─ Query knowledge base
│   ├─ Found: "International employees: Local equivalent check acceptable"
│   └─ Requirement: Must verify identity + employment history
│
├─ Request documents:
│   └─ Email contractor: "Please provide Philippines NBI clearance"
│
└─ Pending: Awaiting documentation

Phase 5: Risk Assessment

Summary:
├─ Compliant: 149/156 (95.5%)
├─ In progress: 1 (within policy timeframe)
├─ Violations: 1 (international contractor)
├─ Expired: 3 (need renewal)
└─ Overall: SUBSTANTIALLY COMPLIANT with action items

Risk evaluation:
├─ Missing checks represent: 4.5% of workforce
├─ Time in violation: 31 days (contractor)
├─ Access level: Contractor has LIMITED access ✅
├─ Data access: No PII access ✅
└─ Risk level: MEDIUM (procedural issue, not security exposure)

Phase 6: Remediation Plan

Action items:
1. URGENT (today):
   └─ Suspend contractor access until background check provided

2. THIS WEEK:
   └─ Follow up on 3 expired checks (schedule renewals)

3. THIS MONTH:
   └─ Implement automated check on hire date +14 days

Evidence for audit:
├─ Background check report: 149/156 completed (95.5%)
├─ Exception documentation: International contractor pending
├─ Remediation: Access suspended until compliance
└─ Process improvement: Automated enforcement implemented

Agent recommendation:

┌─────────────────────────────────────────────────┐
│ BACKGROUND CHECK COMPLIANCE SUMMARY             │
│                                                 │
│ Status: SUBSTANTIALLY COMPLIANT ⚠️              │
│                                                 │
│ Completion rate: 95.5% (149/156)                │
│ Target: 100%                                    │
│                                                 │
│ Action items:                                   │
│ 1. Suspend contractor access (IMMEDIATE)       │
│ 2. Renew 3 expired checks (THIS WEEK)          │
│ 3. Automate compliance checks (THIS MONTH)     │
│                                                 │
│ Projected completion: 100% within 14 days      │
│                                                 │
│ Confidence: 90%                                 │
└─────────────────────────────────────────────────┘
```

## **Reasoning: Training Compliance**

**Scenario: Assessing security training completion**

```
Control CC2.2: "Personnel receive security awareness training annually"

HR Compliance Agent Evaluation:

Phase 1: Training Requirements

Company policy:
├─ New hire training: Within 7 days of start
├─ Annual refresher: Every 12 months
├─ Topics required:
│   ├─ Phishing awareness
│   ├─ Password security
│   ├─ Data classification
│   ├─ Incident reporting
│   └─ Physical security
└─ Duration: 45 minutes

Phase 2: Completion Analysis

Query LMS (Lessonly API):
├─ Total users: 156
├─ Completed training: 144 (92.3%)
├─ Incomplete: 12 (7.7%)
└─ Overdue: 8 (5.1%)

Phase 3: Acceptable Threshold?

Question: Is 92.3% compliant?

Agent reasoning:
"SOC 2 doesn't specify exact percentage.
 Best practice: 100% for mandatory training.
 Acceptable: >95% if exceptions documented.
 Current: 92.3% - BORDERLINE"

Investigation needed:
└─ Why are 12 people incomplete?

Incomplete user analysis:

8 users overdue:
├─ User 1: On parental leave (exempt)
├─ User 2: Terminated (HR forgot to remove from LMS)
├─ User 3-8: No valid reason (need to complete)
└─ Actual overdue: 6 (3.8%)

4 users not yet due:
├─ Hired in last 7 days
├─ Training scheduled
└─ Within policy timeframe

Adjusted completion:
├─ Total requiring training: 156 - 1 (terminated) - 1 (on leave) = 154
├─ Completed: 144
├─ Overdue: 6
├─ In progress: 4
└─ Compliance rate: 144/154 = 93.5%

Still below 95% threshold

Phase 4: Remediation

Agent actions:
├─ Email 6 overdue users: "Complete training within 48 hours"
├─ CC their managers
├─ If not completed: Escalate to Director
├─ Temporary measure: Restrict access until training complete?
│   └─ Decision: NO (too disruptive, use escalation instead)
│
└─ Expected outcome: 100% within 1 week

Phase 5: Evidence

For SOC 2 audit:
├─ Training completion report: 93.5%
├─ Remediation: 6 users contacted, deadline set
├─ Follow-up: Will re-test in 1 week
└─ Evidence shows: "Process in place to enforce training"

Confidence: 85% (Will be 100% after remediation)
```

## **Edge Cases**

**Edge Case 1: Executive Exemption Request**

```
Scenario: CEO requests exemption from background check

Request:
"I'm the founder and CEO. Do I really need a background check?"

HR Compliance Agent Response:

Step 1: Policy review
├─ Policy: "All employees require background checks"
├─ Exceptions: None listed
└─ Question: Does "all" include executives?

Step 2: Compliance framework review
├─ SOC 2 CC1.4: "Background checks for positions with access to sensitive data"
├─ CEO access: Full access to ALL data
└─ Requirement: YES, CEO needs background check

Step 3: Practical considerations
├─ CEO is the company owner
├─ Background check investigates CEO's past
├─ Who approves CEO's background check?
└─ This is awkward, but required

Agent recommendation:

┌─────────────────────────────────────────────────┐
│ BACKGROUND CHECK REQUIRED                       │
│                                                 │
│ Position: CEO                                   │
│ Requester: CEO (self-exemption request)        │
│                                                 │
│ Compliance requirement: MANDATORY ❌             │
│                                                 │
│ Reasoning:                                      │
│ - SOC 2 CC1.4 requires checks for all personnel│
│ - CEO has access to ALL sensitive data         │
│ - Auditor will specifically check executive team│
│ - No exemption for ownership/seniority          │
│                                                 │
│ Recommendation: DENY EXEMPTION                  │
│                                                 │
│ Suggested approach:                             │
│ - Board of Directors approves CEO check        │
│ - Results reviewed by Board Chair (not CEO)    │
│ - Maintains independence of process            │
│                                                 │
│ Confidence: 100%                                │
│ (This is a standard audit requirement)         │
└─────────────────────────────────────────────────┘
```

## **Success Metrics**

**HR Compliance Agent Performance:**
- Background check compliance: Target 100% (actual: 95.5% → 100% after remediation)
- Training completion rate: Target >95% (actual: 93.5% → 100% after remediation)
- Offboarding completion: Target 100% within 24 hours (actual: 100%)
- Policy acknowledgment tracking: Target 100% (actual: 100%)
