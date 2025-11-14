/**
 * @file api/companies/route.ts
 * @description Company CRUD API endpoints
 * @architecture Reference: System Prompt - API Layer (Next.js API Routes)
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
 */

import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@grc/database";
import { createCompanySchema } from "@grc/shared";

/**
 * GET /api/companies
 * List all companies for the authenticated user
 */
export async function GET() {
  try {
    // 1. Check authentication (MANDATORY per System Prompt line 590-608)
    const user = await currentUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 2. Get or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      // Create user if doesn't exist
      dbUser = await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        },
      });
    }

    // 3. Fetch companies
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
    // Error handling (MANDATORY per System Prompt line 339-368)
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
    // 1. Check authentication (MANDATORY)
    const user = await currentUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 2. Get or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        },
      });
    }

    // 3. Parse and validate input (MANDATORY per System Prompt line 611-633)
    const body = await request.json();
    const validated = createCompanySchema.parse(body);

    // 4. Create company
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

    // 5. Log success
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
