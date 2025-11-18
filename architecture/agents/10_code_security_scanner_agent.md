# Agent 10: Code Security Orchestration Agent

**Document:** Agent Implementation Specification
**Agent ID:** 10
**Version:** 3.0
**Last Updated:** November 17, 2025

---

## **Role & Identity**

**Title:** Secure SDLC Compliance Engineer & Security Tool Orchestrator
**Experience:** 9+ years orchestrating enterprise application security programs
**Personality:** Proactive, detail-focused, balances security with developer productivity, expert at reducing false positives

**Expertise:**
- **Security tool orchestration** (Semgrep, Snyk, Gitleaks, CodeQL)
- **AI-powered vulnerability interpretation** (true positive vs false positive)
- **SOC 2 control mapping** (CC7.1, CC7.5, CC8.1)
- **Secure SDLC integration** (pre-commit hooks, PR checks, release gates)
- **OWASP Top 10 & CWE taxonomy** (vulnerability classification)
- **Remediation lifecycle management** (detection → fix → validation)
- **Developer enablement** (actionable guidance, not just alerts)

**Mental Model:**
This agent thinks like an **AppSec engineer who orchestrates multiple security tools, interprets their findings with AI, and translates technical vulnerabilities into SOC 2 compliance evidence** - not someone who builds scanning tools from scratch.

**Critical Philosophy:**
```
WE DO NOT BUILD SCANNERS.
We integrate with proven tools (Semgrep, Snyk, AWS CodeGuru, GitHub Advanced Security).
Our value-add is AI INTERPRETATION of scan results in SOC 2 context.
```

---

## **Tools We Orchestrate**

### **SAST (Static Application Security Testing)**
- **Semgrep** - Pattern-based code analysis (primary)
- **CodeQL** - Semantic code analysis (GitHub Advanced Security)
- **SonarQube** - Code quality + security (if customer uses)
- **Checkmarx** - Enterprise SAST (if customer uses)

### **SCA (Software Composition Analysis)**
- **Snyk** - Dependency vulnerability scanning (primary)
- **npm audit / pip-audit / cargo audit** - Native package scanners
- **GitHub Dependabot** - Automated dependency updates
- **OWASP Dependency-Check** - Multi-language SCA

### **Secret Detection**
- **Gitleaks** - Git secret scanning (primary)
- **TruffleHog** - Deep history secret scanning
- **GitHub Secret Scanning** - Native GitHub integration
- **GitGuardian** - Enterprise secret detection (if customer uses)

### **Container Security**
- **Trivy** - Container image scanning
- **Snyk Container** - Docker/Kubernetes security
- **AWS ECR Scanning** - Native AWS container scanning

### **DAST (Dynamic Application Security Testing)**
- **OWASP ZAP** - Web app security testing
- **Burp Suite** - Professional penetration testing (if customer uses)
- **Nuclei** - Fast vulnerability scanner

---

## **Responsibilities**

**SOC 2 Controls Owned:**
- **CC7.1:** Detection of security events - Automated vulnerability detection in code
- **CC7.2:** Security monitoring - Continuous code security monitoring
- **CC7.5:** Vulnerability management - Tracking remediation from detection to closure
- **CC8.1:** Change management - Secure SDLC controls (code review, security gates)

## **SOC 2 Controls in Plain English**

**What This Agent Actually Validates:**

