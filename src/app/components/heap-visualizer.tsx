'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const POS = [
  { x: 150, y: 28 }, // 0
  { x: 85, y: 92 }, // 1
  { x: 215, y: 92 }, // 2
  { x: 50, y: 156 }, // 3
  { x: 120, y: 156 }, // 4
  { x: 185, y: 156 }, // 5
  { x: 250, y: 156 }, // 6
]

const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [2, 5],
  [2, 6],
]

type Step = {
  heap: number[]
  active?: number
  parent?: number
  done?: boolean
  note: string
}

// Min-heap. Insert 0 into [1,3,2,7,5,4] and sift it up.
const steps: Step[] = [
  { heap: [1, 3, 2, 7, 5, 4], note: 'A min-heap: every parent is ≤ its children, so the smallest value is always at the root. We insert 0.' },
  { heap: [1, 3, 2, 7, 5, 4, 0], active: 6, parent: 2, note: 'New values go at the next open slot (index 6) to keep the tree complete. But 0 < its parent 2 — the heap property is broken.' },
  { heap: [1, 3, 0, 7, 5, 4, 2], active: 2, parent: 0, note: 'Swap 0 up with its parent. Now compare 0 with the new parent, the root 1. Still smaller.' },
  { heap: [0, 3, 1, 7, 5, 4, 2], active: 0, done: true, note: 'Swap again — 0 is now the root. It has no parent, so we stop. Insertion is O(log n): at most one swap per level.' },
]

export function HeapVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={1600}>
      {(index) => {
        const step = steps[index]
        const n = step.heap.length
        return (
          <>
            <svg
              viewBox="0 0 300 185"
              className="mx-auto block w-full max-w-sm"
              role="img"
              aria-label="Min-heap represented as a binary tree during an insert"
            >
              {EDGES.filter(([a, b]) => a < n && b < n).map(([a, b], i) => (
                <line
                  key={i}
                  x1={POS[a].x}
                  y1={POS[a].y}
                  x2={POS[b].x}
                  y2={POS[b].y}
                  className="stroke-neutral-200 dark:stroke-neutral-700"
                  strokeWidth={1.5}
                />
              ))}
              {step.heap.map((v, i) => {
                const isActive = step.active === i
                const isParent = step.parent === i
                const isDone = isActive && step.done
                return (
                  <g key={i}>
                    <circle
                      cx={POS[i].x}
                      cy={POS[i].y}
                      r={16}
                      className={
                        isDone
                          ? 'fill-green-600 dark:fill-green-500'
                          : isActive
                            ? 'fill-amber-500'
                            : isParent
                              ? 'fill-sky-500'
                              : 'fill-neutral-100 dark:fill-neutral-800'
                      }
                    />
                    <text
                      x={POS[i].x}
                      y={POS[i].y + 4}
                      textAnchor="middle"
                      className={[
                        'font-mono text-[12px]',
                        isActive || isParent || isDone
                          ? 'fill-white'
                          : 'fill-neutral-700 dark:fill-neutral-300',
                      ].join(' ')}
                    >
                      {v}
                    </text>
                  </g>
                )
              })}
            </svg>
            <div className="mt-2 text-center font-mono text-xs text-neutral-500 dark:text-neutral-400">
              array: [{step.heap.join(', ')}]
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
