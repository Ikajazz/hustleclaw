#!/bin/bash
# setup-gmail.sh - Configure Gmail for send-email skill

CONFIG_FILE="$HOME/.openclaw/openclaw.json"

echo "Gmail SMTP Configuration"
echo "========================"
echo ""
echo "Your email: sugengskute@gmail.com"
echo ""
read -p "Enter your Gmail App Password (16 characters): " APP_PASSWORD

# Remove spaces from password
APP_PASSWORD=$(echo "$APP_PASSWORD" | tr -d ' ')

# Backup config
cp "$CONFIG_FILE" "$CONFIG_FILE.backup-$(date +%Y%m%d-%H%M)"

# Add email config using jq
cat "$CONFIG_FILE" | jq '.skills.entries["send-email"] = {
  "enabled": true,
  "env": {
    "EMAIL_SMTP_SERVER": "smtp.gmail.com",
    "EMAIL_SMTP_PORT": "587",
    "EMAIL_SENDER": "sugengskute@gmail.com",
    "EMAIL_SMTP_PASSWORD": "'$APP_PASSWORD'"
  }
}' > "$CONFIG_FILE.tmp"

mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"

echo ""
echo "✅ Gmail configured!"
echo ""
echo "Test email:"
echo "python3 ~/.openclaw/workspace/skills/send-email/send_email.py 'sugengskute@gmail.com' 'Test' 'This is a test email from HustleClaw'"