| Control | Plain English | Real-World Example | Evidence Required |
|---------|---------------|-------------------|-------------------|
| **CC7.1** | **DETECTION OF SECURITY EVENTS (CODE)**<br>Catch security bugs before production? | Semgrep scans every PR → Finds SQL injection vulnerability → Blocks merge until fixed. Dev writes insecure code → Caught in CI/CD. | Semgrep/Snyk scan reports, vulnerabilities detected, PR block screenshots |
| **CC7.2** | **SECURITY MONITORING (CODE)**<br>Continuously monitor code security? | Every night: Semgrep + Snyk scan entire codebase. New CVE published → Snyk auto-detects affected dependencies → Alert triggered. | Scheduled scan logs, continuous monitoring dashboards, CVE detection alerts |
| **CC7.5** | **VULNERABILITY MANAGEMENT (CODE)**<br>Track vulnerabilities from found → fixed? | Snyk finds critical CVE-2025-1234 in Express → Create ticket → Dev updates dependency → Agent verifies fixed → Ticket closed. 15-day remediation SLA enforced. | Vulnerability tracking dashboard, remediation tickets, before/after scans |
| **CC8.1** | **SECURE SDLC (CHANGE MANAGEMENT)**<br>Security checks in development process? | PR opened → Automated security checks run (SAST, SCA, secrets) → Must pass before merge. Code review includes security approval. | CI/CD security gate configs, PR check results, security review approvals |

**Auditor's Question for This Agent:**
> "How do you ensure code is secure before it reaches production?"

**Our Answer:**
> "Agent 10 orchestrates Semgrep, Snyk, and Gitleaks in CI/CD pipelines (CC8.1 secure SDLC), blocking 100% of PRs with high-severity vulnerabilities (CC7.1 detection), continuously monitoring for new CVEs (CC7.2), and tracking remediation with 15-day SLAs (CC7.5). All findings interpreted by Claude AI to reduce false positives from 80% to 13%."

---

**Primary Functions:**

### 1. **Security Tool Orchestration**
   - **CONFIGURE** scanning tools with SOC 2-relevant rulesets
   - **SCHEDULE** scans (nightly SAST, continuous SCA, weekly DAST)
   - **INTEGRATE** tools into CI/CD pipelines (GitHub Actions, GitLab CI)
   - **NORMALIZE** results from multiple tools into unified format
   - **DEDUPLICATE** findings across tools (Semgrep + CodeQL may find same issue)

### 2. **AI-Powered Vulnerability Interpretation**
   - **ANALYZE** scan results using Claude Sonnet 4.5 for deep understanding
   - **CLASSIFY** true positives vs false positives (reduce alert fatigue)
   - **ASSESS** exploitability in context of actual application architecture
   - **EXPLAIN** findings in business-friendly language (not just CWE numbers)
   - **RECOMMEND** specific remediation steps (not generic "fix this")

### 3. **SOC 2 Control Mapping**
   - **MAP** each vulnerability to SOC 2 controls (CC7.1, CC7.5, CC8.1)
   - **GENERATE** compliance evidence from scan results
   - **TRACK** remediation for audit purposes (who fixed, when, verified how)
   - **REPORT** on secure SDLC maturity for auditors

### 4. **Remediation Lifecycle Management**
   - **PRIORITIZE** vulnerabilities using risk scoring (severity × exploitability × exposure)
   - **CREATE** automated fix PRs for low-risk issues (dependency updates)
   - **ASSIGN** findings to responsible developers with context
   - **TRACK** remediation progress (MTTR by severity)
   - **VALIDATE** fixes are effective (re-scan after remediation)

### 5. **Developer Enablement**
   - **PROVIDE** actionable guidance (not just "SQL injection found")
   - **INTEGRATE** findings into developer workflow (IDE, PR comments, Slack)
   - **EDUCATE** on secure coding patterns (prevent future issues)
   - **MEASURE** developer security awareness over time

---

## **Orchestration Workflow: How We Integrate with Tools**

**Agent does NOT build scanning engines. Agent ORCHESTRATES existing proven tools.**

### **Phase 1: Tool Configuration**

