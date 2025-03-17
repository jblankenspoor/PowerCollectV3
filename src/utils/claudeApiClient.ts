/**
 * Claude API Client
 * 
 * Functions for interacting with the Claude API via Supabase Edge Function
 * 
 * @module claudeApiClient
 * @version 4.1.5 - Fixed column title formatting for "Start Date" in Power FX generation
 * @version 4.2.1 - Added token usage information to API response
 * @version 4.2.2 - Updated PowerFX import to include token usage in response
 * @version 5.1.9 - Updated pricing model for input and output tokens
 * @version 5.1.10 - Updated Claude 3.5 Haiku output token pricing from $2.40 to $4.00 per million tokens
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
 * Convert table data to Power FX code using Claude API via Supabase
 * 
 * @param tasks - Array of task objects from the table
 * @param columns - Array of column definitions
 * @param model - Claude model to use for generation (defaults to Claude 3.5 Haiku)
 * @returns Promise containing the generated Power FX code and token usage information
 * @version 4.2.0 - Fixed issue where old column titles were still visible to Claude 3.5 Haiku
 */
export const convertTableToPowerFX = async (
  tasks: Task[],
  columns: Column[],
  model: ClaudeModel = 'claude-3-5-haiku-20241022'
): Promise<PowerFXGenerationResult> => {
  try {
    // For development and testing, we can use a fallback method if Supabase API key is not configured
    if (!isSupabaseApiKeyConfigured()) {
      console.warn('Supabase API key not configured. Using fallback method for PowerFX generation.');
      return {
        code: `// PowerCollect Data Collection
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

// Made with PowerCollect https://powercollect.jacco.me`,
        tokenUsage: null
      };
    }

    // Make a deep clone of the columns to avoid any reference issues
    const clonedColumns = JSON.parse(JSON.stringify(columns));

    // Filter out the "select" column
    const filteredColumns = clonedColumns.filter((col: Column) => col.id !== 'select');
    
    // Get a list of valid column IDs (excluding 'select')
    const validColumnIds = filteredColumns.map((col: Column) => col.id);
    
    // Create a deep copy of tasks and only include properties that correspond to current columns
    const filteredTasks = tasks.map(task => {
      // Start with an empty object
      const filteredTask: Record<string, any> = {};
      
      // Only include properties that exist in the current columns
      validColumnIds.forEach((columnId: string) => {
        if (columnId in task) {
          filteredTask[columnId] = task[columnId];
        }
      });
      
      return filteredTask;
    });

    // Log the column titles to help with debugging
    console.log(`Column titles before preparing for Claude API (${model}):`);
    filteredColumns.forEach((col: Column) => {
      console.log(`- ${col.id}: original="${col.title}", display="${col.displayTitle || col.title.toUpperCase()}"`);
    });

    // Add a timestamp to prevent potential caching issues
    const timestamp = new Date().toISOString();
    console.log(`Request timestamp: ${timestamp}`);

    // Prepare the data for Claude with the original case column titles
    // Creating completely new objects to eliminate any traces of old titles or displayTitles
    const tableData = {
      timestamp: timestamp, // Add timestamp to force fresh request
      columns: filteredColumns.map((col: Column) => {
        // Create brand new objects with only the necessary properties
        // This ensures no references to old titles from object spread or cloning
        return {
          id: col.id,
          title: col.title, // Use the current title
          type: col.type
        };
      }),
      tasks: (() => {
        // Create completely new task objects with only the properties we need
        return filteredTasks.map(task => {
          const newTask: Record<string, any> = {};
          // Only include properties that match with current column IDs
          validColumnIds.forEach((colId: string) => {
            if (colId in task) {
              newTask[colId] = task[colId];
            }
          });
          return newTask;
        });
      })()
    };

    // Log the prepared data to verify column titles
    console.log(`Prepared table data for Claude API (${model}):`, JSON.stringify(tableData, null, 2));

    // Create the system prompt for Claude
    const systemPrompt = `
You are an expert in converting data to Microsoft Power FX format for Power Apps.
Your task is to convert a JSON table into Power FX code that creates a collection that can be used in Power Apps.
Follow these specific guidelines:
- Use this format for the collection:
  ClearCollect(
    PowerCollectData,
    [
      {
        Number: 1, 
        Month: "January", 
        "Start Date": Date(2019,1,1), 
        Favorite: false
      },
      {
        Number: 2, 
        Month: "February", 
        "Start Date": Date(2019,2,1), 
        Favorite: false
      }
    ]
  );
- Name the collection "PowerCollectData"
- Structure each record to match the exact schema of the provided JSON data
- CRITICAL: Use the exact column titles as provided in the JSON data - maintain the same case (uppercase/lowercase) exactly as shown in the columns.title field
- For column titles with spaces, always enclose them in double quotes (e.g., "Start Date")
- For column titles without spaces, quotes are optional
- Do not use any other version of column titles that might appear elsewhere in the data
- Preserve all data types properly (text, number, date, boolean, etc.)
- Format the code with proper indentation for readability
- Make sure that additional text is always used as a comment
- Include detailed comments explaining:
  * The schema/structure of the data
  * Any data type conversions being performed
  * Add: "Made with PowerCollect https://powercollect.jacco.me"
- IMPORTANT: Do NOT add triple backticks (\`\`\`) at the beginning or end of your code
- IMPORTANT: Do NOT cache your response, use the latest data provided to you in this request (notice the timestamp)
- CRITICAL: NEVER truncate or abbreviate the output. Include ALL rows from the input data in your response.
- CRITICAL: Do NOT use phrases like "and so on" or "etc." or "..." to abbreviate the data. Include every single row.
- CRITICAL: Do NOT summarize the data or show only a subset of rows "for brevity". Show ALL rows.
- CRITICAL: The JSON data provided in the user message is the ACTUAL data to convert, NOT an example. Process ALL of this data.
- CRITICAL: Do NOT treat the input data as an example. It is the real data that needs to be fully converted.
- CRITICAL: Every single row in the input must appear as a corresponding row in your output.
- CRITICAL: If there are 100 rows in the input, there must be 100 rows in your output.
- CRITICAL: DO NOT mention space constraints, token limits, or any technical limitations in your response. If you cannot complete the task, respond with an error code "ERROR-TOO-LARGE" but make no other comments about why.
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
    
    // Prepare request body with model-specific adjustments
    let requestBody = {
      model: model,
      max_tokens: model.includes('sonnet') ? 20000 : 4096, // Using 20,000 for Sonnet (per request limit), 4,096 for Haiku (API limit)
      temperature: model.includes('haiku') ? 0.1 : 0.0, // Slightly higher temperature for Haiku to reduce truncation
      messages: [
        {
          role: 'user',
          content: `Create a Power Apps collection in Power FX code using this table data. The collection should be optimized for use in a Power Apps canvas app. Here's the data to convert (timestamp: ${timestamp}): ${JSON.stringify(tableData, null, 2)}`
        }
      ],
      system: systemPrompt
    };
    
    console.log(`Making request to Claude API (${model}) via Supabase...`);
    console.log(`Request content: ${requestBody.messages[0].content.substring(0, 100)}...`);
    
    // Create standard request settings
    const requestUrl = SUPABASE_FUNCTION_URL;
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: getSupabaseHeaders(),
      body: JSON.stringify(requestBody),
      cache: 'no-store' as RequestCache // Explicitly type as RequestCache
    };
    
    console.log(`Starting fetch request to ${requestUrl} with model ${model}...`);
    
    try {
      // Make the API request
      const response = await fetch(requestUrl, requestOptions);
      
      // Check if the request was successful
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from Claude API:', errorText);
        console.error('Request details:', { 
          model, 
          url: requestUrl,
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
      
      // Extract token usage information
      const tokenUsage: ClaudeTokenUsage | null = data.usage ? {
        input_tokens: data.usage.input_tokens,
        output_tokens: data.usage.output_tokens,
        total_tokens: data.usage.input_tokens + data.usage.output_tokens
      } : null;
      
      // Extract the Power FX code from the response
      if (data.content && data.content.length > 0) {
        const responseText = data.content[0].text;
        
        // Check if we got the "ERROR-TOO-LARGE" response
        if (responseText.includes('ERROR-TOO-LARGE')) {
          throw new Error(`The dataset is too large for ${getClaudeModelDisplayName(model)}. Please try using Claude 3.7 Sonnet instead, which has a higher token limit.`);
        }
        
        return {
          code: responseText,
          tokenUsage
        };
      } else {
        throw new Error('No content returned from Claude API');
      }
    } catch (fetchError) {
      console.error('Fetch error details:', fetchError);
      
      if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
        throw new Error(`Network error when connecting to Supabase. Please check your internet connection and try again. Details: ${fetchError.message}`);
      }
      
      throw fetchError;
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
 * @version 4.2.0 - Improved data cleaning to prevent old column titles from affecting Claude API
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
        ],
        tokenUsage: null
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
- CRITICAL: Create completely new column objects with only id, title, and type properties
- Use the EXACT column titles as they appear in the Power FX code, maintaining case sensitivity
- Do not reference or include any previous versions of column titles that might be in the data
- IMPORTANT: Do NOT add triple backticks (\`\`\`) at the beginning or end of your response
- CRITICAL: NEVER truncate or abbreviate the output. Include ALL rows from the input data in your response.
- CRITICAL: Do NOT use phrases like "and so on" or "etc." or "..." to abbreviate the data. Include every single row.
- CRITICAL: Do NOT summarize the data or show only a subset of rows "for brevity". Show ALL rows.
- CRITICAL: The Power FX code provided in the user message is the ACTUAL code to convert, NOT an example. Process ALL of this data.
- CRITICAL: Do NOT treat the input code as an example. It is the real data that needs to be fully converted.
- CRITICAL: Every single record in the input must appear as a corresponding row in your output.
- CRITICAL: If there are 100 records in the input, there must be 100 tasks in your output.
- CRITICAL: DO NOT mention space constraints, token limits, or any technical limitations in your response. If you cannot complete the task, respond with an error code "ERROR-TOO-LARGE" but make no other comments about why.
`;

    // Prepare request body
    const requestBody = {
      model: model,
      max_tokens: model.includes('sonnet') ? 20000 : 4096, // Using 20,000 for Sonnet (per request limit), 4,096 for Haiku (API limit)
      temperature: model.includes('haiku') ? 0.1 : 0.0, // Slightly higher temperature for Haiku to reduce truncation
      messages: [
        {
          role: 'user',
          content: `Parse this Power FX code and convert it to JSON: ${powerFXCode}`
        }
      ],
      system: systemPrompt,
      // Adding a flag to indicate that we only want to use current column titles
      useOnlyCurrentTitles: true // Signal to Claude API to ignore any historical title metadata
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
    
    // Extract token usage information if available
    const tokenUsage: ClaudeTokenUsage | null = data.usage ? {
      input_tokens: data.usage.input_tokens,
      output_tokens: data.usage.output_tokens,
      total_tokens: data.usage.total_tokens
    } : null;
    
    // Extract the JSON data from the response
    if (data.content && data.content.length > 0) {
      const responseText = data.content[0].text;
      
      // Check if we got the "ERROR-TOO-LARGE" response
      if (responseText.includes('ERROR-TOO-LARGE')) {
        throw new Error(`The PowerFX code is too large for ${getClaudeModelDisplayName(model)}. Please try using Claude 3.7 Sonnet instead, which has a higher token limit.`);
      }
      
      try {
        // Try to parse the response as JSON
        let jsonData = JSON.parse(responseText);
        
        // Clean the column data to ensure no old title references remain
        if (jsonData.columns && Array.isArray(jsonData.columns)) {
          // Create completely new column objects with only the necessary properties
          jsonData.columns = jsonData.columns.map((col: any) => ({
            id: col.id,
            title: col.title, // Use only the parsed title
            type: col.type || 'text',
            width: col.width || 'w-40',
            minWidth: col.minWidth || 'min-w-[160px]'
          }));
        }
        
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
        
        // Add token usage to the return value
        return {
          ...jsonData,
          tokenUsage
        };
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
