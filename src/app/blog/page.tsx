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
      <h1 className="mb-3 text-3xl sm:text-4xl font-bold tracking-tight text-ink">
        Writing
        <span className="text-accent">.</span>
      </h1>
      <p className="mb-8 leading-relaxed text-ink/70">
        Notes on data structures & algorithms, system design, and things I
        learn along the way.
      </p>

      <Link
        href="/dsa"
        className="group mb-8 flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-accent to-accent-2 px-5 py-4 text-white shadow-sm hover:shadow-md transition-shadow"
      >
        <span className="text-sm font-medium">
          Learning DSA?{' '}
          <span className="font-normal text-white/75">
            Follow the structured path — ordered articles from recursion to
            dynamic programming.
          </span>
        </span>
        <span className="shrink-0 group-hover:translate-x-0.5 transition-transform">
          →
        </span>
      </Link>

      {tags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/blog"
            className={[
              'px-3 py-1 rounded-full text-xs border transition-colors',
              !tag
                ? 'border-accent bg-accent text-white font-medium'
                : 'border-line bg-surface text-muted hover:border-accent/50 hover:text-ink',
            ].join(' ')}
          >
            All
          </Link>
          {tags.map((t) => (
            <Link
              key={t}
              href={`/blog?tag=${encodeURIComponent(t)}`}
              className={[
                'px-3 py-1 rounded-full text-xs border transition-colors',
                tag === t
                  ? 'border-accent bg-accent text-white font-medium'
                  : 'border-line bg-surface text-muted hover:border-accent/50 hover:text-ink',
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