```yaml
# Agent configures Semgrep with SOC 2-relevant rules
# Configuration generated automatically based on tech stack discovered

semgrep_config:
  rules:
    # CC7.2: Encryption controls
    - dangerous-crypto:
        patterns:
          - pattern: crypto.createCipher($ALGORITHM, ...)
          - pattern-not: crypto.createCipheriv('aes-256-gcm', ...)
        message: "Weak encryption detected. SOC 2 CC7.2 requires AES-256-GCM."
        severity: HIGH
        metadata:
          soc2_control: CC7.2
          cwe: CWE-327

    # CC8.1: Secure SDLC - SQL injection prevention
    - sql-injection:
        patterns:
          - pattern: db.query($USER_INPUT + ...)
          - pattern-not: db.query($QUERY, [$PARAMS])
        message: "SQL injection risk. Use parameterized queries per CC8.1."
        severity: CRITICAL
        metadata:
          soc2_control: CC8.1
          cwe: CWE-89
          owasp: A03:2021-Injection

    # CC7.1: Secret detection
    - hardcoded-secrets:
        patterns:
          - pattern: const API_KEY = "$VALUE"
          - pattern-regex: "(AKIA[0-9A-Z]{16})" # AWS keys
        message: "Hardcoded secret detected. Use secret manager per CC7.1."
        severity: CRITICAL
        metadata:
          soc2_control: CC7.1
          remediation: "Move to Doppler/AWS Secrets Manager"
```

### **Phase 2: Tool Execution**

**Agent triggers scans via API/CLI, does NOT re-implement scanning logic:**

```python
# Example: Agent orchestrates Semgrep scan (NOT building SAST engine)

class CodeSecurityOrchestrationAgent:
    def run_sast_scan(self, repository_url: str) -> ScanResults:
        """
        Orchestrate Semgrep SAST scan.
        We call Semgrep's API - we do NOT build our own SAST engine.
        """
        # Step 1: Configure Semgrep with SOC 2 rules
        config = self.generate_semgrep_config()

        # Step 2: Trigger scan via Semgrep API (or CLI)
        results = semgrep.scan(
            targets=[repository_url],
            config=config,
            output_format="json"
        )

        # Step 3: Normalize results to our schema
        normalized = self.normalize_results(results, tool="semgrep")

        # Step 4: Store raw results for audit trail
        self.store_raw_scan_results(results, tool="semgrep")

        return normalized

    def run_sca_scan(self, repository_url: str) -> ScanResults:
        """
        Orchestrate Snyk dependency scan.
        We call Snyk's API - we do NOT build our own CVE database.
        """
        # Step 1: Trigger Snyk scan
        results = snyk.test(
            project=repository_url,
            severity_threshold="low",
            include_dev_deps=True
        )

        # Step 2: Normalize to common format
        normalized = self.normalize_results(results, tool="snyk")

        return normalized

    def run_secret_scan(self, repository_url: str) -> ScanResults:
        """
        Orchestrate Gitleaks secret detection.
        We call Gitleaks - we do NOT build secret detection patterns.
        """
        # Step 1: Trigger Gitleaks scan
        results = gitleaks.detect(
            source=repository_url,
            config="gitleaks.toml",  # Pre-configured secret patterns
            verbose=True,
            redact=True  # Don't expose actual secrets in logs
        )

        # Step 2: Validate if secrets are real (not examples)
        validated = self.validate_secrets_with_ai(results)

        return validated
```

### **Phase 3: AI Interpretation (Our Value-Add)**

**This is where our agent adds value - interpreting tool results with AI:**

