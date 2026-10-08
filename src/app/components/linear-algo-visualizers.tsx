'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

// ── Kadane's algorithm ─────────────────────────────────────────────────────

const ARR = [-2, 1, -3, 4, -1, 2, 1, -5, 4]

type KStep = {
  i: number // -1 before the scan
  cur: number | null
  curStart: number
  best: number | null
  bestRange: [number, number] | null
  restarted?: boolean
  note: string
}

// Traced by running the algorithm in the post on ARR.
const kSteps: KStep[] = [
  {
    i: -1,
    cur: null,
    curStart: 0,
    best: null,
    bestRange: null,
    note: 'Find the contiguous slice with the largest sum. Checking every slice is O(n²). Kadane\'s algorithm does it in one pass, carrying just two numbers: the best sum of a slice ending here, and the best sum seen anywhere.',
  },
  {
    i: 0,
    cur: -2,
    curStart: 0,
    best: -2,
    bestRange: [0, 0],
    note: 'Index 0: the only slice ending here is [-2]. cur = -2, best = -2.',
  },
  {
    i: 1,
    cur: 1,
    curStart: 1,
    best: 1,
    bestRange: [1, 1],
    restarted: true,
    note: 'Index 1: extend the previous slice (-2 + 1 = -1) or start fresh at 1? A negative running sum only drags things down, so start over. cur = 1, best = 1.',
  },
  {
    i: 2,
    cur: -2,
    curStart: 1,
    best: 1,
    bestRange: [1, 1],
    note: 'Index 2: extending gives 1 + (-3) = -2, which beats starting at -3. cur = -2. best stays 1.',
  },
  {
    i: 3,
    cur: 4,
    curStart: 3,
    best: 4,
    bestRange: [3, 3],
    restarted: true,
    note: 'Index 3: -2 + 4 = 2, but 4 alone is better — restart. cur = 4, best = 4.',
  },
  {
    i: 4,
    cur: 3,
    curStart: 3,
    best: 4,
    bestRange: [3, 3],
    note: 'Index 4: 4 + (-1) = 3. Still positive, so keep extending even though it dipped — a later gain may make it worthwhile.',
  },
  {
    i: 5,
    cur: 5,
    curStart: 3,
    best: 5,
    bestRange: [3, 5],
    note: 'Index 5: 3 + 2 = 5. New best: [4, -1, 2].',
  },
  {
    i: 6,
    cur: 6,
    curStart: 3,
    best: 6,
    bestRange: [3, 6],
    note: 'Index 6: 5 + 1 = 6. New best: [4, -1, 2, 1].',
  },
  {
    i: 7,
    cur: 1,
    curStart: 3,
    best: 6,
    bestRange: [3, 6],
    note: 'Index 7: 6 + (-5) = 1. Still positive, so the slice keeps going; best stays 6.',
  },
  {
    i: 8,
    cur: 5,
    curStart: 3,
    best: 6,
    bestRange: [3, 6],
    note: 'Index 8: 1 + 4 = 5 — not enough to beat 6. Done: the answer is 6, from indexes 3 to 6. One pass, O(n) time, O(1) memory.',
  },
]

