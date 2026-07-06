'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Step = {
  buckets: string[][]
  active: number[]
  note: string
}

const e8 = (): string[][] => Array.from({ length: 8 }, () => [])

function b8(entries: Record<number, string[]>): string[][] {
  const b = e8()
  for (const [i, keys] of Object.entries(entries)) b[Number(i)] = keys
  return b
}

function b16(entries: Record<number, string[]>): string[][] {
  const b = Array.from({ length: 16 }, () => [] as string[])
  for (const [i, keys] of Object.entries(entries)) b[Number(i)] = keys
  return b
}

const steps: Step[] = [
  {
    buckets: e8(),
    active: [],
    note: '8 empty buckets. A key finds its bucket via hash(key) % 8.',
  },
  {
    buckets: b8({ 3: ['cat · 11'] }),
    active: [3],
    note: 'put("cat"): hash("cat") = 11 → 11 % 8 = 3. The entry lands in bucket 3.',
  },
  {
    buckets: b8({ 3: ['cat · 11'], 4: ['dog · 4'] }),
    active: [4],
    note: 'put("dog"): hash("dog") = 4 → bucket 4.',
  },
  {
    buckets: b8({ 3: ['cat · 11', 'emu · 19'], 4: ['dog · 4'] }),
    active: [3],
    note: 'put("emu"): hash("emu") = 19 → 19 % 8 = 3. Collision! With separate chaining, emu is linked behind cat in the same bucket.',
  },
  {
    buckets: b8({ 3: ['cat · 11', 'emu · 19'], 4: ['dog · 4'], 6: ['owl · 6'] }),
    active: [6],
    note: 'put("owl"): hash 6 → bucket 6. No drama.',
  },
  {
    buckets: b8({ 3: ['cat · 11', 'emu · 19'], 4: ['dog · 4'], 6: ['owl · 6'] }),
    active: [3],
    note: 'get("emu"): hash to bucket 3, then walk the chain — compare cat (no), then emu (yes). Long chains are why the worst case is O(n).',
  },
  {
    buckets: b8({
      3: ['cat · 11', 'emu · 19'],
      4: ['dog · 4', 'bat · 20'],
      5: ['fox · 13'],
      6: ['owl · 6'],
    }),
    active: [4, 5],
    note: 'put("fox") → bucket 5, put("bat") → 20 % 8 = 4, another collision. Load factor is now 6/8 = 0.75 — time to resize.',
  },
  {
    buckets: b16({
      3: ['emu · 19'],
      4: ['dog · 4', 'bat · 20'],
      6: ['owl · 6'],
      11: ['cat · 11'],
      13: ['fox · 13'],
    }),
    active: [3, 11],
    note: 'Double to 16 buckets and rehash every key with % 16. cat (11 % 16 = 11) and emu (19 % 16 = 3) no longer collide — most chains break up.',
  },
  {
    buckets: b16({
      3: ['emu · 19'],
      4: ['dog · 4', 'bat · 20'],
      6: ['owl · 6'],
      11: ['cat · 11'],
      13: ['fox · 13'],
    }),
    active: [],
    note: 'Load factor back to 6/16 ≈ 0.38 and lookups are O(1) on average again. dog and bat (20 % 16 = 4) still share a bucket — collisions never fully disappear, they just stay rare.',
  },
]

export function HashMapVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2200}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="grid grid-cols-8 gap-1">
              {step.buckets.map((chain, i) => {
                const isActive = step.active.includes(i)
                return (
                  <div
                    key={i}
                    className={[
                      'rounded-md border p-1 min-h-16 flex flex-col gap-1 transition-colors duration-200',
                      isActive
                        ? 'border-amber-500'
                        : 'border-neutral-100 dark:border-neutral-800',
                    ].join(' ')}
                  >
                    <span className="text-[9px] text-neutral-400 dark:text-neutral-500 tabular-nums">
                      {i}
                    </span>
                    {chain.map((key) => (
                      <span
                        key={key}
                        className="rounded bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 font-mono text-[9px] leading-tight text-neutral-700 dark:text-neutral-300 break-all"
                      >
                        {key}
                      </span>
                    ))}
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
