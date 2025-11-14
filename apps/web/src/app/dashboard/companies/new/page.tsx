/**
 * @file dashboard/companies/new/page.tsx
 * @description Create company form page
 * @architecture Reference: System Prompt - Dashboard-specific components
 *
 * Dependencies:
 * - Clerk (authentication)
 * - Company API
 * - Zod (validation)
 *
 * Security:
 * - Protected route (Clerk middleware)
 * - Client-side validation
 */

import { CreateCompanyForm } from "@/components/dashboard/create-company-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewCompanyPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/dashboard/companies">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Companies
        </Link>
      </Button>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Company</CardTitle>
          <CardDescription>
            Create a new company to start automating compliance audits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateCompanyForm />
        </CardContent>
      </Card>
    </div>
  );
}
