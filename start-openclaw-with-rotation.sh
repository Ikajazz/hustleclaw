#!/bin/bash
# start-openclaw-with-rotation.sh - Start OpenClaw with API key rotation

WORKSPACE="/root/.openclaw/workspace"

# Get current API key
export OPENROUTER_API_KEY=$($WORKSPACE/get-current-key.sh)

echo "Starting OpenClaw with rotated API key..."
echo "Current key: ${OPENROUTER_API_KEY:0:20}..."

# Start OpenClaw gateway
openclaw gateway start
