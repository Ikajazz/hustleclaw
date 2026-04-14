"""
Universal OTP Flow for Playwright Automation
Supports: Facebook, Shopee, Instagram, Twitter, dll
"""

from playwright.sync_api import sync_playwright
import time
import requests
import json

class OTPAutomation:
    def __init__(self, telegram_bot_token, telegram_chat_id):
        self.bot_token = telegram_bot_token
        self.chat_id = telegram_chat_id
        self.otp_received = None
        
    def send_telegram(self, message):
        """Send message to Telegram"""
        url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"
        data = {
            "chat_id": self.chat_id,
            "text": message,
            "parse_mode": "HTML"
        }
        try:
            response = requests.post(url, json=data)
            return response.json()
        except Exception as e:
            print(f"❌ Telegram error: {e}")
            return None
    
    def wait_for_otp(self, timeout=300):
        """Wait for OTP from Telegram (5 min timeout)"""
        self.send_telegram("🔐 <b>OTP Required</b>\n\nPlease send the OTP code now.")
        
        url = f"https://api.telegram.org/bot{self.bot_token}/getUpdates"
        start_time = time.time()
        last_update_id = 0
        
        while time.time() - start_time < timeout:
            try:
                response = requests.get(url, params={"offset": last_update_id + 1})
                data = response.json()
                
                if data.get("ok") and data.get("result"):
                    for update in data["result"]:
                        last_update_id = update["update_id"]
                        
                        if "message" in update and "text" in update["message"]:
                            text = update["message"]["text"].strip()
                            
                            # Check if it's OTP (6 digits)
                            if text.isdigit() and len(text) == 6:
                                self.otp_received = text
                                self.send_telegram(f"✅ OTP received: <code>{text}</code>")
                                return text
                
                time.sleep(2)
            except Exception as e:
                print(f"❌ Error checking updates: {e}")
                time.sleep(2)
        
        self.send_telegram("⏱️ OTP timeout (5 minutes)")
        return None
    
    def detect_otp_page(self, page):
        """Detect if current page requires OTP"""
        url = page.url.lower()
        content = page.content().lower()
        
        # Common OTP indicators
        otp_keywords = [
            "otp", "two factor", "2fa", "verification code",
            "security code", "authentication code", "verify",
            "kode verifikasi", "kode otp"
        ]
        
        for keyword in otp_keywords:
            if keyword in url or keyword in content:
                return True
        
        # Check for OTP input field
        otp_inputs = page.locator('input[name*="otp"], input[name*="code"], input[type="tel"]').count()
        if otp_inputs > 0:
            return True
        
        return False
    
    def handle_otp(self, page, input_selector='input[name="otp"]'):
        """Handle OTP input"""
        print("🔐 OTP page detected")
        
        otp = self.wait_for_otp()
        
        if otp:
            print(f"✅ OTP received: {otp}")
            page.fill(input_selector, otp)
            
            # Find and click submit button
            submit_selectors = [
                'button[type="submit"]',
                'button:has-text("Submit")',
                'button:has-text("Verify")',
                'button:has-text("Continue")',
                'input[type="submit"]'
            ]
            
            for selector in submit_selectors:
                if page.locator(selector).count() > 0:
                    page.click(selector)
                    break
            
            time.sleep(3)
            return True
        else:
            print("❌ OTP timeout")
            return False


# Facebook-specific implementation
class FacebookOTPLogin(OTPAutomation):
    def login(self, email, password):
        """Login to Facebook with OTP support"""
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            try:
                # Navigate to Facebook
                print("🌐 Navigating to Facebook...")
                page.goto("https://www.facebook.com/login")
                time.sleep(2)
                
                # Fill login form
                print("📝 Filling login form...")
                page.fill('input[name="email"]', email)
                page.fill('input[name="pass"]', password)
                page.click('button[name="login"]')
                
                print("⏳ Waiting for response...")
                time.sleep(5)
                
                # Check if OTP required
                if self.detect_otp_page(page):
                    self.send_telegram("🔐 <b>Facebook Login</b>\n\nOTP required for authentication.")
                    
                    # Handle OTP
                    success = self.handle_otp(page, 'input[name="approvals_code"]')
                    
                    if not success:
                        browser.close()
                        return None
                
                # Check if logged in
                time.sleep(3)
                if "facebook.com/login" not in page.url:
                    print("✅ Login successful!")
                    
                    # Save cookies
                    cookies = page.context.cookies()
                    with open('/tmp/facebook-cookies.json', 'w') as f:
                        json.dump(cookies, f)
                    
                    self.send_telegram("✅ <b>Facebook Login Successful</b>")
                    
                    browser.close()
                    return cookies
                else:
                    print("❌ Login failed")
                    self.send_telegram("❌ <b>Facebook Login Failed</b>")
                    browser.close()
                    return None
                    
            except Exception as e:
                print(f"❌ Error: {e}")
                self.send_telegram(f"❌ <b>Error:</b> {e}")
                browser.close()
                return None


# Example usage
if __name__ == "__main__":
    # Configuration
    TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN"
    TELEGRAM_CHAT_ID = "YOUR_CHAT_ID"
    
    FACEBOOK_EMAIL = "your-email@example.com"
    FACEBOOK_PASSWORD = "your-password"
    
    # Initialize
    fb_login = FacebookOTPLogin(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)
    
    # Login with OTP support
    cookies = fb_login.login(FACEBOOK_EMAIL, FACEBOOK_PASSWORD)
    
    if cookies:
        print(f"✅ Logged in! Cookies saved: {len(cookies)} cookies")
    else:
        print("❌ Login failed")
