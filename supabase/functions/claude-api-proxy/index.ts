/**
 * Claude API Proxy Edge Function
 * 
 * This function acts as a proxy for the Claude API, handling CORS issues and forwarding requests.
 * It uses the anthropic-api-key authentication method for the Claude API.
 * 
 * @version 1.1.1 - Fixed authentication for Claude 3.5 Haiku
 * @date 2025-03-17
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Claude API endpoint
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Main handler function for the Edge Function
 * Processes incoming requests and forwards them to the Claude API
 * 
 * @param req - The incoming request object
 * @returns Response object with the Claude API response or error message
 */
serve(async (req) => {
  // Set up CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Claude API key from environment variable
    const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
    
    if (!CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY environment variable not set');
    }

    // Parse the request body
    const requestData = await req.json();
    console.log('Request data:', JSON.stringify(requestData, null, 2));

    // Forward the request to the Claude API
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-01-01',
        'x-api-key': CLAUDE_API_KEY
      },
      body: JSON.stringify(requestData)
    });

    // Get the response data
    const responseData = await response.json();
    console.log('Response status:', response.status);
    
    // Return the response with CORS headers
    return new Response(JSON.stringify(responseData), {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in Claude API proxy:', error.message);
    
    // Return error response with CORS headers
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
