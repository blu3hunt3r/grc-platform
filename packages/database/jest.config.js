/**
 * @file jest.config.js
 * @description Jest configuration for database package tests
 * @architecture SYSTEM_PROMPT.md "Testing Requirements (MANDATORY)"
 *
 * Architecture Reference: SYSTEM_PROMPT.md Lines 374-416
 * Quote: "For EVERY file created, generate a matching test file...
 *         Minimum test coverage: 80%"
 *
 * Coverage Requirements:
 * - Branches: 80%
 * - Functions: 80%
 * - Lines: 80%
 * - Statements: 80%
 */

module.exports = {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest',

  // Test environment (Node.js for database tests)
  testEnvironment: 'node',

  // Root directories for tests
  roots: ['<rootDir>/src'],

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts',
  ],

  // Module path aliases (match tsconfig paths if any)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**',
    '!src/**/*.d.ts',
    '!src/index.ts', // Export file, no logic to test
  ],

  // Coverage thresholds (SYSTEM_PROMPT.md requirement: 80%)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
  ],

  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Timeout for tests (10 seconds for database operations)
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Run tests serially to avoid database conflicts (Supabase PostgreSQL)
  maxWorkers: 1,

  // Transform files
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },

  // Setup files to load test environment
  setupFiles: ['<rootDir>/jest.setup.js'],
};
