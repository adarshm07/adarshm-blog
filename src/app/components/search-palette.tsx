'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SearchDoc } from '@/app/lib/search-index'
import { highlight, searchDocs, type SearchHit } from '@/app/lib/search'

const KIND_LABEL: Record<SearchDoc['kind'], string> = {
  post: 'Post',
  question: 'Practice',
  page: 'Page',
}

function Highlighted({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlight(text, query).map((part, i) =>
        part.match ? (
          <mark
            key={i}
            className="bg-transparent text-green-700 dark:text-green-400 font-medium"
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </>
  )
}

// Fetched once per page load, then reused for every subsequent open.
let cachedIndex: SearchDoc[] | null = null

export function SearchPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [index, setIndex] = useState<SearchDoc[] | null>(cachedIndex)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!open || index) return
    let cancelled = false
    fetch('/search-index')
      .then((res) => res.json())
      .then((docs: SearchDoc[]) => {
        cachedIndex = docs
        if (!cancelled) setIndex(docs)
      })
      .catch(() => {
        // offline or the asset failed — the palette shows an empty state
      })
    return () => {
      cancelled = true
    }
  }, [open, index])

  // With no query, offer the newest posts rather than an empty panel.
  const recent = useMemo<SearchHit[]>(
    () =>
      (index ?? [])
        .filter((doc) => doc.kind === 'post')
        .slice(0, 5)
        .map((doc) => ({ doc, score: 0 })),
    [index]
  )

  const hits = useMemo(
    () => (query.trim() ? searchDocs(index ?? [], query) : recent),
    [index, query, recent]
  )

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setActive(0)
  }, [])

  const go = useCallback(
    (hit: SearchHit | undefined) => {
      if (!hit) return
      close()
      router.push(hit.doc.href)
    },
    [close, router]
  )

  // ⌘K / Ctrl+K anywhere, and "/" when not already typing somewhere.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable

      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === '/' && !typing && !open) {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  // Focus the input on open and stop the page behind from scrolling.
  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  useEffect(() => setActive(0), [query])

  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search the site"
        className="ml-auto flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M13.5 13.5 17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline rounded border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
          ⌘K
        </kbd>
      </button>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={close}
        className="absolute inset-0 cursor-default bg-neutral-950/30 backdrop-blur-sm dark:bg-neutral-950/60"
      />

      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-2xl">
        <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 px-4">
          <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-neutral-400" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13.5 13.5 17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                close()
              } else if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((i) => (hits.length ? (i + 1) % hits.length : 0))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive((i) => (hits.length ? (i - 1 + hits.length) % hits.length : 0))
              } else if (e.key === 'Enter') {
                e.preventDefault()
                go(hits[active])
              }
            }}
            placeholder="Search posts, practice questions…"
            aria-label="Search query"
            aria-controls="search-results"
            className="w-full bg-transparent py-3.5 text-sm text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none"
          />
          <kbd className="hidden sm:block rounded border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
            esc
          </kbd>
        </div>

        {!index ? (
          <p className="px-4 py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
            Loading index…
          </p>
        ) : hits.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
            No results for “{query.trim()}”.
          </p>
        ) : (
          <>
            {!query.trim() && (
              <p className="px-4 pt-3 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                Latest posts
              </p>
            )}
            <ul id="search-results" ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
              {hits.map((hit, i) => (
                <li key={hit.doc.id}>
                  <button
                    type="button"
                    onClick={() => go(hit)}
                    onMouseMove={() => setActive(i)}
                    aria-current={i === active}
                    className={[
                      'w-full rounded-lg px-2.5 py-2 text-left transition-colors',
                      i === active
                        ? 'bg-neutral-100 dark:bg-neutral-800'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-900',
                    ].join(' ')}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm text-neutral-900 dark:text-neutral-50">
                        <Highlighted text={hit.doc.title} query={query} />
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                        {KIND_LABEL[hit.doc.kind]}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">
                      {hit.matchedHeading ? (
                        <>
                          <span className="text-neutral-400 dark:text-neutral-500">§ </span>
                          <Highlighted text={hit.matchedHeading} query={query} />
                        </>
                      ) : (
                        <Highlighted
                          text={hit.snippet ?? hit.doc.summary}
                          query={query}
                        />
                      )}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="flex items-center gap-3 border-t border-neutral-100 dark:border-neutral-800 px-4 py-2 font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
          <span className="ml-auto tabular-nums">
            {index ? `${index.length} indexed` : '…'}
          </span>
        </div>
      </div>
    </div>
  )
}
