'use client'

import { useEffect, useRef, useState } from 'react'

const WINDOW_MS = 10000
const DELAY_MS = 800

type Dot = { t: number }

function Track({
  label,
  dots,
  color,
}: {
  label: string
  dots: Dot[]
  color: string
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
          {label}
        </span>
        <span className="text-[10px] tabular-nums text-neutral-400 dark:text-neutral-500">
          {dots.length} {dots.length === 1 ? 'call' : 'calls'}
        </span>
      </div>
      <div className="relative h-7 rounded-md border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
        {dots.map((dot, i) => (
          <span
            key={i}
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full ${color}`}
            style={{ left: `${Math.min((dot.t / WINDOW_MS) * 100, 99)}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function SignalTimeline() {
  const [raw, setRaw] = useState<Dot[]>([])
  const [debounced, setDebounced] = useState<Dot[]>([])
  const [throttled, setThrottled] = useState<Dot[]>([])
  const start = useRef<number | null>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastThrottle = useRef(-Infinity)

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  function reset() {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = null
    start.current = null
    lastThrottle.current = -Infinity
    setRaw([])
    setDebounced([])
    setThrottled([])
  }

  function fire() {
    const now = performance.now()
    if (start.current === null || now - start.current > WINDOW_MS) {
      reset()
      start.current = now
    }
    const t = now - start.current

    setRaw((d) => [...d, { t }])

    // throttle: fire on the leading edge, then ignore for DELAY_MS
    if (t - lastThrottle.current >= DELAY_MS) {
      lastThrottle.current = t
      setThrottled((d) => [...d, { t }])
    }

    // debounce: (re)start the timer; fires only after DELAY_MS of silence
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      if (start.current === null) return
      const ft = performance.now() - start.current
      if (ft <= WINDOW_MS) setDebounced((d) => [...d, { t: ft }])
    }, DELAY_MS)
  }

  return (
    <div className="not-prose my-6 rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
      <div className="flex flex-col gap-3">
        <Track
          label="Raw events"
          dots={raw}
          color="bg-neutral-400 dark:bg-neutral-500"
        />
        <Track label="Debounced · 800 ms" dots={debounced} color="bg-green-600 dark:bg-green-500" />
        <Track label="Throttled · 800 ms" dots={throttled} color="bg-amber-500" />
      </div>

      <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-400">
        Mash the button in bursts, pause, then burst again. Debounce waits for
        silence; throttle fires immediately but at most once per 800 ms. The
        timeline covers 10 seconds, then starts over.
      </p>

      <div className="mt-3 flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={fire}
          className="px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          Fire event (click fast!)
        </button>
        <button
          type="button"
          onClick={reset}
          className="px-3 py-1.5 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
