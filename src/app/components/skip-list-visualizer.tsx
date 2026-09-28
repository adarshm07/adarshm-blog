'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

// Heights fixed rather than drawn from coin flips, so server and client agree.
const NODES = [
  { key: 3, height: 1 },
  { key: 7, height: 2 },
  { key: 12, height: 1 },
  { key: 19, height: 3 },
  { key: 25, height: 1 },
  { key: 31, height: 2 },
  { key: 40, height: 1 },
]

const LEVELS = [3, 2, 1]

// A cursor position: column -1 is the head sentinel.
type Pos = { col: number; level: number }

type Step = {
  visited: Pos[]
  probe?: Pos // the next node being compared
  found?: boolean
  note: string
}

const steps: Step[] = [
  {
    visited: [],
    note: 'A skip list is a sorted linked list with express lanes. Level 1 holds every key; each higher level holds a random subset — roughly half of the level below. Search for 25.',
  },
  {
    visited: [{ col: -1, level: 3 }],
    probe: { col: 3, level: 3 },
    note: 'Start at the head on the top level. The next node is 19, which is ≤ 25, so move right — skipping 3, 7 and 12 in one hop.',
  },
  {
    visited: [
      { col: -1, level: 3 },
      { col: 3, level: 3 },
    ],
    note: 'On level 3, 19 has no successor. Nothing to the right can help, so drop down a level from the same node.',
  },
  {
    visited: [
      { col: -1, level: 3 },
      { col: 3, level: 3 },
      { col: 3, level: 2 },
    ],
    probe: { col: 5, level: 2 },
    note: 'On level 2, the next node is 31 — past 25. Overshooting means drop down again rather than move right.',
  },
  {
    visited: [
      { col: -1, level: 3 },
      { col: 3, level: 3 },
      { col: 3, level: 2 },
      { col: 3, level: 1 },
    ],
    probe: { col: 4, level: 1 },
    note: 'On level 1, the next node is 25.',
  },
  {
    visited: [
      { col: -1, level: 3 },
      { col: 3, level: 3 },
      { col: 3, level: 2 },
      { col: 3, level: 1 },
      { col: 4, level: 1 },
    ],
    found: true,
    note: 'Found in 3 comparisons instead of the 5 a plain linked list needs. With n keys the expected number of levels is log₂ n, and each level costs O(1) expected steps — so search, insert and delete are all O(log n) expected.',
  },
]

function isVisited(step: Step, col: number, level: number) {
  return step.visited.some((p) => p.col === col && p.level === level)
}

export function SkipListVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2200}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="space-y-1.5">
              {LEVELS.map((level) => (
                <div key={level} className="flex items-center gap-1">
                  <span className="w-6 shrink-0 font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
                    L{level}
                  </span>
                  <div
                    className={[
                      'flex h-8 w-9 shrink-0 items-center justify-center rounded font-mono text-[9px] transition-colors duration-300',
                      isVisited(step, -1, level)
                        ? 'bg-green-600/70 dark:bg-green-500/70 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500',
                    ].join(' ')}
                  >
                    head
                  </div>
                  {NODES.map((node, col) => {
                    const present = node.height >= level
                    const visited = isVisited(step, col, level)
                    const probing = step.probe?.col === col && step.probe.level === level
                    const found = step.found && col === 4 && level === 1
                    return (
                      <div key={node.key} className="flex flex-1 items-center">
                        <div
                          className={[
                            'h-px flex-1',
                            present
                              ? 'bg-neutral-300 dark:bg-neutral-600'
                              : 'bg-neutral-100 dark:bg-neutral-800',
                          ].join(' ')}
                        />
                        <div
                          className={[
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded font-mono text-[11px] transition-colors duration-300',
                            !present
                              ? 'invisible'
                              : found
                                ? 'bg-green-600 dark:bg-green-500 text-white'
                                : probing
                                  ? 'bg-amber-500 text-white'
                                  : visited
                                    ? 'bg-green-600/70 dark:bg-green-500/70 text-white'
                                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200',
                          ].join(' ')}
                        >
                          {node.key}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
              <span>target: 25</span>
              <span>green = path taken · amber = comparing</span>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
