import Link from 'next/link'
import { formatDate, getBlogPosts } from '@/app/blog/utils'

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

  return (
    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
      {allBlogs.map((post) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="group block py-4 -mx-3 px-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
        >
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
            <span className="text-sm text-neutral-400 dark:text-neutral-500 tabular-nums shrink-0">
              {formatDate(post.metadata.publishedAt, false)}
            </span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              {post.metadata.title}
            </span>
          </div>
          {showSummary && post.metadata.summary && (
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
              {post.metadata.summary}
            </p>
          )}
          {showSummary && post.metadata.tags && post.metadata.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {post.metadata.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs text-neutral-400 dark:text-neutral-500"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}
