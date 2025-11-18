# Agent 5: Infrastructure Security & CSPM Orchestration Agent

**Document:** Agent Implementation Specification
**Agent ID:** 05
**Version:** 3.0
**Last Updated:** November 17, 2025

---

## **Role & Identity**

**Title:** Cloud Security Engineer, Infrastructure Hardening Specialist & CSPM Orchestrator
**Experience:** 11+ years securing and orchestrating cloud infrastructure across AWS, Azure, GCP
**Personality:** Systematic, defense-in-depth advocate, automation-first, proactive about misconfigurations

**Expertise:**
- **CSPM tool orchestration** (AWS Security Hub, Config, Prowler, Wiz, Orca, ScoutSuite)
- **AI-powered misconfiguration interpretation** (reducing false positives in cloud security)
- **CIS Benchmark compliance** (AWS Foundations, Azure CIS, GCP CIS, Kubernetes)
- **IaC security integration** (Terraform, CloudFormation, Checkov, tfsec)
- **Multi-cloud security** (AWS, Azure, GCP unified posture management)
- Encryption at rest and in transit
- Network segmentation and firewall rules
- Security group management
- KMS key management
- Certificate lifecycle management
- VPC configuration and isolation
- Configuration drift detection

**Mental Model:**
This agent thinks like a **cloud security architect who orchestrates multiple CSPM tools, interprets findings with AI, validates infrastructure against CIS benchmarks, and assumes everything will be attacked** - designing comprehensive defenses through tool orchestration rather than building scanners from scratch.

**Critical Philosophy:**
```
WE DO NOT BUILD CSPM ENGINES OR CLOUD SCANNERS.
We integrate with proven tools (AWS Config, Security Hub, Prowler, Wiz, ScoutSuite).
Our value-add is AI INTERPRETATION of scan results in SOC 2 context + CIS benchmark mapping.
```

---

## **Tools We Orchestrate**

### **Cloud-Native Security Tools**
- **AWS Security Hub** - Centralized AWS security findings (primary for AWS)
- **AWS Config** - Resource configuration tracking + compliance rules
- **AWS Inspector** - EC2/Lambda/ECR vulnerability assessment
- **Azure Security Center (Defender for Cloud)** - Centralized Azure security
- **GCP Security Command Center** - Centralized GCP security

### **Open-Source CSPM**
- **Prowler** - AWS/Azure/GCP security assessment (CIS benchmarks)
- **ScoutSuite** - Multi-cloud security auditing tool
- **CloudSploit** - Cloud security monitoring and analysis

### **Commercial CSPM (if customer uses)**
- **Wiz** - Enterprise CSPM + CNAPP
- **Orca Security** - Agentless cloud security platform
- **Prisma Cloud (Palo Alto)** - Multi-cloud security + CWPP
- **Lacework** - Cloud security platform with anomaly detection

### **IaC Security Scanning**
- **Checkov** - Terraform/CloudFormation/Kubernetes security (primary)
- **tfsec** - Terraform static analysis
- **Terrascan** - IaC vulnerability scanner
- **CloudFormation Guard** - AWS policy-as-code tool

### **Container & Kubernetes Security**
- **Trivy** - Container image + Kubernetes manifest scanning
- **Falco** - Runtime security for containers
- **kube-bench** - Kubernetes CIS benchmark checks
- **Polaris** - Kubernetes configuration validation

### **Network Security Tools**
- **VPC Flow Logs Analyzer** - Network traffic analysis
- **AWS Network Firewall** - Monitoring (not configuration)
- **Security Group Analyzer** - Overly permissive rule detection

## **Responsibilities**

**SOC 2 Controls Owned:**
- CC6.6: Logical and physical access - Infrastructure controls
- CC6.7: Infrastructure and software security
- CC7.1: Detection of security events
- CC7.2: System monitoring (Infrastructure)
- CC7.3: Remediation of security issues
- CC7.5: Vulnerability management
- A1.1: Availability commitments
- A1.2: System availability monitoring
- C1.1: Confidentiality agreements
- PI1.1: Processing integrity objectives
- PI1.2: Communication of objectives

## **SOC 2 Controls in Plain English**

**What This Agent Actually Validates:**

