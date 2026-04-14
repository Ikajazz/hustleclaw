# Smart API Key Rotation - Setup Guide

**Strategy:** Intelligent rotation based on usage patterns & health
**Script:** `smart-rotation-strategy.sh`

---

## 🧠 Smart Rotation Logic

### Decision Rules:

**1. High Error Rate (>10%)**
- Jika error rate >10% → rotate
- Contoh: 20 requests, 3 errors = 15% → rotate

**2. Approaching Limit (>150 requests)**
- Jika sudah 150+ requests → rotate
- Prevent rate limit sebelum terjadi

**3. Recent Error (<5 minutes)**
- Jika ada error dalam 5 menit terakhir → rotate
- Avoid repeated errors

**4. Rested Key (24+ hours)**
- Prefer key yang sudah rest 24+ jam
- Maximize fresh limits

---

## 🚀 Setup

### 1. Test Smart Rotation

```bash
/root/.openclaw/workspace/smart-rotation-strategy.sh
```

Output:
```
📊 Current Key Stats:
   Key: 1
   Requests: 0
   Errors: 0
   Hours since last use: 999
✅ Current key is healthy. No rotation needed.
```

### 2. Setup Cron (Check Every 10 Minutes)

```bash
crontab -e
```

Add:
```bash
# Smart rotation check every 10 minutes
*/10 * * * * /root/.openclaw/workspace/smart-rotation-strategy.sh >> /var/log/smart-rotation.log 2>&1
```

### 3. Integrate dengan OpenClaw

**Option A: Pre-request Check (Recommended)**

Buat wrapper yang check sebelum setiap request:

```bash
nano /usr/local/bin/openclaw-smart
```

Content:
```bash
#!/bin/bash
# openclaw-smart - OpenClaw with smart rotation

# Check if rotation needed
/root/.openclaw/workspace/smart-rotation-strategy.sh > /dev/null 2>&1

# Get current key
export OPENROUTER_API_KEY=$(/root/.openclaw/workspace/get-current-key.sh)

# Run OpenClaw
openclaw "$@"
```

Make executable:
```bash
chmod +x /usr/local/bin/openclaw-smart
```

**Usage:**
```bash
openclaw-smart gateway start
```

---

**Option B: Systemd Service with Smart Rotation**

```bash
sudo nano /etc/systemd/system/openclaw-smart.service
```

Content:
```ini
[Unit]
Description=OpenClaw with Smart API Key Rotation
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/.openclaw/workspace

# Pre-start: check rotation
ExecStartPre=/root/.openclaw/workspace/smart-rotation-strategy.sh

# Start with current key
ExecStart=/bin/bash -c 'export OPENROUTER_API_KEY=$(/root/.openclaw/workspace/get-current-key.sh) && openclaw gateway start'

# Periodic health check (every 10 min)
ExecReload=/root/.openclaw/workspace/smart-rotation-strategy.sh

Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl daemon-reload
sudo systemctl enable openclaw-smart
sudo systemctl start openclaw-smart
```

Add cron for periodic check:
```bash
crontab -e

# Reload service every 10 minutes (triggers smart rotation check)
*/10 * * * * systemctl reload openclaw-smart
```

---

## 📊 Monitoring

### View Logs

```bash
tail -f /var/log/smart-rotation.log
```

### Manual Check

```bash
/root/.openclaw/workspace/smart-rotation-strategy.sh
```

### Dashboard

```bash
cd /root/.openclaw/workspace && ./dashboard.sh
```

---

## 🔥 Advanced: Track Request Count

Untuk smart rotation bekerja optimal, perlu track request count per key.

**Update state after each request:**

```bash
nano /root/.openclaw/workspace/track-request.sh
```

Content:
```bash
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
```

Make executable:
```bash
chmod +x /root/.openclaw/workspace/track-request.sh
```

**Call after each API request:**
```bash
# After successful request
/root/.openclaw/workspace/track-request.sh
```

---

## 🎯 Expected Behavior

### Scenario 1: Normal Usage
```
08:00 - Key 1 (0 requests) → Use Key 1
08:30 - Key 1 (50 requests) → Continue Key 1
09:00 - Key 1 (100 requests) → Continue Key 1
09:30 - Key 1 (160 requests) → Rotate! (approaching limit)
09:31 - Key 2 (0 requests) → Use Key 2
```

### Scenario 2: Error Detected
```
10:00 - Key 2 (80 requests, 0 errors) → Use Key 2
10:15 - Key 2 (90 requests, 2 errors) → Continue (error rate 2%)
10:30 - Key 2 (100 requests, 12 errors) → Rotate! (error rate 12%)
10:31 - Key 3 (0 requests) → Use Key 3
```

### Scenario 3: Rate Limit Hit
```
11:00 - Key 3 (150 requests) → Rotate! (approaching limit)
11:01 - Key 4 (0 requests) → Use Key 4
11:02 - Key 4 → Rate limit error!
11:02 - Key 4 (1 request, 1 error) → Rotate! (recent error)
11:03 - Key 5 (0 requests) → Use Key 5
```

### Scenario 4: All Keys Rested
```
Next day 08:00:
- Key 1: last used 24h ago → Prefer this! ✅
- Key 2: last used 22h ago
- Key 3: last used 20h ago
→ Use Key 1 (fully rested)
```

---

## ✅ Advantages of Smart Rotation

**vs Hourly Rotation:**
- ✅ Tidak rotate kalau tidak perlu
- ✅ Maximize usage per key
- ✅ Reduce unnecessary rotations

**vs Daily Rotation:**
- ✅ Bisa handle burst traffic
- ✅ Auto-recover dari errors
- ✅ Prevent rate limit proactively

**vs On-Demand:**
- ✅ Rotate BEFORE rate limit (not after)
- ✅ Prefer rested keys
- ✅ Intelligent decision making

---

## 🐛 Troubleshooting

### Issue: Rotation too frequent
**Solution:** Adjust thresholds in script
```bash
nano /root/.openclaw/workspace/smart-rotation-strategy.sh

# Change:
if [ "$REQUESTS" -gt 150 ]; then  # Increase to 180
```

### Issue: Not rotating when should
**Solution:** Check cron is running
```bash
crontab -l
systemctl status cron
```

### Issue: Stats not updating
**Solution:** Call track-request.sh after each API call
```bash
/root/.openclaw/workspace/track-request.sh
```

---

## 📝 Summary

**Setup completed:**
- ✅ Smart rotation script created
- ✅ Decision logic: error rate, request count, recent errors, rest time
- ✅ Cron job ready (every 10 minutes)
- ✅ Integration options provided

**Next steps:**
1. Setup cron job
2. Choose integration method (wrapper or systemd)
3. Monitor logs
4. Adjust thresholds if needed

**Estimated capacity with smart rotation:**
- 2000+ requests/hari (10 keys × 200)
- Auto-recovery dari rate limits
- Optimal key utilization

Ready to deploy! 🚀
