/**
 * @file api/audits/route.ts
 * @description API routes for audit management (list, create)
 * @architecture Reference: System Prompt - API Layer with Next.js API Routes
 *
 * Dependencies:
 * - Clerk (authentication)
 * - Prisma (database)
 * - Zod (validation)
 *
 * Security:
 * - Protected route (Clerk middleware)
 * - Authorization check (user owns company)
 * - Input validation with Zod
 */

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@grc/database";
import { z } from "zod";

/**
 * Validation schema for creating a new audit
 */
const CreateAuditSchema = z.object({
  companyId: z.string().uuid("Invalid company ID format"),
  framework: z.enum(["SOC2_TYPE1", "SOC2_TYPE2", "ISO27001", "HIPAA", "PCI_DSS"]),
  trustCriteria: z
    .array(z.string())
    .min(1, "At least one trust criteria required")
    .optional(),
  scope: z.string().optional(),
  startDate: z.string().datetime().optional(),
  targetDate: z.string().datetime().optional(),
});

/**
 * GET /api/audits
 * List all audits for the authenticated user's companies
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // 3. Get query parameters
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    // 4. Build query
    const where: any = {
      company: {
        createdById: dbUser.id,
        deletedAt: null,
      },
    };

    if (companyId) {
      where.companyId = companyId;
    }

    // 5. Fetch audits
    const audits = await prisma.audit.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      audits,
      total: audits.length,
    });
  } catch (error) {
    console.error("Failed to fetch audits", {
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
 * POST /api/audits
 * Create a new audit for a company
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // 3. Parse and validate request body
    const body = await request.json();
    const validationResult = CreateAuditSchema.safeParse(body);

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

    // 4. Verify user owns the company
    const company = await prisma.company.findFirst({
      where: {
        id: data.companyId,
        createdById: dbUser.id,
        deletedAt: null,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found or access denied" },
        { status: 403 }
      );
    }

    // 5. Create audit
    const audit = await prisma.audit.create({
      data: {
        companyId: data.companyId,
        framework: data.framework,
        trustCriteria: data.trustCriteria
          ? JSON.stringify(data.trustCriteria)
          : null,
        scope: data.scope,
        startDate: data.startDate ? new Date(data.startDate) : null,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        status: "NOT_STARTED",
        progressPercentage: 0,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
    });

    console.info("Audit created successfully", {
      auditId: audit.id,
      companyId: audit.companyId,
      framework: audit.framework,
      userId: dbUser.id,
      timestamp: new Date(),
    });

    return NextResponse.json(
      {
        audit,
        message: "Audit created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create audit", {
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
