# **AI-Powered GRC Automation Platform**
## Complete System Architecture Document

**Version:** 1.0  
**Date:** November 2025  
**Author:** AI Systems Architect  
**Status:** Design Complete - Ready for Implementation

---

## **TABLE OF CONTENTS**

1. [Executive Summary](#1-executive-summary)
2. [Business Context](#2-business-context)
3. [System Overview](#3-system-overview)
4. [Multi-Agent Architecture](#4-multi-agent-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Orchestration Layer](#6-orchestration-layer)
7. [Vision-Based Evidence Collection](#7-vision-based-evidence-collection)
8. [Data Architecture](#8-data-architecture)
9. [Security & Compliance](#9-security--compliance)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Observability & Monitoring](#11-observability--monitoring)
12. [MVP Recommendation](#12-mvp-recommendation)

---

## **1. EXECUTIVE SUMMARY**

### **1.1 Problem Statement**

Companies spend **$50K-150K annually** on GRC (Governance, Risk, and Compliance) efforts:
- **$30-60K**: GRC engineer salaries
- **$20-40K**: External auditors (SOC 2, ISO 27001)
- **$10-20K**: GRC tools (Vanta, Drata)
- **$10-30K**: Internal time spent on compliance

The process is:
- ⏰ **Time-consuming**: 3-9 months for first audit
- 📋 **Manual**: Evidence collection requires constant human intervention
- 🔄 **Repetitive**: Same checks performed daily/weekly/monthly
- 🎯 **Error-prone**: Humans miss deadlines, forget checks
- 💰 **Expensive**: Requires dedicated headcount as company scales

### **1.2 Solution**

An **AI-powered multi-agent system** that:

1. **Automates evidence collection** using computer vision + API integrations
2. **Performs continuous compliance monitoring** 24/7
3. **Generates audit-ready documentation** automatically
4. **Reduces cost by 60-80%** compared to traditional approaches
5. **Reduces time to compliance by 50%** (1.5-4 months vs 3-9 months)

### **1.3 Key Innovation: Vision-Based Evidence Collection**

Unlike competitors (Vanta, Drata) that require extensive API integrations, our system uses:

- **Computer vision** to "see" compliance evidence like a human auditor
- **Browser automation** to navigate any system, even without APIs
- **AI interpretation** to validate evidence matches control requirements
- **Hybrid approach**: API when available, vision when necessary

This enables:
- ✅ Universal compatibility (works with any system)
- ✅ Faster customer onboarding (no waiting for API keys)
- ✅ More reliable evidence (validates what auditors actually see)
- ✅ Future-proof (adapts to system changes automatically)

### **1.4 Target Market**

**Primary:** Series A-C SaaS companies (50-500 employees)
- Need: SOC 2 Type II for enterprise sales
- Pain: Can't afford full-time GRC team yet
- Willingness to pay: $2K-4K/month

**Secondary:** Mid-market companies needing multiple frameworks
- Need: SOC 2 + ISO 27001 + HIPAA
- Pain: Managing multiple audits simultaneously
- Willingness to pay: $5K-10K/month

### **1.5 Competitive Positioning**

| Feature | Vanta | Drata | Delve | Comp AI | **Our Solution** |
|---------|-------|-------|-------|---------|------------------|
| **Evidence Collection** | Semi-automated | Semi-automated | AI agents | API + manual | **Vision + API hybrid** |
| **Vision-Based Validation** | No | No | Unknown | No | **✅ Claude Vision analysis** |
| **API Required?** | Yes | Yes | Mostly yes | Yes | **No - vision fallback** |
| **Audit Preparation** | Manual | Manual | AI-assisted | Manual | **Fully AI-generated** |
| **Code Security Scanning** | No | No | ✅ Yes | No | **✅ Yes (SAST + LLM)** |
| **Infrastructure Scanning** | Basic | Basic | ✅ Daily scans | No | **✅ Daily + real-time** |
| **Automated PR Fixes** | No | No | ✅ Yes | No | **✅ Yes** |
| **Trust Portal** | No | No | ✅ Yes | No | **✅ Yes (AI chatbot)** |
| **Questionnaire Automation** | Manual | Manual | ✅ AI autofill | No | **✅ AI + RAG** |
| **Compliance Copilot** | No | No | ✅ Yes | No | **✅ Interactive AI** |
| **Auditor Q&A** | Manual | Manual | AI-assisted | Manual | **AI-generated + copilot** |
| **Real-time Alerts** | Basic | Basic | ✅ Yes | Basic | **✅ Multi-channel smart alerts** |
| **Orchestration** | Basic | Basic | Unknown | Trigger.dev | **✅ Temporal + LangGraph** |
| **Architecture** | Monolithic | Monolithic | AI-native | Traditional | **Multi-agent system** |
| **Cost** | $3-5K/mo | $3-5K/mo | ~$3-5K/mo | $3K+ | **$2-3K/mo** |
| **Time to First Audit** | 4-6 months | 4-6 months | Weeks-months | 4 weeks (claim) | **2-3 months** |
| **Open Source** | No | No | No | ✅ Yes | **Optional** |

**Key Differentiators:**
- **🎯 Vision-First Evidence**: Only solution with true computer vision validation
- **🤖 True Multi-Agent**: 16+ specialized agents vs basic automation  
- **⚡ Hybrid Approach**: API when available, vision fallback (best of both worlds)
- **🔧 Complete Automation**: Code scanning + infrastructure + questionnaires + PRs
- **🏗️ Production-Grade**: Temporal workflows survive crashes and months-long processes
- **💰 Best Economics**: Lower price, higher automation, better margins


---

## **2. BUSINESS CONTEXT**

### **2.1 GRC Engineer Workflow Analysis**

Our system replicates the complete workflow of a GRC engineer:

#### **Phase 1: Initiation (Weeks 1-2)**
- Understand business requirements
- Select compliance framework (SOC 2 Type I vs II)
- Define system scope and boundaries
- Perform initial gap assessment

#### **Phase 2: Implementation (Months 1-3)**
- Write policies (15-20 documents)
- Implement technical controls (MFA, encryption, logging)
- Set up vendor risk management
- Configure HR security controls
- Create incident response plan

#### **Phase 3: Evidence Collection (Months 3-9)**
- Daily: MFA checks, access monitoring
- Weekly: Access reviews, vulnerability scans
- Monthly: Training compliance, control testing
- Quarterly: Comprehensive access reviews

#### **Phase 4: Audit Preparation (Months 8-9)**
- Select auditor
- Organize evidence (200-500 pieces)
- Identify and remediate gaps
- Mock audit review

#### **Phase 5: Audit Execution (Weeks 1-3)**
- Submit evidence to auditor
- Answer 50-150 auditor questions
- Conduct walkthrough sessions
- Handle findings and create remediation plans

#### **Phase 6: Post-Audit (Weeks 1-2)**
- Review and approve final report
- Distribute to customers
- Plan next audit cycle

**Our AI system automates 80-90% of this workflow.**

### **2.2 Success Metrics**

| Metric | Traditional | Our System | Improvement |
|--------|-------------|------------|-------------|
| **Time to First Audit** | 6-9 months | 2-3 months | **60% faster** |
| **Evidence Collection Time** | 40 hrs/month | 2 hrs/month | **95% reduction** |
| **Audit Preparation** | 80 hours | 8 hours | **90% reduction** |
| **Auditor Q&A Response** | 4 hours/question | 15 min/question | **94% reduction** |
| **Annual Cost** | $80-120K | $24-36K | **70% savings** |
| **Compliance Coverage** | 70-80% | 95%+ | **20% increase** |

---

## **3. SYSTEM OVERVIEW**

### **3.1 High-Level Architecture**

```
┌────────────────────────────────────────────────────────────────┐
│                         USER LAYER                             │
│  • Web Dashboard (Next.js)                                     │
│  • Mobile App (React Native)                                   │
│  • API for integrations                                        │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                          │
│  • Next.js 14 App Router                                       │
│  • Vercel AI SDK (streaming)                                   │
│  • shadcn/ui components                                        │
│  • Real-time updates via WebSockets                            │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                  API GATEWAY & AUTH LAYER                      │
│  • Next.js API Routes                                          │
│  • Clerk (authentication)                                      │
│  • WorkOS (enterprise SSO)                                     │
│  • Rate limiting (Upstash)                                     │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                  WORKFLOW ORCHESTRATION                        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              TEMPORAL (Durable Workflows)                │ │
│  │  • Handles long-running audits (weeks/months)            │ │
│  │  • Survives crashes and restarts                         │ │
│  │  • Built-in retry and error handling                     │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              ↓                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │           LANGGRAPH (State Machine Control)              │ │
│  │  • Controls high-level workflow phases                   │ │
│  │  • Manages state transitions                             │ │
│  │  • Human-in-the-loop approvals                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              ↓                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              CREWAI (Agent Coordination)                 │ │
│  │  • Manages specialist agents                             │ │
│  │  • Sequential and parallel execution                     │ │
│  │  • Agent memory and context                              │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                    MULTI-AGENT LAYER                           │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  ORCHESTRATOR AGENT                     │  │
│  │  Role: Project manager and coordinator                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                              ↓                                 │
│         ┌────────────────────┴────────────────────┐           │
│         ↓                    ↓                    ↓           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │  DISCOVERY   │    │  FRAMEWORK   │    │  EVIDENCE    │   │
│  │    AGENT     │    │    EXPERT    │    │ COLLECTION   │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   ACCESS     │    │    INFRA     │    │   CHANGE     │   │
│  │   CONTROL    │    │   SECURITY   │    │   MGMT       │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   VENDOR     │    │   POLICY     │    │      HR      │   │
│  │    RISK      │    │  GENERATION  │    │  COMPLIANCE  │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │  INCIDENT    │    │   EVIDENCE   │    │    AUDIT     │   │
│  │  RESPONSE    │    │  MANAGEMENT  │    │ COORDINATOR  │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │  CODE SEC    │    │  INFRA SCAN  │    │  COPILOT     │   │
│  │  SCANNER     │    │    AGENT     │    │   AGENT      │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                                │
│  ┌──────────────┐                                             │
│  │ QUESTIONNAIRE│                                             │
│  │  AUTOMATION  │                                             │
│  └──────────────┘                                             │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│              TRUST PORTAL & NOTIFICATION LAYER                 │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                  PUBLIC TRUST PORTAL                     │ │
│  │  • Shareable compliance page (trust.yourcompany.com)    │ │
│  │  • Public certifications & badges                        │ │
│  │  • Security policies repository                          │ │
│  │  • Real-time compliance posture                          │ │
│  │  • Automated questionnaire responses                     │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              REAL-TIME NOTIFICATION SYSTEM               │ │
│  │  • Slack alerts for compliance gaps                      │ │
│  │  • Email notifications for deadlines                     │ │
│  │  • MS Teams integration                                  │ │
│  │  • PagerDuty for critical issues                         │ │
│  │  • Webhook triggers for custom workflows                 │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                      LLM GATEWAY LAYER                         │
│  • Helicone (caching + monitoring + observability)             │
│  • LiteLLM (multi-provider normalization)                      │
│  • Task-based intelligent routing with failover               │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                      MODEL PROVIDERS                           │
│  • Gemini 2.5 Flash/Pro (PRIMARY - 99.3% cost savings)         │
│    ├─ Flash-Lite: High-volume fast tasks ($0.10/1M)           │
│    ├─ Flash: Vision + general tasks ($0.30/1M)                │
│    └─ Pro: Complex reasoning + code ($1.25/1M)                │
│  • Claude Sonnet 4.5 (FALLBACK - quality-critical tasks)       │
│    └─ Policy generation, complex decisions ($3.00/1M)         │
│                                                                │
│  Cost Impact: $44.59/mo vs $6,075/mo (all-Claude)             │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                    TOOLS & INTEGRATIONS                        │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │            VISION-BASED EVIDENCE COLLECTION              │ │
│  │  • Playwright (browser control)                          │ │
│  │  • Browserbase (managed browsers)                        │ │
│  │  • Claude 3.5 Sonnet (screenshot analysis)               │ │
│  │  • Screenshot storage (S3/R2)                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                  API INTEGRATIONS                        │ │
│  │  • Okta, Google Workspace, Azure AD                      │ │
│  │  • AWS, GCP, Azure                                       │ │
│  │  • GitHub, GitLab                                        │ │
│  │  • JIRA, Linear                                          │ │
│  │  • HR systems (BambooHR, Workday)                        │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                   RESEARCH TOOLS                         │ │
│  │  • Tavily (AI-optimized search)                          │ │
│  │  • Firecrawl (web scraping)                              │ │
│  │  • Composio (250+ integrations)                          │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                  MEMORY & KNOWLEDGE LAYER                      │
│  • Pinecone (vector search - evidence similarity)              │
│  • Postgres (structured data - audit trail)                   │
│  • Redis (caching - LLM responses)                             │
│  • Mem0 (agent memory - context retention)                     │
│  • S3/R2 (object storage - screenshots, documents)             │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                 OBSERVABILITY & MONITORING                     │
│  • LangSmith (agent tracing)                                   │
│  • Helicone (LLM monitoring + caching)                         │
│  • Sentry (error tracking)                                     │
│  • PostHog (product analytics)                                 │
└────────────────────────────────────────────────────────────────┘
```

### **3.2 System Characteristics**

| Characteristic | Design Choice |
|----------------|---------------|
| **Architecture Pattern** | Microservices with agent-based processing |
| **Scalability** | Horizontal scaling of agent workers |
| **Reliability** | Durable workflows with Temporal (survives crashes) |
| **Observability** | Comprehensive tracing and monitoring |
| **Security** | Zero-trust, credential isolation, audit logging |
| **Performance** | Async processing, caching, parallel agents |
| **Maintainability** | Agent isolation, clear boundaries |

---

## **4. MULTI-AGENT ARCHITECTURE**

### **4.1 Agent Design Principles**

1. **Single Responsibility**: Each agent handles one domain
2. **Expertise via Context**: Deep backstory and knowledge sources
3. **Tool Access**: Domain-specific tools only
4. **No Delegation**: Specialist agents don't delegate (orchestrator does)
5. **Stateless Execution**: State managed by LangGraph/Temporal
6. **Idempotent Operations**: Can retry safely

### **4.2 Complete Agent Roster**

#### **Tier 1: Core Orchestration**

```yaml
orchestrator_agent:
  role: "GRC Audit Orchestrator"
  responsibility: "Coordinate entire audit lifecycle"
  can_delegate: true
  manages: "All specialist agents"
  tools:
    - create_project_plan
    - delegate_task
    - check_agent_status
    - aggregate_results
    - identify_blockers
  backstory: |
    Experienced GRC Program Manager with 10+ years managing SOC 2,
    ISO 27001, and HIPAA audits. Expert at breaking down complex
    compliance projects into manageable tasks and ensuring nothing
    falls through the cracks.
```

#### **Tier 2: Discovery & Planning**

```yaml
discovery_agent:
  role: "Infrastructure Discovery Specialist"
  responsibility: "Map company systems and architecture"
  can_delegate: false
  tools:
    - aws_api_scanner
    - gcp_api_scanner
    - azure_api_scanner
    - okta_discovery
    - github_discovery
    - network_mapper
  outputs:
    - system_boundary_document
    - architecture_diagram
    - technology_stack_inventory
  backstory: |
    Cloud security architect with expertise in AWS, GCP, and Azure.
    Expert at identifying system boundaries, data flows, and 
    security architectures. Can quickly map complex infrastructure.

framework_expert_agent:
  role: "Compliance Framework Expert"
  responsibility: "Interpret control requirements and assess gaps"
  can_delegate: false
  knowledge_sources:
    - SOC2_TSC_2017.pdf
    - ISO27001_2022.pdf
    - HIPAA_requirements.pdf
  tools:
    - control_mapper
    - gap_analyzer
    - risk_assessor
  outputs:
    - scope_recommendation
    - gap_assessment_report
    - prioritized_remediation_plan
  backstory: |
    Certified in CISSP, CISA, and ISO 27001. Deep expertise in
    SOC 2, ISO 27001, HIPAA, and PCI DSS. Can interpret complex
    control requirements and assess organizational compliance.
```

#### **Tier 3: Domain Specialists (Evidence Collection)**

```yaml
access_control_agent:
  role: "Identity & Access Management Specialist"
  responsibility: "Verify access controls (CC6.x)"
  can_delegate: false
  controls_covered:
    - CC6.1: MFA enforcement
    - CC6.2: Access reviews
    - CC6.3: Password policies
    - CC6.6: Timely access removal
    - CC6.7: Least privilege
  tools:
    - okta_api_tool
    - google_workspace_tool
    - azure_ad_tool
    - aws_iam_tool
    - gcp_iam_tool
    - playwright_tool
    - vision_analysis_tool
  strategy: "API first, vision fallback"
  evidence_types:
    - mfa_status_screenshots
    - access_review_approvals
    - offboarding_logs
    - privilege_escalation_reviews
  
infrastructure_security_agent:
  role: "Cloud Security Specialist"
  responsibility: "Verify infrastructure controls (CC7.x, CC8.x)"
  controls_covered:
    - CC7.2: Encryption at rest
    - CC7.3: Encryption in transit
    - CC7.4: Logging and monitoring
    - CC8.1: Backup configurations
    - A1.2: Backup testing
  tools:
    - aws_security_scanner
    - gcp_security_scanner
    - azure_security_scanner
    - terraform_analyzer
  evidence_types:
    - encryption_status_reports
    - logging_configurations
    - backup_test_results

change_management_agent:
  role: "DevOps & Change Management Specialist"
  responsibility: "Verify change controls (CC8.1)"
  controls_covered:
    - CC8.1: Change approval process
  tools:
    - github_api_tool
    - gitlab_api_tool
    - ci_cd_analyzer
  evidence_types:
    - pull_request_samples
    - code_review_approvals
    - deployment_logs

vendor_risk_agent:
  role: "Third-Party Risk Specialist"
  responsibility: "Assess vendor risk (CC9.x)"
  controls_covered:
    - CC9.1: Vendor risk assessment
    - CC9.2: Vendor monitoring
  tools:
    - accounting_api_tool
    - sso_discovery_tool
    - web_scraper_tool
    - tavily_search
    - document_downloader
  evidence_types:
    - vendor_inventory
    - vendor_soc2_reports
    - vendor_risk_assessments
    - vendor_contracts

hr_compliance_agent:
  role: "HR Security & Training Specialist"
  responsibility: "Verify HR controls"
  controls_covered:
    - Background checks
    - Security training
    - Onboarding/offboarding
  tools:
    - hr_system_api_tool
    - training_platform_tool
    - docusign_tool
  evidence_types:
    - background_check_completions
    - training_completion_records
    - onboarding_checklists

policy_generation_agent:
  role: "Policy Documentation Specialist"
  responsibility: "Generate compliance policies"
  outputs:
    - information_security_policy
    - access_control_policy
    - incident_response_plan
    - change_management_policy
    - vendor_management_policy
    - 15+ other policies
  tools:
    - policy_template_engine
    - document_generator
    - company_context_analyzer
  
incident_response_agent:
  role: "Security Incident Specialist"
  responsibility: "Track and verify incident response"
  controls_covered:
    - CC7.2: Incident detection
    - CC7.3: Incident response
  tools:
    - jira_api_tool
    - pagerduty_api_tool
    - incident_analyzer

code_security_scanner_agent:
  role: "Application Security Specialist"
  responsibility: "Scan code for security vulnerabilities and compliance issues"
  controls_covered:
    - CC7.1: Secure development practices
    - CC8.1: Code review and approval
    - A1.3: Security testing in CI/CD
  tools:
    - github_api_tool
    - gitlab_api_tool
    - code_analyzer_tool
    - sast_scanner
    - dependency_checker
    - llm_code_analyzer
  capabilities:
    - Scan every PR for security issues
    - Detect hardcoded secrets
    - Identify vulnerable dependencies
    - Check for SQL injection vulnerabilities
    - Detect XSS vulnerabilities
    - Verify secure authentication patterns
    - Generate automated fix PRs
    - Add security comments to PRs
  evidence_types:
    - code_scan_reports
    - vulnerability_remediation_records
    - pr_security_approvals
    - dependency_audit_logs
  backstory: |
    Application security engineer with expertise in SAST, DAST, and
    secure coding practices. Expert at identifying OWASP Top 10
    vulnerabilities and generating automated fixes.

infrastructure_scanner_agent:
  role: "Continuous Infrastructure Monitoring Specialist"
  responsibility: "Daily automated scanning of cloud infrastructure"
  controls_covered:
    - CC7.2: Continuous monitoring
    - CC6.6: Security configuration management
    - A1.1: Continuous compliance validation
  tools:
    - aws_config_tool
    - gcp_security_command_center
    - azure_security_center
    - terraform_drift_detector
    - misconfig_scanner
  capabilities:
    - Daily infrastructure scans
    - Real-time misconfiguration alerts
    - Drift detection from IaC
    - Automated remediation suggestions
    - Compliance posture scoring
    - Resource inventory tracking
  evidence_types:
    - daily_scan_reports
    - misconfiguration_alerts
    - remediation_tracking
    - compliance_score_history
  backstory: |
    Cloud security architect specializing in continuous compliance
    monitoring and automated security validation across AWS, GCP,
    and Azure environments.

compliance_copilot_agent:
  role: "Interactive Compliance Assistant"
  responsibility: "Real-time compliance guidance and Q&A"
  can_delegate: false
  tools:
    - policy_search_tool
    - control_explainer_tool
    - framework_mapper_tool
    - evidence_finder_tool
    - remediation_suggester_tool
  capabilities:
    - Answer compliance questions instantly
    - Explain control requirements in plain English
    - Suggest remediation steps for gaps
    - Generate code patches for security issues
    - Link to relevant documentation
    - Provide audit preparation guidance
    - Assist with auditor questions
  interface_methods:
    - chat_interface
    - slack_integration
    - email_integration
    - api_endpoint
  backstory: |
    Compliance consultant with 15+ years helping companies navigate
    complex regulatory requirements. Expert at translating technical
    security controls into business language and providing actionable
    guidance.

questionnaire_automation_agent:
  role: "Security Questionnaire Specialist"
  responsibility: "Auto-fill vendor security questionnaires"
  can_delegate: false
  tools:
    - policy_database_tool
    - evidence_retriever_tool
    - questionnaire_parser_tool
    - answer_generator_tool
  knowledge_sources:
    - company_policies
    - security_documentation
    - past_questionnaire_responses
    - control_evidence
  capabilities:
    - Parse security questionnaires (Excel, Word, PDF, web forms)
    - Map questions to controls and evidence
    - Auto-generate answers from policies
    - Include supporting evidence links
    - Maintain response library
    - Learn from approved responses
    - Handle VSA, SIG, CAIQ questionnaires
  evidence_types:
    - completed_questionnaires
    - questionnaire_response_library
    - customer_security_reviews
  backstory: |
    Security program manager with extensive experience completing
    vendor security assessments. Expert at mapping questionnaire
    questions to evidence and generating comprehensive responses.
```

#### **Tier 4: Management & Coordination**

```yaml
evidence_management_agent:
  role: "Evidence Management Specialist"
  responsibility: "Organize and validate all evidence"
  tasks:
    - Collect evidence from all agents
    - Validate completeness
    - Organize by control domain
    - Identify gaps
    - Generate evidence index
    - Package for auditor
  tools:
    - evidence_validator
    - completeness_checker
    - evidence_packager
    - gap_identifier

audit_coordinator_agent:
  role: "Audit Liaison Specialist"
  responsibility: "Interface with external auditors"
  tasks:
    - Auditor selection
    - Evidence submission
    - Question answering
    - Findings response
    - Report review
  tools:
    - auditor_portal_uploader
    - question_answerer
    - finding_analyzer

remediation_tracking_agent:
  role: "Remediation Project Manager"
  responsibility: "Track gap remediation"
  tasks:
    - Monitor remediation progress
    - Alert on delays
    - Generate status reports
  tools:
    - jira_tracker
    - progress_monitor
    - reporting_generator
```

### **4.3 Agent Execution Patterns**

#### **Sequential Execution**
```
Discovery Agent → Framework Expert → [Parallel Domain Agents]
```

#### **Parallel Execution**
```
Access Control │
Infrastructure │──→ All run simultaneously
Change Mgmt    │
Vendor Risk    │
HR Compliance  │
Policy Gen     │
```

#### **Hierarchical Execution**
```
Orchestrator
├── Delegates to Discovery
├── Waits for completion
├── Delegates to Framework Expert
├── Waits for completion
└── Delegates to all domain agents in parallel
```

### **4.4 Trust Portal & Notification Systems**

#### **4.4.1 Public Trust Portal**

**Purpose:** Enable companies to share compliance status publicly to win customer trust and accelerate enterprise sales

**Key Features:**

```yaml
trust_portal:
  public_url: "trust.yourcompany.com" or "yourcompany.com/trust"
  
  components:
    security_overview:
      - Compliance certifications (SOC 2, ISO 27001, etc.)
      - Current compliance posture score
      - Last audit date and next audit date
      - Certification badges and logos
      
    public_certifications:
      - SOC 2 Type II report (redacted)
      - ISO 27001 certificate
      - HIPAA attestation
      - Download PDF reports
      
    security_policies:
      - Information Security Policy
      - Privacy Policy  
      - Data Processing Agreement (DPA)
      - Incident Response Policy
      - Business Continuity Plan
      
    ai_questionnaire_responder:
      - Embedded chatbot for security questions
      - Auto-responds using company policies
      - Links to relevant evidence
      - Handles VSA, SIG, CAIQ questions
      - Maintains conversation history
      
    integrations:
      - Embed trust portal widget in sales site
      - Share via unique link with prospects
      - Track visitor analytics
      - Integrate with CRM (Salesforce, HubSpot)
      
  customization:
    - Company branding (logo, colors)
    - Custom domain
    - Select which certifications to display
    - Control policy visibility
    - Enable/disable AI responder
    
  security:
    - Public pages (no authentication)
    - Rate limiting on AI responder
    - No sensitive evidence exposed
    - Audit trail of access
    - DDoS protection
```

**Technical Implementation:**

```typescript
// Trust Portal Stack
trust_portal_stack:
  framework: "Next.js standalone app"
  hosting: "Vercel Edge"
  database: "Postgres (read replicas)"
  cdn: "Cloudflare"
  ai_chatbot: "Vercel AI SDK + Claude"
  analytics: "PostHog"
  
// Example Trust Portal Structure
pages:
  - /trust                    # Main trust page
  - /trust/certifications     # Compliance certs
  - /trust/policies           # Security policies
  - /trust/security           # Security overview
  - /trust/ask                # AI questionnaire bot
  
// AI Questionnaire Responder
ai_responder:
  trigger: "User asks security question"
  process:
    1. Parse question using Claude
    2. Search policy database (RAG)
    3. Search evidence vault
    4. Generate response with citations
    5. Log conversation for review
  response_time: "<3 seconds"
  accuracy_target: "95%+"
```

#### **4.4.2 Real-Time Notification & Alert System**

**Purpose:** Proactive alerts for compliance gaps, deadlines, and critical issues

**Alert Types:**

```yaml
alert_categories:
  
  critical_alerts:
    triggers:
      - Critical control failure detected
      - Data breach or security incident
      - Audit evidence gap with <7 days to audit
      - Infrastructure misconfiguration (critical)
      - Failed access review
    delivery:
      - PagerDuty (on-call engineer)
      - Slack (critical channel)
      - Email (compliance team)
      - SMS (if enabled)
    response_time: "Immediate"
    
  high_priority_alerts:
    triggers:
      - Evidence collection failure
      - Control testing overdue
      - Vendor security questionnaire received
      - Infrastructure misconfiguration (high)
      - Training compliance slipping
    delivery:
      - Slack (compliance channel)
      - Email (daily digest)
      - In-app notification
    response_time: "Within 4 hours"
    
  medium_priority_alerts:
    triggers:
      - Access review reminder (1 week out)
      - Policy update required
      - Vendor SOC 2 report expiring soon
      - Training deadline approaching
    delivery:
      - Email (weekly digest)
      - In-app notification
    response_time: "Within 24 hours"
    
  informational_alerts:
    triggers:
      - Evidence successfully collected
      - Control test passed
      - Policy published
      - Audit milestone completed
    delivery:
      - In-app notification
      - Email (weekly digest)
```

**Integration Channels:**

```yaml
notification_channels:
  
  slack:
    features:
      - Dedicated #compliance-alerts channel
      - @mention specific users
      - Interactive buttons (Acknowledge, Snooze, Resolve)
      - Thread conversations for context
      - Daily/weekly compliance digest
    implementation:
      - Slack App with OAuth
      - Webhook for real-time posting
      - Slack Commands (/compliance status)
      
  microsoft_teams:
    features:
      - Dedicated compliance team
      - Adaptive cards with action buttons
      - Bot for Q&A
      - Integration with Planner for tasks
    implementation:
      - Teams App via Azure AD
      - Webhooks for notifications
      
  email:
    features:
      - Smart digests (daily/weekly)
      - Grouped by priority
      - Action links
      - Unsubscribe management
    implementation:
      - Resend for email delivery
      - Template system
      - Open/click tracking
      
  pagerduty:
    features:
      - Critical incidents only
      - On-call rotation integration
      - Escalation policies
      - Incident timelines
    implementation:
      - PagerDuty API integration
      - Custom incident rules
      
  webhooks:
    features:
      - Custom integrations
      - Real-time event streaming
      - Configurable filters
      - Retry mechanism
    implementation:
      - Webhook registry
      - Event queue (Redis)
      - Delivery tracking
```

**Smart Notification Engine:**

```python
class SmartNotificationEngine:
    """
    Intelligent notification system that:
    - Prevents alert fatigue
    - Batches similar alerts
    - Respects user preferences
    - Learns from user behavior
    """
    
    def should_send_alert(self, alert: Alert, user: User) -> bool:
        """
        Determine if alert should be sent based on:
        - Alert frequency limits
        - User notification preferences
        - Time of day
        - Previous alert acknowledgment rate
        """
        
        # Prevent alert fatigue: max 5 critical alerts per day
        if self.get_critical_alert_count(user, today) >= 5:
            return False
            
        # Respect quiet hours
        if self.is_quiet_hours(user):
            return False
            
        # Batch similar alerts
        if self.has_similar_recent_alert(alert, user, window=timedelta(hours=1)):
            self.add_to_batch(alert)
            return False
            
        # Check user acknowledgment rate
        # If user never acknowledges, reduce frequency
        if self.get_acknowledgment_rate(user) < 0.2:
            self.reduce_frequency(user)
            return self.sample_alert(0.5)  # Only send 50% of alerts
            
        return True
    
    def send_alert(self, alert: Alert, channels: List[Channel]):
        """
        Send alert to multiple channels with:
        - Consistent formatting
        - Action buttons
        - Context links
        - Tracking metadata
        """
        for channel in channels:
            formatted_message = self.format_for_channel(alert, channel)
            self.deliver(formatted_message, channel)
            self.track_delivery(alert, channel)
```

**Alert Dashboard:**

```yaml
alert_dashboard:
  location: "/dashboard/alerts"
  features:
    - Real-time alert feed
    - Filter by severity/category
    - Acknowledge/snooze/resolve
    - Alert analytics and trends
    - Response time metrics
    - Configure notification preferences
  
  analytics:
    metrics:
      - Total alerts by severity
      - Mean time to acknowledge (MTTA)
      - Mean time to resolve (MTTR)
      - Alert fatigue indicators
      - Most common alert types
      - Response rate by user
```

#### **4.4.3 Automated PR Security Fixes**

**Purpose:** Automatically generate and submit Pull Requests to fix security issues

```yaml
automated_pr_system:
  
  triggers:
    - Hardcoded secret detected
    - Vulnerable dependency identified
    - SQL injection vulnerability found
    - Missing security headers
    - Insecure authentication pattern
    
  process:
    1. Code scanner detects issue
    2. LLM analyzes vulnerability
    3. LLM generates fix
    4. Create feature branch
    5. Apply fix
    6. Run tests
    7. Submit PR with explanation
    8. Request review from security team
    
  pr_template:
    title: "🔒 Security Fix: [Vulnerability Type]"
    body: |
      ## Security Issue
      [Description of vulnerability]
      
      ## Root Cause
      [Why this happened]
      
      ## Fix Applied
      [What was changed]
      
      ## Testing
      - [ ] Unit tests pass
      - [ ] Security scan passes
      - [ ] Manual verification complete
      
      ## References
      - [CVE or OWASP reference]
      
      **Auto-generated by GRC Platform - Code Security Scanner**
    
  safety_checks:
    - Never auto-merge security PRs
    - Always require human review
    - Run full test suite
    - Flag breaking changes
    - Notify security team
```

---

## **5. TECHNOLOGY STACK**

### **5.1 Implementation Status Overview**

**Legend:**
- ✅ **IMPLEMENTED** - Currently in production use
- ⏳ **PLANNED** - Architecture designed, awaiting implementation
- 🔄 **PARTIAL** - Some components implemented, others planned

---

### **5.2 Complete Stack by Layer**

```yaml
# FRONTEND LAYER ✅ IMPLEMENTED
frontend:
  framework: "Next.js 14 (App Router)" # ✅
  ui_library: "shadcn/ui + Tailwind CSS" # ⏳ Planned
  streaming: "Vercel AI SDK" # ⏳ Planned
  state_management: "React Context + Zustand" # ⏳ Planned
  charts: "Recharts + Tremor" # ⏳ Planned
  hosting: "Vercel" # ✅

# AUTHENTICATION & AUTHORIZATION 🔄 PARTIAL
auth:
  primary: "Clerk" # ✅ IMPLEMENTED (clerkId in User model)
  enterprise_sso: "WorkOS" # ⏳ PLANNED (not yet implemented)
  session_management: "Clerk Sessions" # ✅ IMPLEMENTED
  rbac: "Custom middleware" # ⏳ PLANNED

# API LAYER  🔄 PARTIAL
api:
  framework: "Next.js API Routes" # ⏳ Planned
  validation: "Zod" # ⏳ Planned
  rate_limiting: "Upstash Rate Limit" # ⏳ Planned
  api_docs: "OpenAPI + Swagger" # ⏳ Planned

# ORCHESTRATION LAYER ⏳ PLANNED
orchestration:
  durable_workflows: "Temporal Cloud" # ⏳ Not yet implemented
  state_machine: "LangGraph" # ⏳ Not yet implemented
  agent_framework: "CrewAI" # ⏳ Not yet implemented
  async_jobs: "Inngest" # ⏳ Not yet implemented
  current_approach: "Direct Prisma repository pattern" # ✅ Phase 2 complete

# LLM LAYER ✅ IMPLEMENTED
llm:
  # ✅ ACTUAL IMPLEMENTATION (99.3% cost savings)
  primary_model: "Gemini 2.5 (Flash-Lite/Flash/Pro)" # ✅
  backup_model: "Claude Sonnet 4.5" # ✅
  task_routing: "Intelligent task-based routing" # ✅
  gateway: "Helicone" # ✅ (caching + observability)
  normalization: "LiteLLM" # ✅

  # Cost breakdown:
  # - Flash-Lite: $0.10/1M tokens (high-volume tasks)
  # - Flash: $0.30/1M tokens (vision + general)
  # - Pro: $1.25/1M tokens (code analysis)
  # - Claude: $3.00/1M tokens (quality-critical only)
  # Total: $44.59/mo vs $6,075/mo (all-Claude)

# BROWSER AUTOMATION ⏳ PLANNED
browser_automation:
  control: "Playwright" # ⏳ Planned for vision evidence
  managed_browsers: "Browserbase" # ⏳ Planned
  natural_language: "MultiOn (optional)" # ⏳ Planned

# DOCUMENT PROCESSING ⏳ PLANNED
documents:
  parser: "Unstructured.io (open-source)" # ⏳ Planned
  complex_pdfs: "LlamaParse" # ⏳ Planned
  ocr: "Tesseract + Claude Vision" # ⏳ Planned

# SEARCH & RESEARCH ⏳ PLANNED
search:
  ai_search: "Tavily" # ⏳ Planned
  web_scraping: "Firecrawl" # ⏳ Planned
  integrations: "Composio" # ⏳ Planned

# DATA LAYER 🔄 PARTIAL
databases:
  relational: "Postgres (Neon)" # ✅ IMPLEMENTED
    # Connection: ep-cool-grass-ahfx8i8o-pooler.c-3.us-east-1.aws.neon.tech
    # ORM: Prisma v5.22.0
    # Repositories: BaseRepository + 4 specialized repos (Phase 2 complete)

  vector: "Pinecone" # ⏳ PLANNED (for RAG/Compliance Copilot)
  cache: "Upstash Redis" # ⏳ PLANNED (for performance optimization)
  object_storage: "Cloudflare R2" # ⏳ PLANNED (for evidence files)
  agent_memory: "Mem0" # ⏳ PLANNED

# SECURITY 🔄 PARTIAL
security:
  secrets: ".env files" # ✅ CURRENT (Doppler planned)
  secrets_planned: "Doppler" # ⏳ PLANNED
  prompt_injection: "Rebuff" # ⏳ PLANNED
  pii_detection: "LLM Guard" # ⏳ PLANNED

# OBSERVABILITY
observability:
  agent_tracing: "LangSmith"
  llm_monitoring: "Helicone"
  error_tracking: "Sentry"
  logs: "Better Stack"
  analytics: "PostHog"

# NOTIFICATIONS & ALERTS
notifications:
  slack: "Slack SDK"
  teams: "Microsoft Teams SDK"
  email: "Resend"
  pagerduty: "PagerDuty API"
  webhooks: "Custom webhook system"
  push: "OneSignal (mobile)"

# TRUST PORTAL
trust_portal:
  framework: "Next.js standalone"
  hosting: "Vercel Edge"
  chatbot: "Vercel AI SDK + Claude"
  cdn: "Cloudflare"
  analytics: "PostHog"

# CODE SECURITY
code_security:
  sast: "Semgrep"
  dependency_scanner: "Snyk API"
  secret_scanner: "TruffleHog"
  llm_analyzer: "Claude for code analysis"
  
# INFRASTRUCTURE SCANNING
infrastructure_scanning:
  aws: "AWS Config + Security Hub"
  gcp: "GCP Security Command Center"
  azure: "Azure Security Center"
  kubernetes: "Kubescape"
  terraform: "Checkov"

# INFRASTRUCTURE
infrastructure:
  frontend_hosting: "Vercel"
  agent_workers: "Modal"
  databases: "Railway"
  browsers: "Browserbase"
  cdn: "Cloudflare"
```

### **5.2 Cost Breakdown (Production)**

| Component | Provider | Monthly Cost | Notes |
|-----------|----------|--------------|-------|
| **Frontend** | Vercel | $20 | Pro plan |
| **Auth** | Clerk | $25 | Up to 5K MAU |
| **Orchestration** | Temporal Cloud | $25 | Starter plan |
| **LLM Primary** | Anthropic | $500-1000 | Claude usage |
| **LLM Backup** | OpenAI | $200-400 | GPT-4o usage |
| **LLM Gateway** | Helicone | $50 | Pro plan |
| **Browser Automation** | Browserbase | $200 | Scale plan |
| **Vector DB** | Pinecone | $70 | Starter pod |
| **Postgres** | Neon | $19 | Pro plan |
| **Redis** | Upstash | $20 | Pay-as-you-go |
| **Object Storage** | Cloudflare R2 | $15 | Pay-as-you-go |
| **Observability** | LangSmith | $50 | Dev plan |
| **Error Tracking** | Sentry | $26 | Team plan |
| **Agent Workers** | Modal | $100-200 | Pay-as-you-go |
| **Search** | Tavily | $20 | API usage |
| **Integrations** | Composio | $29 | Pro plan |
| **Secrets** | Doppler | $0 | Free tier |
| **Notifications** | Slack + Resend | $30 | Email & Slack |
| **Code Security** | Semgrep | $0 | Open source |
| **Dependency Scanning** | Snyk | $50 | Team plan |
| **Infrastructure Scanning** | Native cloud tools | $0 | Included in cloud |
| **Trust Portal** | Vercel (included) | $0 | Same Vercel account |
| **TOTAL** | | **$1,498-1,898** | **Per month** |

### **5.3 Scaling Economics**

| Customer Count | Infrastructure Cost | Cost per Customer | Margin |
|----------------|-------------------|-------------------|---------|
| 10 customers | $1,500/mo | $150 | At $2K/mo → 92% |
| 50 customers | $3,000/mo | $60 | At $2K/mo → 97% |
| 100 customers | $5,000/mo | $50 | At $2K/mo → 97.5% |

---

## **6. ORCHESTRATION LAYER**

### **6.1 Three-Layer Orchestration**

#### **Layer 1: Temporal (Durable Workflows)**

**Purpose:** Handle long-running audit workflows that span weeks/months

```python
import asyncio
from temporalio import workflow
from temporalio.common import RetryPolicy
from datetime import timedelta

@workflow.defn
class SOC2AuditWorkflow:
    """
    Durable workflow for complete SOC 2 audit
    Survives crashes, restarts, and long delays
    """
    
    @workflow.run
    async def run(self, company_id: str) -> dict:
        """
        Execute complete audit workflow
        This workflow can run for 6+ months
        """
        
        # Step 1: Discovery (2-3 days)
        discovery_result = await workflow.execute_activity(
            activity=run_discovery_agent,
            arg=company_id,
            start_to_close_timeout=timedelta(days=3),
            retry_policy=RetryPolicy(
                maximum_attempts=3,
                initial_interval=timedelta(seconds=1),
                backoff_coefficient=2.0
            )
        )
        
        # Step 2: Framework expert assessment (1 week)
        gap_assessment = await workflow.execute_activity(
            activity=run_framework_expert,
            arg=discovery_result,
            start_to_close_timeout=timedelta(weeks=1)
        )
        
        # Step 3: Wait for human approval
        # Workflow pauses here until signal received
        await workflow.wait_condition(
            lambda: self.gap_assessment_approved,
            timeout=timedelta(days=14)
        )
        
        if not self.gap_assessment_approved:
            return {"status": "cancelled", "reason": "User did not approve"}
        
        # Step 4: Parallel implementation (1-3 months)
        implementation_results = await asyncio.gather(
            workflow.execute_activity(
                run_access_control_agent,
                company_id,
                start_to_close_timeout=timedelta(months=3)
            ),
            workflow.execute_activity(
                run_infrastructure_agent,
                company_id,
                start_to_close_timeout=timedelta(months=3)
            ),
            workflow.execute_activity(
                run_change_mgmt_agent,
                company_id,
                start_to_close_timeout=timedelta(months=3)
            ),
            # ... more agents
        )
        
        # Step 5: Evidence collection period (3-6 months)
        # Wait for evidence collection to complete
        evidence_collection = await workflow.execute_activity(
            monitor_evidence_collection,
            company_id,
            start_to_close_timeout=timedelta(months=6)
        )
        
        # Step 6: Audit preparation
        audit_package = await workflow.execute_activity(
            prepare_audit_package,
            company_id,
            start_to_close_timeout=timedelta(days=7)
        )
        
        # Step 7: Auditor interaction (2-3 weeks)
        audit_result = await workflow.execute_activity(
            coordinate_with_auditor,
            audit_package,
            start_to_close_timeout=timedelta(weeks=4)
        )
        
        return {
            "status": "complete",
            "audit_result": audit_result,
            "duration_days": workflow.info().get_current_history_length()
        }
    
    @workflow.signal
    def approve_gap_assessment(self):
        """Signal to approve and continue"""
        self.gap_assessment_approved = True
```

**Key Features:**
- ✅ Survives server crashes
- ✅ Can pause for days/weeks
- ✅ Built-in retry logic
- ✅ Human-in-the-loop signals
- ✅ Activity versioning
- ✅ Audit trail of all executions

---

#### **Layer 2: LangGraph (State Machine)**

**Purpose:** Control high-level workflow logic and state transitions

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, Sequence
import operator

class AuditState(TypedDict):
    """Shared state across all agents"""
    
    # Company info
    company_id: str
    company_name: str
    
    # Discovery phase
    systems_discovered: dict
    tech_stack: list
    
    # Framework phase
    audit_type: str  # "Type II"
    trust_criteria: list  # ["Security", "Availability"]
    gaps_identified: list
    
    # Implementation phase
    controls_implemented: dict
    
    # Evidence collection
    evidence: dict  # Keyed by control ID
    evidence_gaps: list
    
    # Current phase
    phase: str
    progress_percentage: int
    
    # Issues
    blockers: list
    warnings: list

def create_audit_state_machine():
    """
    Creates LangGraph state machine for audit workflow
    """
    
    workflow = StateGraph(AuditState)
    
    # Define nodes
    workflow.add_node("initialize", initialize_audit)
    workflow.add_node("discovery", run_discovery_phase)
    workflow.add_node("framework_assessment", run_framework_phase)
    workflow.add_node("check_gaps", check_if_gaps_acceptable)
    workflow.add_node("implementation", run_implementation_phase)
    workflow.add_node("evidence_collection", run_evidence_phase)
    workflow.add_node("audit_prep", prepare_for_audit)
    workflow.add_node("human_review", get_human_approval)
    
    # Define edges
    workflow.set_entry_point("initialize")
    workflow.add_edge("initialize", "discovery")
    workflow.add_edge("discovery", "framework_assessment")
    workflow.add_edge("framework_assessment", "check_gaps")
    
    # Conditional edge
    workflow.add_conditional_edges(
        "check_gaps",
        should_proceed_with_implementation,
        {
            "proceed": "implementation",
            "too_many_gaps": "human_review",
            "ready_for_audit": "evidence_collection"
        }
    )
    
    workflow.add_edge("implementation", "evidence_collection")
    workflow.add_edge("evidence_collection", "audit_prep")
    
    # Another conditional
    workflow.add_conditional_edges(
        "audit_prep",
        is_ready_for_audit,
        {
            "ready": END,
            "needs_review": "human_review"
        }
    )
    
    workflow.add_edge("human_review", END)
    
    return workflow.compile()

def run_discovery_phase(state: AuditState) -> AuditState:
    """
    Execute discovery agent
    """
    from crewai import Crew
    
    # Create discovery crew
    crew = Crew(
        agents=[discovery_agent],
        tasks=[discovery_task],
        verbose=True
    )
    
    result = crew.kickoff()
    
    # Update state
    state['systems_discovered'] = result['systems']
    state['tech_stack'] = result['tech_stack']
    state['phase'] = 'framework_assessment'
    state['progress_percentage'] = 15
    
    return state

def should_proceed_with_implementation(state: AuditState) -> str:
    """
    Decide if gaps are acceptable
    """
    critical_gaps = [g for g in state['gaps_identified'] if g['severity'] == 'critical']
    
    if len(critical_gaps) > 10:
        return "too_many_gaps"
    elif len(state['gaps_identified']) == 0:
        return "ready_for_audit"
    else:
        return "proceed"
```

---

#### **Layer 3: CrewAI (Agent Management)**

**Purpose:** Manage individual agents and their collaboration

```python
from crewai import Agent, Task, Crew, Process
from langchain_anthropic import ChatAnthropic

class GRCAgentSystem:
    """
    CrewAI-based multi-agent system for GRC automation
    """
    
    def __init__(self):
        # Initialize LLM
        self.llm = ChatAnthropic(
            model="claude-sonnet-4-20250514",
            temperature=0.1
        )
        
        # Create all agents
        self.agents = self._create_agents()
    
    def _create_agents(self) -> dict:
        """Create all specialist agents"""
        
        return {
            'discovery': Agent(
                role='Infrastructure Discovery Specialist',
                goal='Map company infrastructure and identify all systems',
                backstory="""You are a cloud security architect with 10 years
                of experience. You can quickly identify system boundaries, 
                data flows, and technology stacks across AWS, GCP, and Azure.""",
                llm=self.llm,
                tools=[
                    AWSDiscoveryTool(),
                    GCPDiscoveryTool(),
                    AzureDiscoveryTool(),
                    OktaDiscoveryTool()
                ],
                verbose=True,
                allow_delegation=False
            ),
            
            'framework_expert': Agent(
                role='SOC 2 Compliance Expert',
                goal='Assess compliance gaps and recommend remediation',
                backstory="""You are a CISSP and CISA certified compliance 
                expert with deep knowledge of SOC 2, ISO 27001, and HIPAA. 
                You have led over 200 audits.""",
                llm=self.llm,
                tools=[
                    ControlMapperTool(),
                    GapAnalyzerTool()
                ],
                verbose=True,
                allow_delegation=False
            ),
            
            'access_control': Agent(
                role='Identity & Access Management Specialist',
                goal='Verify all access control measures are properly configured',
                backstory="""You are an IAM expert specializing in identity 
                providers like Okta, Azure AD, and Google Workspace. You 
                understand MFA, RBAC, and least privilege principles.""",
                llm=self.llm,
                tools=[
                    OktaTool(),
                    GoogleWorkspaceTool(),
                    AzureADTool(),
                    PlaywrightTool(),
                    VisionAnalysisTool()
                ],
                verbose=True,
                allow_delegation=False
            ),
            
            'infrastructure': Agent(
                role='Cloud Security Specialist',
                goal='Validate cloud infrastructure security controls',
                backstory="""You are a certified cloud security professional 
                (CCSP) with expertise in AWS, GCP, and Azure. You understand 
                encryption, logging, monitoring, and backup best practices.""",
                llm=self.llm,
                tools=[
                    AWSSecurityTool(),
                    GCPSecurityTool(),
                    AzureSecurityTool()
                ],
                verbose=True,
                allow_delegation=False
            ),
            
            'change_management': Agent(
                role='DevOps & Change Management Specialist',
                goal='Verify change control processes are followed',
                backstory="""You are a DevOps engineer with deep understanding 
                of CI/CD pipelines, code review processes, and deployment 
                controls. You've worked with GitHub, GitLab, and Jenkins.""",
                llm=self.llm,
                tools=[
                    GitHubTool(),
                    GitLabTool(),
                    CICDAnalyzerTool()
                ],
                verbose=True,
                allow_delegation=False
            ),
            
            'vendor_risk': Agent(
                role='Third-Party Risk Specialist',
                goal='Assess and monitor vendor security risks',
                backstory="""You are a vendor risk management expert who has 
                reviewed hundreds of vendor security questionnaires and SOC 2 
                reports. You understand materiality and risk assessment.""",
                llm=self.llm,
                tools=[
                    TavilySearchTool(),
                    WebScraperTool(),
                    DocumentDownloaderTool()
                ],
                verbose=True,
                allow_delegation=False
            ),
            
            'hr_compliance': Agent(
                role='HR Security & Training Specialist',
                goal='Verify HR security controls and training compliance',
                backstory="""You are an HR technology specialist who understands 
                background checks, security training requirements, and employee 
                lifecycle management from a security perspective.""",
                llm=self.llm,
                tools=[
                    HRSystemTool(),
                    TrainingPlatformTool(),
                    DocuSignTool()
                ],
                verbose=True,
                allow_delegation=False
            ),
            
            'policy_generation': Agent(
                role='Policy Documentation Specialist',
                goal='Generate comprehensive security policies',
                backstory="""You are a technical writer specializing in 
                information security policies. You've written policies for 
                dozens of companies across various compliance frameworks.""",
                llm=self.llm,
                tools=[
                    PolicyTemplateEngine(),
                    DocumentGenerator()
                ],
                verbose=True,
                allow_delegation=False
            ),
            
            'evidence_management': Agent(
                role='Evidence Management Specialist',
                goal='Organize and validate all audit evidence',
                backstory="""You are a meticulous evidence coordinator who has 
                prepared evidence packages for hundreds of audits. You understand 
                what auditors need and how to organize it efficiently.""",
                llm=self.llm,
                tools=[
                    EvidenceValidator(),
                    CompletenessChecker(),
                    EvidencePackager()
                ],
                verbose=True,
                allow_delegation=False
            ),
            
            'orchestrator': Agent(
                role='GRC Audit Orchestrator',
                goal='Coordinate all agents to complete the audit efficiently',
                backstory="""You are a seasoned GRC Program Manager who has 
                managed over 100 compliance audits. You know how to break down 
                complex projects, delegate work, identify blockers, and keep 
                everything on track.""",
                llm=self.llm,
                tools=[
                    DelegationTool(),
                    StatusCheckerTool(),
                    AggregatorTool()
                ],
                verbose=True,
                allow_delegation=True
            )
        }
    
    def create_discovery_crew(self, company_id: str) -> Crew:
        """
        Create a crew for infrastructure discovery
        """
        discovery_task = Task(
            description=f"""
            Perform complete infrastructure discovery for company {company_id}.
            
            Your tasks:
            1. Scan AWS accounts for all resources (EC2, RDS, S3, etc.)
            2. Scan GCP projects for all resources
            3. Scan Azure subscriptions for all resources
            4. Identify identity providers (Okta, Google Workspace, Azure AD)
            5. Discover code repositories (GitHub, GitLab)
            6. Map network architecture
            7. Create system boundary document
            8. Generate technology stack inventory
            
            Output: Complete infrastructure map with all systems documented
            """,
            agent=self.agents['discovery'],
            expected_output="System boundary document + architecture diagram"
        )
        
        return Crew(
            agents=[self.agents['discovery']],
            tasks=[discovery_task],
            process=Process.sequential,
            verbose=True
        )
    
    def create_access_control_crew(self, company_id: str) -> Crew:
        """
        Create a crew for access control verification
        """
        mfa_task = Task(
            description="""
            Verify MFA enforcement across all systems (CC6.1).
            
            Check:
            1. Okta MFA policy - must be enforced for all users
            2. Google Workspace 2FA - must be mandatory
            3. Azure AD MFA - conditional access policies
            4. AWS console MFA - all users must have MFA
            5. GitHub 2FA - organization enforcement
            
            Use API calls first, fallback to vision-based verification.
            Take screenshots as evidence.
            """,
            agent=self.agents['access_control'],
            expected_output="MFA verification report with evidence"
        )
        
        access_review_task = Task(
            description="""
            Verify access review process (CC6.2).
            
            Check:
            1. Quarterly access reviews are performed
            2. Reviews are documented and approved
            3. Excessive access is removed
            4. Review process is formalized
            
            Collect evidence of last 2 access reviews.
            """,
            agent=self.agents['access_control'],
            expected_output="Access review evidence package"
        )
        
        return Crew(
            agents=[self.agents['access_control']],
            tasks=[mfa_task, access_review_task],
            process=Process.sequential,
            verbose=True
        )
    
    def create_parallel_evidence_collection_crew(self, company_id: str) -> Crew:
        """
        Create a crew that runs multiple agents in parallel
        """
        return Crew(
            agents=[
                self.agents['access_control'],
                self.agents['infrastructure'],
                self.agents['change_management'],
                self.agents['vendor_risk'],
                self.agents['hr_compliance']
            ],
            tasks=[
                # Each agent gets its own task
                # ... (tasks defined elsewhere)
            ],
            process=Process.parallel,  # Run all agents simultaneously
            verbose=True
        )
    
    def run_complete_audit(self, company_id: str):
        """
        Execute complete audit workflow using orchestrator
        """
        # Create orchestrator task
        orchestrator_task = Task(
            description=f"""
            Coordinate a complete SOC 2 Type II audit for company {company_id}.
            
            You must:
            1. Run discovery agent first
            2. Wait for discovery to complete
            3. Run framework expert to assess gaps
            4. Wait for human approval of gap assessment
            5. Run all domain agents in parallel:
               - Access Control Agent
               - Infrastructure Security Agent
               - Change Management Agent
               - Vendor Risk Agent
               - HR Compliance Agent
               - Policy Generation Agent
            6. Monitor progress and identify blockers
            7. Aggregate all results
            8. Run evidence management agent
            9. Prepare final audit package
            
            Keep user updated on progress throughout.
            """,
            agent=self.agents['orchestrator'],
            expected_output="Complete audit package ready for auditor"
        )
        
        crew = Crew(
            agents=[self.agents['orchestrator']],
            tasks=[orchestrator_task],
            process=Process.sequential,
            verbose=True
        )
        
        return crew.kickoff()
```

### **6.2 Orchestration Decision Tree**

```
User starts audit
       ↓
  Temporal Workflow (durable)
       ↓
  LangGraph State Machine (phase control)
       ↓
  CrewAI Crews (agent execution)
       ↓
  Individual Agents (domain work)
```

**When to use each layer:**

| Layer | Use For | Example |
|-------|---------|---------|
| **Temporal** | Workflows > 1 hour, need durability | Complete audit (6 months) |
| **LangGraph** | Complex state transitions, conditionals | Gap assessment approval |
| **CrewAI** | Agent coordination, parallel execution | Evidence collection |

---

## **7. VISION-BASED EVIDENCE COLLECTION**

### **7.1 Core Innovation**

Traditional GRC tools (Vanta, Drata) rely heavily on API integrations. This creates problems:

❌ **API Coverage**: Not all systems have APIs  
❌ **API Access**: Customers resist giving admin API keys  
❌ **API Changes**: APIs break, requiring maintenance  
❌ **Onboarding Delay**: Can take weeks to get all API keys  

**Our Solution:** Vision-based evidence collection that works like a human auditor.

### **7.2 Vision Collection Architecture**

```python
from playwright.async_api import async_playwright
from anthropic import Anthropic
import base64
from datetime import datetime

class VisionEvidenceCollector:
    """
    Collects compliance evidence using browser automation + AI vision
    """
    
    def __init__(self):
        self.anthropic = Anthropic()
        self.browserbase_api_key = os.getenv("BROWSERBASE_API_KEY")
    
    async def collect_okta_mfa_evidence(
        self, 
        company_id: str,
        okta_domain: str,
        credentials: dict
    ) -> dict:
        """
        Collect evidence that Okta MFA is enforced
        
        Strategy:
        1. Try API first (faster, more reliable)
        2. If API unavailable, use vision approach
        """
        
        # Step 1: Try API approach
        try:
            api_evidence = await self._collect_via_okta_api(
                okta_domain, 
                credentials['api_token']
            )
            return api_evidence
        except Exception as e:
            print(f"API collection failed: {e}. Falling back to vision.")
        
        # Step 2: Fallback to vision approach
        return await self._collect_via_vision(
            company_id,
            okta_domain,
            credentials
        )
    
    async def _collect_via_vision(
        self,
        company_id: str,
        okta_domain: str,
        credentials: dict
    ) -> dict:
        """
        Use browser automation + vision to collect evidence
        """
        
        async with async_playwright() as p:
            # Launch browser via Browserbase (managed, anti-detection)
            browser = await p.chromium.connect_over_cdp(
                f"wss://connect.browserbase.com?apiKey={self.browserbase_api_key}"
            )
            
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080}
            )
            
            page = await context.new_page()
            
            # Step 1: Navigate to Okta admin console
            await page.goto(f"https://{okta_domain}/admin")
            
            # Step 2: Login
            await page.fill('input[name="username"]', credentials['username'])
            await page.fill('input[name="password"]', credentials['password'])
            await page.click('input[type="submit"]')
            
            # Wait for MFA challenge
            await page.wait_for_selector('input[name="answer"]', timeout=5000)
            
            # Note: In production, integrate with MFA provider or 
            # ask user to approve via mobile app
            
            # Step 3: Navigate to MFA settings
            await page.goto(f"https://{okta_domain}/admin/access/multifactor")
            await page.wait_for_load_state('networkidle')
            
            # Step 4: Take screenshot
            screenshot_bytes = await page.screenshot(full_page=True)
            screenshot_b64 = base64.b64encode(screenshot_bytes).decode()
            
            # Step 5: Use Claude Vision to analyze screenshot
            analysis = await self._analyze_mfa_screenshot(
                screenshot_b64,
                control_requirement="""
                Verify that MFA is required for all users.
                
                Look for:
                - MFA policy status (should be "Active" or "Enforced")
                - User count covered by policy (should be 100%)
                - No exceptions or excluded users
                - Policy applies to all applications
                """
            )
            
            # Step 6: Save screenshot as evidence
            evidence_path = await self._save_evidence(
                company_id=company_id,
                control_id="CC6.1",
                evidence_type="mfa_enforcement",
                screenshot_b64=screenshot_b64,
                analysis=analysis
            )
            
            await browser.close()
            
            return {
                'control_id': 'CC6.1',
                'status': 'pass' if analysis['compliant'] else 'fail',
                'evidence_path': evidence_path,
                'findings': analysis['findings'],
                'confidence': analysis['confidence'],
                'collected_at': datetime.utcnow().isoformat()
            }
    
    async def _analyze_mfa_screenshot(
        self, 
        screenshot_b64: str,
        control_requirement: str
    ) -> dict:
        """
        Use Claude Vision to analyze compliance screenshot
        """
        
        response = self.anthropic.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": screenshot_b64
                        }
                    },
                    {
                        "type": "text",
                        "text": f"""
                        You are a SOC 2 auditor analyzing compliance evidence.
                        
                        Control Requirement:
                        {control_requirement}
                        
                        Analyze this screenshot and determine:
                        1. Is the control requirement met? (Yes/No)
                        2. What specific evidence supports your conclusion?
                        3. Are there any gaps or concerns?
                        4. What is your confidence level? (0-100%)
                        
                        Respond in JSON:
                        {{
                            "compliant": boolean,
                            "findings": [list of observations],
                            "gaps": [list of issues if any],
                            "confidence": number,
                            "evidence_summary": string
                        }}
                        """
                    }
                ]
            }]
        )
        
        # Parse JSON response
        import json
        return json.loads(response.content[0].text)
    
    async def _save_evidence(
        self,
        company_id: str,
        control_id: str,
        evidence_type: str,
        screenshot_b64: str,
        analysis: dict
    ) -> str:
        """
        Save evidence to object storage and database
        """
        
        # Generate unique filename
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"{company_id}/{control_id}/{evidence_type}_{timestamp}.png"
        
        # Upload to Cloudflare R2
        # (Implementation depends on your storage client)
        storage_url = await upload_to_r2(filename, screenshot_b64)
        
        # Save metadata to database
        await db.evidence.create({
            'company_id': company_id,
            'control_id': control_id,
            'evidence_type': evidence_type,
            'storage_url': storage_url,
            'analysis': analysis,
            'collected_at': datetime.utcnow()
        })
        
        return storage_url
