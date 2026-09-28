'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const NODES = [
  { id: 'S', x: 30, y: 80 },
  { id: 'A', x: 140, y: 30 },
  { id: 'B', x: 140, y: 130 },
  { id: 'C', x: 250, y: 30 },
  { id: 'D', x: 250, y: 130 },
]

const POS = new Map(NODES.map((n) => [n.id, n]))

// Deliberately listed in an unhelpful order, so it takes every pass.
const EDGES = [
  { a: 'C', b: 'D', w: 3 },
  { a: 'A', b: 'C', w: 1 },
  { a: 'B', b: 'A', w: -4 },
  { a: 'S', b: 'A', w: 2 },
  { a: 'S', b: 'B', w: 5 },
  { a: 'B', b: 'D', w: 4 },
]

const INF = '∞'

type Step = {
  pass: string
  dist: Record<string, number | string>
  relaxed: number[]
  changed: string[]
  note: string
}

// Traced by running the code in the post on this graph.
const steps: Step[] = [
  {
    pass: 'start',
    dist: { S: 0, A: INF, B: INF, C: INF, D: INF },
    relaxed: [],
    changed: [],
    note: 'Shortest paths from S, with one negative edge (B → A, −4). Every distance starts at ∞ except the source. Each pass relaxes every edge once, in the same fixed order.',
  },
  {
    pass: 'pass 1',
    dist: { S: 0, A: 2, B: 5, C: INF, D: 9 },
    relaxed: [3, 4, 5],
    changed: ['A', 'B', 'D'],
    note: 'Pass 1. C→D, A→C and B→A are useless because their tails are still ∞. Then S→A sets A = 2, S→B sets B = 5, and B→D sets D = 9.',
  },
  {
    pass: 'pass 2',
    dist: { S: 0, A: 1, B: 5, C: 3, D: 9 },
    relaxed: [1, 2],
    changed: ['C', 'A'],
    note: 'Pass 2. A→C sets C = 3 using the old A. Then B→A finds 5 + (−4) = 1 < 2, so A drops to 1. Dijkstra would already have locked A at 2 and never revisited it.',
  },
  {
    pass: 'pass 3',
    dist: { S: 0, A: 1, B: 5, C: 2, D: 6 },
    relaxed: [0, 1],
    changed: ['D', 'C'],
    note: 'Pass 3. C→D improves D to 6, then A→C uses the new A to bring C down to 2. The improvement is propagating one edge per pass.',
  },
  {
    pass: 'pass 4',
    dist: { S: 0, A: 1, B: 5, C: 2, D: 5 },
    relaxed: [0],
    changed: ['D'],
    note: 'Pass 4 (= V − 1). C→D finally carries the −4 all the way to D: 2 + 3 = 5. The shortest path S→B→A→C→D has 4 edges, which is why it needed 4 passes.',
  },
  {
    pass: 'check',
    dist: { S: 0, A: 1, B: 5, C: 2, D: 5 },
    relaxed: [],
    changed: [],
    note: 'One extra pass changes nothing, so there is no negative cycle and these distances are final. If anything had still improved here, a cycle with negative total weight would be reachable and "shortest path" would be undefined.',
  },
]

export function BellmanFordVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2600}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="flex flex-col gap-3 sm:flex-row">
              <svg
                viewBox="0 0 280 160"
                className="w-full flex-1"
                role="img"
                aria-label="Directed weighted graph with Bellman-Ford distances"
              >
                <defs>
                  <marker
                    id="bf-arrow"
                    viewBox="0 0 10 10"
                    refX="10"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto-start-reverse"
                  >
                    <path d="M0,0 L10,5 L0,10 z" className="fill-neutral-400 dark:fill-neutral-500" />
                  </marker>
                </defs>
                {EDGES.map((e, i) => {
                  const pa = POS.get(e.a)!
                  const pb = POS.get(e.b)!
                  const dx = pb.x - pa.x
                  const dy = pb.y - pa.y
                  const len = Math.hypot(dx, dy)
                  const r = 13
                  const x1 = pa.x + (dx / len) * r
                  const y1 = pa.y + (dy / len) * r
                  const x2 = pb.x - (dx / len) * r
                  const y2 = pb.y - (dy / len) * r
                  const hot = step.relaxed.includes(i)
                  return (
                    <g key={i}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        markerEnd="url(#bf-arrow)"
                        className={
                          hot
                            ? 'stroke-amber-500'
                            : e.w < 0
                              ? 'stroke-red-400'
                              : 'stroke-neutral-300 dark:stroke-neutral-600'
                        }
                        strokeWidth={hot ? 2.5 : 1.3}
                      />
                      <text
                        x={(pa.x + pb.x) / 2 + (dy === 0 ? 0 : 8)}
                        y={(pa.y + pb.y) / 2 - 4}
                        textAnchor="middle"
                        className={[
                          'font-mono text-[9px]',
                          e.w < 0 ? 'fill-red-500' : 'fill-neutral-400 dark:fill-neutral-500',
                        ].join(' ')}
                      >
                        {e.w}
                      </text>
                    </g>
                  )
                })}
                {NODES.map((n) => {
                  const changed = step.changed.includes(n.id)
                  return (
                    <g key={n.id}>
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={13}
                        className={
                          changed
                            ? 'fill-amber-500'
                            : n.id === 'S'
                              ? 'fill-green-600 dark:fill-green-500'
                              : 'fill-neutral-200 dark:fill-neutral-700'
                        }
                      />
                      <text
                        x={n.x}
                        y={n.y + 3.5}
                        textAnchor="middle"
                        className={[
                          'font-mono text-[10px]',
                          changed || n.id === 'S'
                            ? 'fill-white'
                            : 'fill-neutral-700 dark:fill-neutral-200',
                        ].join(' ')}
                      >
                        {n.id}
                      </text>
                    </g>
                  )
                })}
              </svg>

              <div className="sm:w-32">
                <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  dist · {step.pass}
                </div>
                <div className="space-y-0.5">
                  {NODES.map((n) => (
                    <div
                      key={n.id}
                      className={[
                        'flex justify-between rounded px-2 py-0.5 font-mono text-[11px] transition-colors duration-300',
                        step.changed.includes(n.id)
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                          : 'text-neutral-600 dark:text-neutral-300',
                      ].join(' ')}
                    >
                      <span>{n.id}</span>
                      <span className="tabular-nums">{step.dist[n.id]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
