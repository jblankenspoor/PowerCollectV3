/**
 * Supabase Edge Function Deployment Script
 * 
 * This script deploys the updated Claude API proxy Edge Function to Supabase
 * using the Supabase Management API.
 * 
 * @version 1.0.1 - Updated API endpoints based on Supabase documentation
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const SUPABASE_MANAGEMENT_TOKEN = 'sbp_38674129cb8aff4e3627bc8ebf3ce4a0c39afafb';
const PROJECT_REF = 'lykwvupycqukyfapqdyp';
const FUNCTION_NAME = 'claude-api-proxy';
const FUNCTION_FILE_PATH = path.join(__dirname, 'supabase', 'functions', FUNCTION_NAME, 'index.ts');

/**
 * Read the Edge Function code
 * @returns {string} The Edge Function code
 */
function readFunctionCode() {
  try {
    return fs.readFileSync(FUNCTION_FILE_PATH, 'utf8');
  } catch (error) {
    console.error('Error reading function file:', error);
    process.exit(1);
  }
}

/**
 * Deploy the Edge Function to Supabase
 */
async function deployFunction() {
  console.log('Starting Edge Function deployment...');
  console.log(`Project: ${PROJECT_REF}`);
  console.log(`Function: ${FUNCTION_NAME}`);
  
  const functionCode = readFunctionCode();
  console.log(`Function code loaded (${functionCode.length} bytes)`);
  
  // Prepare the request options for creating/updating the function
  const options = {
    hostname: 'api.supabase.com',
    path: `/platform/projects/${PROJECT_REF}/functions/${FUNCTION_NAME}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_MANAGEMENT_TOKEN}`
    }
  };
  
  // Make the request
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('✅ Edge Function deployed successfully!');
        try {
          const responseData = JSON.parse(data);
          console.log('Response:', JSON.stringify(responseData, null, 2));
        } catch (error) {
          console.log('Response:', data);
        }
      } else {
        console.error(`❌ Deployment failed with status code: ${res.statusCode}`);
        console.error('Response:', data);
        
        // If function doesn't exist, try to create it
        if (res.statusCode === 404) {
          console.log('Function not found. Attempting to create it...');
          createFunction();
        }
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Error deploying Edge Function:', error);
  });
  
  // Send the request with the function code
  const requestBody = JSON.stringify({
    verify_jwt: true,
    slug: FUNCTION_NAME,
    name: FUNCTION_NAME,
    import_map: null,
    entrypoint_path: './index.ts',
    body: functionCode
  });
  
  req.write(requestBody);
  req.end();
}

/**
 * Create a new Edge Function
 */
function createFunction() {
  const functionCode = readFunctionCode();
  
  // Prepare the request options for creating a new function
  const options = {
    hostname: 'api.supabase.com',
    path: `/platform/projects/${PROJECT_REF}/functions`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_MANAGEMENT_TOKEN}`
    }
  };
  
  // Make the request
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('✅ Edge Function created successfully!');
        try {
          const responseData = JSON.parse(data);
          console.log('Response:', JSON.stringify(responseData, null, 2));
        } catch (error) {
          console.log('Response:', data);
        }
      } else {
        console.error(`❌ Function creation failed with status code: ${res.statusCode}`);
        console.error('Response:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Error creating Edge Function:', error);
  });
  
  // Send the request with the function code
  const requestBody = JSON.stringify({
    verify_jwt: true,
    slug: FUNCTION_NAME,
    name: FUNCTION_NAME,
    import_map: null,
    entrypoint_path: './index.ts',
    body: functionCode
  });
  
  req.write(requestBody);
  req.end();
}

// Run the deployment
deployFunction();
