import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';

const json = async file => JSON.parse(await readFile(file, 'utf8'));
const profile = await json('src/data/profile.json');
const projects = await json('src/data/projects.json');
function validateTranslations(value, location) {
  if (typeof value === 'string') assert.ok(value.trim(), `Empty content: ${location}`);
  else if (Array.isArray(value)) {
    assert.ok(value.length, `Empty list: ${location}`);
    value.forEach((item, index) => validateTranslations(item, `${location}[${index}]`));
  } else if (value && typeof value === 'object') {
    if ('zh' in value || 'en' in value) {
      assert.ok('zh' in value && 'en' in value, `Missing translation: ${location}`);
      assert.equal(typeof value.zh, typeof value.en, `Translation mismatch: ${location}`);
      if (value.zh && typeof value.zh === 'object' && !Array.isArray(value.zh)) {
        assert.deepEqual(Object.keys(value.zh).sort(), Object.keys(value.en).sort(), `Translation fields: ${location}`);
      }
    }
    Object.entries(value).forEach(([key, item]) => validateTranslations(item, `${location}.${key}`));
  }
}
validateTranslations(profile, 'profile');
assert.equal(profile.email, 'dpy22@foxmail.com');
assert.equal(projects.length, 7);
assert.equal(new Set(projects.map(p => p.slug)).size, 7);
assert.equal(projects.filter(p => p.featured).length, 4);
const required = ['title','discipline','summary','role','status','question','contributions','result'];
const publicSources = new Set(['https://github.com/dpy22/super-image-border','https://github.com/dpy22/typewriting','https://github.com/dpy22/TexasJev']);
for (const project of projects) {
  assert.match(project.slug, /^[a-z0-9-]+$/);
  assert.ok(['research','software'].includes(project.category));
  if (project.source) assert.ok(publicSources.has(project.source), `Unreviewed public link: ${project.slug}`);
  for (const locale of ['zh','en']) {
    assert.deepEqual(Object.keys(project[locale]).sort(), [...required].sort(), `Translation fields: ${project.slug}/${locale}`);
    for (const field of required) assert.ok(project[locale][field]?.length, `Missing ${project.slug}/${locale}/${field}`);
    assert.equal(project[locale].contributions.length, 3);
    const body = await readFile(`src/content/cases/${project.slug}.${locale}.md`, 'utf8');
    assert.ok(body.includes(`project: ${project.slug}\n`) && body.includes(`locale: ${locale}\n`));
    assert.ok((body.match(/^## /gm) || []).length >= 3, `Incomplete case: ${project.slug}/${locale}`);
  }
}
const disallowed = [
  /mails\.tsinghua\.edu\.cn/i,
  /(?:https?:\/\/)?(?:localhost|127\.0\.0\.1|192\.168\.[0-9]+\.[0-9]+)/i,
  /(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_|-----BEGIN [A-Z ]*PRIVATE KEY|AKIA[A-Z0-9]{16})/,
  /[CDE]:[\\/](?:Users|Codes|Projects|Documents|ThermalLab)[\\/]/i,
];
async function scan(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await scan(file);
    else if (/\.(?:astro|ts|json|md|css|txt|svg)$/.test(entry.name)) {
      const body = await readFile(file, 'utf8');
      for (const pattern of disallowed) assert.ok(!pattern.test(body), `Private content detected in ${file}`);
      for (const match of body.matchAll(/https:\/\/github\.com\/dpy22\/[A-Za-z0-9_.-]+/g)) {
        assert.ok(publicSources.has(match[0]), `Unreviewed repository reference in ${file}`);
      }
    }
  }
}
await scan('src');
await scan('public');
assert.equal((await readdir('src/content/cases')).filter(file => file.endsWith('.md')).length, projects.length * 2);
console.log('Content verified: 7 projects, 14 bilingual case studies, reviewed profile and public links, and public-content scan.');
