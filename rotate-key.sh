#!/bin/bash
# rotate-key.sh - Rotate to next API key

CONFIG_FILE="/root/.openclaw/workspace/api-keys.json"
STATE_FILE="/root/.openclaw/workspace/api-state.json"
LOG_FILE="/root/.openclaw/workspace/api-rotator.log"

# Get current state
CURRENT_INDEX=$(cat "$STATE_FILE" | jq -r '.currentKeyIndex')
TOTAL_KEYS=$(cat "$CONFIG_FILE" | jq '.keys | length')

# Calculate next index
NEXT_INDEX=$(( ($CURRENT_INDEX + 1) % $TOTAL_KEYS ))

# Get key names
OLD_KEY_NAME=$(cat "$CONFIG_FILE" | jq -r ".keys[$CURRENT_INDEX].name")
NEW_KEY_NAME=$(cat "$CONFIG_FILE" | jq -r ".keys[$NEXT_INDEX].name")

# Update state
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
cat "$STATE_FILE" | jq ".currentKeyIndex = $NEXT_INDEX | .lastRotation = \"$TIMESTAMP\"" > "$STATE_FILE.tmp"
mv "$STATE_FILE.tmp" "$STATE_FILE"

# Log
echo "[$TIMESTAMP] Rotated from $OLD_KEY_NAME to $NEW_KEY_NAME" >> "$LOG_FILE"
echo "🔄 Rotated: $OLD_KEY_NAME → $NEW_KEY_NAME"
