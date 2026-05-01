# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev      # Start development server at http://localhost:3000
yarn build    # Production build
yarn start    # Run production build locally
yarn lint     # Run Next.js ESLint
```

No test suite is configured in this project.

## Architecture

This is a personal blog for Adarsh M built with Next.js 14 App Router, TypeScript, and Tailwind CSS. Blog content is authored in MDX and rendered via `next-mdx-remote/rsc`.

### Content pipeline

Blog posts live as `.mdx` files in `src/app/blog/posts/`. The utility at `src/app/blog/utils.ts` reads those files from the filesystem at build time using Node's `fs` module and parses frontmatter manually (no external frontmatter library). `getBlogPosts()` is the single export used throughout the app to access post data.

All blog post pages are statically generated via `generateStaticParams()` in `src/app/blog/[slug]/page.tsx`.

### MDX frontmatter schema

Every post must include:

```
---
title: "Post Title"
publishedAt: "YYYY-MM-DD"
summary: "Brief description shown in meta tags and RSS"
image: "/optional-og-image.png"   # optional; falls back to auto-generated OG image
---
```

### Custom MDX components (`src/app/components/mdx.tsx`)

`CustomMDX` wraps `MDXRemote` with these overrides:
- **Headings (h1–h6)** — auto-generate slugified `id` attributes and anchor links
- **`a`** — internal paths use Next.js `<Link>`, `#` anchors render plain `<a>`, external links get `target="_blank" rel="noopener noreferrer"`
- **`code`** — syntax-highlighted with `sugar-high`
- **`Image`** — renders Next.js `<Image>` with `rounded-lg`
- **`Table`** — accepts a `{ headers, rows }` data prop

### Special routes

| Route | File | Purpose |
|-------|------|---------|
| `/og` | `src/app/og/route.tsx` | Dynamic OG image generation via `next/og` (accepts `?title=` param) |
| `/rss` | `src/app/rss/route.ts` | XML RSS feed |
| `/sitemap.xml` | `src/app/sitemap.ts` | Auto-generated sitemap |

`baseUrl` (`https://adarshm.com`) is defined once in `src/app/sitemap.ts` and imported wherever an absolute URL is needed.

### Styling conventions

- Tailwind CSS with dark mode support via the `dark:` variant
- Body is constrained to `max-w-xl`, centered with `mx-auto`
- Fonts: `GeistSans` and `GeistMono` via the `geist` package, applied as CSS variables on `<html>`
- Path alias `@/*` maps to `./src/*`

### Adding nav links

Nav items are a plain object in `src/app/components/nav.tsx` (`navItems`). Add or remove entries there to update the navigation bar.
