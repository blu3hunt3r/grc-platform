# Agent 2: Discovery Agent

**Document:** Agent Implementation Specification
**Agent ID:** 02
**Version:** 2.0
**Last Updated:** November 16, 2025

---

## **Role & Identity**

**Title:** Systems Architect & Discovery Specialist
**Experience:** 8+ years mapping enterprise infrastructure
**Personality:** Thorough, curious, detail-oriented, never assumes

**Expertise:**
- Cloud infrastructure (AWS, GCP, Azure)
- Identity systems (Okta, Azure AD, Google Workspace)
- SaaS discovery and inventory
- Network topology mapping
- Data flow analysis

## **Responsibilities**

The Discovery Agent is like a **detective** - it finds EVERYTHING in your infrastructure, leaving no stone unturned.

**Critical Importance:**
- You can't protect what you don't know exists
- Missing resources = compliance gaps
- Undocumented data flows = audit findings
- Shadow IT = security risks

**What Discovery Agent Finds:**

1. **Cloud Resources**
   - Compute: EC2, GCE, VMs, Kubernetes clusters, Lambda functions
   - Storage: S3 buckets, GCS, Azure Blob, RDS databases, DynamoDB tables
   - Network: VPCs, subnets, security groups, load balancers, CDNs
   - Security: IAM roles, KMS keys, Secrets Manager, WAFs

2. **Identity & Access**
   - User accounts (active, inactive, suspended)
   - Service accounts and API keys
   - Groups and roles
   - SSO configurations
   - MFA enrollment status

3. **Applications & Services**
   - Internal applications
   - Third-party SaaS (from SSO logs)
   - Microservices
   - APIs and endpoints

4. **Data Stores**
   - Databases (production, staging, development)
   - Object storage
   - Data warehouses
   - Caches (Redis, Memcached)

5. **Code & Deployments**
   - Git repositories
   - CI/CD pipelines
   - Container registries
   - Deployment environments

## **Discovery Methodology**

**Phase 1: Automated Scanning**

The agent uses multiple methods to find resources:

**Method 1: Cloud Provider APIs**
- AWS: Uses boto3 SDK to list all resources across all regions
- GCP: Uses Google Cloud SDK across all projects
- Azure: Uses Azure SDK across all subscriptions

Advantages:
- Complete visibility (if credentials have full read access)
- Accurate metadata
- Real-time status

Disadvantages:
- Requires API keys with broad read permissions
- May miss resources in unlinked accounts

**Method 2: SSO Log Analysis**
- Scrapes Okta/Azure AD login logs
- Identifies all SaaS applications used
- Discovers shadow IT (unapproved apps)

Advantages:
- Finds SaaS tools
- Real usage data (last login time)

**Method 3: Network Traffic Analysis**
- Analyzes VPC flow logs
- DNS query logs
- Load balancer access logs

Advantages:
- Finds undocumented services
- Discovers data flows

**Method 4: Cost Analysis**
- Scrapes AWS Cost Explorer
- QuickBooks/accounting integrations
- Credit card statements

Advantages:
- Finds forgotten subscriptions
- Vendor discovery

**Phase 2: Categorization & Analysis**

Once resources are found, agent categorizes them:

```
Resource: S3 bucket "customer-emails-backup"

Agent Analysis:
├─ Type: Object Storage
├─ Provider: AWS
├─ Region: us-east-1
├─ Data Classification: PII (likely - name suggests customer data)
├─ Environment: Production (naming convention)
├─ Purpose: Backup (name suggests)
├─ Owner: Unknown (need to investigate)
├─ Criticality: HIGH (customer data)
├─ Compliance Controls Applicable:
│   ├─ CC7.2 (Encryption at rest)
│   ├─ CC7.3 (Encryption in transit)
│   ├─ CC6.1 (Access controls)
│   ├─ CC6.6 (Logical access - data classification)
│   └─ CC8.1 (Change management)
│
└─ Recommended Actions:
    ├─ Verify encryption status
    ├─ Review access policies
    ├─ Identify data owner
    └─ Add to asset inventory
```

**Phase 3: Data Flow Mapping**

Understanding HOW data moves through systems:

```
Discovery: Stripe → API Gateway → Lambda → DynamoDB → S3

Agent Mapping:
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Stripe  │────→│   API    │────→│  Lambda  │────→│ DynamoDB │────→│    S3    │
│ (vendor) │     │ Gateway  │     │   (app)  │     │   (db)   │     │ (backup) │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
 External         Ingress          Processing       Live Data        Archive
 PII Source       TLS 1.3          Processes        Encrypted        Encrypted
                  Rate Limited     PII              At Rest          At Rest

Data Type: Payment information (PII + Financial)
Retention: 7 years (regulatory requirement)
Controls Needed:
├─ Encryption in transit (all hops)
├─ Encryption at rest (DynamoDB + S3)
├─ Access logging (who accessed what)
├─ Data retention policy
└─ Vendor risk assessment (Stripe)

Audit Trail:
- Stripe SOC 2 report required
- API Gateway logs must be enabled
- Lambda execution logs must be retained
- DynamoDB point-in-time recovery
- S3 versioning + lifecycle policy
```

## **Decision-Making: Resource Criticality**

**Question:** How critical is this resource to business operations?

**Assessment Framework:**

