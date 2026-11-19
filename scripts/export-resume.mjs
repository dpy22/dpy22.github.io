import { mkdir, readFile, copyFile } from 'node:fs/promises';
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
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(site.url, { waitUntil: 'domcontentloaded' });
  const fontStyles = await readFile('src/styles/fonts.css', 'utf8');
  await page.setContent(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <style>
    ${fontStyles}
    * { box-sizing: border-box; }
    body { margin: 0; background: #f9f9f6; color: #202522; font-family: 'Noto Sans SC Variable', sans-serif; }
    main { min-height: 630px; padding: 54px 72px; display: grid; grid-template-rows: auto 1fr auto; }
    h1, p { margin: 0; }
    .name { display: flex; gap: 1.25rem; align-items: baseline; padding-block: 1.15rem; border-block-start: .35rem solid #334d42; font-size: 1.65rem; }
    #name-en { font-size: 1.25rem; color: #616660; }
    .focus { align-self: center; }
    h1 { font-size: 3.85rem; line-height: 1.2; letter-spacing: -.06em; }
    #focus-en { margin-block-start: 1rem; color: #334d42; font-size: 1.8rem; }
    #website { border-block-start: 1px solid #d7dad2; padding-block-start: 1.25rem; font-size: 1rem; color: #616660; }
  </style>
</head>
<body>
  <main>
    <div class="name"><strong id="name-zh"></strong><span id="name-en" lang="en"></span></div>
    <div class="focus"><h1 id="focus-zh"></h1><p id="focus-en" lang="en"></p></div>
    <p id="website"></p>
  </main>
</body>
</html>`);
  await page.evaluate(({ name, focus, site }) => {
    document.querySelector('#name-zh').textContent = name.zh;
    document.querySelector('#name-en').textContent = name.en;
    document.querySelector('#focus-zh').textContent = focus.zh;
    document.querySelector('#focus-en').textContent = focus.en;
    document.querySelector('#website').textContent = new URL(site).hostname;
    return document.fonts.ready;
  }, profile);
  await page.screenshot({ path: 'dist/og-cover.png' });
  await mkdir('output/preview', { recursive: true });
  await copyFile('dist/og-cover.png', 'output/preview/og-cover.png');
  console.log('Exported 1200 × 630 social preview.');
} finally {
  await browser?.close();
  await site.close();
}
