#!/bin/bash
# smart-rotation-strategy.sh - Intelligent key rotation based on usage

STATE_FILE="/root/.openclaw/workspace/api-state.json"
CONFIG_FILE="/root/.openclaw/workspace/api-keys.json"

# Get current key stats
CURRENT_INDEX=$(cat "$STATE_FILE" | jq -r '.currentKeyIndex')
CURRENT_KEY_ID=$(cat "$CONFIG_FILE" | jq -r ".keys[$CURRENT_INDEX].id")

# Check if current key has stats
KEY_STATS=$(cat "$STATE_FILE" | jq -r ".keyStats[\"$CURRENT_KEY_ID\"]")

if [ "$KEY_STATS" == "null" ]; then
  echo "ℹ️  No stats for current key yet. Continue using Key $CURRENT_KEY_ID"
  exit 0
fi

# Get request count and error count
REQUESTS=$(echo "$KEY_STATS" | jq -r '.requests')
ERRORS=$(echo "$KEY_STATS" | jq -r '.errors')
LAST_USED=$(echo "$KEY_STATS" | jq -r '.lastUsed')

# Calculate time since last use
if [ "$LAST_USED" != "null" ]; then
  LAST_USED_TIMESTAMP=$(date -d "$LAST_USED" +%s)
  NOW_TIMESTAMP=$(date +%s)
  HOURS_SINCE_USE=$(( ($NOW_TIMESTAMP - $LAST_USED_TIMESTAMP) / 3600 ))
else
  HOURS_SINCE_USE=999
fi

echo "📊 Current Key Stats:"
echo "   Key: $CURRENT_KEY_ID"
echo "   Requests: $REQUESTS"
echo "   Errors: $ERRORS"
echo "   Hours since last use: $HOURS_SINCE_USE"

# Decision logic
SHOULD_ROTATE=false
REASON=""

# Rule 1: High error rate (>10%)
if [ "$REQUESTS" -gt 10 ]; then
  ERROR_RATE=$(( $ERRORS * 100 / $REQUESTS ))
  if [ "$ERROR_RATE" -gt 10 ]; then
    SHOULD_ROTATE=true
    REASON="High error rate ($ERROR_RATE%)"
  fi
fi

# Rule 2: Too many requests (approaching limit)
if [ "$REQUESTS" -gt 150 ]; then
  SHOULD_ROTATE=true
  REASON="Approaching rate limit ($REQUESTS requests)"
fi

# Rule 3: Recent errors
LAST_ERROR=$(echo "$KEY_STATS" | jq -r '.lastError')
if [ "$LAST_ERROR" != "null" ]; then
  LAST_ERROR_TIMESTAMP=$(date -d "$LAST_ERROR" +%s)
  NOW_TIMESTAMP=$(date +%s)
  MINUTES_SINCE_ERROR=$(( ($NOW_TIMESTAMP - $LAST_ERROR_TIMESTAMP) / 60 ))
  
  if [ "$MINUTES_SINCE_ERROR" -lt 5 ]; then
    SHOULD_ROTATE=true
    REASON="Recent error ($MINUTES_SINCE_ERROR minutes ago)"
  fi
fi

# Rule 4: Key has rested for 24+ hours (prefer rested keys)
if [ "$HOURS_SINCE_USE" -ge 24 ]; then
  echo "✅ Current key has rested for $HOURS_SINCE_USE hours. Good to use!"
  exit 0
fi

# Execute rotation if needed
if [ "$SHOULD_ROTATE" = true ]; then
  echo "🔄 Rotating key: $REASON"
  /root/.openclaw/workspace/rotate-key.sh
else
  echo "✅ Current key is healthy. No rotation needed."
fi