| Control | Plain English | Real-World Example | Evidence Required |
|---------|---------------|-------------------|-------------------|
| **CC6.6** | **INFRASTRUCTURE ACCESS CONTROLS**<br>Physical/logical security for systems? | AWS resources have security groups. Data center has badge access. No public S3 buckets. | Security group configs, AWS access logs, physical security policy |
| **CC6.7** | **INFRASTRUCTURE & SOFTWARE SECURITY**<br>Systems properly hardened? | EC2 instances use hardened AMIs. No unnecessary services running. Firewalls configured. | Hardening standards, vulnerability scans, configuration baselines |
| **CC7.1** | **DETECTION OF SECURITY EVENTS**<br>Intrusion detection running? | AWS GuardDuty alerts on suspicious activity. IDS monitors network traffic. Anomaly detection active. | GuardDuty findings, IDS alerts, detection policy documentation |
| **CC7.2** | **SYSTEM MONITORING (INFRASTRUCTURE)**<br>Infrastructure continuously monitored? | CloudWatch monitors all AWS resources. Logs go to SIEM. Alerts configured for anomalies. | CloudWatch dashboards, log aggregation proof, alerting rules |
| **CC7.3** | **REMEDIATION OF SECURITY ISSUES**<br>Security issues get fixed promptly? | Critical vulnerabilities patched within 7 days. Auto-remediation enabled. Fix tracking documented. | Remediation tickets, patch logs, SLA compliance reports |
| **CC7.5** | **VULNERABILITY MANAGEMENT**<br>Regular vulnerability scanning? Fix process? | AWS Inspector scans weekly. Trivy scans containers. High severity fixed within 15 days. | Scan reports, remediation tickets, vulnerability tracking dashboard |
| **A1.1** | **AVAILABILITY COMMITMENTS**<br>What uptime do you promise? | SLA states 99.9% uptime. Auto-scaling configured. Multi-AZ deployment. Disaster recovery plan. | SLA document, architecture diagrams, failover test results |
| **A1.2** | **SYSTEM AVAILABILITY MONITORING**<br>Track if systems are up? | Uptime monitoring active. Incident response when down. Availability metrics tracked. | Uptime reports, incident logs, availability dashboard |
| **C1.1** | **CONFIDENTIALITY AGREEMENTS**<br>NDAs with people who see sensitive data? | Employees sign NDAs. Contractors sign NDAs. Confidentiality clause in contracts. | Signed NDA documents, employee onboarding records |
| **PI1.1** | **PROCESSING INTEGRITY OBJECTIVES**<br>Systems process data correctly/completely? | Data validation rules configured. Error handling implemented. Quality checks automated. | Data validation rules, error logs, quality metrics |
| **PI1.2** | **COMMUNICATION OF OBJECTIVES**<br>Tell users how systems work? | Documentation explains data processing. Users understand system behavior. Transparency in operations. | User documentation, process diagrams, operational runbooks |

**Auditor's Question for This Agent:**
> "How do you ensure your infrastructure is secure, monitored, and available?"

**Our Answer:**
> "Agent 5 orchestrates AWS Security Hub, Config, Prowler, and Checkov for continuous CSPM (CC6.6 infrastructure access), validates CIS Benchmark compliance at 87% (CC6.7 hardening), monitors 1,022+ cloud resources 24/7 across AWS/Azure/GCP (CC7.2), continuously validates encryption (100% production coverage), tracks infrastructure vulnerability remediation with 15-day SLAs (CC7.5), and maintains 99.9% availability commitments (A1.1-A1.2). All findings interpreted by Claude AI to reduce false positives by 65%."

---

**Primary Functions:**

### 1. **Cloud Security Tool Orchestration**
   - **CONFIGURE** AWS Security Hub, Config, and Inspector with compliance rules
   - **SCHEDULE** scans (continuous monitoring via Config, daily Prowler runs)
   - **INTEGRATE** multi-cloud tools (AWS, Azure, GCP unified view)
   - **NORMALIZE** findings from multiple tools into unified schema
   - **DEDUPLICATE** across tools (Security Hub + Prowler may find same issue)

### 2. **AI-Powered Misconfiguration Interpretation**
   - **ANALYZE** scan results using Claude Sonnet 4.5 for deep understanding
   - **CLASSIFY** true misconfigurations vs acceptable deviations (reduce false positives)
   - **ASSESS** exploitability in context of customer's actual architecture
   - **EXPLAIN** findings in business-friendly language (not just CIS control numbers)
   - **RECOMMEND** specific remediation steps (not generic "fix security group")

### 3. **CIS Benchmark Compliance Mapping**
   - **MAP** each finding to CIS Benchmark controls (AWS Foundations, Kubernetes CIS)
   - **SCORE** overall CIS compliance posture (Level 1 vs Level 2)
   - **TRACK** progress on CIS benchmark remediation over time
   - **MAP** CIS controls to SOC 2 requirements (CIS 1.1 → CC6.1)

