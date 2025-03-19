/**
 * Jest setup file for PowerCollectV3
 * 
 * This file sets up the environment for Jest tests, including:
 * - Environment variables
 * - Global mocks
 * - Cleanup between tests
 * 
 * @version 1.0.0
 */

// Set up environment variables for testing
// These will be used instead of the actual environment variables
process.env.VITE_SUPABASE_API_KEY = 'test-api-key';

// Mock the Vite import.meta.env
global.import = {
  meta: {
    env: {
      VITE_SUPABASE_API_KEY: 'test-api-key',
    }
  }
};

// Import MSW server
const { startServer, resetServer, stopServer } = require('./src/__tests__/mocks/server');

// Start the MSW server before all tests
beforeAll(() => {
  startServer();
});

// Reset handlers after each test
afterEach(() => {
  resetServer();
  jest.clearAllMocks();
});

// Stop the server after all tests
afterAll(() => {
  stopServer();
}); 