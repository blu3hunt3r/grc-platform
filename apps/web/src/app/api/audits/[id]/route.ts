/**
 * @file api/audits/[id]/route.ts
 * @description API routes for individual audit operations (get, update, delete)
 * @architecture Reference: Part 6 - Security & Authentication
 *
 * Dependencies:
 * - Clerk (authentication)
 * - Prisma (database)
 * - Zod (validation)
 *
 * Security:
 * - Protected route (Clerk middleware)
 * - Authorization check (user owns company that owns audit)
 * - Input validation with Zod
 *
 * Migration History:
 * - Migrated from Clerk to Supabase Auth on November 17, 2025
 * - Restored Clerk authentication on November 18, 2025
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth/server";
import { prisma } from "@grc/database";
import { z } from "zod";

/**
 * Validation schema for updating an audit
 */
const UpdateAuditSchema = z.object({
  framework: z.enum(["SOC2_TYPE1", "SOC2_TYPE2", "ISO27001", "HIPAA", "PCI_DSS"]).optional(),
  trustCriteria: z.array(z.string()).min(1).optional(),
  status: z.enum([
    "NOT_STARTED",
    "DISCOVERY",
    "GAP_ASSESSMENT",
    "IMPLEMENTATION",
    "EVIDENCE_COLLECTION",
    "AUDIT_PREP",
    "IN_AUDIT",
    "COMPLETED",
    "FAILED",
  ]).optional(),
  scope: z.string().optional(),
  startDate: z.string().datetime().optional(),
  targetDate: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
});

/**
 * Helper function to get audit with authorization check
 */
async function getAuthorizedAudit(auditId: string, userId: string) {
  const audit = await prisma.audit.findFirst({
    where: {
      id: auditId,
      company: {
        createdById: userId,
        deletedAt: null,
      },
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          domain: true,
        },
      },
      _count: {
        select: {
          evidenceItems: true,
        },
      },
    },
  });

  return audit;
}

/**
 * GET /api/audits/[id]
 * Get a specific audit by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Get authenticated user from database
    const dbUser = await getCurrentDbUser();

    // 2. Get audit with authorization check
    const audit = await getAuthorizedAudit(id, dbUser.id);

    if (!audit) {
      return NextResponse.json(
        { error: "Audit not found or access denied" },
        { status: 404 }
      );
    }

    // 3. Parse trustCriteria JSON if exists
    const auditWithParsedData = {
      ...audit,
      trustCriteria: audit.trustCriteria
        ? JSON.parse(audit.trustCriteria)
        : null,
    };

    return NextResponse.json({ audit: auditWithParsedData });
  } catch (error) {
    console.error("Failed to fetch audit", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/audits/[id]
 * Update a specific audit
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Get authenticated user from database
    const dbUser = await getCurrentDbUser();

    // 2. Verify audit exists and user has access
    const existingAudit = await getAuthorizedAudit(id, dbUser.id);

    if (!existingAudit) {
      return NextResponse.json(
        { error: "Audit not found or access denied" },
        { status: 404 }
      );
    }

    // 3. Parse and validate request body
    const body = await request.json();
    const validationResult = UpdateAuditSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // 4. Build update data
    const updateData: any = {};

    if (data.framework) updateData.framework = data.framework;
    if (data.status) updateData.status = data.status;
    if (data.scope !== undefined) updateData.scope = data.scope;
    if (data.progressPercentage !== undefined)
      updateData.progressPercentage = data.progressPercentage;
    if (data.trustCriteria)
      updateData.trustCriteria = JSON.stringify(data.trustCriteria);
    if (data.startDate)
      updateData.startDate = new Date(data.startDate);
    if (data.targetDate)
      updateData.targetDate = new Date(data.targetDate);
    if (data.completedAt)
      updateData.completedAt = new Date(data.completedAt);

    // 5. Update audit
    const audit = await prisma.audit.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
        _count: {
          select: {
            evidenceItems: true,
          },
        },
      },
    });

    console.info("Audit updated successfully", {
      auditId: audit.id,
      updatedFields: Object.keys(updateData),
      userId: dbUser.id,
      timestamp: new Date(),
    });

    // 6. Parse trustCriteria for response
    const auditWithParsedData = {
      ...audit,
      trustCriteria: audit.trustCriteria
        ? JSON.parse(audit.trustCriteria)
        : null,
    };

    return NextResponse.json({
      audit: auditWithParsedData,
      message: "Audit updated successfully",
    });
  } catch (error) {
    console.error("Failed to update audit", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date(),
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/audits/[id]
 * Delete a specific audit
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Get authenticated user from database
    const dbUser = await getCurrentDbUser();

    // 2. Verify audit exists and user has access
    const existingAudit = await getAuthorizedAudit(id, dbUser.id);

    if (!existingAudit) {
      return NextResponse.json(
        { error: "Audit not found or access denied" },
        { status: 404 }
      );
    }

    // 3. Delete audit (CASCADE will delete related evidence)
    await prisma.audit.delete({
      where: { id },
    });

    console.info("Audit deleted successfully", {
      auditId: id,
      userId: dbUser.id,
      timestamp: new Date(),
    });

    return NextResponse.json({
      message: "Audit deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete audit", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date(),
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
