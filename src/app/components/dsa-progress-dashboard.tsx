'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  onProgressChange,
  pathProgress,
  questionProgress,
  type Progress,
} from '@/app/lib/dsa-progress'

export type QuestionMeta = {
  slug: string
  title: string
  pattern: string
  patternName: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

export type ArticleMeta = {
  slug: string
  title: string
  phase: string
}

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const

const DIFFICULTY_BAR: Record<(typeof DIFFICULTIES)[number], string> = {
  Easy: 'bg-green-600 dark:bg-green-500',
  Medium: 'bg-amber-500',
  Hard: 'bg-rose-500',
}

function Bar({ done, total, className = 'bg-green-600 dark:bg-green-500' }: {
  done: number
  total: number
  className?: string
}) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
      <div
        className={`h-full rounded-full transition-all duration-500 ${className}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

/** Last 12 weeks of activity, oldest first. */
function activityWeeks(dates: string[]) {
  const counts = new Map<string, number>()
  dates.forEach((d) => counts.set(d, (counts.get(d) ?? 0) + 1))

  const days: { date: string; count: number }[] = []
  const cursor = new Date()
  for (let i = 0; i < 84; i++) {
    const key = cursor.toISOString().slice(0, 10)
    days.unshift({ date: key, count: counts.get(key) ?? 0 })
    cursor.setDate(cursor.getDate() - 1)
  }
  return days
}

export function DsaProgressDashboard({
  questions,
  articles,
}: {
  questions: QuestionMeta[]
  articles: ArticleMeta[]
}) {
  const [solved, setSolved] = useState<Progress>({})
  const [read, setRead] = useState<Progress>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const sync = () => {
      setSolved(questionProgress.load())
      setRead(pathProgress.load())
    }
    sync()
    setHydrated(true)
    return onProgressChange(sync)
  }, [])

  if (!hydrated) {
    return (
      <div className="h-64 animate-pulse rounded-xl border border-neutral-100 dark:border-neutral-800" />
    )
  }

  const solvedCount = questions.filter((q) => solved[q.slug]).length
  const readCount = articles.filter((a) => read[a.slug]).length

  const patterns = Array.from(
    questions.reduce((map, q) => {
      const entry = map.get(q.pattern) ?? { name: q.patternName, total: 0, done: 0, next: '' }
      entry.total++
      if (solved[q.slug]) entry.done++
      else if (!entry.next) entry.next = q.slug
      map.set(q.pattern, entry)
      return map
    }, new Map<string, { name: string; total: number; done: number; next: string }>())
  )

  const upNext = questions.filter((q) => !solved[q.slug]).slice(0, 3)
  const allDates = [...Object.values(solved), ...Object.values(read)]
  const days = activityWeeks(allDates)
  const last7 = days.slice(-7).reduce((sum, d) => sum + d.count, 0)
  const last30 = days.slice(-30).reduce((sum, d) => sum + d.count, 0)

  const exportProgress = () => {
    const blob = new Blob([JSON.stringify({ solved, read }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dsa-progress.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-10">
      {/* headline numbers */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { value: `${solvedCount}/${questions.length}`, label: 'questions solved' },
          { value: `${readCount}/${articles.length}`, label: 'path articles read' },
          { value: last7, label: 'completed this week' },
          { value: last30, label: 'completed in 30 days' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-neutral-100 dark:border-neutral-800 px-3 py-3"
          >
            <p className="font-mono text-xl tabular-nums text-neutral-900 dark:text-neutral-50">
              {stat.value}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* by difficulty */}
      <div>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          By difficulty
        </h2>
        <div className="space-y-2.5">
          {DIFFICULTIES.map((difficulty) => {
            const inGroup = questions.filter((q) => q.difficulty === difficulty)
            if (inGroup.length === 0) return null
            const done = inGroup.filter((q) => solved[q.slug]).length
            return (
              <div key={difficulty}>
                <div className="mb-1 flex items-baseline justify-between text-xs">
                  <span className="text-neutral-600 dark:text-neutral-300">{difficulty}</span>
                  <span className="font-mono tabular-nums text-neutral-400 dark:text-neutral-500">
                    {done}/{inGroup.length}
                  </span>
                </div>
                <Bar done={done} total={inGroup.length} className={DIFFICULTY_BAR[difficulty]} />
              </div>
            )
          })}
        </div>
      </div>

      {/* activity */}
      <div>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Last 12 weeks
        </h2>
        <div className="grid w-fit grid-flow-col grid-rows-7 gap-[3px]">
          {days.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.count} completed`}
              className={[
                'h-3 w-3 rounded-[2px]',
                day.count === 0
                  ? 'bg-neutral-100 dark:bg-neutral-800'
                  : day.count < 3
                    ? 'bg-green-600/40 dark:bg-green-500/40'
                    : 'bg-green-600 dark:bg-green-500',
              ].join(' ')}
            />
          ))}
        </div>
        {allDates.length === 0 && (
          <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
            Nothing marked complete yet — the grid fills in as you go.
          </p>
        )}
      </div>

      {/* per pattern */}
      <div>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          By pattern
        </h2>
        <div className="space-y-3">
          {patterns.map(([slug, group]) => (
            <div key={slug}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
                <Link
                  href={`/dsa/patterns#${slug}`}
                  className="truncate text-neutral-600 dark:text-neutral-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  {group.name}
                </Link>
                <span className="shrink-0 font-mono tabular-nums text-neutral-400 dark:text-neutral-500">
                  {group.done}/{group.total}
                  {group.done === group.total && ' ✓'}
                </span>
              </div>
              <Bar done={group.done} total={group.total} />
            </div>
          ))}
        </div>
      </div>

      {/* what to do next */}
      <div>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Up next
        </h2>
        {upNext.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Every question is marked solved. Worth a second pass on the ones you
            had to look up.
          </p>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {upNext.map((question) => (
              <Link
                key={question.slug}
                href={`/dsa/patterns/${question.slug}`}
                className="group -mx-3 flex items-baseline justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
              >
                <span className="text-sm text-neutral-800 dark:text-neutral-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {question.title}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                  {question.patternName} · {question.difficulty}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 dark:border-neutral-800 pt-5 text-xs">
        <button
          type="button"
          onClick={exportProgress}
          className="rounded-md border border-neutral-200 dark:border-neutral-700 px-2.5 py-1 text-neutral-500 dark:text-neutral-400 hover:border-green-600 dark:hover:border-green-500 hover:text-green-700 dark:hover:text-green-400 transition-colors"
        >
          Export as JSON
        </button>
        <button
          type="button"
          onClick={() => {
            if (!confirm('Clear all DSA progress on this device?')) return
            questionProgress.clear()
            pathProgress.clear()
          }}
          className="rounded-md px-2.5 py-1 text-neutral-400 dark:text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
        >
          Reset everything
        </button>
        <span className="ml-auto text-neutral-400 dark:text-neutral-500">
          Saved in this browser only
        </span>
      </div>
    </div>
  )
}
