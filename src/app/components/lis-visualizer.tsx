'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const SEQ = [3, 1, 4, 1, 5, 9, 2, 6]

type Step = {
  i: number | null
  tails: number[]
  replacedAt?: number
  appended?: boolean
  note: string
}

const steps: Step[] = [
  {
    i: null,
    tails: [],
    note: 'The longest increasing subsequence of this array. The O(n²) dynamic program is the usual answer; this is the O(n log n) one, and it keeps a single extra array.',
  },
  {
    i: 0,
    tails: [3],
    appended: true,
    note: 'tails[k] holds the smallest possible tail of an increasing subsequence of length k+1. First element: the only subsequence of length 1 ends in 3.',
  },
  {
    i: 1,
    tails: [1],
    replacedAt: 0,
    note: '1 is smaller than 3, so it replaces it. A length-1 subsequence ending in 1 is strictly better than one ending in 3 — it leaves more room for whatever comes next. The length did not change.',
  },
  {
    i: 2,
    tails: [1, 4],
    appended: true,
    note: '4 is larger than every tail, so it extends the longest run: [1, 4] has length 2. Appending is the only operation that grows the answer.',
  },
  {
    i: 3,
    tails: [1, 4],
    replacedAt: 0,
    note: 'Another 1. It replaces the existing 1 — same value, no change. Note that tails is not a real subsequence; it is a set of best-case endings.',
  },
  {
    i: 4,
    tails: [1, 4, 5],
    appended: true,
    note: '5 beats every tail, so it appends: length 3.',
  },
  {
    i: 5,
    tails: [1, 4, 5, 9],
    appended: true,
    note: '9 appends too: length 4, via [1, 4, 5, 9].',
  },
  {
    i: 6,
    tails: [1, 2, 5, 9],
    replacedAt: 1,
    note: '2 is the interesting case. Binary search finds the first tail larger than it — 4 — and overwrites it. There is now a length-2 subsequence ending in 2 ([1, 2]), which is more promising than one ending in 4.',
  },
  {
    i: 7,
    tails: [1, 2, 5, 6],
    replacedAt: 3,
    note: '6 replaces 9 for the same reason. The length stays at 4, but the ending is lower, so a later 7 or 8 could still extend it.',
  },
  {
    i: null,
    tails: [1, 2, 5, 6],
    note: 'Length 4. The tails array — [1, 2, 5, 6] — is not the subsequence itself; the real one is [1, 4, 5, 9] or [1, 4, 5, 6]. To recover it, record each element’s position in tails and a parent pointer as you go.',
  },
]

export function LISVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2100}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              input
            </p>
            <div className="flex gap-1">
              {SEQ.map((v, i) => (
                <div
                  key={i}
                  className={[
                    'flex h-8 flex-1 items-center justify-center rounded-md font-mono text-[11px] transition-colors duration-300',
                    step.i === i
                      ? 'bg-amber-500 text-white'
                      : step.i !== null && i < step.i
                        ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500',
                  ].join(' ')}
                >
                  {v}
                </div>
              ))}
            </div>

            <p className="mt-4 mb-1.5 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              tails — smallest ending for each length
            </p>
            <div className="flex gap-1">
              {step.tails.map((v, k) => (
                <div key={k} className="flex flex-col items-center gap-1" style={{ width: `${100 / SEQ.length}%` }}>
                  <div
                    className={[
                      'flex h-8 w-full items-center justify-center rounded-md font-mono text-[11px] transition-colors duration-300',
                      step.replacedAt === k
                        ? 'bg-amber-500 text-white'
                        : step.appended && k === step.tails.length - 1
                          ? 'bg-green-600 dark:bg-green-500 text-white'
                          : 'bg-green-600/60 dark:bg-green-500/60 text-white',
                    ].join(' ')}
                  >
                    {v}
                  </div>
                  <span className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
                    len {k + 1}
                  </span>
                </div>
              ))}
              {step.tails.length === 0 && (
                <span className="font-mono text-[10px] text-neutral-300 dark:text-neutral-600">
                  empty
                </span>
              )}
            </div>

            <p className="mt-3 font-mono text-[10px] text-neutral-400 dark:text-neutral-500 tabular-nums">
              LIS length so far: {step.tails.length}
              {step.replacedAt !== undefined ? ' · replaced (length unchanged)' : ''}
              {step.appended ? ' · appended (length grew)' : ''}
            </p>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
