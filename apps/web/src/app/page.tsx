/**
 * @file page.tsx
 * @description Landing page
 * @architecture Reference: Section 3 - System Overview
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Shield, Zap, TrendingDown } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight">
            AI-Powered <span className="text-primary">GRC Automation</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Automate SOC 2, ISO 27001, and HIPAA compliance with multi-agent AI.
            Reduce cost by 70%, time by 50%.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/sign-up">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">70%</CardTitle>
              <CardDescription>Cost Reduction</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                $80K → $24K/year savings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">50%</CardTitle>
              <CardDescription>Faster Compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                6-9 months → 2-3 months
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">16+</CardTitle>
              <CardDescription>AI Agents</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Specialized compliance automation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">
            Complete Compliance Automation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Vision-Based Evidence Collection</h3>
                <p className="text-muted-foreground">
                  Works with ANY system - no APIs required. Uses Claude Vision to validate evidence like a human auditor.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Continuous Monitoring</h3>
                <p className="text-muted-foreground">
                  24/7 compliance monitoring with real-time alerts. Never miss a control failure.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Automated Evidence</h3>
                <p className="text-muted-foreground">
                  AI agents collect and validate 200+ pieces of evidence automatically across AWS, Okta, GitHub, and more.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <TrendingDown className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Gap Analysis & Remediation</h3>
                <p className="text-muted-foreground">
                  AI identifies compliance gaps and generates automated PRs to fix security issues.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to automate compliance?</CardTitle>
              <CardDescription>Start your first audit in minutes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full">
                <Link href="/sign-up">Start Free Trial</Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Free tier available. No credit card required.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
