/**
 * Claude API Client
 * 
 * Functions for interacting with the Claude API to convert data to/from Power FX format
 * 
 * @module claudeApiClient
 * @version 0.1.2 - Removed hardcoded API key
 */

import { Column, Task } from '../types/dataTypes';

// NOTE: API key should be provided via environment variables in production
// For security reasons, we're not hardcoding the API key here
const CLAUDE_API_KEY = 'YOUR_CLAUDE_API_KEY'; // Replace with your API key when testing locally
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Convert table data to Power FX code using Claude API
 * 
 * @param tasks - Array of task objects from the table
 * @param columns - Array of column definitions
 * @returns Promise containing the generated Power FX code
 */
export const convertTableToPowerFX = async (
  tasks: Task[],
  columns: Column[]
): Promise<string> => {
  try {
    // Check if API key is set
    if (CLAUDE_API_KEY === 'YOUR_CLAUDE_API_KEY') {
      return `// Please set your Claude API key in the claudeApiClient.ts file
// or configure it via environment variables`;
    }

    // Prepare the data for Claude
    const tableData = {
      columns: columns.map(col => ({
        id: col.id,
        title: col.title,
        type: col.type
      })),
      tasks: tasks
    };

    // Create the system prompt for Claude
    const systemPrompt = `
You are an expert in converting data to Microsoft Power FX format for Power Apps.
Your task is to convert a JSON table into Power FX code that can be used in Power Apps.
The code should create a collection with all the data from the provided JSON.
Follow these guidelines:
- Create a Clear() statement to clear any existing collection
- Use a Collect() function to add all the records to the collection
- Name the collection "ImportedData"
- Preserve all data types properly (text, date, etc.)
- Format the code to be easily readable
- Include comments to explain key parts of the code
- Only respond with the Power FX code and nothing else
`;

    // Make the API request to Claude
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20240307',
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Convert this table data to Power FX code: ${JSON.stringify(tableData, null, 2)}`
          }
        ],
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API error response:', errorData);
      throw new Error(`Claude API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Error converting table to Power FX:', error);
    throw error;
  }
};

/**
 * Convert Power FX code to table data using Claude API
 * 
 * @param powerFXCode - The Power FX code to convert
 * @returns Promise containing the parsed tasks and columns
 */
export const convertPowerFXToTable = async (
  powerFXCode: string
): Promise<{ tasks: Task[], columns: Column[] }> => {
  try {
    // Check if API key is set
    if (CLAUDE_API_KEY === 'YOUR_CLAUDE_API_KEY') {
      throw new Error('Please set your Claude API key in the claudeApiClient.ts file');
    }

    // Create the system prompt for Claude
    const systemPrompt = `
You are an expert in converting Microsoft Power FX code to structured data.
Your task is to convert Power FX code from Power Apps into JSON data that can be imported into a table.
Follow these guidelines:
- Extract the data structure from the Power FX Collect() statements
- Return a JSON object with two properties: "tasks" (array of data objects) and "columns" (array of column definitions)
- For columns, infer the column type (text, date, status, priority) based on the data
- Generate unique IDs for tasks if they don't exist
- Only respond with the JSON and nothing else
`;

    // Make the API request to Claude
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20240307',
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Convert this Power FX code to table data: ${powerFXCode}`
          }
        ],
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API error response:', errorData);
      throw new Error(`Claude API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const parsedData = JSON.parse(data.content[0].text);
    
    return {
      tasks: parsedData.tasks,
      columns: parsedData.columns
    };
  } catch (error) {
    console.error('Error converting Power FX to table:', error);
    throw error;
  }
}; 