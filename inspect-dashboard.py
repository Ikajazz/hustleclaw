from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Login
    page.goto("https://sfile.co/signin")
    page.fill('input[type="email"], input[name="email"]', 'sugengskute@gmail.com')
    page.fill('input[type="password"], input[name="password"]', 'Kenari46@')
    page.click('button[type="submit"]')
    page.wait_for_load_state('networkidle')
    
    # Check dashboard
    print(f"Dashboard URL: {page.url}")
    
    # Look for upload links/buttons
    html = page.content()
    
    # Save HTML for inspection
    with open('/tmp/sfile-dashboard.html', 'w') as f:
        f.write(html)
    
    # Search for upload-related elements
    upload_links = []
    for link in ['upload', 'Upload', 'UPLOAD', 'add file', 'Add File']:
        if link in html:
            print(f"✅ Found '{link}' in page")
            upload_links.append(link)
    
    # Check for file input
    file_inputs = page.locator('input[type="file"]').count()
    print(f"File inputs found: {file_inputs}")
    
    # Take screenshot
    page.screenshot(path='/tmp/sfile-dashboard.png')
    print("📸 Screenshot saved: /tmp/sfile-dashboard.png")
    
    browser.close()
    
print("\n📄 Check /tmp/sfile-dashboard.html for upload elements")