```

### **7.3 Vision Use Cases**

| Control | Traditional Approach | Vision Approach |
|---------|---------------------|-----------------|
| **MFA Enforcement** | API: Check policy settings | Navigate to admin console, screenshot MFA settings, verify with AI |
| **Access Reviews** | API: Export user list | Screenshot access review document with signatures |
| **Vulnerability Scans** | API: Pull scan results | Screenshot Qualys/Tenable dashboard |
| **Training Completion** | API: Query LMS | Screenshot training platform showing completion rates |
| **Incident Response** | API: Export tickets | Screenshot JIRA/Linear incident board |
| **Code Reviews** | API: GitHub API | Screenshot PR approval flow |

### **7.4 Vision Tool Implementation**

```python
from crewai import Tool
from langchain.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field

class PlaywrightNavigateInput(BaseModel):
    """Input for navigating to a URL"""
    url: str = Field(..., description="URL to navigate to")
    wait_for: str = Field(
        "networkidle", 
        description="What to wait for: 'load', 'domcontentloaded', 'networkidle'"
    )

class PlaywrightTool(BaseTool):
    """
    Tool for browser automation
    """
    name = "playwright_navigate"
    description = """
    Navigate to a URL using a real browser.
    Useful for accessing web applications that require authentication.
    Returns success/failure status.
    """
    args_schema: Type[BaseModel] = PlaywrightNavigateInput
    
    def _run(self, url: str, wait_for: str = "networkidle") -> str:
        # Implementation
        pass

