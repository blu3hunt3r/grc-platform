/**
 * @file approval.repository.test.ts
 * @description Tests for ApprovalRepository
 * @module @grc/database/repositories/__tests__
 * @architecture SYSTEM_PROMPT.md "Testing Requirements (MANDATORY)"
 *
 * Architecture Reference: SYSTEM_PROMPT.md Lines 374-416
 * Quote: "For EVERY file created, generate a matching test file...
 *         Minimum test coverage: 80%"
 *
 * Test Coverage:
 * - CRUD operations (create, read, update, delete)
 * - Approval lifecycle (pending → approved/rejected/expired)
 * - Filtering and querying
 * - Statistics and analytics
 * - Priority-based querying
 * - Error handling
 */

import {
  PrismaClient,
  AgentType,
  ExecutionStatus,
  AuditStatus,
  ApprovalType,
  ApprovalStatus,
  Priority,
} from '@prisma/client';
import {
  ApprovalRepository,
  CreateApprovalInput,
} from '../approval.repository';
import { AgentExecutionRepository } from '../agent-execution.repository';

describe('ApprovalRepository', () => {
  let prisma: PrismaClient;
  let repository: ApprovalRepository;
  let executionRepo: AgentExecutionRepository;
  let testAuditId: string;
  let testExecutionId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new ApprovalRepository(prisma);
    executionRepo = new AgentExecutionRepository(prisma);
  });

  beforeEach(async () => {
    // Create fresh test data for each test to avoid foreign key issues
    const audit = await prisma.audit.create({
      data: {
        framework: 'SOC2_TYPE2',
        status: 'DISCOVERY',
        company: {
          create: {
            name: 'Test Company Approval' + Date.now(),
            createdBy: {
              create: {
                clerkId: 'test_clerk_approval_' + Date.now(),
                email: `approval_${Date.now()}@example.com`,
              },
            },
          },
        },
      },
    });
    testAuditId = audit.id;

    const execution = await executionRepo.createExecution({
      auditId: testAuditId,
      agentType: AgentType.FRAMEWORK_EXPERT,
      agentName: 'Framework Expert',
      phase: AuditStatus.GAP_ASSESSMENT,
    });
    testExecutionId = execution.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.approval.deleteMany({});
    await prisma.agentExecution.deleteMany({});
    await prisma.audit.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up in correct order (child → parent)
    await prisma.approval.deleteMany({});
    await prisma.agentExecution.deleteMany({});
    await prisma.audit.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('createApproval()', () => {
    it('should create a new approval request with default status PENDING', async () => {
      const input: CreateApprovalInput = {
        executionId: testExecutionId,
        title: 'Approve Gap Assessment',
        description: 'Please review the identified compliance gaps',
        type: ApprovalType.GAP_REMEDIATION,
        priority: Priority.HIGH,
      };

      const approval = await repository.createApproval(input);

      expect(approval).toBeDefined();
      expect(approval.id).toBeDefined();
      expect(approval.executionId).toBe(testExecutionId);
      expect(approval.title).toBe('Approve Gap Assessment');
      expect(approval.status).toBe(ApprovalStatus.PENDING);
      expect(approval.priority).toBe(Priority.HIGH);
      expect(approval.type).toBe(ApprovalType.GAP_REMEDIATION);
    });

    it('should default to MEDIUM priority if not specified', async () => {
      const input: CreateApprovalInput = {
        executionId: testExecutionId,
        title: 'Test Approval',
        description: 'Test description',
        type: ApprovalType.SCOPE_APPROVAL,
      };

      const approval = await repository.createApproval(input);

      expect(approval.priority).toBe(Priority.MEDIUM);
    });

    it('should store metadata as JSON string', async () => {
      const metadata = {
        estimatedCost: 5000,
        estimatedTime: '2 weeks',
        assignedTo: 'security-team',
      };

      const input: CreateApprovalInput = {
        executionId: testExecutionId,
        title: 'Test Approval',
        description: 'Test description',
        type: ApprovalType.CONTROL_IMPLEMENTATION,
        metadata,
      };

      const approval = await repository.createApproval(input);

      expect(approval.metadata).toBeDefined();
      const parsedMetadata = JSON.parse(approval.metadata!);
      expect(parsedMetadata.estimatedCost).toBe(5000);
    });
  });

  describe('respondToApproval()', () => {
    it('should approve an approval request', async () => {
      const approval = await repository.createApproval({
        executionId: testExecutionId,
        title: 'Test Approval',
        description: 'Test',
        type: ApprovalType.SCOPE_APPROVAL,
      });

      const approved = await repository.respondToApproval(approval.id, {
        approvedBy: 'user123',
        decision: true,
        comments: 'Looks good',
      });

      expect(approved.status).toBe(ApprovalStatus.APPROVED);
      expect(approved.approvedBy).toBe('user123');
      expect(approved.decision).toBe(true);
      expect(approved.comments).toBe('Looks good');
      expect(approved.respondedAt).toBeDefined();
    });

    it('should reject an approval request', async () => {
      const approval = await repository.createApproval({
        executionId: testExecutionId,
        title: 'Test Approval',
        description: 'Test',
        type: ApprovalType.POLICY_APPROVAL,
      });

      const rejected = await repository.respondToApproval(approval.id, {
        approvedBy: 'user456',
        decision: false,
        comments: 'Needs revision',
      });

      expect(rejected.status).toBe(ApprovalStatus.REJECTED);
      expect(rejected.decision).toBe(false);
      expect(rejected.comments).toBe('Needs revision');
    });

    it('should throw error if approval not found', async () => {
      await expect(
        repository.respondToApproval('nonexistent-id', {
          approvedBy: 'user123',
          decision: true,
        })
      ).rejects.toThrow('Approval nonexistent-id not found');
    });

    it('should throw error if approval is not pending', async () => {
      const approval = await repository.createApproval({
        executionId: testExecutionId,
        title: 'Test Approval',
        description: 'Test',
        type: ApprovalType.SCOPE_APPROVAL,
      });

      // Approve it first
      await repository.approve(approval.id, 'user123');

      // Try to respond again
      await expect(
        repository.respondToApproval(approval.id, {
          approvedBy: 'user456',
          decision: false,
        })
      ).rejects.toThrow('Cannot respond to approval with status APPROVED');
    });
  });

  describe('approve() and reject()', () => {
    it('should approve using convenience method', async () => {
      const approval = await repository.createApproval({
        executionId: testExecutionId,
        title: 'Test Approval',
        description: 'Test',
        type: ApprovalType.VENDOR_APPROVAL,
      });

      const approved = await repository.approve(
        approval.id,
        'approver1',
        'Approved after review'
      );

      expect(approved.status).toBe(ApprovalStatus.APPROVED);
      expect(approved.approvedBy).toBe('approver1');
      expect(approved.decision).toBe(true);
      expect(approved.comments).toBe('Approved after review');
    });

    it('should reject using convenience method', async () => {
      const approval = await repository.createApproval({
        executionId: testExecutionId,
        title: 'Test Approval',
        description: 'Test',
        type: ApprovalType.EVIDENCE_APPROVAL,
      });

      const rejected = await repository.reject(
        approval.id,
        'rejector1',
        'Insufficient evidence'
      );

      expect(rejected.status).toBe(ApprovalStatus.REJECTED);
      expect(rejected.approvedBy).toBe('rejector1');
      expect(rejected.decision).toBe(false);
      expect(rejected.comments).toBe('Insufficient evidence');
    });
  });

  describe('findPending()', () => {
    beforeEach(async () => {
      // Create multiple approvals with different priorities
      await repository.createApproval({
        executionId: testExecutionId,
        title: 'Critical Approval',
        description: 'Urgent',
        type: ApprovalType.SCOPE_APPROVAL,
        priority: Priority.CRITICAL,
      });

      await repository.createApproval({
        executionId: testExecutionId,
        title: 'High Priority',
        description: 'Important',
        type: ApprovalType.GAP_REMEDIATION,
        priority: Priority.HIGH,
      });

      await repository.createApproval({
        executionId: testExecutionId,
        title: 'Medium Priority',
        description: 'Normal',
        type: ApprovalType.POLICY_APPROVAL,
        priority: Priority.MEDIUM,
      });

      const lowApproval = await repository.createApproval({
        executionId: testExecutionId,
        title: 'Low Priority',
        description: 'Can wait',
        type: ApprovalType.VENDOR_APPROVAL,
        priority: Priority.LOW,
      });

      // Approve one to test filtering
      await repository.approve(lowApproval.id, 'user1');
    });

    it('should find all pending approvals', async () => {
      const pending = await repository.findPending();

      expect(pending.length).toBe(3); // Low was approved
      expect(pending.every((a) => a.status === ApprovalStatus.PENDING)).toBe(
        true
      );
    });

    it('should filter by priority', async () => {
      const criticalPending = await repository.findPending({
        priority: Priority.CRITICAL,
      });

      expect(criticalPending.length).toBe(1);
      expect(criticalPending[0].priority).toBe(Priority.CRITICAL);
    });

    it('should filter by type', async () => {
      const gapApprovals = await repository.findPending({
        type: ApprovalType.GAP_REMEDIATION,
      });

      expect(gapApprovals.length).toBe(1);
      expect(gapApprovals[0].type).toBe(ApprovalType.GAP_REMEDIATION);
    });
  });

  describe('findPendingByPriority()', () => {
    beforeEach(async () => {
      // Create approvals with different priorities and times
      await repository.createApproval({
        executionId: testExecutionId,
        title: 'High 1',
        description: 'Test',
        type: ApprovalType.SCOPE_APPROVAL,
        priority: Priority.HIGH,
      });

      await new Promise((resolve) => setTimeout(resolve, 10)); // Small delay

      await repository.createApproval({
        executionId: testExecutionId,
        title: 'Critical 1',
        description: 'Test',
        type: ApprovalType.GAP_REMEDIATION,
        priority: Priority.CRITICAL,
      });

      await repository.createApproval({
        executionId: testExecutionId,
        title: 'High 2',
        description: 'Test',
        type: ApprovalType.POLICY_APPROVAL,
        priority: Priority.HIGH,
      });
    });

    it('should order by priority DESC then requestedAt ASC', async () => {
      const ordered = await repository.findPendingByPriority();

      expect(ordered.length).toBe(3);
      expect(ordered[0].priority).toBe(Priority.CRITICAL); // Highest priority first
      expect(ordered[1].priority).toBe(Priority.HIGH);
      expect(ordered[2].priority).toBe(Priority.HIGH);
      // Within same priority, older comes first
    });
  });

  describe('markExpired()', () => {
    it('should mark old pending approvals as expired', async () => {
      const approval = await repository.createApproval({
        executionId: testExecutionId,
        title: 'Old Approval',
        description: 'Test',
        type: ApprovalType.SCOPE_APPROVAL,
      });

      // Update requestedAt to 4 days ago
      await prisma.approval.update({
        where: { id: approval.id },
        data: {
          requestedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
      });

      const expiredCount = await repository.markExpired(72); // 72 hours = 3 days

      expect(expiredCount).toBe(1);

      const updated = await repository.findById(approval.id);
      expect(updated?.status).toBe(ApprovalStatus.EXPIRED);
    });

    it('should not mark recent approvals as expired', async () => {
      await repository.createApproval({
        executionId: testExecutionId,
        title: 'Recent Approval',
        description: 'Test',
        type: ApprovalType.POLICY_APPROVAL,
      });

      const expiredCount = await repository.markExpired(72);

      expect(expiredCount).toBe(0);
    });
  });

  describe('getApprovalStats()', () => {
    beforeEach(async () => {
      // Create various approvals
      const approval1 = await repository.createApproval({
        executionId: testExecutionId,
        title: 'Approval 1',
        description: 'Test',
        type: ApprovalType.SCOPE_APPROVAL,
        priority: Priority.HIGH,
      });

      const approval2 = await repository.createApproval({
        executionId: testExecutionId,
        title: 'Approval 2',
        description: 'Test',
        type: ApprovalType.GAP_REMEDIATION,
        priority: Priority.MEDIUM,
      });

      const approval3 = await repository.createApproval({
        executionId: testExecutionId,
        title: 'Approval 3',
        description: 'Test',
        type: ApprovalType.POLICY_APPROVAL,
        priority: Priority.CRITICAL,
      });

      // Approve some
      await repository.approve(approval1.id, 'user1');
      await repository.reject(approval2.id, 'user2');
      // approval3 remains pending
    });

    it('should calculate correct statistics', async () => {
      const stats = await repository.getApprovalStats();

      expect(stats.totalApprovals).toBe(3);
      expect(stats.pending).toBe(1);
      expect(stats.approved).toBe(1);
      expect(stats.rejected).toBe(1);
      expect(stats.avgResponseTime).toBeGreaterThan(0);
    });

    it('should group by type', async () => {
      const stats = await repository.getApprovalStats();

      expect(stats.byType[ApprovalType.SCOPE_APPROVAL]).toBe(1);
      expect(stats.byType[ApprovalType.GAP_REMEDIATION]).toBe(1);
      expect(stats.byType[ApprovalType.POLICY_APPROVAL]).toBe(1);
    });

    it('should group by priority', async () => {
      const stats = await repository.getApprovalStats();

      expect(stats.byPriority[Priority.HIGH]).toBe(1);
      expect(stats.byPriority[Priority.MEDIUM]).toBe(1);
      expect(stats.byPriority[Priority.CRITICAL]).toBe(1);
    });
  });

  describe('getApprovalRate()', () => {
    it('should calculate approval rate correctly', async () => {
      // Create and respond to multiple approvals
      const approval1 = await repository.createApproval({
        executionId: testExecutionId,
        title: 'Approval 1',
        description: 'Test',
        type: ApprovalType.SCOPE_APPROVAL,
      });

      const approval2 = await repository.createApproval({
        executionId: testExecutionId,
        title: 'Approval 2',
        description: 'Test',
        type: ApprovalType.GAP_REMEDIATION,
      });

      const approval3 = await repository.createApproval({
        executionId: testExecutionId,
        title: 'Approval 3',
        description: 'Test',
        type: ApprovalType.POLICY_APPROVAL,
      });

      // Approve 2, reject 1
      await repository.approve(approval1.id, 'user1');
      await repository.approve(approval2.id, 'user2');
      await repository.reject(approval3.id, 'user3');

      const rate = await repository.getApprovalRate();

      expect(rate).toBeCloseTo(0.667, 2); // 2 approved / 3 total = 66.7%
    });

    it('should return 0 if no approvals responded', async () => {
      await repository.createApproval({
        executionId: testExecutionId,
        title: 'Pending',
        description: 'Test',
        type: ApprovalType.SCOPE_APPROVAL,
      });

      const rate = await repository.getApprovalRate();

      expect(rate).toBe(0);
    });

    it('should filter by type', async () => {
      const approval1 = await repository.createApproval({
        executionId: testExecutionId,
        title: 'Scope 1',
        description: 'Test',
        type: ApprovalType.SCOPE_APPROVAL,
      });

      const approval2 = await repository.createApproval({
        executionId: testExecutionId,
        title: 'Gap 1',
        description: 'Test',
        type: ApprovalType.GAP_REMEDIATION,
      });

      await repository.approve(approval1.id, 'user1');
      await repository.reject(approval2.id, 'user2');

      const scopeRate = await repository.getApprovalRate(
        ApprovalType.SCOPE_APPROVAL
      );

      expect(scopeRate).toBe(1.0); // 100% approved for SCOPE_APPROVAL
    });
  });

  describe('hasPendingApprovals()', () => {
    it('should return true if execution has pending approvals', async () => {
      await repository.createApproval({
        executionId: testExecutionId,
        title: 'Test',
        description: 'Test',
        type: ApprovalType.SCOPE_APPROVAL,
      });

      const hasPending = await repository.hasPendingApprovals(testExecutionId);

      expect(hasPending).toBe(true);
    });

    it('should return false if all approvals are responded', async () => {
      const approval = await repository.createApproval({
        executionId: testExecutionId,
        title: 'Test',
        description: 'Test',
        type: ApprovalType.SCOPE_APPROVAL,
      });

      await repository.approve(approval.id, 'user1');

      const hasPending = await repository.hasPendingApprovals(testExecutionId);

      expect(hasPending).toBe(false);
    });

    it('should return false if no approvals exist', async () => {
      const hasPending = await repository.hasPendingApprovals('nonexistent-id');

      expect(hasPending).toBe(false);
    });
  });

  describe('getOldestPending()', () => {
    it('should return oldest pending approval', async () => {
      const approval1 = await repository.createApproval({
        executionId: testExecutionId,
        title: 'Newer',
        description: 'Test',
        type: ApprovalType.SCOPE_APPROVAL,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const approval2 = await repository.createApproval({
        executionId: testExecutionId,
        title: 'Older',
        description: 'Test',
        type: ApprovalType.GAP_REMEDIATION,
      });

      // Update approval1 to be older
      await prisma.approval.update({
        where: { id: approval1.id },
        data: {
          requestedAt: new Date(Date.now() - 1000),
        },
      });

      const oldest = await repository.getOldestPending();

      expect(oldest).toBeDefined();
      expect(oldest?.id).toBe(approval1.id);
    });

    it('should return null if no pending approvals', async () => {
      const oldest = await repository.getOldestPending();

      expect(oldest).toBeNull();
    });
  });

  describe('findByIdWithExecution()', () => {
    it('should include execution and audit details', async () => {
      const approval = await repository.createApproval({
        executionId: testExecutionId,
        title: 'Test',
        description: 'Test',
        type: ApprovalType.SCOPE_APPROVAL,
      });

      const withExecution = await repository.findByIdWithExecution(approval.id);

      expect(withExecution).toBeDefined();
      expect(withExecution?.execution).toBeDefined();
      expect(withExecution?.execution?.audit).toBeDefined();
      expect(withExecution?.execution?.audit?.id).toBe(testAuditId);
    });

    it('should return null for non-existent approval', async () => {
      const result = await repository.findByIdWithExecution('nonexistent-id');

      expect(result).toBeNull();
    });
  });
});
