'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const ARR = [1, 3, 4, 6, 8, 11]
const TARGET = 10

type Step = {
  left: number
  right: number
  found: boolean
  note: string
}

const steps: Step[] = [
  {
    left: 0,
    right: 5,
    found: false,
    note: `Sorted array, target ${TARGET}. Start one pointer at each end. Their sum is the largest and smallest pair we can currently form.`,
  },
  {
    left: 0,
    right: 5,
    found: false,
    note: '1 + 11 = 12, which is greater than 10. The sum is too big, so move the RIGHT pointer inward to a smaller value.',
  },
  {
    left: 0,
    right: 4,
    found: false,
    note: '1 + 8 = 9, less than 10. Too small — move the LEFT pointer inward to a larger value.',
  },
  {
    left: 1,
    right: 4,
    found: false,
    note: '3 + 8 = 11, greater than 10. Too big — move the RIGHT pointer in.',
  },
  {
    left: 1,
    right: 3,
    found: false,
    note: '3 + 6 = 9, less than 10. Too small — move the LEFT pointer in.',
  },
  {
    left: 2,
    right: 3,
    found: true,
    note: '4 + 6 = 10. Found the pair in a single pass — O(n) time, no extra memory, because the sorted order tells us which pointer to move.',
  },
]

export function TwoSumTwoPointer() {
  return (
    <StepPlayer length={steps.length} interval={1900}>
      {(index) => {
        const step = steps[index]
        const sum = ARR[step.left] + ARR[step.right]
        return (
          <>
            <div className="flex justify-center gap-1.5">
              {ARR.map((value, i) => {
                const isLeft = i === step.left
                const isRight = i === step.right
                const isEndpoint = isLeft || isRight
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={[
                        'w-11 rounded-md py-2 text-center font-mono text-sm transition-all duration-200',
                        isEndpoint && step.found
                          ? 'bg-green-600 dark:bg-green-500 text-white'
                          : isEndpoint
                            ? 'bg-amber-500 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
                      ].join(' ')}
                    >
                      {value}
                    </div>
                    <span className="h-4 text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                      {isLeft && isRight ? 'L R' : isLeft ? 'L' : isRight ? 'R' : ''}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-2 text-center font-mono text-xs text-neutral-500 dark:text-neutral-400">
              {ARR[step.left]} + {ARR[step.right]} = {sum}{' '}
              {step.found ? '= target ✓' : sum > TARGET ? '> target' : '< target'}
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
