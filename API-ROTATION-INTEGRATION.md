# OpenRouter API Key Rotation - Integration dengan OpenClaw

**Status:** ✅ 10 API keys configured & tested
**Location:** `/root/.openclaw/workspace/`

---

## 📁 Files

- `api-keys.json` - Config dengan 10 API keys
- `api-state.json` - State tracking (current index, stats)
- `get-current-key.sh` - Helper: get current active key
- `rotate-key.sh` - Helper: rotate to next key
- `api-rotator.log` - Rotation logs
- `openrouter-rotator.js` - Advanced rotator (Node.js)

---

## 🚀 Quick Start

### 1. Get Current Key
```bash
/root/.openclaw/workspace/get-current-key.sh
```

Output:
```
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
```

### 2. Rotate to Next Key
```bash
/root/.openclaw/workspace/rotate-key.sh
```

Output:
```
🔄 Rotated: Account 1 → Account 2
```

### 3. Check Logs
```bash
tail -f /root/.openclaw/workspace/api-rotator.log
```

---

## 🔧 Integration Methods

### Method 1: Environment Variable (Recommended)

**Set current key as env var:**
```bash
export OPENROUTER_API_KEY=$(/root/.openclaw/workspace/get-current-key.sh)
```

**Add to OpenClaw config:**
```bash
# Edit ~/.openclaw/config.yml or /etc/openclaw/config.yml
nano ~/.openclaw/config.yml
```

Add:
```yaml
agents:
  defaults:
    model: openrouter/auto
    apiKey: ${OPENROUTER_API_KEY}
```

**Restart OpenClaw:**
```bash
openclaw gateway restart
```

---

### Method 2: Auto-Rotate via Cron

**Setup cron job untuk rotate setiap jam:**
```bash
crontab -e
```

Add:
```bash
# Rotate OpenRouter API key every hour
0 * * * * /root/.openclaw/workspace/rotate-key.sh >> /var/log/api-rotation.log 2>&1

# Update OpenClaw env var after rotation
5 * * * * export OPENROUTER_API_KEY=$(/root/.openclaw/workspace/get-current-key.sh) && openclaw gateway restart >> /var/log/openclaw-restart.log 2>&1
```

**Note:** Restart OpenClaw setiap jam mungkin disruptive. Alternatif: rotate manual saat rate limit.

---

### Method 3: Wrapper Script (No Restart)

Buat wrapper untuk OpenClaw yang auto-inject current key:

```bash
nano /usr/local/bin/openclaw-rotated
```

Content:
```bash
#!/bin/bash
# openclaw-rotated - OpenClaw with API key rotation

# Get current key
export OPENROUTER_API_KEY=$(/root/.openclaw/workspace/get-current-key.sh)

# Run OpenClaw with rotated key
openclaw "$@"
```

Make executable:
```bash
chmod +x /usr/local/bin/openclaw-rotated
```

**Usage:**
```bash
openclaw-rotated gateway start
openclaw-rotated status
```

---

### Method 4: Systemd Service (Production)

**Create systemd service dengan auto-rotation:**

```bash
sudo nano /etc/systemd/system/openclaw-rotated.service
```

Content:
```ini
[Unit]
Description=OpenClaw with API Key Rotation
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/.openclaw/workspace
ExecStartPre=/root/.openclaw/workspace/get-current-key.sh
ExecStart=/bin/bash -c 'export OPENROUTER_API_KEY=$(/root/.openclaw/workspace/get-current-key.sh) && openclaw gateway start'
Restart=on-failure
RestartSec=10

# Rotate key every hour
ExecReload=/root/.openclaw/workspace/rotate-key.sh
# Reload service every hour to pick up new key
# Add to cron: 0 * * * * systemctl reload openclaw-rotated

[Install]
WantedBy=multi-user.target
```

**Enable & start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable openclaw-rotated
sudo systemctl start openclaw-rotated
```

**Add cron for hourly reload:**
```bash
crontab -e

# Reload OpenClaw service every hour (picks up rotated key)
0 * * * * systemctl reload openclaw-rotated
```

---

## 🔥 Handle Rate Limit (429) Automatically

### Option A: Detect & Rotate on Error

**Create monitoring script:**

```bash
nano /root/.openclaw/workspace/monitor-rate-limit.sh
```

Content:
```bash
#!/bin/bash
# monitor-rate-limit.sh - Monitor OpenClaw logs for rate limit errors

