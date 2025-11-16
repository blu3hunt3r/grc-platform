/**
 * @file dashboard/audits/page.tsx
 * @description Audits listing page showing all audits across companies
 * @architecture Reference: System Prompt - Dashboard-specific components
 *
 * Dependencies:
 * - Clerk (authentication)
 * - Prisma (database)
 *
 * Security:
 * - Protected route (Clerk middleware)
 * - Authorization check (user owns companies)
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
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlayCircle
} from "lucide-react";
import Link from "next/link";

/**
 * Fetch all audits for the user's companies
 */
async function getAudits() {
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

    // 3. Fetch all audits for user's companies
    const audits = await prisma.audit.findMany({
      where: {
        company: {
          createdById: dbUser.id,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return audits;
  } catch (error) {
    console.error("Failed to fetch audits", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    });
    return [];
  }
}

/**
 * Get status badge variant
 */
function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "COMPLETED":
      return "default";
    case "IN_AUDIT":
    case "EVIDENCE_COLLECTION":
      return "secondary";
    case "FAILED":
      return "destructive";
    default:
      return "outline";
  }
}

/**
 * Get status icon
 */
function getStatusIcon(status: string) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 className="w-4 h-4" />;
    case "FAILED":
      return <XCircle className="w-4 h-4" />;
    case "IN_AUDIT":
    case "EVIDENCE_COLLECTION":
      return <PlayCircle className="w-4 h-4" />;
    case "NOT_STARTED":
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

/**
 * Format status label
 */
function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Format framework label
 */
function formatFramework(framework: string): string {
  switch (framework) {
    case "SOC2_TYPE1":
      return "SOC 2 Type I";
    case "SOC2_TYPE2":
      return "SOC 2 Type II";
    case "ISO27001":
      return "ISO 27001";
    case "HIPAA":
      return "HIPAA";
    case "PCI_DSS":
      return "PCI DSS";
    default:
      return framework;
  }
}

export default async function AuditsPage() {
  const audits = await getAudits();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audits</h1>
          <p className="text-muted-foreground">
            Manage compliance audits across all your companies
          </p>
        </div>
      </div>

      {/* Audits List */}
      {audits.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No audits yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating a company and starting your first audit.
            </p>
            <Button asChild>
              <Link href="/dashboard/companies">Go to Companies</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {audits.map((audit) => (
            <Card key={audit.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/audits/${audit.id}`}
                        className="hover:underline"
                      >
                        {formatFramework(audit.framework)} - {audit.company.name}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      Started {new Date(audit.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(audit.status)} className="flex items-center gap-1">
                    {getStatusIcon(audit.status)}
                    {formatStatus(audit.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Progress */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${audit.progressPercentage}%` }}
                        />
                      </div>
                      <p className="text-sm font-medium">{audit.progressPercentage}%</p>
                    </div>
                  </div>

                  {/* Evidence */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Evidence</p>
                    <p className="text-sm font-medium">
                      {audit._count.evidenceItems} items
                    </p>
                  </div>

                  {/* Target Date */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Target Date</p>
                    <p className="text-sm font-medium">
                      {audit.targetDate
                        ? new Date(audit.targetDate).toLocaleDateString()
                        : "Not set"}
                    </p>
                  </div>

                  {/* Company */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Company</p>
                    <Link
                      href={`/dashboard/companies/${audit.company.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {audit.company.name}
                    </Link>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/audits/${audit.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
