'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

// ── 0/1 knapsack ───────────────────────────────────────────────────────────

const ITEMS = [
  { name: 'A', w: 1, v: 1 },
  { name: 'B', w: 3, v: 4 },
  { name: 'C', w: 4, v: 5 },
  { name: 'D', w: 5, v: 7 },
]
const CAP = 7

// best[i][c]: best value using the first i items with capacity c — computed
// by the code in the post.
const BEST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 4, 5, 5, 5, 5],
  [0, 1, 1, 4, 5, 6, 6, 9],
  [0, 1, 1, 4, 5, 7, 8, 9],
]

type Cell = [number, number]

type KnapStep = {
  rows: number // rows 0..rows-1 are filled
  current?: Cell
  skip?: Cell
  take?: Cell
  path?: Cell[]
  taken?: string[]
  note: string
}

const knapSteps: KnapStep[] = [
  {
    rows: 1,
    note: 'Row 0 means "no items yet", so every capacity is worth 0. Each later row adds one item, and each column is a capacity from 0 to 7.',
  },
  {
    rows: 2,
    current: [1, 1],
    skip: [0, 1],
    take: [0, 0],
    note: 'Row A (weight 1, value 1). At capacity 1: skip A → 0 (cell above), or take A → 1 + best with capacity 0 left = 1. Take wins, and every larger capacity also gets 1.',
  },
  {
    rows: 3,
    current: [2, 4],
    skip: [1, 4],
    take: [1, 1],
    note: 'Row B (weight 3, value 4). At capacity 4: skip B → 1, or take B → 4 + best[A-row][4 − 3] = 4 + 1 = 5. Taking B leaves room for A.',
  },
  {
    rows: 4,
    current: [3, 7],
    skip: [2, 7],
    take: [2, 3],
    note: 'Row C (weight 4, value 5). At capacity 7: skip C → 5, or take C → 5 + best[B-row][7 − 4] = 5 + 4 = 9. Each item is used at most once because "take" always looks at the row above.',
  },
  {
    rows: 5,
    current: [4, 7],
    skip: [3, 7],
    take: [3, 2],
    note: 'Row D (weight 5, value 7 — the best value per kilo). At capacity 7: take D → 7 + best[C-row][2] = 7 + 1 = 8, but skip D → 9. Skipping the "best" item wins.',
  },
  {
    rows: 5,
    path: [
      [4, 7],
      [3, 7],
      [2, 3],
      [1, 0],
    ],
    taken: ['B', 'C'],
    note: 'Walk back from the corner: 9 equals the cell above, so D was skipped. 9 ≠ 5, so C was taken — move left 4 to capacity 3. 4 ≠ 1, so B was taken. Answer: B + C, value 9. Greedy by value/weight would pick D then A, for 8.',
  },
]

const same = (a: Cell | undefined, r: number, c: number) => !!a && a[0] === r && a[1] === c

