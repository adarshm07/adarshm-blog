'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const K = 3

type Step = {
  n: number // items seen so far
  reservoir: (string | null)[]
  incoming?: string
  decision?: { keep: boolean; slot?: number; chance: string }
  note: string
}

const steps: Step[] = [
  {
    n: 0,
    reservoir: [null, null, null],
    note: 'Pick 3 items uniformly at random from a stream of unknown length, in one pass, holding only 3 items in memory. You cannot count first, and you cannot store the stream.',
  },
  {
    n: 3,
    reservoir: ['a', 'b', 'c'],
    note: 'The first 3 items just fill the reservoir. With only 3 seen, keeping all 3 is trivially a uniform sample.',
  },
  {
    n: 4,
    reservoir: ['a', 'b', 'c'],
    incoming: 'd',
    decision: { keep: true, slot: 1, chance: 'k/n = 3/4' },
    note: 'Item 4 arrives. Keep it with probability 3/4, and if kept, have it evict a uniformly chosen slot. The die comes up in its favour, so it replaces b.',
  },
  {
    n: 4,
    reservoir: ['a', 'd', 'c'],
    note: 'Every item now has probability exactly 3/4 of being in the reservoir: d directly, and each of a, b, c survives unless it was the one evicted.',
  },
  {
    n: 5,
    reservoir: ['a', 'd', 'c'],
    incoming: 'e',
    decision: { keep: false, chance: 'k/n = 3/5' },
    note: 'Item 5: keep with probability 3/5. This time the draw says no, so e is discarded and the reservoir is untouched. Rejection is the common case as the stream grows.',
  },
  {
    n: 9,
    reservoir: ['a', 'd', 'c'],
    incoming: 'i',
    decision: { keep: true, slot: 0, chance: 'k/n = 3/9' },
    note: 'Item 9 gets in with probability 1/3 and evicts a. Later items are less likely to be accepted — which is exactly right, because there are more of them competing for the same three slots.',
  },
  {
    n: 1000,
    reservoir: ['i', 'd', 'c'],
    incoming: 'x₁₀₀₀',
    decision: { keep: false, chance: 'k/n = 3/1000' },
    note: 'At item 1000 the acceptance probability is 0.3%. Yet every one of the 1000 items — the first and the last — still has exactly a 3/1000 chance of being in the final sample.',
  },
  {
    n: 1000,
    reservoir: ['i', 'd', 'c'],
    note: 'That is the guarantee: a uniform sample of size k, from a stream of unknown length n, in O(n) time and O(k) memory. The proof is one induction step — the k/n acceptance exactly compensates for the chance of later eviction.',
  },
]

export function ReservoirVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2300}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="flex items-center gap-3">
              <div className="w-20 shrink-0">
                <p className="mb-1 font-mono text-[9px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  incoming
                </p>
                <div
                  className={[
                    'flex h-10 items-center justify-center rounded-lg font-mono text-[12px] transition-colors duration-300',
                    step.incoming
                      ? step.decision?.keep
                        ? 'bg-green-600 dark:bg-green-500 text-white'
                        : 'bg-red-500/80 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600',
                  ].join(' ')}
                >
                  {step.incoming ?? '—'}
                </div>
              </div>

              <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
                {step.decision ? (step.decision.keep ? '→ keep' : '→ drop') : ''}
              </span>

              <div className="flex-1">
                <p className="mb-1 font-mono text-[9px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  reservoir (k = {K})
                </p>
                <div className="flex gap-1">
                  {step.reservoir.map((item, slot) => (
                    <div
                      key={slot}
                      className={[
                        'flex h-10 flex-1 items-center justify-center rounded-lg font-mono text-[12px] transition-colors duration-500',
                        step.decision?.keep && step.decision.slot === slot
                          ? 'bg-amber-500 text-white'
                          : item
                            ? 'bg-green-600/60 dark:bg-green-500/60 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600',
                      ].join(' ')}
                    >
                      {item ?? '·'}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
              <span className="tabular-nums">items seen: {step.n.toLocaleString()}</span>
              <span>
                {step.decision
                  ? `accept probability ${step.decision.chance}`
                  : 'memory used: 3 items'}
              </span>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
