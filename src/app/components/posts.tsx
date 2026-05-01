import Link from 'next/link'
import { formatDate, getBlogPosts } from '@/app/blog/utils'

export function BlogPosts() {
  const allBlogs = getBlogPosts().sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime()
  )

  return (
    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
      {allBlogs.map((post) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="group flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 -mx-3 px-3 rounded-lg transition-colors"
        >
          <span className="text-sm text-neutral-400 dark:text-neutral-500 tabular-nums shrink-0">
            {formatDate(post.metadata.publishedAt, false)}
          </span>
          <span className="font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
            {post.metadata.title}
          </span>
        </Link>
      ))}
    </div>
  )
}
