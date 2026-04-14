#!/bin/bash
# integrate-openclaw.sh - Integrate API rotation with OpenClaw

CONFIG_FILE="$HOME/.openclaw/openclaw.json"
WORKSPACE="/root/.openclaw/workspace"

echo "Integrating API Key Rotation with OpenClaw..."
echo ""

# Get current API key
CURRENT_KEY=$($WORKSPACE/get-current-key.sh)

if [ -z "$CURRENT_KEY" ]; then
  echo "❌ Failed to get current API key"
  exit 1
fi

echo "Current API Key: ${CURRENT_KEY:0:20}..."
echo ""

# Backup config
cp "$CONFIG_FILE" "$CONFIG_FILE.backup-$(date +%Y%m%d-%H%M)"

# Update OpenClaw config with current key
cat "$CONFIG_FILE" | jq --arg key "$CURRENT_KEY" '
  .agents.defaults.apiKey = $key |
  .agents.defaults.model = "openrouter/auto"
' > "$CONFIG_FILE.tmp"

mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"

echo "✅ OpenClaw config updated!"
echo ""
echo "Restart OpenClaw to apply changes:"
echo "  openclaw gateway restart"
echo ""
echo "To update key after rotation:"
echo "  $0"
