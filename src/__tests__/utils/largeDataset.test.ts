/**
 * Tests for handling large datasets
 * @module largeDataset.test
 */

import { 
  convertTableToPowerFX,
  ClaudeModel
} from '../mocks/claudeApiClientMock';
import { generateRandomDataset } from '../mocks/mockData';
import { Task, Column } from '../../types/dataTypes';

describe('Large Dataset Handling', () => {
  it('should handle a 10x10 dataset with Claude 3.7 Sonnet', async () => {
    // Generate a 10x10 dataset
    const { tasks, columns } = generateRandomDataset(10, 10);
    
    // Verify dataset size
    expect(tasks.length).toBe(10);
    expect(columns.length).toBe(17); // 7 base columns + 10 extra columns

    // Try converting with Claude 3.7 Sonnet
    const result = await convertTableToPowerFX(
      tasks,
      columns,
      'claude-3-7-sonnet-20250219' as ClaudeModel
    );

    // Verify the result
    expect(result.code).toBeDefined();
    expect(result.code).toContain('ClearCollect');
    expect(result.code).toContain('PowerCollectData');
    expect(result.code).toContain('Made with PowerCollect');

    // Check that all tasks are included
    tasks.forEach((task: Task) => {
      expect(result.code).toContain(`ID: ${task.ID}`);
      expect(result.code).toContain(`Title: "${task.Title}"`);
    });

    // Check that all columns are included
    columns.forEach((col: Column) => {
      if (col.id !== 'select') { // Skip the select column as it's not included in PowerFX
        expect(result.code).toContain(col.title);
      }
    });

    // Verify token usage is returned
    expect(result.tokenUsage).toBeDefined();
    expect(result.tokenUsage?.input_tokens).toBeGreaterThan(0);
    expect(result.tokenUsage?.output_tokens).toBeGreaterThan(0);
  });

  it('should fail gracefully with a 10x10 dataset on Claude 3.5 Haiku', async () => {
    // Generate a 10x10 dataset
    const { tasks, columns } = generateRandomDataset(10, 10);
    
    // Add a marker to trigger the large dataset error
    const largeDatasetTasks = tasks.map((task: Task) => ({
      ...task,
      Title: `${task.Title}-large-dataset`
    }));

    // Try converting with Claude 3.5 Haiku (should fail due to token limit)
    await expect(
      convertTableToPowerFX(
        largeDatasetTasks,
        columns,
        'claude-3-5-haiku-20241022' as ClaudeModel
      )
    ).rejects.toThrow(/too large.*Sonnet.*higher token limit/);
  });
}); 