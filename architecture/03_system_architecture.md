# Part 3: System Architecture

**Document:** 03_system_architecture.md
**Version:** 3.0 - Architectural Thinking (No Code)
**Last Updated:** November 16, 2025
**Status:** Production-Ready Architecture
**Philosophy:** Enterprise-Grade Multi-Agent Orchestration for Compliance Automation

---

## 📋 **TABLE OF CONTENTS**

1. [Architecture Overview](#1-architecture-overview)
2. [Multi-Agent System Design](#2-multi-agent-system)
3. [Vision-Based Evidence Collection](#3-vision-evidence)
4. [Orchestration Philosophy](#4-orchestration)
5. [Database Design Principles](#5-database)
6. [API & Integration Strategy](#6-api-integration)
7. [Real-Time Architecture](#7-realtime)
8. [Agent Communication Patterns](#8-agent-communication)
9. [Monorepo Organization](#9-monorepo)
10. [Security Architecture](#10-security)
11. [Scalability & Performance](#11-scalability)
12. [End-to-End Flows](#12-flows)

---

## **1. ARCHITECTURE OVERVIEW** {#1-architecture-overview}

### **1.1 The Big Picture**

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER LAYER (Next.js 15)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   React UI   │  │  Trust Portal│  │  Mobile PWA  │          │
│  │  (RSC + CC)  │  │   (Public)   │  │   (Offline)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↕ tRPC + WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js API Routes)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  tRPC Router │  │  REST APIs   │  │  WebSocket   │          │
│  │  (Type-safe) │  │  (External)  │  │  (Real-time) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↕ Agent Invocation
┌─────────────────────────────────────────────────────────────────┐
│               ORCHESTRATION LAYER (Multi-Agent)                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  TEMPORAL WORKFLOWS (Durable Execution)              │      │
│  │  ├─ AuditWorkflow (months-long, survives crashes)    │      │
│  │  ├─ EvidenceCollectionWorkflow (daily/weekly)        │      │
│  │  └─ VendorRiskWorkflow (quarterly)                   │      │
│  └──────────────────────────────────────────────────────┘      │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  LANGGRAPH (Agent State Machines)                    │      │
│  │  ├─ AccessControlGraph (MFA checks + remediation)    │      │
│  │  ├─ InfraSecurityGraph (scan → analyze → fix)        │      │
│  │  └─ VendorRiskGraph (discover → assess → monitor)    │      │
│  └──────────────────────────────────────────────────────┘      │
│                              ↓                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  CREWAI (Multi-Agent Coordination)                   │      │
│  │  ├─ DiscoveryCrew (parallel infrastructure scan)     │      │
│  │  ├─ PolicyCrew (generate → review → publish)         │      │
│  │  └─ AuditCrew (prepare → respond → remediate)        │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              ↕ Tool Calls
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT LAYER (16+ Specialists)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │Discovery │ │Framework │ │  Access  │ │Infra Sec │          │
│  │  Agent   │ │ Expert   │ │ Control  │ │  Agent   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  Change  │ │  Vendor  │ │    HR    │ │  Policy  │          │
│  │   Mgmt   │ │   Risk   │ │Compliance│ │   Gen    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │   Code   │ │   Infra  │ │Compliance│ │Question. │          │
│  │ Scanner  │ │ Scanner  │ │  Copilot │ │Automation│          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Evidence │ │   Audit  │ │ Incident │ │Orchestr. │          │
│  │   Mgmt   │ │Coordinator│ │ Response │ │  Agent   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↕ Tools + Integrations
┌─────────────────────────────────────────────────────────────────┐
│                   INTEGRATION LAYER                              │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  VISION-BASED (Playwright + Browserbase + Claude)    │      │
│  │  ├─ Automated browser navigation                     │      │
│  │  ├─ Screenshot capture                               │      │
│  │  ├─ Claude Vision analysis                           │      │
│  │  └─ Evidence validation                              │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  API-BASED (Traditional Integrations)                │      │
│  │  ├─ AWS SDK (infrastructure)                         │      │
│  │  ├─ Okta SDK (identity)                              │      │
│  │  ├─ GitHub API (code + changes)                      │      │
│  │  ├─ Slack/Teams (notifications)                      │      │
│  │  └─ 50+ other integrations                           │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              ↕ Read/Write
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │    Redis     │  │   Pinecone   │          │
│  │  (Primary)   │  │   (Cache)    │  │  (Vector DB) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  S3/R2       │  │  Temporal    │  │   LangSmith  │          │
│  │ (Evidence)   │  │  (Workflows) │  │   (Traces)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### **1.2 Core Architectural Principles**

#### **Principle 1: Agent-Centric Design**

**Traditional Architecture:**
```
User → UI → API → Database
(User does the work, database stores result)
```

**Our Architecture:**
```
User → UI → API → Agents → Database
         ↖        ↙
       Orchestration
(Agents do the work, user reviews)
```

**Why This Matters:**

The fundamental shift in our architecture is treating agents as **first-class citizens**, not background jobs. This means:

1. **Agents Have Identity**: Each agent has a name, role, expertise area, and personality. Users recognize agents like they recognize team members.

2. **Agents Have State**: Unlike stateless functions, agents maintain context across executions. An agent remembers what it discovered yesterday and builds on that knowledge today.

3. **Agents Make Decisions**: Agents don't just execute pre-programmed logic. They reason about situations, weigh options, and choose approaches based on context.

4. **Agents Communicate**: Agents coordinate with each other through structured messages, not just data passing. They can request help, delegate tasks, and share insights.

**The User Experience Impact:**

Instead of staring at empty forms wondering "What do I enter here?", users see:
- "Discovery Agent is scanning your AWS infrastructure..."
- "Framework Expert found 3 gaps in access controls"
- "Access Control Agent needs your approval to recommend MFA for 2 users"

This creates a **manager-employee** dynamic instead of a **user-tool** dynamic.

---

#### **Principle 2: Durable Execution Philosophy**

**The Problem We're Solving:**

Compliance audits don't complete in minutes or hours. They run for **3-6 months** and involve:
- Evidence collection happening daily/weekly
- Human approvals that might take days or weeks
- External events (auditor questions) arriving unpredictably
- System crashes, deployments, network failures during the process

**Traditional Approach (Doesn't Work):**

Simple job queues fail because:
- If the server crashes, you lose all progress
- If you deploy new code, running processes terminate
- You can't "pause" for human input and resume weeks later
- No way to replay history to debug what went wrong

**Our Solution: Temporal Workflows**

Temporal provides **durable execution** where workflows:

1. **Survive Crashes**: Workflow state is persisted to Temporal's server. If your application crashes, the workflow resumes exactly where it left off.

2. **Survive Deployments**: You can deploy new code while workflows are running. Temporal uses versioning to ensure compatibility.

3. **Can Run Indefinitely**: A workflow can sleep for months (literally) and wake up when needed.

4. **Handle Events**: Workflows respond to external signals (user approvals, auditor questions) whenever they arrive.

5. **Provide Full History**: Every step is recorded. You can see exactly what happened 3 months ago.

**How a 6-Month Audit Workflow Works:**

```
Month 1: Discovery + Gap Assessment
  ├─ Week 1: Discovery Agent scans infrastructure
  ├─ Week 2: Framework Expert identifies gaps
  └─ WAIT for human approval (could be 1 day or 2 weeks)

Month 2-4: Evidence Collection
  ├─ Daily: Access Control Agent checks MFA status
  ├─ Weekly: Infrastructure Agent scans for vulnerabilities
  ├─ Monthly: Vendor Risk Agent assesses third parties
  └─ All running concurrently, can fail/retry independently

Month 5: Audit Preparation
  ├─ Evidence Management Agent validates completeness
  ├─ Audit Coordinator generates evidence package
  └─ WAIT for auditor selection

Month 6: Audit Execution
  ├─ WAIT for auditor questions (event-driven)
  ├─ AI generates draft answers
  ├─ WAIT for human approval
  └─ Submit approved answers
```

Throughout this entire 6-month process:
- The workflow can crash and resume without losing progress
- We can deploy new code to fix bugs
- Users can pause/resume at any checkpoint
- Complete audit trail is maintained

**The Decision Logic for Durability:**

When designing a workflow, we ask:

1. **Duration**: Will this take longer than 1 hour?
   - Yes → Use Temporal
   - No → Direct agent invocation is fine

2. **Human Involvement**: Does this need human approval?
   - Yes → Use Temporal (can wait indefinitely for signals)
   - No → Consider simpler orchestration

3. **Failure Recovery**: If this fails halfway, do we want to restart from scratch or resume?
   - Resume → Use Temporal
   - Restart is fine → Simple job queue works

4. **External Events**: Will external systems send us events we need to handle?
   - Yes → Use Temporal (event-driven via signals)
   - No → Regular workflow is fine

---

#### **Principle 3: Vision-First Evidence Collection**

**The Core Innovation:**

Most GRC platforms rely on **API integrations**. They can only work with systems that have APIs and API keys available. This creates problems:

1. **Limited Coverage**: Only ~60% of systems have APIs
2. **Slow Onboarding**: Waiting for customers to provide API keys
3. **Maintenance Burden**: APIs change, integrations break
4. **Access Issues**: Some APIs require high privileges customers won't grant

**Our Approach: Vision as the Universal Interface**

Every system has a **user interface**. Even if there's no API, there's always a web portal, desktop app, or admin console. Our vision-based approach:

1. **Launches a Browser**: Using Playwright, we automate a real Chrome browser
2. **Navigates Like a Human**: Clicks buttons, fills forms, navigates menus
3. **Captures Screenshots**: Takes full-page screenshots of evidence
4. **Analyzes with Claude Vision**: AI "reads" the screenshot like an auditor would
5. **Validates Evidence**: Determines if the screenshot proves the control is met

**The Decision Tree for Evidence Collection:**

For any given control that needs evidence, we follow this logic:

```
Step 1: Do we have API access to this system?
├─ YES → Try API collection
│         └─ API works?
│             ├─ YES → Use API evidence (faster, more reliable)
│             └─ NO → Fall back to vision
└─ NO → Use vision collection

Step 2: If using vision, determine navigation strategy
├─ Do we have a pre-built navigation flow?
│   ├─ YES → Use existing flow
│   └─ NO → Agent figures out navigation dynamically
└─ Execute browser automation

Step 3: Capture screenshot at the right moment
├─ Wait for page to fully load (networkidle state)
├─ Ensure all dynamic content is visible
└─ Take full-page screenshot

Step 4: Analyze screenshot with Claude Vision
├─ Send screenshot + control description + analysis prompt
├─ Claude returns: verdict (PASS/FAIL/UNCLEAR) + confidence (0-100) + reasoning
└─ Store analysis with evidence

Step 5: Determine if human review needed
├─ Confidence > 95% → Auto-approve
├─ Confidence 80-95% → Flag for review (not urgent)
└─ Confidence < 80% → Require immediate human review
```

**Why This is a Competitive Advantage:**

1. **Universal Coverage**: Works with ANY system (SaaS, on-prem, legacy, custom)
2. **Fast Onboarding**: Don't need to wait for API keys
3. **Future-Proof**: Adapts to UI changes (Claude can navigate new layouts)
4. **Auditor-Friendly**: Screenshots are what auditors want to see anyway

**The Self-Healing Navigation Strategy:**

Traditional automation breaks when UIs change. Our approach adapts:

1. **Visual Element Finding**: Instead of hard-coded selectors like `#username-field`, we use Claude to find elements by description: "Find the username input field"

2. **Adaptive Navigation**: If a button moved, Claude Vision identifies its new location by analyzing the current page screenshot

3. **Graceful Degradation**: If automation fails, we alert a human and continue with other evidence

**When Vision Beats APIs:**

Even when APIs exist, vision is sometimes better:

- **Screenshot Requirement**: Auditors want screenshots anyway, so API data alone isn't sufficient
- **Access Restrictions**: Customer won't grant API access with required permissions
- **API Limitations**: API doesn't expose the specific data point we need
- **Validation**: We use vision to validate that API data matches what users actually see

---

#### **Principle 4: Chain of Custody for Legal Admissibility**

**Why Chain of Custody Matters:**

During audits, auditors need to verify:
1. Evidence wasn't tampered with
2. Evidence actually came from the stated source
3. Evidence was collected using reliable methods
4. Evidence was reviewed by qualified personnel

**Our Chain of Custody Model:**

Every piece of evidence tracks its complete journey:

**Collection Stage:**
- WHAT was collected (screenshot, API response, log file)
- WHERE it came from (system URL, API endpoint)
- WHEN it was collected (timestamp)
- WHO collected it (agent ID)
- HOW it was collected (API vs vision, specific tools used)

**Analysis Stage:**
- WHAT AI model analyzed it (Claude Sonnet 4.5)
- WHAT prompt version was used
- WHAT verdict the AI reached (PASS/FAIL/UNCLEAR)
- WHAT confidence level (0-100)
- WHY that verdict (detailed reasoning)

**Review Stage:**
- WHO reviewed it (user ID)
- WHEN they reviewed it (timestamp)
- WHAT decision they made (approved/rejected)
- WHY they made that decision (review notes)

**Custody Chain:**
Each evidence item has a chronological log of every action:
1. **Collected** by Infrastructure Agent at 2025-11-16 10:23:14
2. **Analyzed** by Claude Sonnet 4.5 at 2025-11-16 10:23:18 → PASS (98% confidence)
3. **Reviewed** by john@company.com at 2025-11-16 14:30:22 → Approved
4. **Included** in audit package by Audit Coordinator at 2025-12-01 09:15:33
5. **Submitted** to auditor at 2025-12-01 09:17:45

**Cryptographic Signatures:**

Each custody step is cryptographically signed to prevent tampering. If anyone modifies evidence after collection, the signature becomes invalid.

**The Trust Model:**

This chain of custody enables:
- **Auditor Trust**: They can verify evidence provenance
- **Legal Defense**: If compliance is challenged, we have proof
- **Debugging**: If evidence is wrong, we can trace why
- **Continuous Improvement**: We learn which collection methods work best

---

#### **Principle 5: Real-Time by Default**

**Why Real-Time Matters:**

Traditional GRC tools feel like **static databases**. You submit a request, wait, then refresh the page to see if anything happened. This creates anxiety:
- "Did my request go through?"
- "Is anything happening?"
- "How long will this take?"

Our platform feels like a **living system** because every page updates in real-time.

**The User Experience:**

When a user is on the Dashboard:
1. They see "Discovery Agent started scanning AWS..." appear instantly
2. Progress bar updates as each AWS service is scanned (EC2 → 100%, RDS → 100%, S3 → 47%...)
3. New resources appear in the inventory table as they're discovered
4. Notifications slide in when critical findings are detected
5. All without manual page refresh

**The Architecture Decision:**

Every page establishes a **WebSocket connection** that receives live updates:

**Connection Lifecycle:**
1. **Page Load**: Client opens WebSocket to server
2. **Subscribe**: Client subscribes to relevant channels (audit ID, user ID)
3. **Live Updates**: Server pushes events as they occur
4. **Auto-Reconnect**: If connection drops, client reconnects automatically
5. **Page Unload**: Client closes WebSocket gracefully

**What Gets Sent Over WebSocket:**

We push these real-time events:
- **Agent Activity**: "Access Control Agent found 3 users without MFA"
- **Progress Updates**: Evidence collection is 67% complete
- **Approval Requests**: New item needs your review
- **Critical Findings**: Security vulnerability detected
- **Status Changes**: Audit moved from "In Progress" to "Ready for Auditor"

**The Performance Consideration:**

WebSocket connections are cheap (just an open TCP socket), but we still optimize:

1. **Selective Subscriptions**: Only subscribe to events relevant to current page
2. **Batching**: Group rapid updates (don't send 100 individual messages)
3. **Throttling**: Limit update frequency to what humans can perceive
4. **Fallback**: If WebSocket unavailable, fall back to polling

**The Trust Portal Use Case:**

The Trust Portal (public-facing page showing live audit status) is powered entirely by real-time updates:

Potential customers watching the portal see:
- "Evidence Collection Agent just verified MFA enforcement - PASSED"
- "Infrastructure Security Agent scanning for unencrypted storage..."
- "12 of 47 controls verified today"

This transparency builds trust and demonstrates the platform's capability in real-time.

---

## **2. MULTI-AGENT SYSTEM DESIGN** {#2-multi-agent-system}

### **2.1 Agent Architecture Philosophy**

**What Makes an Agent vs. a Function:**

Many AI platforms call simple LLM wrappers "agents". Our definition is stricter. A true agent has:

1. **Identity & Expertise**:
   - Has a specific role (e.g., "Access Control Specialist with 10 years IAM experience")
   - Defined personality (e.g., "Paranoid about security, advocates for principle of least privilege")
   - Specialized knowledge (e.g., knows SOC 2 controls CC6.1-CC6.7 deeply)

2. **Decision-Making Authority**:
   - Can choose between multiple approaches
   - Determines confidence levels independently
   - Decides when to ask for help

3. **Tool Access**:
   - Has specific tools available (AWS SDK, Okta API, vision collector)
   - Knows when to use each tool
   - Can fall back if primary tool fails

4. **Memory & Context**:
   - Remembers previous executions
   - Learns from human feedback
   - Maintains state across invocations

5. **Communication Skills**:
   - Can explain reasoning to humans
   - Can coordinate with other agents
   - Provides structured outputs

**The Base Agent Pattern:**

Every agent shares common capabilities:

**Initialization:**
- Loads configuration (name, role, expertise, tools)
- Initializes LLM (Claude Sonnet 4.5)
- Sets up tool access
- Loads any specialized knowledge (via RAG from Pinecone)

**Execution Flow:**
1. **Receive Task**: Structured input with clear objective
2. **Plan Approach**: Determine which tools to use, in what order
3. **Execute Actions**: Use tools, call APIs, collect evidence
4. **Reason About Results**: Use Claude to analyze what was found
5. **Determine Confidence**: Calculate how certain the agent is
6. **Decide on Review**: Does this need human oversight?
7. **Return Structured Result**: Success/failure, data, reasoning, evidence

**The Confidence Calculation Logic:**

Agents calculate confidence based on:

1. **Data Source Reliability**:
   - API data from authoritative source → 95-100% confidence
   - Screenshot analyzed by Claude Vision → 85-95% confidence
   - Manual human input → 100% confidence
   - Inferred from indirect evidence → 60-80% confidence

2. **Control Criticality**:
   - Critical control (MFA, encryption) → Require 95%+ confidence
   - Important control (password policy) → 85%+ acceptable
   - Administrative control (documentation) → 75%+ acceptable

3. **Novelty of Scenario**:
   - Seen this exact scenario before → High confidence
   - Similar to past scenarios → Medium confidence
   - Never seen anything like this → Low confidence, require human review

4. **Evidence Completeness**:
   - All required data points present → +10% confidence
   - Missing optional data → No change
   - Missing required data → -30% confidence

**The Human Review Decision:**

An agent triggers human review when:

1. **Confidence Below Threshold**: Result is uncertain
2. **High-Risk Action**: Could cause damage if wrong (e.g., disabling access)
3. **Policy Exception**: Detected but unclear if legitimate
4. **Novel Scenario**: First time encountering this situation
5. **Conflicting Evidence**: Multiple sources disagree
6. **Auditor Will Question**: This will likely need explanation

---

### **2.2 The 16 Specialized Agents**

Our multi-agent system consists of 16 specialized agents, each owning specific controls and workflows. Here's the complete roster:

**Group 1: Discovery & Assessment (Foundation)**
1. **Orchestrator Agent**: The conductor coordinating all other agents
2. **Discovery Agent**: Infrastructure & application discovery
3. **Framework Expert Agent**: SOC 2/ISO 27001 compliance mapping

**Group 2: Technical Security (Controls Implementation)**
4. **Access Control Agent**: IAM, MFA, authentication
5. **Infrastructure Security Agent**: Encryption, firewalls, network security
6. **Code Security Scanner Agent**: SAST/DAST, dependency scanning
7. **Infrastructure Scanner Agent**: Cloud misconfigurations, vulnerabilities

**Group 3: Operational Controls (Process & Change)**
8. **Change Management Agent**: Deployment tracking, change approval
9. **Incident Response Agent**: Incident tracking, SLA monitoring

**Group 4: Third-Party & People Risk**
10. **Vendor Risk Agent**: Third-party security assessments
11. **HR Compliance Agent**: Background checks, training, termination

**Group 5: Documentation & Policy**
12. **Policy Generation Agent**: Writes/updates security policies
13. **Evidence Management Agent**: Organizes, validates evidence

**Group 6: User-Facing Intelligence**
14. **Compliance Copilot Agent**: Answers user questions in chat
15. **Questionnaire Automation Agent**: Fills vendor security questionnaires
16. **Audit Coordinator Agent**: Manages audit process end-to-end

**How They Work Together:**

**Sequential Dependencies:**
- Discovery Agent runs first → Finds all infrastructure
- Framework Expert runs second → Maps controls to infrastructure
- Specialized agents run third → Collect evidence for their controls

**Parallel Execution:**
- Access Control + Infrastructure Security + Vendor Risk can all run simultaneously
- Each owns different controls, no conflicts

**Hierarchical Coordination:**
- Orchestrator Agent manages overall audit workflow
- Delegates to specialized agents for specific tasks
- Aggregates results and manages approvals

---

### **2.3 Agent Communication Patterns**

Agents don't work in isolation. They coordinate through several patterns:

#### **Pattern 1: Sequential Handoff**

**Use Case**: One agent's output is another's input

**Example: Discovery → Framework Expert → Access Control**

**How It Works:**

Step 1: Discovery Agent scans infrastructure
- Finds: Okta tenant, AWS account, GitHub org, 47 SaaS apps
- Outputs: Complete resource inventory with metadata

Step 2: Framework Expert receives inventory
- Analyzes: Which controls apply to which resources
- Determines: Okta is critical for CC6.1, CC6.2, CC6.3 (access controls)
- Outputs: Control-to-resource mapping

Step 3: Access Control Agent receives mapping
- Focuses: Only on Okta resources assigned to access controls
- Collects: MFA status, password policy, access reviews
- Outputs: Evidence for CC6.1-CC6.7 controls

**The Communication Protocol:**

Agents communicate via structured messages:
- **Sender**: Discovery Agent
- **Receiver**: Framework Expert
- **Message Type**: "discovery_complete"
- **Payload**: Resource inventory data
- **Timestamp**: When discovery finished
- **Status**: Success/failure

The receiving agent doesn't start until it receives the "discovery_complete" message.

#### **Pattern 2: Parallel Collaboration**

**Use Case**: Multiple agents work on different aspects simultaneously

**Example: Evidence Collection for 50 Controls**

**How It Works:**

Once the Orchestrator knows which controls need evidence, it assigns them to specialized agents:

- Access Control Agent → Takes 7 controls (CC6.1 through CC6.7)
- Infrastructure Security Agent → Takes 12 controls (CC6.8, CC7.1-CC7.5, etc.)
- Change Management Agent → Takes 4 controls (CC8.1-CC8.4)
- And so on...

All agents work **in parallel**, each focusing on their domain.

**The Coordination Challenge:**

Parallel execution creates challenges:

1. **Resource Conflicts**: What if two agents need to access the same system?
   - Solution: Lock mechanism via Redis
   - Agent 1 acquires lock on "okta-api"
   - Agent 2 waits or uses different method (vision instead of API)

2. **Duplicate Work**: What if two agents collect the same evidence?
   - Solution: Evidence registry
   - Before collecting, agent checks: "Has anyone already collected MFA status?"
   - If yes, reference existing evidence
   - If no, collect and register

3. **Failure Isolation**: If one agent fails, others should continue
   - Solution: Each agent runs independently
   - Failures logged but don't block other agents
   - Orchestrator tracks overall progress

**The Benefit:**

Instead of taking 50 hours sequentially (1 hour per control × 50 controls), parallel execution completes in ~4-6 hours (limited by system access constraints, not agent capacity).

#### **Pattern 3: Hierarchical Orchestration**

**Use Case**: Complex multi-phase workflows

**Example: 6-Month SOC 2 Audit**

**The Orchestrator's Decision Logic:**

The Orchestrator Agent acts like a senior project manager:

**Phase 1 Decision: Ready to Start?**
- Check: Do we have all required credentials?
- Check: Is the audit scope defined?
- Check: Has kickoff meeting happened?
- If all YES → Proceed to discovery
- If any NO → Request missing information, pause workflow

**Phase 2 Decision: Discovery Complete?**
- Check: Did Discovery Agent succeed?
- Check: Were any critical systems unreachable?
- Check: Does resource count seem reasonable?
- If suspicious (e.g., only 3 resources found) → Flag for review
- If normal → Proceed to gap assessment

**Phase 3 Decision: Gaps Need Immediate Attention?**
- Analyze gap severity: Critical / High / Medium / Low
- If any CRITICAL gaps → Pause, require immediate remediation
- If only High/Medium/Low → Continue, schedule remediation in parallel

**Phase 4 Decision: Evidence Collection Strategy**
- Calculate: How many controls need evidence?
- Determine: Which can be automated (80%), which need manual work (20%)
- Allocate: Assign controls to appropriate agents
- Schedule: Some evidence daily, some weekly, some monthly

**Phase 5 Decision: Ready for Audit?**
- Validate: Do we have evidence for all controls?
- Check: Has all evidence been human-reviewed?
- Confirm: Is evidence package complete?
- Only when 100% complete → Signal "ready for auditor"

**The Communication Pattern:**

Orchestrator uses a **hub-and-spoke** model:
- Orchestrator is the hub
- All other agents are spokes
- Agents report back to Orchestrator, don't talk directly to each other

This ensures:
- Central visibility into overall progress
- Consistent decision-making
- Easy debugging (all communication logged centrally)

---

### **2.4 Agent Learning & Improvement**

**The Problem**: Static agents don't improve over time

**Our Solution**: Agents learn from human feedback

**How Agent Learning Works:**

**Feedback Loop 1: Approval/Rejection**
When a human reviews agent work:
- Approved → Reinforces agent's approach
- Rejected → Agent learns what not to do

Example:
- Access Control Agent flags "service-account@company.com" as missing MFA
- Human rejects: "Service accounts don't use MFA"
- Agent learns: If username matches pattern "*-account@*", don't flag MFA

**Feedback Loop 2: Correction**
When human corrects agent work:
- Agent stores: "In situation X, I thought Y, but correct answer is Z"
- Next time situation X occurs → Agent suggests Z

Example:
- Policy Generator writes: "Passwords must be 12 characters"
- Human corrects to: "Passwords must be 14 characters"
- Agent learns: Company standard is 14, not 12

**Feedback Loop 3: Edge Cases**
When human explains why something is acceptable:
- Agent adds to knowledge base

Example:
- Agent flags: "CEO has AWS Admin access - violates least privilege"
- Human explains: "CEO needs emergency access for business continuity"
- Agent learns: Execs with business continuity justification = acceptable exception
- But still flags for annual review

**The Learning Storage:**

Agent learnings are stored in:
1. **Vector Database (Pinecone)**: For semantic similarity matching
2. **Relational Database (PostgreSQL)**: For structured rules
3. **Agent Memory**: For session context

**The Continuous Improvement Metric:**

We track:
- **Approval Rate**: % of agent recommendations accepted by humans
- **False Positive Rate**: % of issues flagged that weren't actually issues
- **Coverage**: % of scenarios agent can handle without human help

Target trajectory:
- Month 1: 70% approval rate (lots of learning needed)
- Month 3: 85% approval rate (understanding company specifics)
- Month 6: 92% approval rate (highly aligned with company practices)

---

## **3. VISION-BASED EVIDENCE COLLECTION** {#3-vision-evidence}

### **3.1 The Vision-First Strategy**

**Why Vision is Our Competitive Moat:**

Every GRC competitor relies on API integrations. This creates a chicken-and-egg problem:
1. Customer wants to see the platform before buying
2. Platform needs API keys to show value
3. Customer won't provide API keys until they buy
4. Platform can't demonstrate value without keys

**Our Solution**: Vision works **without API keys**

For a demo or trial, we can show live evidence collection using just:
- Read-only credentials to web portals
- Or even just screenshots the customer provides
- Claude Vision analyzes and provides insights immediately

**The Customer Onboarding Impact:**

**Traditional GRC Platform:**
- Day 1: Sales demo with fake data
- Day 2-30: Waiting for customer to configure API integrations
- Day 31: Platform finally starts working
- Result: 30 days to value

**Our Platform:**
- Day 1: Sales demo with live evidence collection (vision-based)
- Day 2: Customer sees value, purchases
- Day 3: Begin onboarding, collect evidence via vision immediately
- Day 10-30: Gradually add API integrations for speed/efficiency
- Result: 1 day to value, improve over time

---

### **3.2 Vision Collection Architecture**

**The Five-Stage Process:**

**Stage 1: Browser Automation Setup**

Decision: Local browser or cloud browser (Browserbase)?

**Use Local When:**
- Development/testing
- Customer has restrictive network policies (can't reach cloud browsers)
- Evidence collection is simple (just screenshots, no complex interactions)

**Use Cloud (Browserbase) When:**
- Production
- Need reliability (Browserbase handles failures better)
- Need scale (many concurrent evidence collections)
- Need residential IPs (some systems block datacenter IPs)

**Stage 2: Navigation Execution**

We have three navigation strategies:

**Strategy A: Pre-Recorded Flows**
- We've built 50+ navigation flows for common scenarios
- Example: "Navigate to Okta MFA settings"
- Steps are hardcoded: Click Security → Click Multifactor
- Fast, reliable, works 95% of the time

**Strategy B: Self-Healing Navigation**
- If pre-recorded flow breaks (UI changed), agent adapts
- Takes screenshot of current page
- Uses Claude Vision to find the button/link needed
- Clicks based on visual coordinates
- More robust, slightly slower

**Strategy C: Dynamic Navigation**
- For systems we've never seen before
- Agent figures out navigation on the fly
- Analyzes page structure, identifies likely paths
- Tries options until it reaches the evidence
- Slowest, but works with ANY system

**Decision Logic:**
1. Try Strategy A first (fastest)
2. If fails, fall back to Strategy B (smart retry)
3. If still fails, escalate to Strategy C (full dynamic)

**Stage 3: Screenshot Capture Timing**

**The Challenge**: Capturing too early = incomplete page, too late = wasted time

**Our Approach**:
1. Wait for `networkidle` state (no network requests for 2 seconds)
2. Wait for key elements to be visible (e.g., wait for table to load)
3. Scroll to ensure all content is in view (full-page screenshot)
4. Take screenshot in PNG format (better quality than JPEG for text)

**Special Handling for Dynamic Content:**
- If page has animations, wait for them to complete
- If page has lazy-loaded images, scroll to trigger loading
- If page has collapsible sections, expand them before screenshot

**Stage 4: Claude Vision Analysis**

**The Prompt Engineering Strategy:**

We don't just send the screenshot with "analyze this". We provide:

1. **Context**: "This is the Okta MFA settings page"
2. **Objective**: "Determine if MFA is required for all users"
3. **Specific Checks**: "Look for: policy status, enrollment requirement, allowed factors"
4. **Decision Criteria**: "PASS if required, FAIL if optional"
5. **Output Format**: "Return JSON with verdict, confidence, reasoning"

**The Two-Stage Analysis:**

**Stage 1: Information Extraction**
- Claude identifies all relevant data points on the page
- Example: "MFA Policy: Required", "Factors: Okta Verify, Google Authenticator", "Exceptions: None"

**Stage 2: Control Assessment**
- Given the extracted information, does the control pass?
- Apply framework requirements (SOC 2 CC6.2 requirements)
- Determine confidence based on clarity of evidence

**Confidence Scoring Logic:**

Claude assigns confidence based on:

**95-100% Confidence:**
- Policy explicitly states "Required"
- No exceptions or bypass options visible
- Multiple confirming data points

**85-94% Confidence:**
- Policy implies requirement but not explicit
- Some ambiguity in wording
- Or only one data point (would prefer multiple)

**75-84% Confidence:**
- Policy could be interpreted multiple ways
- Some concerning elements (exceptions exist)
- Need human judgment on whether acceptable

**Below 75% Confidence:**
- Cannot determine from screenshot alone
- Conflicting information
- Critical data not visible

**Stage 5: Evidence Storage & Chain of Custody**

After analysis, we store:

**The Screenshot**:
- Upload to S3/R2 (object storage)
- Filename: `{control_id}/{timestamp}.png`
- Metadata: Resolution, capture settings, page URL

**The Analysis**:
- Store Claude's full response
- Include: verdict, confidence, reasoning, observations
- Model used: claude-sonnet-4.5
- Prompt version: v3.2 (for reproducibility)

**The Custody Record**:
- Timestamp of collection
- Agent that collected it
- Method used (vision)
- Browser/OS details
- Cryptographic hash of screenshot (tamper detection)

---

### **3.3 Vision Collection Strategies**

#### **Strategy 1: Evidence Library**

**The Concept**: Build a library of reusable evidence collection scripts

**Organization**:
```
evidence-library/
├── access-controls/
│   ├── okta-mfa.json
│   ├── aws-password-policy.json
│   └── github-2fa.json
├── encryption/
│   ├── aws-s3-encryption.json
│   └── database-encryption.json
└── logging/
    ├── cloudtrail-enabled.json
    └── audit-logs.json
```

**Each Library Item Contains:**

1. **Metadata**:
   - Control ID (CC6.2)
   - Control name ("MFA Enforcement")
   - Applicable systems (Okta, AWS, GitHub)

2. **Navigation Steps**:
   - Step-by-step instructions to reach evidence
   - Selectors for buttons/links
   - Credentials needed (from vault)

3. **Analysis Prompts**:
   - What to look for in screenshot
   - Pass/fail criteria
   - Edge cases to watch for

4. **Expected Elements**:
   - What should be visible if control passes
   - Warning signs of failure

**The Reusability Benefit:**

Once we've built the "Okta MFA" evidence collector once:
- Every customer with Okta can reuse it
- Agents can automatically select it
- It gets refined over time as we see edge cases

**Version Management:**

Evidence library items are versioned:
- v1.0: Initial implementation
- v1.1: Added check for bypass options
- v1.2: Fixed navigation for Okta's new UI
- v2.0: Added support for Okta Workforce + Customer Identity

Workflows reference specific versions for reproducibility.

---

#### **Strategy 2: Self-Healing Selectors**

**The Problem**: Traditional automation uses CSS selectors

**Example Fragility:**
- Old UI: `<button id="mfa-settings">MFA Settings</button>`
- Selector: `#mfa-settings` (works great!)
- New UI: `<button class="nav-btn">MFA Settings</button>`
- Selector: `#mfa-settings` (broken!)

**Our Solution**: Vision-based element finding

**How It Works:**

Step 1: Take screenshot of current page

Step 2: Ask Claude Vision: "Where is the MFA Settings button?"

Step 3: Claude returns coordinates: `{x: 420, y: 180}`

Step 4: Click at those coordinates

**Why This Works:**

Even if the HTML changes completely, if there's still a button labeled "MFA Settings" somewhere on the page, Claude can find it visually.

**The Fallback Chain:**

1. Try CSS selector (fastest)
2. If fails, try text matching (click element containing "MFA Settings")
3. If fails, use vision to find element (slowest but most reliable)

**Learning from Failures:**

When a selector breaks:
- We detect the failure
- Agent automatically tries vision fallback
- If vision succeeds, we update the library item with new selector
- Next execution uses the updated selector

This creates **self-healing automation** that improves over time.

---

#### **Strategy 3: Multi-System Evidence Aggregation**

**The Challenge**: Some controls require evidence from multiple systems

**Example: CC6.2 (MFA) Evidence Needs:**
- Okta: MFA policy
- AWS: IAM password policy (includes MFA requirement)
- GitHub: Organization 2FA requirement
- VPN: 2FA enforcement
- SSH: Key-based auth requirement

**The Orchestration Logic:**

Step 1: Framework Expert identifies that CC6.2 requires multi-system evidence

Step 2: Access Control Agent determines which systems are relevant
- Okta: Primary identity provider → HIGH PRIORITY
- AWS: Has IAM users → MEDIUM PRIORITY
- GitHub: Developers use it → MEDIUM PRIORITY
- VPN: Used for internal access → HIGH PRIORITY
- SSH: Servers don't use password auth → LOW PRIORITY

Step 3: Collect evidence from each system in parallel
- Use vision for all (or API where available)
- Each collection is independent

Step 4: Aggregate results
- If Okta + AWS + VPN all require MFA → HIGH CONFIDENCE
- If any system allows bypass → FAIL (security is weakest link)
- If evidence conflicts → REQUIRE HUMAN REVIEW

**The Confidence Calculation:**

Multi-system evidence increases confidence:
- 1 system confirms MFA required → 85% confidence
- 2 systems confirm → 92% confidence
- 3+ systems confirm → 98% confidence
- 3+ systems with no bypass options → 100% confidence

Rationale: Consistent configuration across systems indicates strong security posture.

---

### **3.4 Vision vs. API Decision Matrix**

For each evidence collection task, we decide: Vision or API?

**Prefer API When:**
1. **API Available**: System has well-documented API
2. **API Access Granted**: Customer provided keys
3. **Data Structured**: API returns exactly what we need
4. **Speed Matters**: API is 10x faster than vision
5. **Real-Time**: Need up-to-the-second data

**Prefer Vision When:**
1. **No API**: System doesn't provide API
2. **API Limited**: API doesn't expose needed data
3. **Screenshot Required**: Auditor wants visual proof anyway
4. **API Unreliable**: API often fails or times out
5. **Complex Logic**: Need to see what humans see

**Use Both When:**
1. **Validation**: API for data, vision for verification
2. **Completeness**: API for bulk data, vision for edge cases
3. **Trust**: API for speed, vision for audit trail

**The Cost-Benefit Analysis:**

**API Collection:**
- Cost: ~$0.001 per call
- Speed: 1-5 seconds
- Reliability: 95%+ (if API is stable)
- Evidence Quality: Data only, no visual proof

**Vision Collection:**
- Cost: ~$0.15 per screenshot (browser + Claude Vision)
- Speed: 10-30 seconds (navigation + screenshot + analysis)
- Reliability: 90%+ (can fail if UI changes)
- Evidence Quality: Screenshot + analysis (what auditors want)

**The Strategic Decision:**

- Use API for frequent, automated monitoring (daily MFA checks)
- Use vision for audit evidence packages (quarterly/annual)
- This optimizes cost while ensuring audit quality

---

## **4. ORCHESTRATION PHILOSOPHY** {#4-orchestration}

### **4.1 Why Three Orchestration Layers?**

We use **three different orchestration frameworks**, each for specific purposes:

**Temporal**: Durable workflows (months-long processes)
**LangGraph**: Agent decision trees (conditional logic)
**CrewAI**: Multi-agent coordination (parallel teams)

**Why Not Just One?**

Each framework excels at different scenarios:

**Temporal's Strength**: Duration & Durability
- Workflows that run for weeks/months
- Must survive crashes, deployments
- Event-driven (wait for external signals)
- Built-in retry and error handling

**Temporal's Weakness**: Simple logic, not AI-native
- You write code defining workflow steps
- No built-in LLM integration
- Not designed for complex agent reasoning

**LangGraph's Strength**: AI-Native Decision Making
- Agents that choose next steps dynamically
- Conditional branching based on AI reasoning
- State machines with complex logic
- Native LLM tool calling

**LangGraph's Weakness**: Not durable
- Runs in-memory, crashes = start over
- Not designed for long-running processes
- No built-in persistence

**CrewAI's Strength**: Multi-Agent Teamwork
- Coordinate multiple AI agents
- Parallel and sequential execution
- Agent collaboration patterns
- Built-in agent communication

**CrewAI's Weakness**: Limited workflow features
- No durable execution
- Basic error handling
- Limited state management

**Our Solution**: Use all three, layered appropriately

```
Temporal (outer layer)
└─> Manages 6-month audit workflow
    └─> Calls LangGraph for complex agent decisions
        └─> LangGraph uses CrewAI for multi-agent tasks
```

---

### **4.2 Temporal Workflow Design Patterns**

#### **Pattern 1: Long-Running Audit Workflow**

**Duration**: 3-6 months
**Human Checkpoints**: 5-7
**Phases**: 6

**The Workflow State Machine:**

```
[START] → Discovery → [WAIT: Human Approval] → Gap Assessment →
[WAIT: Human Approval] → Implementation → Evidence Collection (3 months) →
[WAIT: Auditor Selection] → Audit Execution → [WAIT: Audit Questions Loop] →
[COMPLETE]
```

**Key Design Decisions:**

**Decision 1: When to Wait for Human Approval**

We require approval at critical junctures:
- **After Discovery**: Ensure we found everything
- **After Gap Assessment**: Confirm remediation plan
- **Before Audit Starts**: Final readiness check

We DON'T wait for approval on:
- **Evidence Collection**: Runs continuously, human reviews async
- **Minor Updates**: Policy changes, adding users

**Decision 2: How Long to Wait for Approval**

Timeout strategy:
- **Critical Approvals**: 7-14 days timeout, then escalate
- **Non-Critical**: 30 days timeout, then auto-approve with audit log
- **Urgent**: 24-48 hours, then alert + block

**Decision 3: What Happens on Timeout**

Three strategies:
1. **Block**: Workflow pauses indefinitely (critical approvals)
2. **Escalate**: Notify supervisor (important approvals)
3. **Auto-proceed**: Continue with assumption (low-risk items)

Example:
- Discovery approval timeout → Escalate to manager
- Evidence review timeout → Auto-approve evidence with high confidence (>95%)
- Gap remediation timeout → Block workflow (too risky to proceed)

**Decision 4: Handling Failures**

Temporal's retry strategy:
- **Transient Failures** (network timeout): Retry with exponential backoff
- **Intermittent Failures** (API rate limit): Retry after delay
- **Permanent Failures** (invalid credentials): Don't retry, alert human

Retry configuration per activity:
- Discovery Agent: Max 5 retries, 30s initial interval
- Evidence Collection: Max 3 retries, 1min initial interval
- Audit Submission: Max 10 retries, 5min initial interval

---

#### **Pattern 2: Continuous Evidence Collection**

**Duration**: 3-6 months
**Frequency**: Daily/Weekly/Monthly depending on control
**Parallelism**: Multiple controls collected simultaneously

**The Child Workflow Pattern:**

Main audit workflow spawns a **child workflow** for continuous evidence collection:

```
Main Workflow:
├─ Phase 1-3: Setup (Weeks 1-4)
├─ Phase 4: Start Evidence Collection Child Workflow
│   └─ Runs independently for 3 months
├─ Phase 5: Signal child workflow to stop
└─ Phase 6: Use collected evidence for audit
```

**Why a Child Workflow?**

- **Independent Lifecycle**: Can run for months while parent sleeps
- **Parallel Execution**: Doesn't block main workflow
- **Separate Error Handling**: Failures in evidence collection don't crash main audit
- **Queryable State**: Can check progress anytime

**The Evidence Collection Logic:**

The child workflow runs a **loop** for 3 months:

```
LOOP (for 3 months):
  FOR each control:
    - Check: Is evidence needed today?
      - Daily controls (MFA status): Collect every day
      - Weekly controls (vulnerability scan): Collect every Monday
      - Monthly controls (access review): Collect on 1st of month

    - If collection due:
      - Invoke appropriate agent
      - Store evidence
      - Update completion percentage

  SLEEP until next check (every 6 hours)
```

**Why Check Every 6 Hours?**

Balance between:
- **Responsiveness**: New evidence shows up within 6 hours
- **Efficiency**: Not checking every minute (wasteful)
- **Temporal Limits**: Workflow can sleep up to months (we use 6hr for UX)

**The Stopping Logic:**

When main workflow signals "stop collection":
1. Finish current evidence collection (don't interrupt)
2. Store final summary
3. Mark workflow complete
4. Return aggregated results to parent

---

#### **Pattern 3: Event-Driven Audit Q&A**

**Duration**: 1-2 months
**Trigger**: External events (auditor asks question)
**Challenge**: Unpredictable timing

**The Event Loop Pattern:**

```
WHILE audit not complete:
  WAIT for signal "auditor_question"

  WHEN signal received:
    - Parse question
    - Invoke Compliance Copilot to draft answer
    - Request human review of draft
    - WAIT for signal "answer_approved"
    - Submit approved answer to auditor
```

**Why This Pattern Works:**

Traditional REST APIs can't handle:
- "Wait for auditor question" (could be minutes or weeks)
- If server crashes during wait, lose state

Temporal's signals:
- Workflow sleeps indefinitely (no cost)
- Signal wakes workflow instantly
- State preserved even if server crashes

**The Signal Design:**

We use typed signals:

**Signal: auditor_question**
- Payload: `{question_id, text, deadline, severity}`
- Workflow: Wakes from sleep, processes question
- Return: Acknowledgment

**Signal: answer_approved**
- Payload: `{question_id, approved_text, reviewer}`
- Workflow: Submits answer, returns to waiting

**Signal: audit_complete**
- Payload: `{report_url, status}`
- Workflow: Exits loop, marks complete

---

### **4.3 LangGraph State Machine Patterns**

**When We Use LangGraph:**

Scenarios requiring complex conditional logic:
- "Check MFA, if failing, try remediation, if remediation fails, escalate"
- "Scan infrastructure, if find high-severity issue, assess risk, if critical, auto-fix, otherwise flag for review"
- "Analyze policy, if unclear, ask clarifying questions, incorporate answers, regenerate"

**The State Machine Approach:**

Instead of procedural code with if/else statements, we define states and transitions:

```
States:
- check_mfa
- mfa_passed
- mfa_failed
- attempt_remediation
- remediation_succeeded
- remediation_failed
- escalate
- complete

Transitions:
- check_mfa → mfa_passed (if 100% users have MFA)
- check_mfa → mfa_failed (if any users lack MFA)
- mfa_failed → attempt_remediation (automatically)
- attempt_remediation → remediation_succeeded (if fixed)
- attempt_remediation → remediation_failed (if can't fix)
- remediation_failed → escalate (alert human)
- mfa_passed → complete (done)
- remediation_succeeded → complete (done)
```

**Example: Access Control Assessment State Machine**

**State 1: Check MFA**
- Action: Query Okta API for all users
- Decision: All have MFA enrolled?
  - YES → Transition to "mfa_passed"
  - NO → Transition to "mfa_failed"

**State 2a: MFA Passed**
- Action: Store evidence, mark control as passing
- Transition: → complete

**State 2b: MFA Failed**
- Action: Identify which users lack MFA
- Decision: Can we auto-remediate?
  - If users are inactive → Transition to "attempt_remediation"
  - If users are active → Transition to "escalate" (can't force humans)

**State 3: Attempt Remediation**
- Action: For inactive users, disable accounts
- Decision: Did remediation work?
  - YES → Transition to "remediation_succeeded"
  - NO → Transition to "remediation_failed"

**State 4: Escalate**
- Action: Create approval request for human
- Transition: → complete (human will handle it)

**Why State Machines?**

Benefits:
1. **Clarity**: Visual representation of logic
2. **Testability**: Easy to test each state independently
3. **Resumability**: Can pause/resume at any state
4. **Auditability**: Clear log of state transitions
5. **Flexibility**: Easy to add new states/transitions

---

### **4.4 CrewAI Multi-Agent Coordination**

**When We Use CrewAI:**

Scenarios requiring multiple agents to collaborate:
- "Three agents work together to generate, review, and publish a policy"
- "Five agents scan different aspects of infrastructure in parallel"
- "Team of agents prepare audit response package"

#### **Pattern 1: Sequential Crew (Pipeline)**

**Use Case**: Policy Generation

**The Team:**
1. **Policy Writer Agent**: Drafts initial policy
2. **Legal Review Agent**: Checks for compliance issues
3. **Technical Review Agent**: Ensures technical accuracy
4. **Publisher Agent**: Formats and publishes

**The Workflow:**
```
Policy Writer drafts →
Legal Reviewer suggests changes →
Policy Writer incorporates feedback →
Technical Reviewer validates →
Publisher finalizes
```

**How CrewAI Coordinates:**

CrewAI passes output from one agent as input to the next:
- Agent 1 output → Agent 2 input
- Agent 2 output → Agent 3 input
- And so on...

Each agent only starts after previous completes.

**The Iteration Logic:**

If reviewer finds issues:
- Reviewer doesn't fix (stays in their role)
- Sends feedback to writer
- Writer iterates on draft
- Loop continues until reviewer approves

Maximum iterations: 3 (prevent infinite loops)

---

#### **Pattern 2: Parallel Crew (Concurrent)**

**Use Case**: Comprehensive Infrastructure Scan

**The Team:**
1. **AWS Scanner Agent**: Scans AWS resources
2. **GCP Scanner Agent**: Scans GCP resources
3. **Okta Scanner Agent**: Scans identity provider
4. **GitHub Scanner Agent**: Scans code repositories
5. **SaaS Scanner Agent**: Discovers SaaS applications

**The Workflow:**
```
All 5 agents start simultaneously →
Each scans their domain →
Results aggregated when all complete
```

**How CrewAI Coordinates:**

All agents start at once, work independently:
- No dependencies between agents
- Each has different tools
- Results merged at end

**The Aggregation Logic:**

Once all agents complete, an **Aggregator Agent** combines results:
- Deduplicates resources (same database found by AWS + SaaS scanner)
- Categorizes by type (compute, storage, SaaS, etc.)
- Identifies relationships (this S3 bucket used by this EC2 instance)
- Generates system boundary diagram

---

#### **Pattern 3: Hierarchical Crew (Manager + Workers)**

**Use Case**: Audit Preparation

**The Team:**
- **Audit Manager Agent** (coordinator)
  - **Evidence Validator Agent** (worker)
  - **Gap Identifier Agent** (worker)
  - **Documentation Generator Agent** (worker)
  - **Submission Packager Agent** (worker)

**The Workflow:**

Manager coordinates workers:
```
Manager: "Validate all evidence"
└─> Evidence Validator: Validates 47 pieces of evidence

Manager: "Identify any gaps"
└─> Gap Identifier: Found 3 controls with incomplete evidence

Manager: "Collect missing evidence"
└─> (Delegates to other agents)

Manager: "Generate audit documentation"
└─> Documentation Generator: Creates narratives

Manager: "Package for submission"
└─> Submission Packager: Bundles everything
```

**Why Hierarchical?**

Benefits:
- **Manager** has full context, makes strategic decisions
- **Workers** focus on specific tasks, report back
- **Delegation** allows manager to handle complexity
- **Accountability** clear who did what

---

### **4.5 Combining All Three Orchestration Layers**

**Real-World Example: Complete SOC 2 Audit**

**Temporal (Outer Layer)**:
- Manages 6-month workflow
- Handles human approvals
- Survives crashes/deployments
- Provides durable execution

**LangGraph (Middle Layer)**:
- Used within Temporal activities
- Example: "Assess and remediate MFA gaps" activity uses state machine
- Handles conditional logic and agent decisions

**CrewAI (Inner Layer)**:
- Used within LangGraph nodes
- Example: State machine's "scan infrastructure" node uses CrewAI crew
- Coordinates multiple specialist agents in parallel

**The Complete Flow:**

```
Temporal Workflow: SOC 2 Audit
├─ Activity: Discovery
│   └─> CrewAI: Discovery Crew (5 agents scanning in parallel)
│
├─ Activity: Gap Assessment
│   └─> LangGraph: Gap Assessment State Machine
│       └─> Uses Framework Expert Agent
│
├─ WAIT: Human approval of gaps
│
├─ Activity: Remediate MFA Gaps
│   └─> LangGraph: MFA Remediation State Machine
│       ├─ State: Check MFA
│       ├─ State: Identify Issues
│       └─ State: Attempt Fix
│
├─ Activity: Evidence Collection (3 months)
│   └─> Temporal Child Workflow: Continuous Collection
│       └─> Daily: Invoke Access Control Agent
│
└─ Activity: Audit Preparation
    └─> CrewAI: Audit Prep Crew
        ├─ Evidence Validator
        ├─ Documentation Generator
        └─ Submission Packager
```

This layered approach gives us:
- **Durability** from Temporal (months-long execution)
- **Intelligence** from LangGraph (smart decisions)
- **Teamwork** from CrewAI (multi-agent coordination)

---

## **5. DATABASE DESIGN PRINCIPLES** {#5-database}

### **5.1 Agent-First Data Model**

**Traditional GRC Data Model:**
```
User creates → Control record
User uploads → Evidence file
User writes → Risk assessment
```

**Our Agent-First Model:**
```
Agent discovers → Resource record (with agent attribution)
Agent collects → Evidence record (with AI analysis + human review)
Agent assesses → Risk record (with confidence + reasoning)
```

**The Core Difference:**

Every table tracks:
- **WHO created it** (agent ID or user ID)
- **HOW it was created** (API, vision, manual)
- **WHEN it was created** (timestamp)
- **WHY it was created** (reasoning, context)
- **CONFIDENCE level** (how sure we are)
- **REVIEW status** (pending, approved, rejected)

### **5.2 Core Tables & Relationships**

**The Entity Hierarchy:**

```
Organization
├── Audits (multiple over time)
│   ├── Controls (150+ for SOC 2)
│   │   ├── Evidence (multiple pieces per control)
│   │   │   ├── Evidence Files (screenshots, logs, etc.)
│   │   │   └── AI Analyses (Claude's assessment)
│   │   └── Gaps (if control not met)
│   │       └── Remediation Plans
│   └── Approvals (human review queue)
│       └── Approval Comments
├── Resources (infrastructure inventory)
│   ├── Relationships (how resources connect)
│   └── Data Classifications
├── Agents (the 16 specialists)
│   ├── Agent Executions (every time an agent runs)
│   │   └── Execution Logs
│   └── Agent Learnings (feedback from humans)
├── Vendors (third parties)
│   └── Risk Assessments
└── Personnel
    ├── Training Records
    └── Background Checks
```

### **5.3 Critical Design Decisions**

#### **Decision 1: Immutable Evidence**

Once evidence is collected, it's **never modified**. If we need to update it:
1. Create new evidence record
2. Link to previous version
3. Preserve full history

**Why:**
- **Audit Trail**: Auditors can see complete history
- **Legal**: Can prove evidence wasn't tampered with
- **Debugging**: Can see what changed and when

#### **Decision 2: Dual Storage for Evidence Files**

**The Challenge**: Screenshots/documents are large (1-10MB each), we'll collect 1000s

**Our Solution**:
- **Metadata** in PostgreSQL (searchable, fast)
- **Files** in S3/R2 (cheap, scalable)

PostgreSQL stores:
- File URL, size, format, hash
- What it proves (control ID)
- When collected, by whom
- AI analysis

S3/R2 stores:
- Actual screenshot/document
- Organized: `{org_id}/{audit_id}/{control_id}/{timestamp}.png`

#### **Decision 3: Vector Database for RAG**

**Use Case**: Agents need instant access to compliance knowledge

**What We Store in Pinecone:**
- SOC 2 control descriptions + requirements
- ISO 27001 control mappings
- Company-specific policies
- Past audit findings + remediation
- Agent learnings from human feedback

**How Agents Use It:**

When Framework Expert needs to assess a gap:
1. Query: "What does CC6.2 require?"
2. Pinecone returns: Top 5 most relevant control requirements
3. Agent uses that context + current infrastructure state
4. Makes informed decision

This is **Retrieval Augmented Generation (RAG)** - gives AI access to specific knowledge beyond its training data.

#### **Decision 4: Redis for Real-Time State**

**Use Cases:**

1. **Agent Coordination**: Lock mechanism
   - Agent 1 wants to scan Okta
   - Checks Redis: `SETNX okta-api-lock agent-1-id 300` (5min lock)
   - If returns 1 → Got lock, proceed
   - If returns 0 → Another agent using it, wait or use different method

2. **Progress Tracking**: Real-time updates
   - Evidence collection is 67% complete
   - Stored in Redis for instant access
   - WebSocket reads from Redis to update UI

3. **Cache**: Expensive queries
   - List of all resources (queried frequently)
   - Cached in Redis for 5 minutes
   - Avoids repeated PostgreSQL queries

4. **Rate Limiting**: API usage
   - Track: AWS API calls this minute
   - Limit: Max 100 calls/minute
   - Stored in Redis with TTL

**Why Not Just PostgreSQL?**

Redis is:
- **Faster**: In-memory vs disk
- **Better for ephemeral data**: Locks, caches expire automatically
- **Atomic operations**: SETNX is atomic, perfect for locks

---

## **6. API & INTEGRATION STRATEGY** {#6-api-integration}

### **6.1 API Architecture Philosophy**

**Design Principle**: Type-safe, auto-documented, frontend-backend contract

**Why tRPC?**

Traditional REST APIs have problems:
1. **Type Mismatch**: Frontend expects `userId` (string), backend sends `user_id` (number)
2. **Outdated Docs**: OpenAPI spec doesn't match actual endpoints
3. **Manual Validation**: Have to write validators for every endpoint
4. **Duplicate Types**: Define types in frontend AND backend

**tRPC Solution**:
- **Share Types**: Single TypeScript interface defines request/response
- **Auto-Validation**: Zod schemas validate at runtime
- **Auto-Complete**: Frontend gets IntelliSense for all endpoints
- **Type Errors**: Can't call API with wrong types (compile-time safety)

### **6.2 API Organization**

**Router Structure:**

```
api/
├── audits
│   ├── create
│   ├── list
│   ├── get
│   ├── update
│   ├── startWorkflow
│   └── approveDiscovery
├── evidence
│   ├── list
│   ├── upload
│   ├── analyze (calls Claude Vision)
│   └── approve
├── controls
│   ├── list
│   ├── get
│   └── assessGap
├── resources
│   ├── list
│   ├── scan (triggers Discovery Agent)
│   └── classify
├── approvals
│   ├── list
│   ├── approve
│   └── reject
├── agents
│   ├── list
│   ├── execute (invoke specific agent)
│   └── status
└── copilot
    ├── ask (chat with Compliance Copilot)
    └── history
```

### **6.3 Integration Patterns**

**We integrate with 50+ external systems. Each follows one of three patterns:**

#### **Pattern 1: SDK-Based Integration**

**When**: System provides official SDK (AWS, Okta, GitHub)

**How It Works:**
1. Customer provides API credentials (stored in Doppler)
2. Agent initializes SDK with credentials
3. Agent calls SDK methods directly
4. SDK handles authentication, rate limiting, retries

**Example: AWS Integration**

Agent needs to scan EC2 instances:
- Initialize AWS SDK with access key
- Call: `ec2.describeInstances()`
- SDK returns all instances
- Agent processes, stores in database

**Benefits**:
- **Reliable**: SDK maintained by vendor
- **Full Features**: Access to all API capabilities
- **Type-Safe**: SDK provides TypeScript types
- **Auto-Retry**: SDK handles transient failures

**Drawbacks**:
- **Dependency**: Tied to SDK version
- **Permissions**: Need correct IAM policies configured

#### **Pattern 2: REST API Integration**

**When**: System has API but no official SDK

**How It Works:**
1. Agent makes HTTP requests directly
2. Parse JSON responses
3. Handle errors, rate limits manually

**Example: Vendor Security Questionnaire API**

Agent auto-fills questionnaire:
- POST request to `/api/questionnaire/123/answer`
- Body: `{question_id: "q45", answer: "We use AES-256 encryption"}`
- Response: Success/failure

**Benefits**:
- **Flexible**: Works with any API
- **Control**: Handle requests exactly as needed

**Drawbacks**:
- **Manual Work**: Have to implement retries, rate limiting
- **Breaking Changes**: Vendor changes API, our code breaks
- **Authentication**: Have to implement OAuth, API keys, etc.

#### **Pattern 3: Vision-Based Integration**

**When**: No API available, or API doesn't provide needed data

**How It Works:**
- Playwright automates browser
- Navigates to system
- Captures screenshots
- Claude Vision analyzes

**Example: Legacy HR System**

Agent collects background check evidence:
- Launch browser, log into HR portal
- Navigate to employee records
- Screenshot background check status
- Claude analyzes: "All employees have completed background checks"

**Benefits**:
- **Universal**: Works with ANY system
- **No Permission Issues**: Just need read-only access
- **Screenshot Evidence**: Auditors want this anyway

**Drawbacks**:
- **Slower**: 10-30 seconds vs <1 second for API
- **Fragile**: UI changes can break navigation
- **Cost**: Claude Vision API costs more than simple API calls

### **6.4 Integration Decision Matrix**

For each new integration, we decide:

**Question 1: Does system have API?**
- YES → Consider SDK or REST
- NO → Must use vision

**Question 2: Do we need write access or just read?**
- Write → MUST use API (can't automate write via vision safely)
- Read → Vision is acceptable

**Question 3: How often will we call this?**
- Frequently (daily) → Prefer API for speed/cost
- Rarely (quarterly) → Vision is fine

**Question 4: How critical is accuracy?**
- Critical (encryption status) → API for certainty
- Important (policy text) → Vision with high confidence threshold

**Question 5: Do auditors want screenshot?**
- Yes → Use vision or API + vision
- No → API sufficient

**The Strategic Approach:**

- **MVP**: Use vision for everything (fast to implement)
- **Optimization**: Add API integrations for high-frequency calls
- **Long-term**: Hybrid (API for data, vision for validation)

---

## **7. REAL-TIME ARCHITECTURE** {#7-realtime}

### **7.1 Why Real-Time Matters**

**The User Experience Impact:**

Without real-time:
- User: "I clicked 'Start Audit'"
- System: Silence...
- User: "Did it work? Should I click again?"
- User: Refreshes page
- User: Still no feedback
- User: Frustrated, confused

With real-time:
- User: "I clicked 'Start Audit'"
- System: "✓ Audit started" (instant feedback)
- System: "Discovery Agent scanning AWS..." (5 seconds later)
- System: "Found 127 EC2 instances" (20 seconds later)
- System: "Scanning RDS databases..." (25 seconds later)
- User: Confident, informed

### **7.2 WebSocket Strategy**

**Architecture:**

```
Browser
  ↕ WebSocket connection
Next.js API Route
  ↕ Subscribes to Redis pub/sub
Redis (Message Broker)
  ↑ Agents publish events
Agents (running in background)
```

**The Flow:**

1. **Page Loads**: Browser opens WebSocket to `/api/ws/audit/audit-123`
2. **Server Subscribes**: API route subscribes to Redis channel `audit:audit-123`
3. **Agent Publishes**: Discovery Agent publishes `{"event": "resource_found", "data": {...}}`
4. **Redis Broadcasts**: All subscribers receive message
5. **Server Forwards**: API route sends to browser via WebSocket
6. **UI Updates**: React component updates state, UI re-renders

### **7.3 Event Types**

We send these real-time events:

**Agent Activity Events:**
- `agent_started`: "Access Control Agent started MFA verification"
- `agent_progress`: "Scanning... 47/127 users checked"
- `agent_completed`: "MFA verification complete - Found 3 issues"
- `agent_failed`: "AWS API rate limit exceeded, retrying in 60s"

**Evidence Events:**
- `evidence_collected`: "Screenshot captured for CC6.2"
- `evidence_analyzed`: "Claude Vision verdict: PASS (98% confidence)"
- `evidence_approved`: "User approved MFA evidence"

**Approval Events:**
- `approval_requested`: "New item needs your review"
- `approval_completed`: "Gap assessment approved by john@company.com"

**Progress Events:**
- `workflow_progress`: "Audit 67% complete (32/47 controls verified)"
- `phase_completed`: "Discovery phase complete"

**Critical Events:**
- `critical_finding`: "⚠️ 3 users missing MFA - requires immediate attention"
- `error`: "Failed to connect to Okta API"

### **7.4 Selective Subscription Strategy**

**The Problem**: Don't send ALL events to ALL users

**Example:**
- User A is viewing Audit 123
- User B is viewing Audit 456
- Agent working on Audit 123 shouldn't spam User B

**Our Solution**: Scoped subscriptions

**Subscription Scopes:**

1. **User Scope**: `user:{user_id}`
   - Personal notifications
   - Approval requests assigned to this user
   - Direct messages from agents

2. **Audit Scope**: `audit:{audit_id}`
   - All activity for this specific audit
   - Only relevant if user has this audit open

3. **Organization Scope**: `org:{org_id}`
   - Organization-wide announcements
   - Critical findings affecting everyone

4. **Global Scope**: `global`
   - System-wide events (maintenance, outages)

**The Subscription Logic:**

When user opens Dashboard showing Audit 123:
- Subscribe to: `user:u-456`, `audit:audit-123`, `org:org-789`
- Unsubscribe from: Any previous audit scopes

When user navigates to different audit:
- Unsubscribe from: `audit:audit-123`
- Subscribe to: `audit:audit-456`

**The Performance Benefit:**

- Users only receive relevant events (not 1000s of irrelevant ones)
- Redis efficiently routes messages (built-in pub/sub)
- Scales to 1000s of concurrent users

### **7.5 Reconnection Strategy**

**The Problem**: Network interruptions, WiFi drops, server restarts

**Naive Approach**: Connection drops, user sees stale data

**Our Approach**: Automatic reconnection + state sync

**The Reconnection Logic:**

1. **Detect Disconnect**: WebSocket `onclose` event fires
2. **Attempt Reconnect**: Every 2 seconds, try to reconnect
3. **Exponential Backoff**: If repeated failures, wait longer (2s → 4s → 8s → max 30s)
4. **Sync State**: On reconnect, request missed events
5. **Resume**: Continue from where we left off

**The State Sync Protocol:**

When reconnecting:
- Client sends: `last_event_id: "evt_12345"`
- Server queries: Events after `evt_12345`
- Server sends: All missed events (caught up)
- Client applies: Updates UI with missed activity

**The User Experience:**

- WiFi drops → Small icon shows "Reconnecting..."
- WiFi back → Icon changes to "Connected"
- UI updates with any missed events
- User never manually refreshes

---

## **8. AGENT COMMUNICATION PATTERNS** {#8-agent-communication}

### **8.1 Why Agents Need to Communicate**

**The Coordination Challenge:**

Agents aren't isolated. They need to:
- **Share discoveries**: Discovery Agent finds resources → Framework Expert needs that list
- **Avoid duplicates**: Access Control already checked MFA → Infrastructure Agent shouldn't repeat
- **Coordinate access**: Both need Okta API → Can't both use simultaneously (rate limits)
- **Escalate issues**: Change Management finds suspicious deployment → Security Agent investigates

### **8.2 Message-Based Communication**

**The Architecture:**

```
Agent A
  ↓ Publishes message to Redis
Redis (Message Queue)
  ↓ Delivers to subscribers
Agent B (subscribed to relevant topics)
```

**Message Structure:**

Every inter-agent message has:
- **From**: Sender agent ID
- **To**: Recipient agent ID (or broadcast)
- **Type**: Message type (discovery_complete, help_needed, etc.)
- **Payload**: Actual data
- **Priority**: urgent / normal / low
- **Timestamp**: When sent

**Example Message:**

```
{
  "from": "agent-discovery-001",
  "to": "agent-framework-expert-001",
  "type": "discovery_complete",
  "priority": "normal",
  "payload": {
    "resources": [...],
    "total_count": 127,
    "critical_resources": [...]
  },
  "timestamp": "2025-11-16T10:23:45Z"
}
```

### **8.3 Communication Patterns**

#### **Pattern 1: Request-Response**

**Use Case**: Agent needs information from another agent

**Example:** Access Control asks Discovery about Okta details

**The Flow:**
1. Access Control → Send request: "Give me Okta tenant info"
2. Discovery → Receive request, process
3. Discovery → Send response: "Okta tenant: company.okta.com, 47 users"
4. Access Control → Receive response, continue work

**Implementation:**
- Request message has `correlation_id`
- Response message includes same `correlation_id`
- Requester waits (with timeout) for response

**Timeout Strategy:**
- If no response in 30 seconds → Retry
- If 3 retries fail → Escalate to Orchestrator

#### **Pattern 2: Broadcast Notification**

**Use Case**: Agent wants to inform all others about event

**Example:** Discovery completed, everyone can proceed

**The Flow:**
1. Discovery → Broadcast: "Discovery complete, found 127 resources"
2. All other agents receive notification
3. Framework Expert: "Great, I'll start gap assessment"
4. Access Control: "I'll check IAM configurations"
5. Infrastructure Security: "I'll scan for vulnerabilities"

**Implementation:**
- Publish to `broadcast` channel
- All agents subscribed
- Each agent filters messages (only process relevant ones)

#### **Pattern 3: Resource Locking**

**Use Case**: Prevent conflicts when accessing shared resources

**Example:** Both Access Control and Infrastructure Security need Okta API

**The Flow:**
1. Access Control → Request lock: `SETNX okta-api-lock agent-access-001 300`
2. Redis → Returns 1 (lock acquired)
3. Access Control → Uses Okta API
4. Access Control → Release lock: `DEL okta-api-lock`
5. Infrastructure Security → Request lock (now succeeds)

**If Lock Unavailable:**
- Agent checks lock TTL (time to live)
- Waits if short TTL (will expire soon)
- Uses alternative method if long wait (e.g., vision instead of API)

#### **Pattern 4: Work Queue**

**Use Case**: Distribute tasks among multiple agents

**Example:** 47 controls need evidence, 5 agents available

**The Flow:**
1. Orchestrator → Pushes 47 tasks to Redis queue
2. Agent 1 → Pops task from queue: "Collect evidence for CC6.1"
3. Agent 2 → Pops different task: "Collect evidence for CC6.2"
4. Agents work in parallel
5. Each agent pops next task when current completes

**Benefits:**
- **Load Balancing**: Work distributed evenly
- **Fault Tolerance**: If agent fails, task stays in queue
- **Scalability**: Add more agents to process faster

---

## **9. MONOREPO ORGANIZATION** {#9-monorepo}

### **9.1 Why Monorepo?**

**The Alternative (Polyrepo):**

Separate repositories:
- `grc-web` (frontend)
- `grc-api` (backend)
- `grc-agents` (agents)
- `grc-workflows` (Temporal workflows)

**Problems:**
- **Code Duplication**: Shared types defined 4 times
- **Version Misalignment**: Frontend expects API v2, backend is v3
- **Difficult Refactoring**: Change one interface, update 4 repos
- **Complex CI/CD**: Deploy 4 repos in correct order

**Our Solution (Monorepo):**

Single repository:
```
grc-platform/
├── apps/
│   ├── web/ (Next.js frontend)
│   └── api/ (Next.js API routes)
├── packages/
│   ├── agents/ (16 agent implementations)
│   ├── workflows/ (Temporal workflows)
│   ├── database/ (Prisma schema)
│   ├── ui/ (shared React components)
│   └── types/ (shared TypeScript types)
└── turbo.json (Turborepo config)
```

**Benefits:**
- **Shared Code**: Types defined once, used everywhere
- **Atomic Changes**: Change interface + all consumers in single commit
- **Type Safety**: Frontend can't compile if API types mismatch
- **Simplified Deployment**: Single CI/CD pipeline

### **9.2 Package Structure**

#### **apps/web** (Next.js Frontend)

Contains:
- Page components (Dashboard, Audits, Evidence, etc.)
- Layouts (shell, navigation)
- tRPC client
- WebSocket hooks

Dependencies:
- `@grc/ui` (shared components)
- `@grc/types` (TypeScript interfaces)
- `@grc/database` (Prisma client, read-only)

#### **apps/api** (Next.js API Routes)

Contains:
- tRPC routers
- WebSocket server
- Temporal workflow clients
- Authentication middleware

Dependencies:
- `@grc/agents` (to invoke agents)
- `@grc/workflows` (to start/signal workflows)
- `@grc/database` (Prisma client, read-write)
- `@grc/types` (shared types)

#### **packages/agents** (AI Agents)

Contains:
- Base agent class
- 16 specialist agents
- Agent tools (AWS SDK, Okta SDK, vision collector)

Dependencies:
- `@grc/database` (to store results)
- `@grc/types`
- External: `@anthropic-ai/sdk`, `playwright`

#### **packages/workflows** (Temporal)

Contains:
- Workflow definitions
- Activity definitions
- Workflow utilities

Dependencies:
- `@grc/agents` (invoke agents as activities)
- `@grc/database`
- External: `@temporalio/workflow`

#### **packages/database** (Prisma)

Contains:
- Prisma schema
- Database migrations
- Generated Prisma Client

No dependencies (base layer)

#### **packages/ui** (Shared Components)

Contains:
- AgentAttributionCard
- EvidenceReviewCard
- ApprovalQueueItem
- Reusable UI components

Dependencies:
- `@grc/types`
- External: `react`, `tailwindcss`

#### **packages/types** (TypeScript Types)

Contains:
- Shared interfaces
- API contracts
- Domain models

No dependencies (base layer)

### **9.3 Dependency Graph**

```
           apps/web
              ↓
    ┌─────────┴─────────┐
    ↓                   ↓
 packages/ui      packages/types
                        ↓
                 packages/database
                        ↓
            ┌───────────┴───────────┐
            ↓                       ↓
      packages/agents         packages/workflows
            ↓                       ↓
            └───────────┬───────────┘
                        ↓
                    apps/api
```

**Dependency Rules:**
- `apps/` can depend on any `packages/`
- `packages/` can only depend on other `packages/`
- No circular dependencies allowed
- Base packages (`types`, `database`) have no dependencies

### **9.4 Build Strategy (Turborepo)**

**The Challenge**: When we change one package, what needs rebuilding?

**Turborepo's Solution**: Intelligent caching and parallelization

**Build Scenarios:**

**Scenario 1: Change to `packages/types`**
- Turborepo detects change
- Rebuilds:
  - `packages/types`
  - `packages/database` (depends on types)
  - `packages/ui` (depends on types)
  - `packages/agents` (depends on types)
  - `packages/workflows` (depends on types)
  - `apps/web` (depends on types)
  - `apps/api` (depends on types)
- Result: Everything rebuilds (types is fundamental)

**Scenario 2: Change to `packages/ui`**
- Turborepo detects change
- Rebuilds:
  - `packages/ui`
  - `apps/web` (uses UI components)
- Skips:
  - `packages/agents` (doesn't use UI)
  - `apps/api` (doesn't use UI)
- Result: Only 2 packages rebuild (faster)

**Scenario 3: Change to `apps/web`**
- Turborepo detects change
- Rebuilds:
  - `apps/web` only
- Result: Fastest build (leaf node)

**Parallel Execution:**

When multiple packages need rebuilding:
- Turborepo builds independent packages in parallel
- Example: `packages/ui` and `packages/agents` can build simultaneously
- Respects dependency order: `packages/database` builds before `packages/agents`

**Build Caching:**

Turborepo caches build outputs:
- If `packages/types` hasn't changed, use cached build
- Speeds up CI/CD significantly
- Shared cache across team members (via Vercel)

---

## **10. SECURITY ARCHITECTURE** {#10-security}

### **10.1 Defense in Depth**

**Principle**: Multiple layers of security, so single failure doesn't compromise system

**Our Layers:**

1. **Network Layer**: Cloudflare CDN, DDoS protection
2. **Application Layer**: WAF rules, rate limiting
3. **Authentication Layer**: Clerk (MFA required)
4. **Authorization Layer**: Row-Level Security (RLS) in database
5. **Data Layer**: Encryption at rest (AES-256)
6. **Transport Layer**: TLS 1.3
7. **AI Layer**: LLM Guard (prevents prompt injection)
8. **Evidence Layer**: Cryptographic signatures

### **10.2 Authentication & Authorization Strategy**

#### **Authentication (Who are you?)**

**Provider**: Clerk

**Why Clerk:**
- **Built-in MFA**: Required for all users
- **Session Management**: Secure JWT tokens
- **Social Login**: Google, Microsoft SSO
- **Compliance**: SOC 2 Type II certified

**User Flow:**
1. User visits app
2. Clerk checks for valid session
3. If no session → Redirect to login
4. If session → Verify JWT, allow access

**Session Security:**
- **Short-lived tokens**: 15 minutes
- **Refresh tokens**: 7 days
- **Rotation**: New refresh token on each use
- **Revocation**: Immediate logout possible

#### **Authorization (What can you do?)**

**Multi-Level Authorization:**

**Level 1: Role-Based Access Control (RBAC)**

Roles:
- **Admin**: Full access, manage users, configure settings
- **Compliance Manager**: Manage audits, approve evidence
- **Analyst**: Review findings, collect evidence
- **Read-Only**: View dashboards, reports

**Level 2: Row-Level Security (RLS)**

Database enforces:
- Users can only see data from their organization
- Agents can only write to audits they're assigned to
- Evidence can only be deleted by creator or admin

**How RLS Works:**

Every query includes organization context:
- `SELECT * FROM evidence WHERE org_id = $current_user_org_id`
- Enforced at database level (can't bypass)
- Even if application has bug, database protects

**Level 3: Agent-Specific Permissions**

Agents have limited permissions:
- **Discovery Agent**: Read-only access to cloud providers
- **Access Control Agent**: Can read users, cannot modify
- **Policy Generator**: Can write to policies table
- **Infrastructure Agent**: Cannot disable resources (safety)

### **10.3 Secrets Management**

**The Problem**: Agents need credentials to access customer systems

**Our Solution**: Doppler (secrets management platform)

**Architecture:**

```
Agents
  ↓ Request credential
Doppler SDK
  ↓ Fetch from Doppler API
Doppler Servers (encrypted storage)
```

**Secret Organization:**

Hierarchy:
```
grc-platform (project)
├── production (environment)
│   ├── customer-123 (config)
│   │   ├── AWS_ACCESS_KEY
│   │   ├── OKTA_API_TOKEN
│   │   └── GITHUB_TOKEN
│   └── customer-456 (config)
│       └── ...
└── staging (environment)
```

**Access Pattern:**

When Access Control Agent needs Okta API token:
1. Agent requests: `doppler.get("OKTA_API_TOKEN", customer_id="123")`
2. Doppler SDK fetches from API (authenticated via service token)
3. Returns token to agent
4. Agent uses token, never stores it

**Security Benefits:**
- **Never in Code**: Credentials not in codebase or environment variables
- **Audited**: Every secret access logged
- **Rotatable**: Change credential in Doppler, agents get new one immediately
- **Scoped**: Each customer's credentials isolated

**Secret Rotation:**

Automated rotation:
1. Doppler generates new credential
2. Stores as `SECRET_v2`
3. Agents start using new version
4. Old version deprecated after 7 days
5. Old version revoked after 30 days

### **10.4 PII Protection**

**The Challenge**: Agents handle sensitive data (employee info, financial records)

**Our Protections:**

#### **Protection 1: LLM Guard**

**What It Does**: Prevents PII from being sent to LLMs

**How It Works:**
1. Agent prepares prompt with data
2. LLM Guard scans prompt for PII (SSN, credit cards, etc.)
3. If found → Redacts before sending to Claude
4. Claude processes redacted version
5. Agent receives result, re-inserts PII if needed

**Example:**

Before LLM Guard:
```
Analyze this user: "John Smith, SSN: 123-45-6789, works as Engineer"
```

After LLM Guard:
```
Analyze this user: "John Smith, SSN: [REDACTED], works as Engineer"
```

#### **Protection 2: Database Encryption**

**At Rest**: AES-256 encryption
- Sensitive columns encrypted in database
- Example: `background_check_results` encrypted
- Key stored in Doppler, rotated quarterly

**In Transit**: TLS 1.3
- All database connections encrypted
- All API calls over HTTPS
- All WebSocket connections secure

#### **Protection 3: Data Classification**

**Classification Levels:**
1. **Public**: Can be shared externally (company name, public policies)
2. **Internal**: Sensitive but not regulated (system diagrams)
3. **Confidential**: Business-sensitive (financial data)
4. **Restricted**: Regulated data (PII, PHI, PCI)

**Handling Rules by Classification:**

**Public Data:**
- Can log
- Can include in prompts
- Can cache

**Internal Data:**
- Can log (scrubbed)
- Can include in prompts
- Can cache temporarily

**Confidential Data:**
- Cannot log
- Can include in prompts (with approval)
- Cannot cache

**Restricted Data:**
- Cannot log
- Cannot include in prompts (unless LLM Guard redacts)
- Cannot cache

### **10.5 Audit Logging**

**What We Log:**

1. **User Actions**:
   - Login/logout
   - Evidence approvals
   - Settings changes
   - Data exports

2. **Agent Actions**:
   - Every execution (what, when, why)
   - Evidence collected
   - Decisions made
   - Confidence levels

3. **System Events**:
   - API calls
   - Database queries (for sensitive tables)
   - Secret access
   - Errors and failures

**Log Structure:**

Every log entry has:
- **Actor**: user-123 or agent-discovery-001
- **Action**: "evidence.approve" or "agent.execute"
- **Resource**: evidence-456 or audit-789
- **Timestamp**: ISO 8601 format
- **Result**: success or failure
- **Metadata**: IP address, user agent, etc.

**Log Storage:**

- **Real-time**: Stream to LangSmith (agent actions) and Sentry (errors)
- **Long-term**: Store in PostgreSQL (audit_logs table)
- **Retention**: 7 years (compliance requirement)

**Log Analysis:**

We monitor logs for:
- **Suspicious Activity**: Unusual access patterns
- **Compliance**: Ensure controls working (MFA enforced, evidence reviewed)
- **Debugging**: Trace issues back to root cause
- **Metrics**: Agent performance, API usage

---

## **11. SCALABILITY & PERFORMANCE** {#11-scalability}

### **11.1 Scalability Strategy**

**Current Scale (MVP):**
- 10-50 customers
- 100-500 audits/year
- 10,000 evidence items/month
- 100,000 agent executions/month

**Target Scale (Year 2):**
- 500-1000 customers
- 5,000 audits/year
- 500,000 evidence items/month
- 5,000,000 agent executions/month

**How We Scale:**

#### **Horizontal Scaling:**

**Stateless Components** (easy to scale):
- **Next.js Web**: Deploy to Vercel (auto-scales)
- **Agents**: Run on Modal (serverless, infinite scale)
- **Temporal Workers**: Add more workers as needed

**Stateful Components** (harder to scale):
- **PostgreSQL**: Neon (managed, auto-scaling)
- **Redis**: Upstash (serverless Redis)
- **Temporal Server**: Temporal Cloud (managed)

#### **Database Scaling:**

**Read Replicas:**
- **Primary**: All writes go here
- **Replica 1**: Dashboard reads
- **Replica 2**: Report generation reads
- **Replica 3**: Agent reads

**Sharding Strategy** (if needed at massive scale):
- **Shard Key**: organization_id
- **Why**: Each org's data isolated
- **Benefit**: Can move large customers to dedicated shards

#### **Agent Scaling:**

**Modal Serverless Strategy:**
- Each agent execution is a separate function invocation
- Modal automatically scales:
  - 1 execution → 1 container
  - 100 simultaneous executions → 100 containers
  - Scales down to zero when idle (no cost)

**The Benefit:**
- **No Capacity Planning**: Never run out of workers
- **Cost-Efficient**: Only pay for actual execution time
- **Fast Cold Starts**: Modal optimized for quick starts

### **11.2 Performance Optimization**

#### **Optimization 1: Caching Strategy**

**What We Cache:**

1. **Resource Inventory** (5 minute TTL)
   - Changes infrequently
   - Queried frequently (every page load)
   - Cache in Redis

2. **Control Frameworks** (1 day TTL)
   - SOC 2 controls rarely change
   - Loaded on every gap assessment
   - Cache in memory + Redis

3. **User Permissions** (15 minute TTL)
   - Checked on every request
   - Changes infrequently
   - Cache in Redis

**Cache Invalidation:**

**Time-Based:**
- Simple, predictable
- Good for data that changes on schedule

**Event-Based:**
- Invalidate immediately when data changes
- Example: User role changed → Invalidate permission cache
- More complex but more accurate

**Our Approach:** Hybrid
- Time-based for most (simple)
- Event-based for critical (permissions, evidence)

#### **Optimization 2: Database Query Optimization**

**Indexing Strategy:**

Every query pattern has supporting index:
- `WHERE org_id = X` → Index on org_id
- `WHERE audit_id = X AND control_id = Y` → Composite index
- `ORDER BY created_at DESC` → Index on created_at
- `JOIN evidence ON evidence.control_id = controls.id` → Foreign key index

**Query Patterns:**

**Pattern 1: Paginated Lists**
- Problem: `SELECT * FROM evidence LIMIT 10` is fast, but what about page 1000?
- Solution: Cursor-based pagination
  - `SELECT * FROM evidence WHERE id > $last_seen_id LIMIT 10`
  - Always fast, even at page 1000

**Pattern 2: Aggregations**
- Problem: `COUNT(*) FROM evidence WHERE audit_id = X` slow on 10M rows
- Solution: Materialized view
  - Pre-calculate counts
  - Refresh every hour (or on change)
  - Query the materialized view (instant)

**Pattern 3: Complex Joins**
- Problem: 5-table join to get audit dashboard data
- Solution: Denormalize
  - Store pre-joined data in `audit_summary` table
  - Update when underlying data changes
  - Query summary table (fast)

#### **Optimization 3: API Response Optimization**

**Selective Field Loading:**

Instead of:
```
GET /audits → Returns ALL audit data (10KB per audit)
```

Use:
```
GET /audits?fields=id,name,status → Returns minimal data (1KB per audit)
```

**Batch Requests:**

Instead of:
```
GET /evidence/1
GET /evidence/2
GET /evidence/3
(3 requests)
```

Use:
```
GET /evidence?ids=1,2,3
(1 request)
```

**Response Compression:**

- Enable gzip compression (reduce response size 70-90%)
- Client auto-decompresses

---

## **12. END-TO-END FLOWS** {#12-flows}

### **12.1 Complete SOC 2 Audit Flow**

**Duration**: 6 months
**Phases**: 6
**Agents Involved**: All 16
**Human Touchpoints**: 7

**Phase 1: Initiation (Week 1)**

1. User creates new audit in UI
2. Frontend calls: `audits.create({framework: "SOC2", trust_criteria: ["security"]})`
3. Backend creates audit record in database
4. Backend starts Temporal workflow: `SOC2AuditWorkflow`
5. Workflow persisted, user sees "Audit created" notification

**Phase 2: Discovery (Week 1-2)**

6. Temporal workflow invokes Discovery Agent
7. Discovery Agent scans:
   - AWS (EC2, RDS, S3, Lambda, IAM, CloudTrail...)
   - Okta (users, groups, MFA settings, policies)
   - GitHub (repos, branch protection, access)
   - Google Workspace (drives, docs, sharing settings)
8. Discovery Agent publishes progress via Redis
9. WebSocket sends updates to UI
10. User sees: "Found 127 AWS resources, 47 Okta users, 23 GitHub repos"
11. Discovery Agent stores results in `resources` table
12. Workflow creates approval request
13. User receives notification: "Review discovery results"
14. User opens approval queue, reviews
15. User clicks "Approve"
16. Workflow receives signal, continues

**Phase 3: Gap Assessment (Week 2-3)**

17. Workflow invokes Framework Expert Agent
18. Framework Expert:
    - Loads SOC 2 controls from Pinecone (RAG)
    - Maps each control to discovered resources
    - For each control, assesses if infrastructure meets requirements
    - Uses Claude to reason about gaps
19. Framework Expert identifies 12 gaps:
    - 3 High severity (MFA not enforced, logging incomplete)
    - 7 Medium severity (access reviews missing)
    - 2 Low severity (policy updates needed)
20. Framework Expert creates remediation plan
21. Workflow creates approval request
22. Compliance Manager reviews gaps
23. Compliance Manager approves remediation plan
24. Workflow receives signal, continues

**Phase 4: Remediation (Week 4-6)**

25. Workflow creates tasks for each gap
26. For automated gaps, invokes remediation agents:
    - Access Control Agent enables MFA requirement
    - Infrastructure Security Agent enables CloudTrail logging
    - Policy Generator Agent updates policies
27. For manual gaps, creates tickets for humans
28. Workflow monitors progress
29. Once all gaps addressed (or accepted as risks), continues

**Phase 5: Evidence Collection (Month 2-4)**

30. Workflow starts child workflow: `ContinuousEvidenceCollection`
31. Child workflow loops for 3 months:
    - Day 1: Collect daily evidence (MFA status, backup verification)
    - Day 7: Collect weekly evidence (vulnerability scans)
    - Day 30: Collect monthly evidence (access reviews)
32. Evidence collected via API + Vision:
    - API-first for speed
    - Vision for screenshot proof
33. Each evidence item analyzed by Claude Vision
34. High-confidence evidence (>95%) auto-approved
35. Low-confidence evidence flagged for human review
36. User reviews flagged evidence during weekly check-in
37. After 3 months, child workflow completes

**Phase 6: Audit Preparation (Month 4)**

38. Workflow invokes Evidence Management Agent
39. Agent validates:
    - All 47 SOC 2 controls have evidence
    - Evidence is recent (collected within observation period)
    - Evidence has required approvals
40. Agent identifies 2 controls with incomplete evidence
41. Workflow invokes agents to collect missing evidence
42. Evidence collection completes
43. Workflow invokes Audit Coordinator Agent
44. Audit Coordinator generates:
    - Evidence package (PDF)
    - Control matrix (spreadsheet)
    - System description (narrative)
45. Workflow creates approval request
46. Compliance Manager reviews package
47. Compliance Manager selects auditor, submits package
48. Workflow enters audit execution phase

**Phase 7: Audit Execution (Month 5-6)**

49. Auditor reviews evidence package
50. Auditor sends questions via email
51. Email webhook triggers Temporal signal: `auditor_question`
52. Workflow invokes Compliance Copilot Agent
53. Copilot drafts answer using RAG (past audits, policies, evidence)
54. Workflow creates approval request for draft answer
55. Compliance Manager reviews, edits, approves
56. Workflow submits answer to auditor
57. Loop continues for all auditor questions (typically 5-15)
58. Auditor completes audit
59. Auditor uploads report
60. Workflow receives signal: `audit_complete`
61. Workflow marks audit as complete
62. User receives notification: "SOC 2 audit passed!"

**Total Timeline:**
- Week 1-2: Discovery
- Week 2-3: Gap Assessment
- Week 4-6: Remediation
- Month 2-4: Evidence Collection
- Month 4: Audit Preparation
- Month 5-6: Audit Execution

**Total: 6 months** (compared to 9-12 months traditionally)

---

### **12.2 Daily MFA Monitoring Flow**

**Frequency**: Daily
**Duration**: 5 minutes
**Purpose**: Ensure MFA stays enforced

**The Flow:**

1. **Trigger**: Scheduled workflow runs daily at 9 AM
2. **Invoke Agent**: Workflow calls Access Control Agent
3. **API Collection**:
   - Agent queries Okta API: `GET /api/v1/users?filter=status eq "ACTIVE"`
   - Okta returns all 47 active users
   - For each user, check: `has_mfa_enrolled`
4. **Analysis**:
   - 45 users have MFA → Good
   - 2 users missing MFA → Issue detected
5. **Investigation**:
   - User 1: `service-account@company.com`
     - Agent checks: Matches service account pattern
     - Decision: Acceptable exception
   - User 2: `john.smith@company.com`
     - Agent checks: Regular user, no exception
     - Decision: Violation
6. **Response**:
   - Create approval request: "john.smith@company.com missing MFA"
   - Send notification to Compliance Manager
   - If not fixed in 24 hours, escalate to Director
7. **Evidence Storage**:
   - Store API response as evidence
   - Take screenshot of Okta MFA page (vision)
   - Store both with AI analysis
   - Link to control CC6.2
8. **Reporting**:
   - Update dashboard: "46/47 users have MFA (1 violation)"
   - If violation persists >7 days, trigger re-audit

---

### **12.3 New Customer Onboarding Flow**

**Goal**: Get customer to first value in 24 hours

**Day 1: Demo & Signup**

1. Prospect visits website
2. Clicks "See Live Demo"
3. We show Trust Portal with **real-time agent activity** (from our own audit)
4. Prospect sees:
   - "Evidence Collection Agent verified MFA - PASSED"
   - "Infrastructure Security Agent scanning encryption..."
   - "12 of 47 controls verified today"
5. Prospect impressed by live automation
6. Prospect signs up
7. Onboarding wizard starts

**Day 1: Initial Setup**

8. Wizard: "What framework?" → User selects: SOC 2
9. Wizard: "What trust criteria?" → User selects: Security, Availability
10. Wizard: "Connect integrations" → User sees list:
    - AWS ✓ (recommended)
    - Okta ✓ (recommended)
    - GitHub ✓ (recommended)
    - Google Workspace (optional)
11. User clicks "Connect AWS"
12. OAuth flow → User authorizes read-only access
13. We store credentials in Doppler
14. User completes setup wizard

**Day 1: First Discovery**

15. User clicks "Start Discovery"
16. Backend invokes Discovery Agent immediately (not waiting for full audit)
17. Discovery runs for ~15 minutes
18. User sees real-time updates:
    - "Scanning EC2 instances... found 12"
    - "Scanning RDS databases... found 3"
    - "Scanning S3 buckets... found 47"
19. Discovery completes
20. User sees inventory: 127 resources discovered
21. User sees first insights:
    - "3 S3 buckets are publicly accessible"
    - "2 RDS databases lack encryption"
    - "5 IAM users don't have MFA"

**Day 1: First Value**

22. User hasn't provided full API access yet, but sees:
    - Complete infrastructure inventory
    - Security findings (actionable)
    - Clear next steps
23. User thinks: "This already found issues we didn't know about!"
24. **First value delivered in 24 hours**

**Week 1: Progressive Enhancement**

25. User provides more integrations (Okta, GitHub)
26. More agents activate
27. More findings surface
28. More evidence collected

**Week 2: First Full Audit**

29. User ready to start formal audit
30. Clicks "Start SOC 2 Audit"
31. Full 6-month audit workflow begins
32. But user already sees value from Week 1 insights

**The Competitive Advantage:**

Traditional GRC platforms:
- Day 1-30: Waiting for integrations
- Day 31: Platform finally works
- Result: 30 days to value

Our platform:
- Day 1: Discovery runs with vision (no API needed)
- Day 1: First insights delivered
- Day 2-30: Progressive enhancement
- Result: **1 day to value**

---

## **CONCLUSION**

This architecture is designed for:

**Durability**: Workflows survive crashes, deployments, months of execution
**Intelligence**: Agents make smart decisions, learn from feedback
**Scalability**: Horizontal scaling of every component
**Security**: Defense in depth, compliance-grade protection
**Transparency**: Complete audit trail, real-time visibility
**User Experience**: Real-time updates, agent attribution, oversight model

The combination of Temporal (durable workflows) + LangGraph (smart decisions) + CrewAI (multi-agent coordination) + Claude (AI reasoning) + Vision (universal integration) creates a platform that can:

- Reduce compliance cost by 70% ($80K → $24K/year)
- Reduce time to audit by 60% (9 months → 3 months)
- Reduce user effort by 90% (20 hours/week → 2 hours/week)
- Increase evidence coverage from 70% → 95%+

All while maintaining audit quality and legal admissibility.

**Next Steps:**

- Review [Part 4: Agent Implementations](./04_agent_implementations.md) for detailed agent specifications
- Review [Part 5: Data & APIs](./05_data_and_apis.md) for database schemas
- Review [Part 6: Security & Deployment](./06_security_deployment_operations.md) for deployment architecture

---

**Document Complete** ✅