class ScreenshotInput(BaseModel):
    """Input for taking screenshot"""
    full_page: bool = Field(True, description="Capture full page or just viewport")
    selector: str = Field(None, description="Optional CSS selector to screenshot specific element")

class ScreenshotTool(BaseTool):
    """
    Tool for capturing screenshots
    """
    name = "take_screenshot"
    description = """
    Take a screenshot of the current page.
    Can capture full page or specific elements.
    Returns base64-encoded image.
    """
    args_schema: Type[BaseModel] = ScreenshotInput
    
    def _run(self, full_page: bool = True, selector: str = None) -> str:
        # Implementation
        pass

class VisionAnalysisInput(BaseModel):
    """Input for vision analysis"""
    screenshot_b64: str = Field(..., description="Base64-encoded screenshot")
    question: str = Field(..., description="What to analyze in the screenshot")
    control_id: str = Field(None, description="SOC 2 control being verified")

class VisionAnalysisTool(BaseTool):
    """
    Tool for analyzing screenshots with AI vision
    """
    name = "analyze_screenshot"
    description = """
    Analyze a screenshot using AI vision to extract information or verify compliance.
    Can answer questions like:
    - Is MFA enabled?
    - How many users have access?
    - Is this setting configured correctly?
    """
    args_schema: Type[BaseModel] = VisionAnalysisInput
    
    def _run(
        self, 
        screenshot_b64: str, 
        question: str,
        control_id: str = None
    ) -> str:
        # Use Claude Vision API
        pass

