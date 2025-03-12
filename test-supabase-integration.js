/**
 * Test script for Supabase Edge Function integration
 * 
 * This script tests if the Supabase Edge Function is properly configured
 * with the updated Claude API key.
 * 
 * @version 1.0.0
 */

const SUPABASE_FUNCTION_URL = 'https://lykwvupycqukyfapqdyp.supabase.co/functions/v1/claude-api-proxy';
const SUPABASE_API_KEY = process.env.VITE_SUPABASE_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5a3d2dXB5Y3F1a3lmYXBxZHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MzQzOTksImV4cCI6MjA1NzIxMDM5OX0.wZKCkDIzfk9VWRGsKvzB__iIu8OLmvTC4KK_HCP8LjM';

async function testSupabaseIntegration() {
  console.log('Testing Supabase Edge Function integration...');
  console.log('Using Supabase API Key:', SUPABASE_API_KEY.substring(0, 10) + '...');
  
  try {
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_API_KEY,
        'Authorization': `Bearer ${SUPABASE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: 'Say hello'
          }
        ],
        system: 'You are a helpful assistant.'
      })
    });
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    
    try {
      const data = JSON.parse(responseText);
      
      if (response.ok) {
        console.log('Supabase Edge Function is working! Response:', JSON.stringify(data, null, 2));
      } else {
        console.error('Supabase Edge Function test failed:', data);
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      console.log('Raw response:', responseText);
    }
  } catch (error) {
    console.error('Error testing Supabase Edge Function:', error);
  }
}

testSupabaseIntegration();
