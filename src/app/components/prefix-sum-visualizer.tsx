'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const ARR = [4, 2, 7, 1, 5, 3]
// prefix[0] = 0, prefix[i+1] = prefix[i] + ARR[i]
const PREFIX = [0, 4, 6, 13, 14, 19, 22]

type Step = {
  built: number // how many prefix cells are filled
  adding?: number // index of ARR being added
  range?: [number, number] // inclusive query range over ARR
  reads?: number[] // prefix indices being read
  result?: number
  note: string
}

const steps: Step[] = [
  {
    built: 1,
    note: 'A prefix sum array stores the running total. It starts with a sentinel 0, which makes the query formula work without special cases.',
  },
  { built: 2, adding: 0, note: 'prefix[1] = prefix[0] + 4 = 4 — the sum of the first one element.' },
  { built: 3, adding: 1, note: 'prefix[2] = 4 + 2 = 6. Each cell is one addition, so building the whole table costs O(n).' },
  { built: 4, adding: 2, note: 'prefix[3] = 6 + 7 = 13.' },
  { built: 5, adding: 3, note: 'prefix[4] = 13 + 1 = 14.' },
  { built: 6, adding: 4, note: 'prefix[5] = 14 + 5 = 19.' },
  { built: 7, adding: 5, note: 'prefix[6] = 19 + 3 = 22 — the total of the array. The table is ready.' },
  {
    built: 7,
    range: [1, 3],
    note: 'Now query the sum of indices 1 through 3 (that is 2 + 7 + 1). A loop would touch three cells; we will touch two.',
  },
  {
    built: 7,
    range: [1, 3],
    reads: [4, 1],
    result: 10,
    note: 'sum(1..3) = prefix[4] − prefix[1] = 14 − 4 = 10. Everything before the range cancels out — one subtraction, O(1), regardless of range width.',
  },
  {
    built: 7,
    range: [0, 5],
    reads: [6, 0],
    result: 22,
    note: 'The same formula covers the whole array: prefix[6] − prefix[0] = 22. That sentinel zero is why no special case is needed for ranges starting at 0.',
  },
]

export function PrefixSumVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={1500}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              nums
            </p>
            <div className="flex gap-1 pr-[14%]">
              {ARR.map((v, i) => {
                const inRange =
                  step.range !== undefined && i >= step.range[0] && i <= step.range[1]
                const isAdding = step.adding === i
                return (
                  <div
                    key={i}
                    className={[
                      'flex h-9 flex-1 items-center justify-center rounded-md font-mono text-sm transition-colors duration-300',
                      isAdding
                        ? 'bg-amber-500 text-white'
                        : inRange
                          ? 'bg-green-600/70 dark:bg-green-500/70 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
                    ].join(' ')}
                  >
                    {v}
                  </div>
                )
              })}
            </div>

            <p className="mt-4 mb-2 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              prefix
            </p>
            <div className="flex gap-1">
              {PREFIX.map((v, i) => {
                const filled = i < step.built
                const isRead = step.reads?.includes(i)
                const justAdded = step.adding !== undefined && i === step.built - 1
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className={[
                        'flex h-9 w-full items-center justify-center rounded-md font-mono text-sm transition-colors duration-300',
                        isRead
                          ? 'bg-amber-500 text-white'
                          : justAdded
                            ? 'bg-green-600 dark:bg-green-500 text-white'
                            : filled
                              ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100'
                              : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-300 dark:text-neutral-600',
                      ].join(' ')}
                    >
                      {filled ? v : '·'}
                    </div>
                    <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                      {i}
                    </span>
                  </div>
                )
              })}
            </div>

            <p className="mt-3 text-center font-mono text-xs text-neutral-600 dark:text-neutral-300">
              {step.result !== undefined && step.range
                ? `sum(${step.range[0]}..${step.range[1]}) = ${step.result}`
                : ' '}
            </p>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
