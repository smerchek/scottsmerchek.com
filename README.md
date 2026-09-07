# scottsmerchek.com

Personal portfolio and blog for Scott Smerchek, built with **[Astro](https://astro.build/)**, **[Tailwind CSS v4](https://tailwindcss.com/)**, **MDX**, and deployed to **[Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)**.

## Features

- ⚡ **Zero-Friction Publishing**: Drop a Markdown or MDX file into `src/content/blog/` and it automatically builds, formats, and indexes with RSS and sitemap.
- 🎨 **Light & Dark Mode**: Seamless toggle respecting system preference with zero flash of unstyled theme (FOUC).
- 🚀 **Blazing Performance**: Pure static generation (zero client-side JS overhead by default), hosted on Cloudflare's global edge network.
- 💻 **Syntax Highlighting**: Shiki dual-theme (GitHub Light / One Dark Pro) highlighting rendered server-side.
- 📡 **RSS & Sitemap**: Automatically generated `/rss.xml`, `/feed.xml`, and `/sitemap-index.xml`.
- 🔀 **Backwards Compatible Redirects**: Legacy date-based URLs (`/:year/:month/:date/:slug` -> `/blog/:slug`) handled at the edge via `public/_redirects`.

---

## How to Publish a Blog Post

Publishing a new article requires **zero code modifications**:

1. Create a new file in `src/content/blog/<slug>.md` (or `.mdx`):

```markdown
---
title: "Your Post Title"
description: "A brief summary for SEO and feed aggregators"
pubDate: "2026-09-02"
categories:
  - "remix"
  - "web"
draft: false
---

Your content in Markdown or MDX here...
```

2. Commit and push to `main`:

```bash
git add src/content/blog/your-post-title.md
git commit -m "feat: publish new post on your topic"
git push origin main
```

After configuring one of the deployment methods below, pushes to `main` can build and publish the site. Pushing the review branch runs verification only.

---

## Local Development

Use Node.js 24 LTS (`nvm use`, also used by CI); minimum supported version is 22.12.0.

```bash
# Install dependencies
npm ci

# Start development server
npm run dev

# Type check & validate content collections
npm run check

# Build static output to dist/
npm run build

# Preview static build locally
npm run preview
```

---

## Cloudflare Deployment

We use **Cloudflare Workers with Static Assets** configured in [`wrangler.jsonc`](./wrangler.jsonc), for this static site. No server adapter, database, Fly secrets, or persistent volume is needed.

Production runs on Worker `scottsmerchek-com` in the personal Cloudflare account. The DNS cutover completed on September 7, 2026, and HTTPS, all 12 posts, feeds, sitemap, legacy redirects, and 404 handling were verified. `www.scottsmerchek.com` redirects to the apex and preserves paths and query strings.

Both custom domains are managed in `wrangler.jsonc`. The preview URL is https://scottsmerchek-com.scott-smerchek.workers.dev. Fly machines are retained for manual removal. Automatic deployment is not yet enabled; choose one automation method below to avoid duplicate deployments.

### Option 1: Deploy with Wrangler CLI (Fastest)

```bash
# Authenticate with Cloudflare (one-time)
npx wrangler login

# Build and deploy to Cloudflare
npm run deploy
```

`npm run deploy` deploys the static build and reconciles both custom domains from `wrangler.jsonc`.

### Option 2: Automatic Git Deployments via Cloudflare Dashboard

1. In Cloudflare Dashboard, navigate to **Compute (Workers) &rarr; Create Application &rarr; Workers &rarr; Import from Git**.
2. Select your `scottsmerchek.com` repository.
3. Build command: `npm run build`; deploy command: `npx wrangler deploy`. Assets directory `dist` is configured in `wrangler.jsonc`.
4. Set the build environment Node.js version to 24. Select `main` as the production branch.

### Option 3: Automated via GitHub Actions

Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to your GitHub Repository Secrets. Every push to `main` will automatically build and deploy via `.github/workflows/deploy.yml`.

---

## License

Personal site content &copy; Scott Smerchek.

## Verification

Run `npm run check`, `npm test`, and `npx wrangler deploy --dry-run` before deployment. The regression test builds with a draft fixture, checks that it never appears in pages or feeds, then produces a clean production build. `npm run preview:cf` serves the build with Cloudflare routing and headers locally.
