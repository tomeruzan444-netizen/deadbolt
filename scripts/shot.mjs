// Usage: node scripts/shot.mjs <url> <out.png> [mobile|desktop] [fullPage=1]
import puppeteer from 'puppeteer-core';
const [url, out, mode = 'mobile', full = '1'] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
if (mode === 'mobile') await page.emulate({ viewport: { width: 375, height: 812, deviceScaleFactor: 1, isMobile: true, hasTouch: true }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148' });
else await page.setViewport({ width: 1366, height: 900 });
await page.goto(url, { waitUntil: 'networkidle0' });
const overflow = await page.evaluate(() => {
  const w = document.documentElement.clientWidth;
  const bad = [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > w + 1 && !e.closest('.table-wrap')).slice(0, 8).map((e) => e.tagName + '.' + [...e.classList].join('.'));
  return { docW: document.documentElement.scrollWidth, w, bad };
});
console.log(JSON.stringify(overflow));
await page.screenshot({ path: out, fullPage: full === '1' });
await browser.close();