# Create CrewAI-compatible tools
playwright_tool = Tool(
    name="Navigate Browser",
    func=PlaywrightTool()._run,
    description=PlaywrightTool.description
)

screenshot_tool = Tool(
    name="Take Screenshot",
    func=ScreenshotTool()._run,
    description=ScreenshotTool.description
)

vision_tool = Tool(
    name="Analyze Screenshot",
    func=VisionAnalysisTool()._run,
    description=VisionAnalysisTool.description
)
```

### **7.5 Vision Evidence Workflow**

```
1. Agent identifies evidence need
        ↓
2. Try API collection first
        ↓
3. If API fails/unavailable:
   - Launch browser (Playwright + Browserbase)
   - Navigate to target system
   - Authenticate (if needed)
   - Navigate to relevant page
   - Take screenshot
        ↓
4. Send screenshot to Claude Vision
   - Analyze against control requirement
   - Extract relevant information
   - Assess compliance
        ↓
5. Save evidence
   - Upload screenshot to R2
   - Store analysis in database
   - Link to control
        ↓
6. Return to agent
   - Evidence collected successfully
   - Or: Manual intervention needed
```

### **7.6 Advantages Over Competitors**

| Capability | Vanta | Drata | **Our Solution** |
|------------|-------|-------|------------------|
| **Works without APIs** | ❌ | ❌ | ✅ |
| **Adapts to UI changes** | ❌ | ❌ | ✅ (AI learns new layouts) |
| **Onboarding time** | 2-4 weeks | 2-4 weeks | **2-3 days** |
| **Custom integrations** | Months | Months | **Hours** (just browse to it) |
| **Visual verification** | ❌ | ❌ | ✅ (sees what auditors see) |
| **Evidence authenticity** | Medium | Medium | **High** (screenshots are visual proof) |

---

## **8. DATA ARCHITECTURE**

### **8.1 Database Schema**

#### **Postgres (Structured Data)**

```sql
-- Companies
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    industry VARCHAR(100),
    employee_count INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit Projects
