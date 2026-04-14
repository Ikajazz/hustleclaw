# OTP Automation Flow

Universal OTP handler untuk Playwright automation dengan Telegram integration.

## Features

- ✅ Universal OTP detection (Facebook, Shopee, Instagram, dll)
- ✅ Telegram notification untuk OTP request
- ✅ Auto-wait untuk user input OTP
- ✅ Auto-submit setelah OTP diterima
- ✅ Cookie saving untuk reuse
- ✅ Timeout handling (5 menit)

## Setup

1. **Get Telegram Bot Token:**
   - Chat dengan @BotFather di Telegram
   - `/newbot` → ikuti instruksi
   - Copy token

2. **Get Chat ID:**
   - Chat dengan @userinfobot
   - Copy chat ID kamu

3. **Configure:**
   ```python
   TELEGRAM_BOT_TOKEN = "123456:ABC-DEF..."
   TELEGRAM_CHAT_ID = "1851631399"
   ```

## Usage

### Facebook Login
```python
from otp_automation import FacebookOTPLogin

fb = FacebookOTPLogin(BOT_TOKEN, CHAT_ID)
cookies = fb.login("email@example.com", "password")
```

### Custom Platform
```python
from otp_automation import OTPAutomation

otp = OTPAutomation(BOT_TOKEN, CHAT_ID)

# Your automation code
page.goto("https://example.com/login")
page.fill('input[name="email"]', email)
page.fill('input[name="password"]', password)
page.click('button[type="submit"]')

# Check for OTP
if otp.detect_otp_page(page):
    otp.handle_otp(page, 'input[name="verification_code"]')
```

## Flow

1. Script login otomatis
2. Detect OTP page
3. Send Telegram notification: "🔐 OTP Required"
4. Wait for user reply (max 5 min)
5. User kirim OTP via Telegram
6. Script input OTP → submit
7. Continue automation

## Supported Platforms

- Facebook (implemented)
- Shopee (template ready)
- Instagram (template ready)
- Twitter (template ready)
- Any platform with OTP (customizable)

## Next Steps

1. Setup Telegram bot
2. Test dengan Facebook
3. Extend untuk Shopee
4. Add more platforms
