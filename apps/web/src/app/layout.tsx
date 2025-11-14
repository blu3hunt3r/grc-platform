/**
 * @file layout.tsx
 * @description Root layout with Clerk authentication
 * @architecture Reference: Section 5.1 - Frontend Stack (Clerk auth)
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GRC Platform - AI-Powered Compliance Automation",
  description: "Automate your SOC 2, ISO 27001, and HIPAA compliance with AI",
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
