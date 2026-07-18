import Link from 'next/link'
import { getBlogPosts, getReadingTime } from '@/app/blog/utils'
import { DsaPath, type PathPhase } from '@/app/components/dsa-path'
import { baseUrl } from '@/app/sitemap'
import { curriculum } from './curriculum'

export const metadata = {
  title: 'Learn DSA',
  description:
    'A structured path through data structures and algorithms — ordered articles with interactive visualizations, from recursion basics to dynamic programming.',
  openGraph: {
    title: 'Learn DSA',
    description:
      'A structured path through data structures and algorithms — ordered articles with interactive visualizations.',
    url: `${baseUrl}/dsa`,
    images: [{ url: `/og?title=${encodeURIComponent('Learn DSA')}` }],
  },
}

export default function Page() {
  const posts = getBlogPosts()

  const phases: PathPhase[] = curriculum.map((phase) => ({
    title: phase.title,
    description: phase.description,
    items: phase.entries.map((entry) => {
      const post = entry.slug
        ? posts.find((p) => p.slug === entry.slug)
        : undefined
      if (entry.slug && !post) {
        throw new Error(`DSA curriculum references missing post: ${entry.slug}`)
      }
      return post
        ? {
            slug: post.slug,
            title: post.metadata.title,
            summary: post.metadata.summary,
            readingTime: getReadingTime(post.content),
            difficulty: entry.difficulty,
            note: entry.note,
          }
        : {
            title: entry.title!,
            difficulty: entry.difficulty,
            note: entry.note,
          }
    }),
  }))

  return (
    <section>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        Learn DSA
      </h1>
      <p className="mb-8 text-sm text-neutral-500 dark:text-neutral-400">
        A structured path through data structures and algorithms. The articles
        build on each other, so follow the order if you&apos;re starting fresh —
        or jump to whatever you want to brush up on. Most posts include
        interactive visualizations you can step through.
      </p>
      <Link
        href="/dsa/patterns"
        className="group mb-10 flex items-center justify-between gap-4 rounded-xl border border-neutral-100 dark:border-neutral-800 p-4 hover:border-green-600/40 dark:hover:border-green-500/40 transition-colors"
      >
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-50 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
            Practice: pattern-wise questions
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Curated LeetCode and GFG questions grouped by pattern — each one
            explained with examples, multiple approaches, and a dry run.
          </p>
        </div>
        <span
          aria-hidden="true"
          className="text-neutral-300 dark:text-neutral-600 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors"
        >
          →
        </span>
      </Link>
      <DsaPath phases={phases} />
    </section>
  )
}