LOG_FILE="/var/log/openclaw/gateway.log"
LAST_CHECK="/tmp/rate-limit-last-check"

# Get timestamp of last check
if [ -f "$LAST_CHECK" ]; then
  LAST_TIME=$(cat "$LAST_CHECK")
else
  LAST_TIME=$(date -d "1 hour ago" +%s)
fi

# Check for rate limit errors since last check
RATE_LIMIT_COUNT=$(journalctl -u openclaw --since "@$LAST_TIME" | grep -c "429\|rate limit\|too many requests")

if [ "$RATE_LIMIT_COUNT" -gt 0 ]; then
  echo "⚠️  Rate limit detected ($RATE_LIMIT_COUNT occurrences). Rotating key..."
  /root/.openclaw/workspace/rotate-key.sh
  
  # Restart OpenClaw to pick up new key
  systemctl restart openclaw-rotated
  
  echo "✅ Key rotated and service restarted"
fi

# Update last check timestamp
date +%s > "$LAST_CHECK"
```

Make executable:
```bash
chmod +x /root/.openclaw/workspace/monitor-rate-limit.sh
```

**Add to cron (check every 5 minutes):**
```bash
crontab -e

# Monitor for rate limit and auto-rotate
*/5 * * * * /root/.openclaw/workspace/monitor-rate-limit.sh >> /var/log/rate-limit-monitor.log 2>&1
```

---

### Option B: Pre-emptive Rotation (Before Rate Limit)

**Rotate based on request count:**

```bash
nano /root/.openclaw/workspace/smart-rotate.sh
```

Content:
```bash
#!/bin/bash
# smart-rotate.sh - Rotate key after N requests

STATE_FILE="/root/.openclaw/workspace/api-state.json"
MAX_REQUESTS_PER_KEY=100  # Rotate after 100 requests

# Get current request count
CURRENT_REQUESTS=$(cat "$STATE_FILE" | jq -r '.totalRequests')

if [ "$CURRENT_REQUESTS" -ge "$MAX_REQUESTS_PER_KEY" ]; then
  echo "🔄 Reached $MAX_REQUESTS_PER_KEY requests. Rotating key..."
  /root/.openclaw/workspace/rotate-key.sh
  
  # Reset counter
  cat "$STATE_FILE" | jq '.totalRequests = 0' > "$STATE_FILE.tmp"
  mv "$STATE_FILE.tmp" "$STATE_FILE"
  
  echo "✅ Key rotated and counter reset"
fi
```

Make executable:
```bash
chmod +x /root/.openclaw/workspace/smart-rotate.sh
```

**Add to cron (check every 10 minutes):**
```bash
crontab -e

# Smart rotation based on request count
*/10 * * * * /root/.openclaw/workspace/smart-rotate.sh >> /var/log/smart-rotate.log 2>&1
```

---

## 📊 Monitoring & Statistics

### View Current Status

```bash
cat /root/.openclaw/workspace/api-state.json | jq
```

Output:
```json
{
  "currentKeyIndex": 2,
  "keyStats": {
    "1": {
      "requests": 150,
      "errors": 2,
      "lastUsed": "2026-04-13T17:30:00.000Z"
    },
    "2": {
      "requests": 145,
      "errors": 1,
      "lastUsed": "2026-04-13T18:15:00.000Z"
    }
  },
  "lastRotation": "2026-04-13T19:00:00.000Z",
  "totalRequests": 295,
  "totalErrors": 3
}
```

### View Rotation History

```bash
tail -20 /root/.openclaw/workspace/api-rotator.log
```

### Dashboard Script

```bash
nano /root/.openclaw/workspace/dashboard.sh
```

Content:
```bash
#!/bin/bash
# dashboard.sh - Show API rotation dashboard

clear
echo "╔════════════════════════════════════════════════════════╗"
echo "║     OpenRouter API Key Rotation Dashboard             ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Current key
CURRENT_INDEX=$(cat api-state.json | jq -r '.currentKeyIndex')
CURRENT_KEY_NAME=$(cat api-keys.json | jq -r ".keys[$CURRENT_INDEX].name")
echo "📍 Current Key: $CURRENT_KEY_NAME (Index: $CURRENT_INDEX)"
echo ""

