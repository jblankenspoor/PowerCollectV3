/**
 * Token Counter Utility
 * 
 * Provides functions to count tokens for text and data to estimate Claude API token usage
 * 
 * @module tokenCounter
 * @version 5.1.0 - Initial implementation of token counting functionality
 */

import { AutoTokenizer } from '@xenova/transformers';
import { Column, Task } from '../types/dataTypes';

/**
 * Interface for token count results
 */
export interface TokenCount {
  inputTokens: number;
  instructionTokens: number;
  totalTokens: number;
}

/**
 * Cache for the tokenizer to avoid reloading
 */
let tokenizerCache: any = null;

/**
 * Load the Claude tokenizer
 * @returns Promise that resolves to the tokenizer
 */
async function getTokenizer() {
  if (tokenizerCache) {
    return tokenizerCache;
  }
  
  try {
    // Load the Claude tokenizer from Hugging Face
    const tokenizer = await AutoTokenizer.from_pretrained('Xenova/claude-tokenizer');
    tokenizerCache = tokenizer;
    return tokenizer;
  } catch (error) {
    console.error('Error loading Claude tokenizer:', error);
    throw new Error('Failed to load Claude tokenizer');
  }
}

/**
 * Count tokens in a text string
 * @param text - The text to count tokens in
 * @returns Promise resolving to the number of tokens
 */
export async function countTokensInText(text: string): Promise<number> {
  try {
    const tokenizer = await getTokenizer();
    const tokens = tokenizer.encode(text);
    return tokens.length;
  } catch (error) {
    console.error('Error counting tokens:', error);
    // Return an estimate if tokenizer fails
    return Math.ceil(text.length / 4); // Rough estimate
  }
}

/**
 * Count tokens for the system prompt used in Claude API calls
 * @returns Promise resolving to the number of tokens
 */
export async function countInstructionTokens(): Promise<number> {
  // This is the system prompt used in claudeApiClient.ts
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
`;

  return countTokensInText(systemPrompt);
}

/**
 * Count tokens for PowerFX import system prompt
 * @returns Promise resolving to the number of tokens
 */
export async function countImportInstructionTokens(): Promise<number> {
  // This is the system prompt used for PowerFX import in claudeApiClient.ts
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
`;

  return countTokensInText(systemPrompt);
}

/**
 * Count tokens for table data
 * @param tasks - Array of tasks from the table
 * @param columns - Array of column definitions
 * @returns Promise resolving to the number of tokens
 */
export async function countTableDataTokens(tasks: Task[], columns: Column[]): Promise<number> {
  try {
    // Filter out the "select" column similar to the API call
    const filteredColumns = columns.filter(col => col.id !== 'select');
    
    // Get valid column IDs
    const validColumnIds = filteredColumns.map(col => col.id);
    
    // Create filtered tasks similar to the API call
    const filteredTasks = tasks.map(task => {
      const filteredTask: Record<string, any> = {};
      validColumnIds.forEach(columnId => {
        if (columnId in task) {
          filteredTask[columnId] = task[columnId];
        }
      });
      return filteredTask;
    });

    // Create the table data object
    const tableData = {
      timestamp: new Date().toISOString(),
      columns: filteredColumns.map(col => ({
        id: col.id,
        title: col.title,
        type: col.type
      })),
      tasks: filteredTasks
    };
    
    // Convert the table data to a JSON string (as it would be in the API call)
    const tableDataString = JSON.stringify(tableData, null, 2);
    
    // Count tokens in the table data
    return countTokensInText(tableDataString);
  } catch (error) {
    console.error('Error counting tokens in table data:', error);
    return 0;
  }
}

/**
 * Count tokens for the full PowerFX generation request
 * @param tasks - Array of tasks from the table
 * @param columns - Array of column definitions
 * @returns Promise resolving to the token count details
 */
export async function countGenerateTokens(tasks: Task[], columns: Column[]): Promise<TokenCount> {
  try {
    const instructionTokens = await countInstructionTokens();
    const tableTokens = await countTableDataTokens(tasks, columns);
    
    // For user message wrapper
    const userMessagePrefix = "Create a Power Apps collection in Power FX code using this table data. The collection should be optimized for use in a Power Apps canvas app. Here's the data to convert (timestamp: ";
    const wrapperTokens = await countTokensInText(userMessagePrefix);
    
    const totalInputTokens = tableTokens + wrapperTokens;
    
    return {
      inputTokens: totalInputTokens,
      instructionTokens,
      totalTokens: totalInputTokens + instructionTokens
    };
  } catch (error) {
    console.error('Error counting generate tokens:', error);
    return {
      inputTokens: 0,
      instructionTokens: 0,
      totalTokens: 0
    };
  }
}

/**
 * Count tokens for the PowerFX import request
 * @param powerFXCode - The PowerFX code to import
 * @returns Promise resolving to the token count details
 */
export async function countImportTokens(powerFXCode: string): Promise<TokenCount> {
  try {
    const instructionTokens = await countImportInstructionTokens();
    const powerFXTokens = await countTokensInText(powerFXCode);
    
    // For user message wrapper
    const userMessagePrefix = "Parse this Power FX code and convert it to JSON: ";
    const wrapperTokens = await countTokensInText(userMessagePrefix);
    
    const totalInputTokens = powerFXTokens + wrapperTokens;
    
    return {
      inputTokens: totalInputTokens,
      instructionTokens,
      totalTokens: totalInputTokens + instructionTokens
    };
  } catch (error) {
    console.error('Error counting import tokens:', error);
    return {
      inputTokens: 0,
      instructionTokens: 0,
      totalTokens: 0
    };
  }
} 