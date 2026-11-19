# Peiyao Duan / 段培耀

A bilingual research and engineering portfolio focused on computing workloads and cooling in AI data centres. Built with Astro, TypeScript, and CSS. Published at [dpy22.github.io](https://dpy22.github.io/).

## Local development

Requirements: Node.js 24 and pnpm 11.25.0.

```sh
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

On Windows, PDF export and browser verification use installed Google Chrome by default. On Linux/macOS they use Playwright Chromium. Set BROWSER_CHANNEL to select another installed Playwright-supported channel.

For the complete production site, including downloadable PDFs and the social preview:

```sh
pnpm build
pnpm preview
```

## Content maintenance / 内容维护

- src/data/profile.json: shared name, introduction, education, contact details, skills, and awards. 姓名、个人介绍、教育和联系方式等共用资料。
- src/data/projects.json: identifiers, bilingual summaries, contributions, categories, and reviewed public links. 项目索引与双语摘要。
- src/content/cases/<slug>.<locale>.md: longer project stories, one zh and one en file per project. 项目长文。
- public/images/: native editor snapshots embedded in the bilingual Photo Frame Studio case. Sources are documented in public/licenses/PROJECT-ASSETS.md.

Chinese lives at / and English at /en/. Language links retain the current project and section. Update both languages together; pnpm check rejects missing fields, unknown references, and incomplete case pairs.

The resume pages and generated one-page A4 PDFs use the same profile and project data. PDFs and the 1200 x 630 share image are generated during pnpm build; they are available in the production preview rather than the development server.

The homepage and both one-page résumés share their four featured projects and order. The catalogue lists all seven projects. The site title, footer and independent text share image use the bilingual focus in src/data/profile.json.

Use only material suitable for public distribution. Original resumes, private repository URLs, raw laboratory data, device addresses, credentials, and internal parameters do not belong in this repository. Contributions and work in progress should remain accurately described.

## Verification

```sh
pnpm check
pnpm build
pnpm verify:browser
pnpm verify:performance
```

The browser audit checks all 20 content routes at 360, 390, 768, and 1440px; runs WCAG A/AA scans; exercises bilingual filters, language links and native popover navigation; and checks static reading, 200% equivalent layouts, PDFs, and assets. Evidence is written to ignored output/qa/. PDFs are also copied to ignored output/pdf/.

The performance check runs Lighthouse sequentially against six representative pages, using its default mobile simulation (Slow 4G and 4× CPU slowdown). It saves the complete reports and environment details in output/qa/ and checks performance ≥90 and accessibility ≥95. Scores vary with the local machine and network.

## Publishing

GitHub Actions installs locked dependencies, builds the site and PDFs, verifies browser behaviour and mobile performance, and publishes Pages for main. Set Settings > Pages > Source to GitHub Actions. Pull requests run the same checks without deployment. Verification artifacts are retained for 14 days. CI uses Playwright's installed Chromium for browser tests, PDF export, and Lighthouse; local Windows checks use installed Chrome.

The website source is public. Research repositories keep their own visibility settings. A failed build or browser check prevents deployment. Keep recovery bundles outside the public repository. Before redeploying an older version, review its content against the current public profile.

## Typography

Noto Sans SC is self-hosted, with static Latin fonts and content-specific Chinese subsets at weights 400 and 600. The font licence is distributed under public/licenses/. Static instances also keep the exported PDF fonts embedded and portable.

New Chinese characters fall back to the system font. After major content updates, regenerate the committed subsets with `uv run --with 'fonttools[woff]' python scripts/subset-fonts.py`, then rebuild and inspect the PDFs. The script uses locked Fontsource chunks and records source checksums beside the CJK fonts. Intermediate files remain in ignored tmp/; ordinary builds need neither Python nor a font download.

## Web platform guidance

This design applies Google's [Modern Web Guidance](https://github.com/GoogleChrome/modern-web-guidance): content-based navigation measurement, native Popover, component container queries, responsive typography in rem units, and deliberate image priority. On browsers without Popover support the navigation remains a visible, wrapping list; with JavaScript disabled supported browsers retain the native menu. Body content and both language versions are static HTML.
