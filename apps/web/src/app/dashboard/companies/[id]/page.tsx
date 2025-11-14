/**
 * @file dashboard/companies/[id]/page.tsx
 * @description Company detail page with tabs for overview, audits, settings
 * @architecture Reference: System Prompt - Dashboard-specific components
 *
 * Dependencies:
 * - Clerk (authentication)
 * - Prisma (database)
 *
 * Security:
 * - Protected route (Clerk middleware)
 * - Authorization check (user owns company)
 */

import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@grc/database";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Building2, Globe, Users, Briefcase } from "lucide-react";
import Link from "next/link";

/**
 * Fetch company details with authorization check
 */
async function getCompany(companyId: string) {
  try {
    // 1. Check authentication
    const user = await currentUser();
    if (!user) {
      redirect("/sign-in");
    }

    // 2. Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      redirect("/sign-in");
    }

    // 3. Fetch company with authorization check
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        createdById: dbUser.id, // Authorization: user owns company
        deletedAt: null,
      },
      include: {
        audits: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5, // Show latest 5 audits
        },
        _count: {
          select: {
            audits: true,
          },
        },
      },
    });

    if (!company) {
      return null;
    }

    return company;
  } catch (error) {
    console.error("Failed to fetch company", {
      companyId,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    });
    return null;
  }
}

export default async function CompanyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const company = await getCompany(params.id);

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/companies">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Companies
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              {company.name}
            </h1>
            {company.domain && (
              <p className="text-muted-foreground flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {company.domain}
              </p>
            )}
          </div>
          <Button asChild>
            <Link href={`/dashboard/companies/${company.id}/audits/new`}>
              Start New Audit
            </Link>
          </Button>
        </div>
      </div>

      {/* Company Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Description
                </h3>
                <p className="text-sm">{company.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {company.size && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Company Size
                  </h3>
                  <p className="text-sm font-medium">{company.size}</p>
                </div>
              )}

              {company.industry && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Industry
                  </h3>
                  <p className="text-sm font-medium">{company.industry}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Created
              </h3>
              <p className="text-sm">
                {new Date(company.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-bold">{company._count.audits}</p>
              <p className="text-sm text-muted-foreground">Total Audits</p>
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Active Audits</p>
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Evidence Collected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Audits */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Audits</CardTitle>
          <CardDescription>Latest compliance audits for this company</CardDescription>
        </CardHeader>
        <CardContent>
          {company.audits.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No audits yet. Start your first audit to begin compliance automation.
              </p>
              <Button asChild>
                <Link href={`/dashboard/companies/${company.id}/audits/new`}>
                  Start First Audit
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {company.audits.map((audit) => (
                <div
                  key={audit.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{audit.framework}</h4>
                    <p className="text-sm text-muted-foreground">
                      Status: {audit.status}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/audits/${audit.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