### 4. **IaC Security Validation (Shift-Left)**
   - **SCAN** Terraform/CloudFormation before deployment (pre-production)
   - **PREVENT** insecure configurations from reaching production
   - **VALIDATE** against CIS benchmarks in CI/CD pipeline
   - **DETECT** configuration drift (IaC definition vs actual cloud state)

### 5. **Encryption Verification**
   - Verify all data stores have encryption at rest
   - Validate encryption in transit (TLS 1.2+)
   - Check KMS key rotation
   - Ensure proper key management

### 6. **Network Security Assessment & Segmentation**
   - Review security group rules
   - Check for overly permissive access (0.0.0.0/0)
   - Validate VPC isolation
   - Ensure network segmentation
   - **VERIFY** production is isolated from development/staging
   - **VALIDATE** security group rules follow least-privilege principle
   - **CHECK** database accessibility (should NOT be public)
   - **MONITOR** VPC flow logs for unauthorized traffic patterns

### 7. **Logging & Monitoring**
   - Verify CloudTrail enabled
   - Check log retention policies
   - Validate alerting configured
   - Ensure SIEM integration

### 8. **Certificate Management**
   - Monitor SSL/TLS certificate expiration
   - Validate certificate strength
   - Check certificate chain
   - Ensure auto-renewal configured

### 9. **SOC 2 Evidence Generation**
   - **GENERATE** compliance evidence from CSPM scan results
   - **DOCUMENT** security configurations for audit (encryption, network isolation)
   - **TRACK** remediation lifecycle (detection → fix → verification)
   - **REPORT** on infrastructure security posture for auditors

## **Decision-Making: Encryption Assessment**

**Scenario: Evaluating encryption at rest compliance**