CREATE TABLE audit_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    framework VARCHAR(50), -- 'SOC2_TYPE_II', 'ISO27001', 'HIPAA'
    trust_criteria TEXT[], -- ['Security', 'Availability', 'Confidentiality']
    status VARCHAR(50), -- 'discovery', 'gap_assessment', 'implementation', 'evidence_collection', 'audit'
    start_date DATE,
    target_completion_date DATE,
    actual_completion_date DATE,
    auditor_name VARCHAR(255),
    auditor_contact VARCHAR(255),
    progress_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Controls
CREATE TABLE controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework VARCHAR(50),
    control_id VARCHAR(50), -- 'CC6.1', 'CC6.2', etc.
    control_name VARCHAR(500),
    control_description TEXT,
    category VARCHAR(100), -- 'Access Control', 'Infrastructure', etc.
    frequency VARCHAR(50), -- 'continuous', 'daily', 'weekly', 'monthly', 'quarterly'
    required_evidence_types TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- Evidence
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_project_id UUID REFERENCES audit_projects(id),
    control_id UUID REFERENCES controls(id),
    evidence_type VARCHAR(100), -- 'screenshot', 'api_export', 'document', 'log'
    storage_url TEXT,
    collection_method VARCHAR(50), -- 'api', 'vision', 'manual'
    collected_by VARCHAR(50), -- agent name
    collected_at TIMESTAMP,
    
    -- Vision analysis (if applicable)
    vision_analysis JSONB,
    confidence_score DECIMAL(3,2),
    
    -- Status
    status VARCHAR(50), -- 'collected', 'validated', 'rejected'
    validation_notes TEXT,
    
    -- Metadata
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Evidence Gaps
CREATE TABLE evidence_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_project_id UUID REFERENCES audit_projects(id),
    control_id UUID REFERENCES controls(id),
    gap_type VARCHAR(100),
    description TEXT,
    severity VARCHAR(50), -- 'critical', 'high', 'medium', 'low'
    identified_at TIMESTAMP,
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- System Inventory (from Discovery)
CREATE TABLE systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    system_type VARCHAR(100), -- 'aws', 'gcp', 'azure', 'okta', 'github'
    system_name VARCHAR(255),
    system_identifier VARCHAR(255), -- account ID, org ID, etc.
    in_scope BOOLEAN DEFAULT TRUE,
    metadata JSONB, -- detailed system info
    discovered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Policies
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    audit_project_id UUID REFERENCES audit_projects(id),
    policy_type VARCHAR(100), -- 'information_security', 'access_control', etc.
    title VARCHAR(500),
    content TEXT,
    version INTEGER DEFAULT 1,
    status VARCHAR(50), -- 'draft', 'review', 'approved'
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    storage_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vendor Risk Assessments
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    vendor_name VARCHAR(255),
    vendor_domain VARCHAR(255),
    service_description TEXT,
    risk_level VARCHAR(50), -- 'critical', 'high', 'medium', 'low'
    has_data_access BOOLEAN,
    has_soc2 BOOLEAN,
    soc2_expiry_date DATE,
    last_assessment_date DATE,
    next_assessment_date DATE,
    assessment_status VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Agent Execution Logs
CREATE TABLE agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_project_id UUID REFERENCES audit_projects(id),
    agent_name VARCHAR(100),
    task_description TEXT,
    status VARCHAR(50), -- 'running', 'completed', 'failed'
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds INTEGER,
    result JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Questions (from auditor)
CREATE TABLE audit_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_project_id UUID REFERENCES audit_projects(id),
    control_id UUID REFERENCES controls(id),
    question_text TEXT,
    question_number VARCHAR(50),
    asked_at TIMESTAMP,
    answered_at TIMESTAMP,
    answer_text TEXT,
    answered_by VARCHAR(50), -- agent or human
    evidence_references TEXT[], -- URLs to supporting evidence
    status VARCHAR(50), -- 'pending', 'answered', 'followup_needed'
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Activity (audit trail)
CREATE TABLE user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company_id UUID REFERENCES companies(id),
    action VARCHAR(100),
    resource_type VARCHAR(100),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_evidence_project ON evidence(audit_project_id);
CREATE INDEX idx_evidence_control ON evidence(control_id);
CREATE INDEX idx_evidence_status ON evidence(status);
CREATE INDEX idx_audit_projects_company ON audit_projects(company_id);
CREATE INDEX idx_agent_executions_project ON agent_executions(audit_project_id);
CREATE INDEX idx_systems_company ON systems(company_id);
```

#### **Pinecone (Vector Database)**

```python
# Vector storage for semantic search

from pinecone import Pinecone

# Initialize
pc = Pinecone(api_key="...")
index = pc.Index("grc-evidence")

# Use cases:

# 1. Similarity search for evidence reuse
"""
When collecting evidence for CC6.1 (MFA), search for similar 
evidence from past audits or other companies (anonymized)
"""

# 2. Policy template matching
"""
When generating policies, find similar policies from other 
companies in the same industry
"""

# 3. Auditor question answering
"""
When auditor asks a question, search across all evidence 
and policies to find relevant information
"""

# Example: Store evidence embeddings
index.upsert(vectors=[
    {
        "id": evidence_id,
        "values": embedding,  # from OpenAI embeddings
        "metadata": {
            "control_id": "CC6.1",
            "evidence_type": "mfa_screenshot",
            "company_id": company_id,
            "collected_at": timestamp
        }
    }
])

# Example: Search for relevant evidence
results = index.query(
    vector=question_embedding,
    filter={
        "control_id": "CC6.1",
        "company_id": company_id
    },
    top_k=10,
    include_metadata=True
)
```

#### **Redis (Caching)**

```python
# Cache structure

# 1. LLM response caching (via Helicone)
# Automatic caching of LLM responses to reduce costs

# 2. API response caching
redis.setex(
    key=f"okta:users:{company_id}",
    time=3600,  # 1 hour TTL
    value=json.dumps(users_data)
)

# 3. Evidence collection status
redis.hset(
    name=f"evidence_status:{audit_project_id}",
    mapping={
        "CC6.1": "collected",
        "CC6.2": "in_progress",
        "CC7.1": "pending"
    }
)

# 4. Agent execution queue
redis.lpush(f"agent_queue:{agent_name}", task_id)

# 5. Real-time progress tracking
redis.publish(
    channel=f"audit:{audit_project_id}:progress",
    message=json.dumps({
        "phase": "evidence_collection",
        "progress": 65,
        "message": "Collected 45/70 evidence items"
    })
)
```

#### **Cloudflare R2 (Object Storage)**

```
Bucket structure:

/evidence
  /{company_id}
    /{audit_project_id}
      /screenshots
        /{control_id}
          /mfa_enforcement_20250115_143022.png
          /access_review_20250115_143045.png
      /documents
        /{policy_type}
          /information_security_policy_v1.pdf
      /exports
        /okta_users_export_20250115.csv
        /aws_iam_report_20250115.json

/policies
  /templates
    /information_security_policy.docx
    /incident_response_plan.docx
  /generated
    /{company_id}
      /information_security_policy_v1.pdf

/audit_reports
  /{company_id}
    /{audit_project_id}
      /soc2_type_ii_report_final.pdf
```

### **8.2 Data Flow**

```
User Initiates Audit
       ↓
1. Create audit_project record (Postgres)
       ↓
2. Discovery agent scans infrastructure
   → Stores systems in systems table (Postgres)
       ↓
3. Framework expert assesses gaps
   → Stores gaps in evidence_gaps table (Postgres)
       ↓
4. Domain agents collect evidence
   → Screenshots saved to R2
   → Metadata saved to evidence table (Postgres)
   → Embeddings saved to Pinecone
   → Cache evidence status in Redis
       ↓
5. Evidence management agent validates
   → Updates evidence.status (Postgres)
       ↓
6. Policy agent generates documents
   → Saves PDFs to R2
   → Metadata in policies table (Postgres)
       ↓
7. Audit coordinator packages evidence
   → Creates evidence index
   → Generates evidence package
       ↓
8. Auditor asks questions
   → Stores in audit_questions (Postgres)
   → Searches Pinecone for relevant evidence
   → AI generates answers
   → Updates audit_questions with answers
       ↓
9. Audit complete
   → Final report saved to R2
   → audit_project.status = 'completed' (Postgres)
```

### **8.3 Data Retention & Privacy**

```yaml
retention_policies:
  evidence_screenshots:
    retention: "7 years"  # SOC 2 requirement
    storage: "Cloudflare R2"
    encryption: "AES-256"
  
  audit_project_data:
    retention: "7 years"
    storage: "Postgres"
    encryption: "At rest"
  
  agent_execution_logs:
    retention: "1 year"
    storage: "Postgres"
  
  api_credentials:
    storage: "Doppler secrets manager"
    encryption: "AES-256"
    rotation: "90 days"

privacy_controls:
  pii_detection:
    tool: "LLM Guard"
    action: "Redact before storage"
  
  data_isolation:
    level: "Company-level"
    method: "Row-level security"
  
  access_controls:
    authentication: "Clerk"
    authorization: "RBAC"
    audit_logging: "user_activity table"
```

---

## **9. SECURITY & COMPLIANCE**

### **9.1 Security Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                        │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │  Layer 1: Network Security                            ││
│  │  • Cloudflare WAF                                     ││
│  │  • DDoS protection                                    ││
│  │  • Rate limiting                                      ││
│  │  • IP allowlisting (enterprise)                      ││
│  └────────────────────────────────────────────────────────┘│
│                           ↓                                 │
│  ┌────────────────────────────────────────────────────────┐│
│  │  Layer 2: Application Security                        ││
│  │  • Input validation (Zod)                             ││
│  │  • CSRF protection                                    ││
│  │  • SQL injection prevention (Parameterized queries)  ││
│  │  • XSS prevention                                     ││
│  └────────────────────────────────────────────────────────┘│
│                           ↓                                 │
│  ┌────────────────────────────────────────────────────────┐│
│  │  Layer 3: Authentication & Authorization              ││
│  │  • Clerk (MFA enforced)                               ││
│  │  • WorkOS SSO (SAML 2.0)                              ││
│  │  • RBAC (role-based access)                           ││
│  │  • Session management                                 ││
│  └────────────────────────────────────────────────────────┘│
│                           ↓                                 │
│  ┌────────────────────────────────────────────────────────┐│
│  │  Layer 4: Data Security                               ││
│  │  • Encryption at rest (AES-256)                       ││
│  │  • Encryption in transit (TLS 1.3)                    ││
│  │  • Database encryption (Neon)                         ││
│  │  • Object storage encryption (R2)                     ││
│  └────────────────────────────────────────────────────────┘│
│                           ↓                                 │
│  ┌────────────────────────────────────────────────────────┐│
│  │  Layer 5: Secrets Management                          ││
│  │  • Doppler (centralized secrets)                      ││
│  │  • No secrets in code                                 ││
│  │  • Automatic rotation                                 ││
│  │  • Audit logging                                      ││
│  └────────────────────────────────────────────────────────┘│
│                           ↓                                 │
│  ┌────────────────────────────────────────────────────────┐│
│  │  Layer 6: AI Security                                 ││
│  │  • Prompt injection detection (Rebuff)                ││
│  │  • PII detection (LLM Guard)                          ││
│  │  • Content filtering                                  ││
│  │  • LLM usage monitoring                               ││
│  └────────────────────────────────────────────────────────┘│
│                           ↓                                 │
│  ┌────────────────────────────────────────────────────────┐│
│  │  Layer 7: Monitoring & Incident Response              ││
│  │  • Security alerts (Sentry)                           ││
│  │  • Anomaly detection                                  ││
│  │  • Automated incident response                        ││
│  │  • Audit logging (immutable)                          ││
│  └────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### **9.2 Credential Isolation**

```python
from doppler_sdk import DopplerSDK
import os

