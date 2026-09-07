import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rename, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const fixture = 'src/content/blog/migration-draft-regression.md';
const build = () => execFileSync('npm', ['run', 'build'], { stdio: 'inherit' });
const scratch = await mkdtemp(join(tmpdir(), 'astro-regression-'));
await writeFile(fixture, '---\ntitle: Migration draft regression\npubDate: 2026-01-01\ndraft: true\n---\nUnpublished test content.\n', { flag: 'wx' });
try {
  build();
  for (const file of ['index.html', 'blog/index.html', 'rss.xml', 'feed.xml', 'sitemap-0.xml']) {
    assert.ok(!(await readFile(`dist/${file}`, 'utf8')).includes('migration-draft-regression'), file);
  }
  assert.ok(!(await readdir('dist/blog')).includes('migration-draft-regression'));
} finally {
  await rename(fixture, join(scratch, 'draft.md'));
  build();
}
const posts = (await readdir('src/content/blog')).filter(file => /\.mdx?$/.test(file));
for (const post of posts) {
  if (/^draft:\s*true\s*$/m.test(await readFile(`src/content/blog/${post}`, 'utf8'))) continue;
  const slug = post.replace(/\.mdx?$/, '');
  const html = await readFile(`dist/blog/${slug}/index.html`, 'utf8');
  assert.ok(html.includes('rel="canonical"'), slug);
}
assert.equal(await readFile('dist/rss.xml', 'utf8'), await readFile('dist/feed.xml', 'utf8'));
console.log(`Verified ${posts.length} posts, feed alias, and draft exclusion.`);
