'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const NODES = [
  { id: 'roots', x: 36, y: 80, label: 'roots' },
  { id: 'A', x: 120, y: 40, label: 'user' },
  { id: 'B', x: 200, y: 40, label: 'profile' },
  { id: 'C', x: 280, y: 40, label: 'avatar' },
  { id: 'D', x: 120, y: 125, label: 'session' },
  { id: 'E', x: 220, y: 125, label: 'socket' },
]
const POS = new Map(NODES.map((n) => [n.id, n]))
const R = 21 // object circle radius

type Edge = [string, string]
type State = 'idle' | 'marked' | 'garbage' | 'freed'

type Step = {
  edges: Edge[]
  cut?: Edge
  states: Record<string, State>
  note: string
}

const ALL: Edge[] = [
  ['roots', 'A'],
  ['A', 'B'],
  ['B', 'C'],
  ['roots', 'D'],
  ['D', 'E'],
  ['E', 'D'],
]
const AFTER_CUT = ALL.filter(([a, b]) => !(a === 'roots' && b === 'D'))
const idle = { A: 'idle', B: 'idle', C: 'idle', D: 'idle', E: 'idle' } as Record<string, State>

const steps: Step[] = [
  {
    edges: ALL,
    states: idle,
    note: 'The heap is a graph: objects pointing at objects. The roots are where every reference chain starts — global variables and the local variables of functions currently on the stack.',
  },
  {
    edges: AFTER_CUT,
    cut: ['roots', 'D'],
    states: idle,
    note: 'The program runs session = null. The session and socket objects still point at each other, but nothing on the roots side points at either of them any more.',
  },
  {
    edges: AFTER_CUT,
    states: { ...idle, A: 'marked' },
    note: 'Garbage collection, mark phase: start from the roots and follow every reference, marking each object reached. user is reachable…',
  },
  {
    edges: AFTER_CUT,
    states: { ...idle, A: 'marked', B: 'marked', C: 'marked' },
    note: '…and so are profile and avatar, through it. The traversal ends: there is nothing else to follow.',
  },
  {
    edges: AFTER_CUT,
    states: { A: 'marked', B: 'marked', C: 'marked', D: 'garbage', E: 'garbage' },
    note: 'Anything left unmarked is unreachable, so the program can never use it again. That includes session and socket, even though they reference each other — a cycle does not keep objects alive.',
  },
  {
    edges: [
      ['roots', 'A'],
      ['A', 'B'],
      ['B', 'C'],
    ],
    states: { A: 'idle', B: 'idle', C: 'idle', D: 'freed', E: 'freed' },
    note: 'Sweep phase: the unmarked objects\' memory is reclaimed. Real engines split the heap into a young and an old generation and collect the young one often, because most objects die soon after they are created.',
  },
]

function nodeClass(state: State | undefined, isRoot: boolean) {
  if (isRoot) return 'fill-neutral-700 dark:fill-neutral-200'
  switch (state) {
    case 'marked':
      return 'fill-green-600 dark:fill-green-500'
    case 'garbage':
      return 'fill-red-500'
    case 'freed':
      return 'fill-neutral-100 dark:fill-neutral-900'
    default:
      return 'fill-neutral-300 dark:fill-neutral-600'
  }
}

export function GCMarkSweepVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2600}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <svg viewBox="0 0 320 160" className="w-full" role="img" aria-label="Heap object graph during mark and sweep garbage collection">
              <defs>
                <marker id="gc-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" className="fill-neutral-400 dark:fill-neutral-500" />
                </marker>
              </defs>
              {[...step.edges, ...(step.cut ? [step.cut] : [])].map(([a, b], i) => {
                const pa = POS.get(a)!
                const pb = POS.get(b)!
                const dx = pb.x - pa.x
                const dy = pb.y - pa.y
                const len = Math.hypot(dx, dy)
                const ra = a === 'roots' ? 22 : R
                // Offset the two directions of a cycle so they don't overlap.
                const twin = step.edges.some(([x, y]) => x === b && y === a)
                const ox = twin ? (-dy / len) * 4 : 0
                const oy = twin ? (dx / len) * 4 : 0
                const isCut = step.cut && step.cut[0] === a && step.cut[1] === b
                return (
                  <line
                    key={`${a}-${b}-${i}`}
                    x1={pa.x + (dx / len) * ra + ox}
                    y1={pa.y + (dy / len) * ra + oy}
                    x2={pb.x - (dx / len) * R + ox}
                    y2={pb.y - (dy / len) * R + oy}
                    markerEnd={isCut ? undefined : 'url(#gc-arrow)'}
                    className={isCut ? 'stroke-red-500' : 'stroke-neutral-400 dark:stroke-neutral-500'}
                    strokeWidth={1.3}
                    strokeDasharray={isCut ? '3 3' : undefined}
                  />
                )
              })}
              {NODES.map((n) => {
                const isRoot = n.id === 'roots'
                const state = step.states[n.id]
                return (
                  <g key={n.id} className="transition-opacity duration-500" opacity={state === 'freed' ? 0.35 : 1}>
                    {isRoot ? (
                      <rect x={n.x - 22} y={n.y - 14} width={44} height={28} rx={6} className={nodeClass(state, true)} />
                    ) : (
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={R}
                        className={nodeClass(state, false)}
                        strokeDasharray={state === 'freed' ? '3 2' : undefined}
                        stroke={state === 'freed' ? 'currentColor' : undefined}
                      />
                    )}
                    <text
                      x={n.x}
                      y={n.y + 3}
                      textAnchor="middle"
                      className={[
                        'font-mono text-[8px]',
                        isRoot
                          ? 'fill-white dark:fill-neutral-900'
                          : state === 'marked' || state === 'garbage'
                            ? 'fill-white'
                            : 'fill-neutral-700 dark:fill-neutral-200',
                      ].join(' ')}
                    >
                      {n.label}
                    </text>
                  </g>
                )
              })}
            </svg>
            <div className="mt-1 flex flex-wrap gap-3 font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
              <span className="text-green-700 dark:text-green-400">● reachable (marked)</span>
              <span className="text-red-500">● unreachable</span>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