# Stats
TOTAL_REQUESTS=$(cat api-state.json | jq -r '.totalRequests')
TOTAL_ERRORS=$(cat api-state.json | jq -r '.totalErrors')
LAST_ROTATION=$(cat api-state.json | jq -r '.lastRotation')
echo "📊 Statistics:"
echo "   Total Requests: $TOTAL_REQUESTS"
echo "   Total Errors: $TOTAL_ERRORS"
echo "   Last Rotation: $LAST_ROTATION"
echo ""

# Key list
echo "🔑 Available Keys:"
cat api-keys.json | jq -r '.keys[] | "   [\(.id)] \(.name) - \(if .active then "✅ Active" else "❌ Inactive" end)"'
echo ""

# Recent rotations
echo "📜 Recent Rotations (last 5):"
tail -5 api-rotator.log | sed 's/^/   /'
echo ""
```

Make executable:
```bash
chmod +x /root/.openclaw/workspace/dashboard.sh
```

**Run dashboard:**
```bash
cd /root/.openclaw/workspace && ./dashboard.sh
```

---

## 🛠️ Maintenance

### Add New Key

```bash
nano /root/.openclaw/workspace/api-keys.json
```

Add to `keys` array:
```json
{
  "id": 11,
  "key": "sk-or-v1-new-key-here",
  "name": "Account 11",
  "active": true
}
```

### Disable Exhausted Key

```bash
nano /root/.openclaw/workspace/api-keys.json
```

Set `active: false`:
```json
{
  "id": 5,
  "key": "sk-or-v1-...",
  "name": "Account 5",
  "active": false
}
```

### Reset Statistics

```bash
cat > /root/.openclaw/workspace/api-state.json << EOF
{
  "currentKeyIndex": 0,
  "keyStats": {},
  "lastRotation": null,
  "totalRequests": 0,
  "totalErrors": 0
}
EOF
```

---

## 🔒 Security

### Protect Config Files

```bash
chmod 600 /root/.openclaw/workspace/api-keys.json
chmod 600 /root/.openclaw/workspace/api-state.json
```

### Add to .gitignore

```bash
echo "api-keys.json" >> /root/.openclaw/workspace/.gitignore
echo "api-state.json" >> /root/.openclaw/workspace/.gitignore
echo "api-rotator.log" >> /root/.openclaw/workspace/.gitignore
```

### Backup Keys (Encrypted)

```bash
# Backup with encryption
tar -czf api-keys-backup.tar.gz api-keys.json api-state.json
gpg -c api-keys-backup.tar.gz
rm api-keys-backup.tar.gz

# Restore
gpg -d api-keys-backup.tar.gz.gpg > api-keys-backup.tar.gz
tar -xzf api-keys-backup.tar.gz
```

---

## ✅ Recommended Setup (Production)

**1. Systemd service dengan auto-rotation**
**2. Cron job untuk hourly reload**
**3. Monitor script untuk detect rate limit**
**4. Dashboard untuk monitoring**

**Commands:**
```bash
# Setup systemd
sudo systemctl enable openclaw-rotated
sudo systemctl start openclaw-rotated

# Setup cron
crontab -e
# Add:
# 0 * * * * systemctl reload openclaw-rotated
# */5 * * * * /root/.openclaw/workspace/monitor-rate-limit.sh >> /var/log/rate-limit-monitor.log 2>&1

# Check status
cd /root/.openclaw/workspace && ./dashboard.sh
```

---

## 🐛 Troubleshooting

### Issue: Key rotation not working
**Solution:**
```bash
# Check permissions
ls -la /root/.openclaw/workspace/*.sh
chmod +x /root/.openclaw/workspace/*.sh

# Test manually
/root/.openclaw/workspace/rotate-key.sh
```

### Issue: OpenClaw not picking up new key
**Solution:**
```bash
# Restart OpenClaw
systemctl restart openclaw-rotated

# Or reload
systemctl reload openclaw-rotated
```

### Issue: All keys exhausted
**Solution:**
```bash
# Check credits di https://openrouter.ai/credits
# Add more keys atau top-up existing accounts
```

---

**Status:** ✅ Ready for production
**Next:** Test dengan real workload & monitor performance
