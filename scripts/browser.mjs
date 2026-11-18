import { chromium } from 'playwright';

export function launchBrowser(extra = {}) {
  return chromium.launch({
    headless: true,
    ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : process.platform === 'win32' ? { channel: 'chrome' } : {}),
    ...extra,
  });
}
