'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const ARRAY = [1, 3, 4, 6, 8, 10, 14, 21]
const TARGET = 10

type SearchStep = {
  lo: number
  hi: number
  mid?: number
  found?: boolean
  note: string
}

const searchSteps: SearchStep[] = [
  {
    lo: 0,
    hi: 7,
    note: `Searching for ${TARGET} in a sorted array. The candidate range is the whole array: lo = 0, hi = 7.`,
  },
  {
    lo: 0,
    hi: 7,
    mid: 3,
    note: 'mid = (0 + 7) / 2 = 3. arr[3] = 6, which is less than 10 — the target must be to the right.',
  },
  {
    lo: 4,
    hi: 7,
    note: 'Discard the left half entirely: lo moves to mid + 1 = 4. Half the array eliminated with one comparison.',
  },
  {
    lo: 4,
    hi: 7,
    mid: 5,
    note: 'mid = (4 + 7) / 2 = 5. arr[5] = 10 — that is the target.',
  },
  {
    lo: 4,
    hi: 7,
    mid: 5,
    found: true,
    note: 'Found at index 5 in just 2 comparisons. Linear search would have taken 6.',
  },
]

export function BinarySearchVisualizer() {
  return (
    <StepPlayer length={searchSteps.length} interval={1800}>
      {(index) => {
        const step = searchSteps[index]
        return (
          <>
            <div className="flex gap-1.5">
              {ARRAY.map((value, i) => {
                const inRange = i >= step.lo && i <= step.hi
                const isMid = step.mid === i
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={[
                        'w-full rounded-md py-2 text-center font-mono text-xs transition-all duration-200',
                        isMid && step.found
                          ? 'bg-green-600 dark:bg-green-500 text-white'
                          : isMid
                            ? 'bg-amber-500 text-white'
                            : inRange
                              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                              : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-300 dark:text-neutral-700',
                      ].join(' ')}
                    >
                      {value}
                    </div>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 tabular-nums">
                      {i === step.lo && i === step.hi
                        ? 'lo,hi'
                        : i === step.lo
                          ? 'lo'
                          : i === step.hi
                            ? 'hi'
                            : step.mid === i
                              ? 'mid'
                              : ' '}
                    </span>
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

type TreeNode = { v: number; x: number; y: number }

const NODES: TreeNode[] = [
  { v: 8, x: 150, y: 28 },
  { v: 3, x: 78, y: 92 },
  { v: 10, x: 222, y: 92 },
  { v: 1, x: 40, y: 156 },
  { v: 6, x: 116, y: 156 },
  { v: 14, x: 260, y: 156 },
  { v: 4, x: 96, y: 220 },
]

const NEW_NODE: TreeNode = { v: 5, x: 128, y: 268 }

const EDGES: [number, number][] = [
  [8, 3],
  [8, 10],
  [3, 1],
  [3, 6],
  [10, 14],
  [6, 4],
]

type BstStep = {
  active?: number
  found?: boolean
  showNew?: boolean
  note: string
}

const bstSteps: BstStep[] = [
  {
    note: 'A binary search tree: everything left of a node is smaller, everything right is larger.',
  },
  {
    active: 8,
    note: 'Search for 4: compare with the root. 4 < 8 → go left, discarding the entire right subtree.',
  },
  { active: 3, note: '4 > 3 → go right.' },
  { active: 6, note: '4 < 6 → go left.' },
  {
    active: 4,
    found: true,
    note: 'Found in 4 comparisons — one per level. Same halving idea as binary search, but on a tree.',
  },
  {
    active: 5,
    found: true,
    showNew: true,
    note: 'Insert 5: follow the identical path (8 → 3 → 6 → 4) until you fall off the tree. 5 > 4 and 4 has no right child, so 5 attaches there.',
  },
]

export function BSTVisualizer() {
  return (
    <StepPlayer length={bstSteps.length} interval={1800}>
      {(index) => {
        const step = bstSteps[index]
        const nodes = step.showNew ? [...NODES, NEW_NODE] : NODES
        const byValue = new Map(nodes.map((n) => [n.v, n]))
        const edges: [TreeNode, TreeNode][] = EDGES.map(([a, b]) => [
          byValue.get(a)!,
          byValue.get(b)!,
        ])
        if (step.showNew) {
          edges.push([byValue.get(4)!, byValue.get(5)!])
        }
        return (
          <>
            <svg
              viewBox="0 0 300 300"
              className="mx-auto block w-full max-w-xs"
              role="img"
              aria-label="Binary search tree diagram"
            >
              {edges.map(([a, b], i) => (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className="stroke-neutral-200 dark:stroke-neutral-700"
                  strokeWidth={1.5}
                />
              ))}
              {nodes.map((n) => {
                const isActive = step.active === n.v
                const isFound = isActive && step.found
                return (
                  <g key={n.v}>
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={17}
                      className={
                        isFound
                          ? 'fill-green-600 dark:fill-green-500'
                          : isActive
                            ? 'fill-amber-500'
                            : 'fill-neutral-100 dark:fill-neutral-800'
                      }
                    />
                    <text
                      x={n.x}
                      y={n.y + 4}
                      textAnchor="middle"
                      className={[
                        'font-mono text-[12px]',
                        isActive
                          ? 'fill-white'
                          : 'fill-neutral-700 dark:fill-neutral-300',
                      ].join(' ')}
                    >
                      {n.v}
                    </text>
                  </g>
                )
              })}
            </svg>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
