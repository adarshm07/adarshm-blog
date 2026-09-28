'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const K = 5 // 0-indexed: the 6th smallest

type Step = {
  values: number[]
  lo: number
  hi: number
  pivot?: number // index of the pivot's final position, once placed
  done?: boolean
  note: string
}

// Lomuto partition, pivot = last element of the live range. Traced from
// running the code below on [6, 2, 9, 4, 1, 8, 7, 3, 5] with k = 5.
const steps: Step[] = [
  {
    values: [6, 2, 9, 4, 1, 8, 7, 3, 5],
    lo: 0,
    hi: 8,
    note: 'Find the 6th smallest value (index 5 once sorted) without sorting. The live range starts as the whole array.',
  },
  {
    values: [2, 4, 1, 3, 5, 8, 7, 6, 9],
    lo: 0,
    hi: 8,
    pivot: 4,
    note: 'Partition around the last element, 5. Everything smaller moves left of it, everything larger right. 5 is now at index 4 — its final sorted position, even though neither side is sorted.',
  },
  {
    values: [2, 4, 1, 3, 5, 8, 7, 6, 9],
    lo: 5,
    hi: 8,
    note: 'We want index 5 and the pivot landed at 4, so the answer is on the right. Unlike quicksort, the left half is never looked at again.',
  },
  {
    values: [2, 4, 1, 3, 5, 8, 7, 6, 9],
    lo: 5,
    hi: 8,
    pivot: 8,
    note: 'Partition [8, 7, 6, 9] around 9. It is the largest, so it stays at index 8 — a bad pivot that only shrinks the range by one. This is where the O(n²) worst case comes from.',
  },
  {
    values: [2, 4, 1, 3, 5, 8, 7, 6, 9],
    lo: 5,
    hi: 7,
    note: 'Index 8 is past our target, so recurse left into [8, 7, 6].',
  },
  {
    values: [2, 4, 1, 3, 5, 6, 7, 8, 9],
    lo: 5,
    hi: 7,
    pivot: 5,
    done: true,
    note: 'Partition around 6: it lands at index 5, exactly k. Stop. The answer is 6, and everything left of it is smaller — so indices 0…5 are also the 6 smallest values, for free.',
  },
]

export function QuickselectVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2200}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="flex gap-1">
              {step.values.map((v, i) => {
                const live = i >= step.lo && i <= step.hi
                const isPivot = step.pivot === i
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className={[
                        'flex h-10 w-full items-center justify-center rounded-lg font-mono text-[12px] transition-colors duration-300',
                        isPivot
                          ? step.done
                            ? 'bg-green-600 dark:bg-green-500 text-white'
                            : 'bg-amber-500 text-white'
                          : live
                            ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100'
                            : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-300 dark:text-neutral-600',
                      ].join(' ')}
                    >
                      {v}
                    </div>
                    <span
                      className={[
                        'font-mono text-[9px]',
                        i === K
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-neutral-400 dark:text-neutral-500',
                      ].join(' ')}
                    >
                      {i === K ? `k=${i}` : i}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
              <span>
                live range [{step.lo}, {step.hi}] · {step.hi - step.lo + 1} elements
              </span>
              <span>{step.done ? `answer: ${step.values[K]}` : ''}</span>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