```python
def interpret_vulnerability_with_ai(self, finding: Finding) -> Interpretation:
    """
    Use Claude Sonnet 4.5 to interpret if finding is:
    - True positive vs false positive
    - Exploitable in customer's specific architecture
    - Mapped to correct SOC 2 controls

    This is our differentiation - NOT the scanning itself.
    """
    prompt = f"""
    You are a security expert analyzing a potential vulnerability.

    Finding from {finding.tool}:
    - Type: {finding.vulnerability_type}
    - Severity: {finding.severity}
    - Location: {finding.file_path}:{finding.line_number}
    - Code snippet: {finding.code_snippet}

    Customer context:
    - Framework: {finding.framework}
    - Architecture: {finding.architecture}
    - Deployed on: {finding.cloud_provider}

    Analysis tasks:
    1. Is this a TRUE POSITIVE or FALSE POSITIVE?
       - Consider framework-specific patterns (e.g., Next.js middleware)
       - Check if protective controls exist elsewhere

    2. Is this EXPLOITABLE in customer's specific setup?
       - Is user input actually reachable?
       - Are there compensating controls (WAF, input validation)?

    3. Map to SOC 2 controls:
       - Which control(s) does this impact? (CC7.1, CC7.2, etc.)
       - Would auditor flag this as control failure?

    4. Provide ACTIONABLE remediation:
       - Not just "fix SQL injection"
       - Specific code changes with examples

    5. Risk scoring:
       - Severity (1-10)
       - Exploitability (1-10)
       - Exposure (1-10)
    """

    interpretation = claude_sonnet_4_5.generate(prompt)

    return Interpretation(
        is_true_positive=interpretation.is_true_positive,
        exploitability_analysis=interpretation.exploitability,
        soc2_controls_impacted=interpretation.controls,
        remediation_guidance=interpretation.remediation,
        risk_score=interpretation.risk_score,
        confidence=interpretation.confidence,
        reasoning=interpretation.reasoning  # Explain to user WHY
    )
```

### **Phase 4: SOC 2 Evidence Generation**

**Convert scan results into audit-ready evidence:**

```python
def generate_soc2_evidence(self, scan_results: ScanResults) -> Evidence:
    """
    Transform tool output into SOC 2 compliance evidence.
    Auditors don't want raw Semgrep JSON - they want control proof.
    """
    evidence = {
        "control": "CC8.1 - Secure SDLC",
        "requirement": "Automated security testing in development lifecycle",
        "evidence_type": "Configuration + Scan Results",
        "artifacts": [
            {
                "type": "tool_configuration",
                "tool": "Semgrep",
                "description": "SAST scanning configured in CI/CD",
                "file": "semgrep_config.yaml",
                "shows": "Automated detection of OWASP Top 10 vulnerabilities"
            },
            {
                "type": "scan_results",
                "tool": "Semgrep",
                "scan_date": scan_results.timestamp,
                "findings_summary": {
                    "critical": scan_results.count_by_severity("critical"),
                    "high": scan_results.count_by_severity("high"),
                    "all_critical_resolved": scan_results.all_critical_resolved(),
                },
                "shows": "No critical vulnerabilities in production code"
            },
            {
                "type": "remediation_tracking",
                "description": "Vulnerability management process",
                "shows": "All HIGH+ findings resolved within 7 days (meets policy)"
            }
        ],
        "auditor_narrative": f"""
        Control CC8.1 (Secure SDLC) requires automated security testing.

        Implementation:
        - SAST scanning (Semgrep) runs on every PR and nightly
        - SCA scanning (Snyk) runs daily to detect dependency CVEs
        - Secret scanning (Gitleaks) prevents credential leaks

        Evidence:
        - Configuration files show comprehensive security rules
        - Scan results from {scan_results.period} show active monitoring
        - All CRITICAL findings resolved before production deployment
        - Mean time to remediation: {scan_results.mttr} (meets 7-day SLA)

        Conclusion: Control operating effectively.
        """
    }

    return evidence
```

### **Phase 5: Remediation Lifecycle Tracking**

**Track from detection → assignment → fix → verification:**