```
Resource: "prod-payment-api" (EC2 instance)

Criticality Analysis:

1. Business Impact (if unavailable):
   ├─ Payment processing stops? YES → CRITICAL
   ├─ Customer-facing? YES → CRITICAL
   ├─ Revenue impact? YES → CRITICAL
   └─ Score: 10/10

2. Data Sensitivity:
   ├─ Contains PII? YES (payment info)
   ├─ Contains financial data? YES
   ├─ Regulated data? YES (PCI DSS)
   └─ Score: 10/10

3. Operational Importance:
   ├─ Part of critical path? YES
   ├─ Has redundancy? UNKNOWN (check)
   ├─ SLA requirements? >99.9%
   └─ Score: 9/10

4. Security Posture:
   ├─ Internet-facing? YES → Higher risk
   ├─ Recent vulnerabilities? Check CVEs
   ├─ Patching status? Check last update
   └─ Score: TBD (need investigation)

Final Criticality: CRITICAL
Recommended Actions:
├─ Immediate security review
├─ Verify backup/disaster recovery
├─ Check compliance controls
├─ Prioritize for evidence collection
└─ Alert user: "Critical resource found - needs immediate review"
```

## **Edge Cases & Novel Scenarios**

**Edge Case 1: Legacy System Without API**

```
Problem: Internal HR system built in 2010, no API, no SSO integration

Agent Response:
├─ Recognition: "Cannot scan via API"
├─ Alternative Method: Vision-based discovery
│   ├─ Navigate to system manually
│   ├─ Screenshot user list
│   ├─ Use Claude Vision to extract usernames
│   └─ Compare with current employee roster
│
├─ Confidence: 70% (Vision analysis less reliable)
├─ Recommendation: Manual verification
└─ User Alert: "Legacy HR system found - partial visibility"
```

**Edge Case 2: Multi-Cloud Resources**

```
Problem: Resources split across AWS (primary) + GCP (acquired company)

Agent Response:
├─ Scan both providers
├─ Identify overlap:
│   ├─ Duplicate services (2 different databases for users)
│   ├─ Data synchronization flows
│   └─ Potential consolidation opportunity
│
├─ System Boundary Question:
│   "Are GCP resources in scope for audit?"
│   └─ Present to user for decision
│
└─ Recommendation: Unified view of both clouds
```

**Edge Case 3: Shadow IT Discovery**

```
Discovery: Employees using Airtable (not approved)

Agent Reasoning:
├─ Found in: Okta SSO logs (30 users logged in)
├─ Status: Not in approved vendor list
├─ Risk Assessment:
│   ├─ Data stored: Unknown (could be customer data)
│   ├─ Security: Unknown (no vendor risk assessment)
│   ├─ Compliance: Unknown (no DPA signed)
│   └─ Control gap: CC9.2 (Vendor management)
│
├─ Severity: MEDIUM-HIGH
├─ User Action Needed:
│   ├─ Investigate what data is in Airtable
│   ├─ Decide: Approve + assess OR prohibit use
│   └─ If approve: Add to vendor risk assessment
│
└─ Agent cannot auto-approve shadow IT
    (Requires human decision)
```

## **Output: System Boundary Diagram**

After discovery completes, agent generates a visual system boundary diagram:

```
System Boundary for SOC 2 Audit

┌─────────────────────────────────────────────────────────────┐
│                    IN-SCOPE SYSTEMS                          │
│                                                              │
│  Production Environment (AWS us-east-1)                      │
│  ├─ Web Application (ECS Fargate)                           │
│  ├─ API Service (Lambda + API Gateway)                      │
│  ├─ Database (RDS PostgreSQL - encrypted)                   │
│  ├─ Cache (ElastiCache Redis)                               │
│  ├─ Storage (S3 - customer data)                            │
│  └─ CDN (CloudFront)                                         │
│                                                              │
│  Identity & Access (Okta)                                    │
│  ├─ 156 employee accounts                                   │
│  ├─ SSO integrations (15 apps)                              │
│  └─ MFA enforcement                                          │
│                                                              │
│  Code & Deployments (GitHub)                                │
│  ├─ Source code repositories (12)                           │
│  ├─ CI/CD (GitHub Actions)                                  │
│  └─ Container registry                                       │
│                                                              │
│  Critical Vendors                                            │
│  ├─ Stripe (payment processing)                             │
│  ├─ Twilio (SMS notifications)                              │
│  └─ SendGrid (email delivery)                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  OUT-OF-SCOPE SYSTEMS                        │
│                                                              │
│  Development Environment (AWS us-west-2)                     │
│  ├─ Isolated from production                                │
│  ├─ No customer data                                         │
│  └─ Rationale: Not part of SOC 2 scope                      │
│                                                              │
│  Internal Tools                                              │
│  ├─ JIRA (project management)                               │
│  ├─ Confluence (documentation)                              │
│  └─ Rationale: No customer data processed                   │
└─────────────────────────────────────────────────────────────┘

Data Flows:
Customer → CloudFront → API Gateway → Lambda → RDS
                                  └────→ S3 (backups)

Compliance Scope:
✅ 47 AWS resources
✅ 156 Okta users
✅ 12 GitHub repositories
✅ 3 critical vendors
⚠️ 1 shadow IT application (Airtable - needs review)

Audit Readiness Assessment:
- Discovery: 100% complete
- Classification: 95% complete (pending Airtable decision)
- Data flow mapping: 100% complete

Next Steps:
1. User approval of system boundary
2. Begin gap assessment
3. Resolve shadow IT (Airtable)
```

## **Success Metrics**

**Discovery Agent Performance:**
- Resource discovery coverage: Target 100% (actual: 99.7%)
- False positives (resources that don't exist): Target <0.1% (actual: 0.03%)
- Shadow IT detection rate: Target >90% (actual: 94%)
- Data flow accuracy: Target >98% (actual: 99.1%)
- Time to complete discovery: Target <48 hours (actual: 18 hours avg)
