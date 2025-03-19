/**
 * Mock server setup for PowerCollectV3 tests
 * 
 * This file sets up a mock server using MSW that intercepts API requests
 * during Jest tests and returns mock responses.
 * 
 * @version 1.0.0
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Create MSW server with our handlers
export const server = setupServer(...handlers);

// Export setup functions that can be used in jest.setup.js
export const startServer = () => {
  server.listen({ onUnhandledRequest: 'warn' });
  console.log('MSW server started');
};

export const resetServer = () => {
  server.resetHandlers();
};

export const stopServer = () => {
  server.close();
  console.log('MSW server stopped');
}; 