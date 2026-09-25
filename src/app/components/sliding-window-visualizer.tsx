'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const ARRAY = [2, 1, 5, 1, 3, 2]

type Step = {
  start: number
  end: number // inclusive right edge of the window
  sum: number
  best: number
  note: string
}

// Fixed-size window of length K, tracking the max sum.
const steps: Step[] = [
  { start: 0, end: 2, sum: 8, best: 8, note: 'Build the first window of size 3: [2, 1, 5] = 8. That is our best so far.' },
  { start: 1, end: 3, sum: 7, best: 8, note: 'Slide right by one: drop 2 (the old left), add 1 (the new right). Sum = 8 − 2 + 1 = 7. Best stays 8.' },
  { start: 2, end: 4, sum: 9, best: 9, note: 'Slide again: drop 1, add 3. Sum = 7 − 1 + 3 = 9. New best!' },
  { start: 3, end: 5, sum: 6, best: 9, note: 'Slide again: drop 5, add 2. Sum = 9 − 5 + 2 = 6. Best stays 9.' },
  { start: 3, end: 5, sum: 6, best: 9, note: 'Done in one pass. The answer is 9 — computed in O(n), not the O(n·k) a naive re-sum would cost.' },
]

export function SlidingWindowVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={1600}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="flex justify-center gap-1.5">
              {ARRAY.map((value, i) => {
                const inWindow = i >= step.start && i <= step.end
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={[
                        'flex h-11 w-11 items-center justify-center rounded-md font-mono text-sm transition-all duration-300',
                        inWindow
                          ? 'bg-green-600 text-white dark:bg-green-500'
                          : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600',
                      ].join(' ')}
                    >
                      {value}
                    </div>
                    <span className="font-mono text-[10px] text-neutral-400 tabular-nums dark:text-neutral-500">
                      {i}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex justify-center gap-6 font-mono text-xs">
              <span className="text-neutral-600 dark:text-neutral-300">
                window sum ={' '}
                <span className="text-green-600 dark:text-green-500">{step.sum}</span>
              </span>
              <span className="text-neutral-600 dark:text-neutral-300">
                best ={' '}
                <span className="text-amber-500">{step.best}</span>
              </span>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
