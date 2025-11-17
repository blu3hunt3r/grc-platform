/**
 * @file evidence.repository.test.ts
 * @description Tests for EvidenceRepository
 * @module @grc/database/repositories/__tests__
 * @architecture SYSTEM_PROMPT.md "Testing Requirements (MANDATORY)"
 *
 * Architecture Reference: SYSTEM_PROMPT.md Lines 374-416
 * Quote: "For EVERY file created, generate a matching test file...
 *         Minimum test coverage: 80%"
 *
 * Test Coverage:
 * - CRUD operations (create, read, update, delete)
 * - Evidence lifecycle (pending → collected → validated/rejected)
 * - Filtering and querying
 * - Gap detection
 * - Statistics and completion tracking
 * - Error handling
 */

import {
  PrismaClient,
  EvidenceType,
  EvidenceStatus,
} from '@prisma/client';
import {
  EvidenceRepository,
  CreateEvidenceInput,
} from '../evidence.repository';

describe('EvidenceRepository', () => {
  let prisma: PrismaClient;
  let repository: EvidenceRepository;
  let testAuditId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new EvidenceRepository(prisma);
  });

  beforeEach(async () => {
    // Create fresh test audit for each test
    const audit = await prisma.audit.create({
      data: {
        framework: 'SOC2_TYPE2',
        status: 'EVIDENCE_COLLECTION',
        company: {
          create: {
            name: 'Test Company Ev' + Date.now(),
            createdBy: {
              create: {
                clerkId: 'test_clerk_ev_' + Date.now(),
                email: `evidence_${Date.now()}@example.com`,
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
    await prisma.evidence.deleteMany({});
    await prisma.audit.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up in correct order
    await prisma.evidence.deleteMany({});
    await prisma.audit.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('createEvidence()', () => {
    it('should create new evidence with default status PENDING', async () => {
      const input: CreateEvidenceInput = {
        auditId: testAuditId,
        controlName: 'MFA Enforcement',
        type: EvidenceType.SCREENSHOT,
        description: 'Screenshot of MFA settings',
      };

      const evidence = await repository.createEvidence(input);

      expect(evidence).toBeDefined();
      expect(evidence.id).toBeDefined();
      expect(evidence.auditId).toBe(testAuditId);
      expect(evidence.controlName).toBe('MFA Enforcement');
      expect(evidence.type).toBe(EvidenceType.SCREENSHOT);
      expect(evidence.status).toBe(EvidenceStatus.PENDING);
      expect(evidence.validated).toBe(false);
    });

    it('should create evidence with all optional fields', async () => {
      const input: CreateEvidenceInput = {
        auditId: testAuditId,
        controlName: 'Access Control',
        type: EvidenceType.API_RESPONSE,
        status: EvidenceStatus.COLLECTED,
        description: 'User permissions report',
        fileUrl: 'https://s3.example.com/evidence.pdf',
        apiResponse: JSON.stringify({ users: 42, mfaEnabled: true }),
        aiAnalysis: 'MFA is properly configured for all users',
        validated: true,
        collectedAt: new Date(),
      };

      const evidence = await repository.createEvidence(input);

      expect(evidence.status).toBe(EvidenceStatus.COLLECTED);
      expect(evidence.fileUrl).toBe('https://s3.example.com/evidence.pdf');
      expect(evidence.validated).toBe(true);
      expect(evidence.collectedAt).toBeDefined();
    });

    it('should create evidence with screenshot URL', async () => {
      const input: CreateEvidenceInput = {
        auditId: testAuditId,
        controlName: 'Password Policy',
        type: EvidenceType.SCREENSHOT,
        screenshotUrl: 'https://s3.example.com/screenshot.png',
      };

      const evidence = await repository.createEvidence(input);

      expect(evidence.screenshotUrl).toBe(
        'https://s3.example.com/screenshot.png'
      );
    });
  });

  describe('markCollected()', () => {
    it('should mark evidence as collected with file URL', async () => {
      const evidence = await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Backup Policy',
        type: EvidenceType.DOCUMENT,
      });

      const collected = await repository.markCollected(evidence.id, {
        fileUrl: 'https://s3.example.com/backup-policy.pdf',
      });

      expect(collected.status).toBe(EvidenceStatus.COLLECTED);
      expect(collected.fileUrl).toBe('https://s3.example.com/backup-policy.pdf');
      expect(collected.collectedAt).toBeDefined();
    });

    it('should mark evidence as collected with screenshot', async () => {
      const evidence = await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'MFA Settings',
        type: EvidenceType.SCREENSHOT,
      });

      const collected = await repository.markCollected(evidence.id, {
        screenshotUrl: 'https://s3.example.com/mfa.png',
      });

      expect(collected.status).toBe(EvidenceStatus.COLLECTED);
      expect(collected.screenshotUrl).toBe('https://s3.example.com/mfa.png');
    });

    it('should mark evidence as collected with API response', async () => {
      const evidence = await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'User Access',
        type: EvidenceType.API_RESPONSE,
      });

      const apiData = JSON.stringify({ totalUsers: 150, activeUsers: 142 });
      const collected = await repository.markCollected(evidence.id, {
        apiResponse: apiData,
      });

      expect(collected.status).toBe(EvidenceStatus.COLLECTED);
      expect(collected.apiResponse).toBe(apiData);
    });
  });

  describe('markValidated()', () => {
    it('should mark evidence as validated with AI analysis', async () => {
      const evidence = await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Firewall Rules',
        type: EvidenceType.CONFIGURATION,
      });

      const validated = await repository.markValidated(
        evidence.id,
        'AI Analysis: Firewall rules comply with security requirements. All inbound traffic properly restricted.'
      );

      expect(validated.status).toBe(EvidenceStatus.VALIDATED);
      expect(validated.validated).toBe(true);
      expect(validated.aiAnalysis).toContain('Firewall rules comply');
    });
  });

  describe('markRejected()', () => {
    it('should mark evidence as rejected with reason', async () => {
      const evidence = await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Incomplete Evidence',
        type: EvidenceType.SCREENSHOT,
      });

      const rejected = await repository.markRejected(
        evidence.id,
        'Screenshot is blurry and unreadable'
      );

      expect(rejected.status).toBe(EvidenceStatus.REJECTED);
      expect(rejected.validated).toBe(false);
      expect(rejected.aiAnalysis).toBe('Screenshot is blurry and unreadable');
    });
  });

  describe('findByFilters()', () => {
    beforeEach(async () => {
      // Create multiple evidence items for filtering tests
      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'MFA Enforcement',
        type: EvidenceType.SCREENSHOT,
        status: EvidenceStatus.COLLECTED,
      });

      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Password Policy',
        type: EvidenceType.DOCUMENT,
        status: EvidenceStatus.VALIDATED,
        validated: true,
      });

      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Access Control',
        type: EvidenceType.API_RESPONSE,
        status: EvidenceStatus.PENDING,
      });
    });

    it('should filter by audit ID', async () => {
      const evidence = await repository.findByFilters({
        auditId: testAuditId,
      });

      expect(evidence.length).toBe(3);
    });

    it('should filter by type', async () => {
      const screenshots = await repository.findByFilters({
        type: EvidenceType.SCREENSHOT,
      });

      expect(screenshots.length).toBe(1);
      expect(screenshots[0].type).toBe(EvidenceType.SCREENSHOT);
    });

    it('should filter by status', async () => {
      const validated = await repository.findByFilters({
        status: EvidenceStatus.VALIDATED,
      });

      expect(validated.length).toBe(1);
      expect(validated[0].status).toBe(EvidenceStatus.VALIDATED);
    });

    it('should filter by validated flag', async () => {
      const validatedEvidence = await repository.findByFilters({
        validated: true,
      });

      expect(validatedEvidence.length).toBe(1);
      expect(validatedEvidence[0].validated).toBe(true);
    });

    it('should filter by control name (case-insensitive partial match)', async () => {
      const mfaEvidence = await repository.findByFilters({
        controlName: 'mfa',
      });

      expect(mfaEvidence.length).toBe(1);
      expect(mfaEvidence[0].controlName).toContain('MFA');
    });
  });

  describe('findPending()', () => {
    it('should find only pending evidence', async () => {
      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Control 1',
        type: EvidenceType.SCREENSHOT,
        status: EvidenceStatus.PENDING,
      });

      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Control 2',
        type: EvidenceType.DOCUMENT,
        status: EvidenceStatus.COLLECTED,
      });

      const pending = await repository.findPending();

      expect(pending.length).toBe(1);
      expect(pending[0].status).toBe(EvidenceStatus.PENDING);
    });

    it('should filter pending by audit ID', async () => {
      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Control 1',
        type: EvidenceType.SCREENSHOT,
        status: EvidenceStatus.PENDING,
      });

      const pending = await repository.findPending(testAuditId);

      expect(pending.length).toBe(1);
      expect(pending[0].auditId).toBe(testAuditId);
    });
  });

  describe('findNeedingValidation()', () => {
    it('should find collected but not validated evidence', async () => {
      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Control 1',
        type: EvidenceType.SCREENSHOT,
        status: EvidenceStatus.COLLECTED,
        validated: false,
      });

      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Control 2',
        type: EvidenceType.DOCUMENT,
        status: EvidenceStatus.VALIDATED,
        validated: true,
      });

      const needingValidation = await repository.findNeedingValidation();

      expect(needingValidation.length).toBe(1);
      expect(needingValidation[0].status).toBe(EvidenceStatus.COLLECTED);
      expect(needingValidation[0].validated).toBe(false);
    });
  });

  describe('getEvidenceStats()', () => {
    beforeEach(async () => {
      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Control 1',
        type: EvidenceType.SCREENSHOT,
        status: EvidenceStatus.PENDING,
      });

      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Control 1',
        type: EvidenceType.DOCUMENT,
        status: EvidenceStatus.COLLECTED,
      });

      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Control 2',
        type: EvidenceType.API_RESPONSE,
        status: EvidenceStatus.VALIDATED,
      });

      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Control 2',
        type: EvidenceType.CONFIGURATION,
        status: EvidenceStatus.REJECTED,
      });
    });

    it('should calculate correct statistics', async () => {
      const stats = await repository.getEvidenceStats(testAuditId);

      expect(stats.totalEvidence).toBe(4);
      expect(stats.pending).toBe(1);
      expect(stats.collected).toBe(1);
      expect(stats.validated).toBe(1);
      expect(stats.rejected).toBe(1);
    });

    it('should group by type', async () => {
      const stats = await repository.getEvidenceStats(testAuditId);

      expect(stats.byType[EvidenceType.SCREENSHOT]).toBe(1);
      expect(stats.byType[EvidenceType.DOCUMENT]).toBe(1);
      expect(stats.byType[EvidenceType.API_RESPONSE]).toBe(1);
      expect(stats.byType[EvidenceType.CONFIGURATION]).toBe(1);
    });

    it('should group by control', async () => {
      const stats = await repository.getEvidenceStats(testAuditId);

      expect(stats.byControl['Control 1']).toBe(2);
      expect(stats.byControl['Control 2']).toBe(2);
    });

    it('should calculate validation rate', async () => {
      const stats = await repository.getEvidenceStats(testAuditId);

      expect(stats.validationRate).toBe(0.25); // 1 validated / 4 total
    });

    it('should calculate completion rate', async () => {
      const stats = await repository.getEvidenceStats(testAuditId);

      expect(stats.completionRate).toBe(0.5); // 2 completed (validated + collected) / 4 total
    });
  });

  describe('getCompletionPercentage()', () => {
    it('should calculate completion percentage', async () => {
      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Control 1',
        type: EvidenceType.SCREENSHOT,
        status: EvidenceStatus.VALIDATED,
      });

      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Control 2',
        type: EvidenceType.DOCUMENT,
        status: EvidenceStatus.COLLECTED,
      });

      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Control 3',
        type: EvidenceType.API_RESPONSE,
        status: EvidenceStatus.PENDING,
      });

      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Control 4',
        type: EvidenceType.CONFIGURATION,
        status: EvidenceStatus.PENDING,
      });

      const percentage = await repository.getCompletionPercentage(testAuditId);

      expect(percentage).toBe(50); // 2 completed / 4 total = 50%
    });

    it('should return 0 if no evidence exists', async () => {
      const percentage = await repository.getCompletionPercentage(testAuditId);

      expect(percentage).toBe(0);
    });
  });

  describe('markExpired()', () => {
    it('should mark old evidence as expired', async () => {
      const evidence = await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Old Evidence',
        type: EvidenceType.SCREENSHOT,
        status: EvidenceStatus.VALIDATED,
        collectedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
      });

      const expiredCount = await repository.markExpired(90); // 90 days

      expect(expiredCount).toBe(1);

      const updated = await repository.findById(evidence.id);
      expect(updated?.status).toBe(EvidenceStatus.EXPIRED);
    });

    it('should not mark recent evidence as expired', async () => {
      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Recent Evidence',
        type: EvidenceType.SCREENSHOT,
        status: EvidenceStatus.VALIDATED,
        collectedAt: new Date(),
      });

      const expiredCount = await repository.markExpired(90);

      expect(expiredCount).toBe(0);
    });

    it('should only expire collected or validated evidence', async () => {
      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Pending Evidence',
        type: EvidenceType.SCREENSHOT,
        status: EvidenceStatus.PENDING,
        collectedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
      });

      const expiredCount = await repository.markExpired(90);

      expect(expiredCount).toBe(0); // Pending evidence doesn't expire
    });
  });

  describe('findByControlName()', () => {
    it('should find evidence by control name (fuzzy search)', async () => {
      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Multi-Factor Authentication',
        type: EvidenceType.SCREENSHOT,
      });

      const evidence = await repository.findByControlName('factor');

      expect(evidence.length).toBe(1);
      expect(evidence[0].controlName).toContain('Factor');
    });

    it('should be case-insensitive', async () => {
      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Password Policy',
        type: EvidenceType.DOCUMENT,
      });

      const evidence = await repository.findByControlName('PASSWORD');

      expect(evidence.length).toBe(1);
    });
  });

  describe('findByType()', () => {
    it('should find all evidence of a specific type', async () => {
      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Control 1',
        type: EvidenceType.SCREENSHOT,
      });

      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Control 2',
        type: EvidenceType.SCREENSHOT,
      });

      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Control 3',
        type: EvidenceType.DOCUMENT,
      });

      const screenshots = await repository.findByType(
        EvidenceType.SCREENSHOT
      );

      expect(screenshots.length).toBe(2);
      expect(screenshots.every((e) => e.type === EvidenceType.SCREENSHOT)).toBe(
        true
      );
    });

    it('should filter by audit ID when provided', async () => {
      await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Control 1',
        type: EvidenceType.SCREENSHOT,
      });

      const screenshots = await repository.findByType(
        EvidenceType.SCREENSHOT,
        testAuditId
      );

      expect(screenshots.length).toBe(1);
      expect(screenshots[0].auditId).toBe(testAuditId);
    });
  });

  describe('getRecentEvidence()', () => {
    it('should return most recent evidence', async () => {
      const evidence1 = await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Control 1',
        type: EvidenceType.SCREENSHOT,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const evidence2 = await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Control 2',
        type: EvidenceType.DOCUMENT,
      });

      const recent = await repository.getRecentEvidence(2);

      expect(recent.length).toBe(2);
      expect(recent[0].id).toBe(evidence2.id); // Most recent first
      expect(recent[1].id).toBe(evidence1.id);
    });

    it('should limit results', async () => {
      for (let i = 0; i < 5; i++) {
        await repository.createEvidence({
          auditId: testAuditId,
          controlName: `Control ${i}`,
          type: EvidenceType.SCREENSHOT,
        });
      }

      const recent = await repository.getRecentEvidence(3);

      expect(recent.length).toBe(3);
    });
  });

  describe('findByIdWithRelations()', () => {
    it('should include audit details', async () => {
      const evidence = await repository.createEvidence({
        auditId: testAuditId,
        controlName: 'Control 1',
        type: EvidenceType.SCREENSHOT,
      });

      const withRelations = await repository.findByIdWithRelations(evidence.id);

      expect(withRelations).toBeDefined();
      expect(withRelations?.audit).toBeDefined();
      expect(withRelations?.audit?.id).toBe(testAuditId);
    });

    it('should return null for non-existent evidence', async () => {
      const result = await repository.findByIdWithRelations('nonexistent-id');

      expect(result).toBeNull();
    });
  });
});