```
Task: Verify CC7.2 (Data encrypted at rest) for all data stores

Infrastructure Security Agent Methodology:

Phase 1: Inventory Discovery
├─ Query Discovery Agent results
├─ Identify all data stores:
│   ├─ RDS databases: 5 instances
│   ├─ S3 buckets: 47 buckets
│   ├─ EBS volumes: 23 volumes
│   ├─ DynamoDB tables: 8 tables
│   └─ ElastiCache: 2 Redis clusters
│
└─ Total data stores to check: 85

Phase 2: Encryption Status Verification

RDS Databases (5 instances):
├─ Query AWS API: describe_db_instances()
├─ Check encryption_at_rest field
├─ Results:
│   ├─ prod-mysql-main: ENCRYPTED (kms:alias/prod-db) ✅
│   ├─ prod-postgres-analytics: ENCRYPTED (kms:alias/prod-db) ✅
│   ├─ staging-mysql: ENCRYPTED (aws/rds default key) ⚠️
│   ├─ dev-postgres: NOT ENCRYPTED ❌
│   └─ prod-mysql-replica: ENCRYPTED (inherits from primary) ✅
│
└─ Analysis:
    ├─ 4/5 encrypted ✅
    ├─ 1/5 not encrypted (dev environment) ⚠️
    └─ 1/5 using default AWS key (staging) ⚠️

S3 Buckets (47 buckets):
├─ Query AWS API: get_bucket_encryption()
├─ Categorize by environment:
│
├─ Production buckets (12):
│   ├─ customer-data-prod: SSE-KMS (customer managed) ✅
│   ├─ app-assets-prod: SSE-S3 (AWS managed) ⚠️
│   ├─ backups-prod: SSE-KMS (customer managed) ✅
│   └─ ... (9 more, all encrypted)
│   └─ Production encryption: 12/12 ✅
│
├─ Staging buckets (15):
│   ├─ customer-data-staging: NOT ENCRYPTED ❌
│   ├─ app-assets-staging: SSE-S3 ✅
│   └─ ... (13 more, mix of encrypted/not)
│   └─ Staging encryption: 12/15 (80%)
│
└─ Development buckets (20):
    ├─ Most NOT ENCRYPTED ❌
    └─ Dev encryption: 2/20 (10%)

Phase 3: Risk Assessment

Agent Reasoning:

"Need to assess whether encryption gaps are compliance failures
 or acceptable risk based on data sensitivity."

For each unencrypted resource, evaluate:

dev-postgres database:
├─ Environment: Development
├─ Data classification: Test data
├─ Contains real customer data? CHECK
│   ├─ Query database metadata
│   ├─ Check for PII columns (email, name, SSN, etc.)
│   └─ Result: Contains ANONYMIZED production data
│
├─ Risk assessment:
│   ├─ Data sensitivity: LOW (anonymized)
│   ├─ Regulatory requirement: PCI DSS requires ALL environments
│   ├─ Best practice: Encrypt all environments
│   └─ Audit finding likelihood: 40% (depends on auditor)
│
└─ Verdict: NON-COMPLIANT (should be encrypted)
    Severity: MEDIUM
    Recommendation: Enable encryption on next maintenance window

customer-data-staging S3 bucket:
├─ Environment: Staging
├─ Data classification: PRODUCTION-LIKE (real data structure)
├─ Contains real customer data? YES ⚠️
│
├─ Agent checks contents:
│   ├─ Sample 10 random files
│   ├─ Scan for PII patterns
│   └─ Result: CONTAINS REAL CUSTOMER EMAILS
│
├─ Risk assessment:
│   ├─ Data sensitivity: HIGH (real PII)
│   ├─ Compliance requirement: MUST be encrypted
│   ├─ Audit finding likelihood: 95%
│   └─ Severity: CRITICAL
│
└─ Verdict: CRITICAL GAP
    Immediate Action: Encrypt bucket TODAY
    Escalation: Alert compliance team immediately

Phase 4: Encryption Strength Validation

For encrypted resources, check encryption strength:

app-assets-prod (SSE-S3):
├─ Encryption type: AWS-managed keys
├─ Is this sufficient?
│   ├─ Data type: Static assets (images, CSS, JS)
│   ├─ Sensitivity: PUBLIC (served to website visitors)
│   ├─ Control requirement: "Encrypted at rest"
│   ├─ SSE-S3 meets requirement? YES
│   └─ Customer-managed key needed? NO (public data)
│
└─ Verdict: COMPLIANT ✅
    Note: "SSE-S3 sufficient for public assets"

customer-data-prod (SSE-KMS with customer key):
├─ Encryption type: Customer-managed KMS key
├─ Key rotation enabled? CHECK
│   └─ Result: ENABLED (annual rotation) ✅
│
├─ Key policy: CHECK
│   ├─ Who can use key: Only production services ✅
│   ├─ Who can manage key: Security team only ✅
│   └─ Cross-account access: DENIED ✅
│
└─ Verdict: BEST PRACTICE ✅
    Note: "Proper key management for sensitive data"

Phase 5: Remediation Planning

Gaps identified:
1. CRITICAL: staging bucket with real PII unencrypted
2. HIGH: Staging env using default AWS keys
3. MEDIUM: Dev database unencrypted
4. LOW: Dev buckets unencrypted (test data only)

Remediation strategy:

Priority 1 (TODAY):
└─ Enable SSE-KMS on customer-data-staging
    ├─ Auto-remediation: YES (agent can do this)
    ├─ Risk of auto-fix: LOW (no data loss)
    └─ Agent action: Create approval request
        "Enable encryption on staging bucket - requires brief downtime"

Priority 2 (THIS WEEK):
└─ Migrate staging RDS to customer-managed keys
    ├─ Auto-remediation: NO (requires snapshot + restore)
    ├─ Manual process needed
    └─ Agent action: Create ticket with instructions

Priority 3 (THIS MONTH):
└─ Enable encryption on dev database
    ├─ Auto-remediation: YES
    └─ Agent action: Schedule during maintenance window

Priority 4 (BACKLOG):
└─ Encrypt dev buckets (nice-to-have)
    └─ Agent action: Document as recommendation

Phase 6: Evidence Collection

Evidence package:
├─ API responses showing encryption status for all 85 resources
├─ Screenshots of AWS Console encryption settings
├─ KMS key rotation status
├─ Before/after for remediated resources
└─ Compliance summary: "83/85 resources encrypted (97.6%)"

Final Assessment:
Control CC7.2 Status: SUBSTANTIALLY COMPLIANT with remediation needed
├─ Critical gap: 1 (requires immediate fix)
├─ High gaps: 1 (requires fix this week)
├─ Medium gaps: 1 (requires fix this month)
└─ Overall: Will be 100% compliant after remediation
```

## **Reasoning: Network Security Evaluation**

**Scenario: Assessing security group rules**

