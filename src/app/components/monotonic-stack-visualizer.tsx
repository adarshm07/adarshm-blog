'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const ARR = [3, 7, 1, 5, 4, 6]

type Step = {
  i: number | null
  stack: number[]
  ans: (number | null)[]
  popped: number[]
  note: string
}

const N: (number | null)[] = [null, null, null, null, null, null]

const steps: Step[] = [
  {
    i: 0,
    stack: [],
    ans: [...N],
    popped: [],
    note: 'Next greater element: for each value, find the first larger value to its right. The stack holds indices whose answer is still unknown.',
  },
  {
    i: 0,
    stack: [0],
    ans: [...N],
    popped: [],
    note: 'Stack is empty, so 3 has no pending candidate to resolve. Push index 0 and move on.',
  },
  {
    i: 1,
    stack: [0],
    ans: [...N],
    popped: [0],
    note: '7 is greater than the stack top (3) — so 7 is exactly the next greater element for 3. Pop it and record the answer.',
  },
  {
    i: 1,
    stack: [1],
    ans: [7, null, null, null, null, null],
    popped: [],
    note: 'Stack is empty again; push 7. Notice the stack stays decreasing from bottom to top — that invariant is the whole trick.',
  },
  {
    i: 2,
    stack: [1, 2],
    ans: [7, null, null, null, null, null],
    popped: [],
    note: '1 is smaller than the top (7), so nothing resolves. Push it and wait — some later value may answer both.',
  },
  {
    i: 3,
    stack: [1, 2],
    ans: [7, null, null, null, null, null],
    popped: [2],
    note: '5 beats the top (1), so pop and record 5 as the answer for 1. Then compare against the new top, 7 — 5 is smaller, so stop popping.',
  },
  {
    i: 3,
    stack: [1, 3],
    ans: [7, null, 5, null, null, null],
    popped: [],
    note: 'Push 5. The stack is [7, 5] — still strictly decreasing.',
  },
  {
    i: 4,
    stack: [1, 3, 4],
    ans: [7, null, 5, null, null, null],
    popped: [],
    note: '4 is smaller than the top (5). Push it: [7, 5, 4].',
  },
  {
    i: 5,
    stack: [1, 3, 4],
    ans: [7, null, 5, null, null, null],
    popped: [4, 3],
    note: '6 clears two entries in one go — it is the next greater element for both 4 and 5. This is why the total work stays linear: each index is popped at most once.',
  },
  {
    i: 5,
    stack: [1, 5],
    ans: [7, null, 5, 6, 6, null],
    popped: [],
    note: '6 is smaller than 7, so popping stops. Push 6.',
  },
  {
    i: null,
    stack: [1, 5],
    ans: [7, -1, 5, 6, 6, -1],
    popped: [],
    note: 'The array is exhausted. Whatever is left on the stack has no greater element to its right — answer −1 for 7 and 6.',
  },
]

export function MonotonicStackVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={1700}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
              <div className="flex-1">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  array
                </p>
                <div className="flex gap-1">
                  {ARR.map((v, i) => {
                    const isCurrent = step.i === i
                    const inStack = step.stack.includes(i)
                    const isPopped = step.popped.includes(i)
                    return (
                      <div key={i} className="flex flex-1 flex-col items-center gap-1">
                        <div
                          className={[
                            'flex h-9 w-full items-center justify-center rounded-md font-mono text-sm transition-colors duration-300',
                            isPopped
                              ? 'bg-red-500 text-white'
                              : isCurrent
                                ? 'bg-amber-500 text-white'
                                : inStack
                                  ? 'bg-green-600/70 dark:bg-green-500/70 text-white'
                                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
                          ].join(' ')}
                        >
                          {v}
                        </div>
                        <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                          {step.ans[i] === null ? '·' : step.ans[i]}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <p className="mt-1 font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                  answers below each value
                </p>
              </div>

              <div className="sm:w-28">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  stack (top first)
                </p>
                <div className="flex gap-1 sm:flex-col">
                  {step.stack.length === 0 && (
                    <span className="font-mono text-xs text-neutral-400 dark:text-neutral-500">
                      empty
                    </span>
                  )}
                  {[...step.stack].reverse().map((i) => (
                    <div
                      key={i}
                      className="flex h-8 items-center justify-center rounded-md bg-green-600/70 dark:bg-green-500/70 px-3 font-mono text-xs text-white sm:w-full"
                    >
                      {ARR[i]}
                    </div>
                  ))}
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