class CredentialManager:
    """
    Manages customer credentials securely
    """
    
    def __init__(self):
        self.doppler = DopplerSDK()
    
    def store_customer_credential(
        self,
        company_id: str,
        system: str,  # 'okta', 'aws', 'github', etc.
        credential_type: str,  # 'api_key', 'oauth_token', 'password'
        credential_value: str,
        metadata: dict = None
    ):
        """
        Store customer credential in Doppler
        
        Each customer gets isolated secrets:
        - project: f"customer_{company_id}"
        - config: "production"
        """
        
        # Create customer-specific Doppler project
        project_name = f"customer_{company_id}"
        
        # Store secret
        secret_name = f"{system}_{credential_type}"
        
        self.doppler.secrets.update(
            project=project_name,
            config="production",
            secrets={
                secret_name: credential_value
            }
        )
        
        # Store metadata in database (encrypted)
        await db.credentials.create({
            'company_id': company_id,
            'system': system,
            'credential_type': credential_type,
            'doppler_secret_name': secret_name,
            'metadata': encrypt(metadata),  # encryption at rest
            'created_at': datetime.utcnow()
        })
    
    def retrieve_customer_credential(
        self,
        company_id: str,
        system: str,
        credential_type: str
    ) -> str:
        """
        Retrieve customer credential from Doppler
        """
        project_name = f"customer_{company_id}"
        secret_name = f"{system}_{credential_type}"
        
        secrets = self.doppler.secrets.get(
            project=project_name,
            config="production"
        )
        
        return secrets[secret_name]
    
    def rotate_credential(
        self,
        company_id: str,
        system: str,
        credential_type: str,
        new_value: str
    ):
        """
        Rotate a credential (e.g., API keys every 90 days)
        """
        # Store new credential
        self.store_customer_credential(
            company_id,
            system,
            credential_type,
            new_value
        )
        
        # Mark old credential for deletion (30 day grace period)
        await db.credentials.update(
            where={'company_id': company_id, 'system': system},
            data={'scheduled_deletion': datetime.utcnow() + timedelta(days=30)}
        )
```

### **9.3 Access Control (RBAC)**

```python
# Role definitions

ROLES = {
    'admin': {
        'permissions': [
            'audit:create',
            'audit:read',
            'audit:update',
            'audit:delete',
            'evidence:read',
            'evidence:download',
            'settings:manage',
            'users:manage'
        ]
    },
    'compliance_manager': {
        'permissions': [
            'audit:create',
            'audit:read',
            'audit:update',
            'evidence:read',
            'evidence:download',
            'policies:read',
            'policies:edit'
        ]
    },
    'auditor_viewer': {
        'permissions': [
            'audit:read',
            'evidence:read',
            'evidence:download',
            'policies:read'
        ]
    },
    'read_only': {
        'permissions': [
            'audit:read',
            'dashboard:view'
        ]
    }
}

# Middleware for authorization
def require_permission(permission: str):
    def decorator(f):
        @wraps(f)
        async def wrapper(*args, **kwargs):
            user = get_current_user()
            
            if not has_permission(user, permission):
                raise HTTPException(
                    status_code=403,
                    detail=f"Missing required permission: {permission}"
                )
            
            return await f(*args, **kwargs)
        return wrapper
    return decorator

# Usage in API routes
@app.get("/api/evidence/{evidence_id}")
@require_permission("evidence:read")
async def get_evidence(evidence_id: str):
    # Only users with 'evidence:read' permission can access
    pass
```

### **9.4 Audit Logging**

```python
class AuditLogger:
    """
    Immutable audit logging for compliance
    """
    
    async def log_action(
        self,
        user_id: str,
        company_id: str,
        action: str,
        resource_type: str,
        resource_id: str,
        details: dict,
        request: Request
    ):
        """
        Log all user actions for audit trail
        """
        
        await db.user_activity.create({
            'user_id': user_id,
            'company_id': company_id,
            'action': action,
            'resource_type': resource_type,
            'resource_id': resource_id,
            'details': details,
            'ip_address': request.client.host,
            'user_agent': request.headers.get('user-agent'),
            'created_at': datetime.utcnow()
        })
        
        # Also send to immutable log storage
        # (e.g., AWS CloudTrail, Better Stack)
        await send_to_immutable_logs({
            'timestamp': datetime.utcnow().isoformat(),
            'user_id': user_id,
            'company_id': company_id,
            'action': action,
            'resource': f"{resource_type}/{resource_id}",
            'details': details,
            'source_ip': request.client.host
        })

# Usage in API routes
@app.post("/api/evidence")
async def create_evidence(request: Request):
    # ... create evidence ...
    
    await audit_logger.log_action(
        user_id=current_user.id,
        company_id=current_user.company_id,
        action="evidence_created",
        resource_type="evidence",
        resource_id=evidence.id,
        details={
            'control_id': evidence.control_id,
            'evidence_type': evidence.evidence_type
        },
        request=request
    )
```

### **9.5 Compliance Posture**

The platform is designed to be **audit-ready** itself:

| Control | Implementation |
|---------|----------------|
| **Access Control (CC6)** | MFA enforced (Clerk), RBAC, least privilege |
| **Encryption (CC7)** | TLS 1.3, AES-256 at rest, encrypted databases |
| **Logging (CC7.4)** | Comprehensive audit logging, immutable logs |
| **Backups (A1.2)** | Automated backups (Neon, R2), tested recovery |
| **Change Management (CC8.1)** | GitHub PR reviews, CI/CD pipelines |
| **Vendor Management (CC9)** | All vendors have SOC 2 reports |
| **Incident Response** | Documented plan, Sentry alerts, PagerDuty |
| **Data Isolation** | Row-level security, customer-specific secrets |

---

## **10. DEPLOYMENT ARCHITECTURE**

### **10.1 Production Architecture**

```
                    ┌──────────────────────────┐
                    │     Cloudflare CDN       │
                    │  (WAF + DDoS + Cache)    │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │     Vercel Edge          │
                    │  (Next.js frontend)      │
                    └────────────┬─────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
     ┌────────▼─────────┐ ┌─────▼──────┐ ┌────────▼────────┐
     │  Next.js API     │ │  Temporal  │ │   Modal Labs    │
     │    Routes        │ │  Workers   │ │ (Agent Workers) │
     └────────┬─────────┘ └─────┬──────┘ └────────┬────────┘
              │                  │                  │
              └──────────────────┼──────────────────┘
                                 │
              ┌──────────────────┼──────────────────────────┐
              │                  │                          │
     ┌────────▼─────────┐ ┌─────▼──────┐ ┌────────▼────────┐
     │    Postgres      │ │  Pinecone  │ │  Cloudflare R2  │
     │     (Neon)       │ │  (Vectors) │ │  (Screenshots)  │
     └──────────────────┘ └────────────┘ └─────────────────┘
              │
     ┌────────▼─────────┐
     │  Upstash Redis   │
     │    (Cache)       │
     └──────────────────┘
              │
     ┌────────▼─────────┐
     │   Browserbase    │
     │  (Browsers)      │
     └──────────────────┘
```

### **10.2 Infrastructure as Code**

```yaml
# docker-compose.yml (local development)
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=${DATABASE_URL}
    volumes:
      - ./src:/app/src
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=grc_platform
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  temporal:
    image: temporalio/auto-setup:latest
    ports:
      - "7233:7233"
      - "8233:8233"
    environment:
      - DB=postgresql
      - DB_PORT=5432
      - POSTGRES_USER=postgres
      - POSTGRES_PWD=postgres
      - POSTGRES_SEEDS=postgres
    depends_on:
      - postgres

  agent-worker:
    build:
      context: .
      dockerfile: Dockerfile.agents
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - TEMPORAL_HOST=temporal:7233
    depends_on:
      - temporal
    deploy:
      replicas: 3

volumes:
  postgres_data:
```

### **10.3 CI/CD Pipeline**

```yaml
# .github/workflows/deploy.yml

name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run tests
        run: npm test
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-agents:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install modal
      
      - name: Deploy agent workers
        run: |
          modal deploy src/agents/main.py
        env:
          MODAL_TOKEN_ID: ${{ secrets.MODAL_TOKEN_ID }}
          MODAL_TOKEN_SECRET: ${{ secrets.MODAL_TOKEN_SECRET }}

  run-migrations:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run database migrations
        run: npm run migrate:deploy
        env:
          DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
```

### **10.4 Scaling Strategy**

#### **Horizontal Scaling**

```python
# Modal app for agent workers

import modal

app = modal.App("grc-agent-workers")

# Create GPU-enabled image for vision tasks
image = (
    modal.Image.debian_slim()
    .pip_install([
        "crewai",
        "langchain",
        "anthropic",
        "playwright",
        "opencv-python"
    ])
)

@app.function(
    image=image,
    cpu=2.0,
    memory=8192,
    timeout=3600,  # 1 hour timeout
    secret=modal.Secret.from_name("anthropic-api-key"),
    retries=3
)
def run_access_control_agent(company_id: str, config: dict):
    """
    Execute access control agent for a company
    
    Modal automatically scales this to handle multiple
    companies concurrently
    """
    from agents.access_control import AccessControlAgent
    
    agent = AccessControlAgent()
    result = agent.execute(company_id, config)
    
    return result

@app.function(
    image=image,
    cpu=4.0,
    memory=16384,
    gpu="any",  # Use GPU for vision analysis
    timeout=3600
)
def run_vision_evidence_collection(company_id: str, control_id: str):
    """
    Collect evidence using vision approach
    
    Uses GPU for faster screenshot analysis
    """
    from agents.vision_collector import VisionCollector
    
    collector = VisionCollector()
    result = collector.collect(company_id, control_id)
    
    return result

# Expose as web endpoint
@app.function()
@modal.web_endpoint(method="POST")
def trigger_evidence_collection(company_id: str):
    """
    API endpoint to trigger evidence collection
    """
    # Spawn parallel tasks for each control domain
    results = []
    
    for agent_fn in [
        run_access_control_agent,
        run_infrastructure_agent,
        run_change_management_agent
    ]:
        # .spawn() runs functions in parallel
        result = agent_fn.spawn(company_id, config={})
        results.append(result)
    
    # Wait for all to complete
    return [r.get() for r in results]
```

#### **Load Distribution**

| Component | Scaling Approach | Max Capacity |
|-----------|-----------------|--------------|
| **Frontend** | Vercel auto-scales | Unlimited (edge) |
| **API Routes** | Vercel serverless | 100 req/sec per endpoint |
| **Agent Workers** | Modal auto-scales | 1000s of concurrent agents |
| **Postgres** | Neon auto-scales | 10,000 connections |
| **Redis** | Upstash auto-scales | 10,000 req/sec |
| **Browserbase** | Session-based scaling | 100 concurrent browsers |

### **10.5 Disaster Recovery**

```yaml
backup_strategy:
  postgres:
    provider: "Neon"
    frequency: "Continuous (WAL)"
    retention: "30 days"
    point_in_time_recovery: true
  
  r2_objects:
    provider: "Cloudflare R2"
    replication: "Multi-region"
    versioning: true
    retention: "7 years"
  
  redis:
    provider: "Upstash"
    snapshot_frequency: "Daily"
    retention: "7 days"

recovery_procedures:
  rto: "4 hours"  # Recovery Time Objective
  rpo: "1 hour"   # Recovery Point Objective
  
  steps:
    1: "Restore Postgres from backup"
    2: "Restore R2 objects from versioning"
    3: "Re-deploy application (Vercel + Modal)"
    4: "Verify data integrity"
    5: "Resume operations"

testing:
  frequency: "Quarterly"
  last_test: "2025-01-15"
  next_test: "2025-04-15"
  success_criteria:
    - rto_met: true
    - rpo_met: true
    - data_loss: "< 1%"
```

---

## **11. OBSERVABILITY & MONITORING**

### **11.1 Monitoring Stack**

```
┌─────────────────────────────────────────────────────────┐
│                    MONITORING LAYERS                    │
│                                                         │
│  ┌────────────────────────────────────────────────────┐│
│  │  Layer 1: Frontend Monitoring (PostHog)           ││
│  │  • Page views, session recordings                 ││
│  │  • User flows, conversion funnels                 ││
│  │  • Feature flags, A/B testing                     ││
│  └────────────────────────────────────────────────────┘│
│                          ↓                              │
│  ┌────────────────────────────────────────────────────┐│
│  │  Layer 2: Application Errors (Sentry)             ││
│  │  • Runtime errors, exceptions                     ││
│  │  • Performance monitoring                         ││
│  │  • Release tracking                               ││
│  └────────────────────────────────────────────────────┘│
│                          ↓                              │
│  ┌────────────────────────────────────────────────────┐│
│  │  Layer 3: Agent Tracing (LangSmith)               ││
│  │  • Agent execution traces                         ││
│  │  • Token usage per agent                          ││
│  │  • Success/failure rates                          ││
│  │  • Agent decision trees                           ││
│  └────────────────────────────────────────────────────┘│
│                          ↓                              │
│  ┌────────────────────────────────────────────────────┐│
│  │  Layer 4: LLM Monitoring (Helicone)               ││
│  │  • Request/response logging                       ││
│  │  • Cost tracking per customer                     ││
│  │  • Latency monitoring                             ││
│  │  • Cache hit rates                                ││
│  └────────────────────────────────────────────────────┘│
│                          ↓                              │
│  ┌────────────────────────────────────────────────────┐│
│  │  Layer 5: Infrastructure Logs (Better Stack)      ││
│  │  • Application logs                               ││
│  │  • System logs                                    ││
│  │  • Audit logs (immutable)                         ││
│  └────────────────────────────────────────────────────┘│
│                          ↓                              │
│  ┌────────────────────────────────────────────────────┐│
│  │  Layer 6: Workflow Monitoring (Temporal)          ││
│  │  • Workflow execution status                      ││
│  │  • Activity retries                               ││
│  │  • Workflow duration                              ││
│  └────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### **11.2 Key Metrics**

#### **Business Metrics**

```python
metrics = {
    'customer_health': {
        'audits_completed': 'count',
        'evidence_collected': 'count per customer',
        'time_to_first_audit': 'days',
        'audit_pass_rate': 'percentage',
        'customer_satisfaction': 'NPS score'
    },
    
    'platform_usage': {
        'daily_active_users': 'count',
        'evidence_collection_rate': 'items per day',
        'agent_execution_count': 'runs per day',
        'feature_adoption': 'percentage per feature'
    },
    
    'financial': {
        'mrr': 'monthly recurring revenue',
        'llm_costs_per_customer': 'dollars',
        'gross_margin': 'percentage',
        'ltv_cac_ratio': 'ratio'
    }
}
```

