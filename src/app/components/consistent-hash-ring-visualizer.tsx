'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const CX = 150
const CY = 150
const R = 108

function xy(angleDeg: number, radius = R) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CX + radius * Math.sin(rad), y: CY - radius * Math.cos(rad) }
}

const SERVER_ANGLE: Record<string, number> = { A: 20, B: 140, C: 250, D: 320 }
const KEY_ANGLE: Record<string, number> = { k1: 60, k2: 100, k3: 200, k4: 300, k5: 10 }

const NODE_FILL: Record<string, string> = {
  A: 'fill-green-600 dark:fill-green-500',
  B: 'fill-sky-500',
  C: 'fill-amber-500',
  D: 'fill-violet-500',
}

type Step = {
  servers: string[]
  assign: Record<string, string | null>
  moved: string[]
  note: string
}

const base = { k1: 'B', k2: 'B', k3: 'C', k4: 'A', k5: 'A' }

const steps: Step[] = [
  {
    servers: ['A', 'B', 'C'],
    assign: { k1: null, k2: null, k3: null, k4: null, k5: null },
    moved: [],
    note: 'Servers and keys are both hashed onto one ring. Three servers A, B, C are placed. Five keys sit at their own hashed positions.',
  },
  {
    servers: ['A', 'B', 'C'],
    assign: base,
    moved: [],
    note: 'Each key belongs to the first server found walking clockwise. k1, k2 → B; k3 → C; k4, k5 → A (wrapping past the top).',
  },
  {
    servers: ['A', 'B', 'C', 'D'],
    assign: { ...base, k4: 'D' },
    moved: ['k4'],
    note: 'Add server D. Only keys in the arc just before D are affected — that is only k4, which moves from A to D. Everything else stays put.',
  },
  {
    servers: ['A', 'B', 'C', 'D'],
    assign: { ...base, k4: 'D' },
    moved: ['k4'],
    note: 'Just 1 of 5 keys remapped. A naive hash % N would have reshuffled almost all of them. That stability is why consistent hashing runs behind caches, shards, and CDNs.',
  },
]

export function ConsistentHashRingVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={1800}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <svg
              viewBox="0 0 300 300"
              className="mx-auto block w-full max-w-xs"
              role="img"
              aria-label="Consistent hashing ring with servers and keys"
            >
              <circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                className="stroke-neutral-200 dark:stroke-neutral-700"
                strokeWidth={1.5}
              />
              {/* keys */}
              {Object.keys(KEY_ANGLE).map((k) => {
                const p = xy(KEY_ANGLE[k], R)
                const server = step.assign[k]
                const isMoved = step.moved.includes(k)
                return (
                  <g key={k}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isMoved ? 8 : 6}
                      className={
                        server
                          ? NODE_FILL[server]
                          : 'fill-neutral-300 dark:fill-neutral-600'
                      }
                      stroke={isMoved ? '#f59e0b' : 'none'}
                      strokeWidth={isMoved ? 2 : 0}
                    />
                    <text
                      x={xy(KEY_ANGLE[k], R + 18).x}
                      y={xy(KEY_ANGLE[k], R + 18).y + 3}
                      textAnchor="middle"
                      className="fill-neutral-400 font-mono text-[9px] dark:fill-neutral-500"
                    >
                      {k}
                    </text>
                  </g>
                )
              })}
              {/* servers */}
              {step.servers.map((s) => {
                const p = xy(SERVER_ANGLE[s], R)
                return (
                  <g key={s}>
                    <rect
                      x={p.x - 12}
                      y={p.y - 12}
                      width={24}
                      height={24}
                      rx={5}
                      className={NODE_FILL[s]}
                    />
                    <text
                      x={p.x}
                      y={p.y + 4}
                      textAnchor="middle"
                      className="fill-white font-mono text-[12px]"
                    >
                      {s}
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
