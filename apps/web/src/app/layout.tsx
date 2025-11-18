/**
 * @file layout.tsx
 * @description Root layout with Clerk authentication
 * @architecture SYSTEM_PROMPT.md "Hybrid Architecture: Clerk (Auth) + Supabase (DB)"
 * Restored Clerk on November 18, 2025
 *
 * Architecture Reference: SYSTEM_PROMPT.md Lines 70-76
 * Quote: "Hybrid Architecture: Clerk (Auth) + Supabase (Data Layer)
 *         - Authentication: Clerk with OAuth providers
 *         - Database: Supabase PostgreSQL"
 *
 * Purpose:
 * - Wrap app with ClerkProvider for authentication
 * - Load Inter font for typography
 * - Define app metadata
 *
 * Dependencies:
 * - @clerk/nextjs: Clerk authentication provider
 * - next/font/google: Inter font
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GRC Platform - AI Agent GRC Engineer",
  description: "Automate your SOC 2, ISO 27001, and HIPAA compliance with AI agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
