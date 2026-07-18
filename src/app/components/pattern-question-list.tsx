'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export type QuestionItem = {
  slug: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  summary: string
  leetcode?: string
  gfg?: string
}

export type PracticeItem = {
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  url: string
  source: 'LeetCode' | 'GFG'
}

export type PatternGroup = {
  slug: string
  name: string
  description: string
  spotIt: string
  questions: QuestionItem[]
  practice: PracticeItem[]
}

const STORAGE_KEY = 'dsa-patterns-progress'

const difficultyStyles: Record<QuestionItem['difficulty'], string> = {
  Easy: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/60',
  Medium:
    'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60',
  Hard: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60',
}

function loadProgress(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    return new Set(
      Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : []
    )
  } catch {
    return new Set()
  }
}

export function PatternQuestionList({ groups }: { groups: PatternGroup[] }) {
  const [done, setDone] = useState<Set<string>>(new Set())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setDone(loadProgress())
    setHydrated(true)
  }, [])

  const allSlugs = groups.flatMap((g) => g.questions.map((q) => q.slug))
  const completedCount = allSlugs.filter((slug) => done.has(slug)).length
  const percent =
    allSlugs.length === 0
      ? 0
      : Math.round((completedCount / allSlugs.length) * 100)

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
      <div className="mb-10 rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            <span className="font-medium text-neutral-900 dark:text-neutral-50 tabular-nums">
              {hydrated ? completedCount : 0}
            </span>{' '}
            of {allSlugs.length} questions solved
          </p>
          {hydrated && completedCount > 0 && (
            <button
              onClick={reset}
              className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              Reset progress
            </button>
          )}
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-green-600 dark:bg-green-500 transition-all duration-300"
            style={{ width: `${hydrated ? percent : 0}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
          Progress is saved in your browser.
        </p>
      </div>

      <div className="space-y-12">
        {groups.map((group, groupIndex) => (
          <section key={group.slug} id={group.slug} className="scroll-mt-8">
            <div className="mb-1 flex items-baseline gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-300 tabular-nums">
                {groupIndex + 1}
              </span>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                  {group.name}
                </h2>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {group.description}
                </p>
                <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                  <span className="font-medium text-neutral-500 dark:text-neutral-400">
                    How to spot it:
                  </span>{' '}
                  {group.spotIt}
                </p>
              </div>
            </div>

            <ol className="ml-3 mt-4 border-l border-neutral-100 dark:border-neutral-800 space-y-1">
              {group.questions.map((q) => {
                const isDone = hydrated && done.has(q.slug)
                return (
                  <li key={q.slug} className="relative pl-6">
                    <span
                      className={[
                        'absolute -left-[5px] top-5 h-[9px] w-[9px] rounded-full border-2 border-white dark:border-neutral-950',
                        isDone
                          ? 'bg-green-600 dark:bg-green-500'
                          : 'bg-neutral-200 dark:bg-neutral-700',
                      ].join(' ')}
                    />
                    <div className="group flex items-start gap-3 rounded-lg py-3 px-3 -mx-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                      <button
                        onClick={() => toggle(q.slug)}
                        aria-label={
                          isDone
                            ? `Mark "${q.title}" as unsolved`
                            : `Mark "${q.title}" as solved`
                        }
                        aria-pressed={isDone}
                        className={[
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                          isDone
                            ? 'border-green-600 dark:border-green-500 bg-green-600 dark:bg-green-500 text-white'
                            : 'border-neutral-300 dark:border-neutral-600 text-transparent hover:border-green-600 dark:hover:border-green-500',
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
                            href={`/dsa/patterns/${q.slug}`}
                            className={[
                              'font-medium transition-colors',
                              isDone
                                ? 'text-neutral-400 dark:text-neutral-500 line-through decoration-neutral-300 dark:decoration-neutral-600'
                                : 'text-neutral-800 dark:text-neutral-200 group-hover:text-green-600 dark:group-hover:text-green-400',
                            ].join(' ')}
                          >
                            {q.title}
                          </Link>
                          <span
                            className={[
                              'rounded px-1.5 py-0.5 text-[10px] font-medium',
                              difficultyStyles[q.difficulty],
                            ].join(' ')}
                          >
                            {q.difficulty}
                          </span>
                          {q.leetcode && (
                            <a
                              href={q.leetcode}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                            >
                              LeetCode ↗
                            </a>
                          )}
                          {q.gfg && (
                            <a
                              href={q.gfg}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                            >
                              GFG ↗
                            </a>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                          {q.summary}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>

            {group.practice.length > 0 && (
              <div className="ml-9 mt-2">
                <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
                  More practice
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {group.practice.map((p) => (
                    <li key={p.url}>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-neutral-100 dark:border-neutral-800 px-2 py-1 text-xs text-neutral-600 dark:text-neutral-300 hover:border-green-600/40 dark:hover:border-green-500/40 hover:text-green-700 dark:hover:text-green-400 transition-colors"
                      >
                        {p.title}
                        <span
                          className={[
                            'rounded px-1 py-px text-[9px] font-medium',
                            difficultyStyles[p.difficulty],
                          ].join(' ')}
                        >
                          {p.difficulty}
                        </span>
                        <span className="text-neutral-300 dark:text-neutral-600">
                          {p.source} ↗
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
