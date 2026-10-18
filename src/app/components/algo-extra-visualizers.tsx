'use client'

import { GraphFrame, type GNode, type Tone } from '@/app/components/graph-algo-visualizers'
import { StepNote, StepPlayer } from '@/app/components/step-player'

// ── Flood fill / number of islands ─────────────────────────────────────────

const GRID = ['11000', '11010', '00010', '01001', '00111'].map((r) => [...r].map(Number))

// Island id per cell, in the order a row-by-row scan discovers them (BFS from
// each new land cell). Computed with the code in the post.
const ISLAND = [
  [1, 1, 0, 0, 0],
  [1, 1, 0, 2, 0],
  [0, 0, 0, 2, 0],
  [0, 3, 0, 0, 4],
  [0, 0, 4, 4, 4],
]
const ISLAND_TONE = [
  '',
  'bg-amber-500/30 border-amber-500',
  'bg-sky-500/30 border-sky-500',
  'bg-violet-500/30 border-violet-500',
  'bg-green-600/30 border-green-600 dark:border-green-500',
]

const floodSteps = [
  { found: 0, note: 'A grid of land (1) and water (0). An island is a group of land cells connected up, down, left or right. How many islands are there?' },
  { found: 1, note: 'Scan row by row. The first unvisited land cell is (0,0): count island 1, then flood-fill from it — BFS to every connected land cell, marking each as visited. Four cells.' },
  { found: 2, note: 'Keep scanning. Cells already marked are skipped. (1,3) is new land: island 2, which floods down to (2,3).' },
  { found: 3, note: '(3,1) is land with no land neighbours: island 3, a single cell. Diagonals don\'t count as connected.' },
  { found: 4, note: '(3,4) starts island 4, which spreads along the bottom row. Answer: 4 islands. Every cell is visited a constant number of times — O(rows × cols).' },
]

