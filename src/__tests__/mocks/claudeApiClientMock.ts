/**
 * Mock implementation of Claude API client for testing
 * @module claudeApiClientMock
 */

import { Column, Task, Priority, Status, ColumnType } from '../../types/dataTypes';

/**
 * Available Claude models for testing
 */
export type ClaudeModel = 'claude-3-7-sonnet-20250219' | 'claude-3-5-haiku-20241022';

/**
 * Interface for Claude API token usage information
 */
export interface ClaudeTokenUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

/**
 * Interface for PowerFX generation result
 */
export interface PowerFXGenerationResult {
  code: string;
  tokenUsage: ClaudeTokenUsage | null;
}

/**
 * Interface for PowerFX import result
 */
export interface PowerFXImportResult {
  columns: Column[];
  tasks: Task[];
  tokenUsage: ClaudeTokenUsage | null;
}

/**
 * Check if the Supabase API key is configured
 */
const isSupabaseApiKeyConfigured = (): boolean => {
  try {
    // During tests, some test cases explicitly modify global.import
    // to simulate cases where the API key is not configured
    if ((global as any).import && (global as any).import.meta && (global as any).import.meta.env) {
      return Boolean((global as any).import.meta.env.VITE_SUPABASE_API_KEY);
    }
    // Fallback to process.env
    return Boolean(process.env.VITE_SUPABASE_API_KEY);
  } catch (e) {
    return false;
  }
};

/**
 * Get the display name for a Claude model
 */
export const getClaudeModelDisplayName = (model: ClaudeModel): string => {
  switch (model) {
    case 'claude-3-5-haiku-20241022':
      return 'Claude 3.5 Haiku';
    case 'claude-3-7-sonnet-20250219':
      return 'Claude 3.7 Sonnet';
    default:
      return model;
  }
};

/**
 * Mock response for successful table conversion
 */
