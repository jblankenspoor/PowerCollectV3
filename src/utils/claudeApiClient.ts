/**
 * Claude API Client
 * 
 * Functions for interacting with the Claude API via Supabase Edge Function
 * 
 * @module claudeApiClient
 * @version 4.0.0 - Implementation of PowerFX generation and import functionality
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
Your task is to convert a JSON table into Power FX code that creates a collection that can be used in Power Apps.
Follow these specific guidelines:
- Begin with a ClearCollect() statement to clear any existing collection with the same name
- Add all the records to the collection
- Name the collection "PowerCollectData"
- Structure each record to match the exact schema of the provided JSON data
- Preserve all data types properly (text, number, date, boolean, etc.)
- For date fields, ensure they are properly formatted as DateTime values
- For numeric fields, maintain precision and use appropriate number formatting
- For text fields with special characters, ensure proper escaping
- Format the code with proper indentation for readability
- Include detailed comments explaining:
  * The purpose of the collection
  * The schema/structure of the data
  * Any data type conversions being performed
  * How to use this collection in Power Apps
  * Add: "Made with PowerCollect https://powercollect.jacco.me
- Optimize the code for performance in Power Apps
- Ensure the code follows Power Apps best practices
- Only respond with the complete, ready-to-use Power FX code and nothing else
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
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `Create a Power Apps collection in Power FX code using this table data. The collection should be optimized for use in a Power Apps canvas app. Here's the data to convert: ${JSON.stringify(tableData, null, 2)}`
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
      throw new Error(`Error from Claude API: ${response.status} ${response.statusText}`);
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
 * @returns Promise containing the parsed table data
 */
export const convertPowerFXToTable = async (
  powerFXCode: string
): Promise<{ columns: Column[], tasks: Task[] }> => {
  try {
    // Check if Supabase API key is configured
    if (!isSupabaseApiKeyConfigured()) {
      throw new Error('Supabase API key not configured. Please set the VITE_SUPABASE_API_KEY environment variable.');
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
`;

    // Prepare request body
    const requestBody = {
      model: 'claude-3-haiku-20240307',
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
      throw new Error(`Error from Claude API: ${response.status} ${response.statusText}`);
    }
    
    // Parse the response
    const data = await response.json();
    console.log('Response from Claude API:', data);
    
    // Extract the JSON data from the response
    if (data.content && data.content.length > 0) {
      try {
        // Try to parse the response as JSON
        const jsonData = JSON.parse(data.content[0].text);
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
