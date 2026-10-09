'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

// ── Floyd–Warshall ─────────────────────────────────────────────────────────

const NODES = ['A', 'B', 'C', 'D']
const INF = '∞'
type Cell = number | typeof INF

type FwStep = {
  k: number | null // intermediate vertex allowed in this pass
  dist: Cell[][]
  changed: [number, number][]
  note: string
}

// Distance matrices traced by running the algorithm in the post. Edges:
// A→B 3, A→D 7, B→A 8, B→C 2, C→A 5, C→D 1, D→A 2.
const fwSteps: FwStep[] = [
  {
    k: null,
    dist: [
      [0, 3, INF, 7],
      [8, 0, 2, INF],
      [5, INF, 0, 1],
      [2, INF, INF, 0],
    ],
    changed: [],
    note: 'Start with direct edges only: dist[i][j] is the edge weight from row i to column j, ∞ where there is no edge, 0 on the diagonal. Floyd–Warshall improves this table one "via" vertex at a time.',
  },
  {
    k: 0,
    dist: [
      [0, 3, INF, 7],
      [8, 0, 2, 15],
      [5, 8, 0, 1],
      [2, 5, INF, 0],
    ],
    changed: [
      [1, 3],
      [2, 1],
      [3, 1],
    ],
    note: 'Pass 1: allow paths through A. For every pair, is i → A → j shorter? B→D was ∞ and becomes 8 + 7 = 15; C→B becomes 5 + 3 = 8; D→B becomes 2 + 3 = 5.',
  },
  {
    k: 1,
    dist: [
      [0, 3, 5, 7],
      [8, 0, 2, 15],
      [5, 8, 0, 1],
      [2, 5, 7, 0],
    ],
    changed: [
      [0, 2],
      [3, 2],
    ],
    note: 'Pass 2: also allow B. A→C = A→B→C = 3 + 2 = 5, and D→C = D→B→C = 5 + 2 = 7 — using the D→B route found in the previous pass.',
  },
  {
    k: 2,
    dist: [
      [0, 3, 5, 6],
      [7, 0, 2, 3],
      [5, 8, 0, 1],
      [2, 5, 7, 0],
    ],
    changed: [
      [0, 3],
      [1, 0],
      [1, 3],
    ],
    note: 'Pass 3: allow C. A→D improves from 7 to 5 + 1 = 6, B→D drops from 15 to 3, and B→A from 8 to 2 + 5 = 7.',
  },
  {
    k: 3,
    dist: [
      [0, 3, 5, 6],
      [5, 0, 2, 3],
      [3, 6, 0, 1],
      [2, 5, 7, 0],
    ],
    changed: [
      [1, 0],
      [2, 0],
      [2, 1],
    ],
    note: 'Pass 4: allow D. B→A = B→D→A = 3 + 2 = 5, C→A = 1 + 2 = 3, C→B = 3 + 3 = 6. After V passes every pair has its shortest distance: O(V³) time, one V×V table.',
  },
]