interface ConversionResponse {
  code: string;
  tokenUsage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Mock implementation of the Claude API client for testing
 * @param {Task[]} tasks - The tasks to convert
 * @param {Column[]} columns - The columns to convert
 * @param {ClaudeModel} model - The Claude model to use
 * @returns {Promise<ConversionResponse>} The conversion response
 */
export const convertTableToPowerFX = async (
  tasks: Task[],
  columns: Column[],
  model: ClaudeModel
): Promise<ConversionResponse> => {
  // Check if we should generate a token limit error
  const shouldGenerateTokenLimitError = model === 'claude-3-5-haiku-20241022' &&
    tasks.some(task => task.Title.includes('large-dataset') || task.Title.endsWith('large-dataset'));

  if (shouldGenerateTokenLimitError) {
    throw new Error('Dataset is too large for Claude 3.5 Haiku. Please use Claude 3.7 Sonnet for higher token limit.');
  }

  // Generate a mock PowerFX code response
  const formattedTasks = tasks.map(task => {
    const taskLines = [
      `ID: ${task.ID}`,
      `Title: "${task.Title}"`,
      `Description: "${task.Description}"`,
      `Status: "${task.Status}"`,
      `Priority: "${task.Priority}"`,
      ...columns
        .filter(col => col.id !== 'select' && col.id !== 'ID' && col.id !== 'Title' && col.id !== 'Description' && col.id !== 'Status' && col.id !== 'Priority')
        .map(col => `${col.title}: "${task[col.id as keyof Task]}"`)
    ];
    return taskLines.join('\n    ');
  }).join(',\n\n    ');

  const code = `
// Generated PowerFX code for ${tasks.length} tasks and ${columns.length} columns
ClearCollect(
  PowerCollectData,
  [
    ${formattedTasks}
  ]
);

// Made with PowerCollect
`;

  return {
    code,
    tokenUsage: {
      input_tokens: tasks.length * columns.length * 10,
      output_tokens: code.length
    }
  };
};

/**
 * Mock data for testing table conversion
 */
export const mockTableData = {
  columns: [
    { id: 'select', title: 'SELECT', type: ColumnType.Select, width: 32, minWidth: 128 },
    { id: 'col1', title: 'Column 1', type: ColumnType.Text, width: 50 },
    { id: 'col2', title: 'Column 2', type: ColumnType.Text, width: 50 }
  ],
  tasks: [
    {
      select: false,
      ID: 1,
      Title: 'Task 1',
      Description: 'Description 1',
      Status: Status.ToDo,
      Priority: Priority.High,
      col1: 'Value 1',
      col2: 'Value 2'
    }
  ]
};

/**
 * Mock data for testing table conversion with small dataset
 */
export const mockSmallDataset = {
  columns: [
    { id: 'select', title: 'SELECT', type: ColumnType.Select, width: 80 },
    { id: 'col1', title: 'Column 1', type: ColumnType.Text, width: 150 },
    { id: 'col2', title: 'Column 2', type: ColumnType.Text, width: 150 }
  ],
  tasks: [
    {
      select: false,
      ID: 1,
      Title: 'Task 1',
      Description: 'Description 1',
      Status: Status.InProgress,
      Priority: Priority.High,
      col1: 'Value 1',
      col2: 'Value 2'
    }
  ]
};

/**
 * Mock data for testing table conversion with error cases
 */
export const mockErrorData = {
  columns: [
    { id: 'select', title: 'SELECT', type: ColumnType.Select, width: 80 },
    { id: 'ID', title: 'ID', type: ColumnType.Number, width: 100 },
    { id: 'Title', title: 'Title', type: ColumnType.Text, width: 200 },
    { id: 'Status', title: 'Status', type: ColumnType.Text, width: 150 },
    { id: 'Priority', title: 'Priority', type: ColumnType.Text, width: 120 }
  ],
  tasks: [
    {
      select: false,
      ID: 1,
      Title: 'Task 1',
      Description: 'Description 1',
      Status: Status.InProgress,
      Priority: Priority.High
    }
  ]
};

/**
 * Mock data for testing table conversion with large dataset
 */
export const mockLargeDataset = {
  columns: [
    { id: 'select', title: 'SELECT', type: ColumnType.Select, width: 32, minWidth: 128 },
    { id: 'ID', title: 'ID', type: ColumnType.Number, width: 40, minWidth: 160 },
    { id: 'Title', title: 'Title', type: ColumnType.Text, width: 40, minWidth: 160 },
    { id: 'Status', title: 'Status', type: ColumnType.Text, width: 40, minWidth: 160 },
    { id: 'Priority', title: 'Priority', type: ColumnType.Text, width: 40, minWidth: 160 },
    { id: 'Start_Date', title: 'Start Date', type: ColumnType.Date, width: 40, minWidth: 160 },
    { id: 'Deadline', title: 'Deadline', type: ColumnType.Date, width: 40, minWidth: 160 }
  ],
  tasks: [
    {
      select: false,
      ID: 1,
      Title: 'Task 1',
      Description: 'Description 1',
      Status: Status.ToDo,
      Priority: Priority.High,
      Start_Date: '2024-03-01',
      Deadline: '2024-03-15'
    },
    {
      select: false,
      ID: 2,
      Title: 'Task 2',
      Description: 'Description 2',
      Status: Status.ToDo,
      Priority: Priority.Medium,
      Start_Date: '2024-03-02',
      Deadline: '2024-03-16'
    }
  ]
};

/**
 * Convert Power FX code to table data using Claude API (test version)
 */
export const convertPowerFXToTable = async (
  powerFXCode: string,
  model: ClaudeModel = 'claude-3-5-haiku-20241022'
): Promise<PowerFXImportResult> => {
  try {
    // For development and testing, we can use a fallback method if Supabase API key is not configured
    if (!isSupabaseApiKeyConfigured()) {
      console.warn('Supabase API key not configured. Using fallback method for PowerFX import.');
      // Return a minimal table structure with proper types
      return {
        columns: [
          { id: 'select', title: 'SELECT', type: ColumnType.Select, width: 32, minWidth: 128 },
          { id: 'ID', title: 'ID', type: ColumnType.Number, width: 40, minWidth: 160 },
          { id: 'Title', title: 'Title', type: ColumnType.Text, width: 40, minWidth: 160 },
          { id: 'Status', title: 'Status', type: ColumnType.Text, width: 40, minWidth: 160 },
          { id: 'Priority', title: 'Priority', type: ColumnType.Text, width: 40, minWidth: 160 },
          { id: 'Start_Date', title: 'Start Date', type: ColumnType.Date, width: 40, minWidth: 160 },
          { id: 'Deadline', title: 'Deadline', type: ColumnType.Date, width: 40, minWidth: 160 }
        ],
        tasks: [
          {
            select: false,
            ID: 1,
            Title: 'Complete project proposal',
            Description: 'Project proposal needs to be completed',
            Status: Status.InProgress,
            Priority: Priority.High,
            Start_Date: '2023-05-15',
            Deadline: '2023-05-30'
          },
          {
            select: false,
            ID: 2,
            Title: 'Review documentation',
            Description: 'Documentation needs to be reviewed',
            Status: Status.ToDo,
            Priority: Priority.Medium,
            Start_Date: '2023-05-20',
            Deadline: '2023-06-05'
          }
        ],
        tokenUsage: {
          input_tokens: 100,
          output_tokens: 200,
          total_tokens: 300
        }
      };
    }

    // Check if global.fetch is mocked to throw an error
    if ((global as any).fetch && (global as any).fetch.mockImplementation) {
      const mockFnImpl = (global as any).fetch.getMockImplementation();
      if (mockFnImpl) {
        // If fetch is mocked to throw an error, let it propagate through the actual try/catch
        const result = await (global as any).fetch();
        if (!result.ok) {
          throw new Error(`Error: The selected model "${getClaudeModelDisplayName(model)}" (${model}) is not available or not supported by the API endpoint. Please try a different model.`);
        }
      }
    }

    // Special case for large dataset test
    if (model === 'claude-3-5-haiku-20241022' && powerFXCode.includes('large-dataset')) {
      throw new Error(`The PowerFX code is too large for ${getClaudeModelDisplayName(model)}. Please try using Claude 3.7 Sonnet instead, which has a higher token limit.`);
    }

    // In the mock, we don't actually make the API call
    // Instead, we return a mock response
    return {
      columns: [
        { id: 'select', title: 'SELECT', type: ColumnType.Select, width: 32, minWidth: 128 },
        { id: 'ID', title: 'ID', type: ColumnType.Number, width: 40, minWidth: 160 },
        { id: 'Title', title: 'Title', type: ColumnType.Text, width: 40, minWidth: 160 },
        { id: 'Status', title: 'Status', type: ColumnType.Text, width: 40, minWidth: 160 },
        { id: 'Priority', title: 'Priority', type: ColumnType.Text, width: 40, minWidth: 160 },
        { id: 'Start_Date', title: 'Start Date', type: ColumnType.Date, width: 40, minWidth: 160 },
        { id: 'Deadline', title: 'Deadline', type: ColumnType.Date, width: 40, minWidth: 160 }
      ],
      tasks: [
        {
          select: false,
          ID: 1,
          Title: 'Complete project proposal',
          Description: 'Project proposal needs to be completed',
          Status: Status.InProgress,
          Priority: Priority.High,
          Start_Date: '2023-05-15',
          Deadline: '2023-05-30'
        },
        {
          select: false,
          ID: 2,
          Title: 'Review documentation',
          Description: 'Documentation needs to be reviewed',
          Status: Status.ToDo,
          Priority: Priority.Medium,
          Start_Date: '2023-05-20',
          Deadline: '2023-06-05'
        }
      ],
      tokenUsage: {
        input_tokens: 100,
        output_tokens: 200,
        total_tokens: 300
      }
    };
  } catch (error) {
    throw error;
  }
}; 