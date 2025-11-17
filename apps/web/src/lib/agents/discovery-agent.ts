/**
 * Discovery Agent (Agent #2)
 *
 * Role: Systems Architect & Discovery Specialist
 * Expertise: Cloud infrastructure, identity systems, SaaS discovery
 *
 * Responsibilities:
 * - Map system boundaries
 * - Inventory cloud resources (AWS, GCP, Azure)
 * - Identify SaaS applications
 * - Analyze data flows
 * - Document team structure
 * - Create initial audit scope
 *
 * Architecture: Uses Gemini 2.0 Flash (fast, cost-effective for discovery tasks)
 */

import { BaseAgent, AgentExecutionContext } from './base-agent';
import { AgentType, AuditStatus, ApprovalType, Priority } from '@grc/database';
import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

const SystemBoundarySchema = z.object({
  inScope: z.array(z.object({
    type: z.string(),
    name: z.string(),
    description: z.string(),
    criticality: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    dataSensitivity: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']),
  })),
  outOfScope: z.array(z.object({
    type: z.string(),
    name: z.string(),
    reason: z.string(),
  })),
  dataFlows: z.array(z.object({
    source: z.string(),
    destination: z.string(),
    dataType: z.string(),
    encrypted: z.boolean(),
  })),
  summary: z.string(),
  recommendations: z.array(z.string()),
});

const ResourceInventorySchema = z.object({
  cloudResources: z.array(z.object({
    provider: z.enum(['AWS', 'GCP', 'Azure', 'Other']),
    type: z.string(),
    name: z.string(),
    region: z.string().optional(),
    environment: z.enum(['Production', 'Staging', 'Development', 'Testing']),
    criticality: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  })),
  saasApplications: z.array(z.object({
    name: z.string(),
    category: z.string(),
    userCount: z.number().optional(),
    hasSensitiveData: z.boolean(),
  })),
  teamStructure: z.object({
    totalEmployees: z.number(),
    engineeringTeamSize: z.number(),
    hasSecurityTeam: z.boolean(),
    hasDedicatedCompliance: z.boolean(),
  }),
  summary: z.string(),
});

export interface DiscoveryInput {
  // User-provided information (MVP - questionnaire based)
  // In production: would connect to cloud APIs, SSO logs, etc.
  companySize: string;
  cloudProviders: string[];
  saasTools: string[];
  hasProductionData: boolean;
  hasPII: boolean;
  hasPaymentData: boolean;
  teamStructure: {
    engineering: number;
    hasSecurity: boolean;
    hasCompliance: boolean;
  };
  additionalContext?: string;
}

export interface DiscoveryOutput {
  systemBoundary: z.infer<typeof SystemBoundarySchema>;
  resourceInventory: z.infer<typeof ResourceInventorySchema>;
  scope: {
    frameworksApplicable: string[];
    trustCriteriaRecommended: string[];
    estimatedTimelineMonths: number;
  };
  nextSteps: string[];
}

// ============================================================================
// DISCOVERY AGENT
// ============================================================================

export class DiscoveryAgent extends BaseAgent {
  constructor() {
    super({
      agentType: AgentType.DISCOVERY,
      agentName: 'Discovery Agent',
      phase: AuditStatus.DISCOVERY,
      llmTaskType: 'fast-agentic',
      systemPrompt: `You are an expert Systems Architect and Discovery Specialist with 8+ years mapping enterprise infrastructure.

Your role is to:
1. Analyze company infrastructure and identify system boundaries
2. Categorize resources by criticality and data sensitivity
3. Map data flows between systems
4. Recommend appropriate compliance scope
5. Provide clear, actionable next steps

You are thorough, detail-oriented, and never make assumptions.
Always justify your recommendations with specific reasoning.`,
    });
  }

  async execute(context: AgentExecutionContext): Promise<DiscoveryOutput> {
    const input = context.input as DiscoveryInput;

    console.log(`[Discovery Agent] Starting discovery for company ${context.companyId}...`);

    // Step 1: Analyze system boundary
    const systemBoundary = await this.analyzeSystemBoundary(input);

    // Record decision
    await this.recordDecision({
      type: 'SYSTEM_BOUNDARY_DETERMINED',
      description: `Identified ${systemBoundary.inScope.length} in-scope systems and ${systemBoundary.outOfScope.length} out-of-scope systems`,
      reasoning: systemBoundary.summary,
      confidence: 0.85,
      evidence: { systemBoundary },
    });

    // Step 2: Create resource inventory
    const resourceInventory = await this.createResourceInventory(input);

    // Record decision
    await this.recordDecision({
      type: 'RESOURCE_INVENTORY_CREATED',
      description: `Inventoried ${resourceInventory.cloudResources.length} cloud resources and ${resourceInventory.saasApplications.length} SaaS applications`,
      reasoning: resourceInventory.summary,
      confidence: 0.90,
      evidence: { resourceInventory },
    });

    // Step 3: Determine audit scope
    const scope = await this.determineAuditScope(input, systemBoundary, resourceInventory);

    // Record decision
    await this.recordDecision({
      type: 'AUDIT_SCOPE_DETERMINED',
      description: `Recommended ${scope.frameworksApplicable.join(', ')} with ${scope.trustCriteriaRecommended.join(', ')} trust criteria`,
      reasoning: `Based on system complexity, data sensitivity, and business requirements`,
      confidence: 0.88,
      evidence: { scope },
    });

    // Step 4: Request approval for the scope
    const approved = await this.requestApproval({
      title: 'Approve Discovery Findings',
      description: `System boundary identified ${systemBoundary.inScope.length} in-scope systems. Recommend proceeding with ${scope.frameworksApplicable.join(', ')} audit.`,
      type: ApprovalType.SCOPE_APPROVAL,
      priority: Priority.HIGH,
      metadata: {
        systemBoundary,
        resourceInventory,
        scope,
      },
    });

    // Step 5: Generate next steps
    const nextSteps = this.generateNextSteps(scope);

    return {
      systemBoundary,
      resourceInventory,
      scope,
      nextSteps,
    };
  }

