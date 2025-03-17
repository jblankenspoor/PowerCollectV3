/**
 * Claude API Proxy Edge Function
 * 
 * This Supabase Edge Function acts as a proxy for the Claude API to avoid CORS issues.
 * It forwards requests from the frontend to the Claude API and returns the responses.
 * 
 * @version 1.2.1 - Fixed authentication for Claude 3.5 Haiku
 */

// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
// The API key is stored as a secret in Supabase
const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');

// Handle CORS for local development
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check if API key is set
    if (!CLAUDE_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured. Set the CLAUDE_API_KEY secret in the Supabase dashboard.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    // Parse the request body from the frontend
    const requestData = await req.json();
    const { model, messages, system, max_tokens } = requestData;

    console.log('Proxying request to Claude API...');
    console.log('Model:', model);
    console.log('Request headers:', {
      'Content-Type': 'application/json',
      'anthropic-api-key': 'PRESENT (not showing for security)',
      'anthropic-version': '2023-01-01'
    });
    
    // Make the request to Claude API
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-01-01',
        'x-api-key': CLAUDE_API_KEY
      },
      body: JSON.stringify({
        model,
        max_tokens,
        messages,
        system
      })
    });
    
    // Get the response data
    const data = await response.json();
    
    // Return the response to the frontend
    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status
      }
    );
  } catch (error) {
    console.error('Error in Claude API proxy:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: typeof error === 'object' ? Object.getOwnPropertyNames(error).reduce((acc, key) => {
          acc[key] = (error as any)[key]?.toString();
          return acc;
        }, {} as Record<string, string>) : {}
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
