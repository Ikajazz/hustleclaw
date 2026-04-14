#!/bin/bash
# track-request.sh - Track API request

STATE_FILE="/root/.openclaw/workspace/api-state.json"
CONFIG_FILE="/root/.openclaw/workspace/api-keys.json"

# Get current key
CURRENT_INDEX=$(cat "$STATE_FILE" | jq -r '.currentKeyIndex')
CURRENT_KEY_ID=$(cat "$CONFIG_FILE" | jq -r ".keys[$CURRENT_INDEX].id")

# Update stats
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

# Initialize stats if not exist
if [ "$(cat "$STATE_FILE" | jq -r ".keyStats[\"$CURRENT_KEY_ID\"]")" == "null" ]; then
  cat "$STATE_FILE" | jq ".keyStats[\"$CURRENT_KEY_ID\"] = {\"requests\": 0, \"errors\": 0, \"lastUsed\": null, \"lastError\": null}" > "$STATE_FILE.tmp"
  mv "$STATE_FILE.tmp" "$STATE_FILE"
fi

# Increment request count
cat "$STATE_FILE" | jq ".keyStats[\"$CURRENT_KEY_ID\"].requests += 1 | .keyStats[\"$CURRENT_KEY_ID\"].lastUsed = \"$TIMESTAMP\" | .totalRequests += 1" > "$STATE_FILE.tmp"
mv "$STATE_FILE.tmp" "$STATE_FILE"

# Check if rotation needed after this request
/root/.openclaw/workspace/smart-rotation-strategy.sh > /dev/null 2>&1
