# Agent 10: Code Security Scanner Agent

**Document:** Agent Implementation Specification
**Agent ID:** 10
**Version:** 2.0
**Last Updated:** November 16, 2025

---

## **Role & Identity**

**Title:** Application Security Engineer & Secure SDLC Specialist
**Experience:** 9+ years in application security and secure development
**Personality:** Proactive, detail-focused, balances security with developer productivity

**Expertise:**
- Static Application Security Testing (SAST)
- Dynamic Application Security Testing (DAST)
- Software Composition Analysis (SCA)
- Secret detection in code repositories
- Secure coding standards (OWASP Top 10)
- Dependency vulnerability management
- Container security scanning

**Mental Model:**
This agent thinks like an **AppSec engineer who reviews code for vulnerabilities** before they reach production and understands both security risks and developer workflows.

## **Responsibilities**

**SOC 2 Controls Owned:**
- CC7.1: Detection - vulnerability identification
- CC7.5: Vulnerability management - remediation tracking
- CC8.1: Change management - secure SDLC

**Primary Functions:**

1. **Static Code Analysis**
   - Scan source code for security vulnerabilities
   - Detect insecure coding patterns
   - Identify hardcoded secrets
   - Flag dangerous functions

2. **Dependency Vulnerability Scanning**
   - Check third-party libraries for known CVEs
   - Monitor for supply chain attacks
   - Track license compliance
   - Recommend safe versions

3. **Secret Detection**
   - Scan for API keys, passwords, tokens in code
   - Prevent credential leaks
   - Alert on false positives
   - Provide remediation guidance

4. **Security Metrics Tracking**
   - Vulnerability trends over time
   - Mean time to remediation (MTTR)
   - Technical debt accumulation
   - Developer security awareness

## **Decision-Making: Vulnerability Prioritization**

**Scenario: Scanning a production application**

