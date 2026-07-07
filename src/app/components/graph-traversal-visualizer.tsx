'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type NodeId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

const POS: Record<NodeId, { x: number; y: number }> = {
  A: { x: 150, y: 30 },
  B: { x: 80, y: 115 },
  C: { x: 220, y: 115 },
  D: { x: 40, y: 200 },
  E: { x: 135, y: 200 },
  F: { x: 225, y: 200 },
}

const EDGES: [NodeId, NodeId][] = [
  ['A', 'B'],
  ['A', 'C'],
  ['B', 'D'],
  ['B', 'E'],
  ['C', 'F'],
  ['E', 'F'],
]

type Step = {
  current: NodeId | null
  visited: NodeId[]
  frontier: NodeId[]
  note: string
}

const bfsSteps: Step[] = [
  { current: null, visited: [], frontier: ['A'], note: 'BFS starts at A. A queue holds nodes waiting to be visited — start with A enqueued.' },
  { current: 'A', visited: ['A'], frontier: ['B', 'C'], note: 'Dequeue A, mark it visited, and enqueue its unvisited neighbors B and C.' },
  { current: 'B', visited: ['A', 'B'], frontier: ['C', 'D', 'E'], note: 'Dequeue B (FIFO — oldest first). Enqueue its neighbors D and E.' },
  { current: 'C', visited: ['A', 'B', 'C'], frontier: ['D', 'E', 'F'], note: 'Dequeue C. Enqueue F. Notice A, B, C were all one edge from the start — a full level.' },
  { current: 'D', visited: ['A', 'B', 'C', 'D'], frontier: ['E', 'F'], note: 'Dequeue D. Its only neighbor B is already visited.' },
  { current: 'E', visited: ['A', 'B', 'C', 'D', 'E'], frontier: ['F'], note: 'Dequeue E. Neighbor F is already queued, so nothing new.' },
  { current: 'F', visited: ['A', 'B', 'C', 'D', 'E', 'F'], frontier: [], note: 'Dequeue F. Queue empty — done. Order A,B,C,D,E,F visits every node closest-first.' },
]

const dfsSteps: Step[] = [
  { current: null, visited: [], frontier: ['A'], note: 'DFS starts at A. The stack is the recursion path — how deep we currently are.' },
  { current: 'A', visited: ['A'], frontier: ['A'], note: 'Visit A, then dive into its first neighbor instead of queuing siblings.' },
  { current: 'B', visited: ['A', 'B'], frontier: ['A', 'B'], note: 'Go deep: visit B, then descend into B’s first neighbor.' },
  { current: 'D', visited: ['A', 'B', 'D'], frontier: ['A', 'B', 'D'], note: 'Visit D. It has no unvisited neighbors — a dead end, so backtrack.' },
  { current: 'E', visited: ['A', 'B', 'D', 'E'], frontier: ['A', 'B', 'E'], note: 'Back at B, take its next neighbor E and descend again.' },
  { current: 'F', visited: ['A', 'B', 'D', 'E', 'F'], frontier: ['A', 'B', 'E', 'F'], note: 'Dive into F from E.' },
  { current: 'C', visited: ['A', 'B', 'D', 'E', 'F', 'C'], frontier: ['A', 'B', 'E', 'F', 'C'], note: 'F’s neighbor C is last. Order A,B,D,E,F,C plunges deep before spreading wide.' },
]

export function GraphTraversalVisualizer({ mode }: { mode: 'bfs' | 'dfs' }) {
  const steps = mode === 'bfs' ? bfsSteps : dfsSteps
  const label = mode === 'bfs' ? 'Queue' : 'Stack'
  return (
    <StepPlayer length={steps.length} interval={1900}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <svg
              viewBox="0 0 300 230"
              className="mx-auto block w-full max-w-sm"
              role="img"
              aria-label={`${mode.toUpperCase()} graph traversal`}
            >
              {EDGES.map(([a, b], i) => (
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
              {(Object.keys(POS) as NodeId[]).map((id) => {
                const isCurrent = step.current === id
                const isVisited = step.visited.includes(id)
                return (
                  <g key={id}>
                    <circle
                      cx={POS[id].x}
                      cy={POS[id].y}
                      r={18}
                      className={
                        isCurrent
                          ? 'fill-amber-500'
                          : isVisited
                            ? 'fill-green-600 dark:fill-green-500'
                            : 'fill-neutral-100 dark:fill-neutral-800'
                      }
                    />
                    <text
                      x={POS[id].x}
                      y={POS[id].y + 5}
                      textAnchor="middle"
                      className={[
                        'font-mono text-[13px]',
                        isCurrent || isVisited
                          ? 'fill-white'
                          : 'fill-neutral-600 dark:fill-neutral-400',
                      ].join(' ')}
                    >
                      {id}
                    </text>
                  </g>
                )
              })}
            </svg>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[11px]">
              <span className="text-neutral-500 dark:text-neutral-400">
                {label}: [{step.frontier.join(', ')}]
              </span>
              <span className="text-green-600 dark:text-green-500">
                visited: {step.visited.join(' → ') || '—'}
              </span>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
