'use client'

import { useMemo, useSyncExternalStore } from 'react'
import { learnProgress, onProgressChange, type Progress } from '@/app/lib/dsa-progress'

/**
 * Reads learn-progress through useSyncExternalStore. The snapshot is the raw
 * localStorage string — stable between calls, so React only re-renders when
 * it actually changes — and the server snapshot is null, so the first client
 * render matches the static HTML (nothing marked done) before progress loads.
 */
function readRaw(): string | null {
  try {
    return localStorage.getItem(learnProgress.key)
  } catch {
    return null
  }
}

function useLearnProgress(): Progress {
  const raw = useSyncExternalStore(onProgressChange, readRaw, () => null)
  // load() migrates and validates; re-run it only when the stored string changes.
  return useMemo(() => (raw === null ? {} : learnProgress.load()), [raw])
}

export function ChapterDoneButton({ id }: { id: string }) {
  const progress = useLearnProgress()
  const done = Boolean(progress[id])
  return (
    <button
      type="button"
      onClick={() => learnProgress.toggle(id)}
      aria-pressed={done}
      className={[
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors',
        done
          ? 'border-green-600/40 bg-green-600/10 text-green-700 dark:border-green-500/40 dark:text-green-400'
          : 'border-neutral-200 text-neutral-500 hover:border-green-600/40 hover:text-green-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-green-400',
      ].join(' ')}
    >
      <span aria-hidden="true">{done ? '✓' : '○'}</span>
      {done ? 'Done' : 'Mark as done'}
    </button>
  )
}

export function GuideProgressBar({ ids }: { ids: string[] }) {
  const progress = useLearnProgress()
  const done = ids.filter((id) => progress[id]).length
  const pct = ids.length === 0 ? 0 : Math.round((done / ids.length) * 100)
  return (
    <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-neutral-600 dark:text-neutral-300">
          <span className="font-medium text-neutral-900 dark:text-neutral-50">{done}</span> of {ids.length}{' '}
          chapters done
        </span>
        {done > 0 ? (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Clear your progress for this guide?')) learnProgress.clear(ids)
            }}
            className="text-neutral-400 transition-colors hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200"
          >
            Reset
          </button>
        ) : (
          <span className="text-neutral-400 dark:text-neutral-500">saved in this browser only</span>
        )}
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Guide progress"
      >
        <div
          className="h-full rounded-full bg-green-600 transition-[width] duration-500 dark:bg-green-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/** "10 chapters", or "3 / 10 done" once started — for guide and part cards. */
export function GuideProgressCount({ ids }: { ids: string[] }) {
  const progress = useLearnProgress()
  const done = ids.filter((id) => progress[id]).length
  if (done === 0) return <>{ids.length} {ids.length === 1 ? 'chapter' : 'chapters'}</>
  return (
    <span className={done === ids.length ? 'text-green-700 dark:text-green-400' : undefined}>
      {done} / {ids.length} done
    </span>
  )
}
