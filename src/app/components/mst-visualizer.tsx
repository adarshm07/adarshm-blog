'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const NODES = [
  { id: 'A', x: 40, y: 30 },
  { id: 'B', x: 140, y: 20 },
  { id: 'C', x: 240, y: 40 },
  { id: 'D', x: 60, y: 120 },
  { id: 'E', x: 160, y: 130 },
  { id: 'F', x: 250, y: 120 },
]

const POS = new Map(NODES.map((n) => [n.id, n]))

// Sorted by weight — Kruskal's whole algorithm is "walk this list".
const EDGES = [
  { a: 'A', b: 'B', w: 2 },
  { a: 'D', b: 'E', w: 3 },
  { a: 'A', b: 'D', w: 4 },
  { a: 'B', b: 'E', w: 5 },
  { a: 'E', b: 'F', w: 6 },
  { a: 'B', b: 'C', w: 7 },
  { a: 'C', b: 'F', w: 8 },
  { a: 'A', b: 'E', w: 9 },
]

type Step = {
  considered: number
  accepted: number[]
  rejected: number[]
  components: string[][]
  note: string
}

const steps: Step[] = [
  {
    considered: -1,
    accepted: [],
    rejected: [],
    components: [['A'], ['B'], ['C'], ['D'], ['E'], ['F']],
    note: 'A minimum spanning tree connects every vertex with the least total edge weight. Kruskal starts with six separate components — every vertex is its own island.',
  },
  {
    considered: 0,
    accepted: [0],
    rejected: [],
    components: [['A', 'B'], ['C'], ['D'], ['E'], ['F']],
    note: 'Sort every edge by weight and walk the list. A–B (2) joins two different components, so take it.',
  },
  {
    considered: 1,
    accepted: [0, 1],
    rejected: [],
    components: [['A', 'B'], ['C'], ['D', 'E'], ['F']],
    note: 'D–E (3) also joins two components. Kruskal does not care that this is nowhere near the previous edge — the forest is allowed to grow in several places at once.',
  },
  {
    considered: 2,
    accepted: [0, 1, 2],
    rejected: [],
    components: [['A', 'B', 'D', 'E'], ['C'], ['F']],
    note: 'A–D (4) merges the two halves into one component of four.',
  },
  {
    considered: 3,
    accepted: [0, 1, 2],
    rejected: [3],
    components: [['A', 'B', 'D', 'E'], ['C'], ['F']],
    note: 'B–E (5) would connect two vertices already in the same component — a cycle. Reject it. The "are these already connected?" test is exactly what union-find answers in near-constant time.',
  },
  {
    considered: 4,
    accepted: [0, 1, 2, 4],
    rejected: [3],
    components: [['A', 'B', 'D', 'E', 'F'], ['C']],
    note: 'E–F (6) brings F in.',
  },
  {
    considered: 5,
    accepted: [0, 1, 2, 4, 5],
    rejected: [3],
    components: [['A', 'B', 'C', 'D', 'E', 'F']],
    note: 'B–C (7) connects the last vertex. That is n − 1 = 5 edges, so the tree is complete and the remaining edges can be skipped entirely.',
  },
  {
    considered: -1,
    accepted: [0, 1, 2, 4, 5],
    rejected: [3, 6, 7],
    components: [['A', 'B', 'C', 'D', 'E', 'F']],
    note: 'Total weight 2+3+4+6+7 = 22. The greedy choice is safe because of the cut property: for any way of splitting the vertices in two, the lightest edge across the split belongs to some MST.',
  },
]

export function MSTVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2100}>
      {(index) => {
        const step = steps[index]
        const componentOf = new Map<string, number>()
        step.components.forEach((comp, i) => comp.forEach((id) => componentOf.set(id, i)))

        return (
          <>
            <div className="flex flex-col gap-3 sm:flex-row">
              <svg
                viewBox="0 0 290 160"
                className="w-full flex-1"
                role="img"
                aria-label="Graph with the minimum spanning tree edges highlighted"
              >
                {EDGES.map((e, i) => {
                  const pa = POS.get(e.a)!
                  const pb = POS.get(e.b)!
                  const accepted = step.accepted.includes(i)
                  const rejected = step.rejected.includes(i)
                  const active = step.considered === i
                  return (
                    <g key={i}>
                      <line
                        x1={pa.x}
                        y1={pa.y}
                        x2={pb.x}
                        y2={pb.y}
                        className={
                          accepted
                            ? 'stroke-green-600 dark:stroke-green-500'
                            : active
                              ? 'stroke-amber-500'
                              : rejected
                                ? 'stroke-red-400/60'
                                : 'stroke-neutral-200 dark:stroke-neutral-700'
                        }
                        strokeWidth={accepted || active ? 2.5 : 1.2}
                        strokeDasharray={rejected ? '3 2' : undefined}
                      />
                      <text
                        x={(pa.x + pb.x) / 2}
                        y={(pa.y + pb.y) / 2 - 3}
                        textAnchor="middle"
                        className={[
                          'font-mono text-[8px]',
                          accepted
                            ? 'fill-green-700 dark:fill-green-400'
                            : active
                              ? 'fill-amber-500'
                              : 'fill-neutral-400 dark:fill-neutral-500',
                        ].join(' ')}
                      >
                        {e.w}
                      </text>
                    </g>
                  )
                })}
                {NODES.map((n) => {
                  const comp = componentOf.get(n.id) ?? 0
                  const joined = (step.components[comp]?.length ?? 1) > 1
                  return (
                    <g key={n.id}>
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={11}
                        className={
                          joined
                            ? 'fill-green-600/80 dark:fill-green-500/80'
                            : 'fill-neutral-200 dark:fill-neutral-700'
                        }
                      />
                      <text
                        x={n.x}
                        y={n.y + 3.5}
                        textAnchor="middle"
                        className={[
                          'font-mono text-[9px]',
                          joined ? 'fill-white' : 'fill-neutral-600 dark:fill-neutral-300',
                        ].join(' ')}
                      >
                        {n.id}
                      </text>
                    </g>
                  )
                })}
              </svg>

              <div className="sm:w-40">
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  edges by weight
                </p>
                <div className="space-y-0.5">
                  {EDGES.map((e, i) => {
                    const accepted = step.accepted.includes(i)
                    const rejected = step.rejected.includes(i)
                    const active = step.considered === i
                    return (
                      <div
                        key={i}
                        className={[
                          'flex items-center justify-between rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors duration-300',
                          active
                            ? 'bg-amber-500 text-white'
                            : accepted
                              ? 'bg-green-600/15 text-green-700 dark:text-green-400'
                              : rejected
                                ? 'text-neutral-300 line-through dark:text-neutral-600'
                                : 'text-neutral-500 dark:text-neutral-400',
                        ].join(' ')}
                      >
                        <span>
                          {e.a}–{e.b}
                        </span>
                        <span className="tabular-nums">{e.w}</span>
                      </div>
                    )
                  })}
                </div>
                <p className="mt-1.5 font-mono text-[10px] text-neutral-400 dark:text-neutral-500 tabular-nums">
                  {step.components.length} component
                  {step.components.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
