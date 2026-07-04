import type { Heading } from '@/app/blog/utils'

export function TableOfContents({ headings }: { headings: Heading[] }) {
  if (headings.length === 0) return null

  return (
    <aside
      className="hidden xl:block fixed top-32 w-52 text-sm"
      style={{ left: 'calc(50% - 35rem)' }}
    >
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
        On this page
      </p>
      <ul className="space-y-2.5 border-l border-neutral-100 dark:border-neutral-800">
        {headings.map((heading) => (
          <li key={heading.slug} style={{ paddingLeft: heading.level === 3 ? '2rem' : '1rem' }}>
            <a
              href={`#${heading.slug}`}
              className="block text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}
