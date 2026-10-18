'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

// ── A small graph renderer shared by the visualizers below ─────────────────

export type GNode = { id: string; x: number; y: number }
export type Tone = 'amber' | 'sky' | 'green' | 'violet' | 'rose' | 'muted'

const NODE_TONE: Record<Tone, string> = {
  amber: 'fill-amber-500/25 stroke-amber-500',
  sky: 'fill-sky-500/25 stroke-sky-500',
  green: 'fill-green-600/25 stroke-green-600 dark:stroke-green-500',
  violet: 'fill-violet-500/25 stroke-violet-500',
  rose: 'fill-rose-500/25 stroke-rose-500',
  muted: 'fill-neutral-50 dark:fill-neutral-900 stroke-neutral-300 dark:stroke-neutral-600',
}

const R = 13

export function GraphFrame({
  nodes,
  edges,
  directed = false,
  width = 320,
  height = 190,
  tone = () => 'muted',
  edgeTone,
  label,
  edgeLabel,
}: {
  nodes: GNode[]
  edges: [string, string][]
  directed?: boolean
  width?: number
  height?: number
  tone?: (id: string) => Tone
  edgeTone?: (a: string, b: string) => 'hot' | 'bad' | 'dim' | undefined
  label?: (id: string) => string | undefined
  edgeLabel?: (a: string, b: string) => string | undefined
}) {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto block w-full max-w-sm" role="img" aria-label="Graph">
      <defs>
        <marker id="ga-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1,1 L9,5 L1,9 z" className="fill-neutral-400 dark:fill-neutral-500" />
        </marker>
      </defs>
      {edges.map(([a, b]) => {
        const p = byId.get(a)!
        const q = byId.get(b)!
        const len = Math.hypot(q.x - p.x, q.y - p.y)
        const ux = (q.x - p.x) / len
        const uy = (q.y - p.y) / len
        const t = edgeTone?.(a, b)
        const text = edgeLabel?.(a, b)
        return (
          <g key={`${a}-${b}`}>
          <line
            x1={p.x + ux * R}
            y1={p.y + uy * R}
            x2={q.x - ux * (R + (directed ? 2 : 0))}
            y2={q.y - uy * (R + (directed ? 2 : 0))}
            strokeWidth={t === 'hot' || t === 'bad' ? 2.4 : 1.4}
            strokeDasharray={t === 'dim' ? '3 3' : undefined}
            markerEnd={directed ? 'url(#ga-arrow)' : undefined}
            className={
              t === 'hot'
                ? 'stroke-amber-500'
                : t === 'bad'
                  ? 'stroke-rose-500'
                  : 'stroke-neutral-300 dark:stroke-neutral-600'
            }
          />
          {text ? (
            <text
              x={(p.x + q.x) / 2 - uy * 9}
              y={(p.y + q.y) / 2 + ux * 9 + 3}
              textAnchor="middle"
              className={[
                'font-mono text-[9px]',
                t === 'hot' ? 'fill-amber-600 dark:fill-amber-400' : 'fill-neutral-500 dark:fill-neutral-400',
              ].join(' ')}
            >
              {text}
            </text>
          ) : null}
          </g>
        )
      })}
      {nodes.map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={R} strokeWidth={1.5} className={`transition-colors duration-300 ${NODE_TONE[tone(n.id)]}`} />
          <text x={n.x} y={n.y + 4} textAnchor="middle" className="fill-neutral-800 dark:fill-neutral-100 font-mono text-[11px]">
            {n.id}
          </text>
          {label?.(n.id) ? (
            <text x={n.x} y={n.y - R - 4} textAnchor="middle" className="fill-neutral-500 dark:fill-neutral-400 font-mono text-[9px]">
              {label(n.id)}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  )
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 font-mono text-[10.5px]">
      <span className="text-neutral-400 dark:text-neutral-500">{k}</span>
      <span className="text-right text-neutral-800 dark:text-neutral-100">{v}</span>
    </div>
  )
}

// ── Strongly connected components (Kosaraju) ──────────────────────────────

const SCC_NODES: GNode[] = [
  { id: 'A', x: 40, y: 30 },
  { id: 'B', x: 130, y: 30 },
  { id: 'C', x: 85, y: 105 },
  { id: 'D', x: 215, y: 30 },
  { id: 'E', x: 290, y: 75 },
  { id: 'F', x: 215, y: 120 },
  { id: 'G', x: 140, y: 165 },
  { id: 'H', x: 50, y: 165 },
]
const SCC_EDGES: [string, string][] = [
  ['A', 'B'],
  ['B', 'C'],
  ['C', 'A'],
  ['B', 'D'],
  ['D', 'E'],
  ['E', 'F'],
  ['F', 'D'],
  ['G', 'F'],
  ['G', 'H'],
  ['H', 'G'],
]

type SccStep = {
  done: string[] // finished in pass 1, in order
  reversed: boolean
  comps: Record<string, Tone>
  note: string
}

// Traced with the code in the post.
const sccSteps: SccStep[] = [
  {
    done: [],
    reversed: false,
    comps: {},
    note: 'A directed graph. A strongly connected component (SCC) is a maximal set of nodes where every node can reach every other. Kosaraju\'s algorithm finds them with two depth-first passes.',
  },
  {
    done: ['C'],
    reversed: false,
    comps: {},
    note: 'Pass 1: DFS from A → B → C. C\'s only edge leads back to A, already visited, so C finishes first. Record nodes in the order they finish.',
  },
  {
    done: ['C', 'F', 'E', 'D', 'B', 'A'],
    reversed: false,
    comps: {},
    note: 'Back at B, go on to D → E → F. F leads back to D, so F, E, D finish, then B and A. Finish order so far: C F E D B A.',
  },
  {
    done: ['C', 'F', 'E', 'D', 'B', 'A', 'H', 'G'],
    reversed: false,
    comps: {},
    note: 'G hasn\'t been visited, so start another DFS there: G → H (G → F is already done). H finishes, then G. The last node to finish, G, is in a "source" component — nothing outside it can reach it.',
  },
  {
    done: ['C', 'F', 'E', 'D', 'B', 'A', 'H', 'G'],
    reversed: true,
    comps: {},
    note: 'Reverse every edge. SCCs stay the same (a cycle reversed is still a cycle), but the edges between components now point the other way.',
  },
  {
    done: ['C', 'F', 'E', 'D', 'B', 'A', 'H', 'G'],
    reversed: true,
    comps: { G: 'amber', H: 'amber' },
    note: 'Pass 2: DFS on the reversed graph, starting from nodes in reverse finish order. From G we reach only H: the edge into F now points the wrong way. SCC 1 = {G, H}.',
  },
  {
    done: ['C', 'F', 'E', 'D', 'B', 'A', 'H', 'G'],
    reversed: true,
    comps: { G: 'amber', H: 'amber', A: 'sky', B: 'sky', C: 'sky' },
    note: 'Next unvisited in reverse finish order is A. Reversed edges take it to C and B, and no further — the edge to D is reversed too. SCC 2 = {A, B, C}.',
  },
  {
    done: ['C', 'F', 'E', 'D', 'B', 'A', 'H', 'G'],
    reversed: true,
    comps: { G: 'amber', H: 'amber', A: 'sky', B: 'sky', C: 'sky', D: 'green', E: 'green', F: 'green' },
    note: 'Finally D reaches F and E. SCC 3 = {D, E, F}. Collapse each SCC to a single node and what remains is a DAG: {A,B,C} → {D,E,F} ← {G,H}. Two DFS passes: O(V + E).',
  },
]

export function SccVisualizer() {
  return (
    <StepPlayer length={sccSteps.length} interval={3000}>
      {(index) => {
        const step = sccSteps[index]
        const edges = step.reversed ? SCC_EDGES.map(([a, b]) => [b, a] as [string, string]) : SCC_EDGES
        return (
          <>
            <GraphFrame
              nodes={SCC_NODES}
              edges={edges}
              directed
              tone={(id) => step.comps[id] ?? (step.done.includes(id) && !step.reversed ? 'violet' : 'muted')}
              label={(id) => {
                const at = step.done.indexOf(id)
                return at >= 0 && !step.reversed ? `#${at + 1}` : undefined
              }}
            />
            <div className="mt-2 space-y-0.5">
              <Line k={step.reversed ? 'reversed graph' : 'finish order'} v={step.done.join(' ') || '—'} />
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}

// ── Bipartite check (BFS two-colouring) ────────────────────────────────────

const BIP_NODES: GNode[] = [
  { id: '1', x: 60, y: 40 },
  { id: '2', x: 160, y: 40 },
  { id: '3', x: 260, y: 40 },
  { id: '4', x: 60, y: 150 },
  { id: '5', x: 160, y: 150 },
  { id: '6', x: 260, y: 150 },
]
const BIP_EDGES: [string, string][] = [
  ['1', '2'],
  ['2', '3'],
  ['3', '6'],
  ['6', '5'],
  ['5', '4'],
  ['4', '1'],
]

type BipStep = { colors: Record<string, 'amber' | 'sky'>; queue: string; extra?: boolean; note: string }

const bipSteps: BipStep[] = [
  { colors: {}, queue: '—', note: 'Can these nodes be split into two groups so that every edge goes between the groups? That\'s what "bipartite" means. Try to colour the graph with two colours, so no edge joins two nodes of the same colour.' },
  { colors: { '1': 'amber' }, queue: '1', note: 'BFS from node 1. Give it the first colour.' },
  { colors: { '1': 'amber', '2': 'sky', '4': 'sky' }, queue: '2 4', note: 'Every neighbour of 1 must get the other colour: 2 and 4 become blue.' },
  { colors: { '1': 'amber', '2': 'sky', '4': 'sky', '3': 'amber', '5': 'amber' }, queue: '3 5', note: 'From 2, colour 3 amber. From 4, colour 5 amber. Each node is forced by its parent — there\'s never a choice.' },
  { colors: { '1': 'amber', '2': 'sky', '4': 'sky', '3': 'amber', '5': 'amber', '6': 'sky' }, queue: '6', note: 'From 3, colour 6 blue. Then check 6\'s other edge, to 5: blue–amber. Fine.' },
  { colors: { '1': 'amber', '2': 'sky', '4': 'sky', '3': 'amber', '5': 'amber', '6': 'sky' }, queue: '—', note: 'Every edge joins different colours, so the graph is bipartite: {1, 3, 5} and {2, 4, 6}. An even cycle can always be coloured like this.' },
  { colors: { '1': 'amber', '2': 'sky', '4': 'sky', '3': 'amber', '5': 'amber', '6': 'sky' }, queue: '—', extra: true, note: 'Add the edge 2–4. Both ends are blue — a conflict. 1, 2, 4 form a triangle, an odd cycle. A graph is bipartite exactly when it has no odd cycle, and the BFS finds one by hitting a same-colour edge.' },
]

export function BipartiteVisualizer() {
  return (
    <StepPlayer length={bipSteps.length} interval={2600}>
      {(index) => {
        const step = bipSteps[index]
        const edges = step.extra ? [...BIP_EDGES, ['2', '4'] as [string, string]] : BIP_EDGES
        return (
          <>
            <GraphFrame
              nodes={BIP_NODES}
              edges={edges}
              tone={(id) => step.colors[id] ?? 'muted'}
              edgeTone={(a, b) => (step.extra && ((a === '2' && b === '4') || (a === '4' && b === '2')) ? 'bad' : undefined)}
            />
            <div className="mt-2">
              <Line k="BFS queue" v={step.queue} />
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}

// ── Lowest common ancestor with binary lifting ─────────────────────────────

const LCA_NODES: GNode[] = [
  { id: '1', x: 160, y: 20 },
  { id: '2', x: 90, y: 62 },
  { id: '3', x: 240, y: 62 },
  { id: '4', x: 55, y: 104 },
  { id: '5', x: 125, y: 104 },
  { id: '6', x: 240, y: 104 },
  { id: '7', x: 30, y: 146 },
  { id: '8', x: 85, y: 146 },
  { id: '9', x: 240, y: 146 },
  { id: '10', x: 30, y: 188 },
]
const LCA_EDGES: [string, string][] = [
  ['1', '2'],
  ['1', '3'],
  ['2', '4'],
  ['2', '5'],
  ['3', '6'],
  ['4', '7'],
  ['4', '8'],
  ['6', '9'],
  ['7', '10'],
]

type LcaStep = { u?: string; v?: string; answer?: string; jump?: [string, string][]; table: [string, string][]; note: string }

const UP_TABLE: [string, string][] = [
  ['node', '↑1  ↑2  ↑4'],
  ['10', ' 7   4   1'],
  ['9', ' 6   3   –'],
  ['7', ' 4   2   –'],
  ['5', ' 2   1   –'],
  ['4', ' 2   1   –'],
]

const lcaSteps: LcaStep[] = [
  {
    table: UP_TABLE,
    note: 'Preprocessing: for every node, store its ancestor 1, 2, 4, 8… levels up. up[k][v] = up[k−1][ up[k−1][v] ] — the 2^k-th ancestor is the 2^(k−1)-th ancestor of the 2^(k−1)-th ancestor. O(n log n) entries.',
  },
  {
    u: '10',
    v: '5',
    table: [['depth(10)', '4'], ['depth(5)', '2'], ['difference', '2 = binary 10']],
    note: 'Query: LCA of 10 and 5. First bring the deeper node up to the same depth. The difference is 2, which in binary is "10", so use one jump of 2¹.',
  },
  {
    u: '4',
    v: '5',
    jump: [['10', '4']],
    table: [['up₂(10)', '4'], ['now comparing', '4 and 5']],
    note: 'One table lookup takes 10 straight to 4. Any depth difference d needs only as many jumps as d has 1-bits — at most log₂ n.',
  },
  {
    u: '4',
    v: '5',
    answer: '2',
    table: [['up₂(4) vs up₂(5)', '1 = 1 → don\'t jump'], ['up₁(4) vs up₁(5)', '2 = 2 → don\'t jump'], ['LCA', 'parent of 4 = 2']],
    note: 'Now lift both together, trying big jumps first, and only jump when the two ancestors are still different — so we never overshoot. Neither jump qualifies, so their parent, 2, is the answer.',
  },
  {
    u: '7',
    v: '9',
    jump: [['10', '7']],
    table: [['depth(10) − depth(9)', '1'], ['up₁(10)', '7']],
    note: 'Second query: LCA of 10 and 9. The depths differ by 1, so jump 10 up one level to 7.',
  },
  {
    u: '2',
    v: '3',
    jump: [
      ['7', '2'],
      ['9', '3'],
    ],
    table: [['up₂(7) vs up₂(9)', '2 ≠ 3 → jump both'], ['now', '2 and 3']],
    note: 'Try a jump of 2: the ancestors are 2 and 3 — different, so the LCA is still above them. Jump both.',
  },
  {
    u: '2',
    v: '3',
    answer: '1',
    table: [['up₁(2) vs up₁(3)', '1 = 1 → don\'t jump'], ['LCA', 'parent of 2 = 1']],
    note: 'A jump of 1 would land both on 1 — equal, so don\'t jump. The answer is the parent: 1. Each query costs O(log n), however deep the tree.',
  },
]

export function LcaVisualizer() {
  return (
    <StepPlayer length={lcaSteps.length} interval={3000}>
      {(index) => {
        const step = lcaSteps[index]
        const isJump = (a: string, b: string) =>
          step.jump?.some(([x, y]) => (x === a && y === b) || (x === b && y === a)) ?? false
        return (
          <>
            <GraphFrame
              nodes={LCA_NODES}
              edges={LCA_EDGES}
              height={205}
              tone={(id) => (id === step.answer ? 'green' : id === step.u ? 'amber' : id === step.v ? 'sky' : 'muted')}
              edgeTone={(a, b) => (isJump(a, b) ? 'hot' : undefined)}
            />
            {step.jump ? (
              <div className="mt-1 text-center font-mono text-[10px] text-amber-600 dark:text-amber-400">
                jump: {step.jump.map(([a, b]) => `${a} → ${b}`).join(', ')}
              </div>
            ) : null}
            <div className="mx-auto mt-2 max-w-xs space-y-0.5 whitespace-pre">
              {step.table.map(([k, v]) => (
                <Line key={k} k={k} v={v} />
              ))}
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}

// ── Longest common subsequence ─────────────────────────────────────────────

const LX = 'ABCBDAB'
const LY = 'BDCABA'
const LCS_TABLE = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1],
  [0, 1, 1, 1, 1, 2, 2],
  [0, 1, 1, 2, 2, 2, 2],
  [0, 1, 1, 2, 2, 3, 3],
  [0, 1, 2, 2, 2, 3, 3],
  [0, 1, 2, 2, 3, 3, 4],
  [0, 1, 2, 2, 3, 4, 4],
]
const LCS_PATH: [number, number][] = [
  [7, 6],
  [6, 6],
  [5, 5],
  [4, 5],
  [3, 4],
  [3, 3],
  [2, 2],
  [2, 1],
  [1, 0],
]
// Cells where the path moved diagonally — the matched letters.
const LCS_MATCHES: [number, number][] = [
  [6, 6],
  [4, 5],
  [3, 3],
  [2, 1],
]

type LcsStep = { rows: number; cell?: [number, number]; path?: boolean; note: string }

const lcsSteps: LcsStep[] = [
  { rows: 1, note: 'L[i][j] = length of the LCS of the first i letters of ABCBDAB and the first j of BDCABA. Row and column 0 compare against an empty string, so they\'re all 0.' },
  { rows: 2, cell: [1, 4], note: 'Row A. At column 4 the letters match (A = A): take the diagonal + 1 → 1. Where they differ, take the larger of the cell above and the cell to the left.' },
  { rows: 3, cell: [2, 5], note: 'Row B. B matches at column 5: diagonal (1) + 1 = 2 — "AB" is common to both prefixes.' },
  { rows: 4, cell: [3, 3], note: 'Row C. C matches at column 3: diagonal (1) + 1 = 2.' },
  { rows: 5, cell: [4, 5], note: 'Row B again. B at column 5: diagonal (2) + 1 = 3.' },
  { rows: 6, cell: [5, 2], note: 'Row D. D matches at column 2: diagonal (1) + 1 = 2. Elsewhere the row copies the best neighbour.' },
  { rows: 7, cell: [6, 6], note: 'Row A. A at column 6: diagonal (3) + 1 = 4.' },
  { rows: 8, cell: [7, 6], note: 'Row B. The bottom-right cell is the answer: the LCS has length 4. The table is (m+1) × (n+1), so O(m·n) time.' },
  { rows: 8, path: true, note: 'Walk back from the corner: on a match, step diagonally and keep the letter; otherwise step towards the larger neighbour. The diagonal steps spell B, C, B, A — the LCS is "BCBA".' },
]

export function LcsVisualizer() {
  return (
    <StepPlayer length={lcsSteps.length} interval={2600}>
      {(index) => {
        const step = lcsSteps[index]
        return (
          <>
            <div className="mx-auto grid max-w-xs grid-cols-8 gap-0.5 font-mono text-[10px]">
              <div />
              {['∅', ...LY].map((c, j) => (
                <div key={j} className="py-0.5 text-center text-neutral-400 dark:text-neutral-500">
                  {c}
                </div>
              ))}
              {LCS_TABLE.map((row, i) => (
                <div key={i} className="contents">
                  <div className="py-1 pr-1 text-right text-neutral-400 dark:text-neutral-500">{i === 0 ? '∅' : LX[i - 1]}</div>
                  {row.map((value, j) => {
                    const filled = i < step.rows
                    const current = step.cell && step.cell[0] === i && step.cell[1] === j
                    const diag = step.cell && step.cell[0] - 1 === i && step.cell[1] - 1 === j && LX[step.cell[0] - 1] === LY[step.cell[1] - 1]
                    const onPath = step.path && LCS_PATH.some(([a, b]) => a === i && b === j)
                    const match = step.path && LCS_MATCHES.some(([a, b]) => a === i && b === j)
                    const cls = current
                      ? 'bg-amber-500/25 ring-1 ring-amber-500 text-neutral-900 dark:text-neutral-50'
                      : match
                        ? 'bg-green-600/25 ring-1 ring-green-600 dark:ring-green-500 text-green-800 dark:text-green-300'
                        : onPath
                          ? 'bg-green-600/10 text-green-800 dark:text-green-300'
                          : diag
                            ? 'bg-sky-500/15 text-sky-800 dark:text-sky-300'
                            : filled
                              ? 'bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300'
                              : 'text-neutral-200 dark:text-neutral-700'
                    return (
                      <div key={j} className={['rounded py-1 text-center transition-colors duration-300', cls].join(' ')}>
                        {filled ? value : '·'}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}

// ── K-way merge with a min-heap ────────────────────────────────────────────

const LISTS = [
  [1, 4, 9],
  [2, 3, 11],
  [5, 6, 7],
]
const LIST_TONE = ['text-amber-600 dark:text-amber-400', 'text-sky-600 dark:text-sky-400', 'text-violet-600 dark:text-violet-400']

type MergeStep = { ptr: number[]; heap: [number, number][]; out: number[]; popped?: [number, number]; note: string }

// Traced with the code in the post.
const mergeSteps: MergeStep[] = [
  { ptr: [0, 0, 0], heap: [[1, 0], [2, 1], [5, 2]], out: [], note: 'Three sorted lists. Put the first element of each into a min-heap, tagged with the list it came from. The heap holds at most k items — one per list.' },
  { ptr: [1, 0, 0], heap: [[2, 1], [4, 0], [5, 2]], out: [1], popped: [1, 0], note: 'Pop the smallest, 1, from list 0. Its successor, 4, goes into the heap. The smallest remaining element of all the lists is always in the heap.' },
  { ptr: [1, 1, 0], heap: [[3, 1], [4, 0], [5, 2]], out: [1, 2], popped: [2, 1], note: 'Pop 2 from list 1; push its successor, 3.' },
  { ptr: [1, 2, 0], heap: [[4, 0], [5, 2], [11, 1]], out: [1, 2, 3], popped: [3, 1], note: 'Pop 3; push 11. A list can be popped several times in a row — the heap doesn\'t take turns.' },
  { ptr: [2, 2, 0], heap: [[5, 2], [9, 0], [11, 1]], out: [1, 2, 3, 4], popped: [4, 0], note: 'Pop 4; push 9.' },
  { ptr: [2, 2, 3], heap: [[9, 0], [11, 1]], out: [1, 2, 3, 4, 5, 6, 7], popped: [7, 2], note: 'Pop 5, 6 and 7 from list 2 in turn. List 2 is now empty, so nothing replaces 7 and the heap shrinks.' },
  { ptr: [3, 3, 3], heap: [], out: [1, 2, 3, 4, 5, 6, 7, 9, 11], note: 'Pop 9, then 11. Done. Each of the N elements is pushed and popped once, at O(log k) each: O(N log k) total, with O(k) extra memory.' },
]

export function KWayMergeVisualizer() {
  return (
    <StepPlayer length={mergeSteps.length} interval={2600}>
      {(index) => {
        const step = mergeSteps[index]
        return (
          <>
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 font-mono text-xs">
              {LISTS.map((list, k) => (
                <div key={k} className="contents">
                  <span className={`text-[10px] ${LIST_TONE[k]}`}>list {k}</span>
                  <div className="flex gap-1">
                    {list.map((v, i) => (
                      <span
                        key={i}
                        className={[
                          'flex h-7 w-7 items-center justify-center rounded border',
                          i < step.ptr[k]
                            ? 'border-neutral-100 text-neutral-300 line-through dark:border-neutral-800 dark:text-neutral-600'
                            : i === step.ptr[k]
                              ? 'border-amber-500 text-neutral-900 dark:text-neutral-50'
                              : 'border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300',
                        ].join(' ')}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500">heap</span>
              <div className="flex min-h-7 gap-1">
                {step.heap.map(([v, k], i) => (
                  <span
                    key={`${v}-${k}`}
                    className={[
                      'flex h-7 min-w-7 items-center justify-center rounded px-1.5',
                      i === 0 ? 'bg-green-600/15 ring-1 ring-green-600 dark:ring-green-500' : 'bg-neutral-50 dark:bg-neutral-900',
                      LIST_TONE[k],
                    ].join(' ')}
                  >
                    {v}
                  </span>
                ))}
                {step.heap.length === 0 ? <span className="text-neutral-300 dark:text-neutral-600">empty</span> : null}
              </div>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500">output</span>
              <div className="flex min-h-7 flex-wrap items-center gap-1">
                {step.out.map((v, i) => (
                  <span key={i} className="text-neutral-800 dark:text-neutral-100">
                    {v}
                  </span>
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
