import Link from 'next/link'
import { BlogPosts } from '@/app/components/posts'
import { getAllTags } from '@/app/blog/utils'

export const metadata = {
  title: 'Blog',
  description:
    'Notes on data structures & algorithms, system design, and things I learn along the way.',
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const { tag } = await searchParams
  const tags = getAllTags()

  return (
    <section>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        Blog
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Notes on data structures & algorithms, system design, and things I
        learn along the way.
      </p>

      <Link
        href="/dsa"
        className="group mb-8 flex items-center justify-between gap-4 rounded-xl border border-neutral-100 dark:border-neutral-800 px-4 py-3 hover:border-green-600/40 dark:hover:border-green-500/40 transition-colors"
      >
        <span className="text-sm text-neutral-600 dark:text-neutral-300">
          Learning DSA?{' '}
          <span className="text-neutral-500 dark:text-neutral-400">
            Follow the structured path — ordered articles from recursion to
            dynamic programming.
          </span>
        </span>
        <span className="shrink-0 text-sm text-green-600 dark:text-green-400 group-hover:translate-x-0.5 transition-transform">
          →
        </span>
      </Link>

      {tags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-1">
          <Link
            href="/blog"
            className={[
              'px-3 py-1 rounded-md text-xs transition-colors',
              !tag
                ? 'text-neutral-900 dark:text-neutral-50 font-medium bg-neutral-100 dark:bg-neutral-800'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900',
            ].join(' ')}
          >
            All
          </Link>
          {tags.map((t) => (
            <Link
              key={t}
              href={`/blog?tag=${encodeURIComponent(t)}`}
              className={[
                'px-3 py-1 rounded-md text-xs transition-colors',
                tag === t
                  ? 'text-neutral-900 dark:text-neutral-50 font-medium bg-neutral-100 dark:bg-neutral-800'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900',
              ].join(' ')}
            >
              {t}
            </Link>
          ))}
        </div>
      )}

      <BlogPosts showSummary tag={tag} />
    </section>
  )
}
