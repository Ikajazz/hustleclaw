from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)  # Non-headless untuk debug
    page = browser.new_page()
    
    # Login
    print("🔐 Logging in...")
    page.goto("https://sfile.co/signin")
    page.fill('input[type="email"], input[name="email"]', 'sugengskute@gmail.com')
    page.fill('input[type="password"], input[name="password"]', 'Kenari46@')
    page.click('button[type="submit"]')
    page.wait_for_load_state('networkidle')
    
    # Go to homepage
    print("📤 Going to homepage...")
    page.goto("https://sfile.co")
    time.sleep(2)
    
    # Find upload button/input
    print("🔍 Looking for upload element...")
    page.screenshot(path='/tmp/sfile-before-upload.png')
    
    # Try to find file input
    file_inputs = page.locator('input[type="file"]').all()
    print(f"Found {len(file_inputs)} file input(s)")
    
    if len(file_inputs) > 0:
        # Create test file
        test_file = "/tmp/test-upload.txt"
        with open(test_file, 'w') as f:
            f.write("Test upload from Playwright")
        
        print(f"📁 Uploading: {test_file}")
        file_inputs[0].set_input_files(test_file)
        
        # Wait and check for upload progress/result
        print("⏳ Waiting 10 seconds...")
        time.sleep(10)
        
        page.screenshot(path='/tmp/sfile-after-upload.png')
        print(f"📸 Screenshots saved")
        print(f"Current URL: {page.url}")
        
        # Check for upload result/link
        page_text = page.content()
        if "uploaded" in page_text.lower() or "download" in page_text.lower():
            print("✅ Upload detected in page content")
        else:
            print("⚠️ No upload confirmation found")
    else:
        print("❌ No file input found on page")
    
    input("Press Enter to close browser...")
    browser.close()