#### **Technical Metrics**

```python
slos = {
    'availability': {
        'target': '99.9%',
        'measurement': 'Uptime over 30 days',
        'alert_threshold': '99.5%'
    },
    
    'api_latency': {
        'p50': '< 200ms',
        'p95': '< 1000ms',
        'p99': '< 2000ms',
        'alert_threshold': 'p95 > 1500ms'
    },
    
    'agent_execution': {
        'success_rate': '> 95%',
        'average_duration': '< 5 minutes',
        'retry_rate': '< 10%',
        'alert_threshold': 'success_rate < 90%'
    },
    
    'llm_performance': {
        'response_time': 'p95 < 3s',
        'token_usage_per_request': '< 5000 tokens',
        'cache_hit_rate': '> 40%',
        'cost_per_request': '< $0.05'
    },
    
    'data_quality': {
        'evidence_validation_rate': '> 98%',
        'false_positive_rate': '< 5%',
        'evidence_completeness': '> 95%'
    }
}
```

### **11.3 Alerting Strategy**

```yaml
alerts:
  critical:
    - name: "Platform Down"
      condition: "availability < 99%"
      channels: ["pagerduty", "slack"]
      response_time: "15 minutes"
    
    - name: "Database Connection Failure"
      condition: "db_connection_errors > 10 in 1 minute"
      channels: ["pagerduty", "slack"]
      response_time: "5 minutes"
    
    - name: "Agent Execution Failure Spike"
      condition: "agent_failure_rate > 20% for 10 minutes"
      channels: ["pagerduty", "slack"]
      response_time: "30 minutes"
  
  warning:
    - name: "High LLM Costs"
      condition: "daily_llm_spend > $500"
      channels: ["slack", "email"]
      response_time: "4 hours"
    
    - name: "Slow API Response"
      condition: "api_latency_p95 > 1500ms for 15 minutes"
      channels: ["slack"]
      response_time: "1 hour"
    
    - name: "Evidence Collection Lag"
      condition: "evidence_backlog > 100 items"
      channels: ["slack"]
      response_time: "2 hours"
  
  info:
    - name: "New Customer Signup"
      condition: "new_company_created"
      channels: ["slack"]
    
    - name: "Audit Completed"
      condition: "audit_status = completed"
      channels: ["slack", "email"]
    
    - name: "Weekly Metrics Report"
      condition: "schedule: every monday 9am"
      channels: ["email"]
```

### **11.4 Dashboards**

#### **Executive Dashboard**

```
┌─────────────────────────────────────────────────────┐
│           GRC Platform - Executive View             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📊 Key Metrics (Last 30 Days)                     │
│  ┌──────────┬──────────┬──────────┬──────────┐    │
│  │   MRR    │ Customers│  Audits  │   NPS    │    │
│  │  $45K    │    23    │    8     │   +42    │    │
│  │  ▲ 12%   │  ▲ 4     │  ▲ 3     │  ▲ 5     │    │
│  └──────────┴──────────┴──────────┴──────────┘    │
│                                                     │
│  📈 Growth Trends                                   │
│  [Line chart: MRR over time]                       │
│                                                     │
│  💰 Unit Economics                                  │
│  • LTV/CAC: 4.2x                                   │
│  • Gross Margin: 89%                               │
│  • Payback Period: 8 months                        │
│                                                     │
│  🎯 Customer Health                                 │
│  [Gauge chart: Overall health score 85/100]       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### **Engineering Dashboard**

```
┌─────────────────────────────────────────────────────┐
│         GRC Platform - Engineering View             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🚀 System Health                                   │
│  • Uptime: 99.96% ✅                               │
│  • API Latency (p95): 843ms ✅                     │
│  • Error Rate: 0.12% ✅                            │
│  • Agent Success Rate: 96.8% ✅                    │
│                                                     │
│  🤖 Agent Performance                               │
│  [Bar chart: Success rate per agent type]          │
│                                                     │
│  💸 LLM Costs                                       │
│  • Today: $42.35                                   │
│  • This Month: $1,247.89                           │
│  • Per Customer: $54.26/mo                         │
│  [Line chart: Daily costs over 30 days]            │
│                                                     │
│  📦 Infrastructure                                  │
│  • Postgres: 78% capacity                          │
│  • Redis: 34% memory                               │
│  • R2 Storage: 234 GB                              │
│  • Active Agent Workers: 12                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### **Customer Success Dashboard**

```
┌─────────────────────────────────────────────────────┐
│      GRC Platform - Customer Success View           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  👥 Customer List (23 total)                        │
│  ┌──────────────────────────────────────────────┐  │
│  │ Customer         Phase          Health      │  │
│  ├──────────────────────────────────────────────┤  │
│  │ Acme Corp       Evidence Coll.   🟢 85     │  │
│  │ TechStart Inc   Implementation   🟡 72     │  │
│  │ DataCo LLC      Audit Phase      🟢 91     │  │
│  │ ...                                         │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  📋 Active Audits (8)                              │
│  [Kanban view: Discovery → Implementation → etc]   │
│                                                     │
│  ⚠️  At-Risk Customers (2)                          │
│  • TechStart: Evidence collection delayed          │
│  • CloudScale: Low engagement score                │
│                                                     │
│  🎓 Onboarding Pipeline (5)                        │
│  [Progress bars for each new customer]             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## **12. MVP RECOMMENDATION**

### **12.1 MVP Scope**

**Goal:** Launch in 3 months with core value proposition

**What to Build:**

```yaml
mvp_features:
  core_agents:
    - orchestrator_agent
    - discovery_agent
    - framework_expert_agent
    - access_control_agent
    - infrastructure_security_agent
    - policy_generation_agent
    - evidence_management_agent
  
  frameworks:
    - SOC2_Type_II
    # (Skip ISO 27001, HIPAA for MVP)
  
  integrations:
    api_based:
      - okta
      - google_workspace
      - aws
      - github
    
    vision_based:
      - okta_fallback
      - generic_web_apps
  
  features:
    - Infrastructure discovery
    - Gap assessment report
    - Automated policy generation (10 core policies)
    - Evidence collection (vision + API hybrid)
    - Evidence packaging for auditor
    - Basic dashboard
  
  excluded_from_mvp:
    - Auditor Q&A automation
    - Multi-framework support
    - Advanced vendor risk
    - HR integrations
    - Change management automation
    - Continuous monitoring
    - Mobile app
```

### **12.2 MVP Timeline**

```yaml
phase_1_foundation:
  duration: "4 weeks"
  tasks:
    - Setup infrastructure (Vercel, Neon, Modal)
    - Implement authentication (Clerk)
    - Create database schema
    - Build basic dashboard
    - Setup observability (Sentry, LangSmith)
  
phase_2_core_agents:
  duration: "6 weeks"
  tasks:
    - Build orchestrator agent
    - Build discovery agent (AWS, Okta basic)
    - Build framework expert (SOC 2 only)
    - Build access control agent (MFA checks)
    - Build infrastructure agent (encryption checks)
    - Implement CrewAI coordination
  
phase_3_vision_collection:
  duration: "4 weeks"
  tasks:
    - Integrate Playwright + Browserbase
    - Build vision analysis with Claude
    - Create evidence storage (R2)
    - Build API/vision fallback logic
    - Test on 5-10 evidence types
  
phase_4_polish:
  duration: "2 weeks"
  tasks:
    - Policy generation agent
    - Evidence management agent
    - Evidence packaging for auditors
    - Dashboard improvements
    - Documentation
    - Bug fixes
  
total: "16 weeks (4 months)"
```

### **12.3 MVP Budget**

```yaml
one_time_costs:
  development:
    founders: "$0 (equity only)"
    contract_engineers: "$20,000 (2 engineers x 3 months)"
  
  tools_annual_licenses:
    total: "$3,000"

monthly_recurring_costs:
  infrastructure: "$1,500 - $2,000"
  tools_subscriptions: "$500"
  total_per_month: "$2,000 - $2,500"

total_mvp_cost: "$35,000 - $40,000"
```

### **12.4 MVP Success Metrics**

```yaml
technical_metrics:
  - evidence_collection_automation: "> 80%"
  - agent_success_rate: "> 90%"
  - platform_availability: "> 99%"
  - evidence_accuracy: "> 95%"

business_metrics:
  - pilot_customers: "5 companies"
  - time_to_first_audit: "< 3 months"
  - customer_satisfaction: "> 8/10"
  - cost_savings_vs_traditional: "> 60%"

validation_criteria:
  - pilot_customers_complete_audit: "3 out of 5"
  - customers_willing_to_pay: "4 out of 5"
  - auditors_accept_evidence: "100%"
  - no_critical_security_issues: true
```

### **12.5 Post-MVP Roadmap**

```yaml
v1.1_enhancements:
  duration: "2 months after MVP"
  features:
    - Auditor Q&A automation
    - Continuous compliance monitoring
    - More integrations (Azure AD, GCP, GitLab)
    - Enhanced reporting
    - Change management agent
    - Vendor risk agent

v1.2_enterprise:
  duration: "3 months after v1.1"
  features:
    - ISO 27001 support
    - HIPAA support
    - Multi-tenant improvements
    - Enterprise SSO (WorkOS)
    - Advanced RBAC
    - White-label options

v2.0_scale:
  duration: "6 months after v1.2"
  features:
    - Mobile app
    - Advanced AI features
    - Predictive compliance
    - Automated remediation
    - Integration marketplace
    - Self-service onboarding
```

### **12.6 Go-to-Market Strategy**

```yaml
target_customers:
  primary:
    profile: "Series A-B SaaS companies (50-200 employees)"
    pain: "Need SOC 2 for enterprise sales, can't afford full-time GRC"
    channels:
      - product_hunt_launch
      - ycombinator_network
      - founder_network
      - linkedin_ads
  
  early_adopters:
    characteristics:
      - Currently using Vanta/Drata
      - Frustrated with manual work
      - Technical founders who appreciate automation
      - Need faster time to compliance
    
    acquisition_strategy:
      - Free audit assessment (hook)
      - Show evidence automation demo
      - Offer pilot discount (50% off first year)
      - Provide white-glove onboarding

pricing:
  mvp_pricing:
    startup: "$1,999/mo - Up to 100 employees"
    growth: "$3,499/mo - Up to 300 employees"
    enterprise: "Custom - 300+ employees"
  
  comparison:
    vanta: "$3,000 - $5,000/mo"
    drata: "$3,000 - $5,000/mo"
    our_mvp: "$1,999 - $3,499/mo (20-40% cheaper)"

launch_sequence:
  week_1_2:
    - Close 2 pilot customers
    - Onboard pilots
    - Begin evidence collection
  
  week_3_6:
    - Product Hunt launch
    - YC post
    - LinkedIn content
    - 5 more pilot signups
  
  week_7_12:
    - First pilot completes audit ✅
    - Case study published
    - Refine based on feedback
    - 10 more customers
  
  week_13_16:
    - 20 total customers
    - Revenue: ~$40K MRR
    - Raise seed round or bootstrap
```

---

## **13. CONCLUSION & NEXT STEPS**

### **13.1 Summary**

This architecture document provides a complete blueprint for building an AI-powered GRC automation platform that:

1. **Dramatically reduces compliance costs** (60-80% savings)
2. **Accelerates time to audit** (2-3 months vs 6-9 months)
3. **Innovates with vision-based evidence** collection (no APIs required)
4. **Leverages multi-agent AI** for autonomous execution
5. **Provides enterprise-grade security** and reliability
6. **Scales efficiently** with excellent unit economics

### **13.2 Key Differentiators**

| Feature | Impact |
|---------|--------|
| **Vision-based collection** | Works universally, faster onboarding |
| **Multi-agent architecture** | Autonomous, parallel execution |
| **Durable workflows** | Handles months-long audits reliably |
| **Hybrid API + vision** | Best of both worlds |
| **AI policy generation** | Instant compliance documentation |

### **13.3 Implementation Checklist**

```yaml
week_1_2:
  - [ ] Set up infrastructure (Vercel, Neon, Modal, Doppler)
  - [ ] Implement authentication (Clerk)
  - [ ] Create database schema
  - [ ] Set up observability (Sentry, LangSmith, Helicone)

week_3_4:
  - [ ] Build basic dashboard
  - [ ] Implement Temporal workflows
  - [ ] Create LangGraph state machine
  - [ ] Set up CrewAI framework

week_5_8:
  - [ ] Build discovery agent
  - [ ] Build framework expert agent
  - [ ] Build access control agent
  - [ ] Build infrastructure agent
  - [ ] Test agent coordination

week_9_12:
  - [ ] Integrate Playwright + Browserbase
  - [ ] Build vision analysis pipeline
  - [ ] Implement API/vision hybrid approach
  - [ ] Test evidence collection on 10 controls

week_13_14:
  - [ ] Build policy generation agent
  - [ ] Build evidence management agent
  - [ ] Create evidence packaging
  - [ ] Prepare for pilot customers

week_15_16:
  - [ ] Onboard 2 pilot customers
  - [ ] Run first complete audit
  - [ ] Iterate based on feedback
  - [ ] Prepare for launch

total: "16 weeks to MVP"
```

### **13.4 Risk Mitigation**

```yaml
technical_risks:
  vision_accuracy:
    risk: "AI misinterprets screenshots"
    mitigation: "Human review layer for MVP, confidence scores"
  
  llm_costs:
    risk: "Costs exceed projections"
    mitigation: "Aggressive caching, use cheaper models for bulk ops"
  
  integration_complexity:
    risk: "Systems harder to automate than expected"
    mitigation: "Vision fallback, start with easiest systems"

business_risks:
  auditor_acceptance:
    risk: "Auditors reject AI-collected evidence"
    mitigation: "Work with forward-thinking audit firms, provide comprehensive evidence"
  
  competition:
    risk: "Vanta/Drata add AI features"
    mitigation: "Move fast, focus on vision innovation, better UX"
  
  customer_trust:
    risk: "Customers hesitant to give system access"
    mitigation: "Transparent security, SOC 2 certified ourselves, gradual access"
```

### **13.5 Success Factors**

The platform will succeed if:

1. ✅ **Vision-based collection works reliably** (>90% accuracy)
2. ✅ **Customers complete audits faster** (< 3 months)
3. ✅ **Auditors accept AI-generated evidence** (100% acceptance)
4. ✅ **Cost savings materialize** (>60% vs traditional)
5. ✅ **Customers love the experience** (NPS > 40)
6. ✅ **Unit economics are strong** (>85% gross margin)

---

## **APPENDIX A: Code Examples**

### **A.1 Complete Agent Implementation**

```python
# src/agents/access_control_agent.py

from crewai import Agent, Task
from langchain_anthropic import ChatAnthropic
from tools.okta import OktaTool
from tools.vision import VisionAnalysisTool
from typing import Dict, List

