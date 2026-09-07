# scottsmerchek.com

Scott Smerchek's personal site and blog, built with Astro, MDX, and Tailwind CSS. Astro generates static files; Cloudflare Workers Static Assets serves them. There is no application server or database to maintain.

Production: https://scottsmerchek.com

Preview: https://scottsmerchek-com.scott-smerchek.workers.dev

## Publishing a post

1. Use Node 24 (`nvm use`) and install the locked dependencies with `npm ci`.
2. Create `src/content/blog/your-post-slug.md` or `.mdx`. Use a lowercase, hyphenated filename; it becomes the public URL `/blog/your-post-slug/`.

```markdown
---
title: "Your post title"
description: "A short summary for search results and RSS"
pubDate: "2026-09-07"
categories:
  - web
draft: true
---

Write your post here.
```

3. Run `npm run dev` to preview the site. Draft posts are excluded from the site, including development pages and feeds. To preview the article locally, temporarily set `draft: false`; restore it before committing if it is not ready to publish.
4. When ready, set `draft: false`, run `npm run validate`, and commit and push the post. Review a branch/PR first when useful.
5. Run `npm run deploy` from the reviewed commit on `main`. **Pushing alone does not currently publish:** GitHub CI verifies the build, but no deployment token is configured yet.

The homepage, blog index, RSS feeds (`/rss.xml` and `/feed.xml`), and sitemap update at build time. Optional metadata includes `updatedDate`, `tags`, and `categories`. A future `pubDate` does not schedule publication: `draft` is the publication switch. Keep published filenames stable; if you rename one, add an explicit 301 in `public/_redirects`.

Images go in `public/images/` and can be referenced as `/images/filename.png`. Give images descriptive alt text. Markdown uses syntax highlighting automatically; use MDX when the post needs components.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local Astro development server |
| `npm run check` | Type-check Astro and validate content |
| `npm run build` | Generate `dist/` |
| `npm run preview` | Preview the generated Astro build |
| `npm run preview:cf` | Serve `dist/` with local Cloudflare routing and headers |
| `npm test` | Build regression tests, including draft exclusion and feed aliases |
| `npm run validate` | Type checks, regression builds, and Wrangler deployment dry run |
| `npm run deploy` | Validate, deploy, then verify production |
| `npm run smoke` | Compare production with the existing local `dist/` and check routes |

The regression suite creates a temporary draft fixture and finishes with a clean production build. Avoid running concurrent builds/tests in the same checkout. If a test is interrupted, check for `src/content/blog/migration-draft-regression.md` before retrying.

## Deployment and routing

Worker `scottsmerchek-com` belongs to the personal Cloudflare account specified in `wrangler.jsonc`. Both `scottsmerchek.com` and `www.scottsmerchek.com` are Worker custom domains managed by that file. The DNS cutover completed September 7, 2026; the old Fly machines are left for manual removal.

Authenticate locally with `npx wrangler login`, then use `npm run deploy`. This validates before upload and checks the deployed homepage against the local build, published posts, feeds, headers, 404s, legacy redirects, and canonical-host redirects afterward. Smoke checks retry briefly for propagation; a failed smoke check reports a failure but does not roll back automatically.

Cloudflare's zone-level **Redirect Rules** entry `Redirect from WWW to Root [Template]` (ID `45cd3de155464e1bbe9500d5c48523d6`) handles HTTPS `www` to apex with a 301 and preserves paths and query strings. HTTP `www` first upgrades to HTTPS, then redirects to apex. This rule lives in the Cloudflare dashboard, separately from Wrangler. Do not remove it when editing Worker domains. Legacy article redirects are in `public/_redirects`; cache and security headers are in `public/_headers`.

### Enabling automatic deployments

Choose one deployment system to avoid duplicate deploys:

- **GitHub Actions:** add a Cloudflare deployment API token as the repository secret `CLOUDFLARE_API_TOKEN`. The account ID is already in `wrangler.jsonc`. The existing workflow validates every push/PR and deploys `main` when the secret exists. Without it, CI explicitly reports that deployment was skipped. PRs never deploy production.
- **Cloudflare Builds:** connect the existing Worker under Settings → Builds to `smerchek/scottsmerchek.com`, production branch `main`, with Node 24. Build command: `npm run validate`; deploy command: `npx wrangler deploy && npm run smoke`. Leave the GitHub deployment secret unset if using Cloudflare Builds.

The Cloudflare Builds connection and creation of its deployment token have not been approved/completed in this setup. No Fly secret is used by the new workflow. The old repository `FLY_API_TOKEN` can be removed when retiring Fly.

For a bad content release, revert the offending commit, validate, and redeploy. Cloudflare also retains deployment versions for operational rollback; follow its current rollback instructions and verify production afterward.

## Dependency maintenance

`.github/dependabot.yml` checks npm packages and GitHub Actions weekly. Compatible npm minor/patch updates are grouped; major updates stay separate. PRs run the same validation workflow, and nothing auto-merges. Node type definitions stay on the Node 24 major until the runtime is deliberately upgraded.

For a manual maintenance pass:

```bash
npm outdated
npm audit
npm update
npm run validate
```

Review the lockfile diff and framework release notes, then preview an article in light/dark themes and at desktop/mobile widths. Commit `package.json` and `package-lock.json` together. Deploy the reviewed update and run the live checks. `npm ci` in CI installs the exact lockfile rather than resolving new versions.

Astro and its integrations should be upgraded together when their compatibility requirements change. `@astrojs/markdown-satteri` is declared directly because the config imports it. TypeScript remains on 5.x; the installed Astro checker declares compatibility with TypeScript 5/6, not 7. Review that peer requirement before a major upgrade. Node 24 is selected by `.nvmrc`; change runtime, CI/build settings, and Node type definitions together.

Review the Cloudflare compatibility date when adopting new Worker behavior. The static site has no runtime bindings to migrate. Keep local `.env*` and `.dev.vars*` credentials out of git.

## License

Personal site content © Scott Smerchek.