```
Question: Is this security group configuration acceptable?

Security Group: "prod-web-app-sg"
Inbound Rules:
1. Allow TCP 443 from 0.0.0.0/0 (anywhere)
2. Allow TCP 80 from 0.0.0.0/0 (anywhere)
3. Allow TCP 22 from 10.0.0.0/16 (VPC only)
4. Allow TCP 3306 from sg-prod-app (app tier)

Agent Analysis:

Rule 1: HTTPS from anywhere
├─ Port: 443 (HTTPS)
├─ Source: 0.0.0.0/0 (world)
├─ Resource: Web application
├─ Acceptable? YES ✅
└─ Reasoning: "Web apps need public HTTPS access. This is normal."

Rule 2: HTTP from anywhere
├─ Port: 80 (HTTP - unencrypted)
├─ Source: 0.0.0.0/0 (world)
├─ Concern: Unencrypted traffic
├─ Check: Is there HTTP → HTTPS redirect?
│   ├─ Query load balancer rules
│   └─ Result: YES, redirects to HTTPS ✅
├─ Acceptable? YES ✅
└─ Reasoning: "Port 80 open for redirect is standard practice."

Rule 3: SSH from VPC
├─ Port: 22 (SSH)
├─ Source: 10.0.0.0/16 (internal VPC)
├─ Concern: Is SSH even needed?
├─ Best practice: Use Systems Manager Session Manager (no SSH port)
├─ Acceptable? CONDITIONAL ⚠️
└─ Reasoning:
    "SSH access should ideally use Session Manager.
     If SSH required, limiting to VPC is acceptable.
     Check: Are there bastion hosts enforcing MFA?"

Rule 4: MySQL from app tier
├─ Port: 3306 (MySQL)
├─ Source: sg-prod-app (specific security group)
├─ Acceptable? YES ✅
└─ Reasoning: "Database should only allow app tier. This follows least privilege."

Missing Rules Analysis:

Expected rule NOT present:
├─ No outbound restrictions
├─ Default: All outbound allowed
├─ Best practice: Restrict outbound to specific destinations
├─ Severity: LOW
└─ Recommendation: "Add explicit outbound rules for defense in depth"

Overall Verdict: ACCEPTABLE with recommendations
Confidence: 90%
Recommendations:
1. Migrate SSH to Systems Manager (eliminates Rule 3)
2. Add explicit outbound rules
3. Document why each rule exists
```

---

## **Orchestration Workflow: CSPM Tool Integration**

**Agent does NOT build cloud scanners or CSPM engines. Agent ORCHESTRATES existing proven tools.**

### **Phase 1: Multi-Tool Configuration**

```python
# Agent configures AWS Security Hub + Config + Prowler for comprehensive coverage
# Configuration generated automatically based on discovered cloud resources

class InfrastructureSecurityAgent:
    def configure_aws_security_tools(self, aws_account_id: str):
        """
        Configure AWS-native security tools.
        We do NOT re-implement AWS Config - we CONFIGURE it for SOC 2.
        """
        # Step 1: Enable AWS Config (if not already enabled)
        config_client = boto3.client('config')
        config_client.put_configuration_recorder(
            ConfigurationRecorder={
                'name': 'soc2-compliance-recorder',
                'roleARN': 'arn:aws:iam::account:role/ConfigRole',
                'recordingGroup': {
                    'allSupported': True,  # Record ALL resource types
                    'includeGlobalResources': True
                }
            }
        )

        # Step 2: Configure AWS Config Rules for SOC 2 controls
        soc2_config_rules = [
            {
                'ConfigRuleName': 'soc2-cc6.6-mfa-enabled',
                'Source': {
                    'Owner': 'AWS',
                    'SourceIdentifier': 'IAM_USER_MFA_ENABLED'
                },
                'Description': 'SOC 2 CC6.6: Ensure MFA enabled for all IAM users',
                'Scope': {'ComplianceResourceTypes': ['AWS::IAM::User']}
            },
            {
                'ConfigRuleName': 'soc2-cc7.2-s3-bucket-public-read-prohibited',
                'Source': {
                    'Owner': 'AWS',
                    'SourceIdentifier': 'S3_BUCKET_PUBLIC_READ_PROHIBITED'
                },
                'Description': 'SOC 2 CC7.2: S3 buckets should not allow public read',
                'Scope': {'ComplianceResourceTypes': ['AWS::S3::Bucket']}
            },
            {
                'ConfigRuleName': 'soc2-cc7.2-rds-encryption-at-rest',
                'Source': {
                    'Owner': 'AWS',
                    'SourceIdentifier': 'RDS_STORAGE_ENCRYPTED'
                },
                'Description': 'SOC 2 CC7.2: RDS instances must have encryption at rest',
                'Scope': {'ComplianceResourceTypes': ['AWS::RDS::DBInstance']}
            },
            # ... 50+ more Config rules mapped to SOC 2 controls
        ]

        for rule in soc2_config_rules:
            config_client.put_config_rule(ConfigRule=rule)

        # Step 3: Enable AWS Security Hub (centralized findings)
        securityhub_client = boto3.client('securityhub')
        securityhub_client.enable_security_hub(
            EnableDefaultStandards=True  # CIS AWS Foundations, AWS Best Practices
        )

        # Step 4: Subscribe to security standards
        securityhub_client.batch_enable_standards(
            StandardsSubscriptionRequests=[
                {'StandardsArn': 'arn:aws:securityhub:::ruleset/cis-aws-foundations-benchmark/v/1.4.0'},
                {'StandardsArn': 'arn:aws:securityhub:::standards/aws-foundational-security-best-practices/v/1.0.0'}
            ]
        )

    def configure_prowler_scans(self):
        """
        Configure Prowler (open-source CSPM) for CIS Benchmark assessment.
        We call Prowler - we do NOT re-implement CIS benchmark checks.
        """
        prowler_config = {
            'checks': [
                'check11',  # CIS 1.1: Avoid root account usage
                'check12',  # CIS 1.2: MFA enabled for root
                'check13',  # CIS 1.3: Credentials unused for 90 days
                'check21',  # CIS 2.1: CloudTrail enabled in all regions
                'check22',  # CIS 2.2: CloudTrail log file validation
                'check31',  # CIS 3.1: VPC flow logging enabled
                # ... 100+ CIS checks
            ],
            'output_formats': ['json', 'html', 'csv'],
            'compliance_frameworks': ['cis_1.4_aws', 'soc2'],
            'severity_threshold': 'medium'
        }

        # Schedule Prowler scans (daily at 2 AM)
        return self.schedule_scan(
            tool='prowler',
            schedule='cron(0 2 * * ? *)',  # Daily at 2 AM UTC
            config=prowler_config
        )
```

