'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const CLIENTS = 6
const SPAN = 10 // seconds shown on the axis

// Exponential backoff: wait 1s, then 2s, then 4s.
const CAPS = [1, 2, 4]

// Fixed "random" fractions so the render is deterministic (no hydration drift).
const FRACTIONS = [
  [0.21, 0.58, 0.93, 0.36, 0.72, 0.14],
  [0.95, 0.22, 0.61, 0.88, 0.31, 0.55],
  [0.86, 0.28, 0.54, 0.19, 0.74, 0.39],
]

function cumulative(jitter: boolean) {
  // rows[client] = [t of attempt 1, t of attempt 2, t of attempt 3]
  return Array.from({ length: CLIENTS }, (_, c) => {
    let t = 0
    return CAPS.map((cap, r) => {
      t += jitter ? cap * FRACTIONS[r][c] : cap
      return Number(t.toFixed(2))
    })
  })
}

const NO_JITTER = cumulative(false)
const JITTER = cumulative(true)

function peakBurst(rows: number[][], rounds: number) {
  const times = rows.flatMap((r) => r.slice(0, rounds))
  let peak = 0
  for (const t of times) {
    const n = times.filter((o) => Math.abs(o - t) < 0.25).length
    if (n > peak) peak = n
  }
  return peak
}

const notes = [
  'Six clients hit a failing service at the same moment. Every one of them gets a 503 and decides to retry.',
  'First retry after 1 second. Without jitter every client wakes up at exactly the same instant — the retry is a synchronised spike, the same spike that knocked the service over. With jitter, each client waits a random amount up to 1 second and the load spreads out.',
  'Second retry: the fixed-backoff clients are still in lockstep at t = 3s. Exponential backoff on its own only makes the spikes rarer, not smaller.',
  'Third retry at t = 7s, still a single column. The service gets long quiet stretches punctuated by bursts it cannot absorb — the thundering herd.',
  'Full jitter (wait a random time between 0 and the cap) turns the same number of retries into a smooth trickle. Same retry budget, a fraction of the peak load — and the clients that got through early free up capacity for the rest.',
]

function Lane({
  label,
  rows,
  rounds,
  accent,
}: {
  label: string
  rows: number[][]
  rounds: number
  accent: string
}) {
  return (
    <div className="flex-1">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
        {label}
      </p>
      <div className="relative h-24 rounded-lg bg-neutral-50 dark:bg-neutral-900">
        {/* initial failures at t = 0 */}
        {Array.from({ length: CLIENTS }, (_, c) => (
          <span
            key={`f${c}`}
            className="absolute h-2 w-2 rounded-full bg-red-500"
            style={{ left: '1%', top: `${8 + c * 15}%` }}
          />
        ))}
        {rows.map((times, c) =>
          times.slice(0, rounds).map((t, r) => (
            <span
              key={`${c}-${r}`}
              className={`absolute h-2 w-2 rounded-full transition-all duration-500 ${accent}`}
              style={{ left: `${1 + (t / SPAN) * 96}%`, top: `${8 + c * 15}%` }}
            />
          ))
        )}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
        <span>0s</span>
        <span className="tabular-nums">
          peak burst: {peakBurst(rows, rounds)} req
        </span>
        <span>{SPAN}s</span>
      </div>
    </div>
  )
}

export function RetryBackoffVisualizer() {
  return (
    <StepPlayer length={notes.length} interval={1900}>
      {(index) => {
        const rounds = Math.min(index, CAPS.length)
        return (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              <Lane
                label="backoff, no jitter"
                rows={NO_JITTER}
                rounds={rounds}
                accent="bg-neutral-800 dark:bg-neutral-200"
              />
              <Lane
                label="backoff + full jitter"
                rows={JITTER}
                rounds={rounds}
                accent="bg-green-600 dark:bg-green-500"
              />
            </div>
            <StepNote>{notes[index]}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