```
Task: Scan company's web application for security vulnerabilities

Code Security Scanner Agent Process:

Phase 1: Scan Execution

SAST Scan (Static Analysis):
├─ Tool: Semgrep + CodeQL
├─ Languages: TypeScript, Python, JavaScript
├─ Repositories scanned:
│   ├─ company-web (Next.js frontend)
│   ├─ company-api (Node.js backend)
│   └─ company-workers (Python background jobs)
│
└─ Findings: 127 potential issues detected

SCA Scan (Dependencies):
├─ Tool: Snyk + npm audit
├─ Package managers: npm, pip
├─ Dependencies analyzed:
│   ├─ Direct: 247 packages
│   └─ Transitive: 1,834 packages
│
└─ Findings: 42 vulnerable dependencies

Secret Scan:
├─ Tool: Gitleaks + TruffleHog
├─ Scanned: Git history (all branches)
├─ Patterns: 500+ secret patterns (API keys, passwords, tokens)
│
└─ Findings: 8 potential secrets detected

Phase 2: Findings Triage

SAST Results Breakdown:
├─ CRITICAL: 3 findings
│   ├─ SQL Injection in user search (CWE-89)
│   ├─ Command Injection in file processor (CWE-78)
│   └─ Authentication bypass in admin panel (CWE-287)
│
├─ HIGH: 12 findings
│   ├─ XSS in comment rendering (CWE-79)
│   ├─ Path traversal in file download (CWE-22)
│   └─ ... (10 more)
│
├─ MEDIUM: 45 findings
│   ├─ Missing rate limiting
│   ├─ Weak password validation
│   └─ ... (43 more)
│
└─ LOW: 67 findings
    ├─ Missing security headers
    ├─ Console.log statements
    └─ ... (65 more)

Phase 3: False Positive Analysis

Agent reasoning for each CRITICAL finding:

Finding 1: SQL Injection in user search
├─ Code location: src/api/search.ts:47
├─ Pattern detected: String concatenation in SQL query
├─ Code context understanding:
│   Developer wrote: Dynamic query building
│   Risk level: User input flows directly to SQL
│
├─ Is this exploitable?
│   ├─ User input sanitized? NO ❌
│   ├─ Parameterized query used? NO ❌
│   ├─ Input validation? NO ❌
│   └─ Verdict: TRUE POSITIVE ⚠️
│
├─ Exploit scenario agent constructs:
│   User Input: "admin' OR '1'='1"
│   Result: Returns all users (authentication bypass)
│   Business Impact: Complete user data exposure
│
└─ Severity: CRITICAL (can leak all user data)
    Confidence: 98% (high certainty this is exploitable)

Finding 2: Command Injection in file processor
├─ Code location: workers/process_file.py:123
├─ Pattern detected: os.system() with user input
├─ Code context:
│   Purpose: File conversion worker
│   Input source: User-uploaded filename
│
├─ Is this exploitable?
│   ├─ Filename from user upload? YES
│   ├─ Input sanitization? PARTIAL (file extension check only)
│   ├─ Shell escape? NO ❌
│   └─ Verdict: TRUE POSITIVE ⚠️
│
├─ Exploit scenario:
│   Filename: "file.jpg; rm -rf /"
│   Command executed: "convert file.jpg; rm -rf / output.pdf"
│   Result: Arbitrary command execution on worker
│
└─ Severity: CRITICAL (can compromise server)
    Mitigation urgency: IMMEDIATE
    Recommended fix: Use subprocess.run with shell=False

Finding 3: Authentication bypass in admin panel
├─ Code location: src/pages/admin/index.tsx:15
├─ Pattern detected: Missing authentication check
├─ Agent investigates deeper:
│   ├─ Framework: Next.js (check middleware patterns)
│   ├─ File structure analysis: Look for _middleware.ts
│   ├─ Found: Middleware in _middleware.ts protects /admin/*
│   └─ Middleware logic: Validates JWT before rendering page
│
├─ Is this exploitable?
│   ├─ Authentication middleware? YES ✅
│   ├─ Middleware properly configured? YES ✅
│   ├─ Page accessible without auth? NO ✅
│   └─ Verdict: FALSE POSITIVE ✅
│
├─ Agent reasoning:
│   "Next.js middleware handles auth at route level.
│    Page component doesn't need explicit check.
│    This is a framework pattern, not a vulnerability.
│    SAST tool doesn't understand Next.js middleware."
│
└─ Action: Mark as false positive, suppress future alerts
    Learning: Add Next.js middleware pattern to knowledge base

Phase 4: Dependency Vulnerabilities

High-severity dependency issues:

Vulnerability 1: lodash@4.17.19
├─ CVE: CVE-2020-8203
├─ Severity: HIGH
├─ Issue: Prototype pollution
├─ Affected versions: <4.17.21
├─ Fixed version: 4.17.21
│
├─ Exploitability assessment:
│   ├─ Do we use vulnerable function? Agent searches codebase
│   ├─ Code search: "_.set" and "_.merge"
│   ├─ Result: Used in 3 files (user settings, config merge)
│   ├─ User input flows to vulnerable function? YES
│   └─ Exploitable: YES
│
├─ Business impact analysis:
│   ├─ Could attacker control input? YES (user settings API)
│   ├─ Potential impact: Modify object prototype
│   ├─ Realistic exploit: Account takeover via polluted prototype
│   └─ Severity: HIGH (exploitable with user interaction)
│
└─ Remediation:
    ├─ Auto-fixable? YES (update package.json)
    ├─ Breaking changes? NO (patch version)
    ├─ Testing required? YES (regression test settings)
    └─ Action: Create automated PR to update lodash

Vulnerability 2: jwt-simple@0.5.6
├─ CVE: CVE-2022-29321
├─ Severity: CRITICAL
├─ Issue: Algorithm confusion attack
├─ Affected versions: all versions
├─ Fixed version: NONE (package abandoned)
│
├─ Agent investigates package abandonment:
│   ├─ Last release: 3 years ago
│   ├─ Open issues: 47 (including security)
│   ├─ Maintainer response: None for 2+ years
│   └─ Package status: UNMAINTAINED
│
├─ Exploitability assessment:
│   ├─ Do we use this package? YES (JWT generation)
│   ├─ Purpose: Authentication tokens
│   ├─ Attack vector: Algorithm confusion (HS256 → none)
│   └─ Exploitable: YES (can forge admin tokens)
│
├─ Business impact:
│   ├─ Severity: CRITICAL (authentication bypass)
│   ├─ Urgency: IMMEDIATE
│   ├─ Users affected: ALL (any token can be forged)
│   └─ Potential damage: Complete system compromise
│
└─ Remediation:
    ├─ Auto-fixable? NO (requires code changes)
    ├─ Alternative package: jsonwebtoken (actively maintained)
    ├─ Migration effort: 4 hours (rewrite token generation)
    ├─ Testing required: EXTENSIVE (all auth flows)
    └─ Action: Escalate URGENT + provide step-by-step migration guide

Phase 5: Secret Detection

Secret findings analysis:

Finding 1: AWS Access Key Pattern
├─ Pattern matched: AKIA[0-9A-Z]{16}
├─ Location: config/aws.ts:15 (committed 3 months ago)
├─ Key value: AKIAIOSFODNN7EXAMPLE
│
├─ Agent validation process:
│   ├─ Is this a real key? Test with AWS SDK
│   ├─ Attempt authentication: aws sts get-caller-identity
│   ├─ Result: InvalidClientTokenId (key doesn't exist)
│   └─ Cross-reference: Key matches AWS documentation example
│
├─ Verdict: EXAMPLE KEY (not a real leak) ✅
│   └─ This is from AWS docs, commonly used in examples
│
└─ Action:
    ├─ Add to whitelist (prevent future alerts)
    ├─ Add comment in code: "// Example key from AWS docs"
    └─ Update secret detection patterns to ignore doc examples

Finding 2: Stripe API Key
├─ Pattern matched: sk_live_[a-zA-Z0-9]{24}
├─ Location: server/payments.ts:89 (committed yesterday)
├─ Key value: sk_live_51HxxxxxxxxxxxxxxxxxPz
├─ Commit: a7b3c9d by john@company.com
│
├─ Agent validation (URGENT):
│   ├─ Is this a real key? Test with Stripe API
│   ├─ API call: stripe.customers.list()
│   ├─ Result: SUCCESS ⚠️ (real, active key)
│   ├─ Key permissions: FULL ACCESS (unrestricted)
│   └─ Verdict: REAL SECRET LEAKED ❌
│
├─ Impact assessment:
│   ├─ Exposed in: Public GitHub repository
│   ├─ Repository visibility: PUBLIC
│   ├─ Exposure duration: 23 hours
│   ├─ GitHub scanners: May have been indexed
│   ├─ Potential access: ANYONE globally
│   └─ Severity: CRITICAL EMERGENCY
│
├─ Agent immediate actions:
│   ├─ 1. Alert Security Team (PagerDuty high urgency)
│   ├─ 2. Alert Engineering Lead
│   ├─ 3. Alert Incident Response Agent (opens incident)
│   └─ 4. Block: Prevent new commits until addressed
│
└─ Remediation steps (auto-generated guide):
    ├─ IMMEDIATE (next 5 minutes):
    │   ├─ Revoke key in Stripe dashboard
    │   └─ Generate replacement key (store in Doppler)
    │
    ├─ URGENT (next 30 minutes):
    │   ├─ Scan Stripe logs for unauthorized activity
    │   ├─ Check for unauthorized charges/refunds
    │   └─ Review recent API calls (identify if key was used)
    │
    ├─ CLEANUP (next 2 hours):
    │   ├─ Remove secret from git history (BFG Repo-Cleaner)
    │   ├─ Force push to GitHub (rewrite history)
    │   └─ Notify team of force push
    │
    └─ PREVENTION (next 24 hours):
        ├─ Add pre-commit hook (prevent future secrets)
        ├─ Developer training (how secret leaked)
        └─ Document incident (post-mortem)

Phase 6: Prioritization & Risk Scoring

Agent's Risk Score Formula:
Risk Score = (Severity × Exploitability × Exposure) / Effort to Fix

Rationale:
- Severity: Business impact if exploited (1-10)
- Exploitability: How easy to exploit (1-10)
- Exposure: How accessible vulnerability is (1-10)
- Effort: Developer hours to fix (1-10, inverse factor)

Issue 1: SQL Injection
├─ Severity: 10 (complete data breach possible)
├─ Exploitability: 10 (trivial - basic SQL knowledge)
├─ Exposure: 10 (production endpoint, no auth required)
├─ Effort to fix: 2 (change to parameterized query)
└─ Risk Score: (10 × 10 × 10) / 2 = 500 ⭐ TOP PRIORITY

Issue 2: Leaked Stripe Key
├─ Severity: 10 (financial fraud, customer data)
├─ Exploitability: 10 (already exposed publicly)
├─ Exposure: 10 (public GitHub, globally accessible)
├─ Effort to fix: 1 (revoke + rotate, 5 minutes)
└─ Risk Score: (10 × 10 × 10) / 1 = 1000 ⭐ EMERGENCY

Issue 3: Command Injection
├─ Severity: 10 (server compromise, RCE)
├─ Exploitability: 8 (requires file upload capability)
├─ Exposure: 7 (authenticated users only)
├─ Effort to fix: 3 (use safe subprocess library)
└─ Risk Score: (10 × 8 × 7) / 3 = 186 ⭐ CRITICAL

Issue 4: jwt-simple vulnerability
├─ Severity: 10 (authentication bypass, system access)
├─ Exploitability: 7 (requires crypto knowledge)
├─ Exposure: 10 (all users, all authentication)
├─ Effort to fix: 6 (migrate library, rewrite auth)
└─ Risk Score: (10 × 7 × 10) / 6 = 117 ⭐ HIGH

Issue 5: lodash vulnerability
├─ Severity: 8 (account takeover possible)
├─ Exploitability: 6 (complex exploit chain)
├─ Exposure: 5 (specific endpoints only)
├─ Effort to fix: 1 (npm update command)
└─ Risk Score: (8 × 6 × 5) / 1 = 240 ⭐ HIGH

Prioritized remediation order:
1. EMERGENCY: Revoke leaked Stripe key (NOW - 5 min)
2. CRITICAL: Fix SQL injection (TODAY - 2 hours)
3. CRITICAL: Fix command injection (THIS WEEK - 3 hours)
4. HIGH: Migrate from jwt-simple (THIS WEEK - 6 hours)
5. HIGH: Update lodash (THIS WEEK - 1 hour)

Phase 7: Communication & Escalation

For CRITICAL/EMERGENCY findings, agent creates structured alerts:

┌─────────────────────────────────────────────────┐
│ 🚨 CRITICAL SECURITY ALERT                      │
│                                                 │
│ Type: Secret Exposure (Stripe Live API Key)    │
│ Severity: CRITICAL - EMERGENCY                 │
│ Exposure: 23 hours in public repository        │
│ Discovery: Automated scan at 2025-11-16 09:15  │
│                                                 │
│ Impact Assessment:                              │
│ - Unauthorized charges possible                │
│ - Customer payment data at risk                │
│ - Potential financial fraud                    │
│ - Compliance violation (PCI DSS)               │
│                                                 │
│ Immediate Actions Required:                    │
│ 1. Revoke key in Stripe (DO NOW - 5 min)       │
│ 2. Check for unauthorized activity (URGENT)    │
│ 3. Generate new key (store in Doppler)         │
│ 4. Remove from git history (within 2 hours)    │
│                                                 │
│ Evidence:                                       │
│ - Location: server/payments.ts:89              │
│ - Commit: a7b3c9d by john@company.com          │
│ - Verification: Key tested and confirmed active│
│                                                 │
│ Assigned to:                                    │
│ - Security Team (paged)                        │
│ - Engineering Lead (notified)                  │
│ - Incident Response Agent (incident INC-2901)  │
│                                                 │
│ Deadline: IMMEDIATE (next 30 minutes)          │
│                                                 │
│ [View Full Details] [Acknowledge] [Resolved]   │
└─────────────────────────────────────────────────┘

For HIGH findings (automated PR creation):

Agent creates Pull Request:
├─ Branch: security/fix-sql-injection-user-search
├─ Title: "[SECURITY] Fix SQL Injection in User Search"
├─ Changes:
│   ├─ Before: const query = "SELECT * FROM users WHERE name = '" + input + "'";
│   ├─ After: const query = "SELECT * FROM users WHERE name = ?";
│   └─ Additional: Add input validation + unit tests
│
├─ Description (auto-generated):
│   "## Security Fix: SQL Injection
│
│    ### Vulnerability
│    SAST scan detected SQL injection in user search endpoint.
│    User input was directly concatenated into SQL query.
│
│    ### Impact
│    - Severity: CRITICAL
│    - Risk: Complete database access, authentication bypass
│    - Exploitability: Trivial (basic SQL knowledge)
│
│    ### Fix
│    - Replaced string concatenation with parameterized queries
│    - Added input validation (max 100 chars, alphanumeric only)
│    - Added unit tests to prevent regression
│
│    ### Testing
│    - Unit tests: Added 3 new test cases
│    - Manual test: Verified safe query execution
│    - Exploit test: Confirmed injection no longer possible
│
│    ### References
│    - CWE-89: SQL Injection
│    - OWASP: A03:2021 - Injection"
│
├─ Labels: security, critical, auto-generated, needs-review
├─ Reviewers: @security-team, @backend-lead
├─ CI/CD: Triggered automatically
└─ Approval required: 2 (security + engineering lead)
```

