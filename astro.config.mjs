import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';

export default defineConfig({
  site: 'https://scottsmerchek.com',
  integrations: [mdx(), sitemap()],
  markdown: {
    processor: satteri({
      features: {
        directive: true,
        math: true,
        headingAttributes: true,
      },
    }),
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'one-dark-pro',
      },
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
