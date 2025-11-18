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

## **DC-200 System Description Generation** {#dc-200-system-description}

**CRITICAL SOC 2 REQUIREMENT:**

Every SOC 2 report must include a **System Description** that meets the 10 Description Criteria (DC-200). This is not optional - auditors will fail the audit if the system description is incomplete or inaccurate.

**What is DC-200?**

DC-200 is the AICPA standard that defines the required contents of a SOC 2 system description. The system description is a narrative document (typically 20-40 pages) that explains:
- What the system does
- How it's built
- Who manages it
- What controls are in place
- What boundaries exist

**Why Agent 2 Generates the System Description:**

The Discovery Agent has unique visibility into the entire system through automated scanning. It knows:
- Every component (infrastructure, software, data)
- Every integration and data flow
- Every person and their role
- Every vendor and subservice organization

Rather than requiring users to manually document all of this, Agent 2 **auto-generates** a DC-200 compliant system description using discovery data.

---

### **DC-200 Component Breakdown**

Agent 2 generates all 10 required DC-200 components:

**DC-200.1: Types of Products and Services Provided** {#dc-200-1}

```
What this component requires:
A description of the products/services the company provides to customers.

Discovery Agent Process:

Step 1: Analyze Application Layer
├─ Scan: Web applications discovered
├─ Scan: API endpoints discovered
├─ Scan: Mobile app configurations
└─ Result: List of customer-facing services

Step 2: AI Interpretation
├─ LLM analysis: "What does this company do?"
├─ Evidence: Application names, API endpoints, marketing site
├─ Example analysis:
│   ├─ Domain: "acme-invoicing.com"
│   ├─ Services found: Invoice API, Payment processing, PDF generation
│   ├─ Customer data: Invoice records, payment history
│   └─ AI inference: "Cloud-based invoicing and payment SaaS platform"
│
└─ Output: Generated description

Agent-Generated DC-200.1 Section:

"Company Name: Acme Invoicing Inc.

 Products and Services:

 Acme Invoicing provides a cloud-based invoicing and payment
 processing platform designed for small and medium-sized businesses.

 Primary Services:
 ├─ Invoice Management: Create, send, and track invoices
 ├─ Payment Processing: Accept credit cards via Stripe integration
 ├─ Recurring Billing: Automated subscription invoice generation
 ├─ Reporting: Revenue analytics and financial reporting
 └─ API Access: RESTful API for custom integrations

 Delivery Model:
 - Software-as-a-Service (SaaS)
 - Multi-tenant cloud architecture
 - Accessible via web browser (HTTPS)
 - Mobile applications (iOS, Android)

 Customer Base:
 - 2,500 active customers (as of November 2025)
 - Primarily small businesses (1-50 employees)
 - Geographic distribution: North America (85%), Europe (12%), Other (3%)

 Service Commitments:
 - 99.9% uptime SLA
 - Data backup every 24 hours
 - Encryption at rest and in transit
 - SOC 2 Type II certification"

Evidence Sources:
├─ CloudFront distribution (web app)
├─ API Gateway endpoints (invoice API, payment API)
├─ Stripe integration (payment processing)
├─ GitHub repositories (invoice-service, payment-service)
├─ Marketing website content analysis
└─ Customer database count query
```

**DC-200.2: Principal Service Commitments and System Requirements** {#dc-200-2}

```
What this component requires:
The specific commitments made to customers (SLAs, security promises, availability).

Discovery Agent Process:

Step 1: Extract Service Commitments
├─ Source 1: Terms of Service (parsed from website)
├─ Source 2: Customer contracts (if accessible)
├─ Source 3: Marketing materials
└─ Source 4: Support documentation

Step 2: Identify Technical Requirements
├─ Uptime: Calculate from CloudWatch availability metrics
├─ Data retention: Extract from S3 lifecycle policies
├─ Security: Identify from implemented controls
└─ Compliance: Parse from compliance certifications

Agent-Generated DC-200.2 Section:

"Service Commitments:

 Availability:
 ├─ Commitment: 99.9% monthly uptime (measured as successful API responses)
 ├─ Actual performance: 99.97% average uptime (last 12 months)
 ├─ Monitoring: CloudWatch alarms, PagerDuty alerts
 └─ Downtime credits: Pro-rated refund if SLA not met

 Data Security:
 ├─ Encryption: AES-256 encryption at rest, TLS 1.3 in transit
 ├─ Access controls: Role-based access control (RBAC)
 ├─ Authentication: SSO with MFA required for all users
 └─ Data residency: US-only data centers (AWS us-east-1)

 Data Backup and Recovery:
 ├─ Backup frequency: Daily automated backups at 2 AM UTC
 ├─ Retention: 30-day backup retention
 ├─ Recovery time objective (RTO): 4 hours
 ├─ Recovery point objective (RPO): 24 hours
 └─ Testing: Quarterly disaster recovery tests

 Data Privacy:
 ├─ Data isolation: Multi-tenant with logical separation
 ├─ Data deletion: 30-day retention after account cancellation
 ├─ Data export: Customer self-service export to CSV/PDF
 └─ Compliance: GDPR data processing agreement available

 Support:
 ├─ Business hours: Email support (24-hour response time)
 ├─ Enterprise tier: Phone support (4-hour response time)
 └─ Status page: Real-time system status at status.acme.com"

Evidence Sources:
├─ Terms of Service document
├─ CloudWatch uptime metrics (365 days)
├─ S3 lifecycle policies (backup retention)
├─ KMS encryption configuration
├─ Disaster recovery test reports
└─ Support SLA documentation
```

**DC-200.3: Components of the System** {#dc-200-3}

```
What this component requires:
Description of the 5 system components:
1. Infrastructure (servers, networks, facilities)
2. Software (applications, databases, middleware)
3. People (roles, responsibilities, organizational structure)
4. Procedures (policies, standards, workflows)
5. Data (types, classification, flows)

Discovery Agent Process:

This is Agent 2's core strength - it already discovers all components.
Now it formats the discovery data into DC-200.3 compliant documentation.

Agent-Generated DC-200.3 Section:

"INFRASTRUCTURE COMPONENTS

 Cloud Infrastructure (Amazon Web Services - AWS):

 Production Environment (us-east-1):
 ├─ Compute:
 │   ├─ ECS Fargate: 12 containers (web application tier)
 │   ├─ Lambda: 8 functions (background processing)
 │   └─ Auto-scaling: 2-20 instances based on load
 │
 ├─ Databases:
 │   ├─ RDS PostgreSQL: Primary database (Multi-AZ, encrypted)
 │   ├─ ElastiCache Redis: Session cache (cluster mode)
 │   └─ DynamoDB: Payment transaction log (point-in-time recovery)
 │
 ├─ Storage:
 │   ├─ S3: Customer documents (versioning enabled, encryption at rest)
 │   ├─ S3: Backup storage (lifecycle policy: 30-day retention)
 │   └─ EBS: Database volumes (encrypted, daily snapshots)
 │
 ├─ Networking:
 │   ├─ VPC: Isolated network (10.0.0.0/16)
 │   ├─ Subnets: Public (web tier), Private (app tier), Isolated (database)
 │   ├─ Security Groups: Least-privilege firewall rules
 │   ├─ NACLs: Network-level access controls
 │   ├─ NAT Gateway: Outbound internet for private subnets
 │   └─ CloudFront: Global CDN (DDoS protection via AWS Shield)
 │
 ├─ Security:
 │   ├─ WAF: Web application firewall (OWASP Top 10 rules)
 │   ├─ KMS: Encryption key management (automatic rotation)
 │   ├─ Secrets Manager: API keys and credentials
 │   ├─ GuardDuty: Threat detection
 │   └─ Security Hub: Centralized security findings
 │
 └─ Monitoring & Logging:
     ├─ CloudWatch: Metrics, logs, alarms
     ├─ CloudTrail: API audit logs (all regions)
     ├─ VPC Flow Logs: Network traffic analysis
     └─ AWS Config: Configuration change tracking

 Disaster Recovery Environment (us-west-2):
 ├─ RDS Read Replica: Cross-region database replica
 ├─ S3 Replication: Cross-region backup replication
 └─ Status: Standby (manual failover, 4-hour RTO)

 ---

 SOFTWARE COMPONENTS

 Application Software:
 ├─ Web Application:
 │   ├─ Technology: React 18.2 (frontend), Node.js 20 (backend)
 │   ├─ Deployment: Docker containers on ECS Fargate
 │   ├─ Version control: GitHub (main branch protected)
 │   └─ CI/CD: GitHub Actions (automated testing + deployment)
 │
 ├─ API Service:
 │   ├─ Technology: Express.js REST API
 │   ├─ Authentication: JWT tokens (issued by Okta)
 │   ├─ Rate limiting: 1000 requests/minute per API key
 │   └─ Documentation: OpenAPI 3.0 specification
 │
 ├─ Background Workers:
 │   ├─ Invoice generation: Lambda function (triggered by SQS queue)
 │   ├─ Email notifications: Lambda function (SendGrid integration)
 │   └─ Payment reconciliation: Lambda function (nightly at 2 AM UTC)
 │
 └─ Mobile Applications:
     ├─ iOS app: Swift 5.9 (App Store)
     ├─ Android app: Kotlin (Google Play)
     └─ API integration: RESTful API via HTTPS

 Third-Party Software:
 ├─ Operating Systems: Amazon Linux 2 (AMI)
 ├─ Databases: PostgreSQL 15.4, Redis 7.0
 ├─ Monitoring: Datadog (APM, infrastructure monitoring)
 ├─ Error tracking: Sentry (application error logging)
 └─ Log aggregation: CloudWatch Logs

 ---

 PEOPLE COMPONENTS

 Organizational Structure:

 Executive Leadership:
 ├─ CEO: Overall business strategy
 ├─ CTO: Technology leadership, architecture decisions
 ├─ CISO: Information security, compliance oversight
 └─ CFO: Financial controls, audit coordination

 Engineering Team (25 people):
 ├─ Engineering Manager: Team leadership, hiring, performance
 ├─ Backend Engineers (10): API development, database optimization
 ├─ Frontend Engineers (6): Web/mobile application development
 ├─ DevOps Engineers (4): Infrastructure, CI/CD, monitoring
 ├─ QA Engineers (3): Testing, quality assurance
 └─ Security Engineer (2): Security controls, vulnerability management

 Operations Team (8 people):
 ├─ Customer Success (4): Customer onboarding, support
 ├─ Finance (2): Billing, accounts receivable
 └─ HR (2): Employee onboarding, compliance training

 Key Roles & Responsibilities:

 CISO (Chief Information Security Officer):
 ├─ Responsibilities:
 │   ├─ Define and maintain security policies
 │   ├─ Oversee SOC 2 compliance program
 │   ├─ Manage vendor risk assessments
 │   ├─ Respond to security incidents
 │   └─ Report security metrics to board quarterly
 │
 ├─ Access:
 │   ├─ AWS root account (emergency only, MFA required)
 │   ├─ All security tools (GuardDuty, Security Hub, WAF)
 │   └─ Audit logs (read-only)
 │
 └─ Reporting: Reports to CEO, presents to Audit Committee

 DevOps Team Lead:
 ├─ Responsibilities:
 │   ├─ Manage production infrastructure
 │   ├─ Implement infrastructure-as-code (Terraform)
 │   ├─ Configure CI/CD pipelines
 │   ├─ Monitor system health and performance
 │   └─ Respond to production incidents (on-call rotation)
 │
 ├─ Access:
 │   ├─ AWS admin access (production environment)
 │   ├─ GitHub admin (repository management)
 │   ├─ Datadog admin (monitoring configuration)
 │   └─ PagerDuty admin (incident management)
 │
 └─ Reporting: Reports to CTO

 Database Administrator:
 ├─ Responsibilities:
 │   ├─ Database performance tuning
 │   ├─ Backup and recovery testing
 │   ├─ Database access reviews (quarterly)
 │   ├─ Schema change management
 │   └─ Database security hardening
 │
 ├─ Access:
 │   ├─ RDS admin access (production databases)
 │   ├─ Database query logs
 │   └─ Backup management
 │
 └─ Reporting: Reports to DevOps Team Lead

 ---

 PROCEDURES COMPONENTS

 Documented Policies and Procedures:

 1. Access Control Policy (v2.1, effective Jan 1, 2025)
    ├─ User access provisioning and de-provisioning
    ├─ Role-based access control (RBAC) definitions
    ├─ Quarterly access reviews
    ├─ MFA enforcement requirements
    └─ Service account management

 2. Change Management Policy (v1.8, effective Mar 1, 2025)
    ├─ Change approval workflow (normal vs emergency)
    ├─ Testing requirements before production deployment
    ├─ Rollback procedures
    ├─ Post-deployment verification
    └─ Change documentation requirements

 3. Data Protection Policy (v3.2, effective Feb 1, 2025)
    ├─ Data classification scheme (Public, Internal, Confidential, Restricted)
    ├─ Encryption standards (AES-256, TLS 1.3)
    ├─ Data retention and disposal
    ├─ Customer data handling
    └─ Privacy requirements (GDPR compliance)

 4. Incident Response Policy (v2.5, effective Apr 1, 2025)
    ├─ Incident severity classification
    ├─ Escalation procedures
    ├─ Communication protocols
    ├─ Post-incident review process
    └─ Incident documentation requirements

 5. Vendor Management Policy (v1.3, effective May 1, 2025)
    ├─ Vendor risk assessment process
    ├─ SOC 2 report review requirements
    ├─ Data processing agreements
    ├─ Annual vendor reviews
    └─ Vendor offboarding procedures

 6. Business Continuity Policy (v1.6, effective Jun 1, 2025)
    ├─ Disaster recovery procedures
    ├─ Backup and restore testing (quarterly)
    ├─ Failover procedures (multi-region)
    ├─ Communication plan during outages
    └─ Recovery time objectives (RTO: 4 hours)

 Operational Procedures:

 Daily Operations:
 ├─ System monitoring: 24/7 via Datadog alerts
 ├─ Log review: Automated analysis via SIEM
 ├─ Backup verification: Automated daily at 3 AM UTC
 └─ Performance monitoring: Real-time dashboards

 Weekly Operations:
 ├─ Vulnerability scanning: Automated via Snyk (Sundays)
 ├─ Security alert review: SOC team reviews GuardDuty findings
 └─ Capacity planning: Review resource utilization trends

 Monthly Operations:
 ├─ Patch management: Security patches applied (2nd Tuesday)
 ├─ Access reviews: Manager reviews for terminated employees
 └─ Vendor SOC 2 report review: Check expiration dates

 Quarterly Operations:
 ├─ Full access reviews: All user permissions verified
 ├─ Disaster recovery testing: Failover test to DR environment
 ├─ Penetration testing: Third-party security assessment
 └─ Board security reporting: CISO presents metrics to board

 ---

 DATA COMPONENTS

 Data Classification:

 1. Restricted (Highest Sensitivity):
    ├─ Examples:
    │   ├─ Customer payment card data (PCI DSS scope)
    │   ├─ Customer bank account information
    │   ├─ Social Security Numbers (if collected)
    │   └─ API keys and credentials
    │
    ├─ Storage:
    │   ├─ RDS PostgreSQL (encrypted at rest via KMS)
    │   ├─ AWS Secrets Manager (credentials)
    │   └─ Stripe vault (tokenized payment data - external)
    │
    ├─ Protection:
    │   ├─ Encryption: AES-256 (at rest), TLS 1.3 (in transit)
    │   ├─ Access: Limited to 3 senior engineers (need-to-know)
    │   ├─ Logging: All access logged to CloudTrail
    │   └─ Masking: PCI data masked in application UI
    │
    └─ Retention: 7 years (regulatory requirement)

 2. Confidential:
    ├─ Examples:
    │   ├─ Customer invoice data
    │   ├─ Customer contact information
    │   ├─ Revenue and financial analytics
    │   └─ Internal business metrics
    │
    ├─ Storage:
    │   ├─ RDS PostgreSQL (invoices, customers)
    │   ├─ S3 (invoice PDFs, customer documents)
    │   └─ DynamoDB (transaction logs)
    │
    ├─ Protection:
    │   ├─ Encryption: AES-256 (at rest), TLS 1.3 (in transit)
    │   ├─ Access: Engineering team + customer success team
    │   ├─ Logging: Database access logged
    │   └─ Backup: Daily automated backups (30-day retention)
    │
    └─ Retention: Account lifetime + 30 days after cancellation

 3. Internal:
    ├─ Examples:
    │   ├─ Application logs
    │   ├─ Performance metrics
    │   ├─ Employee email addresses
    │   └─ Internal documentation
    │
    ├─ Storage:
    │   ├─ CloudWatch Logs
    │   ├─ Datadog (metrics)
    │   └─ Confluence (documentation)
    │
    ├─ Protection:
    │   ├─ Encryption: TLS in transit
    │   ├─ Access: All employees
    │   └─ Logging: Access logged
    │
    └─ Retention: 90 days (logs), indefinite (documentation)

 4. Public:
    ├─ Examples:
    │   ├─ Marketing website content
    │   ├─ API documentation
    │   ├─ Public blog posts
    │   └─ Status page information
    │
    ├─ Storage:
    │   ├─ CloudFront CDN
    │   └─ Public S3 buckets
    │
    └─ Protection: None required (public information)

 Data Flows:

 Primary Data Flow (Customer Invoice Creation):

 Step 1: Customer creates invoice via web app
 ├─ Input: Invoice details (customer info, line items, amount)
 ├─ Transport: HTTPS (TLS 1.3)
 ├─ Destination: CloudFront → API Gateway → Lambda
 └─ Protection: JWT authentication, input validation

 Step 2: Application processes invoice
 ├─ Processing: Lambda function
 ├─ Business logic: Calculate totals, apply discounts, generate PDF
 ├─ Storage: Write to RDS PostgreSQL (encrypted)
 └─ Notification: Queue email job to SQS

 Step 3: PDF generation and storage
 ├─ Processing: Background Lambda function
 ├─ PDF generation: Puppeteer (headless browser)
 ├─ Storage: Upload PDF to S3 (encrypted at rest)
 └─ Link: Store S3 URL in database

 Step 4: Email notification
 ├─ Trigger: SQS queue message
 ├─ Processing: SendGrid API call
 ├─ Content: Invoice PDF attached
 └─ Delivery: Customer email

 Step 5: Payment processing (if customer pays)
 ├─ Input: Payment form (credit card)
 ├─ Flow: Stripe.js → Stripe API (PCI-compliant, no card data touches our servers)
 ├─ Webhook: Stripe → API Gateway → Lambda
 ├─ Update: Mark invoice as paid in database
 └─ Notification: Send payment receipt via email

 Data Backup and Recovery:
 ├─ RDS: Automated daily snapshots (30-day retention)
 ├─ S3: Versioning enabled (recover deleted objects)
 ├─ DynamoDB: Point-in-time recovery (35-day window)
 ├─ Cross-region replication: RDS read replica in us-west-2
 └─ Testing: Quarterly restore test from backup"

Evidence Sources:
├─ AWS resource inventory (247 resources discovered)
├─ Organizational chart (25 employees)
├─ Policy documents (6 major policies)
├─ Data classification schema
├─ VPC flow logs (data flow analysis)
└─ Database schema analysis (data types discovered)
```

**DC-200.4: System Boundaries** {#dc-200-4}

```
What this component requires:
Clear definition of what is IN SCOPE vs OUT OF SCOPE for the audit.

Discovery Agent Process:

Step 1: Map All Resources
├─ Production: All resources tagged "env:production"
├─ Development: Resources tagged "env:dev" or "env:staging"
├─ Critical vendors: Vendors that process customer data
└─ Non-critical vendors: Internal tools (JIRA, Slack, etc.)

Step 2: Define Boundary
├─ Rule: Production + Critical Vendors = IN SCOPE
├─ Rule: Development + Internal Tools = OUT OF SCOPE
└─ Edge cases: User approval required

Agent-Generated DC-200.4 Section:

"SYSTEM BOUNDARY DEFINITION

 In-Scope Systems (SOC 2 Type II Audit):

 1. Production Environment (AWS us-east-1)
    ├─ All compute, database, storage, network resources
    ├─ Rationale: Processes and stores customer data
    └─ Resources: 47 AWS resources

 2. Identity and Access Management (Okta)
    ├─ All user accounts (156 employees + contractors)
    ├─ SSO integrations to production systems
    ├─ MFA enforcement
    └─ Rationale: Controls access to production

 3. Source Code Repository (GitHub)
    ├─ Application source code (12 repositories)
    ├─ CI/CD pipelines (GitHub Actions)
    ├─ Secrets management (GitHub Secrets)
    └─ Rationale: Code deployed to production

 4. Critical Subservice Organizations (Vendors):
    ├─ Stripe: Payment processing (PCI DSS validated)
    ├─ SendGrid: Transactional email delivery
    ├─ Twilio: SMS notifications
    └─ AWS: Cloud infrastructure provider

 Out-of-Scope Systems:

 1. Development Environment (AWS us-west-2)
    ├─ Isolated from production (separate VPC)
    ├─ No customer data (uses synthetic test data)
    └─ Rationale: Not part of customer-facing service

 2. Staging Environment (AWS us-east-1)
    ├─ Mirror of production for testing
    ├─ Uses anonymized customer data (no PII)
    └─ Rationale: No real customer data

 3. Internal Tools:
    ├─ JIRA (project management)
    ├─ Confluence (documentation)
    ├─ Slack (team communication)
    ├─ Google Workspace (email, documents)
    └─ Rationale: No customer data processed

 Boundary Diagram:

 ┌────────────────────────────────────────────────────────┐
 │                   IN SCOPE (SOC 2)                     │
 │                                                         │
 │  Production AWS   ┌──────────────────────┐            │
 │  Environment      │  Customer Data Flow  │            │
 │                   │                      │            │
 │  ┌──────────┐     │  Web App → API →    │            │
 │  │CloudFront│────→│  Database → S3      │            │
 │  └──────────┘     │                      │            │
 │                   └──────────────────────┘            │
 │                                                         │
 │  Identity (Okta) ────→ Controls access to production  │
 │  Code (GitHub)   ────→ Deployed to production         │
 │  Vendors (Stripe)────→ Processes customer payments    │
 └────────────────────────────────────────────────────────┘

 ┌────────────────────────────────────────────────────────┐
 │                 OUT OF SCOPE                            │
 │                                                         │
 │  Dev/Staging ───→ No customer data                     │
 │  Internal Tools ─→ No customer data                    │
 └────────────────────────────────────────────────────────┘

 Exclusion Rationale:
 Development and staging environments are excluded because they
 do not process real customer data. While they mirror production
 architecture, they use synthetic test data and are not accessible
 to customers. Internal productivity tools (JIRA, Slack) are
 excluded because they do not process customer information."

Evidence Sources:
├─ AWS resource tags (env:production vs env:dev)
├─ VPC network topology (isolated environments)
├─ Data flow analysis (customer data paths)
└─ Vendor assessment (critical vs non-critical)
```

**DC-200.5: Control Environment, Risk Assessment, Information & Communication** {#dc-200-5}

```
What this component requires:
Description of how the organization manages its control environment.

Agent-Generated DC-200.5 Section:

"CONTROL ENVIRONMENT

 Commitment to Integrity and Ethics:
 ├─ Code of Conduct: All employees sign annually
 ├─ Whistleblower Policy: Anonymous reporting mechanism
 ├─ Background Checks: All employees screened before hire
 └─ Security Awareness Training: Annual mandatory training

 Board Oversight:
 ├─ Audit Committee: Meets quarterly
 ├─ SOC 2 Status: CISO presents compliance status quarterly
 ├─ Risk Review: Board reviews top risks annually
 └─ Incident Reporting: CISO reports security incidents to board

 Management Philosophy:
 ├─ Security-first culture: Security integrated into development
 ├─ Least privilege: Default deny access model
 ├─ Automation: Automated controls preferred over manual
 └─ Continuous improvement: Post-incident reviews drive improvements

 RISK ASSESSMENT PROCESS

 Annual Risk Assessment (conducted by CISO):

 Step 1: Risk Identification
 ├─ Threats: Identify potential security threats
 ├─ Vulnerabilities: Identify system weaknesses
 ├─ Impact: Assess business impact if exploited
 └─ Likelihood: Estimate probability of occurrence

 Step 2: Risk Analysis
 ├─ Risk scoring: Impact × Likelihood = Risk score
 ├─ Prioritization: Rank risks by score
 ├─ Accept/Mitigate: Determine risk treatment strategy
 └─ Documentation: Risk register maintained

 Step 3: Risk Response
 ├─ High risks: Immediate mitigation plans
 ├─ Medium risks: Scheduled for remediation
 ├─ Low risks: Accept with monitoring
 └─ Tracking: Quarterly risk review meetings

 2025 Top Risks Identified:
 1. Third-party data breach (Stripe, SendGrid)
 2. DDoS attack causing service unavailability
 3. Ransomware targeting production databases
 4. Insider threat (employee data exfiltration)
 5. AWS service outage (regional failure)

 MONITORING ACTIVITIES

 Continuous Monitoring:
 ├─ Security Hub: Aggregates findings from GuardDuty, Config, IAM Access Analyzer
 ├─ Datadog: Application performance monitoring, error tracking
 ├─ CloudWatch: Infrastructure metrics, log analysis
 ├─ Sentry: Application error tracking
 └─ PagerDuty: Incident alerting and escalation

 Periodic Reviews:
 ├─ Access reviews: Quarterly (all user permissions)
 ├─ Vendor reviews: Annual (SOC 2 reports, security assessments)
 ├─ Policy reviews: Annual (update for business changes)
 └─ Penetration testing: Annual (third-party assessment)

 INFORMATION AND COMMUNICATION

 Internal Communication:
 ├─ Security announcements: Posted to Slack #security channel
 ├─ Policy updates: Emailed to all employees, sign-off required
 ├─ Incident notifications: PagerDuty alerts for on-call team
 └─ Training: Annual security awareness training (mandatory)

 External Communication:
 ├─ Customer notifications: Security incidents disclosed within 72 hours
 ├─ Status page: Real-time system status at status.acme.com
 ├─ Auditors: Evidence requests responded to within 48 hours
 └─ Regulators: Data breach reporting per GDPR requirements"

Evidence Sources:
├─ Code of Conduct (signed by 156/156 employees)
├─ Audit Committee meeting minutes (Q1-Q4 2025)
├─ Risk register (updated October 2025)
├─ Security monitoring dashboards
└─ Policy acknowledgment records
```

**DC-200.6: Complementary Controls at Subservice Organizations** {#dc-200-6}

```
What this component requires:
List of critical vendors and what controls they must maintain.

Agent-Generated DC-200.6 Section:

"SUBSERVICE ORGANIZATIONS (VENDORS)

 The following third-party service providers process customer data
 and are critical to system operations:

 1. Amazon Web Services (AWS)
    ├─ Service: Cloud infrastructure (compute, storage, database, network)
    ├─ Data Handled: All customer data (invoices, payments, personal information)
    ├─ SOC 2 Status: AWS SOC 2 Type II report reviewed (valid through Dec 2025)
    ├─ Complementary Controls AWS Must Maintain:
    │   ├─ Physical security of data centers
    │   ├─ Environmental controls (power, cooling, fire suppression)
    │   ├─ Hardware maintenance and disposal
    │   ├─ Network infrastructure security
    │   └─ Hypervisor security (multi-tenant isolation)
    └─ Our Responsibility: Configure AWS services securely (encryption, access controls, backups)

 2. Stripe Inc.
    ├─ Service: Payment processing (credit card transactions)
    ├─ Data Handled: Cardholder data (PCI DSS scope)
    ├─ SOC 2 Status: Stripe SOC 2 Type II report reviewed (valid through Mar 2026)
    ├─ PCI DSS Status: Stripe PCI DSS Level 1 certified
    ├─ Complementary Controls Stripe Must Maintain:
    │   ├─ PCI DSS compliance (secure payment processing)
    │   ├─ Card data encryption and tokenization
    │   ├─ Fraud detection and prevention
    │   ├─ Payment data retention and disposal
    │   └─ Incident response for payment breaches
    └─ Our Responsibility: Use Stripe.js (card data never touches our servers)

 3. SendGrid (Twilio Inc.)
    ├─ Service: Transactional email delivery
    ├─ Data Handled: Customer email addresses, invoice copies
    ├─ SOC 2 Status: SendGrid SOC 2 Type II report reviewed (valid through Aug 2026)
    ├─ Complementary Controls SendGrid Must Maintain:
    │   ├─ Email infrastructure availability
    │   ├─ SMTP security (TLS encryption)
    │   ├─ Anti-spam and anti-phishing measures
    │   ├─ Email logs retention
    │   └─ Sender reputation management
    └─ Our Responsibility: API key security, email content accuracy

 4. Twilio Inc.
    ├─ Service: SMS notifications
    ├─ Data Handled: Customer phone numbers
    ├─ SOC 2 Status: Twilio SOC 2 Type II report reviewed (valid through Jun 2026)
    ├─ Complementary Controls Twilio Must Maintain:
    │   ├─ Telecom infrastructure availability
    │   ├─ SMS delivery reliability
    │   ├─ Message encryption in transit
    │   ├─ Phone number validation
    │   └─ SMS log retention
    └─ Our Responsibility: API key security, message content

 Vendor Management Process:
 ├─ Selection: All vendors assessed before engagement
 ├─ Contracts: Data processing agreements signed
 ├─ Monitoring: SOC 2 reports reviewed annually
 ├─ Replacement: Backup vendors identified for critical services
 └─ Offboarding: Secure data deletion upon contract termination"

Evidence Sources:
├─ AWS SOC 2 Type II report (effective date: Jan 1 - Dec 31, 2024)
├─ Stripe SOC 2 Type II report + PCI AOC
├─ SendGrid SOC 2 Type II report
├─ Twilio SOC 2 Type II report
├─ Vendor contracts and data processing agreements
└─ Vendor assessment questionnaires
```

**DC-200.7: Complementary User Entity Controls (CUECs)** {#dc-200-7}

```
What this component requires:
What CUSTOMERS must do for the system to be secure.

Agent-Generated DC-200.7 Section:

"COMPLEMENTARY USER ENTITY CONTROLS (CUECs)

 Acme Invoicing's security controls are designed to protect customer
 data. However, certain controls require customer cooperation to be
 effective. Customers are responsible for:

 1. User Access Management
    ├─ Customer Responsibility:
    │   ├─ Grant access only to authorized employees
    │   ├─ Promptly revoke access when employees leave
    │   ├─ Review user permissions regularly
    │   └─ Assign appropriate roles (admin vs standard user)
    │
    └─ Why This Matters:
        We provide access controls, but customers determine who
        should have access to their account. If a customer grants
        access to unauthorized users, we cannot prevent misuse.

 2. Password Security
    ├─ Customer Responsibility:
    │   ├─ Choose strong, unique passwords
    │   ├─ Do not share passwords with others
    │   ├─ Enable multi-factor authentication (MFA)
    │   └─ Change passwords if compromise suspected
    │
    └─ Why This Matters:
        We enforce password complexity, but customers must protect
        their credentials. A strong password is ineffective if shared.

 3. Data Backup and Recovery
    ├─ Customer Responsibility:
    │   ├─ Export critical data regularly (use our export feature)
    │   ├─ Maintain offline backups of exported data
    │   ├─ Test data restore procedures
    │   └─ Do not rely solely on our backups
    │
    └─ Why This Matters:
        We provide 30-day backup retention, but customers should
        maintain their own backups for longer retention or disaster
        recovery scenarios outside our SLA.

 4. Sensitive Data Handling
    ├─ Customer Responsibility:
    │   ├─ Do not upload unnecessary PII (Social Security Numbers, etc.)
    │   ├─ Use our data classification features properly
    │   ├─ Comply with privacy laws (GDPR, CCPA) when using our platform
    │   └─ Notify us if sensitive data uploaded accidentally
    │
    └─ Why This Matters:
        Customers control what data they upload. We encrypt and
        protect data, but cannot enforce customers' own privacy
        compliance obligations.

 5. Security Monitoring
    ├─ Customer Responsibility:
    │   ├─ Monitor audit logs for unusual activity
    │   ├─ Report suspicious activity to our support team
    │   ├─ Investigate unauthorized access promptly
    │   └─ Configure notification preferences
    │
    └─ Why This Matters:
        We log all activity, but customers must review logs for
        their own users to detect insider threats or compromised
        accounts.

 6. Network Security
    ├─ Customer Responsibility:
    │   ├─ Use secure networks (not public Wi-Fi for sensitive work)
    │   ├─ Keep endpoint devices (laptops, phones) secure
    │   ├─ Install anti-malware software
    │   └─ Use VPNs when accessing from untrusted networks
    │
    └─ Why This Matters:
        We secure data in transit (TLS 1.3), but cannot protect
        customer devices or networks.

 Risk if CUECs Not Followed:
 ├─ Scenario: Customer shares admin password with contractor
 ├─ Our Control: MFA prevents password-only access
 ├─ Residual Risk: If customer also shares MFA device, unauthorized access possible
 └─ Responsibility: Customer must protect credentials"

Evidence Sources:
├─ User documentation (password requirements, MFA setup)
├─ Data export feature (self-service backup)
├─ Audit log UI (customer access to logs)
└─ Terms of Service (customer responsibilities)
```

**DC-200.8: Changes to the System Since Last Report** {#dc-200-8}

```
What this component requires:
Document significant changes to the system during the audit period.

Discovery Agent Process:

Step 1: Analyze Infrastructure Changes
├─ Query: AWS Config (configuration changes last 12 months)
├─ Query: GitHub commits (application changes)
├─ Query: Change management tickets
└─ Identify: Major architectural changes

Step 2: Classify Changes
├─ Category 1: Infrastructure changes (new services, migrations)
├─ Category 2: Application changes (new features, refactors)
├─ Category 3: Security changes (new controls, policy updates)
└─ Category 4: Personnel changes (new hires, departures)

Agent-Generated DC-200.8 Section:

"SIGNIFICANT CHANGES (January 1, 2025 - December 31, 2025)

 Infrastructure Changes:

 1. Migration to ECS Fargate (March 2025)
    ├─ Change: Migrated from EC2 instances to ECS Fargate containers
    ├─ Rationale: Improved scalability, reduced operational overhead
    ├─ Impact: No customer-facing changes
    ├─ Security: Reduced attack surface (no SSH access to instances)
    └─ Evidence: Migration project documentation, AWS Config history

 2. Multi-Region Disaster Recovery (June 2025)
    ├─ Change: Deployed RDS read replica in us-west-2
    ├─ Rationale: Improved disaster recovery capabilities
    ├─ Impact: Reduced RTO from 8 hours to 4 hours
    ├─ Testing: Quarterly failover tests implemented
    └─ Evidence: Disaster recovery plan v1.6, test results

 3. GuardDuty Deployment (February 2025)
    ├─ Change: Enabled AWS GuardDuty threat detection
    ├─ Rationale: Enhanced security monitoring
    ├─ Impact: Proactive threat detection and alerting
    ├─ Integration: Findings sent to Security Hub, PagerDuty
    └─ Evidence: GuardDuty configuration, sample findings

 Application Changes:

 1. Mobile App Launch (April 2025)
    ├─ Change: Released iOS and Android mobile applications
    ├─ Rationale: Customer demand for mobile access
    ├─ Impact: New API endpoints, mobile authentication
    ├─ Security: OAuth 2.0 authentication, certificate pinning
    └─ Evidence: App store listings, API documentation

 2. API Rate Limiting (May 2025)
    ├─ Change: Implemented rate limiting (1000 req/min)
    ├─ Rationale: Prevent API abuse, ensure availability
    ├─ Impact: Better system stability under load
    ├─ Monitoring: CloudWatch metrics for throttled requests
    └─ Evidence: API Gateway configuration, rate limit policy

 Security and Compliance Changes:

 1. SOC 2 Type II Certification (December 2024)
    ├─ Change: First SOC 2 Type II audit completed
    ├─ Rationale: Customer requirement for enterprise sales
    ├─ Impact: Formalized security controls and documentation
    ├─ Findings: 0 findings, 2 observations
    └─ Evidence: SOC 2 Type II report (12-month audit period)

 2. MFA Enforcement (January 2025)
    ├─ Change: Made MFA mandatory for all users (was optional)
    ├─ Rationale: SOC 2 recommendation, security best practice
    ├─ Impact: 100% MFA enrollment (up from 87%)
    ├─ Rollout: 30-day grace period for adoption
    └─ Evidence: Okta MFA enrollment reports, policy document

 3. Encryption Key Rotation (August 2025)
    ├─ Change: Enabled automatic KMS key rotation
    ├─ Rationale: SOC 2 best practice, reduce key exposure risk
    ├─ Impact: Keys rotated annually without service disruption
    ├─ Scope: All KMS keys (database encryption, S3 encryption)
    └─ Evidence: KMS configuration, key rotation logs

 Personnel Changes:

 1. CISO Hire (March 2025)
    ├─ Change: Hired dedicated Chief Information Security Officer
    ├─ Rationale: Strengthen security leadership
    ├─ Impact: Improved compliance oversight, security strategy
    ├─ Reporting: Reports to CEO, presents to board quarterly
    └─ Evidence: Organizational chart, job description

 2. DevOps Team Expansion (May 2025)
    ├─ Change: Hired 2 additional DevOps engineers (4 total)
    ├─ Rationale: Support infrastructure growth
    ├─ Impact: Faster incident response, better monitoring
    ├─ Training: All new hires completed security training
    └─ Evidence: HR records, onboarding checklists

 No Significant Changes:
 ├─ Cloud provider: Remained on AWS (no multi-cloud migration)
 ├─ Database platform: Remained on PostgreSQL (no migration)
 ├─ Payment processor: Remained with Stripe (no vendor change)
 └─ Data residency: Remained in US only (no EU expansion)"

Evidence Sources:
├─ AWS Config change history (12 months)
├─ GitHub commit history (12 months)
├─ Change management tickets (147 changes reviewed)
├─ HR records (new hires, terminations)
└─ Policy version history
```

**DC-200.9: Incidents Since Last Report** {#dc-200-9}

```
What this component requires:
Disclosure of security incidents during the audit period.

Agent-Generated DC-200.9 Section:

"SECURITY INCIDENTS (January 1, 2025 - December 31, 2025)

 Incident Disclosure Policy:
 This section documents security incidents that occurred during the
 audit period, in accordance with SOC 2 transparency requirements.

 INCIDENT #1: Brute Force Login Attempts (Severity: Low)

 Date: February 14, 2025
 Detection: GuardDuty alerted on unusual login attempts

 Description:
 ├─ Event: 500+ failed login attempts from single IP address
 ├─ Target: 20 customer accounts (credential stuffing attack)
 ├─ Source: IP address traced to known botnet
 ├─ Duration: 2 hours (8 AM - 10 AM UTC)
 └─ Result: All login attempts blocked (MFA prevented access)

 Impact Assessment:
 ├─ Customer Data Compromised: NO (MFA prevented access)
 ├─ Service Availability: NO (rate limiting prevented DoS)
 ├─ Control Effectiveness: YES (controls worked as designed)
 └─ Customer Notification: NO (no actual breach)

 Response Actions:
 ├─ Immediate: Blocked attacking IP address at WAF level
 ├─ Investigation: Reviewed all 500 login attempts (none successful)
 ├─ Notification: Alerted affected customers to reset passwords
 ├─ Remediation: Implemented CAPTCHA for repeated failed logins
 └─ Closure: Incident closed after 48 hours

 Root Cause:
 ├─ Attacker obtained username/password list from third-party breach
 ├─ Attempted to reuse credentials on our platform
 └─ MFA prevented access (control operating effectively)

 Lessons Learned:
 ├─ MFA is critical (100% of attacks blocked)
 ├─ Rate limiting prevented resource exhaustion
 └─ CAPTCHA added to improve brute force protection

 ---

 INCIDENT #2: Phishing Email to Employees (Severity: Medium)

 Date: July 8, 2025
 Detection: Employee reported suspicious email

 Description:
 ├─ Event: Phishing email sent to 15 engineering team members
 ├─ Content: Fake "AWS Security Alert" requesting credentials
 ├─ Sender: Spoofed AWS email address
 ├─ Objective: Steal AWS console credentials
 └─ Result: 1 employee clicked link (did not enter credentials)

 Impact Assessment:
 ├─ Credentials Compromised: NO (employee did not enter creds)
 ├─ Malware Installed: NO (link led to fake login page only)
 ├─ System Access Gained: NO (no credentials stolen)
 └─ Customer Notification: NO (no customer impact)

 Response Actions:
 ├─ Immediate: Blocked sender domain in email filter
 ├─ Investigation: Reviewed email logs (15 recipients, 1 click)
 ├─ Training: Conducted refresher phishing awareness training
 ├─ Testing: Initiated quarterly phishing simulation program
 └─ Closure: Incident closed after 7 days

 Root Cause:
 ├─ Employee email addresses publicly available (LinkedIn)
 ├─ Attacker researched team members (targeted attack)
 └─ Email filters did not catch spoofed domain

 Lessons Learned:
 ├─ Employee awareness critical (reporting prevented breach)
 ├─ Email filtering improved (spoofed domains now blocked)
 └─ Quarterly phishing simulations now mandatory

 ---

 INCIDENT #3: Unencrypted S3 Bucket Discovered (Severity: High)

 Date: November 18, 2025 (during SOC 2 audit)
 Detection: Auditor discovered during fieldwork

 Description:
 ├─ Event: 1 S3 bucket found without encryption enabled
 ├─ Content: Customer support attachments (500 files, some PII)
 ├─ Duration: Bucket unencrypted for 10 months (Jan - Nov 2025)
 ├─ Public Access: NO (bucket not publicly accessible)
 └─ Data Breach: NO (no evidence of unauthorized access)

 Impact Assessment:
 ├─ Customer Data Compromised: NO (access logs show no unauthorized access)
 ├─ Regulatory Violation: POTENTIAL (unencrypted PII at rest)
 ├─ Control Failure: YES (encryption control not operating effectively)
 └─ Customer Notification: NO (no breach, but disclosed in audit report)

 Response Actions:
 ├─ Immediate: Enabled encryption on bucket (within 2 hours)
 ├─ Investigation: Reviewed all 200 S3 buckets (no other gaps found)
 ├─ Root Cause: Bucket created before encryption policy enforced
 ├─ Remediation: AWS Config auto-remediation enabled
 └─ Prevention: Monitoring updated to scan ALL buckets

 Root Cause:
 ├─ Bucket created in January 2025 before encryption policy update
 ├─ Infrastructure scanner only checked "production" tagged buckets
 └─ This bucket lacked "production" tag (false negative)

 Lessons Learned:
 ├─ Tagging-based monitoring can miss resources
 ├─ AWS Config auto-remediation prevents future gaps
 ├─ Quarterly manual review of ALL resources now required
 └─ Discovery Agent updated to scan ALL buckets regardless of tags

 Audit Impact:
 ├─ Auditor classified as "Significant Deficiency"
 ├─ Management response: Accepted finding, provided remediation evidence
 ├─ Auditor outcome: Finding noted in report with remediation
 └─ Future audit: Will verify remediation effectiveness

 ---

 Incident Summary (12-Month Period):

 Total Incidents: 3
 ├─ Low Severity: 1 (brute force login attempts)
 ├─ Medium Severity: 1 (phishing email)
 └─ High Severity: 1 (unencrypted S3 bucket)

 Customer Impact:
 ├─ Data Breaches: 0
 ├─ Service Outages: 0
 ├─ Customer Notifications Required: 0
 └─ Regulatory Reports Filed: 0

 Control Effectiveness:
 ├─ Controls Prevented Breaches: 2/2 (MFA, employee reporting)
 ├─ Control Failures Identified: 1 (encryption enforcement)
 ├─ Remediation Time (Avg): 24 hours
 └─ Recurrence Rate: 0% (no repeat incidents)

 Continuous Improvement:
 ├─ New Controls Implemented:
 │   ├─ CAPTCHA for brute force protection
 │   ├─ Quarterly phishing simulations
 │   └─ AWS Config auto-remediation
 │
 └─ Process Improvements:
     ├─ Incident response time reduced (24-hour avg)
     ├─ Post-incident reviews for all incidents
     └─ Board reporting for high-severity incidents"

Evidence Sources:
├─ Incident reports (#2025-001, #2025-002, #2025-003)
├─ GuardDuty findings (brute force logs)
├─ Email logs (phishing incident)
├─ AWS Config history (S3 encryption)
└─ Post-incident review documents
```

**DC-200.10: Criteria Not Applicable** {#dc-200-10}

```
What this component requires:
Identify any SOC 2 criteria that don't apply to the organization.

Agent-Generated DC-200.10 Section:

"CRITERIA NOT APPLICABLE

 This section identifies any SOC 2 Trust Services Criteria that
 are not applicable to Acme Invoicing's system.

 SOC 2 Audit Scope:
 ├─ Trust Services Category: Security (Common Criteria)
 ├─ Controls in Scope: 64 controls (CC1-CC9, A1, C1, PI1, P1-P8)
 └─ Criteria Excluded: None

 All Common Criteria (CC1-CC9) are applicable because:
 ├─ We process customer data (all security controls apply)
 ├─ We have a cloud-based SaaS platform (infrastructure controls apply)
 ├─ We have employees with system access (access controls apply)
 └─ We undergo annual audits (monitoring controls apply)

 Additional Trust Services Categories:

 AVAILABILITY (A1) - IN SCOPE
 ├─ Status: APPLICABLE
 ├─ Rationale: We commit to 99.9% uptime SLA
 ├─ Controls: Disaster recovery, monitoring, redundancy
 └─ Evidence: Uptime reports, DR tests, CloudWatch metrics

 PROCESSING INTEGRITY (PI1) - NOT IN SCOPE
 ├─ Status: NOT APPLICABLE
 ├─ Rationale: Processing integrity is relevant for systems that
 │            perform complex calculations or transformations where
 │            accuracy is critical (e.g., payroll, financial trading).
 │            Our invoicing calculations are straightforward (line
 │            items × prices + tax) and do not require PI1 certification.
 ├─ Customer Impact: None (customers do not require PI1)
 └─ Future Consideration: May be added if we add complex calculations

 CONFIDENTIALITY (C1) - NOT IN SCOPE
 ├─ Status: NOT APPLICABLE
 ├─ Rationale: Confidentiality criteria apply when an organization
 │            explicitly commits to keeping information confidential
 │            beyond standard security practices. We protect data
 │            under Security criteria (CC6, CC7) which covers
 │            encryption and access controls. Customers have not
 │            requested explicit confidentiality certification.
 ├─ Customer Impact: None (Security criteria sufficient)
 └─ Future Consideration: May be added for enterprise customers

 PRIVACY (P1-P8) - NOT IN SCOPE
 ├─ Status: NOT APPLICABLE
 ├─ Rationale: Privacy criteria align with GDPR/CCPA requirements.
 │            We comply with GDPR for EU customers, but have not
 │            pursued SOC 2 Privacy certification because:
 │            1. Most customers are US-based (not subject to GDPR)
 │            2. GDPR compliance is verified separately (not via SOC 2)
 │            3. No customer has requested SOC 2 Privacy certification
 ├─ Customer Impact: None (GDPR compliance sufficient)
 └─ Future Consideration: May be added if enterprise customers require

 Specific Controls Not Applicable:

 None. All 64 controls within scope (Security + Availability) are
 applicable to our system.

 Rationale for Full Applicability:
 ├─ Cloud-based SaaS: All infrastructure controls apply
 ├─ Customer data: All data protection controls apply
 ├─ Multi-tenant: All logical access controls apply
 ├─ Third-party integrations: All vendor controls apply
 ├─ Continuous operations: All monitoring controls apply
 └─ Uptime SLA: All availability controls apply

 Future Scope Expansion:
 If business needs change, we may add:
 ├─ Processing Integrity (PI1): If we add complex calculations
 ├─ Confidentiality (C1): If customers require explicit certification
 └─ Privacy (P1-P8): If enterprise customers mandate SOC 2 Privacy"

Evidence Sources:
├─ SOC 2 scope definition document
├─ Customer contract requirements analysis
├─ Risk assessment (control applicability review)
└─ Auditor discussions (scope agreement)
```

---

### **Triggering DC-200 Generation**

**User Interaction:**

```
User: "Generate SOC 2 system description"

Discovery Agent Response:

Step 1: Confirm Discovery Complete
├─ Check: Has discovery been run?
├─ Status: Last discovery completed 2 hours ago ✅
├─ Coverage: 247 resources discovered
└─ Proceed: YES

Step 2: Generate All 10 DC-200 Components
├─ DC-200.1: Products and Services → 2 minutes
├─ DC-200.2: Service Commitments → 3 minutes
├─ DC-200.3: System Components → 8 minutes (most detailed)
├─ DC-200.4: System Boundaries → 2 minutes
├─ DC-200.5: Control Environment → 4 minutes
├─ DC-200.6: Subservice Organizations → 3 minutes
├─ DC-200.7: CUECs → 3 minutes
├─ DC-200.8: Changes → 4 minutes (requires historical analysis)
├─ DC-200.9: Incidents → 3 minutes (queries incident database)
├─ DC-200.10: Criteria Not Applicable → 1 minute
└─ Total Generation Time: 33 minutes

Step 3: Format as Complete Document
├─ Template: SOC 2 System Description Template (AICPA standard)
├─ Sections: All 10 DC-200 components in order
├─ Length: 38 pages (typical for SaaS platform)
├─ Format: PDF with table of contents, diagrams
└─ Output: system_description_2025.pdf

Step 4: Quality Validation
├─ Completeness Check: All 10 components present ✅
├─ Evidence Links: All statements linked to evidence ✅
├─ Accuracy Check: AI reviews for inconsistencies ✅
├─ Auditor Review: Flagged areas requiring human review ⚠️
│   ├─ DC-200.8: Manually verify significance of changes
│   ├─ DC-200.9: Manually verify incident severity classification
│   └─ DC-200.10: Manually confirm no applicable criteria missed
└─ Status: READY FOR HUMAN REVIEW

User Deliverable:

"✅ DC-200 System Description Generated

 Document: system_description_2025.pdf (38 pages)

 Components Included:
 ✅ DC-200.1: Products and Services (2 pages)
 ✅ DC-200.2: Service Commitments (3 pages)
 ✅ DC-200.3: System Components (12 pages)
 ✅ DC-200.4: System Boundaries (2 pages)
 ✅ DC-200.5: Control Environment (5 pages)
 ✅ DC-200.6: Subservice Organizations (3 pages)
 ✅ DC-200.7: CUECs (4 pages)
 ✅ DC-200.8: Changes to System (4 pages)
 ✅ DC-200.9: Incidents (2 pages)
 ✅ DC-200.10: Criteria Not Applicable (1 page)

 Evidence Sources: 47 documents linked

 ⚠️ Human Review Required:
 - Page 31: Verify incident severity classifications
 - Page 34: Confirm all major changes documented
 - Page 37: Validate criteria exclusions

 Next Steps:
 1. Review flagged sections
 2. Submit to auditor for pre-audit review
 3. Incorporate auditor feedback
 4. Finalize for inclusion in SOC 2 report

 Estimated Auditor Review Time: 2-4 hours
 (vs 20-40 hours for manual documentation)"
```

---

## **Success Metrics**

**Discovery Agent Performance:**
- Resource discovery coverage: Target 100% (actual: 99.7%)
- False positives (resources that don't exist): Target <0.1% (actual: 0.03%)
- Shadow IT detection rate: Target >90% (actual: 94%)
- Data flow accuracy: Target >98% (actual: 99.1%)
- Time to complete discovery: Target <48 hours (actual: 18 hours avg)
- **DC-200 generation time: Target <60 minutes (actual: 33 minutes avg)**
- **DC-200 completeness: Target 100% (actual: 100% - all 10 components)**
- **DC-200 accuracy (auditor acceptance): Target >95% (actual: 97%)**
- **Human review time saved: Target >90% (actual: 95% - 2 hrs vs 40 hrs manual)**
