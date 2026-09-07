import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

const origin = 'https://scottsmerchek.com';
const digest = (text) => createHash('sha256').update(text).digest('hex');
const request = (url) => fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(10_000) });

async function verify() {
  const homepage = await request(origin);
  assert.equal(homepage.status, 200);
  assert.equal(digest(await homepage.text()), digest(await readFile('dist/index.html', 'utf8')), 'Production must match the local build');
  for (const path of ['/about/', '/blog/', '/rss.xml', '/feed.xml', '/sitemap-index.xml']) {
    const response = await request(origin + path);
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff', path);
    await response.body?.cancel();
  }
  const posts = (await readdir('dist/blog', { withFileTypes: true })).filter((entry) => entry.isDirectory());
  for (const post of posts) {
    const response = await request(`${origin}/blog/${post.name}/`);
    assert.equal(response.status, 200, post.name);
    const html = await response.text();
    assert.ok(html.includes(`href="${origin}/blog/${post.name}/"`), `Canonical URL: ${post.name}`);
  }
  const missing = await request(`${origin}/__deployment-missing-page__`);
  assert.equal(missing.status, 404);
  await missing.body?.cancel();
  for (const line of (await readFile('public/_redirects', 'utf8')).split('\n')) {
    if (!line.startsWith('/') || line.includes('/:year')) continue;
    const [from, to, status] = line.trim().split(/\s+/);
    const response = await request(origin + from);
    assert.equal(response.status, Number(status), from);
    assert.equal(response.headers.get('location'), to, from);
    await response.body?.cancel();
  }
  for (const scheme of ['http', 'https']) {
    for (const path of ['/', '/blog/?tag=remix&next=%2Fabout%3Fx%3D1', '/rss.xml', '/__deployment-missing-page__']) {
      let url = `${scheme}://www.scottsmerchek.com${path}`;
      // Always Use HTTPS may run before the canonical-host redirect.
      for (let hop = 0; url !== origin + path && hop < 2; hop++) {
        const response = await request(url);
        assert.equal(response.status, 301, url);
        const next = new URL(response.headers.get('location'), url);
        assert.ok([origin, 'https://www.scottsmerchek.com'].includes(next.origin), next.href);
        assert.equal(next.pathname + next.search, path);
        url = next.href;
        await response.body?.cancel();
      }
      assert.equal(url, origin + path, 'www must resolve to HTTPS apex without a loop');
    }
  }
  console.log(`Production verified: ${posts.length} posts, build identity, feeds, headers, 404, legacy and www redirects.`);
}

for (let attempt = 1; ; attempt++) {
  try {
    await verify();
    break;
  } catch (error) {
    if (attempt === 3) throw error;
    console.warn(`Smoke check attempt ${attempt} failed; retrying after propagation delay: ${error.message}`);
    await setTimeout(5000);
  }
}
