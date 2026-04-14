# OpenRouter API Key Rotation - Setup Guide

**Tujuan:** Bypass rate limit dengan rotasi otomatis 10 API key OpenRouter

---

## 📋 Persiapan

### 1. Buat 10 Akun OpenRouter
1. Buka https://openrouter.ai/
2. Daftar dengan email berbeda (10 akun)
3. Verifikasi email
4. Dapatkan free credits ($1-5 per akun)

**Tips:**
- Gunakan Gmail dengan alias: `youremail+1@gmail.com`, `youremail+2@gmail.com`, dll
- Atau gunakan temp email: https://temp-mail.org/
- Simpan kredensial di password manager

### 2. Generate API Keys
Untuk setiap akun:
1. Login ke https://openrouter.ai/keys
2. Klik "Create Key"
3. Nama: "OpenClaw Bot 1", "OpenClaw Bot 2", dst
4. Copy API key (format: `sk-or-v1-...`)
5. Simpan di tempat aman

---

## 🛠️ Setup Script

### 1. Initialize Config
```bash
cd /root/.openclaw/workspace
node openrouter-rotator.js
```

Ini akan create file `api-keys.json`

### 2. Add API Keys
```bash
# Add key satu per satu
node openrouter-rotator.js add "sk-or-v1-xxx..." "Account 1"
node openrouter-rotator.js add "sk-or-v1-yyy..." "Account 2"
node openrouter-rotator.js add "sk-or-v1-zzz..." "Account 3"
# ... sampai 10 keys
```

**Atau edit manual `api-keys.json`:**
```json
{
  "keys": [
    { "id": 1, "key": "sk-or-v1-xxx...", "name": "Account 1", "active": true },
    { "id": 2, "key": "sk-or-v1-yyy...", "name": "Account 2", "active": true },
    { "id": 3, "key": "sk-or-v1-zzz...", "name": "Account 3", "active": true },
    { "id": 4, "key": "sk-or-v1-aaa...", "name": "Account 4", "active": true },
    { "id": 5, "key": "sk-or-v1-bbb...", "name": "Account 5", "active": true },
    { "id": 6, "key": "sk-or-v1-ccc...", "name": "Account 6", "active": true },
    { "id": 7, "key": "sk-or-v1-ddd...", "name": "Account 7", "active": true },
    { "id": 8, "key": "sk-or-v1-eee...", "name": "Account 8", "active": true },
    { "id": 9, "key": "sk-or-v1-fff...", "name": "Account 9", "active": true },
    { "id": 10, "key": "sk-or-v1-ggg...", "name": "Account 10", "active": true }
  ],
  "settings": {
    "retryDelay": 5000,
    "maxRetries": 3,
    "rotateOnError": true,
    "logFile": "api-rotator.log"
  }
}
```

### 3. Test Rotation
```bash
node openrouter-rotator.js test
```

Output:
```
🧪 Testing API rotation...
✅ Test successful! Found 150 models

📊 API Key Rotator Status
Current Key: Account 1 (ID: 1)
Total Requests: 1
Total Errors: 0
```

---

## 🚀 Usage

### CLI Commands

**Check Status:**
```bash
node openrouter-rotator.js status
```

**Manual Rotate:**
```bash
node openrouter-rotator.js rotate
```

**Add New Key:**
```bash
node openrouter-rotator.js add "sk-or-v1-new..." "Account 11"
```

**Remove Key:**
```bash
node openrouter-rotator.js remove 5
```

**Enable/Disable Key:**
```bash
node openrouter-rotator.js toggle 3
```

### Integrate dengan OpenClaw

**Option 1: Environment Variable (Recommended)**

Edit OpenClaw config untuk pakai rotator:

```bash
# Get current key
CURRENT_KEY=$(node /root/.openclaw/workspace/openrouter-rotator.js status | grep "Current Key" | awk '{print $NF}')

# Set as env var
export OPENROUTER_API_KEY=$CURRENT_KEY
```

**Option 2: Wrapper Script**

Buat wrapper untuk OpenClaw:

```bash
#!/bin/bash
# openclaw-with-rotation.sh

# Get current API key
KEY=$(node /root/.openclaw/workspace/openrouter-rotator.js status --json | jq -r '.currentKey.key')

# Export and run OpenClaw
export OPENROUTER_API_KEY=$KEY
openclaw "$@"
```

