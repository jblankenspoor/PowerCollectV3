#!/bin/bash

# Supabase Edge Function Deployment Script
# This script deploys the updated Claude API proxy Edge Function to Supabase
# using the Supabase Management API via curl.
#
# @version 1.0.0

# Configuration
SUPABASE_MANAGEMENT_TOKEN="sbp_38674129cb8aff4e3627bc8ebf3ce4a0c39afafb"
PROJECT_REF="lykwvupycqukyfapqdyp"
FUNCTION_NAME="claude-api-proxy"
FUNCTION_FILE_PATH="./supabase/functions/${FUNCTION_NAME}/index.ts"

echo "Starting Edge Function deployment..."
echo "Project: ${PROJECT_REF}"
echo "Function: ${FUNCTION_NAME}"

# Check if function file exists
if [ ! -f "$FUNCTION_FILE_PATH" ]; then
  echo "❌ Error: Function file not found at ${FUNCTION_FILE_PATH}"
  exit 1
fi

echo "Function file found at ${FUNCTION_FILE_PATH}"

# Encode function code to base64
FUNCTION_CODE=$(cat "$FUNCTION_FILE_PATH" | base64)
echo "Function code encoded ($(echo $FUNCTION_CODE | wc -c) bytes)"

# Try to update the function
echo "Attempting to update the function..."
UPDATE_RESPONSE=$(curl -s -X PUT "https://api.supabase.com/platform/projects/${PROJECT_REF}/functions/${FUNCTION_NAME}" \
  -H "Authorization: Bearer ${SUPABASE_MANAGEMENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"verify_jwt\": true,
    \"slug\": \"${FUNCTION_NAME}\",
    \"name\": \"${FUNCTION_NAME}\",
    \"entrypoint_path\": \"./index.ts\",
    \"body\": \"$(cat ${FUNCTION_FILE_PATH})\"
  }")

echo "Update response: ${UPDATE_RESPONSE}"

# Check if the update was successful
if [[ "$UPDATE_RESPONSE" == *"error"* || "$UPDATE_RESPONSE" == *"message"* ]]; then
  echo "❌ Function update failed. Attempting to create it..."
  
  # Try to create the function
  CREATE_RESPONSE=$(curl -s -X POST "https://api.supabase.com/platform/projects/${PROJECT_REF}/functions" \
    -H "Authorization: Bearer ${SUPABASE_MANAGEMENT_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"verify_jwt\": true,
      \"slug\": \"${FUNCTION_NAME}\",
      \"name\": \"${FUNCTION_NAME}\",
      \"entrypoint_path\": \"./index.ts\",
      \"body\": \"$(cat ${FUNCTION_FILE_PATH})\"
    }")
  
  echo "Create response: ${CREATE_RESPONSE}"
  
  # Check if the creation was successful
  if [[ "$CREATE_RESPONSE" == *"error"* || "$CREATE_RESPONSE" == *"message"* ]]; then
    echo "❌ Function creation also failed."
    echo "Please update the function manually through the Supabase Dashboard."
  else
    echo "✅ Function created successfully!"
  fi
else
  echo "✅ Function updated successfully!"
fi

echo "Deployment process completed."
