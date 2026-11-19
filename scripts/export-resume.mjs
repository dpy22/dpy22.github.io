import { mkdir, readFile, readdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import { launchBrowser } from './browser.mjs';
import { createStaticServer } from './static-server.mjs';

const profile = JSON.parse(await readFile('src/data/profile.json', 'utf8'));
const site = await createStaticServer();
let browser;
try {
  browser = await launchBrowser();
  await mkdir('dist/downloads', { recursive: true });
  await mkdir('output/pdf', { recursive: true });
  for (const locale of ['zh','en']) {
    const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1 });
    await page.emulateMedia({ media: 'print' });
    const response = await page.goto(`${site.url}/${locale === 'en' ? 'en/' : ''}resume/`, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    // Commit a painted frame with the embedded fonts before paginated rendering.
    await page.screenshot({ animations: 'disabled' });
    const file = path.resolve(`dist/downloads/peiyao-duan-${locale}.pdf`);
    await page.pdf({ path: file, format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true });
    const document = await PDFDocument.load(await readFile(file));
    assert.equal(document.getPageCount(), 1, `${locale} résumé must be exactly one A4 page`);
    const { width, height } = document.getPage(0).getSize();
    assert.ok(Math.abs(width - 595.28) < 2 && Math.abs(height - 841.89) < 2);
    await copyFile(file, `output/pdf/peiyao-duan-${locale}.pdf`);
    await page.close();
    console.log(`Exported ${locale} résumé: one A4 page.`);
  }
  const page = await browser.newPage();
  await page.emulateMedia({ media: 'screen' });
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto(site.url, { waitUntil: 'networkidle' });
  const drawing = await page.locator('.art-thermal-lab svg').evaluate(svg => svg.outerHTML);
  const css = (await readdir('dist/_astro')).find(file => file.endsWith('.css'));
  assert.ok(css, 'Built stylesheet missing');
  await page.setContent(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><link rel="stylesheet" href="${site.url}/_astro/${css}"><style>html,body{width:1200px;height:630px;overflow:hidden;background:#f9f9f6}.cover{height:630px;padding:48px 56px;position:relative}.top{border-bottom:1px solid #d7dad2;padding-bottom:22px;font-size:.75rem;letter-spacing:2px;display:flex;justify-content:space-between}.copy{position:absolute;top:145px;left:56px;z-index:2}.copy h1{font-size:7rem;font-weight:600;letter-spacing:-.07em;line-height:1}.copy h2{font-size:1.5rem;font-weight:500;margin-top:30px;letter-spacing:.12em}.illustration{position:absolute;width:530px;right:56px;top:168px}.bottom{position:absolute;bottom:40px;left:56px;right:56px;border-top:1px solid #d7dad2;padding-top:20px;display:flex;justify-content:space-between;font-size:.7rem;letter-spacing:1.5px;color:#616660}</style></head><body><div class="cover"><div class="top"><span>PEIYAO DUAN / PORTFOLIO</span><span>TSINGHUA UNIVERSITY</span></div><div class="copy"><h1>Peiyao<br>Duan</h1><h2>段培耀</h2></div><div class="illustration">${drawing}</div><div class="bottom"><span>${profile.focusLabel}</span><span>DPY22.GITHUB.IO ↗</span></div></div></body></html>`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'dist/og-cover.png' });
  await mkdir('output/preview', { recursive: true });
  await copyFile('dist/og-cover.png', 'output/preview/og-cover.png');
  console.log('Exported 1200 × 630 social preview.');
} finally {
  await browser?.close();
  await site.close();
}
