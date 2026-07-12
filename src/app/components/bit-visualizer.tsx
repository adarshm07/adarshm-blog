'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Step = {
  value: number
  cleared?: number // bit index (0 = LSB) cleared this step
  count: number
  done?: boolean
  note: string
}

// Brian Kernighan's bit count on 22 = 0b00010110.
const steps: Step[] = [
  { value: 22, count: 0, note: 'Count the set bits in 22 = 00010110. The trick: n & (n − 1) always clears the lowest set bit.' },
  { value: 20, cleared: 1, count: 1, note: '22 & 21 clears bit 1. n becomes 00010100, count = 1. We skipped straight over the zero bits.' },
  { value: 16, cleared: 2, count: 2, note: '20 & 19 clears bit 2. n becomes 00010000, count = 2.' },
  { value: 0, cleared: 4, count: 3, note: '16 & 15 clears bit 4. n becomes 00000000, count = 3.' },
  { value: 0, count: 3, done: true, note: 'n is 0, so we stop. The loop ran exactly 3 times — once per set bit — not 8. That is O(set bits), not O(bit width).' },
]

function bits(value: number) {
  return Array.from({ length: 8 }, (_, i) => (value >> (7 - i)) & 1)
}

export function BitVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={1600}>
      {(index) => {
        const step = steps[index]
        const row = bits(step.value)
        return (
          <>
            <div className="flex justify-center gap-1.5">
              {row.map((bit, i) => {
                const bitIndex = 7 - i
                const isCleared = step.cleared === bitIndex
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={[
                        'flex h-11 w-9 items-center justify-center rounded-md font-mono text-sm transition-all duration-300',
                        isCleared
                          ? 'bg-amber-500 text-white line-through'
                          : bit
                            ? 'bg-green-600 text-white dark:bg-green-500'
                            : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600',
                      ].join(' ')}
                    >
                      {bit}
                    </div>
                    <span className="font-mono text-[10px] text-neutral-400 tabular-nums dark:text-neutral-500">
                      {bitIndex}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex justify-center gap-6 font-mono text-xs text-neutral-600 dark:text-neutral-300">
              <span>
                n = <span className="tabular-nums">{step.value}</span>
              </span>
              <span>
                count ={' '}
                <span className="text-green-600 tabular-nums dark:text-green-500">
                  {step.count}
                </span>
              </span>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
