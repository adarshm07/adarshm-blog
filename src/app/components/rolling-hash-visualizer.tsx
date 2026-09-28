'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const TEXT = '31415926535'
const PATTERN = '926'
const M = 13
const PATTERN_HASH = 3 // 926 mod 13

type Step = {
  start: number // window start, -1 = none yet
  hash?: number
  verdict?: 'skip' | 'spurious' | 'match'
  note: string
}

// Hashes are the window read as a base-10 number, mod 13 — computed by the
// rolling update in the post, and checked against a direct computation.
const steps: Step[] = [
  {
    start: -1,
    note: `Search for "${PATTERN}" in the text. Treat each 3-digit window as a number and hash it mod ${M}. The pattern's hash is 926 mod 13 = ${PATTERN_HASH}.`,
  },
  {
    start: 0,
    hash: 2,
    verdict: 'skip',
    note: 'Window 314 hashes to 2. Different hash means definitely not a match — skip it without comparing a single character.',
  },
  {
    start: 1,
    hash: 11,
    verdict: 'skip',
    note: 'Slide right: drop the 3, add the 1. The new hash comes from the old one in O(1) — (2 − 3·100) · 10 + 1, mod 13 = 11 — instead of rehashing all three digits.',
  },
  {
    start: 2,
    hash: 12,
    verdict: 'skip',
    note: 'Window 415 → 12. Skip.',
  },
  {
    start: 3,
    hash: 3,
    verdict: 'spurious',
    note: 'Window 159 → 3, the same as the pattern. A hash match is only a candidate: compare the characters, find 159 ≠ 926, and move on. This is a spurious hit.',
  },
  {
    start: 4,
    hash: 7,
    verdict: 'skip',
    note: 'Window 592 → 7. Skip.',
  },
  {
    start: 5,
    hash: 3,
    verdict: 'match',
    note: 'Window 926 → 3. Hashes agree, the character check agrees: a real match at index 5.',
  },
  {
    start: 6,
    hash: 5,
    verdict: 'skip',
    note: 'Window 265 → 5. Skip.',
  },
  {
    start: 7,
    hash: 3,
    verdict: 'spurious',
    note: 'Window 653 → 3 — another collision. With a modulus of 13 collisions are common; real implementations use a large prime (around 10⁹) so a spurious hit is rare and the expected time stays O(n + m).',
  },
  {
    start: 8,
    hash: 2,
    verdict: 'skip',
    note: 'Window 535 → 2. End of text: 9 windows, each hashed in O(1), and character comparisons only where the hashes collided.',
  },
]

export function RollingHashVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2000}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="flex gap-1">
              {TEXT.split('').map((ch, i) => {
                const inWindow = step.start >= 0 && i >= step.start && i < step.start + PATTERN.length
                return (
                  <div
                    key={i}
                    className={[
                      'flex h-10 flex-1 items-center justify-center rounded-lg font-mono text-[13px] transition-colors duration-300',
                      inWindow
                        ? step.verdict === 'match'
                          ? 'bg-green-600 dark:bg-green-500 text-white'
                          : step.verdict === 'spurious'
                            ? 'bg-amber-500 text-white'
                            : 'bg-neutral-300 dark:bg-neutral-600 text-neutral-800 dark:text-neutral-100'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400',
                    ].join(' ')}
                  >
                    {ch}
                  </div>
                )
              })}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[10px]">
              <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900 px-2 py-1.5">
                <div className="text-neutral-400 dark:text-neutral-500">pattern hash</div>
                <div className="text-[13px] text-neutral-700 dark:text-neutral-200">{PATTERN_HASH}</div>
              </div>
              <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900 px-2 py-1.5">
                <div className="text-neutral-400 dark:text-neutral-500">window hash</div>
                <div className="text-[13px] text-neutral-700 dark:text-neutral-200">{step.hash ?? '—'}</div>
              </div>
              <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900 px-2 py-1.5">
                <div className="text-neutral-400 dark:text-neutral-500">result</div>
                <div
                  className={[
                    'text-[13px]',
                    step.verdict === 'match'
                      ? 'text-green-700 dark:text-green-400'
                      : step.verdict === 'spurious'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-neutral-700 dark:text-neutral-200',
                  ].join(' ')}
                >
                  {step.verdict === 'match'
                    ? 'match'
                    : step.verdict === 'spurious'
                      ? 'spurious hit'
                      : step.verdict === 'skip'
                        ? 'skip'
                        : '—'}
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
