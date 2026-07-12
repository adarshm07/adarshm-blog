'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Frame = { label: string; returning?: boolean }

type Step = {
  frames: Frame[]
  note: string
}

// Tracing factorial(3): frames push on the way down, pop (resolve) on the way up.
const steps: Step[] = [
  { frames: [{ label: 'factorial(3)' }], note: 'Call factorial(3). It needs 3 × factorial(2), so it pauses and pushes a new frame.' },
  { frames: [{ label: 'factorial(3)' }, { label: 'factorial(2)' }], note: 'factorial(2) needs 2 × factorial(1) — another frame pushed on top. The stack grows downward.' },
  { frames: [{ label: 'factorial(3)' }, { label: 'factorial(2)' }, { label: 'factorial(1)' }], note: 'factorial(1) needs 1 × factorial(0). One more frame.' },
  { frames: [{ label: 'factorial(3)' }, { label: 'factorial(2)' }, { label: 'factorial(1)' }, { label: 'factorial(0)' }], note: 'factorial(0) hits the base case and returns 1 immediately — no more recursion. Now the stack unwinds.' },
  { frames: [{ label: 'factorial(3)' }, { label: 'factorial(2)' }, { label: 'factorial(1) → 1', returning: true }], note: 'factorial(0) returned 1, so factorial(1) computes 1 × 1 = 1 and returns. Its frame pops.' },
  { frames: [{ label: 'factorial(3)' }, { label: 'factorial(2) → 2', returning: true }], note: 'factorial(1) returned 1, so factorial(2) computes 2 × 1 = 2 and returns.' },
  { frames: [{ label: 'factorial(3) → 6', returning: true }], note: 'factorial(2) returned 2, so factorial(3) computes 3 × 2 = 6 and returns. The stack is empty again.' },
]

export function CallStackVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={1600}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="mx-auto flex min-h-[220px] max-w-xs flex-col-reverse justify-start gap-1.5">
              {step.frames.map((frame, i) => (
                <div
                  key={i}
                  className={[
                    'rounded-md border px-3 py-2 text-center font-mono text-xs transition-all duration-300',
                    frame.returning
                      ? 'border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-500'
                      : i === step.frames.length - 1
                        ? 'border-amber-500 bg-amber-500 text-white'
                        : 'border-neutral-200 bg-neutral-100 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
                  ].join(' ')}
                >
                  {frame.label}
                </div>
              ))}
              <div className="mt-1 text-center font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                ↑ top of stack
              </div>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
