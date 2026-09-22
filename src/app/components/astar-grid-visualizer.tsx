'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const MAP = [
  '.............',
  '.....#.......',
  '.....#.......',
  'S....#......G',
  '.....#.......',
  '.....#.......',
  '.............',
]

const W = MAP[0].length
const H = MAP.length

const walls = new Set<number>()
let start = 0
let goal = 0

MAP.forEach((row, y) => {
  ;[...row].forEach((ch, x) => {
    const i = y * W + x
    if (ch === '#') walls.add(i)
    if (ch === 'S') start = i
    if (ch === 'G') goal = i
  })
})

const gx = goal % W
const gy = Math.floor(goal / W)

function manhattan(i: number) {
  return Math.abs((i % W) - gx) + Math.abs(Math.floor(i / W) - gy)
}

function neighbors(i: number) {
  const x = i % W
  const y = Math.floor(i / W)
  const out: number[] = []
  if (x > 0) out.push(i - 1)
  if (x < W - 1) out.push(i + 1)
  if (y > 0) out.push(i - W)
  if (y < H - 1) out.push(i + W)
  return out.filter((n) => !walls.has(n))
}

// Uniform edge cost of 1. With useHeuristic = false this is Dijkstra;
// with it, the same loop becomes A*.
function search(useHeuristic: boolean) {
  const dist = new Map<number, number>([[start, 0]])
  const prev = new Map<number, number>()
  const closed = new Set<number>()
  const order: number[] = []
  const open = [{ i: start, f: 0, h: 0 }]

  while (open.length) {
    open.sort((a, b) => a.f - b.f || a.h - b.h)
    const cur = open.shift()!
    if (closed.has(cur.i)) continue
    closed.add(cur.i)
    order.push(cur.i)
    if (cur.i === goal) break

    for (const nb of neighbors(cur.i)) {
      const nd = dist.get(cur.i)! + 1
      if (nd < (dist.get(nb) ?? Infinity)) {
        dist.set(nb, nd)
        prev.set(nb, cur.i)
        const h = useHeuristic ? manhattan(nb) : 0
        open.push({ i: nb, f: nd + h, h })
      }
    }
  }

  const path: number[] = []
  let c: number | undefined = goal
  while (c !== undefined) {
    path.unshift(c)
    if (c === start) break
    c = prev.get(c)
  }
  return { order, path, cost: dist.get(goal) ?? Infinity }
}

const dijkstra = search(false)
const astar = search(true)

const FRAMES = 11

const notes = [
  'Both searches start at S and must reach G. The only difference is how they choose which cell to expand next.',
  'Dijkstra pops the cell with the smallest distance from the start, so it grows an even blob in every direction.',
  'A* pops the smallest f = g + h, where h is the straight-line (Manhattan) distance still to go. That pulls it rightwards, toward the goal.',
  'Dijkstra has no idea where the goal is. It spends the same effort exploring away from it as toward it.',
  'A* reaches the wall and starts hunting for a way around — still biased toward the goal side.',
  "A* has to spill sideways: every cell near the wall looks equally promising until one of them finds a gap. The heuristic can guide the search, it can't see through obstacles.",
  'Around the wall, and now A* runs almost straight at the goal.',
  'Dijkstra is still filling in cells behind the start that can never be on a shortest path to G.',
  'A* reaches the goal after expanding a fraction of the grid.',
  'Dijkstra eventually gets there too — with far more cells expanded for the same answer.',
  'Both return a path of the same length. Manhattan distance never overestimates the real cost on a 4-directional grid, and that admissibility is what guarantees A* stays optimal.',
]

function grid(order: number[], count: number, path: number[], showPath: boolean) {
  const visited = new Set(order.slice(0, count))
  const onPath = showPath ? new Set(path) : new Set<number>()
  return { visited, onPath }
}

export function AStarGridVisualizer() {
  return (
    <StepPlayer length={FRAMES} interval={1500}>
      {(index) => {
        const frac = index / (FRAMES - 2)
        const showPath = index === FRAMES - 1
        const panels = [
          {
            label: 'Dijkstra — f = g',
            data: dijkstra,
            count: showPath
              ? dijkstra.order.length
              : Math.round(dijkstra.order.length * Math.min(frac, 1)),
          },
          {
            label: 'A* — f = g + h',
            data: astar,
            count: showPath
              ? astar.order.length
              : Math.round(astar.order.length * Math.min(frac, 1)),
          },
        ]

        return (
          <>
            <div className="flex flex-col gap-4 sm:flex-row">
              {panels.map((panel) => {
                const { visited, onPath } = grid(
                  panel.data.order,
                  panel.count,
                  panel.data.path,
                  showPath
                )
                return (
                  <div key={panel.label} className="flex-1">
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                      {panel.label}
                    </p>
                    <div
                      className="grid gap-px"
                      style={{ gridTemplateColumns: `repeat(${W}, minmax(0, 1fr))` }}
                    >
                      {Array.from({ length: W * H }, (_, i) => {
                        const isWall = walls.has(i)
                        const isStart = i === start
                        const isGoal = i === goal
                        return (
                          <div
                            key={i}
                            className={[
                              'aspect-square rounded-[2px] transition-colors duration-500 flex items-center justify-center font-mono text-[7px] leading-none',
                              isWall
                                ? 'bg-neutral-300 dark:bg-neutral-600'
                                : isStart || isGoal
                                  ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900'
                                  : onPath.has(i)
                                    ? 'bg-amber-500'
                                    : visited.has(i)
                                      ? 'bg-green-600/40 dark:bg-green-500/40'
                                      : 'bg-neutral-100 dark:bg-neutral-800',
                            ].join(' ')}
                          >
                            {isStart ? 'S' : isGoal ? 'G' : ''}
                          </div>
                        )
                      })}
                    </div>
                    <p className="mt-2 font-mono text-[10px] text-neutral-500 dark:text-neutral-400 tabular-nums">
                      {panel.count} cells expanded
                      {showPath ? ` · path length ${panel.data.cost}` : ''}
                    </p>
                  </div>
                )
              })}
            </div>
            <StepNote>{notes[index]}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
