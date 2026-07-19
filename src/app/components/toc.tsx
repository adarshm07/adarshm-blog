'use client'

import { useEffect, useState } from 'react'

type HeadingItem = {
  id: string
  text: string
  level: number
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<HeadingItem[]>([])
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('article h2, article h3')
    )
    // eslint-disable-next-line react-hooks/set-state-in-effect -- headings only exist in the rendered DOM, so they must be read after mount
    setHeadings(
      elements.map((el) => ({
        id: el.id,
        text: el.textContent?.replace(/^#/, '').trim() ?? '',
        level: el.tagName === 'H3' ? 3 : 2,
      }))
    )

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: '-80px 0px -70% 0px' }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  if (headings.length < 2) return null

  return (
    <nav
      aria-label="Table of contents"
      className="hidden xl:block fixed left-[max(1rem,calc(50%-608px))] top-32 w-52 max-h-[70vh] overflow-y-auto"
    >
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
        On this page
      </p>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? 'ml-3' : ''}>
            <a
              href={`#${heading.id}`}
              className={[
                'block border-l-2 pl-3 text-xs leading-relaxed transition-colors',
                activeId === heading.id
                  ? 'border-green-600 text-green-700 dark:text-green-400 font-medium'
                  : 'border-neutral-100 dark:border-neutral-800 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200',
              ].join(' ')}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
