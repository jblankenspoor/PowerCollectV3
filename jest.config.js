/**
 * Jest configuration for PowerCollectV3
 * 
 * This configuration sets up Jest for testing TypeScript React code
 * with proper transformations and environment settings.
 * 
 * @version 1.0.0
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    // Handle module aliases (if you're using them with webpack or vite)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  // Handle static assets
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Path to test files
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/mocks/'
  ],
  // Coverage collection
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/__tests__/mocks/**',
  ],
  // HTML Reporter configuration
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'PowerCollectV3 Test Report',
        outputPath: './test-reports/test-report.html',
        includeFailureMsg: true,
        includeSuiteFailure: true,
        includeConsoleLog: true,
        includeStackTrace: true,
        sort: 'status',
        dateFormat: 'yyyy-mm-dd HH:MM:ss',
        customScriptPath: null
      }
    ]
  ]
}; 