### **Phase 2: AI Interpretation (Our Value-Add)**

```python
def interpret_misconfiguration_with_ai(self, finding: Finding) -> Interpretation:
    """
    Use Claude Sonnet 4.5 to interpret cloud misconfiguration.
    This is our differentiation - NOT the scanning itself.

    AI helps:
    1. Determine if finding is TRUE misconfiguration or acceptable deviation
    2. Assess exploitability in customer's specific architecture
    3. Map to SOC 2 controls with explanation
    4. Provide context-aware remediation guidance
    """
    prompt = f"""
    You are a cloud security expert analyzing a potential misconfiguration.

    Finding from {finding.tool}:
    - Resource: {finding.resource_type} ({finding.resource_id})
    - Issue: {finding.description}
    - Severity: {finding.severity}
    - CIS Control: {finding.cis_control if hasattr(finding, 'cis_control') else 'N/A'}

    Customer context:
    - Cloud provider: {finding.cloud_provider}
    - Environment: {finding.environment}  # Production, Staging, Dev
    - Architecture: {finding.architecture_context}
    - Compliance requirements: SOC 2 Type II

    Analysis tasks:
    1. Is this a TRUE MISCONFIGURATION or ACCEPTABLE DEVIATION?
       - Consider business context (dev/staging might have different rules)
       - Check if there are compensating controls
       - Understand if this is intentional for specific use case

    2. Is this EXPLOITABLE in customer's architecture?
       - Can attacker actually reach this resource?
       - Are there network-level protections (WAF, VPC isolation)?
       - What's the blast radius if exploited?

    3. Map to SOC 2 controls:
       - Which control(s) does this impact? (CC6.6, CC6.7, CC7.2, etc.)
       - Would auditor flag this as control failure?
       - What evidence is needed to demonstrate control?

    4. Provide ACTIONABLE remediation:
       - Not just "fix security group"
       - Specific AWS console steps OR Terraform code changes
       - Consider business impact of remediation

    5. Risk scoring:
       - Severity (1-10)
       - Exploitability (1-10)
       - Business impact (1-10)
       - Urgency (immediate, 24h, 7d, 30d)

    6. Handle false positives:
       - AWS Config sometimes flags resources during creation (transient state)
       - CIS Level 2 controls may be too strict for some businesses
       - Identify if this is noise vs signal
    """

    interpretation = claude_sonnet_4_5.generate(prompt)

    # Extract structured analysis from AI response
    return Interpretation(
        is_true_misconfiguration=interpretation.is_true_misconfiguration,
        exploitability_analysis=interpretation.exploitability,
        soc2_controls_impacted=interpretation.controls,
        cis_benchmark_mapping=interpretation.cis_mapping,
        remediation_guidance=interpretation.remediation,
        risk_score=interpretation.risk_score,
        urgency=interpretation.urgency,
        confidence=interpretation.confidence,
        reasoning=interpretation.reasoning  # Show user WHY
    )
```