export function KnapsackVisualizer() {
  return (
    <StepPlayer length={knapSteps.length} interval={3200}>
      {(index) => {
        const step = knapSteps[index]
        return (
          <>
            <div className="mb-3 flex flex-wrap justify-center gap-1.5 font-mono text-[10px]">
              {ITEMS.map((it) => (
                <span
                  key={it.name}
                  className={[
                    'rounded-md border px-2 py-1',
                    step.taken?.includes(it.name)
                      ? 'border-green-600 text-green-700 dark:border-green-500 dark:text-green-400'
                      : 'border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300',
                  ].join(' ')}
                >
                  {it.name} · w{it.w} · v{it.v}
                </span>
              ))}
              <span className="px-1 py-1 text-neutral-400 dark:text-neutral-500">capacity {CAP}</span>
            </div>
            <div className="mx-auto grid max-w-sm grid-cols-9 gap-0.5 font-mono text-[10px]">
              <div />
              {Array.from({ length: CAP + 1 }, (_, c) => (
                <div key={c} className="py-0.5 text-center text-neutral-400 dark:text-neutral-500">
                  {c}
                </div>
              ))}
              {BEST.map((row, r) => (
                <div key={r} className="contents">
                  <div className="py-1 pr-1 text-right text-neutral-400 dark:text-neutral-500">
                    {r === 0 ? '∅' : ITEMS[r - 1].name}
                  </div>
                  {row.map((value, c) => {
                    const filled = r < step.rows
                    const onPath = step.path?.some((p) => p[0] === r && p[1] === c)
                    const cls = same(step.current, r, c)
                      ? 'bg-amber-500/25 text-neutral-900 dark:text-neutral-50 ring-1 ring-amber-500'
                      : onPath
                        ? 'bg-green-600/15 text-green-800 dark:text-green-300 ring-1 ring-green-600 dark:ring-green-500'
                        : same(step.skip, r, c)
                          ? 'bg-sky-500/15 text-sky-800 dark:text-sky-300'
                          : same(step.take, r, c)
                            ? 'bg-violet-500/15 text-violet-800 dark:text-violet-300'
                            : filled
                              ? 'bg-neutral-50 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
                              : 'text-neutral-200 dark:text-neutral-700'
                    return (
                      <div key={c} className={['rounded py-1 text-center transition-colors duration-300', cls].join(' ')}>
                        {filled ? value : '·'}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3 text-[10px] text-neutral-500 dark:text-neutral-400">
              <span>
                <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-amber-500/60" />
                deciding
              </span>
              <span>
                <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-sky-500/50" />
                skip item
              </span>
              <span>
                <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-violet-500/50" />
                take item (row above, capacity − weight)
              </span>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}

// ── Sliding window maximum ─────────────────────────────────────────────────

const NUMS = [1, 3, -1, -3, 5, 3, 6, 7]
const K = 3

type WindowStep = {
  i: number
  deque: number[] // indices, front first
  removed?: { index: number; why: 'expired' | 'smaller' }[]
  out: number[]
  note: string
}

// Traced by running the code in the post on NUMS with K = 3.
const windowSteps: WindowStep[] = [
  {
    i: 0,
    deque: [0],
    out: [],
    note: 'The deque holds indices, and their values are always decreasing from front to back. The front is the current window\'s maximum. Push index 0 (value 1).',
  },
  {
    i: 1,
    deque: [1],
    removed: [{ index: 0, why: 'smaller' }],
    out: [],
    note: 'Value 3 arrives. 1 is smaller and older than 3, so it can never be a window maximum again — pop it from the back. Then push 3.',
  },
  {
    i: 2,
    deque: [1, 2],
    out: [3],
    note: '−1 is smaller than 3, so it stays behind it: it might become the maximum once 3 leaves. The first window [1, 3, −1] is complete; its maximum is the front, 3.',
  },
  {
    i: 3,
    deque: [1, 2, 3],
    out: [3, 3],
    note: '−3 joins the back. Window [3, −1, −3]: the front is still index 1 (value 3), and it is still inside the window.',
  },
  {
    i: 4,
    deque: [4],
    removed: [
      { index: 1, why: 'expired' },
      { index: 3, why: 'smaller' },
      { index: 2, why: 'smaller' },
    ],
    out: [3, 3, 5],
    note: 'Index 1 is now outside the window (4 − 3 = 1), so it expires from the front. Then 5 beats −3 and −1, which pop from the back. Maximum: 5.',
  },
  {
    i: 5,
    deque: [4, 5],
    out: [3, 3, 5, 5],
    note: '3 is smaller than 5, so it waits behind it. Maximum: 5.',
  },
  {
    i: 6,
    deque: [6],
    removed: [
      { index: 5, why: 'smaller' },
      { index: 4, why: 'smaller' },
    ],
    out: [3, 3, 5, 5, 6],
    note: '6 pops 3 and 5 from the back. Maximum: 6.',
  },
  {
    i: 7,
    deque: [7],
    removed: [{ index: 6, why: 'smaller' }],
    out: [3, 3, 5, 5, 6, 7],
    note: '7 pops 6. Done: [3, 3, 5, 5, 6, 7]. Every index is pushed once and popped at most once, so the whole pass is O(n) — not O(n·k).',
  },
]

export function SlidingWindowMaxVisualizer() {
  return (
    <StepPlayer length={windowSteps.length} interval={2600}>
      {(index) => {
        const step = windowSteps[index]
        const lo = step.i - K + 1
        return (
          <>
            <div className="flex justify-center gap-1 font-mono text-xs">
              {NUMS.map((n, j) => {
                const inWindow = j >= lo && j <= step.i
                const isFront = step.deque[0] === j && j >= Math.max(lo, 0)
                return (
                  <div key={j} className="flex flex-col items-center gap-0.5">
                    <div
                      className={[
                        'flex h-8 w-8 items-center justify-center rounded-md border transition-colors duration-300',
                        isFront
                          ? 'border-green-600 bg-green-600/15 text-green-800 dark:border-green-500 dark:text-green-300'
                          : inWindow
                            ? 'border-amber-500 bg-amber-500/10 text-neutral-900 dark:text-neutral-50'
                            : j > step.i
                              ? 'border-neutral-100 text-neutral-300 dark:border-neutral-800 dark:text-neutral-600'
                              : 'border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400',
                      ].join(' ')}
                    >
                      {n}
                    </div>
                    <span className="text-[9px] text-neutral-400 dark:text-neutral-500">{j}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 font-mono text-[11px]">
              <span className="text-neutral-400 dark:text-neutral-500">deque</span>
              <div className="flex min-h-7 flex-wrap items-center gap-1">
                <span className="text-[9px] text-neutral-400 dark:text-neutral-500">front →</span>
                {step.deque.map((d) => (
                  <span
                    key={d}
                    className="rounded border border-neutral-200 px-1.5 py-0.5 text-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
                  >
                    i{d}={NUMS[d]}
                  </span>
                ))}
                {step.removed?.map((r) => (
                  <span
                    key={`x${r.index}`}
                    className={[
                      'rounded px-1.5 py-0.5 line-through',
                      r.why === 'expired' ? 'text-amber-600 dark:text-amber-400' : 'text-red-500',
                    ].join(' ')}
                  >
                    i{r.index} {r.why}
                  </span>
                ))}
              </div>
              <span className="text-neutral-400 dark:text-neutral-500">output</span>
              <div className="flex min-h-7 flex-wrap items-center gap-1">
                {step.out.length === 0 ? (
                  <span className="text-neutral-300 dark:text-neutral-600">— window not full yet</span>
                ) : (
                  step.out.map((v, j) => (
                    <span
                      key={j}
                      className={[
                        'rounded px-1.5 py-0.5',
                        j === step.out.length - 1 && step.i >= K - 1
                          ? 'bg-green-600/15 text-green-800 dark:text-green-300'
                          : 'text-neutral-700 dark:text-neutral-300',
                      ].join(' ')}
                    >
                      {v}
                    </span>
                  ))
                )}
              </div>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
