'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const N = 7

type Step = {
  filled: number // how many cells are computed (indices 0..filled-1)
  current?: number // the cell just written
  sources?: [number, number] // the two cells summed
  note: string
}

// Climbing stairs: ways[i] = ways[i-1] + ways[i-2], ways[0]=ways[1]=1.
const VALUES = [1, 1, 2, 3, 5, 8, 13, 21] // ways[0..7]

const steps: Step[] = [
  { filled: 2, current: 1, note: 'Base cases: there is 1 way to stand at step 0, and 1 way to reach step 1. Fill those in first.' },
  { filled: 3, current: 2, sources: [0, 1], note: 'ways[2] = ways[1] + ways[0] = 1 + 1 = 2. Each cell reuses two answers we already have.' },
  { filled: 4, current: 3, sources: [1, 2], note: 'ways[3] = ways[2] + ways[1] = 2 + 1 = 3.' },
  { filled: 5, current: 4, sources: [2, 3], note: 'ways[4] = ways[3] + ways[2] = 3 + 2 = 5.' },
  { filled: 6, current: 5, sources: [3, 4], note: 'ways[5] = ways[4] + ways[3] = 5 + 3 = 8.' },
  { filled: 7, current: 6, sources: [4, 5], note: 'ways[6] = ways[5] + ways[4] = 8 + 5 = 13.' },
  { filled: 8, current: 7, sources: [5, 6], note: 'ways[7] = ways[6] + ways[5] = 13 + 8 = 21. One left-to-right pass, no recomputation — this is tabulation.' },
]

export function DPTableVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={1500}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="flex flex-wrap justify-center gap-1.5">
              {Array.from({ length: N + 1 }).map((_, i) => {
                const isFilled = i < step.filled
                const isCurrent = step.current === i
                const isSource =
                  step.sources?.includes(i) && !isCurrent
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={[
                        'flex h-11 w-11 items-center justify-center rounded-md font-mono text-sm transition-all duration-300',
                        isCurrent
                          ? 'bg-amber-500 text-white'
                          : isSource
                            ? 'bg-green-600 text-white dark:bg-green-500'
                            : isFilled
                              ? 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                              : 'border border-dashed border-neutral-200 text-neutral-300 dark:border-neutral-700 dark:text-neutral-700',
                      ].join(' ')}
                    >
                      {isFilled ? VALUES[i] : '·'}
                    </div>
                    <span className="font-mono text-[10px] text-neutral-400 tabular-nums dark:text-neutral-500">
                      {i}
                    </span>
                  </div>
                )
              })}
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
