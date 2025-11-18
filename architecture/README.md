# GRC Platform - Complete Architecture Documentation

**Version:** 2.0 COMPLETE
**Last Updated:** November 2025
**Status:** Production-Ready Architecture
**Philosophy:** Agent-Powered Oversight, Not Manual Data Entry

---

## 📚 **DOCUMENTATION STRUCTURE**

This architecture documentation is organized into **6 focused parts** covering every aspect of the GRC Platform. Each document is comprehensive, implementation-ready, and contains zero omissions.

### **How to Use This Documentation**

1. **Start with Part 1** if you're new - understand the business context and vision
2. **Jump to Part 2** if you're a designer/PM - UX patterns and navigation
3. **Read Part 3** if you're a backend engineer - system architecture
4. **Study Part 4** if you're implementing agents - complete agent specs
5. **Reference Part 5** for database and API work
6. **Consult Part 6** for security and deployment

---

## 📖 **DOCUMENTATION PARTS**

### **[Part 1: Business & Strategy](./01_business_and_strategy.md)** (40-50 pages)

**Who Should Read:** Founders, PMs, Business Development, Investors

**Contents:**
- Executive Summary & Problem Statement
- Target Market & Customer Profiles
- Competitive Analysis (Vanta, Drata, Delve, Sprinto)
- Value Proposition & Differentiation
- GRC Workflow Analysis (6 Phases)
- Success Metrics & ROI Calculations
- Pricing Strategy
- Go-to-Market Strategy
- Roadmap & Milestones

**Key Insight:** How we reduce compliance cost by 70% ($80K → $24K/year) and time by 60% (6-9 months → 2-3 months) through AI agent automation.

---

### **[Part 2: UX & Navigation Architecture](./02_ux_and_navigation.md)** (50-60 pages)

**Who Should Read:** Product Managers, UX Designers, Frontend Engineers

**Contents:**
- **Agentic UX Philosophy** - The paradigm shift from data entry to oversight
- **Complete Navigation Structure** - All 8 main sections with agent attribution
- **UI Pattern Library** - 12+ production-ready React components
- **Page-by-Page Specifications** - Every route with wireframes and behavior
- **Empty State Strategy** - How to show incomplete features
- **Approval Queue Design** - Human-in-the-loop patterns
- **Real-Time Updates** - WebSocket integration patterns
- **Mobile Considerations** - Responsive design patterns

**Key Insight:** Users spend 1-2 hours/week reviewing agent work vs 15-20 hours/week doing manual data entry.

**Includes Full Code Examples:**
- `<AgentAttributionCard />` component
- `<ApprovalQueueItem />` component
- `<AgentActivityFeed />` component
- `<EvidenceReviewCard />` component
- `<ControlCoverageDashboard />` component
- And 7 more production-ready components

---

### **[Part 3: System Architecture](./03_system_architecture.md)** (60-70 pages)

**Who Should Read:** Architects, Backend Engineers, DevOps

**Contents:**
- **System Overview** - All layers from UI to database
- **Multi-Agent Architecture** - 15 specialized agents
- **Orchestration Layer** - Temporal + LangGraph + CrewAI integration
- **Vision-Based Evidence** - Playwright + Browserbase + Claude Vision
- **Agent Communication Patterns** - How agents coordinate
- **Workflow State Machines** - LangGraph implementations
- **Durable Workflows** - Temporal patterns for long-running audits
- **Scalability Patterns** - Horizontal scaling of agent workers
- **Failure Handling** - Retry logic, circuit breakers, fallbacks

**Key Insight:** Temporal workflows enable audit processes that run for months, survive crashes, and automatically retry failures.

**Includes Full Code Examples:**
- Complete agent base class implementation
- Temporal workflow definitions
- LangGraph state machine code
- CrewAI crew configurations
- Agent-to-agent communication patterns

---

### **[Part 4: Agent Implementations](./04_agent_implementations.md)** (70-80 pages)

