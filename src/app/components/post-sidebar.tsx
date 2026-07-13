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
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted">
          Share
        </p>
        <div className="flex flex-col gap-2 text-xs">
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-ink transition-colors"
          >
            Share on X
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-ink transition-colors"
          >
            Share on LinkedIn
          </a>
          <CopyLinkButton url={url} />
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted">
            Related
          </p>
          <ul className="space-y-3 text-xs">
            {related.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block leading-snug text-ink/80 hover:text-accent transition-colors"
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
