import Link from 'next/link'
import { baseUrl } from '@/app/sitemap'
import { GuideProgressCount } from '@/app/components/learn-progress'
import { guideProgressIds, type Guide } from './guide'
import { javascriptGuide } from './guides/javascript'
import { webGuide } from './guides/web'

const TITLE = 'Learn'
const DESCRIPTION =
  'Guided, animated walkthroughs of how things really work — the web and JavaScript — each one page long, beginner-friendly, with progress you can track.'

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/learn' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${baseUrl}/learn`,
    images: [{ url: `/og?title=${encodeURIComponent('Learn how things work')}` }],
  },
}

// Ordered as a suggested path: how a page reaches you, then the language that runs in it.
const GUIDES: Guide[] = [webGuide, javascriptGuide]

const MORE = [
  { href: '/dsa', title: 'Learn DSA', text: 'An ordered path through data structures and algorithms.' },
  { href: '/blog?tag=TypeScript', title: 'TypeScript', text: 'Types, narrowing, generics and more, once JavaScript feels solid.' },
  { href: '/blog?tag=System%20Design', title: 'System design', text: 'What happens on the server side, at scale.' },
]

export default function Page() {
  return (
    <section>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        Learn how things work
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        Each guide is one page, read top to bottom: short chapters, each built
        around an animation you can play or step through. They start from the
        basics, and your progress is saved in this browser.
      </p>

      <div className="space-y-3">
        {GUIDES.map((guide, i) => {
          const ids = guideProgressIds(guide)
          return (
            <Link
              key={guide.slug}
              href={`/learn/${guide.slug}`}
              className="group block rounded-xl border border-neutral-100 dark:border-neutral-800 p-4 transition-colors hover:border-green-600/40 dark:hover:border-green-500/40"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
                  Guide {i + 1} · {guide.parts.length} parts
                </span>
                <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                  <GuideProgressCount ids={ids} />
                </span>
              </div>
              <p className="mt-1 font-medium text-neutral-900 dark:text-neutral-50 transition-colors group-hover:text-green-600 dark:group-hover:text-green-400">
                {guide.title} →
              </p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{guide.description}</p>
            </Link>
          )
        })}
      </div>

      <h2 className="mb-3 mt-12 text-sm font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
        Keep going
      </h2>
      <div className="grid gap-2 sm:grid-cols-3">
        {MORE.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-xl border border-neutral-100 dark:border-neutral-800 p-3 transition-colors hover:border-green-600/40 dark:hover:border-green-500/40"
          >
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50 transition-colors group-hover:text-green-600 dark:group-hover:text-green-400">
              {item.title}
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{item.text}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