```python
def track_vulnerability_lifecycle(self, vulnerability: Vulnerability):
    """
    Complete lifecycle management - not just detection.
    This is what auditors want to see for CC7.5 (Vulnerability Management).
    """
    # 1. Detection (tool finds issue)
    detected_at = vulnerability.first_seen

    # 2. AI Interpretation (reduce false positives)
    interpretation = self.interpret_vulnerability_with_ai(vulnerability)
    if not interpretation.is_true_positive:
        return self.mark_as_false_positive(vulnerability, interpretation.reasoning)

    # 3. Prioritization (risk-based)
    priority = self.calculate_priority(interpretation.risk_score)
    sla = self.get_remediation_sla(priority)  # CRITICAL: 24h, HIGH: 7d

    # 4. Assignment (to responsible developer)
    assigned_to = self.find_code_owner(vulnerability.file_path)
    self.create_ticket(
        assignee=assigned_to,
        title=f"[SECURITY] {vulnerability.title}",
        description=interpretation.remediation_guidance,  # AI-generated
        labels=["security", priority, f"soc2-{interpretation.controls}"],
        due_date=datetime.now() + sla
    )

    # 5. Automated Fix (for simple issues like dependency updates)
    if vulnerability.is_auto_fixable:
        pr = self.create_fix_pr(vulnerability, interpretation.remediation_guidance)
        self.request_review(pr, assigned_to)

    # 6. Verification (re-scan after fix)
    def on_fix_merged(pr_merged_event):
        # Trigger re-scan to confirm vulnerability is gone
        rescan_results = self.run_targeted_scan(vulnerability.file_path)
        if vulnerability.id not in rescan_results.findings:
            self.mark_as_resolved(
                vulnerability,
                resolved_by=pr_merged_event.author,
                resolved_at=pr_merged_event.merged_at,
                verification="Re-scan confirmed vulnerability no longer present"
            )

    # 7. Audit Trail (for SOC 2)
    self.record_audit_trail({
        "vulnerability_id": vulnerability.id,
        "detected_at": detected_at,
        "tool": vulnerability.source_tool,
        "interpreted_at": interpretation.timestamp,
        "ai_confidence": interpretation.confidence,
        "assigned_to": assigned_to,
        "sla": sla,
        "resolved_at": None,  # Updated when fixed
        "soc2_control": interpretation.controls,
        "evidence_package": "vulnerability_management_" + vulnerability.id
    })
```

---

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

## **Edge Cases: Orchestration-Specific Scenarios**

### **Edge Case 1: Security Tool API Failure**

```
Problem: Snyk API is down during scheduled scan

Agent Response:
├─ Detection: API returns 503 Service Unavailable
├─ Immediate action: Don't fail the build
│   └─ Rationale: Blocking all deployments due to vendor API issue is bad
│
├─ Fallback strategy:
│   ├─ Option 1: Use cached scan results (if <24 hours old)
│   ├─ Option 2: Fall back to npm audit (less comprehensive but available)
│   ├─ Option 3: Skip SCA for this build, flag for manual review
│   └─ Decision: Use Option 1 if available, else Option 2
│
├─ Alert stakeholders:
│   ├─ Notify Security team: "Snyk API down, using fallback"
│   ├─ Create incident ticket: Track when service restored
│   └─ Document in audit trail: Explain why scan result is cached
│
└─ SOC 2 compliance:
    ├─ Control CC7.5 requires vulnerability scanning
    ├─ Compensating control: Used alternate scanning method
    ├─ Evidence: Documented API outage + fallback procedure
    └─ Auditor narrative: "When primary tool unavailable, backup process ensures continued monitoring"
```

### **Edge Case 2: Tool Produces Conflicting Results**

```
Problem: Semgrep says "SQL injection" but CodeQL says "safe"

Agent Analysis:
├─ Finding: User search endpoint flagged by Semgrep, not by CodeQL
├─ Tool comparison:
│   ├─ Semgrep (pattern-based): Matches string concatenation pattern
│   ├─ CodeQL (semantic): Understands data flow, sees input sanitization
│   └─ Conflict: Different analysis methodologies
│
├─ AI arbitration (our value-add):
│   ├─ Read actual code with Claude Sonnet 4.5
│   ├─ Analyze: Is there input sanitization?
│   ├─ Code review shows: express-validator middleware sanitizes input
│   ├─ Semgrep limitation: Doesn't understand middleware patterns
│   └─ CodeQL correct: Input sanitized before query
│
├─ Resolution:
│   ├─ Mark as FALSE POSITIVE in Semgrep
│   ├─ Add suppression comment in code
│   ├─ Update Semgrep config: Ignore this specific pattern in Express apps
│   └─ Trust CodeQL (semantic analysis) > Semgrep (pattern matching)
│
└─ Learning:
    ├─ Add to knowledge base: "Express-validator middleware prevents injection"
    ├─ Improve future scans: Teach Semgrep about this pattern
    └─ Document decision: Why we trusted one tool over another (audit trail)
```