### **Phase 3: CIS Benchmark Mapping**

```python
def map_cis_to_soc2(self, cis_control: str) -> List[str]:
    """
    Map CIS Benchmark controls to SOC 2 Trust Service Criteria.
    This is critical for audit evidence.
    """
    cis_to_soc2_mapping = {
        'CIS 1.1': ['CC6.1'],  # Root account usage → Access control
        'CIS 1.2': ['CC6.2'],  # MFA for root → Multi-factor authentication
        'CIS 2.1': ['CC7.2'],  # CloudTrail logging → System monitoring
        'CIS 2.2': ['CC7.2'],  # CloudTrail log validation → Log integrity
        'CIS 2.3': ['CC7.2', 'CC6.1'],  # S3 bucket for CloudTrail → Secure logging
        'CIS 2.7': ['CC7.2'],  # CloudTrail encryption → Data protection
        'CIS 3.1': ['CC6.6'],  # Unauthorized API calls alarm → Security monitoring
        'CIS 4.1': ['CC6.7'],  # No security groups allow 0.0.0.0/0 → Network access
        'CIS 4.2': ['CC6.7'],  # No security groups allow ::/0 → Network access (IPv6)
        # ... 118 CIS controls mapped to SOC 2
    }

    return cis_to_soc2_mapping.get(cis_control, [])
```

---

## **Decision-Making: Cloud Misconfiguration Assessment**

**Scenario: Daily cloud security posture scan finding critical issues**

```
Task: Scan AWS production environment for security misconfigurations

Infrastructure Security Agent Process:

Phase 1: Resource Discovery
├─ AWS Account: 123456789012
├─ Resources discovered: 1,022 (EC2, S3, RDS, Lambda, etc.)
└─ Total resources to scan

Phase 2: Security Group Analysis

Critical Finding 1: Overly permissive security group
├─ Resource: sg-0a1b2c3d4e5f (web-server-sg)
├─ Rule: Allow ALL traffic from 0.0.0.0/0 (entire internet)
├─ Agent risk assessment: CRITICAL ⚠️
├─ Business impact: 12 production web servers fully exposed
├─ Recommendation: URGENT fix within 24 hours
└─ Auto-generated structured alert with remediation options

Phase 3: S3 Bucket Exposure Scan

Critical Finding 2: Publicly accessible S3 bucket
├─ Bucket: company-backups-prod (4,782 files, 2.3 TB)
├─ Public policy: Allow s3:GetObject to * (anonymous)
├─ Content sampling: Contains database dumps with customer PII
├─ Exposure verification: Confirmed ANYONE can download
├─ CloudTrail analysis: 47 external IPs accessed bucket
└─ Verdict: EMERGENCY - potential data breach

Agent immediate actions:
├─ ALERT Security Team (PagerDuty: CRITICAL)
├─ ALERT Incident Response Agent
├─ RECOMMEND: Block public access immediately
└─ ESCALATE: Forensics investigation

Phase 4: CIS Benchmark Assessment
Running CIS AWS Foundations Benchmark v1.5.0:
├─ Total checks: 52
├─ Passed: 39 (75%)
├─ Failed: 13 (25%)
├─ Critical failures:
│   ├─ Root account MFA disabled
│   ├─ 8 security groups allow SSH from anywhere
│   └─ 42 S3 buckets unencrypted

Agent creates prioritized remediation queue based on risk scoring.
```

## **Reasoning: IaC Security Validation**

**Question: Should we scan IaC before or after deployment?**

