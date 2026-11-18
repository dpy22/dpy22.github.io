import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';

function stableCaseSections() {
  return tree => {
    let section = 0;
    const visit = node => {
      if (node.type === 'element' && node.tagName === 'h2') {
        node.properties ??= {};
        node.properties.id = `section-${++section}`;
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}

export default defineConfig({
  site: 'https://dpy22.github.io',
  output: 'static',
  trailingSlash: 'always',
  markdown: { processor: unified({ rehypePlugins: [stableCaseSections] }) },
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [sitemap({
    i18n: { defaultLocale: 'zh', locales: { zh: 'zh-CN', en: 'en' } },
  })],
});