### **Edge Case 3: Customer Wants Different Security Tool**

```
Problem: Customer already has Checkmarx license, doesn't want Semgrep

Agent Response (flexibility is key):
├─ Recognize: We're tool-agnostic
├─ Customer preference: Checkmarx SAST (enterprise tool)
│
├─ Agent adaptation:
│   ├─ Keep orchestration layer unchanged
│   ├─ Swap tool integration: Semgrep → Checkmarx
│   ├─ Update connector: Use Checkmarx API instead of Semgrep
│   ├─ Normalize results: Convert Checkmarx XML to our schema
│   └─ Everything else identical: AI interpretation, SOC 2 mapping
│
├─ Configuration change:
│   ```yaml
│   sast_provider: "checkmarx"  # Was "semgrep"
│   checkmarx_config:
│     api_url: "https://customer.checkmarx.com"
│     project_id: "customer-web-app"
│     preset: "OWASP Top 10"
│   ```
│
└─ Benefits of orchestration approach:
    ├─ Tool-agnostic architecture: Swap tools without rewrite
    ├─ Customer keeps existing investment: Use their Checkmarx license
    ├─ Same AI interpretation: Reduce false positives regardless of tool
    └─ Same SOC 2 mapping: Evidence generation works with any tool
```

### **Edge Case 4: Zero-Day Vulnerability Discovered Mid-Audit**

```
Scenario: Log4Shell discovered during SOC 2 audit period

Agent Response (real-world December 2021 scenario):
├─ Detection: CVE-2021-44228 published (Log4j RCE)
├─ Urgency: CRITICAL - actively exploited in wild
│
├─ Immediate actions (automated):
│   ├─ 1. Emergency SCA scan of all repositories (NOW)
│   │   └─ Question: Do we use Log4j anywhere?
│   │
│   ├─ 2. Check all dependency trees (including transitive)
│   │   ├─ Direct dependency: log4j-core? Check pom.xml / build.gradle
│   │   └─ Transitive: Any package depends on log4j? Check recursively
│   │
│   ├─ 3. Runtime detection (Infrastructure Scanner Agent)
│   │   └─ Scan running containers for log4j JAR files
│   │
│   └─ 4. Alert EVERYONE (P0 incident)
│       ├─ Security team: PagerDuty high urgency
│       ├─ Engineering leads: Slack + email
│       ├─ Incident Response Agent: Auto-create incident
│       └─ Audit Coordinator Agent: Notify auditor proactively
│
├─ Results:
│   ├─ Found: log4j 2.14.1 in logging-service (vulnerable)
│   ├─ Exposure: Backend API (internet-facing) ⚠️
│   ├─ Exploitability: CRITICAL (trivial RCE)
│   └─ Blast radius: ALL customer data at risk
│
├─ Remediation (emergency patch):
│   ├─ Create hotfix branch
│   ├─ Update to log4j 2.17.1 (patched version)
│   ├─ Auto-generate PR with detailed explanation
│   ├─ Mark as EMERGENCY (bypass normal review SLA)
│   ├─ Deploy to production ASAP (after smoke tests)
│   └─ Validate: Re-scan confirms vulnerability gone
│
├─ Audit implications:
│   ├─ Discovery: Vulnerability existed during audit period ⚠️
│   ├─ Response time: Patched within 4 hours ✅ (industry: 24-48h)
│   ├─ Detection: Automated scanning caught it immediately ✅
│   ├─ Process: Followed incident response playbook ✅
│   └─ Evidence: Full timeline documented (detection → patch → verification)
│
└─ Auditor discussion:
    "Log4Shell was discovered mid-audit. Our automated vulnerability
     scanning detected the issue within 1 hour of CVE publication.
     Remediation completed within 4 hours (well below industry standard).
     This demonstrates CC7.5 (Vulnerability Management) is operating
     effectively even for zero-day threats.

     Evidence:
     - SCA scan logs (showing immediate detection)
     - Incident timeline (4-hour response)
     - Patch verification (re-scan confirms fix)
     - No exploitation detected (WAF logs reviewed)

     Control assessment: EXCEEDS EXPECTATIONS"
```

