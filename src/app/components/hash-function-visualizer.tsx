'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const BUCKETS = 8

type Step = {
  word?: string
  codes?: number[]
  formula?: string
  hash?: number
  bucket?: number
  filled: Record<number, string[]>
  collision?: boolean
  note: string
}

// Values computed in Node: sum hash = Σ charCode; polynomial hash =
// h * 31 + charCode for each character, kept as an unsigned 32-bit int.
const steps: Step[] = [
  {
    filled: {},
    note: 'A hash function turns any input — a word, a file, an object — into a number. A hash map uses that number to decide which of a fixed set of buckets to put the item in, so it can find it again without searching.',
  },
  {
    word: 'cat',
    codes: [99, 97, 116],
    formula: 'sum of codes = 99 + 97 + 116',
    hash: 312,
    bucket: 0,
    filled: { 0: ['cat'] },
    note: 'A first attempt: add up the character codes. "cat" → 312. 312 % 8 = 0, so it goes in bucket 0. The same input always gives the same bucket — that is the one rule a hash function must follow.',
  },
  {
    word: 'act',
    codes: [97, 99, 116],
    formula: 'sum of codes = 97 + 99 + 116',
    hash: 312,
    bucket: 0,
    filled: { 0: ['cat', 'act'] },
    collision: true,
    note: '"act" has the same letters, so the same sum — and lands in the same bucket. That is a collision. Summing ignores order, so every anagram collides. A good hash should spread similar inputs apart.',
  },
  {
    word: 'cat',
    codes: [99, 97, 116],
    formula: '((99 × 31) + 97) × 31 + 116',
    hash: 98262,
    bucket: 6,
    filled: { 6: ['cat'] },
    note: 'A better recipe: multiply the running total by 31 before adding each character. Now position matters. "cat" → 98262, and 98262 % 8 = 6.',
  },
  {
    word: 'act',
    codes: [97, 99, 116],
    formula: '((97 × 31) + 99) × 31 + 116',
    hash: 96402,
    bucket: 2,
    filled: { 6: ['cat'], 2: ['act'] },
    note: '"act" → 96402 → bucket 2. Different order, different hash. This is essentially the recipe Java uses for String.hashCode.',
  },
  {
    word: 'dog',
    codes: [100, 111, 103],
    formula: '((100 × 31) + 111) × 31 + 103',
    hash: 99644,
    bucket: 4,
    filled: { 6: ['cat'], 2: ['act'], 4: ['dog'] },
    note: '"dog" → bucket 4. With keys spread evenly, looking one up means: hash it, go to that bucket, check the one or two items there. That is how a hash map gets O(1) lookups.',
  },
]

export function HashFunctionVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={3000}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="flex flex-wrap items-center justify-center gap-1.5 font-mono text-[11px]">
              <span className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-1 text-neutral-800 dark:text-neutral-100">
                {step.word ? `"${step.word}"` : 'input'}
              </span>
              <span className="text-neutral-300 dark:text-neutral-600">→</span>
              <span className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-1 text-neutral-600 dark:text-neutral-300">
                {step.codes ? step.codes.join(' · ') : 'char codes'}
              </span>
              <span className="text-neutral-300 dark:text-neutral-600">→</span>
              <span className="rounded-md bg-amber-500/15 px-2 py-1 text-amber-700 dark:text-amber-300">
                {step.hash ?? 'hash'}
              </span>
              <span className="text-neutral-300 dark:text-neutral-600">→</span>
              <span className="rounded-md bg-green-600/15 px-2 py-1 text-green-700 dark:text-green-400">
                {step.bucket !== undefined ? `% ${BUCKETS} = ${step.bucket}` : 'bucket'}
              </span>
            </div>
            <div className="mt-1.5 min-h-4 text-center font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
              {step.formula ?? ''}
            </div>
            <div className="mt-3 grid grid-cols-8 gap-1 font-mono text-[10px]">
              {Array.from({ length: BUCKETS }, (_, b) => {
                const items = step.filled[b] ?? []
                const active = step.bucket === b
                return (
                  <div key={b} className="flex flex-col items-center">
                    <div
                      className={[
                        'flex min-h-14 w-full flex-col items-center justify-start gap-0.5 rounded-lg border p-1 transition-colors duration-300',
                        active && step.collision
                          ? 'border-red-500 bg-red-500/10'
                          : active
                            ? 'border-green-600 dark:border-green-500 bg-green-600/10'
                            : 'border-neutral-200 dark:border-neutral-700',
                      ].join(' ')}
                    >
                      {items.map((w) => (
                        <span key={w} className="text-neutral-700 dark:text-neutral-200">
                          {w}
                        </span>
                      ))}
                    </div>
                    <span className="mt-0.5 text-[9px] text-neutral-400 dark:text-neutral-500">{b}</span>
                  </div>
                )
              })}
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
