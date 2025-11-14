/**
 * @file schemas/index.ts
 * @description Zod validation schemas
 * @module @grc/shared
 * @architecture Reference: Section 5 - Technology Stack (Zod validation)
 */

import { z } from 'zod';

// Company schemas
export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100),
  domain: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().max(500).optional(),
  size: z.enum(['STARTUP', 'SMALL', 'MEDIUM', 'LARGE']).optional(),
  industry: z.string().max(100).optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const updateCompanySchema = createCompanySchema.partial();

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