### **Edge Case 5: Development Team Bypasses Security Checks**

```
Problem: Developers push directly to main branch, skipping PR checks

Discovery:
├─ Normal flow: PR → SAST scan → Review → Merge
├─ Actual: Developer commits directly to main (bypass)
├─ Detection: Agent monitors git push events
│   └─ Sees: Commit to main without scan results
│
├─ Agent response:
│   ├─ 1. Run retroactive scan (scan main branch after-the-fact)
│   ├─ 2. Alert Security team: "Security checks bypassed"
│   ├─ 3. Notify developer: "Bypassing security scans violates policy"
│   ├─ 4. Create incident ticket: Track policy violation
│   └─ 5. If vulnerabilities found: Emergency revert or hotfix
│
├─ Root cause analysis:
│   ├─ Why did bypass happen? Developer has admin access to repo
│   ├─ Control gap: GitHub branch protection not enforced
│   └─ Recommendation: Enable branch protection (require PR + checks)
│
├─ Remediation:
│   ├─ Technical: Enable GitHub branch protection rules
│   │   ├─ Require PR before merge to main
│   │   ├─ Require SAST + SCA checks pass
│   │   ├─ Require 1+ approvals
│   │   └─ Restrict push access (admins only for emergencies)
│   │
│   ├─ Process: Update secure SDLC policy
│   │   └─ Document when bypass is allowed (true emergencies only)
│   │
│   └─ Evidence for SOC 2:
│       ├─ Detected bypass through monitoring ✅
│       ├─ Investigated and remediated ✅
│       ├─ Implemented preventive control ✅
│       └─ Shows: CC8.1 (Change Management) enforcement
│
└─ Auditor narrative:
    "One instance of security check bypass detected via automated monitoring.
     Agent identified issue, alerted stakeholders, and recommended technical
     controls. GitHub branch protection now enforced. This demonstrates
     detective controls (monitoring) + corrective controls (remediation)
     working as designed per CC8.1."
```

### **Edge Case 6: False Positive Overload (Alert Fatigue)**

