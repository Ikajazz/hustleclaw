#!/bin/bash

# Model Rotation Monitor
# Checks OpenClaw logs for rate limit errors and auto-rotates model

LOG_FILE="/tmp/openclaw/openclaw-$(date +%Y-%m-%d).log"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODEL_ROTATOR="$SCRIPT_DIR/model-rotator.js"

# Check if log file exists
if [ ! -f "$LOG_FILE" ]; then
    echo "❌ OpenClaw log not found: $LOG_FILE"
    exit 1
fi

# Monitor last 100 lines for rate limit errors
RATE_LIMIT_COUNT=$(tail -n 100 "$LOG_FILE" | grep -c "rate_limit\|HTTP 429\|API rate limit reached")

if [ "$RATE_LIMIT_COUNT" -gt 0 ]; then
    echo "⚠️ Detected $RATE_LIMIT_COUNT rate limit errors in recent logs"
    
    # Extract model name from log
    MODEL_NAME=$(tail -n 100 "$LOG_FILE" | grep -oP '(?<=requestedModel":").*?(?=")' | tail -1)
    
    if [ -n "$MODEL_NAME" ]; then
        echo "🔄 Rate limited model: $MODEL_NAME"
        node "$MODEL_ROTATOR" mark-rate-limited "$MODEL_NAME" 30
    else
        echo "🔄 Rotating to next model (model name not found in logs)"
        node "$MODEL_ROTATOR" rotate
    fi
else
    echo "✅ No rate limit errors detected"
fi