**Who Should Read:** AI Engineers, Agent Developers

**Contents:**
- **Agent Design Principles** - Single responsibility, expertise via context
- **Complete Agent Specifications** - All 15 agents in detail:
  - Orchestrator Agent
  - Discovery Agent
  - Framework Expert Agent
  - Access Control Agent
  - Infrastructure Security & CSPM Agent
  - Change Management Agent
  - Vendor Risk Agent
  - HR Compliance Agent
  - Policy Generation Agent
  - Code Security Scanner Agent
  - Compliance Copilot Agent
  - Questionnaire Automation Agent
  - Evidence Management Agent
  - Audit Coordinator Agent
  - Incident Response Agent

**For Each Agent:**
- Role & responsibility
- Controls covered (SOC 2 / ISO 27001 mapping)
- Tools available
- Input/output schemas
- Execution logic (full code)
- Error handling
- Testing strategy
- Performance metrics

**Key Insight:** Each agent is a specialist with deep expertise, using Claude Sonnet 4.5 for reasoning and Claude Vision for screenshot analysis.

---

### **[Part 5: Data & APIs](./05_data_and_apis.md)** (50-60 pages)

**Who Should Read:** Backend Engineers, Database Architects

**Contents:**
- **Complete Database Schema** - All 25+ tables with relationships
- **Agent-First Data Model** - Approvals, agent executions, evidence reviews
- **API Architecture** - RESTful API specifications
- **Real-Time Architecture** - WebSocket & Server-Sent Events
- **Integration Patterns** - AWS, Okta, GitHub, etc.
- **Data Flow Diagrams** - End-to-end evidence collection
- **Caching Strategy** - Redis for performance
- **Vector Database** - Pinecone for RAG
- **Object Storage** - S3/R2 for evidence files

**Includes:**
- Complete Prisma schema (production-ready)
- All API endpoint specifications
- WebSocket event schemas
- Integration connector patterns
- Migration strategy

---

### **[Part 6: Security, Deployment & Operations](./06_security_deployment_operations.md)** (50-60 pages)

**Who Should Read:** Security Engineers, DevOps, SREs

**Contents:**
- **Security Architecture** - Defense in depth
- **Authentication & Authorization** - Clerk + WorkOS implementation
- **Secrets Management** - Doppler integration
- **Encryption** - At rest (AES-256) and in transit (TLS 1.3)
- **PII Protection** - LLM Guard for preventing leakage
- **Deployment Architecture** - Vercel + Modal + Neon
- **Infrastructure as Code** - Terraform configurations
- **CI/CD Pipelines** - GitHub Actions workflows
- **Observability Stack** - LangSmith + Helicone + Sentry
- **Monitoring & Alerting** - PagerDuty integration
- **Disaster Recovery** - Backup and restore procedures
- **Compliance** - SOC 2 controls for our own platform

**Includes:**
- Complete security checklist
- Deployment scripts
- Terraform modules
- GitHub Actions workflows
- Monitoring dashboards
- Incident response playbooks

---

## 🎯 **QUICK START GUIDES**

