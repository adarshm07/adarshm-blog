# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev      # Start development server at http://localhost:3000
yarn build    # Production build
yarn start    # Run production build locally
yarn lint     # ESLint (flat config, eslint-config-next)
npx tsc --noEmit   # Typecheck
yarn smoke    # Browser smoke test — needs `yarn build && yarn start` running first
```

There are no unit tests. CI (`.github/workflows/ci.yml`) runs lint,
typecheck, build, then `yarn smoke` on every push and pull request. The build
catches MDX rendering errors (they only surface during static generation);
`scripts/smoke.mjs` catches what the build can't: it loads every sitemap URL in
Chromium at phone width, presses Next once on every step player, and fails on
any console error, page error, or horizontal overflow. `BASE_URL` and
`CONCURRENCY` env vars override its defaults. Playwright is pinned to match the
locally installed browser — bump it deliberately.

`react-hooks/set-state-in-effect` is downgraded to a warning in
`eslint.config.mjs`; the reasoning is in a comment there.

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
tags: "DSA, System Design"        # optional; comma-separated, powers the /blog topic filter
---
```

### Custom MDX components (`src/app/components/mdx.tsx`)

`CustomMDX` wraps `MDXRemote` with these overrides:
- **Headings (h1–h6)** — auto-generate slugified `id` attributes and anchor links
- **`a`** — internal paths use Next.js `<Link>`, `#` anchors render plain `<a>`, external links get `target="_blank" rel="noopener noreferrer"`
- **`code`** — syntax-highlighted with `sugar-high`
- **`Image`** — renders Next.js `<Image>` with `rounded-xl`
- **`Table`** — accepts a `{ headers: string[], rows: string[][] }` data prop

### Every post gets a visualizer

Almost every post is built around one animated component in
`src/app/components/`, registered in the `components` map in
`src/app/components/mdx.tsx` and used by name in the MDX. They are all built
on `StepPlayer` (`src/app/components/step-player.tsx`), which supplies
play/pause/step/reset and a `StepNote` caption; a visualizer supplies an
array of steps and renders one frame per index. Data is deterministic — no
`Math.random()` at render time, or the server and client markup diverge.

Two data-driven renderers cover common shapes, so a visualizer can be just a
steps array: `SequenceDiagram` (messages between actors — HTTP, DNS, TLS) and
`CodeTrace` (highlighted code plus name → value panels). Grouped visualizers
live in `web-visualizers.tsx`, `typescript-visualizers.tsx`,
`beginner-js-visualizers.tsx`, `ai-visualizers.tsx`, `systems-visualizers.tsx`
and `linear-algo-visualizers.tsx`; a file that defines its own `StepPlayer`
render function must be `'use client'`, since functions can't cross from a
server component to a client one.

`global.css` scopes every `.prose` rule with `:not(.not-prose *)`, so
visualizers (whose root is `not-prose`) are styled only by their own
utilities. Keep that suffix on any new `.prose` rule.

**MDX object props need `blockJS: false`.** Both MDX routes pass
`options={{ blockJS: false }}` to `CustomMDX`; without it, object props like
`<Table data={{...}}>` are stripped and arrive as `undefined`.

### Routes beyond the blog

| Route | File | Purpose |
|-------|------|---------|
| `/about` | `src/app/about/page.tsx` | Bio, personal stack, and how the site is built |
| `/learn` | `src/app/learn/page.tsx` | Hub listing the guides |
| `/learn/web`, `/learn/javascript`, `/learn/ai` | `src/app/learn/{web,javascript,ai}/page.tsx` | One-page animated guides. Content lives in `learn/guides/*.tsx` as `Guide` data; `learn/guide.tsx` renders it and checks every chapter's `post` slug at build time |
| `/tools` | `src/app/tools/` | System design practice (BYOK Claude), capacity calculator, regex backtracking checker |
| `/dsa` | `src/app/dsa/page.tsx` | Ordered learning path from `curriculum.ts` |
| `/dsa/patterns` | `src/app/dsa/patterns/` | Practice questions grouped by pattern, authored as MDX |
| `/dsa/progress` | `src/app/dsa/progress/page.tsx` | Dashboard over both progress tracks |
| `/og` | `src/app/og/route.tsx` | Dynamic OG image generation via `next/og` (accepts `?title=` param) |
| `/rss` | `src/app/rss/route.ts` | XML RSS feed |
| `/sitemap.xml` | `src/app/sitemap.ts` | Auto-generated sitemap — add new static routes to the `routes` array |
| `/search-index` | `src/app/search-index/route.ts` | Static JSON search index, fetched on first ⌘K |
| `/icon`, `/apple-icon` | `src/app/icon.tsx` | Favicons generated at build time |

### Search

`src/app/lib/search-index.ts` builds the index at build time — title,
summary, tags, headings, and prose with code fences and JSX stripped — and
serves it from the static `/search-index` route. Guides are indexed too: one
doc per guide and one per chapter (kind `guide`, linking to
`/learn/<guide>#<chapter>`), with chapter text pulled from the JSX by walking
`props.children`. A new guide must be added to the list in `getSearchIndex()`
as well as to the `/learn` hub. `src/app/lib/search.ts`
holds the ranking (title prefix > word boundary > substring > tag > heading >
summary > body, with a span-capped subsequence fallback) and is pure, so it
runs client-side. `SearchPalette` fetches the index on first open and caches
it in a module variable.

### Local progress tracking

`src/app/lib/dsa-progress.ts` owns all three tracks: `dsa-path-progress`
(articles read), `dsa-patterns-progress` (questions solved), and
`learn-progress` (guide chapters, keyed `guide/chapter`). Values are
`slug → ISO date`; a v1 bare-array format is migrated on read, so never write
the old shape back. Components subscribe with `onProgressChange`, which
covers same-tab updates and cross-tab `storage` events.

### The AI tool

`/tools/system-design` calls the Claude API **from the browser with the
visitor's own key** — `src/app/lib/byok.ts` handles key storage (session by
default, device opt-in) and dynamically imports `@anthropic-ai/sdk` with
`dangerouslyAllowBrowser: true`, so its ~190KB only loads on first use. No
key ever reaches a server here; there is no backend.

### Pagination

`/blog` paginates at `POSTS_PER_PAGE` (10) via `paginatePosts()` in
`blog/utils.ts`, which clamps out-of-range pages. The `Pagination` component
preserves the active tag in every link.

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