export function FloydWarshallVisualizer() {
  return (
    <StepPlayer length={fwSteps.length} interval={3000}>
      {(index) => {
        const step = fwSteps[index]
        return (
          <>
            <div className="mb-2 text-center font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
              {step.k === null ? 'direct edges only' : `pass ${step.k + 1}: paths may go through ${NODES[step.k]}`}
            </div>
            <div className="mx-auto grid max-w-xs grid-cols-5 gap-1 font-mono text-[11px]">
              <div />
              {NODES.map((n, j) => (
                <div
                  key={n}
                  className={[
                    'py-1 text-center',
                    step.k === j ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-400 dark:text-neutral-500',
                  ].join(' ')}
                >
                  {n}
                </div>
              ))}
              {step.dist.map((row, i) => (
                <div key={i} className="contents">
                  <div
                    className={[
                      'py-1.5 text-center',
                      step.k === i ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-400 dark:text-neutral-500',
                    ].join(' ')}
                  >
                    {NODES[i]}
                  </div>
                  {row.map((v, j) => {
                    const changed = step.changed.some(([a, b]) => a === i && b === j)
                    const onK = step.k !== null && (i === step.k || j === step.k)
                    return (
                      <div
                        key={j}
                        className={[
                          'rounded-md py-1.5 text-center transition-colors duration-300',
                          changed
                            ? 'bg-green-600 dark:bg-green-500 text-white'
                            : onK
                              ? 'bg-amber-500/15 text-neutral-800 dark:text-neutral-100'
                              : i === j
                                ? 'bg-neutral-50 dark:bg-neutral-900 text-neutral-300 dark:text-neutral-600'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200',
                        ].join(' ')}
                      >
                        {v}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
            <div className="mt-2 text-center font-mono text-[9.5px] text-neutral-400 dark:text-neutral-500">
              row = from · column = to · amber = the via vertex&apos;s row and column · green = improved
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}

// ── Edit distance ──────────────────────────────────────────────────────────

const SRC = 'kitten'
const DST = 'sitting'

// Full DP table, computed by the code in the post: T[i][j] = edit distance
// between the first i letters of SRC and the first j letters of DST.
const TABLE = [
  [0, 1, 2, 3, 4, 5, 6, 7],
  [1, 1, 2, 3, 4, 5, 6, 7],
  [2, 2, 1, 2, 3, 4, 5, 6],
  [3, 3, 2, 1, 2, 3, 4, 5],
  [4, 4, 3, 2, 1, 2, 3, 4],
  [5, 5, 4, 3, 2, 2, 3, 4],
  [6, 6, 5, 4, 3, 3, 2, 3],
]

// The cells on one optimal path, from (0,0) to (6,7).
const PATH: [number, number][] = [
  [0, 0],
  [1, 1],
  [2, 2],
  [3, 3],
  [4, 4],
  [5, 5],
  [6, 6],
  [6, 7],
]

type EdStep = {
  filledRows: number // rows 0..filledRows-1 are visible
  focus?: [number, number]
  path?: boolean
  note: string
}

const edSteps: EdStep[] = [
  {
    filledRows: 1,
    note: 'Edit distance: the fewest single-letter inserts, deletes and substitutions to turn "kitten" into "sitting". Build a table where cell (i, j) is the distance between the first i letters of one word and the first j of the other. Row 0: turning "" into j letters takes j inserts.',
  },
  {
    filledRows: 2,
    focus: [1, 1],
    note: 'Cell (1,1): "k" → "s". The letters differ, so take the cheapest of: substitute (diagonal + 1), delete (above + 1), insert (left + 1). min(0+1, 1+1, 1+1) = 1.',
  },
  {
    filledRows: 3,
    focus: [2, 2],
    note: 'Cell (2,2): "ki" → "si". The last letters match (i = i), so it costs nothing extra: copy the diagonal, 1. Every cell needs only its three neighbours — that is the dynamic-programming step.',
  },
  {
    filledRows: 5,
    focus: [4, 4],
    note: 'Rows fill left to right, top to bottom. "kitt" → "sitt" is still just 1: the matching t\'s each copy the diagonal.',
  },
  {
    filledRows: 7,
    focus: [6, 7],
    note: 'The bottom-right cell is the answer: 3. The table has (m+1) × (n+1) cells, each O(1), so O(m × n) time.',
  },
  {
    filledRows: 7,
    path: true,
    note: 'Walk back from the corner to recover the edits: k→s (substitute), e→i (substitute), then insert g. Diagonal steps on matching letters are free. Spell-checkers, fuzzy search and diff tools are all built on this table.',
  },
]

export function EditDistanceVisualizer() {
  return (
    <StepPlayer length={edSteps.length} interval={3000}>
      {(index) => {
        const step = edSteps[index]
        return (
          <>
            <div className="overflow-x-auto">
              <div
                className="mx-auto grid min-w-[300px] max-w-sm gap-0.5 font-mono text-[10.5px]"
                style={{ gridTemplateColumns: `repeat(${DST.length + 2}, minmax(0, 1fr))` }}
              >
                <div />
                <div className="py-0.5 text-center text-neutral-400 dark:text-neutral-500">ε</div>
                {DST.split('').map((ch, j) => (
                  <div key={j} className="py-0.5 text-center text-neutral-500 dark:text-neutral-400">
                    {ch}
                  </div>
                ))}
                {TABLE.map((row, i) => (
                  <div key={i} className="contents">
                    <div className="py-1 text-center text-neutral-500 dark:text-neutral-400">
                      {i === 0 ? 'ε' : SRC[i - 1]}
                    </div>
                    {row.map((v, j) => {
                      const shown = i < step.filledRows
                      const focus = step.focus?.[0] === i && step.focus?.[1] === j
                      const neighbour =
                        step.focus &&
                        ((i === step.focus[0] - 1 && j === step.focus[1] - 1) ||
                          (i === step.focus[0] - 1 && j === step.focus[1]) ||
                          (i === step.focus[0] && j === step.focus[1] - 1))
                      const onPath = step.path && PATH.some(([a, b]) => a === i && b === j)
                      return (
                        <div
                          key={j}
                          className={[
                            'rounded py-1 text-center transition-colors duration-300',
                            !shown
                              ? 'bg-neutral-50 dark:bg-neutral-900 text-transparent'
                              : focus
                                ? 'bg-green-600 dark:bg-green-500 text-white'
                                : neighbour
                                  ? 'bg-amber-500/25 text-amber-800 dark:text-amber-200'
                                  : onPath
                                    ? 'bg-green-600/25 text-green-800 dark:text-green-300'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200',
                          ].join(' ')}
                        >
                          {v}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
