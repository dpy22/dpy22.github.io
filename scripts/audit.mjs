import assert from 'node:assert/strict';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import axe from 'axe-core';
import { launchBrowser } from './browser.mjs';
import { createStaticServer } from './static-server.mjs';

const projects = JSON.parse(await readFile('src/data/projects.json', 'utf8'));
const output = 'output/qa';
await mkdir(output, { recursive: true });
const routes = ['/', '/projects/', '/resume/', ...projects.map(p => `/projects/${p.slug}/`)];
const allRoutes = [...routes, ...routes.map(route => `/en${route}`)];
const report = { created: new Date().toISOString(), routes: allRoutes.length, layout: [], accessibility: [], interactions: [], errors: [], scriptGzipBytes: 0 };
const site = await createStaticServer();
let browser;
try {
  browser = await launchBrowser();
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400 && new URL(response.url()).origin === site.url) report.errors.push(`${response.status()} ${new URL(response.url()).pathname}`); });
  for (const width of [1440, 768, 390, 360]) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    for (const route of allRoutes) {
      const response = await page.goto(site.url + route, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200, route);
      await page.evaluate(() => document.fonts.ready);
      const layout = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth, headings: document.querySelectorAll('h1').length, language: document.documentElement.lang }));
      report.layout.push({ route, width, ...layout });
      assert.ok(layout.document <= width + 1, `Horizontal overflow: ${route} at ${width}px (${layout.document})`);
      assert.equal(layout.headings, 1, `Expected one main heading: ${route}`);
      assert.equal(layout.language, route.startsWith('/en/') ? 'en' : 'zh-CN');
      if (width === 1440) {
        await page.addScriptTag({ content: axe.source });
        const result = await page.evaluate(async () => {
          const results = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa'] } });
          return results.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, targets: v.nodes.map(n => n.target) }));
        });
        report.accessibility.push({ route, violations: result });
      }
      const representative = ['/', '/en/', '/projects/', '/en/projects/', '/projects/thermal-lab/', '/en/projects/thermal-lab/'].includes(route);
      if (representative && [1440,390].includes(width)) {
        for (const image of await page.locator('main img').all()) {
          await image.scrollIntoViewIfNeeded();
          await image.evaluate(element => element.decode());
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        const name = route === '/' ? 'home-zh' : route === '/en/' ? 'home-en' : route.replace(/^\//,'').replaceAll('/','-').replace(/-$/,'');
        await page.screenshot({ path: `${output}/${name}-${width}.png`, fullPage: true });
      }
    }
    console.log(`Layout verified: ${allRoutes.length} pages at ${width}px.`);
  }
  for (const prefix of ['', '/en']) {
    await page.goto(`${site.url}${prefix}/projects/`);
    const cards = page.locator('[data-project-category]:visible');
    assert.equal(await cards.count(), projects.length);
    await page.locator('[data-filter=research]').click();
    assert.equal(await cards.count(), projects.filter(p => p.category === 'research').length);
    assert.equal(await page.locator('[data-project-count]').textContent(), '04');
    await page.locator('[data-filter=software]').click();
    assert.equal(await cards.count(), projects.filter(p => p.category === 'software').length);
    await page.locator('[data-filter=all]').click();
    assert.equal(await cards.count(), projects.length);
  }
  report.interactions.push('Both-language category filters and result announcements');
  await page.goto(`${site.url}/#work`);
  await page.locator('[data-language-switch]').click();
  await page.waitForURL('**/en/#work');
  await page.goto(`${site.url}/projects/liquid-cooling-benchmark/#section-2`);
  await page.locator('[data-language-switch]').click();
  await page.waitForURL('**/en/projects/liquid-cooling-benchmark/#section-2');
  assert.ok(await page.locator('#section-2').isVisible());
  report.interactions.push('Language switch preserves project and section anchor');
  await page.goto(`${site.url}/`);
  const toggle = page.locator('[data-menu-toggle]');
  await toggle.click();
  assert.equal(await page.locator('#site-menu').evaluate(menu => menu.matches(':popover-open')), true);
  await page.setViewportSize({ width: 350, height: 844 });
  assert.equal(await page.locator('#site-menu').evaluate(menu => menu.matches(':popover-open')), true);
  await page.setViewportSize({ width: 360, height: 844 });
  await page.waitForFunction(() => !document.querySelector('.site-header').classList.contains('is-measuring'));
  assert.equal(await page.locator('#site-menu').evaluate(menu => menu.matches(':popover-open')), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#site-menu').evaluate(menu => menu.matches(':popover-open')), false);
  assert.equal(await page.evaluate(() => document.activeElement?.hasAttribute('data-menu-toggle')), true);
  await toggle.click();
  await page.mouse.click(5, 500);
  await page.waitForFunction(() => !document.querySelector('#site-menu').matches(':popover-open'));
  report.interactions.push('Native mobile popover: resize preservation, Escape, restored focus, and light dismiss');
  await page.goto(`${site.url}/`);
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement?.classList.contains('skip-link')), true);
  const focus = await page.locator('.skip-link').evaluate(link => ({ outline: getComputedStyle(link).outlineStyle, animation: getComputedStyle(document.querySelector('.hero-copy')).animationName }));
  assert.notEqual(focus.outline, 'none');
  assert.equal(focus.animation, 'none');
  report.interactions.push('Keyboard skip link has visible focus; reduced motion disables entry animation');
  const zoomContext = await browser.newContext({ viewport: { width: 720, height: 500 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  const zoomPage = await zoomContext.newPage();
  for (const route of ['/', '/en/', '/projects/thermal-lab/', '/en/resume/']) {
    await zoomPage.goto(site.url + route, { waitUntil: 'networkidle' });
    assert.ok(await zoomPage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `200% equivalent viewport overflows: ${route}`);
  }
  await zoomPage.screenshot({ path: `${output}/resume-en-200-percent-equivalent.png`, fullPage: true });
  await zoomContext.close();
  report.interactions.push('200% zoom equivalent: 1440 physical pixels, 720 CSS pixels, 2× rendering');
  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const staticPage = await noJs.newPage();
  for (const route of ['/', '/en/', '/projects/', '/en/projects/']) {
    await staticPage.goto(site.url + route, { waitUntil: 'networkidle' });
    assert.ok((await staticPage.locator('main').innerText()).length > 300);
    const dimensions = await staticPage.evaluate(() => ({ width: window.innerWidth, scroll: document.documentElement.scrollWidth }));
    assert.ok(dimensions.scroll <= dimensions.width + 1, `No-JS overflow: ${route}`);
    assert.ok(await staticPage.locator('[data-language-switch]').isVisible());
  }
  await noJs.close();
  report.interactions.push('Content, navigation, and language links work without JavaScript');
  const fallback = await browser.newContext({ viewport: { width: 360, height: 844 } });
  await fallback.route('**/*.{woff,woff2}', route => route.abort());
  const fallbackPage = await fallback.newPage();
  for (const route of ['/', '/en/']) {
    await fallbackPage.goto(site.url + route, { waitUntil: 'networkidle' });
    assert.ok(await fallbackPage.locator('h1').isVisible());
    assert.ok(await fallbackPage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  }
  await fallback.close();
  report.interactions.push('Both homepages remain readable without downloaded fonts');
  for (const file of await readdir('dist/_astro')) {
    if (file.endsWith('.js')) report.scriptGzipBytes += gzipSync(await readFile(path.join('dist/_astro', file))).byteLength;
  }
  const homepage = await readFile('dist/index.html', 'utf8');
  const inlineScripts = [...homepage.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(([, attributes]) => !attributes.includes('application/ld+json'))
    .map(([, , source]) => source).join('\n');
  report.scriptGzipBytes += gzipSync(inlineScripts).byteLength;
  assert.ok(report.scriptGzipBytes < 35000, `JavaScript budget exceeded: ${report.scriptGzipBytes}`);
  for (const locale of ['zh','en']) {
    const response = await fetch(`${site.url}/downloads/peiyao-duan-${locale}.pdf`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'application/pdf');
  }
  assert.equal((await fetch(`${site.url}/og-cover.png`)).status, 200);
  assert.equal((await fetch(`${site.url}/sitemap-index.xml`)).status, 200);
  const notFound = await fetch(`${site.url}/missing-page-for-audit/`);
  assert.equal(notFound.status, 404);
  assert.ok((await notFound.text()).includes('Page not found'));
  report.interactions.push('PDFs, social image, sitemap, and 404 response');
  await writeFile(`${output}/audit.json`, JSON.stringify(report, null, 2));
  const violations = report.accessibility.flatMap(result => result.violations.map(v => `${result.route}: ${v.id}`));
  assert.equal(report.errors.length, 0, `Browser errors: ${report.errors.join(', ')}`);
  assert.equal(violations.length, 0, `Accessibility findings: ${violations.join(', ')}`);
  console.log(`Audit passed: ${report.layout.length} layout checks, ${report.accessibility.length} accessibility scans, ${report.interactions.length} interaction groups; ${report.scriptGzipBytes} bytes gzip JavaScript.`);
} finally {
  await writeFile(`${output}/audit.json`, JSON.stringify(report, null, 2));
  await browser?.close();
  await site.close();
}
