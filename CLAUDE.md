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

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS 4** — CSS-first config, no `tailwind.config.ts`
- **next-mdx-remote 6** — RSC MDX rendering
- **sugar-high** — code syntax highlighting
- **Geist** fonts (sans + mono)
- **TypeScript** (strict mode)

## Architecture

This is a personal blog for Adarsh M. Blog content is authored in MDX and rendered via `next-mdx-remote/rsc`.

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
- **`Image`** — renders Next.js `<Image>` with `rounded-xl`
- **`Table`** — accepts a `{ headers: string[], rows: string[][] }` data prop

### Special routes

| Route | File | Purpose |
|-------|------|---------|
| `/og` | `src/app/og/route.tsx` | Dynamic OG image generation via `next/og` (accepts `?title=` param) |
| `/rss` | `src/app/rss/route.ts` | XML RSS feed |
| `/sitemap.xml` | `src/app/sitemap.ts` | Auto-generated sitemap |

`baseUrl` (`https://adarshm.com`) is defined once in `src/app/sitemap.ts` and imported wherever an absolute URL is needed.

### Tailwind CSS 4 conventions

- Config is CSS-first: there is no `tailwind.config.ts`. Theme overrides live in `src/app/global.css` inside an `@theme {}` block if needed.
- `global.css` opens with `@import "tailwindcss"` (replaces the three old `@tailwind` directives).
- PostCSS uses `@tailwindcss/postcss` (not the legacy `tailwindcss` plugin).
- Dark mode is media-query based (`prefers-color-scheme`). Prose dark-mode styles in `global.css` use explicit `@media (prefers-color-scheme: dark)` blocks instead of `@apply dark:*` to avoid Tailwind 4 `@apply` variant limitations.

### Next.js 16 async params

Dynamic routes must treat `params` as a `Promise`. Always destructure after awaiting:

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  ...
}
```

### Styling conventions

- Layout: `max-w-2xl` centered with `lg:mx-auto`
- Fonts: `GeistSans.variable` and `GeistMono.variable` applied to `<html>`
- Accent color: green-600 / green-500 (dark mode)
- Path alias `@/*` maps to `./src/*`
- Navbar (`src/app/components/nav.tsx`) is a `'use client'` component — it uses `usePathname()` for the active-link highlight.

### Adding nav links

Nav items are a plain object in `src/app/components/nav.tsx` (`navItems`). Add or remove entries there to update the navigation bar.
