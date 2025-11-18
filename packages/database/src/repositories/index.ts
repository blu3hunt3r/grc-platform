/**
 * @file repositories/index.ts
 * @description Repository pattern exports for data access layer
 * @architecture SYSTEM_PROMPT.md "Repository Pattern"
 *
 * Purpose:
 * - Export all repository classes
 * - Provide centralized data access layer
 * - Encapsulate database operations
 */

export { UserRepository } from './user.repository';
export { CompanyRepository } from './company.repository';
