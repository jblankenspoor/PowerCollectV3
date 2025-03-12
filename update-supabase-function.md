# Updating the Supabase Edge Function

Since we've already updated the Edge Function code locally, there are several ways to deploy it to Supabase:

## Option 1: Using the Supabase Dashboard (Recommended)

1. Log in to the [Supabase Dashboard](https://app.supabase.io/)
2. Select your project: `lykwvupycqukyfapqdyp`
3. Navigate to "Edge Functions" in the sidebar
4. Find the `claude-api-proxy` function
5. Click on the function to view its details
6. Click "Edit" or "Deploy" to update the function
7. Either upload the `index.ts` file or copy-paste its contents into the editor
8. Save and deploy the function

## Option 2: Using the Supabase CLI (Local Installation)

```bash
# Install Supabase CLI locally to the project
npm install supabase --save-dev

# Login to Supabase (this will open a browser window)
npx supabase login

# Link to your Supabase project
npx supabase link --project-ref lykwvupycqukyfapqdyp

# Deploy the function
npx supabase functions deploy claude-api-proxy
```

## Option 3: Manual API Request

If you have access to the Supabase Management API key (not the anon key), you can use curl:

```bash
# Get your Supabase Management API key from the dashboard
# Go to Project Settings > API > Project API keys > service_role key

curl -X PUT https://api.supabase.com/v1/projects/lykwvupycqukyfapqdyp/functions/claude-api-proxy \
  -H "Authorization: Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "verify_jwt": true,
    "entrypoint_path": "./index.ts",
    "import_map": null,
    "body": "'"$(cat supabase/functions/claude-api-proxy/index.ts | base64)"'"
  }'
```

## Important Notes

1. Make sure the Claude API key is correctly set as a secret in the Supabase dashboard:
   - Go to Project Settings > API > Project Secrets
   - Add or update the secret named `CLAUDE_API_KEY` with your new Claude API key

2. After deploying, test the Edge Function to ensure it's working correctly:
   - Run the `test-claude-integration.js` script we created earlier
   - Or use the application's "Generate Power FX" feature to test the integration

3. Remember to update the JSDoc comments and version number in any files you modify, as per your coding standards.
