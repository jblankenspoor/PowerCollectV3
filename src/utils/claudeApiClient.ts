/**
 * Claude API Client
 * 
 * Functions for interacting with the Claude API via Supabase Edge Function
 * 
 * @module claudeApiClient
 * @version 4.0.7 - Reverted dropdown styling to fix overlapping issue
 */

import { Column, Task } from '../types/dataTypes';

// Supabase Edge Function URL
const SUPABASE_FUNCTION_URL = 'https://lykwvupycqukyfapqdyp.supabase.co/functions/v1/claude-api-proxy';
// Get Supabase API key from environment variables
const SUPABASE_API_KEY = import.meta.env.VITE_SUPABASE_API_KEY;

/**
 * Check if the Supabase API key is configured
 * @returns boolean indicating if the API key is set
 */
const isSupabaseApiKeyConfigured = (): boolean => {
  return SUPABASE_API_KEY !== undefined && SUPABASE_API_KEY !== '';
};

/**
 * Get headers for Supabase API requests
 * @returns Object containing the necessary headers for Supabase API requests
 */
const getSupabaseHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_API_KEY,
    'Authorization': `Bearer ${SUPABASE_API_KEY}`
  };
};

/**
 * Available Claude API models
 * @see https://docs.anthropic.com/en/docs/about-claude/models/all-models
 */
export type ClaudeModel = 'claude-3-5-haiku-20241022' | 'claude-3-7-sonnet-20250219';

/**
 * Get the display name for a Claude model
 * @param model - The model identifier
 * @returns A user-friendly display name for the model
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
 * Convert table data to Power FX code using Claude API via Supabase
 * 
 * @param tasks - Array of task objects from the table
 * @param columns - Array of column definitions
 * @param model - Claude model to use for generation
 * @returns Promise containing the generated Power FX code
 */
/**
 * Convert table data to Power FX code using Claude API via Supabase
 * 
 * @param tasks - Array of task objects from the table
 * @param columns - Array of column definitions
 * @param model - Claude model to use for generation (defaults to Claude 3.5 Haiku)
 * @returns Promise containing the generated Power FX code
 */
export const convertTableToPowerFX = async (
  tasks: Task[],
  columns: Column[],
  model: ClaudeModel = 'claude-3-5-haiku-20241022'
): Promise<string> => {
  try {
    // For development and testing, we can use a fallback method if Supabase API key is not configured
    if (!isSupabaseApiKeyConfigured()) {
      console.warn('Supabase API key not configured. Using fallback method for PowerFX generation.');
      return `// PowerCollect Data Collection
// This is a placeholder collection as the API key is not configured.
// Please configure the VITE_SUPABASE_API_KEY environment variable.

ClearCollect(
  PowerCollectData,
  [
    // Sample data structure based on your table
    // Actual data would be generated with a valid API key
    { /* Your data would appear here */ }
  ]
);

// Made with PowerCollect https://powercollect.jacco.me`;
    }

    // Filter out the "select" column
    const filteredColumns = columns.filter(col => col.id !== 'select');
    
    // Get a list of valid column IDs (excluding 'select')
    const validColumnIds = filteredColumns.map(col => col.id);
    
    // Create a deep copy of tasks and only include properties that correspond to current columns
    const filteredTasks = tasks.map(task => {
      // Start with an empty object
      const filteredTask: Record<string, any> = {};
      
      // Only include properties that exist in the current columns
      validColumnIds.forEach(columnId => {
        if (columnId in task) {
          filteredTask[columnId] = task[columnId];
        }
      });
      
      return filteredTask;
    });

    // Prepare the data for Claude
    const tableData = {
      columns: filteredColumns.map(col => ({
        id: col.id,
        title: col.title,
        type: col.type
      })),
      tasks: filteredTasks
    };

    // Create the system prompt for Claude
    const systemPrompt = `
You are an expert in converting data to Microsoft Power FX format for Power Apps.
Your task is to convert a JSON table into Power FX code that creates a collection that can be used in Power Apps.
Follow these specific guidelines:
- Use this format for the collection:
  ClearCollect(
    PowerCollectData,
    {
    Number:1, Month: "January", StartDate: Date(2019,1,1), Favorite: false,
    Number:2, Month: "February", StartDate: Date(2019,2,1), Favorite: false}
     }
  );
- Name the collection "PowerCollectData"
- Structure each record to match the exact schema of the provided JSON data
- Preserve all data types properly (text, number, date, boolean, etc.)
- Format the code with proper indentation for readability
- Make sure that additional text is always used as a comment
- Include detailed comments explaining:
  * The schema/structure of the data
  * Any data type conversions being performed
  * Add: "Made with PowerCollect https://powercollect.jacco.me"
- Only respond with the complete, ready-to-use Power FX code and nothing else, don't include any other text or comments formulaes
- IMPORTANT: Do NOT add triple backticks (\`\`\`) at the beginning or end of your code
`;

    console.log('Making API request to Claude via Supabase...');
    console.log('Request URL:', SUPABASE_FUNCTION_URL);
    
    // Get headers for the request
    const headers = getSupabaseHeaders();
    console.log('Request headers:', {
      'Content-Type': headers['Content-Type'],
      'apikey': 'PRESENT (not showing for security)',
      'Authorization': 'Bearer token PRESENT'
    });
    
    // Prepare request body
    const requestBody = {
      model: model,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `Create a Power Apps collection in Power FX code using this table data. The collection should be optimized for use in a Power Apps canvas app. Here's the data to convert: ${JSON.stringify(tableData, null, 2)}`
        }
      ],
      system: systemPrompt
    };
    
    console.log(`Making request to Claude API (${model}) via Supabase...`);
    
    // Make the API request
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: getSupabaseHeaders(),
      body: JSON.stringify(requestBody)
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from Claude API:', errorText);
      console.error('Request details:', { 
        model, 
        url: SUPABASE_FUNCTION_URL,
        status: response.status,
        statusText: response.statusText 
      });
      
      // Provide a more helpful error message
      if (response.status === 404) {
        throw new Error(`Error: The selected model "${getClaudeModelDisplayName(model)}" (${model}) is not available or not supported by the API endpoint. Please try a different model.`);
      } else {
        throw new Error(`Error from Claude API: ${response.status} ${response.statusText}. Please try again or select a different model.`);
      }
    }
    
    // Parse the response
    const data = await response.json();
    console.log('Response from Claude API:', data);
    
    // Extract the Power FX code from the response
    if (data.content && data.content.length > 0) {
      return data.content[0].text;
    } else {
      throw new Error('No content returned from Claude API');
    }
  } catch (error) {
    console.error('Error converting table to Power FX:', error);
    throw error;
  }
};

