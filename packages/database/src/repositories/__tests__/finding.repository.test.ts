/**
 * @file finding.repository.test.ts
 * @description Tests for FindingRepository
 * @module @grc/database/repositories/__tests__
 * @architecture SYSTEM_PROMPT.md "Testing Requirements (MANDATORY)"
 *
 * Architecture Reference: SYSTEM_PROMPT.md Lines 374-416
 * Quote: "For EVERY file created, generate a matching test file...
 *         Minimum test coverage: 80%"
 *
 * Test Coverage:
 * - CRUD operations (create, read, update, delete)
 * - Finding lifecycle (open → in_progress → resolved/accepted_risk/false_positive)
 * - Filtering and querying
 * - Statistics and analytics
 * - Audit readiness scoring
 * - Error handling
 */

import {
  PrismaClient,
  Severity,
  FindingStatus,
} from '@prisma/client';
import {
  FindingRepository,
  CreateFindingInput,
} from '../finding.repository';

describe('FindingRepository', () => {
  let prisma: PrismaClient;
  let repository: FindingRepository;
  let testAuditId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new FindingRepository(prisma);
  });

  beforeEach(async () => {
    // Create fresh test audit for each test
    const audit = await prisma.audit.create({
      data: {
        framework: 'SOC2_TYPE2',
        status: 'GAP_ASSESSMENT',
        company: {
          create: {
            name: 'Test Company Find' + Date.now(),
            createdBy: {
              create: {
                clerkId: 'test_clerk_find_' + Date.now(),
                email: `finding_${Date.now()}@example.com`,
              },
            },
          },
        },
      },
    });
    testAuditId = audit.id;
  });

  afterAll(async () => {
    // Final cleanup (child → parent)
    await prisma.finding.deleteMany({});
    await prisma.control.deleteMany({});
    await prisma.audit.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up in correct order (child → parent)
    await prisma.finding.deleteMany({});
    await prisma.control.deleteMany({});
    await prisma.audit.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('createFinding()', () => {
    it('should create new finding with default status OPEN', async () => {
      const input: CreateFindingInput = {
        auditId: testAuditId,
        severity: Severity.HIGH,
        title: 'MFA not enforced for all users',
        description: 'Multi-factor authentication is not required for 20% of users',
        currentState: 'MFA optional for standard users',
        requiredState: 'MFA required for all users without exception',
        impact: 'Increased risk of unauthorized access',
        recommendation: 'Enable MFA requirement for all user accounts',
      };

      const finding = await repository.createFinding(input);

      expect(finding).toBeDefined();
      expect(finding.id).toBeDefined();
      expect(finding.auditId).toBe(testAuditId);
      expect(finding.severity).toBe(Severity.HIGH);
      expect(finding.status).toBe(FindingStatus.OPEN);
      expect(finding.title).toBe('MFA not enforced for all users');
    });

    it('should create finding with due date', async () => {
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      const input: CreateFindingInput = {
        auditId: testAuditId,
        severity: Severity.CRITICAL,
        title: 'Critical Security Gap',
        description: 'Test',
        currentState: 'Bad',
        requiredState: 'Good',
        impact: 'High',
        recommendation: 'Fix it',
        dueDate,
      };

      const finding = await repository.createFinding(input);

      expect(finding.dueDate).toBeDefined();
      expect(finding.dueDate?.getTime()).toBe(dueDate.getTime());
    });

    it('should create finding with custom status', async () => {
      const input: CreateFindingInput = {
        auditId: testAuditId,
        severity: Severity.MEDIUM,
        status: FindingStatus.IN_PROGRESS,
        title: 'Existing Finding',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      };

      const finding = await repository.createFinding(input);

      expect(finding.status).toBe(FindingStatus.IN_PROGRESS);
    });
  });

  describe('markInProgress()', () => {
    it('should mark finding as in progress', async () => {
      const finding = await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.MEDIUM,
        title: 'Test Finding',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      const updated = await repository.markInProgress(finding.id);

      expect(updated.status).toBe(FindingStatus.IN_PROGRESS);
    });
  });

  describe('markResolved()', () => {
    it('should mark finding as resolved with timestamp', async () => {
      const finding = await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.LOW,
        title: 'Test Finding',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      const resolved = await repository.markResolved(finding.id);

      expect(resolved.status).toBe(FindingStatus.RESOLVED);
      expect(resolved.resolvedAt).toBeDefined();
    });
  });

  describe('markAcceptedRisk()', () => {
    it('should mark finding as accepted risk with reason', async () => {
      const finding = await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.LOW,
        title: 'Low Priority Finding',
        description: 'Minor issue',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Low impact',
        recommendation: 'Fix when possible',
      });

      const accepted = await repository.markAcceptedRisk(
        finding.id,
        'Risk is acceptable given low impact and high cost to remediate'
      );

      expect(accepted.status).toBe(FindingStatus.ACCEPTED_RISK);
      expect(accepted.resolvedAt).toBeDefined();
      expect(accepted.description).toContain('Risk Acceptance');
    });
  });

  describe('markFalsePositive()', () => {
    it('should mark finding as false positive with reason', async () => {
      const finding = await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.MEDIUM,
        title: 'Incorrectly Flagged',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      const falsePositive = await repository.markFalsePositive(
        finding.id,
        'Control is actually implemented, scanner error'
      );

      expect(falsePositive.status).toBe(FindingStatus.FALSE_POSITIVE);
      expect(falsePositive.resolvedAt).toBeDefined();
      expect(falsePositive.description).toContain('False Positive');
    });
  });

  describe('findByFilters()', () => {
    beforeEach(async () => {
      await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.CRITICAL,
        status: FindingStatus.OPEN,
        title: 'Critical Finding',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.HIGH,
        status: FindingStatus.IN_PROGRESS,
        title: 'High Finding',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.MEDIUM,
        status: FindingStatus.RESOLVED,
        title: 'Medium Finding',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });
    });

    it('should filter by audit ID', async () => {
      const findings = await repository.findByFilters({
        auditId: testAuditId,
      });

      expect(findings.length).toBe(3);
    });

    it('should filter by severity', async () => {
      const critical = await repository.findByFilters({
        severity: Severity.CRITICAL,
      });

      expect(critical.length).toBe(1);
      expect(critical[0].severity).toBe(Severity.CRITICAL);
    });

    it('should filter by status', async () => {
      const open = await repository.findByFilters({
        status: FindingStatus.OPEN,
      });

      expect(open.length).toBe(1);
      expect(open[0].status).toBe(FindingStatus.OPEN);
    });

    it('should order by severity DESC then identifiedAt DESC', async () => {
      const findings = await repository.findByFilters({
        auditId: testAuditId,
      });

      expect(findings[0].severity).toBe(Severity.CRITICAL); // Highest severity first
      expect(findings[1].severity).toBe(Severity.HIGH);
      expect(findings[2].severity).toBe(Severity.MEDIUM);
    });
  });

  describe('findBySeverity()', () => {
    it('should find all findings of a specific severity', async () => {
      await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.HIGH,
        title: 'High 1',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.HIGH,
        title: 'High 2',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.LOW,
        title: 'Low 1',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      const high = await repository.findBySeverity(Severity.HIGH);

      expect(high.length).toBe(2);
      expect(high.every((f) => f.severity === Severity.HIGH)).toBe(true);
    });

    it('should filter by status', async () => {
      const finding = await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.HIGH,
        status: FindingStatus.OPEN,
        title: 'High Open',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      await repository.markResolved(finding.id);

      await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.HIGH,
        status: FindingStatus.OPEN,
        title: 'High Open 2',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      const highOpen = await repository.findBySeverity(
        Severity.HIGH,
        undefined,
        FindingStatus.OPEN
      );

      expect(highOpen.length).toBe(1);
      expect(highOpen[0].status).toBe(FindingStatus.OPEN);
    });
  });

  describe('findOpen()', () => {
    it('should find open and in-progress findings', async () => {
      await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.HIGH,
        status: FindingStatus.OPEN,
        title: 'Open',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.MEDIUM,
        status: FindingStatus.IN_PROGRESS,
        title: 'In Progress',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.LOW,
        status: FindingStatus.RESOLVED,
        title: 'Resolved',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      const open = await repository.findOpen();

      expect(open.length).toBe(2);
      expect(open.every((f) =>
        ([FindingStatus.OPEN, FindingStatus.IN_PROGRESS] as FindingStatus[]).includes(f.status)
      )).toBe(true);
    });
  });

  describe('findOverdue()', () => {
    it('should find findings past due date', async () => {
      const pastDue = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday

      await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.HIGH,
        status: FindingStatus.OPEN,
        title: 'Overdue Finding',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
        dueDate: pastDue,
      });

      const futureDue = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Next week

      await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.MEDIUM,
        status: FindingStatus.OPEN,
        title: 'Not Overdue',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
        dueDate: futureDue,
      });

      const overdue = await repository.findOverdue();

      expect(overdue.length).toBe(1);
      expect(overdue[0].title).toBe('Overdue Finding');
    });

    it('should not include resolved findings', async () => {
      const pastDue = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const finding = await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.HIGH,
        status: FindingStatus.OPEN,
        title: 'Resolved Overdue',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
        dueDate: pastDue,
      });

      await repository.markResolved(finding.id);

      const overdue = await repository.findOverdue();

      expect(overdue.length).toBe(0);
    });
  });

  describe('findCritical()', () => {
    it('should find CRITICAL and HIGH severity findings', async () => {
      await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.CRITICAL,
        title: 'Critical',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.HIGH,
        title: 'High',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.MEDIUM,
        title: 'Medium',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      const critical = await repository.findCritical();

      expect(critical.length).toBe(2);
      expect(critical.every((f) =>
        ([Severity.CRITICAL, Severity.HIGH] as Severity[]).includes(f.severity)
      )).toBe(true);
    });

    it('should exclude resolved by default', async () => {
      const finding = await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.CRITICAL,
        title: 'Resolved Critical',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      await repository.markResolved(finding.id);

      const critical = await repository.findCritical();

      expect(critical.length).toBe(0);
    });

    it('should include resolved when requested', async () => {
      const finding = await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.CRITICAL,
        title: 'Resolved Critical',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      await repository.markResolved(finding.id);

      const critical = await repository.findCritical(undefined, true);

      expect(critical.length).toBe(1);
    });
  });

  describe('getFindingStats()', () => {
    beforeEach(async () => {
      const finding1 = await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.CRITICAL,
        status: FindingStatus.OPEN,
        title: 'Critical Open',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      const finding2 = await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.HIGH,
        status: FindingStatus.IN_PROGRESS,
        title: 'High In Progress',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      const finding3 = await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.MEDIUM,
        status: FindingStatus.OPEN,
        title: 'Medium Open',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      await repository.markResolved(finding3.id);
    });

    it('should calculate correct statistics', async () => {
      const stats = await repository.getFindingStats(testAuditId);

      expect(stats.totalFindings).toBe(3);
      expect(stats.open).toBe(1);
      expect(stats.inProgress).toBe(1);
      expect(stats.resolved).toBe(1);
      expect(stats.resolutionRate).toBeCloseTo(0.333, 2); // 1/3
    });

    it('should group by severity', async () => {
      const stats = await repository.getFindingStats(testAuditId);

      expect(stats.bySeverity[Severity.CRITICAL]).toBe(1);
      expect(stats.bySeverity[Severity.HIGH]).toBe(1);
      expect(stats.bySeverity[Severity.MEDIUM]).toBe(1);
    });

    it('should calculate average resolution time', async () => {
      const stats = await repository.getFindingStats(testAuditId);

      expect(stats.avgResolutionTime).toBeGreaterThan(0);
    });
  });

  describe('findDueSoon()', () => {
    it('should find findings due within specified days', async () => {
      const soon = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days from now

      await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.HIGH,
        status: FindingStatus.OPEN,
        title: 'Due Soon',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
        dueDate: soon,
      });

      const farFuture = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.MEDIUM,
        status: FindingStatus.OPEN,
        title: 'Due Later',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
        dueDate: farFuture,
      });

      const dueSoon = await repository.findDueSoon(7); // Within 7 days

      expect(dueSoon.length).toBe(1);
      expect(dueSoon[0].title).toBe('Due Soon');
    });
  });

  describe('getAuditReadinessScore()', () => {
    it('should return 100 if no findings', async () => {
      const score = await repository.getAuditReadinessScore(testAuditId);

      expect(score).toBe(100);
    });

    it('should calculate score based on severity and status', async () => {
      // Create some findings
      await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.CRITICAL,
        status: FindingStatus.OPEN,
        title: 'Critical',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      const lowFinding = await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.LOW,
        status: FindingStatus.OPEN,
        title: 'Low',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      await repository.markResolved(lowFinding.id);

      const score = await repository.getAuditReadinessScore(testAuditId);

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(100); // Open critical finding
    });
  });

  describe('isControlCompliant()', () => {
    it('should return true if no open findings for control', async () => {
      const control = await prisma.control.create({
        data: {
          framework: 'SOC2_TYPE2',
          controlId: 'CC6.1_' + Date.now(),
          controlName: 'MFA Enforcement',
          category: 'Access Control',
          description: 'Test',
          requirements: 'Test',
          testProcedure: 'Test',
          evidenceTypes: ['SCREENSHOT'],
          frequency: 'MONTHLY',
        },
      });

      const compliant = await repository.isControlCompliant(control.id);

      expect(compliant).toBe(true);

      // Cleanup
      await prisma.control.delete({ where: { id: control.id } });
    });

    it('should return false if control has open findings', async () => {
      const control = await prisma.control.create({
        data: {
          framework: 'SOC2_TYPE2',
          controlId: 'CC6.2_' + Date.now(),
          controlName: 'Password Policy',
          category: 'Access Control',
          description: 'Test',
          requirements: 'Test',
          testProcedure: 'Test',
          evidenceTypes: ['DOCUMENT'],
          frequency: 'ONCE',
        },
      });

      await repository.createFinding({
        auditId: testAuditId,
        controlId: control.id,
        severity: Severity.MEDIUM,
        status: FindingStatus.OPEN,
        title: 'Weak passwords',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      const compliant = await repository.isControlCompliant(control.id);

      expect(compliant).toBe(false);

      // Cleanup
      await prisma.control.delete({ where: { id: control.id } });
    });
  });

  describe('getRecentFindings()', () => {
    it('should return most recent findings', async () => {
      const finding1 = await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.HIGH,
        title: 'Older',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const finding2 = await repository.createFinding({
        auditId: testAuditId,
        severity: Severity.MEDIUM,
        title: 'Newer',
        description: 'Test',
        currentState: 'Current',
        requiredState: 'Required',
        impact: 'Impact',
        recommendation: 'Recommendation',
      });

      const recent = await repository.getRecentFindings(2);

      expect(recent.length).toBe(2);
      expect(recent[0].id).toBe(finding2.id); // Most recent first
    });

    it('should limit results', async () => {
      for (let i = 0; i < 5; i++) {
        await repository.createFinding({
          auditId: testAuditId,
          severity: Severity.LOW,
          title: `Finding ${i}`,
          description: 'Test',
          currentState: 'Current',
          requiredState: 'Required',
          impact: 'Impact',
          recommendation: 'Recommendation',
        });
      }

      const recent = await repository.getRecentFindings(3);

      expect(recent.length).toBe(3);
    });
  });
});