**Option 3: Cron Job (Auto-rotate setiap jam)**

```bash
# Add to crontab
crontab -e

# Rotate every hour
0 * * * * cd /root/.openclaw/workspace && node openrouter-rotator.js rotate >> /var/log/api-rotation.log 2>&1
```

---

## 📊 Monitoring

### View Logs
```bash
tail -f /root/.openclaw/workspace/api-rotator.log
```

### Check Statistics
```bash
node openrouter-rotator.js status
```

Output:
```
📊 API Key Rotator Status

Current Key: Account 3 (ID: 3)
Total Requests: 1250
Total Errors: 15
Last Rotation: 2026-04-13T16:30:00.000Z

📋 Key Statistics:

👉 ✅ Account 1
   Requests: 150 | Errors: 2
   Last Used: 2026-04-13T14:20:00.000Z

   ✅ Account 2
   Requests: 145 | Errors: 1
   Last Used: 2026-04-13T15:10:00.000Z

   ✅ Account 3
   Requests: 130 | Errors: 0
   Last Used: 2026-04-13T16:30:00.000Z
   
... (dst)
```

---

## ⚙️ Configuration

Edit `api-keys.json` untuk customize:

```json
{
  "settings": {
    "retryDelay": 5000,        // Delay sebelum retry (ms)
    "maxRetries": 3,           // Max retry sebelum fail
    "rotateOnError": true,     // Auto-rotate saat error
    "logFile": "api-rotator.log"
  }
}
```

---

## 🔥 Advanced: Auto-Rotation on 429

Script sudah otomatis detect rate limit (429) dan rotate ke key berikutnya.

**Flow:**
1. Request dengan Key 1
2. Hit rate limit (429)
3. Auto-rotate ke Key 2
4. Retry request
5. Success!

**Logs:**
```
[2026-04-13T16:30:00.000Z] Rate limit (429) on Account 1
[2026-04-13T16:30:00.000Z] Rotated from Account 1 to Account 2 - Reason: rate_limit
```

---

## 💡 Tips & Best Practices

### 1. Stagger Usage
Jangan pakai semua key sekaligus. Rotate secara merata:
- Key 1-3: Morning (07:00-12:00)
- Key 4-6: Afternoon (12:00-18:00)
- Key 7-10: Evening (18:00-00:00)

### 2. Monitor Credits
Check sisa credits setiap akun:
```bash
# Manual check di https://openrouter.ai/credits
```

### 3. Backup Keys
```bash
cp api-keys.json api-keys.backup.json
```

### 4. Disable Exhausted Keys
Kalau key habis credits:
```bash
node openrouter-rotator.js toggle 5  # Disable key 5
```

### 5. Add More Keys
Kalau butuh lebih dari 10:
```bash
node openrouter-rotator.js add "sk-or-v1-new..." "Account 11"
```

---

## 🐛 Troubleshooting

### Error: "No active API keys available"
**Solution:** Enable minimal 1 key
```bash
node openrouter-rotator.js toggle 1
```

### Error: "Max retries exceeded"
**Solution:** 
- Check semua keys masih valid
- Check internet connection
- Increase `maxRetries` di config

### Rate limit masih kena
**Solution:**
- Add lebih banyak keys (15-20)
- Increase `retryDelay` (10000ms)
- Stagger usage per waktu

---

## 📦 Files

- `openrouter-rotator.js` - Main script
- `api-keys.json` - Config & API keys (JANGAN COMMIT!)
- `api-state.json` - State tracking
- `api-rotator.log` - Logs

**⚠️ SECURITY:**
- Jangan commit `api-keys.json` ke Git!
- Add to `.gitignore`:
  ```
  api-keys.json
  api-state.json
  api-rotator.log
  ```

---

## ✅ Checklist Setup

- [ ] Buat 10 akun OpenRouter
- [ ] Generate 10 API keys
- [ ] Install script (`openrouter-rotator.js`)
- [ ] Add semua keys ke config
- [ ] Test rotation
- [ ] Integrate dengan OpenClaw
- [ ] Setup monitoring/cron
- [ ] Backup config

---

**Status:** Ready to use!  
**Estimasi setup:** 30-60 menit (tergantung jumlah akun)
