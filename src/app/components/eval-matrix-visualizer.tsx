'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Cell = 'pass' | 'fail' | 'untested'

type Version = {
  label: string
  cells: Cell[]
  note?: string
  heldOut?: boolean
}

type Step = {
  versions: Version[]
  regressions?: number[] // row indices that got worse
  note: string
}

const CASES = [
  'refund, in policy',
  'refund, expired',
  'order status',
  'multi-item order',
  'ambiguous question',
  'no data in corpus',
  'prompt injection',
  'non-English',
]

const P = 'pass' as const
const F = 'fail' as const
const U = 'untested' as const

const steps: Step[] = [
  {
    versions: [{ label: 'v1', cells: [P, U, U, U, U, U, U, U] }],
    note: 'How most LLM features are tested: try one prompt, it looks right, ship it. This tells you the happy path works and nothing else.',
  },
  {
    versions: [{ label: 'v1', cells: [U, U, U, U, U, U, U, U] }],
    note: 'An eval is just that same check, written down and repeatable. Start from real traffic — the cases users actually send, including the ones that went badly.',
  },
  {
    versions: [{ label: 'v1', cells: [P, F, P, P, F, F, F, P] }],
    note: 'The baseline: 4 of 8. That number is not the point — having a number you can compare against is. Nothing before this point could tell you whether a change helped.',
  },
  {
    versions: [
      { label: 'v1', cells: [P, F, P, P, F, F, F, P] },
      { label: 'v2', cells: [P, P, P, P, P, F, F, P] },
    ],
    note: 'A prompt change takes it to 6 of 8. Two cases that used to fail now pass, and nothing that worked broke. This is what you were hoping to see.',
  },
  {
    versions: [
      { label: 'v1', cells: [P, F, P, P, F, F, F, P] },
      { label: 'v2', cells: [P, P, P, P, P, F, F, P] },
      { label: 'v3', cells: [P, P, P, F, P, P, P, F] },
    ],
    regressions: [3, 7],
    note: 'v3 scores 6 of 8 too — the same headline number, but two cases that used to pass now fail. An aggregate score hides regressions; the per-case grid is what makes them visible.',
  },
  {
    versions: [
      { label: 'v1', cells: [P, F, P, P, F, F, F, P] },
      { label: 'v2', cells: [P, P, P, P, P, F, F, P] },
      { label: 'v3', cells: [P, P, P, F, P, P, P, F] },
      { label: 'v4', cells: [P, P, P, P, P, P, P, P] },
    ],
    note: 'After a few rounds, v4 passes everything. Which is the moment to be suspicious: eight cases you have been tuning against are eight cases you have now memorised.',
  },
  {
    versions: [
      { label: 'v4', cells: [P, P, P, P, P, P, P, P] },
      { label: 'v4 held-out', cells: [P, P, F, P, F, P, F, P], heldOut: true },
    ],
    note: 'On a held-out set the same version scores 5 of 8. The gap between the two is how much of your progress was real and how much was fitting to the examples in front of you.',
  },
]

const CELL_STYLE: Record<Cell, string> = {
  pass: 'bg-green-600/80 dark:bg-green-500/80',
  fail: 'bg-red-500/80',
  untested: 'bg-neutral-100 dark:bg-neutral-800',
}

export function EvalMatrixVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2300}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="mb-1 h-4" />
                {CASES.map((name, row) => (
                  <div
                    key={name}
                    className={[
                      'flex h-6 items-center truncate font-mono text-[10px] transition-colors duration-300',
                      step.regressions?.includes(row)
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-neutral-500 dark:text-neutral-400',
                    ].join(' ')}
                  >
                    {name}
                  </div>
                ))}
                <div className="mt-1 flex h-5 items-center font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                  score
                </div>
              </div>

              {step.versions.map((version) => {
                const tested = version.cells.filter((c) => c !== 'untested').length
                const passed = version.cells.filter((c) => c === 'pass').length
                return (
                  <div key={version.label} className="w-16 shrink-0">
                    <div
                      className={[
                        'mb-1 h-4 text-center font-mono text-[10px]',
                        version.heldOut
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-neutral-500 dark:text-neutral-400',
                      ].join(' ')}
                    >
                      {version.label}
                    </div>
                    {version.cells.map((cell, row) => (
                      <div key={row} className="flex h-6 items-center">
                        <div
                          className={[
                            'h-4 w-full rounded-[3px] transition-colors duration-500',
                            CELL_STYLE[cell],
                            step.regressions?.includes(row) &&
                            version.label === 'v3' &&
                            cell === 'fail'
                              ? 'ring-2 ring-red-500 ring-offset-1 ring-offset-white dark:ring-offset-neutral-950'
                              : '',
                          ].join(' ')}
                        />
                      </div>
                    ))}
                    <div
                      className={[
                        'mt-1 flex h-5 items-center justify-center font-mono text-[10px] tabular-nums',
                        version.heldOut
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-neutral-600 dark:text-neutral-300',
                      ].join(' ')}
                    >
                      {tested === 0 ? '—' : `${passed}/${tested}`}
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="mt-2 font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
              green = passes the grader · red = fails · grey = never tested
            </p>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
