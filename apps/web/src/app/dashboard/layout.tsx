/**
 * @file dashboard/layout.tsx
 * @description Dashboard layout with navigation
 * @architecture Reference: Part 6 - Security & Authentication
 * Migrated from Clerk to Supabase Auth on November 17, 2025
 *
 * Dependencies:
 * - Supabase authentication
 * - Next.js App Router
 *
 * Security:
 * - Protected route (Supabase middleware)
 */

import Link from "next/link";
import { UserButton } from "@/components/auth/user-button";
import { Building2, LayoutDashboard, FileText, Shield } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold">GRC Platform</span>
              </Link>

              <nav className="hidden md:flex space-x-4">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/dashboard/companies"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Companies</span>
                </Link>

                <Link
                  href="/dashboard/audits"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  <FileText className="w-4 h-4" />
                  <span>Audits</span>
                </Link>
              </nav>
            </div>

            <div className="flex items-center">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
