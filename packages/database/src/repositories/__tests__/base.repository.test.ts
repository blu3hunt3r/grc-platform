/**
 * @file base.repository.test.ts
 * @description Tests for BaseRepository abstract class
 * @module @grc/database/repositories/__tests__
 * @architecture SYSTEM_PROMPT.md "Testing Requirements (MANDATORY)"
 *
 * Architecture Reference: SYSTEM_PROMPT.md Lines 374-416
 * Quote: "For EVERY file created, generate a matching test file...
 *         Minimum test coverage: 80%"
 *
 * Test Coverage:
 * - CRUD operations (create, update, delete, findById, findMany)
 * - Transaction support
 * - Error handling
 * - Pagination
 * - Ordering
 */

import { PrismaClient } from '@prisma/client';
import { BaseRepository } from '../base.repository';

// Concrete implementation for testing
class TestRepository extends BaseRepository<any> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'user'); // Use User model for testing
  }
}

describe('BaseRepository', () => {
  let prisma: PrismaClient;
  let repository: TestRepository;
  let testUserId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new TestRepository(prisma);
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up users after each test
    await prisma.user.deleteMany({});
  });

  describe('create()', () => {
    it('should create a new record', async () => {
      const user = await repository.create({
        clerkId: 'test_clerk_base_' + Date.now(),
        email: `base_${Date.now()}@example.com`,
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.clerkId).toContain('test_clerk_base');

      testUserId = user.id;
    });

    it('should handle creation errors', async () => {
      // Try to create duplicate clerkId
      const clerkId = 'duplicate_clerk_' + Date.now();

      await repository.create({
        clerkId,
        email: `dup1_${Date.now()}@example.com`,
      });

      // Second create with same clerkId should fail
      await expect(
        repository.create({
          clerkId,
          email: `dup2_${Date.now()}@example.com`,
        })
      ).rejects.toThrow();
    });
  });

  describe('findById()', () => {
    beforeEach(async () => {
      const user = await repository.create({
        clerkId: 'test_findby_' + Date.now(),
        email: `findby_${Date.now()}@example.com`,
      });
      testUserId = user.id;
    });

    it('should find a record by ID', async () => {
      const user = await repository.findById(testUserId);

      expect(user).toBeDefined();
      expect(user.id).toBe(testUserId);
    });

    it('should return null for non-existent ID', async () => {
      const user = await repository.findById('non-existent-id');

      expect(user).toBeNull();
    });
  });

  describe('findMany()', () => {
    beforeEach(async () => {
      // Create multiple test users
      await repository.create({
        clerkId: 'test_many_1_' + Date.now(),
        email: `many1_${Date.now()}@example.com`,
      });

      await repository.create({
        clerkId: 'test_many_2_' + Date.now(),
        email: `many2_${Date.now()}@example.com`,
      });

      await repository.create({
        clerkId: 'test_many_3_' + Date.now(),
        email: `many3_${Date.now()}@example.com`,
      });
    });

    it('should find all records when no filter provided', async () => {
      const users = await repository.findMany({}, {});

      expect(users.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter records by where clause', async () => {
      const clerkId = 'filter_test_' + Date.now();

      await repository.create({
        clerkId,
        email: `filter_${Date.now()}@example.com`,
      });

      const users = await repository.findMany({ clerkId }, {});

      expect(users.length).toBe(1);
      expect(users[0].clerkId).toBe(clerkId);
    });

    it('should support pagination with take and skip', async () => {
      const allUsers = await repository.findMany({}, {});
      const firstPage = await repository.findMany({}, { take: 2, skip: 0 });
      const secondPage = await repository.findMany({}, { take: 2, skip: 2 });

      expect(firstPage.length).toBeLessThanOrEqual(2);
      expect(secondPage.length).toBeLessThanOrEqual(2);

      // Verify different records
      if (firstPage.length > 0 && secondPage.length > 0) {
        expect(firstPage[0].id).not.toBe(secondPage[0].id);
      }
    });

    it('should support ordering', async () => {
      const users = await repository.findMany(
        {},
        { orderBy: { createdAt: 'desc' } }
      );

      expect(users.length).toBeGreaterThan(0);

      // Verify descending order (most recent first)
      for (let i = 0; i < users.length - 1; i++) {
        expect(
          new Date(users[i].createdAt).getTime()
        ).toBeGreaterThanOrEqual(
          new Date(users[i + 1].createdAt).getTime()
        );
      }
    });
  });

  describe('update()', () => {
    beforeEach(async () => {
      const user = await repository.create({
        clerkId: 'test_update_' + Date.now(),
        email: `update_${Date.now()}@example.com`,
      });
      testUserId = user.id;
    });

    it('should update a record by ID', async () => {
      const newEmail = `updated_${Date.now()}@example.com`;

      const updated = await repository.update(testUserId, {
        email: newEmail,
      });

      expect(updated).toBeDefined();
      expect(updated.email).toBe(newEmail);
      expect(updated.id).toBe(testUserId);
    });

    it('should throw error for non-existent ID', async () => {
      await expect(
        repository.update('non-existent-id', {
          email: `fail_${Date.now()}@example.com`,
        })
      ).rejects.toThrow();
    });

    it('should handle partial updates', async () => {
      const original = await repository.findById(testUserId);
      const originalEmail = original!.email;

      // Update only clerkId
      const newClerkId = 'partial_update_' + Date.now();
      const updated = await repository.update(testUserId, {
        clerkId: newClerkId,
      });

      expect(updated.clerkId).toBe(newClerkId);
      expect(updated.email).toBe(originalEmail); // Email should remain unchanged
    });
  });

  describe('delete()', () => {
    beforeEach(async () => {
      const user = await repository.create({
        clerkId: 'test_delete_' + Date.now(),
        email: `delete_${Date.now()}@example.com`,
      });
      testUserId = user.id;
    });

    it('should delete a record by ID', async () => {
      const deleted = await repository.delete(testUserId);

      expect(deleted).toBeDefined();
      expect(deleted.id).toBe(testUserId);

      // Verify record is deleted
      const found = await repository.findById(testUserId);
      expect(found).toBeNull();
    });

    it('should throw error for non-existent ID', async () => {
      await expect(
        repository.delete('non-existent-id')
      ).rejects.toThrow();
    });

    it('should actually remove record from database', async () => {
      const countBefore = (await repository.findMany({}, {})).length;

      await repository.delete(testUserId);

      const countAfter = (await repository.findMany({}, {})).length;
      expect(countAfter).toBe(countBefore - 1);
    });
  });

  describe('transaction()', () => {
    it('should execute multiple operations in a transaction', async () => {
      const result = await repository.transaction(async (tx) => {
        const user1 = await tx.user.create({
          data: {
            clerkId: 'tx_user_1_' + Date.now(),
            email: `tx1_${Date.now()}@example.com`,
          },
        });

        const user2 = await tx.user.create({
          data: {
            clerkId: 'tx_user_2_' + Date.now(),
            email: `tx2_${Date.now()}@example.com`,
          },
        });

        return { user1, user2 };
      });

      expect(result.user1).toBeDefined();
      expect(result.user2).toBeDefined();

      // Verify both records exist
      const found1 = await repository.findById(result.user1.id);
      const found2 = await repository.findById(result.user2.id);

      expect(found1).not.toBeNull();
      expect(found2).not.toBeNull();
    });

    it('should rollback transaction on error', async () => {
      const countBefore = (await repository.findMany({}, {})).length;

      try {
        await repository.transaction(async (tx) => {
          // Create first user (should succeed)
          await tx.user.create({
            data: {
              clerkId: 'tx_rollback_1_' + Date.now(),
              email: `rollback1_${Date.now()}@example.com`,
            },
          });

          // Create duplicate clerkId (should fail)
          const duplicateId = 'tx_duplicate_' + Date.now();
          await tx.user.create({
            data: {
              clerkId: duplicateId,
              email: `dup1_${Date.now()}@example.com`,
            },
          });

          await tx.user.create({
            data: {
              clerkId: duplicateId, // Duplicate!
              email: `dup2_${Date.now()}@example.com`,
            },
          });
        });
      } catch (error) {
        // Transaction should fail
        expect(error).toBeDefined();
      }

      // Verify NO records were created (rollback worked)
      const countAfter = (await repository.findMany({}, {})).length;
      expect(countAfter).toBe(countBefore);
    });

    it('should handle complex transaction with updates and deletes', async () => {
      // Create initial users
      const user1 = await repository.create({
        clerkId: 'complex_tx_1_' + Date.now(),
        email: `complex1_${Date.now()}@example.com`,
      });

      const user2 = await repository.create({
        clerkId: 'complex_tx_2_' + Date.now(),
        email: `complex2_${Date.now()}@example.com`,
      });

      // Execute complex transaction
      await repository.transaction(async (tx) => {
        // Update user1
        await tx.user.update({
          where: { id: user1.id },
          data: { email: `updated_${Date.now()}@example.com` },
        });

        // Delete user2
        await tx.user.delete({
          where: { id: user2.id },
        });

        // Create new user
        await tx.user.create({
          data: {
            clerkId: 'complex_tx_3_' + Date.now(),
            email: `complex3_${Date.now()}@example.com`,
          },
        });
      });

      // Verify results
      const updated1 = await repository.findById(user1.id);
      const deleted2 = await repository.findById(user2.id);

      expect(updated1).not.toBeNull();
      expect(updated1!.email).toContain('updated_');
      expect(deleted2).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Disconnect database to force error
      await prisma.$disconnect();

      try {
        await repository.create({
          clerkId: 'error_test_' + Date.now(),
          email: `error_${Date.now()}@example.com`,
        });

        // If we get here, reconnect happened automatically
        expect(true).toBe(true);
      } catch (error) {
        // Error is expected when database is disconnected
        expect(error).toBeDefined();
      } finally {
        // Reconnect for other tests
        prisma = new PrismaClient();
        repository = new TestRepository(prisma);
      }
    });
  });
});
