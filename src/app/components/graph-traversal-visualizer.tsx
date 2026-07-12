'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type GNode = { id: string; x: number; y: number }

const NODES: GNode[] = [
  { id: 'A', x: 150, y: 30 },
  { id: 'B', x: 80, y: 105 },
  { id: 'C', x: 220, y: 105 },
  { id: 'D', x: 40, y: 180 },
  { id: 'E', x: 120, y: 180 },
  { id: 'F', x: 260, y: 180 },
]

const EDGES: [string, string][] = [
  ['A', 'B'],
  ['A', 'C'],
  ['B', 'D'],
  ['B', 'E'],
  ['C', 'F'],
]

const POS = new Map(NODES.map((n) => [n.id, n]))

type Step = {
  visited: string[]
  current?: string
  frontier: string[]
  frontierLabel: string
  note: string
}

function GraphView({ step }: { step: Step }) {
  return (
    <>
      <svg
        viewBox="0 0 300 210"
        className="mx-auto block w-full max-w-sm"
        role="img"
        aria-label="Graph traversal diagram"
      >
        {EDGES.map(([a, b], i) => {
          const pa = POS.get(a)!
          const pb = POS.get(b)!
          return (
            <line
              key={i}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              className="stroke-neutral-200 dark:stroke-neutral-700"
              strokeWidth={1.5}
            />
          )
        })}
        {NODES.map((n) => {
          const isCurrent = step.current === n.id
          const isVisited = step.visited.includes(n.id)
          const inFrontier = step.frontier.includes(n.id)
          return (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r={16}
                className={
                  isCurrent
                    ? 'fill-amber-500'
                    : isVisited
                      ? 'fill-green-600 dark:fill-green-500'
                      : inFrontier
                        ? 'fill-neutral-300 dark:fill-neutral-600'
                        : 'fill-neutral-100 dark:fill-neutral-800'
                }
              />
              <text
                x={n.x}
                y={n.y + 4}
                textAnchor="middle"
                className={[
                  'font-mono text-[12px]',
                  isCurrent || isVisited
                    ? 'fill-white'
                    : 'fill-neutral-700 dark:fill-neutral-300',
                ].join(' ')}
              >
                {n.id}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="mt-2 text-center font-mono text-xs text-neutral-600 dark:text-neutral-300">
        {step.frontierLabel}:{' '}
        <span className="text-amber-500">[{step.frontier.join(', ')}]</span>
      </div>
      <StepNote>{step.note}</StepNote>
    </>
  )
}

const bfsSteps: Step[] = [
  { visited: [], frontier: ['A'], frontierLabel: 'queue', note: 'BFS uses a queue (FIFO). Start by enqueueing A.' },
  { visited: ['A'], current: 'A', frontier: ['B', 'C'], frontierLabel: 'queue', note: 'Dequeue A, mark it visited, enqueue its neighbours B and C.' },
  { visited: ['A', 'B'], current: 'B', frontier: ['C', 'D', 'E'], frontierLabel: 'queue', note: 'Dequeue B (it went in first). Enqueue its unvisited neighbours D and E behind C.' },
  { visited: ['A', 'B', 'C'], current: 'C', frontier: ['D', 'E', 'F'], frontierLabel: 'queue', note: 'Dequeue C. Enqueue F. Notice we finish the whole first level before going deeper.' },
  { visited: ['A', 'B', 'C', 'D'], current: 'D', frontier: ['E', 'F'], frontierLabel: 'queue', note: 'Dequeue D — a leaf, no new neighbours.' },
  { visited: ['A', 'B', 'C', 'D', 'E'], current: 'E', frontier: ['F'], frontierLabel: 'queue', note: 'Dequeue E — also a leaf.' },
  { visited: ['A', 'B', 'C', 'D', 'E', 'F'], current: 'F', frontier: [], frontierLabel: 'queue', note: 'Dequeue F. Queue empty — done. Visit order A B C D E F is level by level, which is why BFS finds shortest paths in unweighted graphs.' },
]

const dfsSteps: Step[] = [
  { visited: [], frontier: ['A'], frontierLabel: 'stack', note: 'DFS uses a stack (LIFO) — or the call stack via recursion. Push A.' },
  { visited: ['A'], current: 'A', frontier: ['C', 'B'], frontierLabel: 'stack', note: 'Pop A, mark visited, push neighbours. B ends up on top, so we will dive into B first.' },
  { visited: ['A', 'B'], current: 'B', frontier: ['C', 'E', 'D'], frontierLabel: 'stack', note: 'Pop B. Push D and E. We go deep, not wide — B before we ever touch C.' },
  { visited: ['A', 'B', 'D'], current: 'D', frontier: ['C', 'E'], frontierLabel: 'stack', note: 'Pop D — a leaf. Backtrack.' },
  { visited: ['A', 'B', 'D', 'E'], current: 'E', frontier: ['C'], frontierLabel: 'stack', note: 'Pop E — a leaf. B’s subtree is fully explored; only now do we return to C.' },
  { visited: ['A', 'B', 'D', 'E', 'C'], current: 'C', frontier: ['F'], frontierLabel: 'stack', note: 'Pop C. Push F.' },
  { visited: ['A', 'B', 'D', 'E', 'C', 'F'], current: 'F', frontier: [], frontierLabel: 'stack', note: 'Pop F. Done. Visit order A B D E C F dives to the bottom of each branch before backtracking.' },
]

export function GraphBFSVisualizer() {
  return (
    <StepPlayer length={bfsSteps.length} interval={1600}>
      {(index) => <GraphView step={bfsSteps[index]} />}
    </StepPlayer>
  )
}

export function GraphDFSVisualizer() {
  return (
    <StepPlayer length={dfsSteps.length} interval={1600}>
      {(index) => <GraphView step={dfsSteps[index]} />}
    </StepPlayer>
  )
}