### **For Product Managers**
1. Read [Part 1](./01_business_and_strategy.md) - Business context
2. Read [Part 2](./02_ux_and_navigation.md) - UX patterns
3. Review roadmap in [Part 1](./01_business_and_strategy.md#roadmap)

### **For Frontend Engineers**
1. Read [Part 2](./02_ux_and_navigation.md) - Complete UX guide
2. Reference [Part 5](./05_data_and_apis.md) - API contracts
3. Study component examples in Part 2

### **For Backend Engineers**
1. Read [Part 3](./03_system_architecture.md) - System overview
2. Read [Part 5](./05_data_and_apis.md) - Database & APIs
3. Study agent patterns in [Part 4](./04_agent_implementations.md)

### **For AI/Agent Engineers**
1. Read [Part 3](./03_system_architecture.md) - Agent architecture
2. Deep dive [Part 4](./04_agent_implementations.md) - All agent specs
3. Study orchestration in Part 3

### **For DevOps/SRE**
1. Read [Part 6](./06_security_deployment_operations.md) - Complete ops guide
2. Reference [Part 3](./03_system_architecture.md) - Infrastructure needs
3. Review monitoring setup in Part 6

---

## 📊 **KEY METRICS & TARGETS**

| Metric | Traditional GRC | Our Platform | Improvement |
|--------|----------------|--------------|-------------|
| **Annual Cost** | $80-120K | $24-36K | **70% reduction** |
| **Time to First Audit** | 6-9 months | 2-3 months | **60% faster** |
| **User Time/Week** | 15-20 hours | 1-2 hours | **90% reduction** |
| **Evidence Coverage** | 70-80% | 95%+ | **20% increase** |
| **Compliance Accuracy** | Manual (error-prone) | AI-validated | **Near-perfect** |

---

## 🏗️ **ARCHITECTURE PRINCIPLES**

### **1. Agent-Powered Oversight**
```
Traditional:  USER creates data → TOOL stores it
Our Platform: AGENT collects data → USER reviews it → SYSTEM stores it
```

### **2. Familiar Navigation, Revolutionary UX**
- Keep traditional GRC sections (Compliance, Risk, Vendors, Assets, Personnel)
- Change what users DO in those sections (review vs create)
- Add unique sections (Agents, Approvals, Copilot)

### **3. Real-Time by Default**
- WebSocket connections on every page
- Live agent activity feed
- Instant approval updates
- Progress bars for long-running operations

### **4. Human-in-the-Loop for Critical Decisions**
- Agents analyze and recommend
- AI explains reasoning
- Users approve/reject
- System executes

### **5. Vision-First Evidence**
- API integration when available
- Computer vision (Playwright + Claude Vision) as fallback
- Works with ANY system (no API required)
- Future-proof (adapts to UI changes)

---

## 🚀 **IMPLEMENTATION PHASES**

| Phase | Duration | Status | Documents |
|-------|----------|--------|-----------|
| **Phase 1: Foundation** | 1 day | ✅ COMPLETE | All parts |
| **Phase 2: Vercel Deployment** | 0.5 days | ✅ COMPLETE | Part 6 |
| **Phase 3: Audit Management UI** | 1 day | 🔄 IN PROGRESS | Part 2 |
| **Phase 4: Discovery Agent** | 2 days | 📋 PLANNED | Part 4 |
| **Phase 5: Framework Expert** | 1 day | 📋 PLANNED | Part 4 |
| **Phase 6: Evidence Collection** | 5 days | 📋 PLANNED | Part 4 |
| **Phase 7: Vision Evidence** | 2 days | 📋 PLANNED | Part 3 |
| **Phase 8-14** | 20 days | 📋 PLANNED | All parts |

**Current Progress:** ~10% complete (Phases 1-2 done)

---

## 🔗 **CROSS-REFERENCES**

### **Understanding Agent-to-UI Mapping**
- Agent specifications → [Part 4](./04_agent_implementations.md)
- UI components they populate → [Part 2](./02_ux_and_navigation.md)
- Data they write → [Part 5](./05_data_and_apis.md)

### **Understanding Evidence Collection Flow**
- Vision-based collection → [Part 3](./03_system_architecture.md#vision-evidence)
- Agent implementation → [Part 4](./04_agent_implementations.md#evidence-collector)
- Database storage → [Part 5](./05_data_and_apis.md#evidence-table)
- UI review interface → [Part 2](./02_ux_and_navigation.md#evidence-review)

### **Understanding Approval Workflow**
- UX pattern → [Part 2](./02_ux_and_navigation.md#approval-queue)
- Database schema → [Part 5](./05_data_and_apis.md#approvals-table)
- API endpoints → [Part 5](./05_data_and_apis.md#approval-api)
- Agent integration → [Part 4](./04_agent_implementations.md)

---

## 📝 **DOCUMENT CONVENTIONS**

### **Code Examples**
All code examples are production-ready and follow these conventions:
- TypeScript for frontend and backend
- Prisma for database
- Full error handling
- Type-safe implementations
- Comments explaining WHY not just WHAT

### **Diagrams**
- ASCII art for system diagrams (works in any viewer)
- Mermaid diagrams for workflows (renders in GitHub, VS Code, etc.)
- Architecture diagrams follow C4 model when applicable

### **Status Indicators**
- ✅ Implemented and tested
- 🔄 In progress
- 📋 Planned but not started
- ⚠️ Needs attention
- 🔴 Blocked

---

## 🤝 **CONTRIBUTING TO THIS DOCUMENTATION**

### **When to Update**
- Architecture decisions change
- New agents are added
- UI patterns evolve
- Security requirements change
- Deployment architecture updates

### **How to Update**
1. Update the relevant Part document
2. Update cross-references if needed
3. Update this README if structure changes
4. Increment version number
5. Update "Last Updated" date

### **Version History**
- **v2.0** (Nov 2025) - Complete architecture with agentic UX focus
- **v1.0** (Nov 2025) - Initial architecture document

---

## 💡 **GETTING HELP**

### **Questions About:**
- **Business Strategy** → Read Part 1, Section 2-3
- **UX Patterns** → Read Part 2, Section 3-4
- **Agent Development** → Read Part 4
- **Database Design** → Read Part 5, Section 1-2
- **Deployment** → Read Part 6, Section 4-6
- **Security** → Read Part 6, Section 1-3

### **Common Scenarios:**
- "How do I implement a new agent?" → Part 4, Agent Template
- "How do I add a new page?" → Part 2, Page Specifications
- "How do I integrate a new service?" → Part 5, Integration Patterns
- "How do I deploy to production?" → Part 6, Deployment Guide

---

## 🎓 **LEARNING PATH**

### **Week 1: Understanding the Platform**
- Day 1: Read Part 1 (Business context)
- Day 2: Read Part 2 (UX patterns)
- Day 3: Read Part 3 (System overview)
- Day 4: Read Part 4 (Agent basics)
- Day 5: Review Part 5 (Data model)

### **Week 2: Deep Dive**
- Day 1-2: Study your focus area in depth
- Day 3-4: Build a prototype
- Day 5: Review security and deployment

---

## 📚 **EXTERNAL REFERENCES**

### **Standards & Frameworks**
- [SOC 2 Trust Services Criteria](https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/trustdataintegrity)
- [ISO/IEC 27001:2022](https://www.iso.org/standard/27001)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)

### **Technologies**
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Temporal Documentation](https://docs.temporal.io)
- [LangGraph Documentation](https://python.langchain.com/docs/langgraph)
- [CrewAI Documentation](https://docs.crewai.com)
- [Claude API Documentation](https://docs.anthropic.com)
- [Prisma Documentation](https://www.prisma.io/docs)

### **Competitors (for reference)**
- [Vanta](https://www.vanta.com)
- [Drata](https://drata.com)
- [Delve](https://delve.ai) ← Our closest competitor
- [Sprinto](https://sprinto.com)

---

## 🎯 **NEXT STEPS**

**If you're just starting:**
1. Read this README completely
2. Read Part 1 to understand the WHY
3. Read Part 2 to understand the WHAT
4. Read Part 3 to understand the HOW

**If you're implementing:**
1. Find your area of focus in the table of contents
2. Read the relevant Part in depth
3. Follow the code examples
4. Reference other Parts as needed

**If you're stuck:**
1. Check the cross-references section
2. Search for the concept across all Parts
3. Review the common scenarios section

---

## 📄 **LICENSE**

This architecture documentation is proprietary and confidential.

**Copyright © 2025 GRC Platform. All rights reserved.**

---

**Last Updated:** November 16, 2025
**Next Review:** December 2025
**Maintained By:** Architecture Team
