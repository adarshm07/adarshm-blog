'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const STR = 'abcabcbb'

type Step = {
  start: number
  end: number // inclusive right edge of the window
  best: number
  active: number // the character just added
  note: string
}

const steps: Step[] = [
  {
    start: 0,
    end: 0,
    best: 1,
    active: 0,
    note: 'Grow a window from the left. Add "a" — no repeat. Window "a", longest so far 1.',
  },
  {
    start: 0,
    end: 1,
    best: 2,
    active: 1,
    note: 'Add "b" — still no repeat. Window "ab", longest 2.',
  },
  {
    start: 0,
    end: 2,
    best: 3,
    active: 2,
    note: 'Add "c" — no repeat. Window "abc", longest 3.',
  },
  {
    start: 1,
    end: 3,
    best: 3,
    active: 3,
    note: 'Add "a", but "a" is already in the window. Shrink from the left past the old "a" (start moves to 1), then include the new one. Window "bca", length 3.',
  },
  {
    start: 2,
    end: 4,
    best: 3,
    active: 4,
    note: 'Add "b" — duplicate. Shrink left past the old "b" (start → 2). Window "cab", length 3.',
  },
  {
    start: 3,
    end: 5,
    best: 3,
    active: 5,
    note: 'Add "c" — duplicate. Shrink left past the old "c" (start → 3). Window "abc", length 3.',
  },
  {
    start: 5,
    end: 6,
    best: 3,
    active: 6,
    note: 'Add "b" — duplicate. Shrink past both "a" and the old "b" (start → 5). Window "cb", length 2.',
  },
  {
    start: 7,
    end: 7,
    best: 3,
    active: 7,
    note: 'Add the final "b" — duplicate again. Shrink to just "b". The window never re-scans characters, so the whole string is processed in one O(n) pass. Answer: 3.',
  },
]

export function LongestSubstringWindow() {
  return (
    <StepPlayer length={steps.length} interval={2000}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="flex justify-center gap-1.5">
              {STR.split('').map((ch, i) => {
                const inWindow = i >= step.start && i <= step.end
                const isActive = i === step.active
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={[
                        'w-9 rounded-md py-2 text-center font-mono text-sm transition-all duration-200',
                        isActive
                          ? 'bg-green-600 dark:bg-green-500 text-white'
                          : inWindow
                            ? 'bg-amber-500/80 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600',
                      ].join(' ')}
                    >
                      {ch}
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                      {i}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-2 text-center font-mono text-xs text-neutral-500 dark:text-neutral-400">
              window [{step.start}, {step.end}] · length {step.end - step.start + 1}{' '}
              · longest {step.best}
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
