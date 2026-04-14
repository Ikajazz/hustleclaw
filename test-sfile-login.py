from playwright.sync_api import sync_playwright
import time

def login_sfile():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            print("🌐 Navigating to sfile.co...")
            page.goto("https://sfile.co/signin", timeout=30000)
            time.sleep(2)
            
            print("📝 Filling login form...")
            page.fill('input[type="email"], input[name="email"]', 'sugengskute@gmail.com')
            page.fill('input[type="password"], input[name="password"]', 'Kenari46@')
            
            print("🔐 Submitting...")
            page.click('button[type="submit"], input[type="submit"]')
            
            print("⏳ Waiting for navigation...")
            page.wait_for_load_state('networkidle', timeout=10000)
            
            # Check if logged in
            current_url = page.url
            cookies = page.context.cookies()
            
            print(f"✅ Login complete!")
            print(f"   URL: {current_url}")
            print(f"   Cookies: {len(cookies)} cookies saved")
            
            # Take screenshot
            page.screenshot(path='/tmp/sfile-login.png')
            print("📸 Screenshot saved: /tmp/sfile-login.png")
            
            browser.close()
            return True
            
        except Exception as e:
            print(f"❌ Error: {e}")
            page.screenshot(path='/tmp/sfile-error.png')
            browser.close()
            return False

if __name__ == "__main__":
    login_sfile()
