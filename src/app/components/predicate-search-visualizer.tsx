'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

// Koko eating bananas: piles [7, 11, 5, 8], h = 8 hours.
// feasible(speed) = hours needed at that speed <= 8.
const PILES = [7, 11, 5, 8]
const HOURS = 8
const MAX = 12

const hoursNeeded = (speed: number) =>
  PILES.reduce((sum, pile) => sum + Math.ceil(pile / speed), 0)

const feasible = (speed: number) => hoursNeeded(speed) <= HOURS

type Step = {
  lo: number
  hi: number
  mid?: number
  tested: number[]
  answer?: number
  note: string
}

const steps: Step[] = [
  {
    lo: 1,
    hi: MAX,
    tested: [],
    note: 'Koko eats bananas from 4 piles and has 8 hours. What is the slowest speed that still finishes in time? The answer is a number in a range — not an element in a sorted array.',
  },
  {
    lo: 1,
    hi: MAX,
    tested: [],
    note: 'The trick is to stop searching for the answer and start testing candidates. "Can she finish at speed k?" is easy to answer directly: add up ceil(pile / k) and compare to 8.',
  },
  {
    lo: 1,
    hi: MAX,
    tested: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    note: 'Evaluate that predicate everywhere and the structure appears: false for every speed that is too slow, true from some point onward. Once the answers are sorted, binary search applies — even though the inputs never were.',
  },
  {
    lo: 1,
    hi: 12,
    mid: 6,
    tested: [6],
    note: 'Test the middle. At speed 6 she needs 2+2+1+2 = 7 hours, which fits — so 6 works, and every speed above it works too. The answer is 6 or lower; discard the upper half.',
  },
  {
    lo: 1,
    hi: 6,
    mid: 3,
    tested: [6, 3],
    note: 'At speed 3 she needs 3+4+2+3 = 12 hours. Too slow, so 3 and everything below it fails. The boundary is above 3.',
  },
  {
    lo: 4,
    hi: 6,
    mid: 5,
    tested: [6, 3, 5],
    note: 'Speed 5: 2+3+1+2 = 8 hours, exactly on the limit — feasible. Move the ceiling down to 5.',
  },
  {
    lo: 4,
    hi: 5,
    mid: 4,
    tested: [6, 3, 5, 4],
    note: 'Speed 4: 2+3+2+2 = 9 hours. Infeasible, so the range collapses to a single value.',
  },
  {
    lo: 5,
    hi: 5,
    answer: 5,
    tested: [6, 3, 5, 4],
    note: 'lo meets hi at 5: the first speed where the predicate flips from false to true. Four evaluations instead of twelve — and the same four whether the range had 12 candidates or 12 billion.',
  },
]

export function PredicateSearchVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2200}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="flex gap-1">
              {Array.from({ length: MAX }, (_, i) => {
                const speed = i + 1
                const inRange = speed >= step.lo && speed <= step.hi
                const isMid = step.mid === speed
                const isAnswer = step.answer === speed
                const shown = step.tested.includes(speed)
                const ok = feasible(speed)
                return (
                  <div key={speed} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className={[
                        'flex h-9 w-full items-center justify-center rounded-md font-mono text-[11px] transition-colors duration-300',
                        isAnswer
                          ? 'bg-green-600 dark:bg-green-500 text-white ring-2 ring-green-600/40'
                          : isMid
                            ? 'bg-amber-500 text-white'
                            : shown
                              ? ok
                                ? 'bg-green-600/60 dark:bg-green-500/60 text-white'
                                : 'bg-red-500/70 text-white'
                              : inRange
                                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                                : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-300 dark:text-neutral-700',
                      ].join(' ')}
                    >
                      {speed}
                    </div>
                    <span
                      className={[
                        'font-mono text-[9px]',
                        shown
                          ? ok
                            ? 'text-green-600 dark:text-green-500'
                            : 'text-red-500'
                          : 'text-neutral-300 dark:text-neutral-700',
                      ].join(' ')}
                    >
                      {shown ? (ok ? 'T' : 'F') : '·'}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
              <span className="tabular-nums">
                lo = {step.lo} · hi = {step.hi}
                {step.mid ? ` · mid = ${step.mid}` : ''}
              </span>
              <span className="tabular-nums">
                {step.mid
                  ? `${hoursNeeded(step.mid)}h needed, ${HOURS}h available`
                  : step.answer
                    ? `answer: ${step.answer}`
                    : `${step.tested.length} evaluations`}
              </span>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
