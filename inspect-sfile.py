from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("https://sfile.co/login", timeout=30000)
    page.screenshot(path='/tmp/sfile-page.png')
    html = page.content()
    with open('/tmp/sfile-page.html', 'w') as f:
        f.write(html)
    print("✅ Screenshot & HTML saved")
    browser.close()
