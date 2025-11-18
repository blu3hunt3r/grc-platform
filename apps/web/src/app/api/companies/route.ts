/**
 * @file api/companies/route.ts
 * @description Company CRUD API endpoints
 * @architecture Reference: Part 6 - Security & Authentication
 *
 * Dependencies:
 * - Clerk (authentication)
 * - Prisma (database)
 * - Zod (validation)
 *
 * Security:
 * - Authentication required (Clerk)
 * - Input validation (Zod)
 * - Error handling
 *
 * Migration History:
 * - Migrated from Clerk to Supabase Auth on November 17, 2025
 * - Restored Clerk authentication on November 18, 2025
 */

import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth/server";
import { prisma } from "@grc/database";
import { createCompanySchema } from "@grc/shared";

/**
 * GET /api/companies
 * List all companies for the authenticated user
 */
export async function GET() {
  try {
    // 1. Get authenticated user from database
    const dbUser = await getCurrentDbUser();

    // 2. Fetch companies
    const companies = await prisma.company.findMany({
      where: {
        createdById: dbUser.id,
        deletedAt: null, // Soft delete filter
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: companies,
    });
  } catch (error) {
    // Error handling
    console.error("Failed to fetch companies", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch companies",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/companies
 * Create a new company
 */
export async function POST(request: Request) {
  try {
    // 1. Get authenticated user from database
    const dbUser = await getCurrentDbUser();

    // 2. Parse and validate input
    const body = await request.json();
    const validated = createCompanySchema.parse(body);

    // 3. Create company
    const company = await prisma.company.create({
      data: {
        name: validated.name,
        domain: validated.domain || null,
        description: validated.description || null,
        size: validated.size || null,
        industry: validated.industry || null,
        createdById: dbUser.id,
      },
    });

    // 4. Log success
    console.log("Company created successfully", {
      companyId: company.id,
      userId: dbUser.id,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: company,
    }, { status: 201 });
  } catch (error) {
    // Error handling with context
    console.error("Failed to create company", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date(),
    });

    // Validation error
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input data",
          details: error.message,
        },
        { status: 400 }
      );
    }

    // Generic error (don't expose internals)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create company",
      },
      { status: 500 }
    );
  }
}
