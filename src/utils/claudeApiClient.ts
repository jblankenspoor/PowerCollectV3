/**
 * Claude API Client
 * 
 * Functions for interacting with the Claude API via Supabase Edge Function
 * 
 * @module claudeApiClient
 * @version 0.3.5 - Fixed Supabase authentication
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
  return !!SUPABASE_API_KEY && SUPABASE_API_KEY.length > 0;
};

/**
 * Get headers for Supabase Edge Function request
 * @returns Headers object with proper authentication
 */
const getSupabaseHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_API_KEY,
    'Authorization': `Bearer ${SUPABASE_API_KEY}`
  };
};

/**
 * Convert table data to Power FX code using Claude API via Supabase
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
    // Check if Supabase API key is configured
    if (!isSupabaseApiKeyConfigured()) {
      throw new Error('Supabase API key not configured. Please set the VITE_SUPABASE_API_KEY environment variable.');
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
      model: 'claude-3-5-haiku-20240307',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `Convert this table data to Power FX code: ${JSON.stringify(tableData, null, 2)}`
        }
      ],
      system: systemPrompt
    };
    
    // Make the API request to Supabase Edge Function
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    
    // Get response as text first to log it
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    // Parse the response text as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing response JSON:', parseError);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
    }
    
    if (!response.ok) {
      console.error('Supabase function error response:', data);
      const errorMessage = data.error || JSON.stringify(data);
      throw new Error(`Supabase function error: ${errorMessage}`);
    }

    console.log('API response received successfully:', data);
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('Unexpected API response format:', data);
      throw new Error('Unexpected API response format');
    }

    return data.content[0].text;
  } catch (error) {
    console.error('Error converting table to Power FX:', error);
    throw error;
  }
};

/**
 * Convert Power FX code to table data using Claude API via Supabase
 * 
 * @param powerFXCode - The Power FX code to convert
 * @returns Promise containing the parsed tasks and columns
 */
export const convertPowerFXToTable = async (
  powerFXCode: string
): Promise<{ tasks: Task[], columns: Column[] }> => {
  try {
    // Check if Supabase API key is configured
    if (!isSupabaseApiKeyConfigured()) {
      throw new Error('Supabase API key not configured. Please set the VITE_SUPABASE_API_KEY environment variable.');
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
      model: 'claude-3-5-haiku-20240307',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `Convert this Power FX code to table data: ${powerFXCode}`
        }
      ],
      system: systemPrompt
    };
    
    // Make the API request to Supabase Edge Function
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    
    // Get response as text first to log it
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    // Parse the response text as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing response JSON:', parseError);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
    }
    
    if (!response.ok) {
      console.error('Supabase function error response:', data);
      const errorMessage = data.error || JSON.stringify(data);
      throw new Error(`Supabase function error: ${errorMessage}`);
    }

    console.log('API response received successfully:', data);
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('Unexpected API response format:', data);
      throw new Error('Unexpected API response format');
    }

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