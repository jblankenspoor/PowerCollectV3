/**
 * Supabase Edge Function Deployment Script
 * 
 * This script deploys the updated Claude API proxy Edge Function to Supabase
 * using the Supabase Management API.
 * 
 * @version 1.0.0
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
  
  // Prepare the request options
  const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${PROJECT_REF}/functions/${FUNCTION_NAME}`,
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
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Error deploying Edge Function:', error);
  });
  
  // Send the request with the function code
  const requestBody = JSON.stringify({
    verify_jwt: true,
    import_map: null,
    entrypoint_path: './index.ts',
    body: functionCode
  });
  
  req.write(requestBody);
  req.end();
}

// Run the deployment
deployFunction();
