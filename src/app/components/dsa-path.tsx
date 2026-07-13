'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Difficulty } from '@/app/dsa/curriculum'

export type PathItem = {
  slug?: string
  title: string
  summary?: string
  readingTime?: number
  difficulty: Difficulty
  note: string
}

export type PathPhase = {
  title: string
  description: string
  items: PathItem[]
}

const STORAGE_KEY = 'dsa-path-progress'

const difficultyStyles: Record<Difficulty, string> = {
  Beginner: 'text-accent bg-accent/10',
  Intermediate:
    'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60',
  Advanced: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60',
}

function loadProgress(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [])
  } catch {
    return new Set()
  }
}

export function DsaPath({ phases }: { phases: PathPhase[] }) {
  const [done, setDone] = useState<Set<string>>(new Set())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setDone(loadProgress())
    setHydrated(true)
  }, [])

  const readableSlugs = phases.flatMap((phase) =>
    phase.items.filter((item) => item.slug).map((item) => item.slug!)
  )
  const completedCount = readableSlugs.filter((slug) => done.has(slug)).length
  const percent =
    readableSlugs.length === 0
      ? 0
      : Math.round((completedCount / readableSlugs.length) * 100)

  const nextSlug = hydrated
    ? phases
        .flatMap((phase) => phase.items)
        .find((item) => item.slug && !done.has(item.slug))?.slug
    : undefined

  function toggle(slug: string) {
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
      } else {
        next.add(slug)
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)))
      } catch {
        // storage unavailable (private mode, etc.) — progress just won't persist
      }
      return next
    })
  }

  function reset() {
    setDone(new Set())
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }

  return (
    <div>
      <div className="mb-10 rounded-xl border border-line bg-surface p-4">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm text-ink/80">
            <span className="font-medium text-ink tabular-nums">
              {hydrated ? completedCount : 0}
            </span>{' '}
            of {readableSlugs.length} articles read
          </p>
          <div className="flex items-baseline gap-3">
            {hydrated && completedCount > 0 && (
              <button
                onClick={reset}
                className="text-xs text-muted hover:text-ink transition-colors"
              >
                Reset progress
              </button>
            )}
            <span className="text-sm font-semibold text-accent tabular-nums">
              {hydrated ? percent : 0}%
            </span>
          </div>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-line overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-all duration-300"
            style={{ width: `${hydrated ? percent : 0}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          Progress is saved in your browser.
        </p>
      </div>

      <div className="space-y-12">
        {phases.map((phase, phaseIndex) => {
          const phaseSlugs = phase.items
            .filter((item) => item.slug)
            .map((item) => item.slug!)
          const phaseDone = phaseSlugs.filter((slug) => done.has(slug)).length
          const phaseComplete =
            hydrated && phaseSlugs.length > 0 && phaseDone === phaseSlugs.length
          return (
          <section key={phase.title}>
            <div className="mb-4 flex items-baseline gap-3">
              <span
                className={[
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium tabular-nums transition-colors',
                  phaseComplete
                    ? 'border-accent bg-accent text-white'
                    : 'border-line bg-surface text-muted',
                ].join(' ')}
              >
                {phaseIndex + 1}
              </span>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-ink">
                  {phase.title}
                  {hydrated && phaseSlugs.length > 0 && (
                    <span className="ml-2.5 align-middle text-xs font-normal text-muted tabular-nums">
                      {phaseDone}/{phaseSlugs.length}
                    </span>
                  )}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {phase.description}
                </p>
              </div>
            </div>

            <ol className="ml-3 border-l border-line space-y-1">
              {phase.items.map((item) => {
                const isDone = hydrated && !!item.slug && done.has(item.slug)
                return (
                  <li key={item.slug ?? item.title} className="relative pl-6">
                    <span
                      className={[
                        'absolute -left-[5px] top-5 h-[9px] w-[9px] rounded-full border-2 border-bg',
                        isDone
                          ? 'bg-accent'
                          : 'bg-line',
                      ].join(' ')}
                    />
                    {item.slug ? (
                      <div className="group flex items-start gap-3 rounded-lg py-3 px-3 -mx-3 hover:bg-surface transition-colors">
                        <button
                          onClick={() => toggle(item.slug!)}
                          aria-label={
                            isDone
                              ? `Mark "${item.title}" as unread`
                              : `Mark "${item.title}" as read`
                          }
                          aria-pressed={isDone}
                          className={[
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                            isDone
                              ? 'border-accent bg-accent text-white'
                              : 'border-line text-transparent hover:border-accent',
                          ].join(' ')}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M2.5 6.5L5 9L9.5 3.5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <Link
                              href={`/blog/${item.slug}`}
                              className={[
                                'font-medium transition-colors',
                                isDone
                                  ? 'text-muted line-through decoration-line'
                                  : 'text-ink group-hover:text-accent',
                              ].join(' ')}
                            >
                              {item.title}
                            </Link>
                            {item.slug === nextSlug && (
                              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-white">
                                Up next
                              </span>
                            )}
                            <span
                              className={[
                                'rounded px-1.5 py-0.5 text-[10px] font-medium',
                                difficultyStyles[item.difficulty],
                              ].join(' ')}
                            >
                              {item.difficulty}
                            </span>
                            {item.readingTime && (
                              <span className="text-xs text-muted">
                                {item.readingTime} min
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-muted">
                            {item.note}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 py-3 px-3 -mx-3 opacity-60">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-dashed border-line" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="font-medium text-muted">
                              {item.title}
                            </span>
                            <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-muted bg-line/50">
                              Coming soon
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-muted">
                            {item.note}
                          </p>
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
          </section>
          )
        })}
      </div>
    </div>
  )
}
