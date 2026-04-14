#!/bin/bash
# get-current-key.sh - Get current API key from rotator

CONFIG_FILE="/root/.openclaw/workspace/api-keys.json"
STATE_FILE="/root/.openclaw/workspace/api-state.json"

# Get current index
CURRENT_INDEX=$(cat "$STATE_FILE" | jq -r '.currentKeyIndex')

# Get key at current index
CURRENT_KEY=$(cat "$CONFIG_FILE" | jq -r ".keys[$CURRENT_INDEX].key")

echo "$CURRENT_KEY"
