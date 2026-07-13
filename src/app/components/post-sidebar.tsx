import Link from 'next/link'
import { CopyLinkButton } from '@/app/components/copy-link-button'
import { getRelatedPosts } from '@/app/blog/utils'

export function PostSidebar({
  slug,
  title,
  url,
}: {
  slug: string
  title: string
  url: string
}) {
  const related = getRelatedPosts(slug)

  return (
    <aside className="hidden xl:block fixed right-[max(1rem,calc(50%-608px))] top-32 w-52">
      <div className="mb-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Share
        </p>
        <div className="flex flex-col gap-2 text-xs">
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
          >
            Share on X
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
          >
            Share on LinkedIn
          </a>
          <CopyLinkButton url={url} />
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Related
          </p>
          <ul className="space-y-3 text-xs">
            {related.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block leading-snug text-neutral-600 dark:text-neutral-300 hover:text-green-700 dark:hover:text-green-400 transition-colors"
                >
                  {post.metadata.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
