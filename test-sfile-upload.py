from playwright.sync_api import sync_playwright
import time

def upload_to_sfile(file_path):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            # Login first
            print("🔐 Logging in...")
            page.goto("https://sfile.co/signin", timeout=30000)
            page.fill('input[type="email"], input[name="email"]', 'sugengskute@gmail.com')
            page.fill('input[type="password"], input[name="password"]', 'Kenari46@')
            page.click('button[type="submit"], input[type="submit"]')
            page.wait_for_load_state('networkidle', timeout=10000)
            
            # Go to uploads page
            print("📤 Going to uploads page...")
            page.goto("https://sfile.co/user/v1/uploads", timeout=30000)
            time.sleep(2)
            
            # Upload file
            print(f"📁 Uploading file: {file_path}")
            file_input = page.locator('input[type="file"]')
            file_input.set_input_files(file_path)
            
            # Wait for upload to complete
            print("⏳ Waiting for upload...")
            time.sleep(5)
            
            # Get upload result
            current_url = page.url
            page.screenshot(path='/tmp/sfile-upload.png')
            
            print(f"✅ Upload complete!")
            print(f"   URL: {current_url}")
            print("📸 Screenshot saved: /tmp/sfile-upload.png")
            
            browser.close()
            return True
            
        except Exception as e:
            print(f"❌ Error: {e}")
            page.screenshot(path='/tmp/sfile-upload-error.png')
            browser.close()
            return False

if __name__ == "__main__":
    # Test with a small file
    test_file = "/tmp/test-upload.txt"
    with open(test_file, 'w') as f:
        f.write("Test upload from Playwright automation")
    
    upload_to_sfile(test_file)
