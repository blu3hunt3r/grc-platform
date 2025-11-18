# Part 2: UX & Navigation Architecture

**Version:** 2.0 AGENT-AS-EMPLOYEE PARADIGM
**Last Updated:** November 16, 2025
**Status:** Production-Ready Architecture
**Philosophy:** You're Not Managing Compliance. You're Managing Your AI Compliance Team.

---

## Table of Contents

1. [Introduction: The Agentic Revolution](#1-introduction)
2. [The Paradigm Shift](#2-paradigm-shift)
3. [Mental Models: Users as Managers](#3-mental-models)
4. [Three-Tier Navigation Architecture](#4-navigation-architecture)
5. [UI Pattern Library](#5-ui-patterns)
6. [Page Specifications](#6-pages)
7. [Component Architecture](#7-components)
8. [Real-Time & Advanced Features](#8-realtime)
9. [Public Trust Portal (Agent Transparency)](#9-trust-portal)
10. [Implementation Roadmap](#10-roadmap)

---

## 1. Introduction: The Agentic Revolution {#1-introduction}

### 1.1 What Makes Us Different

**Traditional GRC Tools (Vanta, Drata, Sprinto):**

```
User's Monday:
├─ 08:00: Log in, see empty vendor form
├─ 08:10: Manually create Stripe vendor record
├─ 08:30: Google for Stripe SOC 2 report
├─ 09:00: Fill out 30-question risk assessment (guessing answers)
├─ 09:45: Upload SOC 2 PDF
├─ 10:00: Map vendor to controls (CC7.2, CC9.1...)
├─ 10:30: Create another vendor (Twilio)
├─ 11:00: Repeat process...
└─ 17:00: Exhausted, only processed 5 vendors

Total: 9 hours of manual data entry
Role: Data Entry Clerk
Feeling: Burnout
```

**Our Platform (Agent-as-Employee):**

```
User's Monday:
├─ 08:00: Log in, see "Today's Work" dashboard
├─ 08:02: 12 items need approval (agents worked overnight)
├─ 08:05: Review Stripe vendor (agent already analyzed)
│   └─ Agent: "LOW risk, SOC 2 valid until 2025-12-31"
│   └─ Me: "Approved" (click)
├─ 08:07: Review 5 more vendors (2 minutes each)
├─ 08:17: All approvals done
├─ 08:20: Check audit readiness: 87% → 91% overnight
└─ 08:25: Done for the day, grab coffee

Total: 25 minutes of oversight
Role: Compliance Manager
Feeling: In control
```

**The Difference:** Agents = Employees doing the work. Users = Managers making decisions.

### 1.2 Core Philosophy: Agents Are Your Team

**Key Principle:** Users don't "use a tool" - they **manage a team of 16 AI compliance specialists**.

This changes EVERYTHING:

| Aspect | Traditional | Agent-as-Employee |
|--------|-------------|-------------------|
| **User Action** | Create, enter data | Review, approve |
| **User Mindset** | "I must document this" | "Did my team handle this right?" |
| **UI Focus** | Forms, CRUD | Dashboards, approval queues |
| **Primary View** | "Add New Vendor" | "What Needs My Decision" |
| **Success** | Fields filled | Agents performing well |
| **User Time** | 15-20 hrs/week (active) | 1-2 hrs/week (oversight) |
| **User Role** | Knows compliance frameworks | Knows their business |

### 1.3 The Business Outcome: Audit Readiness

**Single North Star:** Are you ready to pass your audit?

Everything in the UI serves this goal:

- Dashboard shows: **"87% Audit Ready"** (not "47 vendors in system")
- Agents show: **"Working on 3 blockers"** (not "47 tasks done")
- Evidence shows: **"Chain of custody complete"** (not "2,847 files")

**User Mental Model:**

> "I'm the Director of Compliance. I need SOC 2 in 90 days to close our $5M deal.
> Question: Will I make it?
> Platform Answer: 87% ready, blocked by 3 items.
> My Action: Review the 3 blockers, make decisions.
> Result: Agents unblocked, readiness jumps to 94%."

### 1.4 Transparency = Trust = Admissibility

**Critical Requirement:** All AI actions must be transparent for legal admissibility.

**Why:**
1. **Legal**: Auditors must trust AI-collected evidence
2. **User Confidence**: Users must understand agent reasoning
3. **Debugging**: Trace back when something goes wrong
4. **Accountability**: Clear attribution (agent vs human)

**Every Agent Action Shows:**

- 🤖 **Who**: Agent name and role
- ⏰ **When**: Timestamp (UTC + user timezone)
- 🔍 **How**: Method (API, Screenshot, Manual)
- 🎯 **Confidence**: AI score (0-100%)
- 💭 **Reasoning**: Natural language explanation
- ✅ **Approval**: Human who approved

**Example UI:**

```tsx
<EvidenceCard>
  <ChainOfCustody>
    <Step icon="🤖">
      <strong>Collected by:</strong> Access Control Agent
      <Time>2025-11-15 14:23 UTC</Time>
      <Method>API via Okta SDK</Method>
    </Step>

    <Step icon="🔍">
      <strong>AI Analysis:</strong>
      <Confidence score={98}>98% Confident</Confidence>
      <Reasoning>
        All 156 employee accounts have MFA enabled.
        Verified via Okta `factors` API endpoint.
      </Reasoning>
    </Step>

    <Step icon="✅">
      <strong>Approved by:</strong> Sarah Chen (you)
      <Time>2025-11-15 14:45 UTC</Time>
      <Note>Approved for audit</Note>
    </Step>
  </ChainOfCustody>
</EvidenceCard>
```

---

## 2. The Paradigm Shift {#2-paradigm-shift}

### 2.1 From Artifact Management to Team Management

**Old Model (Traditional GRC):**

```
Mental Model: "I manage compliance artifacts"

UI Structure:
├─ Vendors (list of records)
├─ Policies (list of documents)
├─ Risks (list of assessments)
├─ Controls (list of mappings)
└─ Evidence (list of files)

User Actions:
├─ Create vendor
├─ Upload policy
├─ Assess risk
└─ Attach evidence

User Must Know:
├─ SOC 2 controls
├─ Risk frameworks
├─ Policy templates
└─ Evidence requirements
```

**New Model (Agent-as-Employee):**

```
Mental Model: "I supervise my AI compliance team"

UI Structure:
├─ Today's Work (what needs my attention)
├─ Audit Readiness (am I ready?)
├─ Agent Oversight (how's my team?)
├─ Review & Approve (decisions needed)
└─ Evidence Repository (what we collected)

User Actions:
├─ Review agent work
├─ Approve or reject
├─ Monitor progress
└─ Ask Copilot for help

User Must Know:
├─ Their business
├─ Risk tolerance
└─ Trade-offs
(Agents know compliance)
```

### 2.2 The Morning Standup Analogy

**Think of the platform as your team's daily standup:**

**Traditional Standup (Real Team):**

```
Manager: "Team, what did you work on?"

Backend Engineer:
  "I deployed the new API to production.
   1,000 req/sec, 50ms latency.
   Need your approval to enable for all customers."

Frontend Engineer:
  "I found an XSS bug in the login form.
   I have a fix ready. Need approval to deploy."

Manager:
  ✅ Approve API rollout
  ✅ Approve security fix
  📝 Follow up on monitoring
```

**Platform "Standup" (AI Team):**

```
User opens platform at 8 AM:

Discovery Agent:
  "I scanned AWS overnight.
   Found 47 resources, including 3 new RDS databases.
   Need your approval to add to inventory."

Access Control Agent:
  "I verified MFA on 156 accounts.
   Found 2 contractors without MFA (risk!).
   Decision: Disable access or grant exception?"

Policy Agent:
  "I drafted 3 new policies per SOC 2:
   - Incident Response
   - Data Classification
   - Access Review
   Need your review."

User:
  ✅ Approve asset discovery
  ✅ Disable contractor access (no exceptions)
  📝 Request edits to Incident policy
```

**This IS the core UX:** Agents work overnight, user reviews in the morning.

### 2.3 Navigation Philosophy: Three Tiers

**Tier 1: Daily Operations** (What I do TODAY)
- Today's Work

**Tier 2: Business Outcomes** (Tracking toward goal)
- Audit Readiness
- Agent Oversight
- Review & Approve
- Evidence Repository

**Tier 3: Compliance Reports** (For auditors)
- Controls Coverage
- Risk Register
- Vendor Portfolio
- Asset Inventory
- Personnel & Training
- Policies & Procedures

**Usage Frequency:**

```
Daily:
├─ Today's Work (5-10 min/day)
└─ Review & Approve (when notifications come)

Weekly:
├─ Audit Readiness (Monday check-in)
└─ Agent Oversight (performance review)

On-Demand:
├─ Evidence Repository (audit prep)
├─ Compliance Reports (auditor requests)
└─ Settings (rarely)
```

---

## 3. Mental Models: Users as Managers {#3-mental-models}

### 3.1 Primary Persona: Sarah Chen

```yaml
Name: Sarah Chen
Role: Director of Compliance & Security
Company: Series B SaaS (150 employees)
Goal: Pass SOC 2 Type II in 90 days
Background: 3 years compliance, non-technical
Pain: Drowning in manual work

Day Before Platform:
  08:30: Update vendor spreadsheet (30 min)
  09:00: Risk assessment forms (1 hour)
  10:00: Chase engineering for AWS list (30 min + waiting)
  11:00: Write policy from template (1 hour)
  13:00: Upload evidence files (30 min)
  14:00: Map controls (1 hour)
  15:00: Follow up on tasks (30 min)
  16:00: Still not done...

Day With Platform:
  08:05: Open "Today's Work"
  08:10: Review 12 agent recommendations
  08:20: Approve 10, edit 2
  08:25: Check readiness: 87% → 91%
  08:30: Done! Focus on strategic work
```

**Sarah's Mental Model:**

> "I manage a team of 16 AI specialists. My job is to review their work (10-20 min/day), make business decisions they can't (vendor risk, policy tone), and ensure quality. I'm NOT doing data entry, writing policies, or collecting evidence myself."

### 3.2 Agent Personas

**Each agent presented as an employee:**

**Discovery Agent Example:**

```yaml
Name: Discovery Agent
Role: Infrastructure & Application Discovery
Avatar: 🔍
Expertise:
  - Scans AWS, GCP, Azure
  - Discovers SaaS apps
  - Maps data flows

Personality: Thorough, never misses a resource

Performance:
  - 47 resources found last scan
  - 98% accuracy rate
  - 0 critical misses
  - 15 scans this month

Status: 🟢 Active
Last Work: 2 hours ago
Next Scan: Tonight 2 AM UTC
```

**How Users See Agents:**

```tsx
<AgentCard>
  <AgentHeader>
    <Avatar>🔍</Avatar>
    <Name>Discovery Agent</Name>
    <Status color="green">Active</Status>
  </AgentHeader>

  <Role>
    Scans infrastructure to find all systems and data flows
  </Role>

  <Stats>
    <Stat label="Last Scan" value="2 hours ago" />
    <Stat label="Resources" value="47" />
    <Stat label="Accuracy" value="98%" />
  </Stats>

  <RecentActivity>
    <Item icon="✅" time="2h">Scanned AWS us-east-1</Item>
    <Item icon="✅" time="2h">Found 3 new RDS databases</Item>
    <Item icon="⏳" time="now">Analyzing data flows...</Item>
  </RecentActivity>

  <Actions>
    <Button>View History</Button>
    <Button>Configure</Button>
    <Button>Run Now</Button>
  </Actions>
</AgentCard>
```

### 3.3 User-Agent Interaction Patterns

**Pattern 1: Agent Proposes → User Decides**

```
Agent: "I found vendor: Stripe"
       "Processes payments (PII + financial)"
       "Downloaded their SOC 2 report"
       "My analysis: LOW risk (98% confident)"
       "Recommendation: APPROVE with quarterly reviews"

User: Reviews reasoning → Agrees → Approves

Result: Vendor added with approved risk rating
```

**Pattern 2: User Requests → Agent Executes**

```
User: "Run full infrastructure scan now"

Agent: "Starting AWS, GCP, Azure scan..."
       "Found 47 resources in AWS"
       "Found 12 in GCP"
       "Analyzing..."
       "Done. 3 new resources need review."

User: Reviews → Approves or investigates
```

**Pattern 3: Agent Alerts → User Triages**

```
Agent: "🚨 CRITICAL: 2 contractors lack MFA"
       "Violates SOC 2 CC6.1"
       "Risk: Unauthorized production access"
       "Recommendation: Disable immediately"

User: Options:
      A) Disable now
      B) Grant 24h to enable MFA
      C) Escalate to CISO

User chooses: A (Disable)

Agent: "Access disabled, contractors notified, evidence logged"
```

**Pattern 4: Continuous Monitoring**

```
Agent: "I check MFA every 4 hours"
       "Last: All 156 compliant"
       "Next: In 2 hours"
       "I'll alert you if issues found"

User: Passive (no action unless alert)
```

---

## 4. Three-Tier Navigation Architecture {#4-navigation-architecture}

### 4.1 Navigation Configuration

```typescript
// apps/web/src/config/navigation.ts

import {
  HomeIcon,
  ShieldCheckIcon,
  UsersIcon,
  CheckBadgeIcon,
  FolderIcon,
  DocumentChartBarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export interface NavItem {
  id: string;
  name: string;
  description?: string;
  href: string;
  icon: React.ComponentType;
  badge?: string | number;
  highlight?: boolean;
  tier: 1 | 2 | 3;
  frequency: 'daily' | 'weekly' | 'on-demand';
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  // ========================================
  // TIER 1: DAILY OPERATIONS
  // ========================================
  {
    id: 'today',
    name: "Today's Work",
    description: "Morning standup: what needs your attention",
    href: '/dashboard',
    icon: HomeIcon,
    tier: 1,
    frequency: 'daily',
  },

  // ========================================
  // TIER 2: BUSINESS OUTCOMES
  // ========================================
  {
    id: 'readiness',
    name: 'Audit Readiness',
    description: "Are you ready to pass your audit?",
    href: '/dashboard/readiness',
    icon: ShieldCheckIcon,
    tier: 2,
    frequency: 'weekly',
    highlight: true, // Business-critical metric
  },

  {
    id: 'agents',
    name: 'Agent Oversight',
    description: 'Monitor your AI compliance team',
    href: '/dashboard/agents',
    icon: UsersIcon,
    tier: 2,
    frequency: 'weekly',
  },

  {
    id: 'approvals',
    name: 'Review & Approve',
    description: 'Decisions waiting for you',
    href: '/dashboard/approvals',
    icon: CheckBadgeIcon,
    tier: 2,
    frequency: 'daily',
    highlight: true, // When badge > 0
  },

  {
    id: 'evidence',
    name: 'Evidence Repository',
    description: 'Audit-ready evidence with chain of custody',
    href: '/dashboard/evidence',
    icon: FolderIcon,
    tier: 2,
    frequency: 'on-demand',
  },

  // ========================================
  // TIER 3: COMPLIANCE REPORTS
  // ========================================
  {
    id: 'reports',
    name: 'Compliance Reports',
    description: 'Traditional views for auditors',
    href: '/dashboard/reports',
    icon: DocumentChartBarIcon,
    tier: 3,
    frequency: 'on-demand',
    children: [
      {
        id: 'controls',
        name: 'Controls Coverage',
        href: '/dashboard/reports/controls',
        icon: ShieldCheckIcon,
      },
      {
        id: 'risks',
        name: 'Risk Register',
        href: '/dashboard/reports/risks',
        icon: ExclamationTriangleIcon,
      },
      {
        id: 'vendors',
        name: 'Vendor Portfolio',
        href: '/dashboard/reports/vendors',
        icon: BuildingOfficeIcon,
      },
      {
        id: 'assets',
        name: 'Asset Inventory',
        href: '/dashboard/reports/assets',
        icon: ServerIcon,
      },
      {
        id: 'personnel',
        name: 'Personnel & Training',
        href: '/dashboard/reports/personnel',
        icon: AcademicCapIcon,
      },
      {
        id: 'policies',
        name: 'Policies & Procedures',
        href: '/dashboard/reports/policies',
        icon: DocumentTextIcon,
      },
    ],
  },

  // ========================================
  // UTILITIES
  // ========================================
  {
    id: 'copilot',
    name: 'Compliance Copilot',
    description: 'AI assistant for questions',
    href: '/dashboard/copilot',
    icon: ChatBubbleLeftRightIcon,
    tier: 2,
    frequency: 'on-demand',
  },

  {
    id: 'settings',
    name: 'Settings',
    description: 'Configuration and integrations',
    href: '/dashboard/settings',
    icon: Cog6ToothIcon,
    tier: 3,
    frequency: 'on-demand',
  },
];

// Get dynamic badge values
export async function getNavigationBadges(userId: string) {
  const pendingApprovals = await db.approval.count({
    where: {
      organizationId: userId,
      status: 'PENDING',
    },
  });

  const auditReadiness = await getAuditReadinessScore(userId);

  return {
    approvals: pendingApprovals || undefined,
    readiness: `${Math.round(auditReadiness)}%`,
    today: pendingApprovals || undefined,
  };
}
```

### 4.2 Layout Implementation

```tsx
// apps/web/src/app/dashboard/layout.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Sidebar } from '@/components/navigation/Sidebar';
import { MobileNav } from '@/components/navigation/MobileNav';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <Sidebar userId={session.user.id} />
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center border-b bg-white px-4 shadow-sm">
          <Breadcrumbs />
        </div>

        {/* Page */}
        <main className="py-10 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      {/* Mobile Nav */}
      <MobileNav userId={session.user.id} className="lg:hidden" />
    </div>
  );
}
```

### 4.3 Sidebar Component

```tsx
// apps/web/src/components/navigation/Sidebar.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigation, getNavigationBadges } from '@/config/navigation';
import { cn } from '@/lib/utils';

export function Sidebar({ userId }: { userId: string }) {
  const pathname = usePathname();
  const [badges, setBadges] = useState({});

  useEffect(() => {
    getNavigationBadges(userId).then(setBadges);

    // Supabase Realtime for live updates
    const channel = supabase
      .channel('navigation-badges')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'approvals' },
        () => getNavigationBadges(userId).then(setBadges)
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [userId]);

  const tier1 = navigation.filter(n => n.tier === 1);
  const tier2 = navigation.filter(n => n.tier === 2);
  const tier3 = navigation.filter(n => n.tier === 3);

  return (
    <div className="flex flex-col gap-y-5 overflow-y-auto border-r bg-white px-6">
      {/* Logo */}
      <div className="flex h-16 items-center">
        <img src="/logo.svg" alt="GRC Platform" className="h-8" />
      </div>

      <nav className="flex flex-1 flex-col">
        <ul className="flex flex-1 flex-col gap-y-7">
          {/* Tier 1: Daily */}
          <li>
            <div className="text-xs font-semibold text-gray-400">
              DAILY OPERATIONS
            </div>
            <ul className="mt-2 space-y-1">
              {tier1.map(item => (
                <NavItem key={item.id} item={item} pathname={pathname} badge={badges[item.id]} />
              ))}
            </ul>
          </li>

          {/* Tier 2: Outcomes */}
          <li>
            <div className="text-xs font-semibold text-gray-400">
              BUSINESS OUTCOMES
            </div>
            <ul className="mt-2 space-y-1">
              {tier2.map(item => (
                <NavItem key={item.id} item={item} pathname={pathname} badge={badges[item.id]} />
              ))}
            </ul>
          </li>

          {/* Tier 3: Reports */}
          <li>
            <div className="text-xs font-semibold text-gray-400">
              COMPLIANCE REPORTS
            </div>
            <ul className="mt-2 space-y-1">
              {tier3.map(item => (
                <NavItem key={item.id} item={item} pathname={pathname} />
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}

function NavItem({ item, pathname, badge }) {
  const isActive = pathname === item.href;
  const hasChildren = item.children?.length > 0;
  const [isExpanded, setIsExpanded] = useState(isActive);

  return (
    <li>
      {hasChildren ? (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'group flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold',
              isActive ? 'bg-gray-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
            )}
          >
            <item.icon className="h-6 w-6" />
            {item.name}
          </button>
          {isExpanded && (
            <ul className="mt-1 pl-9 space-y-1">
              {item.children.map(child => (
                <li key={child.id}>
                  <Link
                    href={child.href}
                    className={cn(
                      'block rounded-md py-2 pl-4 text-sm',
                      pathname === child.href
                        ? 'text-indigo-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <Link
          href={item.href}
          className={cn(
            'group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold',
            isActive ? 'bg-gray-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50',
            item.highlight && 'ring-2 ring-indigo-500 ring-offset-2'
          )}
        >
          <item.icon className="h-6 w-6" />
          {item.name}
          {badge && (
            <span className={cn(
              'ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium',
              item.highlight ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'
            )}>
              {badge}
            </span>
          )}
        </Link>
      )}
    </li>
  );
}
```

---

## 5. UI Pattern Library {#5-ui-patterns}

### 5.1 Agent Attribution Card

Shows who/when/how/confidence for transparency:

```tsx
// components/patterns/AgentAttributionCard.tsx

interface AgentAttributionProps {
  agentName: string;
  agentRole: string;
  action: string;
  timestamp: Date;
  method: 'API' | 'Screenshot' | 'Manual';
  confidence: number;
  reasoning: string;
}

export function AgentAttributionCard({
  agentName,
  agentRole,
  action,
  timestamp,
  method,
  confidence,
  reasoning,
}: AgentAttributionProps) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar>🤖</Avatar>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold">{agentName}</h4>
              <p className="text-xs text-gray-500">{agentRole}</p>
            </div>
            <ConfidenceBadge confidence={confidence} />
          </div>

          <p className="mt-2 text-sm text-gray-700">{action}</p>

          <div className="mt-3 flex gap-4 text-xs text-gray-500">
            <span>⏰ {formatTimestamp(timestamp)}</span>
            <span>🔍 {method}</span>
          </div>

          <details className="mt-3">
            <summary className="cursor-pointer text-xs font-medium text-indigo-600">
              View AI Reasoning
            </summary>
            <p className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
              {reasoning}
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const color = confidence >= 95 ? 'green' : confidence >= 80 ? 'yellow' : 'red';
  return (
    <Badge variant={color}>{confidence}% Confident</Badge>
  );
}
```

### 5.2 Approval Queue Item

Human-in-the-loop pattern:

```tsx
// components/patterns/ApprovalQueueItem.tsx

interface ApprovalProps {
  id: string;
  type: 'vendor' | 'policy' | 'asset' | 'access';
  title: string;
  agentName: string;
  recommendation: 'APPROVE' | 'REJECT';
  reasoning: string;
  confidence: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  metadata: any;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

export function ApprovalQueueItem({
  id,
  type,
  title,
  agentName,
  recommendation,
  reasoning,
  confidence,
  priority,
  metadata,
  onApprove,
  onReject,
}: ApprovalProps) {
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className={cn(
      'rounded-lg border bg-white shadow-sm',
      priority === 'critical' && 'border-red-300 ring-2 ring-red-500'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between p-4">
        <div className="flex-1">
          {priority === 'critical' && (
            <Badge variant="destructive">🚨 CRITICAL</Badge>
          )}
          <h3 className="mt-1 text-base font-semibold">{title}</h3>
        </div>
        <RecommendationBadge recommendation={recommendation} />
      </div>

      {/* Agent Attribution */}
      <div className="px-4 pb-4">
        <AgentAttributionCard
          agentName={agentName}
          action={`Recommends: ${recommendation}`}
          confidence={confidence}
          reasoning={reasoning}
        />
      </div>

      {/* Type-Specific Details */}
      {metadata && (
        <div className="border-t px-4 py-3">
          <TypeSpecificDetails type={type} data={metadata} />
        </div>
      )}

      {/* Actions */}
      <div className="border-t px-4 py-3">
        {!showReject ? (
          <div className="flex gap-3">
            <Button
              onClick={() => onApprove(id)}
              disabled={isSubmitting}
              className="flex-1"
            >
              ✓ Approve
            </Button>
            <Button
              onClick={() => setShowReject(true)}
              variant="outline"
              className="flex-1"
            >
              ✕ Reject
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              placeholder="Why rejecting? (helps agent learn)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3">
              <Button
                onClick={() => onReject(id, rejectReason)}
                variant="destructive"
              >
                Confirm Rejection
              </Button>
              <Button onClick={() => setShowReject(false)} variant="ghost">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 5.3 Audit Readiness Score

The North Star metric:

```tsx
// components/patterns/AuditReadinessCard.tsx

interface ReadinessProps {
  score: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  trendChange?: number;
  targetDate: Date;
  framework: string;
  domains: {
    name: string;
    score: number;
    blockers: number;
  }[];
}

export function AuditReadinessCard({
  score,
  trend,
  trendChange,
  targetDate,
  framework,
  domains,
}: ReadinessProps) {
  const daysUntil = Math.ceil((targetDate.getTime() - Date.now()) / 86400000);
  const scoreColor = score >= 95 ? 'green' : score >= 80 ? 'yellow' : 'red';

  return (
    <div className="rounded-lg border bg-white p-6 shadow-lg">
      {/* Header */}
      <div className="flex justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-500">Audit Readiness</h2>
          <p className="text-xs text-gray-400">{framework}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Target</p>
          <p className="text-sm font-semibold">{targetDate.toLocaleDateString()}</p>
          <p className="text-xs text-gray-400">{daysUntil} days</p>
        </div>
      </div>

      {/* Score */}
      <div className="mt-6 flex items-baseline gap-3">
        <div className={cn(
          'text-6xl font-bold',
          scoreColor === 'green' && 'text-green-600',
          scoreColor === 'yellow' && 'text-yellow-600',
          scoreColor === 'red' && 'text-red-600'
        )}>
          {score}%
        </div>
        {trend !== 'stable' && (
          <div className="flex items-center gap-1">
            {trend === 'up' ? '↑' : '↓'}
            <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
              {trendChange}%
            </span>
          </div>
        )}
      </div>

      <Progress value={score} className="mt-4" />

      {/* Status */}
      <div className="mt-4">
        {score >= 95 ? (
          <p className="text-sm text-green-700">
            ✅ <strong>Audit-ready!</strong> All controls in place.
          </p>
        ) : score >= 80 ? (
          <p className="text-sm text-yellow-700">
            ⚠️ <strong>Almost there!</strong> {100 - score}% remaining in {daysUntil} days.
          </p>
        ) : (
          <p className="text-sm text-red-700">
            🚨 <strong>Action needed!</strong> Critical gaps. Review blockers now.
          </p>
        )}
      </div>

      {/* Domain Breakdown */}
      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold">By Domain</h3>
        {domains.map(domain => (
          <DomainRow key={domain.name} domain={domain} />
        ))}
      </div>
    </div>
  );
}

function DomainRow({ domain }) {
  const icon = domain.blockers > 0 ? '🚨' : domain.score >= 95 ? '✅' : '⏳';
  return (
    <div className="flex items-center justify-between rounded-md bg-gray-50 p-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <div>
          <p className="text-sm font-medium">{domain.name}</p>
          {domain.blockers > 0 && (
            <p className="text-xs text-red-600">{domain.blockers} blockers</p>
          )}
        </div>
      </div>
      <p className="text-lg font-bold">{domain.score}%</p>
    </div>
  );
}
```

### 5.4 Agent Activity Feed

Real-time team activity:

```tsx
// components/patterns/AgentActivityFeed.tsx

'use client';

export function AgentActivityFeed({ orgId, limit = 20 }) {
  const [activities, setActivities] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initial load
    fetch(`/api/agents/activities?limit=${limit}`)
      .then(r => r.json())
      .then(setActivities);

    // WebSocket for live updates
    const ws = new WebSocket(`${WS_URL}/agents/${orgId}/activity`);
    ws.onopen = () => setIsConnected(true);
    ws.onmessage = (e) => {
      const newActivity = JSON.parse(e.data);
      setActivities(prev => [newActivity, ...prev].slice(0, limit));
    };
    return () => ws.close();
  }, [orgId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className={cn('h-2 w-2 rounded-full', isConnected ? 'bg-green-500' : 'bg-gray-300')} />
        <span className="text-xs text-gray-500">
          {isConnected ? 'Live updates' : 'Connecting...'}
        </span>
      </div>

      <div className="space-y-3">
        {activities.map(activity => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}

function ActivityItem({ activity }) {
  const icons = {
    started: '🔵',
    in_progress: '⏳',
    completed: '✅',
    failed: '❌',
  };

  return (
    <div className="flex gap-3 rounded-md border bg-white p-3">
      <Avatar>🤖</Avatar>
      <div className="flex-1">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium">{activity.agentName}</p>
            <p className="text-sm text-gray-600">{activity.action}</p>
          </div>
          <span>{icons[activity.status]}</span>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          {formatTimestamp(activity.timestamp)}
        </p>
      </div>
    </div>
  );
}
```

### 5.5 Chain of Custody Viewer

For evidence admissibility:

```tsx
// components/patterns/ChainOfCustodyViewer.tsx

interface CustodyStep {
  type: 'collection' | 'analysis' | 'approval';
  actor: string;
  actorType: 'agent' | 'user';
  action: string;
  timestamp: Date;
  method?: string;
  confidence?: number;
  reasoning?: string;
}

export function ChainOfCustodyViewer({
  evidenceId,
  evidenceName,
  steps,
  isAdmissible,
}: {
  evidenceId: string;
  evidenceName: string;
  steps: CustodyStep[];
  isAdmissible: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border bg-white p-4">
        <h3 className="text-lg font-semibold">Chain of Custody</h3>
        <p className="text-sm text-gray-600">{evidenceName}</p>

        <div className="mt-4 flex items-center gap-2">
          {isAdmissible ? (
            <>
              <CheckBadgeIcon className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-700">Audit-Admissible</span>
            </>
          ) : (
            <>
              <XCircleIcon className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-700">Not Admissible</span>
            </>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="flow-root">
        <ul className="-mb-8">
          {steps.map((step, idx) => (
            <li key={idx}>
              <div className="relative pb-8">
                {idx !== steps.length - 1 && (
                  <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" />
                )}

                <div className="relative flex gap-3">
                  <div>
                    <span className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white',
                      step.type === 'collection' && 'bg-blue-500',
                      step.type === 'analysis' && 'bg-purple-500',
                      step.type === 'approval' && 'bg-green-500'
                    )}>
                      <StepIcon type={step.type} className="h-5 w-5 text-white" />
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium">{step.action}</p>
                    <p className="text-sm text-gray-500">
                      by {step.actor} {step.actorType === 'agent' && '(AI)'}
                      {step.method && ` via ${step.method}`}
                    </p>

                    {step.confidence && (
                      <ConfidenceBadge confidence={step.confidence} />
                    )}

                    {step.reasoning && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-indigo-600">
                          View reasoning
                        </summary>
                        <p className="mt-1 text-xs text-gray-600">{step.reasoning}</p>
                      </details>
                    )}

                    <time className="mt-1 text-xs text-gray-400">
                      {step.timestamp.toLocaleString()}
                    </time>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

---

## 6. Page Specifications {#6-pages}

### 6.1 Today's Work (Dashboard)

**Route:** `/dashboard`

**Purpose:** Daily standup - what needs attention TODAY

**Layout:**

```tsx
// app/dashboard/page.tsx

export default async function TodaysWorkPage() {
  const user = await currentUser();
  const [readiness, approvals, criticalPath] = await Promise.all([
    getAuditReadiness(user.id),
    getPendingApprovals(user.id),
    getCriticalPath(user.id),
  ]);

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">
          {getGreeting()}, {user.firstName}
        </h1>
        <p className="text-sm text-gray-600">
          Here's what your compliance team worked on overnight
        </p>
      </div>

      {/* Audit Readiness (Hero) */}
      <AuditReadinessCard {...readiness} />

      {/* Needs Decision */}
      {approvals.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">
            🚨 Needs Your Decision ({approvals.length})
          </h2>
          <div className="mt-4 space-y-4">
            {approvals.slice(0, 3).map(approval => (
              <ApprovalQueueItem key={approval.id} {...approval} />
            ))}
          </div>
          {approvals.length > 3 && (
            <Link href="/dashboard/approvals" className="text-sm text-indigo-600">
              +{approvals.length - 3} more approvals
            </Link>
          )}
        </section>
      )}

      {/* Agent Activity */}
      <section>
        <h2 className="text-lg font-semibold">
          📊 Agent Activity (Last 24h)
        </h2>
        <AgentActivityFeed orgId={user.id} limit={10} />
      </section>

      {/* Critical Path */}
      {criticalPath.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">
            🎯 Critical Path (Blocking 100%)
          </h2>
          <CriticalPathList items={criticalPath} />
        </section>
      )}

      {/* Empty State */}
      {approvals.length === 0 && criticalPath.length === 0 && (
        <EmptyState
          icon="✅"
          title="All caught up!"
          description="Nothing needs your attention. Agents are working."
        />
      )}
    </div>
  );
}
```

**Wireframe:**

```
┌─────────────────────────────────────────────┐
│ Good morning, Sarah                         │
│ Your compliance team worked on this overnight│
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│           AUDIT READINESS                   │
│  SOC 2 Type II        Target: Mar 1, 2025   │
│                       (45 days)              │
│                                              │
│       87%        ↑ 4%                       │
│  ████████████████░░░░                       │
│                                              │
│  ⚠️ Almost there! 13% in 45 days           │
│                                              │
│  By Domain:                                 │
│  ✅ Access Control    95%                   │
│  ⏳ Assets            82% (2 blockers)      │
│  🚨 Vendors           68% (5 blockers)      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🚨 Needs Your Decision (12)    [View All]  │
├─────────────────────────────────────────────┤
│ 🚨 CRITICAL                                 │
│ New vendor: Stripe             [APPROVE]    │
│                                              │
│ 🤖 Vendor Risk Agent   98% Confident        │
│                                              │
│ Processes payments (PII + financial).       │
│ SOC 2 valid until 2025-12-31.              │
│ Risk: LOW                                   │
│                                              │
│ [✓ Approve]  [✕ Reject]                    │
└─────────────────────────────────────────────┘

(+9 more approvals)

┌─────────────────────────────────────────────┐
│ 📊 Agent Activity (Last 24h)                │
├─────────────────────────────────────────────┤
│ 🔍 Discovery Agent     ✅  2h ago           │
│ Scanned AWS, found 47 resources             │
│                                              │
│ 🔐 Access Control      ✅  3h ago           │
│ Verified MFA on 156 accounts                │
└─────────────────────────────────────────────┘
```

### 6.2 Audit Readiness

**Route:** `/dashboard/readiness`

**Purpose:** Deep dive into "Are we ready?"

```tsx
// app/dashboard/readiness/page.tsx

export default async function AuditReadinessPage() {
  const readiness = await getDetailedReadiness(user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Audit Readiness</h1>
        <p className="text-sm text-gray-600">
          Detailed view for {readiness.framework}
        </p>
      </div>

      {/* Hero Score */}
      <AuditReadinessCard {...readiness} />

      {/* Domain Deep Dive */}
      <section>
        <h2 className="text-lg font-semibold">By Domain</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {readiness.domains.map(domain => (
            <DomainCard key={domain.name} {...domain} />
          ))}
        </div>
      </section>

      {/* Control Coverage Matrix */}
      <section>
        <h2 className="text-lg font-semibold">Control Coverage</h2>
        <ControlCoverageMatrix controls={readiness.controls} />
      </section>

      {/* Gap Analysis */}
      <section>
        <h2 className="text-lg font-semibold">Gap Analysis</h2>
        <GapTable gaps={readiness.gaps} />
      </section>

      {/* Trend Chart */}
      <section>
        <h2 className="text-lg font-semibold">Progress Over Time</h2>
        <ReadinessTrendChart data={readiness.history} />
      </section>
    </div>
  );
}
```

### 6.3 Agent Oversight

**Route:** `/dashboard/agents`

**Purpose:** Team management view

```tsx
// app/dashboard/agents/page.tsx

export default async function AgentOversightPage() {
  const agents = await getAllAgents(user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Agent Oversight</h1>
        <p className="text-sm text-gray-600">
          Monitor your AI compliance team
        </p>
      </div>

      {/* Team Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total Agents" value={agents.length} icon="🤖" />
        <StatCard label="Active Now" value={agents.filter(a => a.active).length} icon="🟢" />
        <StatCard label="Tasks (24h)" value={sum(agents, 'tasksLast24h')} icon="✅" />
        <StatCard label="Avg Confidence" value={`${avg(agents, 'confidence')}%`} icon="🎯" />
      </div>

      {/* Agent Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {agents.map(agent => (
          <AgentEmployeeCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}

function AgentEmployeeCard({ agent }) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <Avatar>{agent.avatar}</Avatar>
          <div>
            <h3 className="text-base font-semibold">{agent.name}</h3>
            <p className="text-sm text-gray-600">{agent.role}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <MetricBox label="Tasks (24h)" value={agent.tasksLast24h} />
        <MetricBox label="Confidence" value={`${agent.confidence}%`} />
        <MetricBox label="Success" value={`${agent.successRate}%`} />
      </div>

      {/* Recent Work */}
      <div className="mt-4">
        <h4 className="text-xs font-medium text-gray-500">RECENT ACTIVITY</h4>
        <ul className="mt-2 space-y-2">
          {agent.recentWork.slice(0, 3).map(work => (
            <li key={work.id} className="flex gap-2 text-sm">
              <span>{getIcon(work.status)}</span>
              <span className="flex-1">{work.action}</span>
              <time className="text-xs text-gray-400">{formatTime(work.timestamp)}</time>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">History</Button>
        <Button variant="outline" size="sm">Configure</Button>
        <Button variant="outline" size="sm">Run Now</Button>
      </div>
    </div>
  );
}
```

### 6.4 Review & Approve

**Route:** `/dashboard/approvals`

**Purpose:** Dedicated approval inbox

```tsx
// app/dashboard/approvals/page.tsx

export default async function ApprovalsPage() {
  const approvals = await getPendingApprovals(user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Review & Approve</h1>
        <p className="text-sm text-gray-600">
          {approvals.length} items waiting
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <ApprovalFilterDropdown />
        <ApprovalSortDropdown />
      </div>

      {/* Queue */}
      <div className="space-y-4">
        {approvals.map(approval => (
          <ApprovalQueueItem key={approval.id} {...approval} />
        ))}
      </div>

      {/* Empty */}
      {approvals.length === 0 && (
        <EmptyState
          icon="✅"
          title="All caught up!"
          description="No pending approvals"
        />
      )}
    </div>
  );
}
```

### 6.5 Evidence Repository

**Route:** `/dashboard/evidence`

**Purpose:** Browse audit-ready evidence

```tsx
// app/dashboard/evidence/page.tsx

export default async function EvidenceRepositoryPage() {
  const evidence = await getEvidence(user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Evidence Repository</h1>
        <p className="text-sm text-gray-600">
          Audit-ready with complete chain of custody
        </p>
      </div>

      {/* Admissibility Badge */}
      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
        <div className="flex gap-3">
          <ShieldCheckIcon className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="text-sm font-semibold text-green-900">
              Audit-Admissible Evidence
            </h3>
            <p className="text-xs text-green-700">
              Every item includes: who collected, when, how, AI confidence, human approval
            </p>
          </div>
        </div>
      </div>

      {/* Evidence Grid */}
      <EvidenceGrid evidence={evidence} />
    </div>
  );
}
```

---

## 7. Component Architecture {#7-components}

### 7.1 Server vs Client Components

**Strategy:** Server Components by default, Client only when needed

**Server Components:**
- Page layouts
- Initial data fetching
- Static content

**Client Components:**
- Real-time updates (WebSocket)
- Interactive forms
- Approval buttons

```tsx
// Server Component
export default async function Page() {
  const data = await fetchData();
  return <ClientComponent initialData={data} />;
}

// Client Component
'use client';
export function ClientComponent({ initialData }) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onmessage = (e) => setData(JSON.parse(e.data));
    return () => ws.close();
  }, []);

  return <div>{/* render */}</div>;
}
```

### 7.2 Data Fetching

Use React Server Components for initial load, WebSockets for real-time:

```tsx
// lib/api.ts

export async function getAuditReadiness(userId: string) {
  const data = await db.auditReadiness.findUnique({
    where: { userId },
    include: { domains: true, gaps: true },
  });
  return data;
}

export async function getPendingApprovals(userId: string) {
  return await db.approval.findMany({
    where: {
      userId,
      status: 'PENDING',
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'asc' },
    ],
  });
}
```

---

## 8. Real-Time & Advanced Features {#8-realtime}

### 8.1 WebSocket Architecture

```tsx
// lib/websocket.ts

export class RealtimeConnection {
  private ws: WebSocket;
  private reconnectAttempts = 0;

  constructor(
    private url: string,
    private onMessage: (data: any) => void
  ) {
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      this.onMessage(JSON.parse(event.data));
    };

    this.ws.onclose = () => {
      if (this.reconnectAttempts < 5) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, 1000 * Math.pow(2, this.reconnectAttempts));
      }
    };
  }
}
```

### 8.2 Mobile Responsive

Bottom navigation for mobile:

```tsx
// components/navigation/MobileNav.tsx

export function MobileNav({ userId }) {
  const pathname = usePathname();
  const [badges, setBadges] = useState({});

  const items = [
    { name: 'Today', href: '/dashboard', icon: HomeIcon },
    { name: 'Approve', href: '/dashboard/approvals', icon: CheckBadgeIcon, badge: badges.approvals },
    { name: 'Agents', href: '/dashboard/agents', icon: UsersIcon },
    { name: 'More', href: '/dashboard/more', icon: EllipsisIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white">
      <div className="flex justify-around">
        {items.map(item => (
          <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1 px-3 py-2">
            <div className="relative">
              <item.icon className="h-6 w-6" />
              {item.badge && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

### 8.3 Accessibility

WCAG 2.1 AA compliance:

```tsx
// Keyboard navigation
const shortcuts = {
  'j': 'Next approval',
  'k': 'Previous approval',
  'a': 'Approve current',
  'r': 'Reject current',
  '/': 'Search',
  'g d': 'Go to dashboard',
};

// ARIA labels
<button
  aria-label="Approve vendor risk assessment for Stripe"
  aria-describedby="approval-desc"
>
  Approve
</button>

<div id="approval-desc" className="sr-only">
  This will approve LOW risk for Stripe (98% AI confidence)
</div>
```

### 8.4 Design System

```typescript
// tailwind.config.ts

export default {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#0ea5e9',
          600: '#0284c7',
        },
        success: { 500: '#22c55e' },
        warning: { 500: '#eab308' },
        error: { 500: '#ef4444' },
        agent: { 500: '#8b5cf6' },
      },
    },
  },
};
```

---

## 9. Public Trust Portal (Agent Transparency) {#9-trust-portal}

### 9.1 The Trust Portal Paradigm Shift

**Traditional Trust Portals (Vanta, Drata, Secureframe):**

```
Visitor Experience:
├─ Visit trust.competitor.com
├─ See: ✅ "SOC 2 Type II Certified"
├─ See: 📄 "Download Audit Report" (6 months old)
├─ See: Generic security marketing copy
└─ Think: "Okay, they passed an audit... I guess?"

Mental Model: Static marketing page
Feeling: "This is a checkbox, not differentiation"
Trust Level: 6/10 (standard compliance)
```

**Our Agentic Trust Portal:**

```
Visitor Experience:
├─ Visit trust.yourcompany.com
├─ See: "Compliance Status: 98% (updated 5 min ago)"
├─ See: Live agent activity feed
│   └─ "Access Control Agent verified MFA 2 hours ago"
│   └─ "Discovery Agent scanned infrastructure 4 hours ago"
├─ See: Real-time control verification timestamps
└─ Think: "Wow, they're not just compliant - they're MAINTAINING compliance with AI 24/7!"

Mental Model: Living compliance system
Feeling: "This is innovative AND serious about security"
Trust Level: 10/10 (proactive + transparent)
```

**The Paradigm:**

| Aspect | Traditional | Agentic Trust Portal |
|--------|-------------|---------------------|
| **Message** | "We are compliant" | "Our AI maintains compliance 24/7" |
| **Proof** | PDF certificates (static) | Live agent activity + certificates |
| **Timeframe** | Past (audit 6 months ago) | Present (verified 2 hours ago) |
| **Transparency** | Black box | Chain of custody visible |
| **Differentiation** | Same as competitors | Unique innovation |
| **Trust** | "Trust us" | "See for yourself" |
| **Sales Value** | Checkbox | Competitive advantage |
| **Update Frequency** | Annual (audit cycle) | Continuous (every 4 hours) |

### 9.2 Trust Portal Routes & Pages

**Public Routes (no authentication required):**

```typescript
// apps/web/src/app/(public)/trust/*

const trustPortalRoutes = [
  // Homepage
  {
    path: '/trust',
    component: TrustPortalHomePage,
    title: 'Security & Compliance Trust Center',
    public: true,
  },

  // Live Compliance Status
  {
    path: '/trust/compliance',
    component: LiveComplianceStatusPage,
    title: 'Real-Time Compliance Status',
    public: true,
  },

  // Security Posture
  {
    path: '/trust/security',
    component: SecurityPosturePage,
    title: 'Security Controls & Posture',
    public: true,
  },

  // Certifications
  {
    path: '/trust/certifications',
    component: CertificationsPage,
    title: 'Audit Reports & Certifications',
    public: true,
  },

  // Privacy
  {
    path: '/trust/privacy',
    component: PrivacyPracticesPage,
    title: 'Privacy & Data Protection',
    public: true,
  },

  // Incident Transparency
  {
    path: '/trust/incidents',
    component: IncidentHistoryPage,
    title: 'Security Incident History',
    public: true,
  },

  // Agent Transparency (NEW - unique to us!)
  {
    path: '/trust/how-it-works',
    component: AgentTransparencyPage,
    title: 'How We Maintain Compliance',
    public: true,
  },
];
```

### 9.3 Trust Portal Homepage

**Route:** `/trust`

**Purpose:** Public-facing trust center showcasing live AI compliance

```tsx
// apps/web/src/app/(public)/trust/page.tsx

export default function TrustPortalHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <TrustPortalHeader />

      {/* Hero: Real-Time Status */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900">
            Security & Compliance Trust Center
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            AI-powered compliance, verified continuously, transparent always
          </p>

          {/* Live Compliance Score */}
          <div className="mt-12">
            <LiveComplianceWidget />
          </div>
        </div>
      </section>

      {/* Agent Activity Feed (Public) */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            How We Maintain Compliance 24/7
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Our AI compliance team works continuously to verify security controls.
            Here's what they're doing right now:
          </p>

          <PublicAgentActivityFeed limit={8} />
        </div>
      </section>

      {/* Certifications Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Certifications & Audit Reports
          </h2>
          <CertificationGrid />
        </div>
      </section>

      {/* Security Controls */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Security Controls Coverage
          </h2>
          <PublicControlCoverageMatrix />
        </div>
      </section>

      {/* Incident Transparency */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Incident History & Transparency
          </h2>
          <IncidentHistoryTimeline public={true} />
        </div>
      </section>

      {/* Footer */}
      <TrustPortalFooter />
    </div>
  );
}
```

### 9.4 Live Compliance Widget

**The centerpiece - shows real-time compliance status:**

```tsx
// components/trust-portal/LiveComplianceWidget.tsx

'use client';

export function LiveComplianceWidget() {
  const [status, setStatus] = useState(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Initial fetch
    fetch('/api/public/compliance-status')
      .then(r => r.json())
      .then(setStatus);

    // WebSocket for live updates
    const ws = new WebSocket(`${WS_URL}/public/compliance-status`);
    ws.onopen = () => setIsLive(true);
    ws.onmessage = (e) => setStatus(JSON.parse(e.data));

    return () => ws.close();
  }, []);

  if (!status) return <Skeleton />;

  return (
    <div className="relative">
      {/* Live Indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className={cn(
          'h-2 w-2 rounded-full',
          isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
        )} />
        <span className="text-xs text-gray-600">
          {isLive ? 'Live' : 'Connecting...'}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-4xl mx-auto">
        {/* Main Score */}
        <div className="text-center">
          <div className="inline-flex items-baseline gap-4">
            <span className="text-8xl font-bold text-green-600">
              {status.score}%
            </span>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-500">
                Compliance Status
              </div>
              <div className="text-xs text-gray-400">
                Updated {formatTimestamp(status.lastUpdate)}
              </div>
            </div>
          </div>

          <p className="mt-6 text-xl text-gray-700">
            {status.score >= 95
              ? '✅ Fully Compliant & Audit-Ready'
              : '⏳ Actively Maintaining Compliance'
            }
          </p>
        </div>

        {/* Framework Badges */}
        <div className="mt-12 flex justify-center gap-6">
          {status.frameworks.map(framework => (
            <FrameworkBadge key={framework.name} {...framework} />
          ))}
        </div>

        {/* Next Verification */}
        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-sm text-gray-600">
            Next automated verification in: <CountdownTimer target={status.nextCheck} />
          </p>
        </div>
      </div>
    </div>
  );
}

function FrameworkBadge({ name, status, certified, expires }) {
  return (
    <div className="text-center">
      <div className={cn(
        'w-24 h-24 rounded-full flex items-center justify-center text-3xl',
        certified ? 'bg-green-100' : 'bg-gray-100'
      )}>
        {getFrameworkIcon(name)}
      </div>
      <div className="mt-2 text-sm font-medium">{name}</div>
      {certified && (
        <div className="text-xs text-gray-500">
          Valid until {new Date(expires).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
```

### 9.5 Public Agent Activity Feed

**Sanitized version of internal agent activity for external transparency:**

```tsx
// components/trust-portal/PublicAgentActivityFeed.tsx

'use client';

export function PublicAgentActivityFeed({ limit = 10 }) {
  const [activities, setActivities] = useState([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Fetch recent public activities
    fetch(`/api/public/agent-activity?limit=${limit}`)
      .then(r => r.json())
      .then(setActivities);

    // Live updates
    const ws = new WebSocket(`${WS_URL}/public/agent-activity`);
    ws.onopen = () => setIsLive(true);
    ws.onmessage = (e) => {
      const newActivity = JSON.parse(e.data);
      setActivities(prev => [newActivity, ...prev].slice(0, limit));
    };

    return () => ws.close();
  }, [limit]);

  return (
    <div className="space-y-4">
      {/* Live Indicator */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Compliance Activity</h3>
        <div className="flex items-center gap-2">
          <div className={cn(
            'h-2 w-2 rounded-full',
            isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          )} />
          <span className="text-sm text-gray-600">
            {isLive ? 'Live Updates' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Activity Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {activities.map(activity => (
          <PublicActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}

function PublicActivityCard({ activity }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      {/* Agent Info */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">
            {getAgentIcon(activity.agentType)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Agent Name & Action */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                {activity.agentName}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {activity.publicDescription}
              </p>
            </div>
            <StatusIcon status={activity.status} />
          </div>

          {/* Verification Details */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ClockIcon className="h-4 w-4" />
              <span>{formatRelativeTime(activity.timestamp)}</span>
            </div>

            {activity.controlsVerified && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheckIcon className="h-4 w-4" />
                <span>{activity.controlsVerified} controls verified</span>
              </div>
            )}

            {activity.confidence && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <SparklesIcon className="h-4 w-4" />
                <span>{activity.confidence}% confidence</span>
              </div>
            )}
          </div>

          {/* Human Oversight Badge */}
          {activity.humanApproved && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
              <CheckBadgeIcon className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">
                Human Verified
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sanitization: What we show vs hide
function sanitizeActivityForPublic(internalActivity) {
  return {
    id: internalActivity.id,
    agentName: internalActivity.agentName,
    agentType: internalActivity.agentType,

    // Generic description (no sensitive details)
    publicDescription: getPublicDescription(internalActivity),

    // Show these
    timestamp: internalActivity.timestamp,
    status: internalActivity.status,
    controlsVerified: internalActivity.metadata?.controlsVerified,
    confidence: internalActivity.confidence,
    humanApproved: internalActivity.approvedBy !== null,

    // HIDE these (internal only)
    // - Specific resource names
    // - IP addresses
    // - Employee names
    // - Detailed reasoning
    // - Internal IDs
  };
}

function getPublicDescription(activity) {
  const templates = {
    'access_control_verification': 'Verified multi-factor authentication compliance across all user accounts',
    'infrastructure_scan': 'Scanned cloud infrastructure for security configuration compliance',
    'policy_review': 'Reviewed and verified security policy compliance',
    'vendor_assessment': 'Assessed vendor security posture and certifications',
    'evidence_collection': 'Collected audit evidence for compliance controls',
  };

  return templates[activity.type] || 'Performed compliance verification';
}
```

### 9.6 Public Control Coverage Matrix

**Shows which controls are verified, with transparency:**

```tsx
// components/trust-portal/PublicControlCoverageMatrix.tsx

export function PublicControlCoverageMatrix() {
  const [coverage, setCoverage] = useState(null);

  useEffect(() => {
    fetch('/api/public/control-coverage')
      .then(r => r.json())
      .then(setCoverage);
  }, []);

  if (!coverage) return <Skeleton />;

  return (
    <div className="space-y-8">
      {coverage.frameworks.map(framework => (
        <div key={framework.name}>
          <h3 className="text-xl font-semibold mb-4">{framework.name}</h3>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {framework.domains.map(domain => (
              <DomainCard key={domain.id} domain={domain} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DomainCard({ domain }) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-gray-900">{domain.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{domain.description}</p>
        </div>
        <CoverageIcon coverage={domain.coverage} />
      </div>

      {/* Controls List */}
      <div className="mt-4 space-y-2">
        {domain.controls.slice(0, 3).map(control => (
          <ControlRow key={control.id} control={control} />
        ))}
        {domain.controls.length > 3 && (
          <button className="text-sm text-indigo-600 hover:text-indigo-500">
            +{domain.controls.length - 3} more controls
          </button>
        )}
      </div>

      {/* Last Verified */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <ClockIcon className="h-4 w-4" />
          <span>Last verified {formatRelativeTime(domain.lastVerified)}</span>
        </div>
      </div>
    </div>
  );
}

function ControlRow({ control }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <StatusDot status={control.status} />
      <span className="text-gray-700">{control.name}</span>
      {control.aiVerified && (
        <span className="ml-auto text-xs text-purple-600">AI</span>
      )}
    </div>
  );
}
```

### 9.7 Embeddable Widgets

**Allow prospects to embed live compliance status on their sites:**

```tsx
// components/trust-portal/EmbeddableWidget.tsx

/**
 * Embeddable Compliance Widget
 *
 * Usage:
 * <script src="https://yourcompany.com/trust/widget.js"></script>
 * <div data-trust-widget="compliance-status"></div>
 */

export function generateEmbedCode(widgetType: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  return `
<!-- ${widgetType} Widget -->
<script src="${baseUrl}/trust/widget.js"></script>
<div
  data-trust-widget="${widgetType}"
  data-company="yourcompany"
  style="max-width: 400px;"
></div>
  `.trim();
}

// Public API endpoint for widget data
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const widgetType = searchParams.get('type');

  // Allow CORS for embedding
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  switch (widgetType) {
    case 'compliance-status':
      return Response.json(await getPublicComplianceStatus(), { headers });

    case 'certifications':
      return Response.json(await getPublicCertifications(), { headers });

    case 'security-score':
      return Response.json(await getPublicSecurityScore(), { headers });

    default:
      return Response.json({ error: 'Invalid widget type' }, { status: 400 });
  }
}

// Widget rendering
function renderComplianceStatusWidget(container: HTMLElement, data: any) {
  container.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    ">
      <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">
        Compliance Status
      </div>
      <div style="font-size: 3rem; font-weight: bold; margin-bottom: 1rem;">
        ${data.score}%
      </div>
      <div style="font-size: 0.875rem; opacity: 0.9;">
        ${data.frameworks.map(f => f.name).join(' • ')}
      </div>
      <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
        <a href="${data.trustCenterUrl}" style="
          color: white;
          text-decoration: none;
          font-size: 0.875rem;
          opacity: 0.9;
        ">
          View Trust Center →
        </a>
      </div>
    </div>
  `;
}
```

### 9.8 Agent Transparency Page

**Route:** `/trust/how-it-works`

**Purpose:** Explain our unique AI compliance approach to prospects

```tsx
// app/(public)/trust/how-it-works/page.tsx

export default function AgentTransparencyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">
        How We Maintain Compliance 24/7
      </h1>

      <p className="text-xl text-gray-600 text-center mb-16">
        Unlike traditional compliance programs that rely on annual audits and manual checks,
        we use AI to verify security controls continuously.
      </p>

      {/* Traditional vs Agentic */}
      <ComparisonSection />

      {/* Meet Our AI Team */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold mb-8">Meet Our AI Compliance Team</h2>

        <div className="grid gap-6 md:grid-cols-2">
          <AgentShowcaseCard
            name="Access Control Agent"
            icon="🔐"
            description="Verifies MFA, password policies, and access controls every 4 hours"
            recentWork="Last verified 2 hours ago: 156 accounts, 100% compliant"
          />

          <AgentShowcaseCard
            name="Discovery Agent"
            icon="🔍"
            description="Scans infrastructure to maintain accurate asset inventory"
            recentWork="Last scan 4 hours ago: 47 resources discovered"
          />

          <AgentShowcaseCard
            name="Vendor Risk Agent"
            icon="🏢"
            description="Monitors vendor certifications and risk assessments"
            recentWork="Monitoring 23 vendors, all SOC 2 compliant"
          />

          <AgentShowcaseCard
            name="Policy Agent"
            icon="📋"
            description="Reviews and updates security policies automatically"
            recentWork="All 12 policies up to date and compliant"
          />
        </div>
      </section>

      {/* Human Oversight */}
      <section className="mt-16 bg-blue-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-4">Human Oversight</h2>
        <p className="text-gray-700 mb-6">
          While our AI agents work 24/7, every critical decision requires human approval.
          Our security team reviews and approves all agent recommendations to ensure accuracy.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            value="98%"
            label="AI Confidence Rate"
            description="Average confidence across all verifications"
          />
          <StatCard
            value="100%"
            label="Human Approval"
            description="All critical findings reviewed by security team"
          />
          <StatCard
            value="24/7"
            label="Continuous Monitoring"
            description="Agents verify controls every 4 hours"
          />
        </div>
      </section>

      {/* Chain of Custody */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold mb-8">Evidence Chain of Custody</h2>
        <p className="text-gray-600 mb-8">
          Every piece of evidence collected by our AI includes complete transparency:
        </p>

        <ChainOfCustodyExample />
      </section>

      {/* Trust Center CTA */}
      <div className="mt-16 text-center">
        <Link
          href="/trust"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700"
        >
          View Live Compliance Status →
        </Link>
      </div>
    </div>
  );
}

function ComparisonSection() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Traditional Compliance
        </h3>
        <ul className="space-y-3 text-gray-600">
          <li className="flex gap-2">
            <span>❌</span>
            <span>Annual audits (point-in-time verification)</span>
          </li>
          <li className="flex gap-2">
            <span>❌</span>
            <span>Manual evidence collection</span>
          </li>
          <li className="flex gap-2">
            <span>❌</span>
            <span>Can drift out of compliance between audits</span>
          </li>
          <li className="flex gap-2">
            <span>❌</span>
            <span>Expensive consultant fees</span>
          </li>
        </ul>
      </div>

      <div className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-200">
        <h3 className="text-lg font-semibold mb-4 text-indigo-900">
          Our AI-Powered Approach
        </h3>
        <ul className="space-y-3 text-indigo-900">
          <li className="flex gap-2">
            <span>✅</span>
            <span>Continuous verification every 4 hours</span>
          </li>
          <li className="flex gap-2">
            <span>✅</span>
            <span>Automated evidence collection</span>
          </li>
          <li className="flex gap-2">
            <span>✅</span>
            <span>Real-time compliance monitoring</span>
          </li>
          <li className="flex gap-2">
            <span>✅</span>
            <span>Always audit-ready</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
```

### 9.9 Competitive Differentiation

**How the Trust Portal becomes a sales weapon:**

```typescript
// Sales Use Cases

const competitiveDifferentiation = {
  // Enterprise Sales Demo
  enterpriseDemo: {
    traditional: "Here's our SOC 2 report from 6 months ago",
    agentic: "Visit trust.yourcompany.com - see our AI verifying controls right now",
    impact: "Prospect thinks: 'Wow, they're innovative AND serious about security'"
  },

  // Security Questionnaire
  securityQuestionnaire: {
    question: "How do you maintain compliance between audits?",
    traditional: "We have a compliance team that reviews controls quarterly",
    agentic: "Our AI verifies every control every 4 hours. See live status: trust.yourcompany.com",
    impact: "Instant credibility, differentiation from competitors"
  },

  // Investor Due Diligence
  dueDiligence: {
    traditional: "Email audit report PDF (6 months old)",
    agentic: "Share trust portal link - investors see real-time compliance",
    impact: "VC thinks: 'This team is serious about governance'"
  },

  // Customer Audit
  customerAudit: {
    traditional: "Provide static evidence package",
    agentic: "Give auditor read-only access to trust portal with chain of custody",
    impact: "Auditor thinks: 'This is the most transparent vendor we've seen'"
  },
};
```

### 9.10 API Endpoints for Trust Portal

```typescript
// apps/web/src/app/api/public/compliance-status/route.ts

/**
 * Public API: Real-time compliance status
 * No authentication required
 * Rate limited to 100 req/min per IP
 */
export async function GET() {
  const status = await getPublicComplianceStatus();

  return Response.json({
    score: status.overallScore,
    lastUpdate: status.lastUpdate,
    frameworks: status.frameworks.map(f => ({
      name: f.name,
      certified: f.certified,
      expires: f.expiryDate,
      coverage: f.coverage,
    })),
    nextCheck: status.nextScheduledCheck,
    trustCenterUrl: `${baseUrl}/trust`,
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=300', // Cache for 5 minutes
      'Access-Control-Allow-Origin': '*',
    }
  });
}

// apps/web/src/app/api/public/agent-activity/route.ts

/**
 * Public API: Recent agent activity (sanitized)
 * Shows what agents are doing without sensitive details
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

  const activities = await getRecentAgentActivities(limit);
  const sanitized = activities.map(sanitizeActivityForPublic);

  return Response.json(sanitized, {
    headers: {
      'Cache-Control': 'public, s-maxage=60', // Cache for 1 minute
      'Access-Control-Allow-Origin': '*',
    }
  });
}

// WebSocket endpoint for live updates
// apps/web/src/app/api/public/ws/route.ts

export async function GET(request: Request) {
  const { socket, response } = Deno.upgradeWebSocket(request);

  socket.onopen = () => {
    // Subscribe to public compliance updates
    subscribeToPublicUpdates((update) => {
      socket.send(JSON.stringify(update));
    });
  };

  return response;
}
```

### 9.11 Trust Portal SEO & Marketing

```tsx
// apps/web/src/app/(public)/trust/layout.tsx

export const metadata = {
  title: 'Security & Compliance Trust Center | YourCompany',
  description: 'Real-time compliance monitoring powered by AI. See our SOC 2, ISO 27001 certifications and live security controls verification.',
  openGraph: {
    title: 'YourCompany Security Trust Center',
    description: 'AI-powered compliance monitoring 24/7',
    images: ['/trust-og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YourCompany Security Trust Center',
    description: 'See our real-time compliance status',
  },
};

// Structured data for search engines
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "YourCompany",
  "description": "AI-powered GRC platform",
  "url": "https://yourcompany.com/trust",
  "certifications": [
    {
      "@type": "Certification",
      "name": "SOC 2 Type II",
      "issuedBy": "AICPA",
      "dateIssued": "2025-03-01",
      "expires": "2026-03-01"
    }
  ]
};
```

### 9.12 Implementation Checklist

**Trust Portal Development Roadmap:**

```markdown
## Phase 1: Core Pages ✅
- [ ] Trust portal homepage
- [ ] Live compliance status widget
- [ ] Public agent activity feed (sanitized)
- [ ] Certifications page
- [ ] Security controls matrix

## Phase 2: Advanced Features
- [ ] WebSocket for live updates
- [ ] Embeddable widgets
- [ ] Agent transparency page
- [ ] Incident history timeline
- [ ] Download audit reports

## Phase 3: Polish
- [ ] Mobile responsive design
- [ ] SEO optimization
- [ ] Performance (edge caching)
- [ ] Analytics tracking
- [ ] A/B testing

## Phase 4: Sales Integration
- [ ] Custom branding options
- [ ] White-label for enterprise
- [ ] Sales demo mode
- [ ] Lead capture forms
```

---

## 10. Implementation Roadmap {#10-roadmap}

### Phase 1: Foundation ✅
- [x] Navigation structure
- [x] Layout components
- [x] Design system

### Phase 2: Core Pages (Current)
- [ ] Today's Work page
- [ ] Audit Readiness page
- [ ] Agent Oversight page
- [ ] Approvals page
- [ ] Evidence Repository page

### Phase 3: Trust Portal
- [ ] Public trust center homepage
- [ ] Live compliance widget
- [ ] Public agent activity feed
- [ ] Agent transparency page
- [ ] Embeddable widgets

### Phase 4: Real-Time
- [ ] WebSocket infrastructure
- [ ] Live badge updates (internal)
- [ ] Live compliance updates (public)
- [ ] Agent activity feed

### Phase 5: Polish
- [ ] Mobile responsive
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] SEO for trust portal

---

## Summary

Part 2 defines the complete UX architecture for an Agent-as-Employee paradigm:

**Key Innovations:**

1. **Paradigm Shift:** User = Manager, Agents = Employees
2. **Three-Tier Navigation:** Daily → Outcomes → Reports
3. **Transparency:** Complete chain of custody for admissibility
4. **Business Focus:** Everything serves "Are we audit-ready?"
5. **Public Trust Portal:** Live agent transparency for prospects/customers (unique differentiator)

**Impact:**

**Internal Users:**
- User time: 90% reduction (15-20 hrs → 1-2 hrs/week)
- Time to audit: 60% faster (6-9 months → 2-3 months)
- Evidence coverage: 95%+ (vs 70-80% traditional)

**External (Sales/Marketing):**
- Trust Portal as competitive weapon
- Live compliance status vs static certificates
- Real-time agent activity builds credibility
- Embeddable widgets for marketing site
- Unique differentiation in enterprise sales

**Next:** [Part 3: System Architecture](./03_system_architecture.md)

---

**Part 2 Complete** | **Version 2.0** | **Last Updated:** November 16, 2025
