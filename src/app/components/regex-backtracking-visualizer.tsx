'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Step = {
  pattern: string
  input: string
  splits?: number[] // how many characters each quantifier consumed
  attempts: number
  status: 'trying' | 'fail' | 'match' | 'explode'
  note: string
}

const steps: Step[] = [
  {
    pattern: '^(a+)+$',
    input: 'aaaa',
    attempts: 0,
    status: 'trying',
    note: 'A backtracking engine tries one possibility at a time and rewinds when it fails. Usually that is fine. With nested quantifiers it is not.',
  },
  {
    pattern: '^(a+)+$',
    input: 'aaaa',
    splits: [4],
    attempts: 1,
    status: 'match',
    note: 'On a matching input it finds the answer immediately: the inner a+ takes all four characters, the outer group runs once, $ matches. One attempt.',
  },
  {
    pattern: '^(a+)+$',
    input: 'aaaa!',
    splits: [4],
    attempts: 1,
    status: 'fail',
    note: 'Now add one character that cannot match. The first attempt consumes all four a’s and then hits "!" where $ was expected. Failure — so the engine backtracks and tries a different split.',
  },
  {
    pattern: '^(a+)+$',
    input: 'aaaa!',
    splits: [3, 1],
    attempts: 2,
    status: 'fail',
    note: 'Split the a’s as 3 + 1: inner group matches "aaa", then repeats to match "a". Same ending, same failure at "!".',
  },
  {
    pattern: '^(a+)+$',
    input: 'aaaa!',
    splits: [2, 2],
    attempts: 3,
    status: 'fail',
    note: '2 + 2. Every one of these splits produces exactly the same characters, and the engine has no way to know that — it only knows the last attempt failed, so it must try the next arrangement.',
  },
  {
    pattern: '^(a+)+$',
    input: 'aaaa!',
    splits: [2, 1, 1],
    attempts: 5,
    status: 'fail',
    note: '2 + 1 + 1, then 1 + 2 + 1, then 1 + 1 + 2… Every composition of 4 gets tried. For n characters that is 2ⁿ⁻¹ arrangements.',
  },
  {
    pattern: '^(a+)+$',
    input: 'a'.repeat(24) + '!',
    attempts: 8_388_608,
    status: 'explode',
    note: 'At 24 characters the engine performs over 8 million attempts before giving up. At 30 it is half a billion. The input is tiny; the runtime is exponential in its length.',
  },
  {
    pattern: '^a+$',
    input: 'a'.repeat(24) + '!',
    attempts: 1,
    status: 'fail',
    note: 'Removing the nesting removes the ambiguity: there is exactly one way for a+ to match, so failure is detected in a single pass. Catastrophic backtracking comes from a quantifier inside a quantifier over the same character class.',
  },
]

export function RegexBacktrackingVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2300}>
      {(index) => {
        const step = steps[index]
        const chars = [...step.input].slice(0, 26)
        // colour each character by which repetition of the outer group claimed it
        const owner: number[] = []
        step.splits?.forEach((len, group) => {
          for (let i = 0; i < len; i++) owner.push(group)
        })

        return (
          <>
            <div className="mb-3 flex items-baseline gap-3 font-mono text-[12px]">
              <span className="text-neutral-400 dark:text-neutral-500">pattern</span>
              <span className="text-neutral-800 dark:text-neutral-100">{step.pattern}</span>
            </div>

            <div className="flex flex-wrap gap-0.5">
              {chars.map((ch, i) => {
                const group = owner[i]
                const unmatched = ch === '!'
                return (
                  <div
                    key={i}
                    className={[
                      'flex h-7 w-6 items-center justify-center rounded-[3px] font-mono text-[11px] transition-colors duration-300',
                      unmatched
                        ? 'bg-red-500 text-white'
                        : group === undefined
                          ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                          : group % 2 === 0
                            ? 'bg-green-600/70 dark:bg-green-500/70 text-white'
                            : 'bg-amber-500/80 text-white',
                    ].join(' ')}
                  >
                    {ch}
                  </div>
                )
              })}
              {step.input.length > chars.length && (
                <span className="self-center pl-1 font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                  …
                </span>
              )}
            </div>

            {step.splits && (
              <p className="mt-1.5 font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                split: {step.splits.join(' + ')} — alternating colours show each repetition of the
                outer group
              </p>
            )}

            <div className="mt-3 flex items-center justify-between font-mono text-[10px]">
              <span
                className={
                  step.status === 'match'
                    ? 'text-green-600 dark:text-green-500'
                    : step.status === 'explode'
                      ? 'text-red-500'
                      : 'text-neutral-500 dark:text-neutral-400'
                }
              >
                {step.status === 'match'
                  ? 'match'
                  : step.status === 'explode'
                    ? 'still running…'
                    : step.status === 'fail'
                      ? 'no match — backtrack'
                      : 'starting'}
              </span>
              <span className="tabular-nums text-neutral-400 dark:text-neutral-500">
                attempts: {step.attempts.toLocaleString()}
              </span>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
