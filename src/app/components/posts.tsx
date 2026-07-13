import Link from 'next/link'
import { getBlogPosts, getReadingTime } from '@/app/blog/utils'

function shortDate(date: string) {
  if (!date.includes('T')) {
    date = `${date}T00:00:00`
  }
  return new Date(date).toLocaleString('en-us', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function BlogPosts({
  limit,
  showSummary = false,
  tag,
}: {
  limit?: number
  showSummary?: boolean
  tag?: string
} = {}) {
  const allBlogs = getBlogPosts()
    .filter((post) => !tag || post.metadata.tags?.includes(tag))
    .sort(
      (a, b) =>
        new Date(b.metadata.publishedAt).getTime() -
        new Date(a.metadata.publishedAt).getTime()
    )
    .slice(0, limit)

  if (!showSummary) {
    return (
      <div className="divide-y divide-line">
        {allBlogs.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex items-baseline justify-between gap-4 py-3.5"
          >
            <span className="font-medium text-ink group-hover:text-accent transition-colors">
              {post.metadata.title}
            </span>
            <span className="shrink-0 text-xs text-muted tabular-nums">
              {shortDate(post.metadata.publishedAt)}
            </span>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {allBlogs.map((post) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="group block rounded-xl border border-line bg-surface px-5 py-4 transition-all hover:border-accent/60 hover:shadow-[0_2px_16px_rgba(42,46,58,0.06)]"
        >
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-semibold text-ink group-hover:text-accent transition-colors">
              {post.metadata.title}
            </span>
            <span className="shrink-0 text-xs text-muted tabular-nums">
              {shortDate(post.metadata.publishedAt)}
            </span>
          </div>
          {post.metadata.summary && (
            <p className="mt-1.5 text-sm text-muted line-clamp-2">
              {post.metadata.summary}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {post.metadata.tags?.map((t) => (
              <span
                key={t}
                className="rounded-full bg-bg px-2.5 py-0.5 text-[11px] text-muted"
              >
                {t}
              </span>
            ))}
            <span className="ml-auto text-[11px] text-muted">
              {getReadingTime(post.content)} min read
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
