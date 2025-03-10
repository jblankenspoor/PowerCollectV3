#!/bin/bash

# Deployment script for Claude API Edge Function
# This script creates a deployment package for the Claude API Edge Function

# Backup the .env file
cp .env .env.backup

# Configuration
FUNCTION_NAME="claude-api-proxy"
FUNCTION_DIR="./supabase/functions/${FUNCTION_NAME}"
FUNCTION_FILE="${FUNCTION_DIR}/index.ts"
DEPLOY_DIR="./deploy"
DEPLOY_FILE="${DEPLOY_DIR}/${FUNCTION_NAME}.ts"
# Get Claude API key from environment variable
CLAUDE_API_KEY="${VITE_CLAUDE_API_KEY}"

# Create deploy directory if it doesn't exist
mkdir -p "${DEPLOY_DIR}"

# Print header
echo "========================================"
echo "Claude API Edge Function Deployment Tool"
echo "========================================"
echo "Function name: ${FUNCTION_NAME}"
echo "Function file: ${FUNCTION_FILE}"
echo "Deploy directory: ${DEPLOY_DIR}"
echo "========================================"

# Check if function file exists
if [ ! -f "${FUNCTION_FILE}" ]; then
  echo "Error: Function file ${FUNCTION_FILE} does not exist."
  exit 1
fi

# Copy function file to deploy directory
cp "${FUNCTION_FILE}" "${DEPLOY_FILE}"
echo "✅ Function file copied to ${DEPLOY_FILE}"

# Create README.md with deployment instructions
cat > "${DEPLOY_DIR}/README.md" << EOL
# Claude API Edge Function Deployment

This package contains the Claude API Edge Function for Supabase.

## Deployment Instructions

### 1. Log in to Supabase
- Go to [Supabase Dashboard](https://app.supabase.io/)
- Select your project: \`lykwvupycqukyfapqdyp\`

### 2. Navigate to Edge Functions
- Go to "Edge Functions" in the sidebar

### 3. Create a New Function
- Click "Create a new function"
- Name it \`${FUNCTION_NAME}\`
- Click "Create function"

### 4. Deploy the Function
- Copy the contents of \`${FUNCTION_NAME}.ts\` in this directory.
- Paste it into the function editor in the Supabase Dashboard.
- Click "Deploy" or "Save".

### 5. Set the Secret
- Go to Project Settings > API > Project Secrets.
- Add or update the secret named \`CLAUDE_API_KEY\` with your Claude API key.
- Use the API key from your .env file (VITE_CLAUDE_API_KEY)

### 6. Test the Function
After deployment, test the function using the test script:
\`\`\`bash
node test-claude-integration.js
\`\`\`

## Troubleshooting
If you encounter any issues, check:
1. The Claude API key is correctly set as a secret.
2. The function is deployed successfully.
3. The function has the correct permissions.

## Version History
- 1.0.0 (2025-03-10): Initial deployment
- 1.0.1 (2025-03-10): Updated authentication method from Bearer token to x-api-key
EOL

echo "✅ README.md created with deployment instructions"

# Create an HTML viewer for the function code
cat > "${DEPLOY_DIR}/view-function.html" << EOL
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Claude API Edge Function Code</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2a2a72;
    }
    pre {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      border: 1px solid #ddd;
    }
    code {
      font-family: 'Courier New', Courier, monospace;
    }
    .instructions {
      background-color: #e6f7ff;
      padding: 15px;
      border-radius: 5px;
      border-left: 5px solid #1890ff;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <h1>Claude API Edge Function Code</h1>
  
  <div class="instructions">
    <h2>Deployment Instructions</h2>
    <p>Copy the code below and paste it into the Supabase Edge Function editor.</p>
    <p>For detailed instructions, see the README.md file in this directory.</p>
  </div>

  <h2>Function Code</h2>
  <pre><code id="functionCode"></code></pre>

  <script>
    // Load and display the function code
    fetch('${FUNCTION_NAME}.ts')
      .then(response => response.text())
      .then(code => {
        document.getElementById('functionCode').textContent = code;
      })
      .catch(error => {
        document.getElementById('functionCode').textContent = 'Error loading function code: ' + error.message;
      });
  </script>
</body>
</html>
EOL

echo "✅ HTML viewer created for easy access to function code"

# Create a text file with the function code for easy copying
cat "${FUNCTION_FILE}" > "${DEPLOY_DIR}/function-code.txt"
echo "✅ Text file created with function code"

# Create a deployment package
echo "Creating deployment package..."
cd "${DEPLOY_DIR}" && zip -r "../${FUNCTION_NAME}-deployment.zip" ./*
cd ..

echo "✅ Deployment package created: ${FUNCTION_NAME}-deployment.zip"
echo ""
echo "========================================"
echo "Deployment package created successfully!"
echo "========================================"
echo "To deploy the function:"
echo "1. Extract the ${FUNCTION_NAME}-deployment.zip file"
echo "2. Follow the instructions in README.md"
echo "3. Test the function using the test script"
echo "========================================"