/**
 * Convert Power FX code to table data using Claude API via Supabase
 * 
 * @param powerFXCode - Power FX code to convert to table data
 * @param model - Claude model to use for conversion
 * @returns Promise containing the parsed table data
 */
export const convertPowerFXToTable = async (
  powerFXCode: string,
  model: ClaudeModel = 'claude-3-5-haiku-20241022'
): Promise<{ columns: Column[], tasks: Task[] }> => {
  try {
    // For development and testing, we can use a fallback method if Supabase API key is not configured
    if (!isSupabaseApiKeyConfigured()) {
      console.warn('Supabase API key not configured. Using fallback method for PowerFX import.');
      // Return a minimal table structure with proper types
      return {
        columns: [
          { id: 'col1', title: 'Column 1', type: 'text', width: 'w-1/2' },
          { id: 'col2', title: 'Column 2', type: 'text', width: 'w-1/2' }
        ],
        tasks: [
          { 
            id: '1', 
            name: 'Sample Task',
            status: 'To do',
            priority: 'Medium',
            startDate: new Date().toISOString().split('T')[0],
            deadline: new Date().toISOString().split('T')[0],
            col1: 'Sample', 
            col2: 'Data' 
          }
        ]
      };
    }

    // Create the system prompt for Claude
    const systemPrompt = `
You are an expert in parsing Microsoft Power FX code for Power Apps.
Your task is to extract data from Power FX code that creates a collection and convert it to a JSON structure.
Follow these guidelines:
- Parse the Power FX code to extract all records
- Convert the records to a JSON array
- Preserve all data types properly
- Return only the JSON data and nothing else
- The JSON should have a "columns" array with column definitions and a "tasks" array with the data
- IMPORTANT: Do NOT add triple backticks (\`\`\`) at the beginning or end of your response
`;

    // Prepare request body
    const requestBody = {
      model: model,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `Parse this Power FX code and convert it to JSON: ${powerFXCode}`
        }
      ],
      system: systemPrompt
    };
    
    console.log('Making request to Claude API via Supabase...');
    
    // Make the API request
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: getSupabaseHeaders(),
      body: JSON.stringify(requestBody)
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from Claude API:', errorText);
      console.error('Request details:', { 
        model, 
        url: SUPABASE_FUNCTION_URL,
        status: response.status,
        statusText: response.statusText 
      });
      
      // Provide a more helpful error message
      if (response.status === 404) {
        throw new Error(`Error: The selected model "${getClaudeModelDisplayName(model)}" (${model}) is not available or not supported by the API endpoint. Please try a different model.`);
      } else {
        throw new Error(`Error from Claude API: ${response.status} ${response.statusText}. Please try again or select a different model.`);
      }
    }
    
    // Parse the response
    const data = await response.json();
    console.log('Response from Claude API:', data);
    
    // Extract the JSON data from the response
    if (data.content && data.content.length > 0) {
      try {
        // Try to parse the response as JSON
        const jsonData = JSON.parse(data.content[0].text);
        
        // Add the Select column if it doesn't exist
        if (!jsonData.columns.some((col: Column) => col.id === 'select')) {
          jsonData.columns.unshift({
            id: 'select',
            title: 'SELECT',
            type: 'select',
            width: 'w-32',
            minWidth: 'min-w-[128px]'
          });
        }
        
        return jsonData;
      } catch (parseError) {
        console.error('Error parsing JSON from Claude API response:', parseError);
        throw new Error('Invalid JSON returned from Claude API');
      }
    } else {
      throw new Error('No content returned from Claude API');
    }
  } catch (error) {
    console.error('Error converting Power FX to table:', error);
    throw error;
  }
};
