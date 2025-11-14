/**
 * @file dashboard/create-company-form.tsx
 * @description Client component for creating companies
 * @architecture Reference: System Prompt - Dashboard-specific components
 *
 * Dependencies:
 * - React Hook Form
 * - Zod (validation)
 * - Company API
 *
 * Security:
 * - Client-side validation with Zod
 * - Protected by Clerk middleware
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCompanySchema } from "@grc/shared";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export function CreateCompanyForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateCompanyInput>({
    resolver: zodResolver(createCompanySchema),
  });

  const onSubmit = async (data: CreateCompanyInput) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create company");
      }

      const result = await response.json();

      // Log success
      console.log("Company created successfully", {
        companyId: result.data.id,
        timestamp: new Date(),
      });

      // Redirect to companies list
      router.push("/dashboard/companies");
      router.refresh();
    } catch (err) {
      console.error("Failed to create company", {
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date(),
      });
      setError(err instanceof Error ? err.message : "Failed to create company");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Company Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Acme Inc."
          {...register("name")}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Domain */}
      <div className="space-y-2">
        <Label htmlFor="domain">Domain</Label>
        <Input
          id="domain"
          placeholder="acme.com"
          {...register("domain")}
          disabled={isSubmitting}
        />
        {errors.domain && (
          <p className="text-sm text-red-500">{errors.domain.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Brief description of the company..."
          rows={3}
          {...register("description")}
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Company Size */}
      <div className="space-y-2">
        <Label htmlFor="size">Company Size</Label>
        <Select
          onValueChange={(value) =>
            setValue("size", value as CreateCompanyInput["size"])
          }
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select company size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SMALL">Small (1-50)</SelectItem>
            <SelectItem value="MEDIUM">Medium (51-500)</SelectItem>
            <SelectItem value="LARGE">Large (501-5000)</SelectItem>
            <SelectItem value="ENTERPRISE">Enterprise (5000+)</SelectItem>
          </SelectContent>
        </Select>
        {errors.size && (
          <p className="text-sm text-red-500">{errors.size.message}</p>
        )}
      </div>

      {/* Industry */}
      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Input
          id="industry"
          placeholder="e.g., Technology, Healthcare, Finance"
          {...register("industry")}
          disabled={isSubmitting}
        />
        {errors.industry && (
          <p className="text-sm text-red-500">{errors.industry.message}</p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Company"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/companies")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