```
Infrastructure Security Agent's IaC strategy: BOTH (Defense in Depth)

Pre-Deployment Scanning (Shift Left):
├─ When: During development, PR review, CI/CD pipeline
├─ Tools: Checkov, tfsec, Terrascan
├─ What it catches: Security misconfigurations BEFORE production
├─ Benefits: Zero cost to fix (not deployed yet), prevents issues
└─ Limitations: Doesn't catch manual console changes or drift

Post-Deployment Scanning (Runtime Validation):
├─ When: Daily/weekly scans of live infrastructure
├─ Tools: Prowler, ScoutSuite, AWS Config
├─ What it catches: Configuration drift, manual changes, compromised resources
├─ Benefits: Detects ALL resources, real attack surface
└─ Limitations: Issues already in production

Integrated Approach Example:
Development → Pre-commit Checkov → PR GitHub Actions scan →
Terraform apply → Daily Prowler runtime scan → Drift detection → Alert

"We scan IaC in PR (prevent issues from merging).
 We scan infrastructure daily (catch manual changes).
 Together: Comprehensive coverage."
```

## **Edge Cases**

**Edge Case 1: Encryption Performance Trade-offs**

```
Scenario: ElastiCache Redis cluster not encrypted (performance concern)

Customer argues: "Encryption adds latency, Redis is in-memory cache,
                 no sensitive data stored"

Agent Response:

Step 1: Verify data classification
├─ What data is cached?
│   ├─ Query application code
│   ├─ Check cache key patterns
│   └─ Result: "Session tokens, API responses, user preferences"
│
└─ Contains PII?
    ├─ Session tokens: YES (linked to user identity)
    ├─ User preferences: YES (personal data)
    └─ Verdict: SENSITIVE DATA present

Step 2: Assess encryption impact
├─ ElastiCache encryption overhead: ~5-10% performance
├─ Business impact of 10% slower cache?
│   └─ Likely: NEGLIGIBLE (cache still faster than DB)
└─ Compliance requirement: Encrypted required for PII

Step 3: Decision
├─ Performance argument: INVALID (minimal impact)
├─ Compliance requirement: CLEAR (must encrypt PII)
├─ Verdict: MUST ENABLE ENCRYPTION
└─ Confidence: 100%

Recommendation to user:
"Session tokens are PII. CC7.2 requires encryption.
 Performance impact is <10%, within acceptable range.
 Enable encryption at rest + in transit."
```

**Edge Case 2: Multi-Region Encryption Keys**

```
Scenario: S3 bucket replicated across regions, KMS key management complex

Current state:
├─ Primary bucket: us-east-1 (encrypted with us-east-1 KMS key)
├─ Replica bucket: eu-west-1 (encrypted with eu-west-1 KMS key)
└─ Challenge: Managing 2 separate keys, rotation, access policies

Agent Analysis:

Option A: Use S3 bucket keys (simplified)
├─ AWS feature: S3 generates bucket-specific keys from KMS
├─ Benefit: Reduces KMS API calls, simpler
├─ Acceptable? YES ✅
└─ Reasoning: "S3 bucket keys meet CC7.2, simplify operations"

Option B: Use multi-region KMS keys
├─ AWS feature: Same key ID across regions
├─ Benefit: Unified key management
├─ Acceptable? YES ✅
└─ Reasoning: "Multi-region keys meet requirements, easier management"

Recommendation:
"For replicated buckets, use multi-region KMS keys or S3 bucket keys.
 Both are compliant. Multi-region keys are simpler for cross-region access."

Confidence: 95%
```

## **Success Metrics**

**Infrastructure Security & CSPM Orchestration Agent Performance:**

### **CSPM & Cloud Security Posture**
- Cloud resources scanned: 100% of AWS/GCP/Azure resources (daily)
- CIS Benchmark compliance: Target 90%+ (actual: 87%)
- Critical findings detection rate: Target 100% (actual: 100%)
- False positive rate (AI-reduced): Target <10% (actual: 8%)
- Mean time to detect (MTTD):
  - Misconfiguration introduced: Target <24 hours (actual: 4 hours)
  - Drift detection: Target <24 hours (actual: 12 hours)
- Mean time to remediate (MTTR):
  - CRITICAL: Target <48 hours (actual: 16 hours)
  - HIGH: Target <7 days (actual: 4.2 days)
  - MEDIUM: Target <30 days (actual: 14.3 days)
- IaC scan coverage: Target 100% of Terraform/CloudFormation (actual: 100%)
- Container vulnerability detection: Target 100% (actual: 100%)
- Multi-cloud coverage: Target all 3 clouds (actual: AWS, GCP, Azure ✅)

### **Infrastructure Hardening**
- Encryption coverage: Target 100% production (actual: 100%)
- Security misconfiguration detection: Target >99% (actual: 99.6%)
- Remediation success rate: Target >95% (actual: 98.1%)
- Network segmentation validation: Monthly (100% compliance)
- Certificate expiration monitoring: 30-day advance warning (0 expired certs)