export function KadaneVisualizer() {
  return (
    <StepPlayer length={kSteps.length} interval={2400}>
      {(index) => {
        const step = kSteps[index]
        return (
          <>
            <div className="flex gap-1">
              {ARR.map((v, i) => {
                const inBest = step.bestRange && i >= step.bestRange[0] && i <= step.bestRange[1]
                const inCur = step.i >= 0 && i >= step.curStart && i <= step.i
                const isNow = i === step.i
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className={[
                        'flex h-10 w-full items-center justify-center rounded-lg font-mono text-[12px] transition-colors duration-300',
                        isNow
                          ? 'bg-amber-500 text-white'
                          : inCur
                            ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200',
                        inBest ? 'ring-2 ring-green-600 dark:ring-green-500' : '',
                      ].join(' ')}
                    >
                      {v}
                    </div>
                    <span className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500">{i}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[10px]">
              <div className="rounded-lg border border-neutral-100 dark:border-neutral-800 px-2 py-1.5">
                <div className="text-neutral-400 dark:text-neutral-500">cur (best ending here)</div>
                <div className="text-[13px] text-amber-600 dark:text-amber-400">
                  {step.cur ?? '—'}
                  {step.restarted ? <span className="ml-2 text-[10px]">↺ restart</span> : null}
                </div>
              </div>
              <div className="rounded-lg border border-neutral-100 dark:border-neutral-800 px-2 py-1.5">
                <div className="text-neutral-400 dark:text-neutral-500">best (anywhere)</div>
                <div className="text-[13px] text-green-700 dark:text-green-400">
                  {step.best ?? '—'}
                  {step.bestRange ? (
                    <span className="ml-2 text-[10px] text-neutral-400 dark:text-neutral-500">
                      [{step.bestRange[0]}..{step.bestRange[1]}]
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}

// ── Counting sort ──────────────────────────────────────────────────────────

const INPUT = [3, 1, 4, 1, 5, 2, 3, 0]
const K = 6 // values are 0..5

type CStep = {
  phase: string
  inputHot?: number[]
  counts: number[]
  countHot?: number
  output: (number | null)[]
  outHot?: number
  note: string
}

const empty = () => INPUT.map(() => null)

// Values computed by running the counting sort in the post on INPUT.
const cSteps: CStep[] = [
  {
    phase: 'input',
    counts: Array(K).fill(0),
    output: empty(),
    note: 'Sort 8 numbers that are all between 0 and 5. Comparison sorts can\'t beat O(n log n). But when the values come from a small known range, you don\'t need to compare them at all — you can count them.',
  },
  {
    phase: 'count',
    inputHot: [0, 1, 2, 3],
    counts: [0, 2, 0, 1, 1, 0],
    output: empty(),
    note: 'One pass over the input: for each value v, add 1 to counts[v]. After 3, 1, 4, 1 the counts say: two 1s, one 3, one 4.',
  },
  {
    phase: 'count',
    inputHot: [4, 5, 6, 7],
    counts: [1, 2, 1, 2, 1, 1],
    output: empty(),
    note: 'After the whole input: one 0, two 1s, one 2, two 3s, one 4, one 5. No comparisons anywhere.',
  },
  {
    phase: 'prefix sums',
    counts: [1, 3, 4, 6, 7, 8],
    output: empty(),
    note: 'Turn counts into running totals. Now counts[v] says how many values are ≤ v, which pins down where each value\'s block sits in the output: the 3s fill the slots after counts[2] = 4 and before counts[3] = 6 — indexes 4 and 5.',
  },
  {
    phase: 'place',
    inputHot: [0],
    counts: [1, 3, 4, 6, 7, 8],
    countHot: 2, // counts[2] = 4: the 3s' block starts here
    output: [null, null, null, null, 3, null, null, null],
    outHot: 4,
    note: 'Walk the input in order and drop each value into the next free slot of its block. The first 3 goes to index 4; the second 3 will go to index 5. Because equal values keep their input order, counting sort is stable — the property radix sort relies on.',
  },
  {
    phase: 'sorted',
    counts: [1, 3, 4, 6, 7, 8],
    output: [0, 1, 1, 2, 3, 3, 4, 5],
    note: 'Every value placed: 0 1 1 2 3 3 4 5. Total work is one pass over the n inputs and two over the k possible values — O(n + k). Fast when k is small; useless when values range over billions.',
  },
]

function Cells({
  values,
  hot,
  tone,
  labels,
}: {
  values: (number | null)[]
  hot?: number[]
  tone: 'amber' | 'green'
  labels?: boolean
}) {
  return (
    <div className="flex gap-1">
      {values.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
          <div
            className={[
              'flex h-8 w-full items-center justify-center rounded-md font-mono text-[11px] transition-colors duration-300',
              hot?.includes(i)
                ? tone === 'amber'
                  ? 'bg-amber-500 text-white'
                  : 'bg-green-600 dark:bg-green-500 text-white'
                : v === null
                  ? 'bg-neutral-50 dark:bg-neutral-900 text-neutral-300 dark:text-neutral-600'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200',
            ].join(' ')}
          >
            {v ?? '·'}
          </div>
          {labels ? <span className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500">{i}</span> : null}
        </div>
      ))}
    </div>
  )
}

export function CountingSortVisualizer() {
  return (
    <StepPlayer length={cSteps.length} interval={2800}>
      {(index) => {
        const step = cSteps[index]
        return (
          <>
            <div className="mb-2 text-center font-mono text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {step.phase}
            </div>
            <div className="space-y-2.5">
              <div>
                <div className="mb-1 font-mono text-[9.5px] text-neutral-400 dark:text-neutral-500">input</div>
                <Cells values={INPUT} hot={step.inputHot} tone="amber" />
              </div>
              <div>
                <div className="mb-1 font-mono text-[9.5px] text-neutral-400 dark:text-neutral-500">
                  counts[value]{step.phase === 'prefix sums' || step.phase === 'place' || step.phase === 'sorted' ? ' — as running totals' : ''}
                </div>
                <div className="pr-[25%]">
                  <Cells values={step.counts} hot={step.countHot !== undefined ? [step.countHot] : undefined} tone="amber" labels />
                </div>
              </div>
              <div>
                <div className="mb-1 font-mono text-[9.5px] text-neutral-400 dark:text-neutral-500">output</div>
                <Cells values={step.output} hot={step.outHot !== undefined ? [step.outHot] : step.phase === 'sorted' ? step.output.map((_, i) => i) : undefined} tone="green" labels />
              </div>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