class AccessControlAgent:
    """
    Specialist agent for access control verification (CC6.x)
    """
    
    def __init__(self):
        self.llm = ChatAnthropic(
            model="claude-sonnet-4-20250514",
            temperature=0.1
        )
        
        self.agent = Agent(
            role='Identity & Access Management Specialist',
            goal='Verify that access control measures meet SOC 2 requirements',
            backstory="""
            You are an experienced IAM specialist with expertise in Okta, 
            Google Workspace, Azure AD, and AWS IAM. You have conducted 
            access control audits for hundreds of companies and know exactly 
            what auditors look for.
            
            You follow a systematic approach:
            1. Try API-based collection first (fastest, most reliable)
            2. If API fails, use vision-based collection (screenshots + AI)
            3. Always validate evidence meets control requirements
            4. Document any gaps or concerns
            
            You are thorough, detail-oriented, and never skip checks.
            """,
            llm=self.llm,
            tools=[
                OktaTool(),
                VisionAnalysisTool()
            ],
            verbose=True,
            allow_delegation=False
        )
    
    def verify_mfa_enforcement(self, company_id: str) -> Dict:
        """
        Verify CC6.1: MFA is enforced for all users
        """
        
        task = Task(
            description=f"""
            Verify that MFA (multi-factor authentication) is properly enforced 
            for company {company_id}.
            
            Requirements (from SOC 2 TSC 2017 CC6.1):
            - MFA must be required for all user accounts
            - No exceptions unless documented and approved
            - MFA must be enforced at the identity provider level
            - Should cover both internal employees and contractors
            
            Steps:
            1. Use the Okta API tool to check MFA policy
            2. If API tool fails, use vision-based collection:
               - Navigate to Okta admin console
               - Go to Security > Multifactor
               - Take screenshot of MFA policy settings
               - Use vision analysis to verify settings
            3. Verify:
               - MFA policy is "Active" or "Enforced"
               - Policy applies to all users (no exclusions)
               - Required authentication factors are appropriate
            4. Document findings
            
            Return:
            - status: "pass" or "fail"
            - evidence_path: URL to evidence (screenshot or API export)
            - findings: List of observations
            - gaps: List of any issues found
            - confidence: 0-100%
            """,
            agent=self.agent,
            expected_output="""
            JSON object with:
            {
                "status": "pass" or "fail",
                "control_id": "CC6.1",
                "evidence_collected": true/false,
                "evidence_path": "s3://...",
                "findings": ["MFA enforced for all users", "Policy: Okta Verify required"],
                "gaps": [],
                "confidence": 95,
                "recommendations": []
            }
            """
        )
        
        # Execute task
        result = task.execute()
        
        return result
    
    def verify_access_reviews(self, company_id: str) -> Dict:
        """
        Verify CC6.2: Access reviews are performed regularly
        """
        
        task = Task(
            description=f"""
            Verify that periodic access reviews are being performed for company {company_id}.
            
            Requirements (from SOC 2 TSC 2017 CC6.2):
            - Access reviews must be performed at least quarterly
            - Reviews must be documented
            - Reviewers must be managers or security team
            - Excessive access must be removed promptly
            - Process must be formalized
            
            Steps:
            1. Look for access review documentation
            2. Verify last review date (must be < 90 days ago)
            3. Check that reviews include:
               - List of users and their access
               - Reviewer name and signature
               - Date of review
               - Any access changes made
            4. Verify next review is scheduled
            
            Evidence to collect:
            - Last 2 access review documents
            - Access review policy/procedure
            - Scheduled review calendar
            """,
            agent=self.agent
        )
        
        result = task.execute()
        return result
```

### **A.2 Vision Collection Tool**

```python
# src/tools/vision.py

from langchain.tools import BaseTool
from playwright.async_api import async_playwright
from anthropic import Anthropic
import base64

class VisionAnalysisTool(BaseTool):
    """
    Tool for collecting evidence via screenshots and AI vision
    """
    
    name = "vision_analysis"
    description = """
    Collect evidence by taking screenshots and analyzing them with AI.
    Use when API is unavailable or when visual confirmation is needed.
    """
    
    def __init__(self):
        self.anthropic = Anthropic()
        self.browserbase_key = os.getenv("BROWSERBASE_API_KEY")
    
    async def _run(
        self, 
        url: str,
        control_requirement: str,
        navigation_steps: List[str] = None
    ) -> Dict:
        """
        Navigate to URL, take screenshot, analyze with vision
        """
        
        async with async_playwright() as p:
            # Connect to Browserbase
            browser = await p.chromium.connect_over_cdp(
                f"wss://connect.browserbase.com?apiKey={self.browserbase_key}"
            )
            
            page = await browser.new_page()
            
            # Navigate
            await page.goto(url)
            
            # Execute navigation steps if provided
            if navigation_steps:
                for step in navigation_steps:
                    await self._execute_step(page, step)
            
            # Take screenshot
            screenshot = await page.screenshot(full_page=True)
            screenshot_b64 = base64.b64encode(screenshot).decode()
            
            # Analyze with Claude Vision
            analysis = await self._analyze_screenshot(
                screenshot_b64,
                control_requirement
            )
            
            # Save evidence
            evidence_path = await self._save_evidence(
                screenshot_b64,
                analysis
            )
            
            await browser.close()
            
            return {
                'evidence_collected': True,
                'evidence_path': evidence_path,
                'analysis': analysis
            }
    
    async def _analyze_screenshot(
        self, 
        screenshot_b64: str,
        control_requirement: str
    ) -> Dict:
        """
        Use Claude Vision to analyze screenshot
        """
        
        response = self.anthropic.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": screenshot_b64
                        }
                    },
                    {
                        "type": "text",
                        "text": f"""
                        You are analyzing compliance evidence.
                        
                        Control Requirement:
                        {control_requirement}
                        
                        Analyze this screenshot and determine:
                        1. Does it show evidence of the control being met?
                        2. What specific evidence supports your conclusion?
                        3. Are there any concerns or gaps?
                        4. What is your confidence level (0-100)?
                        
                        Respond in JSON format.
                        """
                    }
                ]
            }]
        )
        
        return json.loads(response.content[0].text)
```

---

## **APPENDIX B: Database Migrations**

```sql
-- migrations/001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    industry VARCHAR(100),
    employee_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit projects table
CREATE TABLE audit_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    framework VARCHAR(50) NOT NULL,
    trust_criteria TEXT[],
    status VARCHAR(50) DEFAULT 'discovery',
    start_date DATE,
    target_completion_date DATE,
    actual_completion_date DATE,
    progress_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_framework CHECK (framework IN ('SOC2_TYPE_I', 'SOC2_TYPE_II', 'ISO27001', 'HIPAA')),
    CONSTRAINT valid_status CHECK (status IN ('discovery', 'gap_assessment', 'implementation', 'evidence_collection', 'audit_prep', 'audit', 'completed', 'cancelled'))
);

-- Controls table
CREATE TABLE controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework VARCHAR(50) NOT NULL,
    control_id VARCHAR(50) NOT NULL,
    control_name VARCHAR(500) NOT NULL,
    control_description TEXT,
    category VARCHAR(100),
    frequency VARCHAR(50),
    required_evidence_types TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(framework, control_id)
);

-- Evidence table
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_project_id UUID REFERENCES audit_projects(id) ON DELETE CASCADE,
    control_id UUID REFERENCES controls(id),
    evidence_type VARCHAR(100),
    storage_url TEXT,
    collection_method VARCHAR(50),
    collected_by VARCHAR(50),
    collected_at TIMESTAMP,
    vision_analysis JSONB,
    confidence_score DECIMAL(3,2),
    status VARCHAR(50) DEFAULT 'collected',
    validation_notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_collection_method CHECK (collection_method IN ('api', 'vision', 'manual')),
    CONSTRAINT valid_status CHECK (status IN ('collected', 'validated', 'rejected', 'pending_review'))
);

-- Create indexes
CREATE INDEX idx_audit_projects_company ON audit_projects(company_id);
CREATE INDEX idx_audit_projects_status ON audit_projects(status);
CREATE INDEX idx_evidence_audit_project ON evidence(audit_project_id);
CREATE INDEX idx_evidence_control ON evidence(control_id);
CREATE INDEX idx_evidence_status ON evidence(status);

-- Insert initial SOC 2 controls
INSERT INTO controls (framework, control_id, control_name, category, frequency) VALUES
('SOC2_TYPE_II', 'CC6.1', 'MFA Enforcement', 'Access Control', 'continuous'),
('SOC2_TYPE_II', 'CC6.2', 'Access Reviews', 'Access Control', 'quarterly'),
('SOC2_TYPE_II', 'CC6.3', 'Password Policies', 'Access Control', 'continuous'),
('SOC2_TYPE_II', 'CC6.6', 'Timely Access Removal', 'Access Control', 'continuous'),
('SOC2_TYPE_II', 'CC6.7', 'Least Privilege', 'Access Control', 'quarterly');
```

---

## **APPENDIX C: Complete Feature Parity with Delve + Enhancements**

### **Features Matching Delve**

| Feature Category | Delve Has | We Have | Status |
|------------------|-----------|---------|--------|
| **Computer Vision Screenshots** | ✅ Computer use agent | ✅ Claude Vision + Playwright | **✅ MATCH + BETTER** |
| **Evidence Auto-Collection** | ✅ AI agents collect | ✅ Vision + API hybrid | **✅ MATCH + BETTER** |
| **Code Security Scanning** | ✅ Checks every PR | ✅ SAST + LLM + automated fixes | **✅ MATCH + BETTER** |
| **Infrastructure Scanning** | ✅ Daily scans | ✅ Daily + real-time monitoring | **✅ MATCH + BETTER** |
| **Questionnaire Autofill** | ✅ AI autofills | ✅ AI + RAG from policies | **✅ MATCH** |
| **Compliance Copilot** | ✅ Policy assistant | ✅ Interactive copilot + Slack | **✅ MATCH + BETTER** |
| **Trust Portal** | ✅ Public trust page | ✅ Full portal + AI chatbot | **✅ MATCH + BETTER** |
| **Real-time Alerts** | ✅ Continuous monitoring | ✅ Multi-channel smart alerts | **✅ MATCH + BETTER** |
| **Automated Reports** | ✅ AI writes reports | ✅ Multi-agent report generation | **✅ MATCH** |
| **Policy Generation** | ✅ Policy docs | ✅ Policy Generation Agent | **✅ MATCH** |
| **Auditor Integration** | ✅ Auditor portal | ✅ Audit Coordinator Agent | **✅ MATCH** |

### **Features We Do BETTER Than Delve**

#### **1. Vision-Based Evidence Validation** ✅
```python
# DELVE: Takes screenshots (unclear if they validate)
# US: Claude Vision ANALYZES and VALIDATES screenshots
analysis = claude_vision.analyze(screenshot, control_requirement)
# Returns: confidence_score, compliance_status, evidence_quality
```

**Why Better:**
- We validate screenshots match control requirements
- Confidence scoring for evidence quality  
- Can work with ANY system (no API needed)
- Automatically detects insufficient evidence

#### **2. Multi-Agent Orchestration** ✅
```
DELVE: AI agents (architecture unknown)
US: 16+ specialized agents with:
  - Temporal (durable workflows)
  - LangGraph (state machines)
  - CrewAI (agent coordination)
```

**Why Better:**
- Survives crashes and restarts
- Handles months-long audit processes
- Parallel agent execution
- Proper state management
- Better scalability

#### **3. Hybrid Intelligence (API + Vision)** ✅
```
DELVE: "Goes beyond APIs" (unclear how)
US: Explicit hybrid strategy:
  1. Try API first (fast, structured)
  2. Fall back to vision (universal compatibility)
  3. Validate both with AI
```

**Why Better:**
- Documented approach
- Best of both worlds
- Graceful degradation
- Higher reliability

#### **4. Automated PR Security Fixes** ✅
```
DELVE: Flags security issues
US: Detects + FIXES + Submits PR automatically
```

**Why Better:**
- Generates actual code fixes
- Submits PRs with explanations
- Runs tests before submission
- Reduces manual remediation work

#### **5. Trust Portal with AI Chatbot** ✅
```
DELVE: Trust portal
US: Trust portal + embedded AI responder
  - Answers security questions in real-time
  - RAG from company policies
  - Handles VSA/SIG/CAIQ questionnaires
  - Conversation logging
```

**Why Better:**
- Prospects can ask questions 24/7
- Instant responses (no human delay)
- Consistent answers from policies
- Accelerates enterprise sales

#### **6. Smart Notification Engine** ✅
```
DELVE: Real-time alerts
US: Intelligent alert system:
  - Prevents alert fatigue
  - Batches similar alerts
  - Respects quiet hours
  - Learns from user behavior
  - Multi-channel delivery
```

**Why Better:**
- Reduces noise
- Higher engagement rates
- Contextual delivery
- Adaptive learning

#### **7. Production-Grade Architecture** ✅
```
DELVE: Architecture unknown (closed source)
US: Documented, battle-tested stack:
  - Temporal: Industry standard for durable workflows
  - LangGraph: Proven state machine
  - Claude Vision: Best vision model
  - Observable: Full tracing & monitoring
```

**Why Better:**
- Lower technical risk
- Proven components
- Full observability
- Easier to debug and maintain

### **Additional Features Delve DOESN'T Have**

#### **1. Open Source Option** 🆕
- Can deploy on-premises
- Full control of data
- Custom modifications possible
- Community contributions

#### **2. Advanced Code Analysis** 🆕
```python
# Not just security scanning, but:
- Architecture smell detection
- Performance optimization suggestions
- Compliance pattern matching
- Technical debt quantification
```

#### **3. Infrastructure as Code (IaC) Analysis** 🆕
- Terraform drift detection
- CloudFormation validation
- Pulumi compatibility
- Compliance-as-code enforcement

#### **4. Predictive Compliance Analytics** 🆕
```python
# ML models that predict:
- Likelihood of control failure
- Risk trajectory
- Resource requirements
- Audit readiness score
```

#### **5. Vendor Risk Intelligence** 🆕
```python
# Enhanced vendor management:
- Automated vendor discovery
- Real-time breach monitoring
- Supply chain risk scoring
- Continuous vendor assessment
```

#### **6. Compliance Simulation** 🆕
```python
# What-if analysis:
- "What if we add HIPAA?"
- "What if we move to AWS?"
- "What if we expand to EU?"
- Gap analysis before commitment
```

### **Technical Advantages Over Delve**

| Aspect | Delve | Our Solution | Advantage |
|--------|-------|--------------|-----------|
| **Architecture** | Unknown (closed) | Documented & open | Transparency, auditability |
| **Orchestration** | Unknown | Temporal + LangGraph | Battle-tested, reliable |
| **Vision Tech** | Unclear | Claude 3.5 Sonnet | Best-in-class model |
| **State Management** | Unknown | LangGraph + Temporal | Proper state machine |
| **Observability** | Unknown | Full tracing (LangSmith) | Debuggable, monitorable |
| **Testing** | Unknown | Full test coverage | Higher quality |
| **Deployment** | Cloud only | Cloud + self-hosted | Flexibility |
| **Cost** | $3-5K/mo | $2-3K/mo | 40% cheaper |

### **Why Customers Will Choose Us Over Delve**

1. **Better Technology**: Vision validation + hybrid approach
2. **More Transparent**: Open architecture, documented system
3. **More Reliable**: Temporal workflows, proper orchestration
4. **More Complete**: All Delve features + additional capabilities
5. **Better Economics**: Lower cost, higher automation
6. **Better Support**: AI copilot provides instant help
7. **More Flexible**: Can self-host or use cloud
8. **Better Analytics**: Predictive intelligence
9. **Better Integration**: Deeper tool integrations
10. **Future-Proof**: Built on latest AI advancements

---

**END OF DOCUMENT**

This architecture provides a complete, production-ready blueprint for building an AI-powered GRC automation platform. The system is designed to be:

- **Innovative**: Vision-based evidence collection is a game-changer
- **Scalable**: Multi-agent architecture handles complexity elegantly
- **Reliable**: Durable workflows ensure long-running processes complete
- **Secure**: Enterprise-grade security from day one
- **Profitable**: Excellent unit economics with 90%+ gross margins

**Next steps**: Begin Phase 1 implementation following the 16-week MVP timeline.
