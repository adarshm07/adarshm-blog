'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Step = {
  op: string
  order: string[] // most recently used first
  active?: string
  evicted?: string
  miss?: boolean
  note: string
}

const steps: Step[] = [
  {
    op: '—',
    order: [],
    note: 'An empty LRU cache with capacity 3. Newest entries sit at the head, the eviction victim at the tail.',
  },
  {
    op: 'put("a", 1)',
    order: ['a'],
    active: 'a',
    note: 'First entry goes to the head of the list and into the hash map.',
  },
  {
    op: 'put("b", 2)',
    order: ['b', 'a'],
    active: 'b',
    note: 'Each new entry is inserted at the head — "a" slides toward the tail.',
  },
  {
    op: 'put("c", 3)',
    order: ['c', 'b', 'a'],
    active: 'c',
    note: 'Cache is now full: 3 of 3 slots used. "a" is the least recently used.',
  },
  {
    op: 'get("a")',
    order: ['a', 'c', 'b'],
    active: 'a',
    note: 'Cache hit! Reading "a" moves it to the head — that is the whole trick. Now "b" is the LRU entry.',
  },
  {
    op: 'put("d", 4)',
    order: ['d', 'a', 'c'],
    active: 'd',
    evicted: 'b',
    note: 'Cache is full, so the tail entry "b" is evicted before "d" is inserted at the head.',
  },
  {
    op: 'get("b")',
    order: ['d', 'a', 'c'],
    miss: true,
    note: 'Cache miss — "b" was evicted. The caller falls back to the slow path (database, API, recomputation).',
  },
]

export function LRUVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2000}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mb-3">
              {step.op}
              {step.miss && (
                <span className="ml-2 rounded bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-1.5 py-0.5 text-[10px]">
                  miss
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                head (MRU)
              </span>
              <div className="flex items-center gap-1.5 flex-1">
                {step.order.length === 0 ? (
                  <span className="text-[11px] text-neutral-300 dark:text-neutral-600">
                    (empty)
                  </span>
                ) : (
                  step.order.map((key, i) => (
                    <span key={key} className="flex items-center gap-1.5">
                      <span
                        className={[
                          'rounded-md px-3 py-2 font-mono text-xs transition-colors duration-200',
                          step.active === key
                            ? 'bg-amber-500 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
                        ].join(' ')}
                      >
                        {key}
                      </span>
                      {i < step.order.length - 1 && (
                        <span className="text-neutral-300 dark:text-neutral-600 text-xs">
                          ⇄
                        </span>
                      )}
                    </span>
                  ))
                )}
                {step.evicted && (
                  <span className="ml-auto rounded-md px-3 py-2 font-mono text-xs bg-red-100 dark:bg-red-950 text-red-500 dark:text-red-400 line-through">
                    {step.evicted}
                  </span>
                )}
              </div>
              <span className="text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                tail (LRU)
              </span>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
