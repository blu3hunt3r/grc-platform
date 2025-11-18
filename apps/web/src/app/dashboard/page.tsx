/**
 * @file dashboard/page.tsx
 * @description Dashboard home page with stats and overview
 * @architecture Reference: Part 6 - Security & Authentication
 *
 * Dependencies:
 * - Clerk (auth)
 * - Prisma (database)
 *
 * Security:
 * - Protected route via Clerk middleware
 *
 * Migration History:
 * - Migrated from Clerk to Supabase Auth on November 17, 2025
 * - Restored Clerk authentication on November 18, 2025
 */

import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileText, Shield, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await currentUser();
  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || "there";

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {firstName}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s an overview of your compliance automation platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No companies yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Audits</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No audits in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evidence Collected</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No evidence yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Start an audit to see score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with your compliance automation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Add Your First Company</h3>
              <p className="text-sm text-muted-foreground">
                Start by adding a company to audit
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/companies/new">Add Company</Link>
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
            <div>
              <h3 className="font-semibold">Start an Audit</h3>
              <p className="text-sm text-muted-foreground">
                Begin SOC 2, ISO 27001, or HIPAA audit
              </p>
            </div>
            <Button disabled>Coming Soon</Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
            <div>
              <h3 className="font-semibold">View AI Agents</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your 15 specialized AI agents
              </p>
            </div>
            <Button disabled>Coming Soon</Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest compliance activities</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent activity. Start by adding a company!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
