/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  displayName: '@grc/shared',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.test.ts',
  ],
  collectCoverageFrom: [
    '**/*.ts',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@grc/shared/(.*)$': '<rootDir>/$1',
  },
};
