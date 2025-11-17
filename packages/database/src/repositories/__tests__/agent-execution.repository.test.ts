/**
 * @file agent-execution.repository.test.ts
 * @description Tests for AgentExecutionRepository
 * @module @grc/database/repositories/__tests__
 * @architecture SYSTEM_PROMPT.md "Testing Requirements (MANDATORY)"
 *
 * Architecture Reference: SYSTEM_PROMPT.md Lines 374-416
 * Quote: "For EVERY file created, generate a matching test file...
 *         Minimum test coverage: 80%"
 *
 * Test Coverage:
 * - CRUD operations (create, read, update, delete)
 * - Status transitions (running → completed/failed/cancelled)
 * - Filtering and querying
 * - Statistics and analytics
 * - Health checks and stuck execution detection
 * - Error handling
 */

import { PrismaClient, AgentType, ExecutionStatus, AuditStatus } from '@prisma/client';
import {
  AgentExecutionRepository,
  CreateAgentExecutionInput,
} from '../agent-execution.repository';

describe('AgentExecutionRepository', () => {
  let prisma: PrismaClient;
  let repository: AgentExecutionRepository;
  let testAuditId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new AgentExecutionRepository(prisma);

    // Create test audit
    const audit = await prisma.audit.create({
      data: {
        framework: 'SOC2_TYPE2',
        status: 'DISCOVERY',
        company: {
          create: {
            name: 'Test Company',
            createdBy: {
              create: {
                clerkId: 'test_clerk_id',
                email: 'test@example.com',
              },
            },
          },
        },
      },
    });
    testAuditId = audit.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.agentExecution.deleteMany({});
    await prisma.audit.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up executions after each test
    await prisma.agentExecution.deleteMany({});
  });

  describe('createExecution()', () => {
    it('should create a new execution with default status RUNNING', async () => {
      const input: CreateAgentExecutionInput = {
        auditId: testAuditId,
        agentType: AgentType.DISCOVERY,
        agentName: 'Discovery Agent',
        phase: AuditStatus.DISCOVERY,
      };

      const execution = await repository.createExecution(input);

      expect(execution).toBeDefined();
      expect(execution.id).toBeDefined();
      expect(execution.agentType).toBe(AgentType.DISCOVERY);
      expect(execution.agentName).toBe('Discovery Agent');
      expect(execution.status).toBe(ExecutionStatus.RUNNING);
      expect(execution.auditId).toBe(testAuditId);
    });

    it('should create execution with custom status', async () => {
      const input: CreateAgentExecutionInput = {
        auditId: testAuditId,
        agentType: AgentType.FRAMEWORK_EXPERT,
        agentName: 'Framework Expert',
        phase: AuditStatus.GAP_ASSESSMENT,
        status: ExecutionStatus.PENDING,
      };

      const execution = await repository.createExecution(input);

      expect(execution.status).toBe(ExecutionStatus.PENDING);
    });

    it('should create execution with input data', async () => {
      const input: CreateAgentExecutionInput = {
        auditId: testAuditId,
        agentType: AgentType.ACCESS_CONTROL,
        agentName: 'Access Control Agent',
        phase: AuditStatus.EVIDENCE_COLLECTION,
        input: {
          controlId: 'CC6.1',
          screenshotUrl: 'https://example.com/screenshot.png',
        },
      };

      const execution = await repository.createExecution(input);

      expect(execution.input).toBeDefined();
      const parsedInput = JSON.parse(execution.input!);
      expect(parsedInput.controlId).toBe('CC6.1');
    });
  });

  describe('completeExecution()', () => {
    it('should mark execution as completed with output', async () => {
      const execution = await repository.createExecution({
        auditId: testAuditId,
        agentType: AgentType.DISCOVERY,
        agentName: 'Discovery Agent',
        phase: AuditStatus.DISCOVERY,
      });

      const output = {
        resourcesFound: 42,
        categorized: true,
      };

      const completed = await repository.completeExecution(execution.id, output);

      expect(completed.status).toBe(ExecutionStatus.COMPLETED);
      expect(completed.completedAt).toBeDefined();
      expect(completed.duration).toBeDefined();
      expect(completed.duration).toBeGreaterThan(0);

      const parsedOutput = JSON.parse(completed.output!);
      expect(parsedOutput.resourcesFound).toBe(42);
    });

    it('should throw error if execution not found', async () => {
      await expect(
        repository.completeExecution('nonexistent-id', {})
      ).rejects.toThrow('Execution nonexistent-id not found');
    });
  });

  describe('failExecution()', () => {
    it('should mark execution as failed with error message', async () => {
      const execution = await repository.createExecution({
        auditId: testAuditId,
        agentType: AgentType.INFRASTRUCTURE_SECURITY,
        agentName: 'Infrastructure Security',
        phase: AuditStatus.EVIDENCE_COLLECTION,
      });

      const errorMessage = 'AWS API rate limit exceeded';
      const failed = await repository.failExecution(execution.id, errorMessage);

      expect(failed.status).toBe(ExecutionStatus.FAILED);
      expect(failed.error).toBe(errorMessage);
      expect(failed.completedAt).toBeDefined();
      expect(failed.duration).toBeDefined();
    });
  });

  describe('findByFilters()', () => {
    beforeEach(async () => {
      // Create multiple executions for filtering tests
      await repository.createExecution({
        auditId: testAuditId,
        agentType: AgentType.DISCOVERY,
        agentName: 'Discovery Agent',
        phase: AuditStatus.DISCOVERY,
        status: ExecutionStatus.COMPLETED,
      });

      await repository.createExecution({
        auditId: testAuditId,
        agentType: AgentType.FRAMEWORK_EXPERT,
        agentName: 'Framework Expert',
        phase: AuditStatus.GAP_ASSESSMENT,
        status: ExecutionStatus.RUNNING,
      });

      await repository.createExecution({
        auditId: testAuditId,
        agentType: AgentType.DISCOVERY,
        agentName: 'Discovery Agent',
        phase: AuditStatus.DISCOVERY,
        status: ExecutionStatus.FAILED,
      });
    });

    it('should filter by audit ID', async () => {
      const executions = await repository.findByFilters({
        auditId: testAuditId,
      });

      expect(executions.length).toBe(3);
    });

    it('should filter by agent type', async () => {
      const executions = await repository.findByFilters({
        agentType: AgentType.DISCOVERY,
      });

      expect(executions.length).toBe(2);
      expect(executions.every((e) => e.agentType === AgentType.DISCOVERY)).toBe(
        true
      );
    });

    it('should filter by status', async () => {
      const executions = await repository.findByFilters({
        status: ExecutionStatus.RUNNING,
      });

      expect(executions.length).toBe(1);
      expect(executions[0].agentType).toBe(AgentType.FRAMEWORK_EXPERT);
    });

    it('should support pagination', async () => {
      const page1 = await repository.findByFilters(
        {},
        { skip: 0, take: 2 }
      );

      const page2 = await repository.findByFilters(
        {},
        { skip: 2, take: 2 }
      );

      expect(page1.length).toBe(2);
      expect(page2.length).toBe(1);
      expect(page1[0].id).not.toBe(page2[0].id);
    });
  });

  describe('findRunning()', () => {
    it('should find only running executions', async () => {
      await repository.createExecution({
        auditId: testAuditId,
        agentType: AgentType.DISCOVERY,
        agentName: 'Discovery Agent',
        phase: AuditStatus.DISCOVERY,
        status: ExecutionStatus.RUNNING,
      });

      await repository.createExecution({
        auditId: testAuditId,
        agentType: AgentType.FRAMEWORK_EXPERT,
        agentName: 'Framework Expert',
        phase: AuditStatus.GAP_ASSESSMENT,
        status: ExecutionStatus.COMPLETED,
      });

      const running = await repository.findRunning();

      expect(running.length).toBe(1);
      expect(running[0].status).toBe(ExecutionStatus.RUNNING);
    });

    it('should filter running executions by audit ID', async () => {
      const execution = await repository.createExecution({
        auditId: testAuditId,
        agentType: AgentType.DISCOVERY,
        agentName: 'Discovery Agent',
        phase: AuditStatus.DISCOVERY,
        status: ExecutionStatus.RUNNING,
      });

      const running = await repository.findRunning(testAuditId);

      expect(running.length).toBe(1);
      expect(running[0].id).toBe(execution.id);
    });
  });

  describe('getExecutionStats()', () => {
    beforeEach(async () => {
      // Create executions with different statuses
      const exec1 = await repository.createExecution({
        auditId: testAuditId,
        agentType: AgentType.DISCOVERY,
        agentName: 'Discovery Agent',
        phase: AuditStatus.DISCOVERY,
      });
      await repository.completeExecution(exec1.id, { success: true });

      const exec2 = await repository.createExecution({
        auditId: testAuditId,
        agentType: AgentType.DISCOVERY,
        agentName: 'Discovery Agent',
        phase: AuditStatus.DISCOVERY,
      });
      await repository.failExecution(exec2.id, 'Test error');

      await repository.createExecution({
        auditId: testAuditId,
        agentType: AgentType.FRAMEWORK_EXPERT,
        agentName: 'Framework Expert',
        phase: AuditStatus.GAP_ASSESSMENT,
        status: ExecutionStatus.RUNNING,
      });
    });

    it('should calculate correct statistics', async () => {
      const stats = await repository.getExecutionStats(testAuditId);

      expect(stats.totalExecutions).toBe(3);
      expect(stats.successful).toBe(1);
      expect(stats.failed).toBe(1);
      expect(stats.running).toBe(1);
      expect(stats.avgDuration).toBeGreaterThan(0);
    });

    it('should group by agent type', async () => {
      const stats = await repository.getExecutionStats();

      expect(stats.byAgentType[AgentType.DISCOVERY]).toBe(2);
      expect(stats.byAgentType[AgentType.FRAMEWORK_EXPERT]).toBe(1);
    });

    it('should group by status', async () => {
      const stats = await repository.getExecutionStats();

      expect(stats.byStatus[ExecutionStatus.COMPLETED]).toBe(1);
      expect(stats.byStatus[ExecutionStatus.FAILED]).toBe(1);
      expect(stats.byStatus[ExecutionStatus.RUNNING]).toBe(1);
    });
  });

  describe('findStuckExecutions()', () => {
    it('should find executions running longer than threshold', async () => {
      const execution = await repository.createExecution({
        auditId: testAuditId,
        agentType: AgentType.CODE_SCANNER,
        agentName: 'Code Scanner',
        phase: AuditStatus.EVIDENCE_COLLECTION,
        status: ExecutionStatus.RUNNING,
      });

      // Update startedAt to 10 minutes ago
      await prisma.agentExecution.update({
        where: { id: execution.id },
        data: {
          startedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        },
      });

      const stuck = await repository.findStuckExecutions(5 * 60 * 1000); // 5 minutes threshold

      expect(stuck.length).toBe(1);
      expect(stuck[0].id).toBe(execution.id);
    });

    it('should not include completed executions', async () => {
      const execution = await repository.createExecution({
        auditId: testAuditId,
        agentType: AgentType.DISCOVERY,
        agentName: 'Discovery Agent',
        phase: AuditStatus.DISCOVERY,
      });

      await repository.completeExecution(execution.id, {});

      const stuck = await repository.findStuckExecutions(1000); // 1 second threshold

      expect(stuck.length).toBe(0);
    });
  });

  describe('cancelExecution()', () => {
    it('should cancel a running execution', async () => {
      const execution = await repository.createExecution({
        auditId: testAuditId,
        agentType: AgentType.VENDOR_RISK,
        agentName: 'Vendor Risk Agent',
        phase: AuditStatus.EVIDENCE_COLLECTION,
        status: ExecutionStatus.RUNNING,
      });

      const cancelled = await repository.cancelExecution(
        execution.id,
        'User requested cancellation'
      );

      expect(cancelled.status).toBe(ExecutionStatus.CANCELLED);
      expect(cancelled.error).toBe('User requested cancellation');
      expect(cancelled.completedAt).toBeDefined();
    });

    it('should throw error if execution is not running', async () => {
      const execution = await repository.createExecution({
        auditId: testAuditId,
        agentType: AgentType.DISCOVERY,
        agentName: 'Discovery Agent',
        phase: AuditStatus.DISCOVERY,
        status: ExecutionStatus.COMPLETED,
      });

      await expect(
        repository.cancelExecution(execution.id)
      ).rejects.toThrow('Cannot cancel execution with status COMPLETED');
    });
  });

  describe('isHealthy()', () => {
    it('should return true for recently started execution', async () => {
      const execution = await repository.createExecution({
        auditId: testAuditId,
        agentType: AgentType.DISCOVERY,
        agentName: 'Discovery Agent',
        phase: AuditStatus.DISCOVERY,
        status: ExecutionStatus.RUNNING,
      });

      const healthy = await repository.isHealthy(execution.id, 60000); // 1 minute threshold

      expect(healthy).toBe(true);
    });

    it('should return false for long-running execution', async () => {
      const execution = await repository.createExecution({
        auditId: testAuditId,
        agentType: AgentType.CODE_SCANNER,
        agentName: 'Code Scanner',
        phase: AuditStatus.EVIDENCE_COLLECTION,
        status: ExecutionStatus.RUNNING,
      });

      // Update startedAt to 2 hours ago
      await prisma.agentExecution.update({
        where: { id: execution.id },
        data: {
          startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      });

      const healthy = await repository.isHealthy(execution.id, 60000); // 1 minute threshold

      expect(healthy).toBe(false);
    });

    it('should return true for completed executions', async () => {
      const execution = await repository.createExecution({
        auditId: testAuditId,
        agentType: AgentType.DISCOVERY,
        agentName: 'Discovery Agent',
        phase: AuditStatus.DISCOVERY,
      });

      await repository.completeExecution(execution.id, {});

      const healthy = await repository.isHealthy(execution.id);

      expect(healthy).toBe(true);
    });
  });

  describe('findByIdWithRelations()', () => {
    it('should include audit and related data', async () => {
      const execution = await repository.createExecution({
        auditId: testAuditId,
        agentType: AgentType.DISCOVERY,
        agentName: 'Discovery Agent',
        phase: AuditStatus.DISCOVERY,
      });

      const withRelations = await repository.findByIdWithRelations(execution.id);

      expect(withRelations).toBeDefined();
      expect(withRelations?.audit).toBeDefined();
      expect(withRelations?.audit?.id).toBe(testAuditId);
    });

    it('should return null for non-existent execution', async () => {
      const result = await repository.findByIdWithRelations('nonexistent-id');

      expect(result).toBeNull();
    });
  });
});
