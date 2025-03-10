/**
 * Test script for the Claude API integration
 * 
 * This script tests both the direct Claude API access and the Supabase Edge Function
 * to verify that the authentication issues have been resolved.
 * 
 * @version 1.0.0
 * @date 2025-03-10
 */

// Load environment variables
require('dotenv').config();

// Get Claude API key from environment variable
const CLAUDE_API_KEY = process.env.VITE_CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Supabase credentials
const SUPABASE_API_KEY = process.env.VITE_SUPABASE_API_KEY;
const SUPABASE_FUNCTION_URL = 'https://lykwvupycqukyfapqdyp.supabase.co/functions/v1/claude-api-proxy';

// Import fetch for Node.js environment
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

/**
 * Test direct Claude API access
 */
async function testDirectClaudeAPI() {
  console.log('Testing direct Claude API access...');
  
  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: 'Hello, can you confirm that you are Claude and that this API connection is working?'
          }
        ]
      })
    });
    
    const data = await response.json();
    
    if (response.status === 200 && data.content && data.content.length > 0) {
      console.log('✅ Direct Claude API test successful!');
      console.log('Response status:', response.status);
      console.log('Response content:', data.content[0].text);
      return true;
    } else {
      console.error('❌ Direct Claude API test failed');
      console.error('Response status:', response.status);
      console.error('Response data:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing direct Claude API:', error.message);
    return false;
  }
}

/**
 * Test Supabase Edge Function
 */
async function testSupabaseEdgeFunction() {
  console.log('\nTesting Supabase Edge Function...');
  
  try {
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: 'Hello, can you confirm that you are Claude and that this Supabase Edge Function is working?'
          }
        ]
      })
    });
    
    const data = await response.json();
    
    if (response.status === 200 && data.content && data.content.length > 0) {
      console.log('✅ Supabase Edge Function test successful!');
      console.log('Response status:', response.status);
      console.log('Response content:', data.content[0].text);
      return true;
    } else {
      console.error('❌ Supabase Edge Function test failed');
      console.error('Response status:', response.status);
      console.error('Response data:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing Supabase Edge Function:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('==============================================');
  console.log('Claude API Integration Test');
  console.log('==============================================');
  console.log('API Key:', CLAUDE_API_KEY ? 'Present (not showing for security)' : 'Missing');
  console.log('Supabase API Key:', SUPABASE_API_KEY ? 'Present (not showing for security)' : 'Missing');
  console.log('Model: claude-3-haiku-20240307');
  console.log('==============================================\n');
  
  const directApiResult = await testDirectClaudeAPI();
  const edgeFunctionResult = await testSupabaseEdgeFunction();
  
  console.log('\n==============================================');
  console.log('Test Results Summary');
  console.log('==============================================');
  console.log('Direct Claude API:', directApiResult ? '✅ Working' : '❌ Failed');
  console.log('Supabase Edge Function:', edgeFunctionResult ? '✅ Working' : '❌ Failed');
  console.log('==============================================');
  
  if (directApiResult && edgeFunctionResult) {
    console.log('\n🎉 All tests passed! The Claude API integration is fully functional.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the error messages above.');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error:', error);
});