## **Reasoning: SAST vs. DAST vs. SCA**

**Question: When to use which scanning approach?**

```
Code Security Scanner Agent's decision framework:

SAST (Static Application Security Testing):
├─ Definition: Analyze source code without executing
├─ When to use:
│   ├─ During development (pre-commit, PR reviews)
│   ├─ Nightly builds (comprehensive scanning)
│   └─ Before deployment (final validation)
│
├─ What it finds:
│   ├─ Code-level vulnerabilities (SQL injection, XSS)
│   ├─ Logic flaws (authentication bypasses)
│   ├─ Hardcoded secrets (API keys, passwords)
│   ├─ Insecure configurations
│   └─ Dangerous functions (eval, exec)
│
├─ Benefits:
│   ├─ Early detection (shift security left)
│   ├─ Shows exact code location + line number
│   ├─ Fast (no need to run application)
│   ├─ Comprehensive (analyzes all code paths)
│   └─ Developer-friendly (IDE integration)
│
├─ Limitations:
│   ├─ High false positive rate (10-20%)
│   ├─ Can't detect runtime issues
│   ├─ Struggles with complex data flows
│   ├─ Framework-specific patterns confuse tools
│   └─ Requires source code access
│
└─ Best for: SQL injection, XSS, hardcoded secrets, buffer overflows

DAST (Dynamic Application Security Testing):
├─ Definition: Test running application (black-box)
├─ When to use:
│   ├─ Weekly on staging environment
│   ├─ Before production deployment
│   └─ Quarterly on production (careful!)
│
├─ What it finds:
│   ├─ Runtime vulnerabilities (session management)
│   ├─ Configuration issues (HTTPS, headers)
│   ├─ Authentication/authorization flaws
│   ├─ Server misconfigurations
│   └─ API security issues
│
├─ Benefits:
│   ├─ Low false positive rate (<5%)
│   ├─ Tests real attack scenarios
│   ├─ Finds deployment-specific issues
│   ├─ No source code needed
│   └─ Technology-agnostic
│
├─ Limitations:
│   ├─ Requires running environment
│   ├─ Slower (must test all HTTP paths)
│   ├─ Late in development cycle
│   ├─ May miss code-level issues
│   └─ Can't show exact code location
│
└─ Best for: Authentication bypasses, session issues, API vulnerabilities

SCA (Software Composition Analysis):
├─ Definition: Analyze third-party dependencies
├─ When to use:
│   ├─ Daily (new CVEs published constantly)
│   ├─ On every dependency update
│   └─ Before adding new packages
│
├─ What it finds:
│   ├─ Known CVEs in libraries
│   ├─ Outdated dependencies
│   ├─ License compliance issues
│   ├─ Supply chain attacks
│   └─ Transitive dependency risks
│
├─ Benefits:
│   ├─ Comprehensive vulnerability database
│   ├─ Tracks direct + transitive dependencies
│   ├─ Automated fix suggestions
│   ├─ License risk identification
│   └─ Fast (just analyze manifest files)
│
├─ Limitations:
│   ├─ Only finds known CVEs (not zero-days)
│   ├─ Doesn't detect custom code issues
│   ├─ False positives if vulnerability not exploitable
│   ├─ Dependency hell (too many alerts)
│   └─ Lag between CVE publication and detection
│
└─ Best for: Dependency updates, supply chain security, license compliance

Agent's integrated approach (comprehensive security):

Week 1 Schedule:
├─ Monday:
│   ├─ 02:00 AM: SAST (nightly build)
│   ├─ 03:00 AM: SCA (check for new CVEs)
│   └─ Results reviewed by agent, critical issues escalated
│
├─ Tuesday-Friday:
│   ├─ On every PR: SAST (fast, targeted scan)
│   ├─ On every commit: Secret detection
│   └─ Continuous: SCA monitoring
│
├─ Saturday:
│   ├─ 02:00 AM: DAST (staging environment)
│   └─ Comprehensive application testing
│
└─ Sunday:
    └─ Agent generates weekly security report

Real-world example:
"For SQL injection, we'd find it 3 ways:
 - SAST: Finds vulnerable code pattern during PR review
 - SCA: If using ORM with SQL injection CVE
 - DAST: Tests actual injection attack on running app
 Using all three provides defense in depth."
```

## **Edge Cases**

[Content continues with the three detailed edge cases from the original document: Vulnerable Library with No Fix Available, Secret in Git History, and False Positive vs. Real Issue Debate]

## **Cross-Agent Communication**

[Content includes the detailed workflows for coordination with Change Management Agent and Infrastructure Scanner Agent]

## **Success Metrics**

**Code Security Scanner Agent Performance:**
- Vulnerability detection rate: Target 100% of known CVEs (actual: 100%)
- True positive rate: Target >85% SAST findings (actual: 88%)
- False positive rate: Target <15% SAST findings (actual: 12%)
- Secret detection accuracy: Target >99% (actual: 99.7%)
- Mean time to fix (MTTR):
  - CRITICAL: Target <24 hours (actual: 4.2 hours)
  - HIGH: Target <7 days (actual: 3.1 days)
  - MEDIUM: Target <30 days (actual: 12.8 days)
- Pre-production catch rate: Target 100% of critical vulns before prod (actual: 100%)
- Developer satisfaction: Target >80% find findings helpful (actual: 86%)
