import Link from 'next/link'

function pageHref(page: number, tag?: string) {
  const params = new URLSearchParams()
  if (tag) params.set('tag', tag)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `/blog?${query}` : '/blog'
}

/**
 * Page numbers to render: always the first and last, plus a window around the
 * current page, with gaps collapsed to an ellipsis.
 */
function pageItems(page: number, totalPages: number): (number | 'gap')[] {
  const keep = new Set([1, totalPages, page - 1, page, page + 1])
  const items: (number | 'gap')[] = []

  for (let i = 1; i <= totalPages; i++) {
    if (keep.has(i)) {
      items.push(i)
    } else if (items[items.length - 1] !== 'gap') {
      items.push('gap')
    }
  }
  return items
}

const linkClass =
  'rounded-md px-2.5 py-1 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors'

export function Pagination({
  page,
  totalPages,
  tag,
}: {
  page: number
  totalPages: number
  tag?: string
}) {
  if (totalPages <= 1) return null

  return (
    <nav
      aria-label="Blog pagination"
      className="mt-10 flex items-center justify-between gap-2 border-t border-neutral-100 dark:border-neutral-800 pt-6"
    >
      {page > 1 ? (
        <Link href={pageHref(page - 1, tag)} rel="prev" className={linkClass}>
          ← Newer
        </Link>
      ) : (
        <span className="px-2.5 py-1 text-sm text-neutral-300 dark:text-neutral-700">
          ← Newer
        </span>
      )}

      <div className="flex items-center gap-0.5">
        {pageItems(page, totalPages).map((item, i) =>
          item === 'gap' ? (
            <span
              key={`gap-${i}`}
              aria-hidden="true"
              className="px-1 text-sm text-neutral-300 dark:text-neutral-700"
            >
              …
            </span>
          ) : item === page ? (
            <span
              key={item}
              aria-current="page"
              className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-sm font-medium text-neutral-900 dark:text-neutral-50 tabular-nums"
            >
              {item}
            </span>
          ) : (
            <Link
              key={item}
              href={pageHref(item, tag)}
              aria-label={`Page ${item}`}
              className={`${linkClass} tabular-nums`}
            >
              {item}
            </Link>
          )
        )}
      </div>

      {page < totalPages ? (
        <Link href={pageHref(page + 1, tag)} rel="next" className={linkClass}>
          Older →
        </Link>
      ) : (
        <span className="px-2.5 py-1 text-sm text-neutral-300 dark:text-neutral-700">
          Older →
        </span>
      )}
    </nav>
  )
}
