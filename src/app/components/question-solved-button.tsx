'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'dsa-patterns-progress'

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

export function QuestionSolvedButton({ slug }: { slug: string }) {
  const [solved, setSolved] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setSolved(loadProgress().has(slug))
    setHydrated(true)
  }, [slug])

  function toggle() {
    const progress = loadProgress()
    if (progress.has(slug)) {
      progress.delete(slug)
    } else {
      progress.add(slug)
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(progress)))
    } catch {
      // storage unavailable — state still toggles for this visit
    }
    setSolved(progress.has(slug))
  }

  return (
    <button
      onClick={toggle}
      aria-pressed={solved}
      className={[
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
        hydrated && solved
          ? 'border-green-600 dark:border-green-500 bg-green-600 dark:bg-green-500 text-white'
          : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-green-600 dark:hover:border-green-500 hover:text-green-700 dark:hover:text-green-400',
      ].join(' ')}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M2.5 6.5L5 9L9.5 3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {hydrated && solved ? 'Solved' : 'Mark as solved'}
    </button>
  )
}
