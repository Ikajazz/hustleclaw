from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Login
    print("🔐 Logging in...")
    page.goto("https://sfile.co/signin")
    page.fill('input[type="email"]', 'sugengskute@gmail.com')
    page.fill('input[type="password"]', 'Kenari46@')
    page.click('button[type="submit"]')
    page.wait_for_load_state('networkidle')
    
    # Go to uploads page
    print("📤 Going to uploads page...")
    page.goto("https://sfile.co/user/v1/uploads")
    time.sleep(2)
    
    # Create test file
    test_file = "/tmp/test-upload-v2.txt"
    with open(test_file, 'w') as f:
        f.write("Test upload v2 from Playwright automation")
    
    # Upload file
    print(f"📁 Selecting file: {test_file}")
    file_input = page.locator('input[type="file"]')
    file_input.set_input_files(test_file)
    time.sleep(1)
    
    # Click upload button
    print("🔘 Clicking Upload button...")
    upload_btn = page.locator('text="Upload Files"')
    if upload_btn.count() > 0:
        upload_btn.click()
        print("⏳ Waiting for upload to complete...")
        time.sleep(10)
        
        # Check result
        page_text = page.inner_text('body')
        if 'test-upload' in page_text.lower():
            print("✅ File uploaded successfully!")
        else:
            print("⚠️ Upload status unclear")
            print("Page text sample:", page_text[:300])
    else:
        print("❌ Upload button not found")
    
    page.screenshot(path='/tmp/sfile-upload-final.png')
    print("📸 Screenshot saved")
    
    browser.close()