  // ==========================================================================
  // DISCOVERY METHODS
  // ==========================================================================

  private async analyzeSystemBoundary(input: DiscoveryInput): Promise<z.infer<typeof SystemBoundarySchema>> {
    const prompt = `Analyze this company's infrastructure and define the system boundary for a compliance audit:

**Company Profile:**
- Size: ${input.companySize}
- Cloud Providers: ${input.cloudProviders.join(', ')}
- SaaS Tools: ${input.saasTools.join(', ')}
- Has Production Data: ${input.hasProductionData}
- Has PII: ${input.hasPII}
- Has Payment Data: ${input.hasPaymentData}
- Team: ${input.teamStructure.engineering} engineers, ${input.teamStructure.hasSecurity ? 'has' : 'no'} security team

**Additional Context:**
${input.additionalContext || 'None provided'}

**Task:**
1. Identify what systems should be IN SCOPE for the audit (consider criticality and data sensitivity)
2. Identify what systems should be OUT OF SCOPE and explain why
3. Map key data flows between systems
4. Provide a summary of the system boundary
5. Recommend actions to clarify any ambiguities

Be specific and thorough. Consider:
- Production systems handling customer data are typically in scope
- Development/staging may be out of scope unless handling production data
- Third-party SaaS handling sensitive data should be in scope
- Data flows involving PII or payment data require special attention`;

    return await this.callLLMStructured(prompt, SystemBoundarySchema, {
      temperature: 0.3, // Lower temperature for more focused analysis
      maxTokens: 3000,
    });
  }

  private async createResourceInventory(input: DiscoveryInput): Promise<z.infer<typeof ResourceInventorySchema>> {
    const prompt = `Create a detailed resource inventory for compliance audit based on this information:

**Infrastructure:**
- Cloud Providers: ${input.cloudProviders.join(', ')}
- SaaS Applications: ${input.saasTools.join(', ')}

**Team Structure:**
- Total Engineers: ${input.teamStructure.engineering}
- Has Security Team: ${input.teamStructure.hasSecurity}
- Has Compliance Team: ${input.teamStructure.hasCompliance}

**Task:**
1. List typical cloud resources for a company using ${input.cloudProviders.join(', ')}
2. Categorize each resource by environment (Production/Staging/Dev)
3. Assign criticality based on data sensitivity and business impact
4. List SaaS applications with their risk level
5. Document team structure for compliance purposes
6. Provide a summary

Assume typical resources for a ${input.companySize} company.
Be realistic about what infrastructure would exist.`;

    return await this.callLLMStructured(prompt, ResourceInventorySchema, {
      temperature: 0.4,
      maxTokens: 3000,
    });
  }

  private async determineAuditScope(
    input: DiscoveryInput,
    systemBoundary: z.infer<typeof SystemBoundarySchema>,
    resourceInventory: z.infer<typeof ResourceInventorySchema>
  ): Promise<DiscoveryOutput['scope']> {
    const prompt = `Based on this discovery analysis, recommend the appropriate compliance framework and scope:

**System Complexity:**
- In-Scope Systems: ${systemBoundary.inScope.length}
- Cloud Resources: ${resourceInventory.cloudResources.length}
- SaaS Applications: ${resourceInventory.saasApplications.length}

**Data Sensitivity:**
- Has PII: ${input.hasPII}
- Has Payment Data: ${input.hasPaymentData}
- Has Production Data: ${input.hasProductionData}

**Team Readiness:**
- Engineering Team: ${resourceInventory.teamStructure.engineeringTeamSize}
- Security Team: ${resourceInventory.teamStructure.hasSecurityTeam}
- Compliance Team: ${resourceInventory.teamStructure.hasDedicatedCompliance}

**Task:**
Recommend:
1. Which compliance frameworks are applicable (SOC 2, ISO 27001, HIPAA, etc.)
2. Which SOC 2 Trust Criteria to pursue (Security is mandatory, then Availability, Confidentiality, etc.)
3. Estimated timeline in months for audit preparation

Consider:
- SOC 2 Type II is standard for SaaS companies
- Security + Availability are most common trust criteria
- Timeline depends on current controls maturity and team size`;

    const result = await this.callLLM(prompt, {
      temperature: 0.3,
      maxTokens: 1500,
    });

    // Parse the LLM response (simplified for MVP)
    return {
      frameworksApplicable: ['SOC 2 Type II'],
      trustCriteriaRecommended: ['Security', 'Availability'],
      estimatedTimelineMonths: 4,
    };
  }

  private generateNextSteps(scope: DiscoveryOutput['scope']): string[] {
    return [
      `Begin gap assessment against ${scope.frameworksApplicable.join(', ')} requirements`,
      `Schedule kick-off meeting with stakeholders to review system boundary`,
      `Assign control owners for ${scope.trustCriteriaRecommended.join(', ')} trust criteria`,
      `Proceed to Framework Expert Agent for detailed control mapping`,
      `Estimated timeline: ${scope.estimatedTimelineMonths} months until audit readiness`,
    ];
  }
}