export function FloodFillVisualizer() {
  return (
    <StepPlayer length={floodSteps.length} interval={2400}>
      {(index) => {
        const step = floodSteps[index]
        return (
          <>
            <div className="mx-auto grid w-fit grid-cols-5 gap-1 font-mono text-xs">
              {GRID.map((row, r) =>
                row.map((cell, c) => {
                  const id = ISLAND[r][c]
                  const shown = id > 0 && id <= step.found
                  return (
                    <div
                      key={`${r}-${c}`}
                      className={[
                        'flex h-9 w-9 items-center justify-center rounded border transition-colors duration-300',
                        shown
                          ? ISLAND_TONE[id]
                          : cell
                            ? 'border-neutral-300 bg-neutral-100 text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200'
                            : 'border-transparent bg-sky-500/5 text-neutral-300 dark:text-neutral-600',
                      ].join(' ')}
                    >
                      {shown ? id : cell}
                    </div>
                  )
                })
              )}
            </div>
            <div className="mt-2 text-center font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
              islands found: <span className="text-green-700 dark:text-green-400">{step.found}</span>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}

// ── Longest palindromic substring: expand around centres ───────────────────

const WORD = 'bananas'

type PalStep = { center: string; lo: number; hi: number; ok: boolean; best: string; note: string }

const palSteps: PalStep[] = [
  { center: '—', lo: -1, hi: -1, ok: true, best: '—', note: 'A palindrome mirrors around its centre. So instead of checking every substring (O(n³)), try every centre and expand outwards while both ends match. There are 2n − 1 centres: each letter, and each gap between letters.' },
  { center: 'n (index 2)', lo: 1, hi: 3, ok: true, best: 'ana', note: 'Centre on the first n. Expand: a = a, so "ana" is a palindrome. Next, b ≠ n — stop. Best so far: "ana".' },
  { center: 'gap n|a', lo: 2, hi: 3, ok: false, best: 'ana', note: 'Even-length palindromes centre on a gap. Between n and a: n ≠ a, so nothing here.' },
  { center: 'a (index 3)', lo: 2, hi: 4, ok: true, best: 'ana', note: 'Centre on the middle a. n = n: "nan".' },
  { center: 'a (index 3)', lo: 1, hi: 5, ok: true, best: 'anana', note: 'Keep going: a = a, so "anana". Next would compare b with s — different, stop. New best: "anana", length 5.' },
  { center: 'all centres', lo: 1, hi: 5, ok: true, best: 'anana', note: 'The other centres give nothing longer. Each expansion is at most n steps, over 2n − 1 centres: O(n²) time, O(1) memory. (Manacher\'s algorithm gets O(n), but this is what interviews expect.)' },
]

export function PalindromeVisualizer() {
  return (
    <StepPlayer length={palSteps.length} interval={2600}>
      {(index) => {
        const step = palSteps[index]
        return (
          <>
            <div className="flex justify-center gap-1 font-mono text-sm">
              {[...WORD].map((ch, i) => {
                const inside = i >= step.lo && i <= step.hi
                const edge = i === step.lo || i === step.hi
                return (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <div
                      className={[
                        'flex h-9 w-9 items-center justify-center rounded border transition-colors duration-300',
                        inside
                          ? step.ok
                            ? edge
                              ? 'border-amber-500 bg-amber-500/25 text-neutral-900 dark:text-neutral-50'
                              : 'border-green-600 bg-green-600/15 text-green-800 dark:border-green-500 dark:text-green-300'
                            : 'border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300'
                          : 'border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400',
                      ].join(' ')}
                    >
                      {ch}
                    </div>
                    <span className="text-[9px] text-neutral-400 dark:text-neutral-500">{i}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex justify-center gap-6 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
              <span>centre: {step.center}</span>
              <span>
                best: <span className="text-green-700 dark:text-green-400">{step.best}</span>
              </span>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}

// ── Huffman coding ─────────────────────────────────────────────────────────

const HUFF_NODES: GNode[] = [
  { id: '11', x: 140, y: 20 },
  { id: 'a5', x: 70, y: 65 },
  { id: '6', x: 210, y: 65 },
  { id: 'r2', x: 160, y: 110 },
  { id: '4', x: 255, y: 110 },
  { id: 'b2', x: 210, y: 155 },
  { id: '2', x: 290, y: 155 },
  { id: 'c1', x: 255, y: 198 },
  { id: 'd1', x: 300, y: 198 },
]
const HUFF_EDGES: [string, string][] = [
  ['11', 'a5'],
  ['11', '6'],
  ['6', 'r2'],
  ['6', '4'],
  ['4', 'b2'],
  ['4', '2'],
  ['2', 'c1'],
  ['2', 'd1'],
]
const LEFT = new Set(['11-a5', '6-r2', '4-b2', '2-c1'])

type HuffStep = { made: string[]; hot?: string; queue: string; note: string; codes?: boolean }

// Merges traced with the code in the post on "abracadabra".
const huffSteps: HuffStep[] = [
  { made: [], queue: 'c1 d1 b2 r2 a5', note: '"abracadabra" has 11 letters: a×5, b×2, r×2, c×1, d×1. With a fixed 3-bit code that\'s 33 bits. Huffman gives frequent letters shorter codes. Start with one leaf per letter in a min-heap by count.' },
  { made: ['2'], hot: '2', queue: 'b2 2 r2 a5', note: 'Pop the two smallest — c (1) and d (1) — and join them under a new node with count 2. Push it back.' },
  { made: ['2', '4'], hot: '4', queue: 'r2 4 a5', note: 'Again: b (2) and the (c,d) node (2) become a node of 4.' },
  { made: ['2', '4', '6'], hot: '6', queue: 'a5 6', note: 'r (2) and the 4-node make 6.' },
  { made: ['2', '4', '6', '11'], hot: '11', queue: '11', note: 'Finally a (5) and the 6-node make the root, 11. The rarest letters ended up deepest — they were merged first.' },
  { made: ['2', '4', '6', '11'], queue: '—', codes: true, note: 'Read codes from root to leaf: left = 0, right = 1. a = 0, r = 10, b = 110, c = 1110, d = 1111. Total: 5×1 + 2×2 + 2×3 + 1×4 + 1×4 = 23 bits instead of 33. No code is a prefix of another, so the bits decode unambiguously.' },
]

const HUFF_CODES = [
  ['a', '0'],
  ['r', '10'],
  ['b', '110'],
  ['c', '1110'],
  ['d', '1111'],
]

export function HuffmanVisualizer() {
  return (
    <StepPlayer length={huffSteps.length} interval={2800}>
      {(index) => {
        const step = huffSteps[index]
        const internal = new Set(['2', '4', '6', '11'])
        const visible = (id: string) => !internal.has(id) || step.made.includes(id)
        const nodes = HUFF_NODES.filter((n) => visible(n.id))
        const edges = HUFF_EDGES.filter(([a]) => step.made.includes(a))
        return (
          <>
            <GraphFrame
              nodes={nodes}
              edges={edges}
              height={215}
              tone={(id): Tone => (id === step.hot ? 'amber' : internal.has(id) ? 'muted' : 'green')}
              edgeTone={(a) => (a === step.hot ? 'hot' : undefined)}
              edgeLabel={(a, b) => (step.codes ? (LEFT.has(`${a}-${b}`) ? '0' : '1') : undefined)}
            />
            <div className="mt-1 text-center font-mono text-[10.5px] text-neutral-500 dark:text-neutral-400">
              {step.codes ? HUFF_CODES.map(([ch, code]) => `${ch}=${code}`).join('  ') : `heap: ${step.queue}`}
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}

// ── Max flow (Edmonds–Karp) ────────────────────────────────────────────────

const FLOW_NODES: GNode[] = [
  { id: 'S', x: 25, y: 100 },
  { id: 'A', x: 115, y: 35 },
  { id: 'B', x: 115, y: 165 },
  { id: 'C', x: 210, y: 35 },
  { id: 'D', x: 210, y: 165 },
  { id: 'T', x: 295, y: 100 },
]
const FLOW_EDGES: [string, string][] = [
  ['S', 'A'],
  ['S', 'B'],
  ['A', 'B'],
  ['A', 'C'],
  ['B', 'D'],
  ['C', 'T'],
  ['C', 'D'],
  ['D', 'T'],
]
const CAP: Record<string, number> = { 'S-A': 10, 'S-B': 5, 'A-B': 15, 'A-C': 9, 'B-D': 10, 'C-T': 10, 'C-D': 4, 'D-T': 10 }

type FlowStep = { flow: Record<string, number>; path: string[]; total: number; cut?: boolean; note: string }

// Augmenting paths found by BFS, as in the code in the post.
const flowSteps: FlowStep[] = [
  { flow: {}, path: [], total: 0, note: 'Each pipe has a capacity. How much can flow from S to T per second? Edmonds–Karp: repeatedly find the shortest path (by BFS) that still has spare capacity, and push as much as it allows.' },
  { flow: { 'S-A': 9, 'A-C': 9, 'C-T': 9 }, path: ['S', 'A', 'C', 'T'], total: 9, note: 'BFS finds S → A → C → T. Its tightest edge is A→C with 9, so push 9. Total flow: 9.' },
  { flow: { 'S-A': 9, 'A-C': 9, 'C-T': 9, 'S-B': 5, 'B-D': 5, 'D-T': 5 }, path: ['S', 'B', 'D', 'T'], total: 14, note: 'Next shortest path with room: S → B → D → T, limited by S→B (5). Total: 14.' },
  { flow: { 'S-A': 10, 'A-C': 9, 'C-T': 9, 'S-B': 5, 'A-B': 1, 'B-D': 6, 'D-T': 6 }, path: ['S', 'A', 'B', 'D', 'T'], total: 15, note: 'S→A has 1 unit left. S → A → B → D → T carries it. Total: 15. (Residual edges — capacity to undo flow — let later paths reroute earlier choices; this graph doesn\'t happen to need them.)' },
  { flow: { 'S-A': 10, 'A-C': 9, 'C-T': 9, 'S-B': 5, 'A-B': 1, 'B-D': 6, 'D-T': 6 }, path: [], total: 15, cut: true, note: 'No path from S has spare capacity: both edges out of S are full. Those two edges are a minimum cut, 10 + 5 = 15 — equal to the max flow, as the max-flow min-cut theorem guarantees.' },
]

export function MaxFlowVisualizer() {
  return (
    <StepPlayer length={flowSteps.length} interval={3000}>
      {(index) => {
        const step = flowSteps[index]
        const onPath = (a: string, b: string) => {
          const i = step.path.indexOf(a)
          return i >= 0 && step.path[i + 1] === b
        }
        return (
          <>
            <GraphFrame
              nodes={FLOW_NODES}
              edges={FLOW_EDGES}
              directed
              height={200}
              tone={(id): Tone => (id === 'S' ? 'sky' : id === 'T' ? 'green' : step.path.includes(id) ? 'amber' : 'muted')}
              edgeTone={(a, b) => (step.cut && a === 'S' ? 'bad' : onPath(a, b) ? 'hot' : undefined)}
              edgeLabel={(a, b) => `${step.flow[`${a}-${b}`] ?? 0}/${CAP[`${a}-${b}`]}`}
            />
            <div className="mt-1 text-center font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
              edges show flow/capacity · total flow <span className="text-green-700 dark:text-green-400">{step.total}</span>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
