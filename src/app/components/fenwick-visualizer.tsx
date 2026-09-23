'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const N = 8
// tree[i] stores the sum of the (i & -i) elements ending at i.
const COVER = Array.from({ length: N + 1 }, (_, i) =>
  i === 0 ? { from: 0, to: 0 } : { from: i - (i & -i) + 1, to: i }
)

type Step = {
  path: number[]
  current?: number
  mode: 'map' | 'update' | 'query'
  running?: number
  note: string
}

const steps: Step[] = [
  {
    path: [],
    mode: 'map',
    note: 'A Fenwick tree stores partial sums in a flat array. Index i covers exactly the last (i & −i) elements ending at i — the width of each bar below is that value, the lowest set bit of the index.',
  },
  {
    path: [1, 2, 4, 8],
    mode: 'map',
    note: 'Powers of two cover the widest ranges: index 8 holds the sum of the whole first half-and-then-some, index 4 holds four elements, index 2 holds two. Odd indices hold a single element each.',
  },
  {
    path: [5],
    current: 5,
    mode: 'update',
    note: 'Add 3 to element 5. Start at index 5 and update it — it covers only element 5.',
  },
  {
    path: [5, 6],
    current: 6,
    mode: 'update',
    note: 'Next index is i + (i & −i) = 5 + 1 = 6. Index 6 covers elements 5–6, so it contains element 5 and must be updated too.',
  },
  {
    path: [5, 6, 8],
    current: 8,
    mode: 'update',
    note: '6 + 2 = 8. Index 8 covers 1–8, so it also changes. Then 8 + 8 = 16 is past the end and the update stops — three writes, not eight.',
  },
  {
    path: [],
    mode: 'query',
    note: 'Now a prefix query: the sum of elements 1 through 7. Instead of adding upwards, walk downwards by stripping the lowest set bit each time.',
  },
  {
    path: [7],
    current: 7,
    running: 1,
    mode: 'query',
    note: 'Start at 7, which covers just element 7. Add it, then move to 7 − (7 & −7) = 6.',
  },
  {
    path: [7, 6],
    current: 6,
    running: 2,
    mode: 'query',
    note: 'Index 6 covers elements 5–6. Add it and jump to 6 − 2 = 4. Notice the covered ranges tile perfectly — no element is counted twice.',
  },
  {
    path: [7, 6, 4],
    current: 4,
    running: 3,
    mode: 'query',
    note: 'Index 4 covers 1–4. Add it, then 4 − 4 = 0 and we stop. Three reads cover all seven elements, because each step clears one bit of the index — O(log n).',
  },
]

export function FenwickVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2000}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="space-y-1">
              {Array.from({ length: N }, (_, k) => {
                const i = k + 1
                const cover = COVER[i]
                const onPath = step.path.includes(i)
                const isCurrent = step.current === i
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className={[
                        'w-8 shrink-0 text-right font-mono text-[10px] tabular-nums transition-colors duration-300',
                        isCurrent
                          ? 'text-amber-500'
                          : onPath
                            ? 'text-green-600 dark:text-green-500'
                            : 'text-neutral-400 dark:text-neutral-500',
                      ].join(' ')}
                    >
                      [{i}]
                    </span>
                    <div className="relative h-5 flex-1">
                      <div
                        className={[
                          'absolute inset-y-0 flex items-center justify-center rounded-md font-mono text-[9px] transition-colors duration-300',
                          isCurrent
                            ? 'bg-amber-500 text-white'
                            : onPath
                              ? 'bg-green-600 dark:bg-green-500 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400',
                        ].join(' ')}
                        style={{
                          left: `${((cover.from - 1) / N) * 100}%`,
                          width: `${((cover.to - cover.from + 1) / N) * 100}%`,
                        }}
                      >
                        {cover.from}–{cover.to}
                      </div>
                    </div>
                    <span className="w-12 shrink-0 font-mono text-[9px] text-neutral-300 dark:text-neutral-600">
                      i&amp;−i={i & -i}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
              <span>
                {step.mode === 'update'
                  ? 'update: i += i & −i'
                  : step.mode === 'query'
                    ? 'query: i −= i & −i'
                    : 'coverage map'}
              </span>
              <span className="tabular-nums">
                {step.running !== undefined ? `${step.running} of 3 reads` : ' '}
              </span>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
