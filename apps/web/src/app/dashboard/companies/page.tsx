/**
 * @file dashboard/companies/page.tsx
 * @description Company list page with table view
 * @architecture Reference: Part 6 - Security & Authentication
 *
 * Dependencies:
 * - Clerk (authentication)
 * - Company API
 *
 * Security:
 * - Protected route (Clerk middleware)
 *
 * Migration History:
 * - Migrated from Clerk to Supabase Auth on November 17, 2025
 * - Restored Clerk authentication on November 18, 2025
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Plus } from "lucide-react";
import { getCurrentDbUser } from "@/lib/auth/server";

/**
 * Fetch companies for the authenticated user
 */
async function getCompanies() {
  try {
    // Get authenticated user from database
    const dbUser = await getCurrentDbUser();

    // In a server component, we can directly import and use Prisma
    const { prisma } = await import("@grc/database");

    // Fetch companies
    const companies = await prisma.company.findMany({
      where: {
        createdById: dbUser.id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return companies;
  } catch (error) {
    console.error("Failed to fetch companies", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    });
    return [];
  }
}

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground mt-2">
            Manage your companies and their compliance audits
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/companies/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Link>
        </Button>
      </div>

      {/* Companies List */}
      {companies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No companies yet</h3>
            <p className="text-muted-foreground mb-4 text-center max-w-sm">
              Get started by adding your first company to begin automating
              compliance audits
            </p>
            <Button asChild>
              <Link href="/dashboard/companies/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Company
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/dashboard/companies/${company.id}`}
              className="block"
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <span>{company.name}</span>
                  </CardTitle>
                  {company.domain && (
                    <CardDescription>{company.domain}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {company.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {company.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {company.size && <span>{company.size}</span>}
                    {company.industry && <span>{company.industry}</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
