/**
 * Mock Service Worker handlers for API requests in tests
 * @module handlers
 */
import { http, HttpResponse } from 'msw';

/**
 * Interface for Claude API request message
 */
interface ClaudeMessage {
  role: string;
  content: string;
}

/**
 * Interface for Claude API request body
 */
interface ClaudeRequestBody {
  model: string;
  max_tokens?: number;
  temperature?: number;
  messages: ClaudeMessage[];
  system?: string;
  useOnlyCurrentTitles?: boolean;
}

/**
 * Mock handlers for API requests
 * These handlers intercept API requests during tests and return mock responses
 */
export const handlers = [
  // Handle Claude API requests via Supabase
  http.post('https://api.supabase.co/functions/v1/claudeapi', async ({ request }) => {
    try {
      // Parse the request body
      const body = await request.json() as ClaudeRequestBody;
      const { model, messages } = body;

      // Get the API key from the headers
      const apiKey = request.headers.get('apikey');
      
      // Check if API key is missing or invalid
      if (!apiKey || apiKey === 'invalid-key') {
        return new HttpResponse(
          JSON.stringify({
            error: 'Unauthorized',
            message: 'Invalid or missing API key'
          }),
          { status: 401 }
        );
      }

      // Check if model is specified and valid
      if (!model) {
        return new HttpResponse(
          JSON.stringify({
            error: 'Bad Request',
            message: 'Model parameter is required'
          }),
          { status: 400 }
        );
      }

      // Simulate token limit errors for the 'haiku' model with large datasets
      const messageContent = messages[0]?.content || '';
      if (
        model === 'claude-3-5-haiku-20241022' && 
        (messageContent.includes('large-dataset') || messageContent.endsWith('large-dataset'))
      ) {
        return new HttpResponse(
          JSON.stringify({
            content: [{ 
              text: 'ERROR-TOO-LARGE: The provided content exceeds the token limit for this model.' 
            }],
            message: 'Token limit exceeded',
            model: model
          }),
          { status: 413 }
        );
      }

      // Return different responses based on the API call type
      if (messageContent.includes('Convert it to PowerFX') || messageContent.includes('Power Apps collection')) {
        // PowerFX generation response
        return new HttpResponse(
          JSON.stringify({
            content: [{ 
              text: `// PowerCollect data collection
ClearCollect(
  PowerCollectData,
  [
    {
      ID: 1,
      Title: "Task 1",
      Status: "In Progress",
      Priority: "High",
      "Start Date": Date(2023, 5, 15),
      Deadline: Date(2023, 5, 30)
    }
  ]
);` 
            }],
            usage: {
              input_tokens: 1000,
              output_tokens: 500,
              total_tokens: 1500
            },
            model: model
          }),
          { status: 200 }
        );
      } else if (messageContent.includes('Parse this Power FX code')) {
        // PowerFX parsing response
        return new HttpResponse(
          JSON.stringify({
            content: [{ 
              text: JSON.stringify({
                columns: [
                  { id: 'ID', title: 'ID', type: 'text' },
                  { id: 'Title', title: 'Title', type: 'text' },
                  { id: 'Status', title: 'Status', type: 'text' },
                  { id: 'Priority', title: 'Priority', type: 'text' },
                  { id: 'Start_Date', title: 'Start Date', type: 'date' },
                  { id: 'Deadline', title: 'Deadline', type: 'date' }
                ],
                tasks: [
                  {
                    id: '1',
                    ID: '1',
                    Title: 'Task 1',
                    Status: 'In Progress',
                    Priority: 'High',
                    Start_Date: '2023-05-15',
                    Deadline: '2023-05-30'
                  }
                ]
              })
            }],
            usage: {
              input_tokens: 800,
              output_tokens: 600,
              total_tokens: 1400
            },
            model: model
          }),
          { status: 200 }
        );
      } else {
        // Generic response
        return new HttpResponse(
          JSON.stringify({
            content: [{ text: 'Mock response from Claude API' }],
            usage: {
              input_tokens: 500,
              output_tokens: 300,
              total_tokens: 800
            },
            model: model
          }),
          { status: 200 }
        );
      }
    } catch (error) {
      console.error('Error in Claude API mock handler:', error);
      return new HttpResponse(
        JSON.stringify({
          error: 'Internal Server Error',
          message: 'An error occurred processing the request'
        }),
        { status: 500 }
      );
    }
  })
]; 