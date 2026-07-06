'use client'

import { ReactNode, useEffect, useState } from 'react'

export function StepPlayer({
  length,
  interval = 1500,
  children,
}: {
  length: number
  interval?: number
  children: (index: number) => ReactNode
}) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setIndex((i) => Math.min(i + 1, length - 1))
    }, interval)
    return () => clearInterval(id)
  }, [playing, length, interval])

  useEffect(() => {
    if (index >= length - 1) setPlaying(false)
  }, [index, length])

  return (
    <div className="not-prose my-6 rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
      {children(index)}
      <div className="mt-3 flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          {playing ? 'Pause' : index >= length - 1 ? 'Replay' : 'Play'}
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false)
            setIndex((i) => Math.max(i - 1, 0))
          }}
          className="px-3 py-1.5 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false)
            setIndex((i) => Math.min(i + 1, length - 1))
          }}
          className="px-3 py-1.5 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          Next
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false)
            setIndex(0)
          }}
          className="px-3 py-1.5 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          Reset
        </button>
        <span className="ml-auto text-neutral-400 dark:text-neutral-500 tabular-nums">
          {index} / {length - 1}
        </span>
      </div>
    </div>
  )
}

export function StepNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-400 min-h-8">
      {children}
    </p>
  )
}