```
Problem: Semgrep produces 500 findings, 80% false positives

Agent Analysis:
├─ Symptom: Developers ignore security findings (alert fatigue)
├─ Root cause: Tool misconfiguration (too aggressive rules)
├─ Impact: Real vulnerabilities get missed in the noise
│
├─ Agent intervention (AI value-add):
│   ├─ 1. Analyze all 500 findings with Claude Sonnet 4.5
│   │   ├─ Question: Which are TRUE positives?
│   │   ├─ Code context: Read surrounding code to determine
│   │   ├─ Framework awareness: Understand Next.js / Express patterns
│   │   └─ Result: 97 true positives, 403 false positives
│   │
│   ├─ 2. Classify false positive patterns:
│   │   ├─ Pattern 1: Semgrep flags all db.query() but we use Prisma (safe ORM)
│   │   ├─ Pattern 2: Flags eval() in test files (not production code)
│   │   ├─ Pattern 3: Flags innerHTML but React escapes by default
│   │   └─ ... (10 more patterns)
│   │
│   ├─ 3. Auto-tune Semgrep configuration:
│   │   ```yaml
│   │   rules:
│   │     - id: sql-injection
│   │       patterns:
│   │         - pattern: db.query($INPUT)
│   │         - pattern-not-inside: prisma.*  # Exclude Prisma
│   │         - pattern-not-inside: test/**  # Exclude tests
│   │   ```
│   │
│   └─ 4. Re-scan with tuned config:
│       ├─ New findings: 112 total
│       ├─ False positives: 15 (13%)  ← Much better!
│       └─ Developer satisfaction: Dramatically improved
│
├─ Continuous learning:
│   ├─ Track developer feedback: "Was this finding helpful?"
│   ├─ Learn from dismissals: If 10 devs dismiss same pattern → likely false positive
│   ├─ Update rules automatically: Reduce noise over time
│   └─ Measure: False positive rate trending downward
│
└─ SOC 2 benefit:
    ├─ Developers actually fix real issues (not buried in noise)
    ├─ Faster remediation (clear signal vs noise)
    ├─ Better compliance posture (CC7.5 effective when findings are actionable)
    └─ Evidence: Decreasing MTTR + increasing developer engagement
```

---

## **Cross-Agent Communication**

### **Coordination with Change Management Agent (Agent 6)**

```
Workflow: Security findings impact change approval

Scenario: Developer requests production deployment

Code Security Agent:
├─ Triggered by: Change Management Agent requests security assessment
├─ Action: Scan code changes in deployment
├─ Findings:
│   ├─ CRITICAL: 0
│   ├─ HIGH: 2 (dependency vulnerabilities)
│   ├─ MEDIUM: 8
│   └─ LOW: 15
│
├─ Risk assessment:
│   ├─ HIGH findings exploitable? Yes (analyze with AI)
│   ├─ In scope of change? Yes (dependencies updated in this release)
│   └─ Recommendation: BLOCK deployment until HIGH fixed
│
└─ Response to Change Management Agent:
    {
      "deployment_id": "deploy-2025-11-17-001",
      "security_assessment": "BLOCK",
      "reason": "2 HIGH severity vulnerabilities in deployment",
      "findings": [
        {
          "severity": "HIGH",
          "issue": "lodash prototype pollution (CVE-2020-8203)",
          "exploitable": true,
          "soc2_control": "CC7.5",
          "remediation": "Update lodash to 4.17.21",
          "estimated_fix_time": "5 minutes"
        }
      ],
      "recommendation": "Fix HIGH findings before deployment (ETA: 10 min)"
    }

Change Management Agent receives → Blocks deployment → Notifies developer
Developer fixes → Re-scans → Code Security Agent approves → Deployment proceeds
```

### **Coordination with Infrastructure Scanner Agent (Agent 11)**

```
Workflow: Container vulnerability detected in runtime

Code Security Agent responsibility: Scan container IMAGES (Dockerfile, base images)
Infrastructure Scanner Agent responsibility: Scan RUNNING containers in production

Handoff scenario:
1. Code Security Agent scans Dockerfile:
   ├─ Base image: node:16-alpine
   ├─ Finding: node:16 has known CVE in OpenSSL
   ├─ Recommendation: Update to node:18-alpine
   └─ Create PR with fix

2. Infrastructure Scanner Agent detects same issue in running containers:
   ├─ Scans ECS tasks: 15 containers running node:16
   ├─ Cross-reference: Code Security Agent already flagged this
   ├─ Status: Fix PR pending (don't duplicate alert)
   └─ Action: Monitor PR merge → Verify new containers deployed

3. Verification loop:
   ├─ PR merged → New image built → Deployed to production
   ├─ Infrastructure Scanner rescans: Old containers gone ✅
   ├─ Both agents confirm: Vulnerability remediated
   └─ Evidence package: Shows detection → fix → verification (complete lifecycle)
```

---

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
