import os
import subprocess
from typing import Optional

try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False


class BrowserTool:
    def __init__(self):
        self._playwright = None
        self._browser = None

    def _start_browser(self):
        if not PLAYWRIGHT_AVAILABLE:
            raise RuntimeError("Playwright not installed. Run: pip install playwright && playwright install")
        if not self._playwright:
            self._playwright = sync_playwright().start()
            self._browser = self._playwright.chromium.launch(headless=False)

    def _stop_browser(self):
        if self._browser:
            self._browser.close()
            self._browser = None
        if self._playwright:
            self._playwright.stop()
            self._playwright = None

    def open_url(self, url: str) -> str:
        """Open a URL in Chrome browser."""
        try:
            # Try native browser first
            subprocess.Popen(["xdg-open", url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return f"Opened {url} in browser."
        except Exception:
            pass
        try:
            self._start_browser()
            page = self._browser.new_page()
            page.goto(url, wait_until="domcontentloaded", timeout=30000)
            return f"Opened {url} in Playwright browser."
        except Exception as e:
            return f"Failed to open {url}: {e}"

    def take_screenshot(self, url: str, output_path: str = "/tmp/alma_screenshot.png") -> str:
        """Take a screenshot of a URL."""
        if not PLAYWRIGHT_AVAILABLE:
            return "Playwright not available for screenshots."
        try:
            self._start_browser()
            page = self._browser.new_page()
            page.goto(url, wait_until="networkidle", timeout=30000)
            page.screenshot(path=output_path, full_page=True)
            return f"Screenshot saved to {output_path}"
        except Exception as e:
            return f"Screenshot failed: {e}"

    def extract_text(self, url: str) -> str:
        """Extract visible text content from a URL."""
        if not PLAYWRIGHT_AVAILABLE:
            return "Playwright not available for text extraction."
        try:
            self._start_browser()
            page = self._browser.new_page()
            page.goto(url, wait_until="domcontentloaded", timeout=30000)
            text = page.evaluate("() => document.body.innerText")
            return text[:5000] if text else "No text found."
        except Exception as e:
            return f"Text extraction failed: {e}"

    def __del__(self):
        self._stop_browser()
