import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createStaticServer } from './static-server.mjs';

await mkdir('output/qa', { recursive: true });
const site = await createStaticServer();
const results = [];
try {
  // Sequential cold-browser runs: Lighthouse default simulated mobile / Slow 4G / 4× CPU.
  for (const [name, route] of [['zh-home','/'], ['en-home','/en/'], ['zh-work','/projects/'], ['en-work','/en/projects/'], ['zh-case','/projects/thermal-lab/'], ['en-case','/en/projects/thermal-lab/']]) {
    const file = `output/qa/lighthouse-${name}.json`;
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, ['node_modules/lighthouse/cli/index.js', site.url + route, '--chrome-flags=--headless --no-sandbox', '--quiet', '--only-categories=performance,accessibility', '--output=json', `--output-path=${file}`], {
        stdio: ['ignore', 'ignore', 'pipe'],
        env: { ...process.env, CHROME_PATH: process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : chromium.executablePath()) },
      });
      let errors = '';
      child.stderr.on('data', data => errors += data);
      child.on('error', reject);
      child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Lighthouse ${name}: ${errors}`)));
    });
    const report = JSON.parse(await readFile(file, 'utf8'));
    const result = { route, performance: Math.round(report.categories.performance.score * 100), accessibility: Math.round(report.categories.accessibility.score * 100), lcp: report.audits['largest-contentful-paint'].displayValue, cls: report.audits['cumulative-layout-shift'].numericValue, version: report.lighthouseVersion, environment: report.environment, config: report.configSettings, warnings: report.runWarnings };
    results.push(result);
    console.log(`${route}: performance ${result.performance}, accessibility ${result.accessibility}, LCP ${result.lcp}`);
  }
  assert.ok(results.every(result => result.performance >= 90 && result.accessibility >= 95), 'Performance or accessibility target not met; inspect output/qa/lighthouse-*.json');
} finally {
  await writeFile('output/qa/performance.json', JSON.stringify({ created: new Date().toISOString(), conditions: 'Local production static server; gzip text; Lighthouse default simulated mobile, Slow 4G, 4× CPU; fresh browser per route; one run per route.', results }, null, 2));
  await site.close();
}
