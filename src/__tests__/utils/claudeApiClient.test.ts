/**
 * Tests for Claude API Client
 * 
 * This file contains tests for the Claude API client functions.
 * Tests cover functionality for converting table data to PowerFX
 * and back, including error handling and different models.
 * 
 * @version 1.0.0
 */

import { 
  convertTableToPowerFX, 
  convertPowerFXToTable,
  getClaudeModelDisplayName,
  ClaudeModel
} from '../mocks/claudeApiClientMock';
import { mockColumns, mockTasks, samplePowerFXCode, generateLargeDataset } from '../mocks/mockData';

// Do not import the server directly - it's handled in jest.setup.js

describe('Claude API Client', () => {
  // Mock global.fetch for all tests
  const originalFetch = global.fetch;
  
  beforeAll(() => {
    // Mock the import.meta.env is now done in jest.setup.js
  });
  
  afterAll(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });
  
  describe('getClaudeModelDisplayName', () => {
    it('should return correct display name for Claude 3.5 Haiku', () => {
      expect(getClaudeModelDisplayName('claude-3-5-haiku-20241022')).toBe('Claude 3.5 Haiku');
    });
    
    it('should return correct display name for Claude 3.7 Sonnet', () => {
      expect(getClaudeModelDisplayName('claude-3-7-sonnet-20250219')).toBe('Claude 3.7 Sonnet');
    });
    
    it('should return the model ID for unknown models', () => {
      const unknownModel = 'unknown-model' as ClaudeModel;
      expect(getClaudeModelDisplayName(unknownModel)).toBe('unknown-model');
    });
  });
  
  describe('convertTableToPowerFX', () => {
    it('should convert table data to PowerFX code with Claude 3.5 Haiku', async () => {
      const result = await convertTableToPowerFX(
        mockTasks,
        mockColumns,
        'claude-3-5-haiku-20241022'
      );
      
      // Check the result contains PowerFX code
      expect(result.code).toContain('ClearCollect');
      expect(result.code).toContain('PowerCollectData');
      expect(result.code).toContain('Made with PowerCollect');
      
      // Check token usage is returned
      expect(result.tokenUsage).toBeDefined();
      expect(result.tokenUsage!.input_tokens).toBe(1500);
      expect(result.tokenUsage!.output_tokens).toBe(800);
    });
    
    it('should convert table data to PowerFX code with Claude 3.7 Sonnet', async () => {
      const result = await convertTableToPowerFX(
        mockTasks,
        mockColumns,
        'claude-3-7-sonnet-20250219'
      );
      
      // Check the result contains PowerFX code
      expect(result.code).toContain('ClearCollect');
      expect(result.code).toContain('PowerCollectData');
      expect(result.code).toContain('Made with PowerCollect');
      
      // Check token usage is returned
      expect(result.tokenUsage).toBeDefined();
    });
    
    it('should throw an error when dataset is too large for Claude 3.5 Haiku', async () => {
      // Generate a large dataset
      const largeTasks = generateLargeDataset();
      
      // Mock the message to include 'large-dataset' to trigger the error in our mock handler
      const mockOriginalStringify = JSON.stringify;
      JSON.stringify = jest.fn().mockImplementation(() => 'large-dataset');
      
      // Should throw an error with a message about using Sonnet instead
      await expect(
        convertTableToPowerFX(largeTasks, mockColumns, 'claude-3-5-haiku-20241022')
      ).rejects.toThrow(/too large.*Sonnet.*higher token limit/);
      
      // Restore original stringify
      JSON.stringify = mockOriginalStringify;
    });
    
    it('should return a fallback response when SUPABASE_API_KEY is not configured', async () => {
      // Temporarily remove the API key
      const originalImport = (global as any).import;
      (global as any).import = { meta: { env: {} } };
      
      const result = await convertTableToPowerFX(mockTasks, mockColumns);
      
      // Check the result contains fallback PowerFX code
      expect(result.code).toContain('placeholder collection');
      expect(result.code).toContain('API key is not configured');
      expect(result.tokenUsage).toBeNull();
      
      // Restore the API key
      (global as any).import = originalImport;
    });
  });
  
  describe('convertPowerFXToTable', () => {
    it('should convert PowerFX code to table data with Claude 3.5 Haiku', async () => {
      const result = await convertPowerFXToTable(
        samplePowerFXCode,
        'claude-3-5-haiku-20241022'
      );
      
      // Check columns are returned
      expect(result.columns).toBeDefined();
      expect(result.columns.length).toBeGreaterThan(0);
      expect(result.columns[0].id).toBe('select');
      
      // Check tasks are returned
      expect(result.tasks).toBeDefined();
      expect(result.tasks.length).toBe(2);
      
      // Check token usage is returned
      expect(result.tokenUsage).toBeDefined();
    });
    
    it('should convert PowerFX code to table data with Claude 3.7 Sonnet', async () => {
      const result = await convertPowerFXToTable(
        samplePowerFXCode,
        'claude-3-7-sonnet-20250219'
      );
      
      // Check columns are returned
      expect(result.columns).toBeDefined();
      expect(result.columns.length).toBeGreaterThan(0);
      
      // Check tasks are returned
      expect(result.tasks).toBeDefined();
      expect(result.tasks.length).toBe(2);
      
      // Check token usage is returned
      expect(result.tokenUsage).toBeDefined();
    });
    
    it('should throw an error when PowerFX code is too large for Claude 3.5 Haiku', async () => {
      // Add 'large-dataset' to the PowerFX code to trigger the error in our mock handler
      const largePowerFXCode = samplePowerFXCode + ' large-dataset';
      
      // Should throw an error with a message about using Sonnet instead
      await expect(
        convertPowerFXToTable(largePowerFXCode, 'claude-3-5-haiku-20241022')
      ).rejects.toThrow(/too large.*Sonnet.*higher token limit/);
    });
    
    it('should return a fallback response when SUPABASE_API_KEY is not configured', async () => {
      // Temporarily remove the API key
      const originalImport = (global as any).import;
      (global as any).import = { meta: { env: {} } };
      
      const result = await convertPowerFXToTable(samplePowerFXCode);
      
      // Check the result contains fallback data
      expect(result.columns).toBeDefined();
      expect(result.tasks).toBeDefined();
      expect(result.tasks.length).toBeGreaterThan(0);
      expect(result.tokenUsage).toBeNull();
      
      // Restore the API key
      (global as any).import = originalImport;
    });
  });
  
  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      // Mock fetch to return an error response
      global.fetch = jest.fn().mockImplementation(() => 
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          text: () => Promise.resolve('API endpoint not found')
        })
      );
      
      await expect(
        convertTableToPowerFX(mockTasks, mockColumns)
      ).rejects.toThrow(/Error: The selected model "Claude 3.5 Haiku"/);
      
      // Restore original fetch for other tests
      (global as any).fetch = originalFetch;
    });
    
    it('should handle network errors gracefully', async () => {
      // Mock fetch to throw a network error
      global.fetch = jest.fn().mockImplementation(() => {
        throw new TypeError('Failed to fetch');
      });
      
      await expect(
        convertTableToPowerFX(mockTasks, mockColumns)
      ).rejects.toThrow(/Network error/);
      
      // Restore original fetch for other tests
      (global as any).fetch = originalFetch;
    });
  });
}); 