'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const PROCS = ['P1', 'P2', 'P3']
const ROW_Y = [30, 80, 130]

type Event = {
  proc: number
  x: number
  label: string
  lamport: number
  vector: [number, number, number]
  from?: number // index of the send event this receive matches
}

// Every clock value below follows the update rules in the post.
const EVENTS: Event[] = [
  { proc: 0, x: 60, label: 'a', lamport: 1, vector: [1, 0, 0] },
  { proc: 0, x: 110, label: 'send', lamport: 2, vector: [2, 0, 0] },
  { proc: 1, x: 160, label: 'recv', lamport: 3, vector: [2, 1, 0], from: 1 },
  { proc: 2, x: 90, label: 'b', lamport: 1, vector: [0, 0, 1] },
  { proc: 1, x: 210, label: 'send', lamport: 4, vector: [2, 2, 0] },
  { proc: 2, x: 260, label: 'recv', lamport: 5, vector: [2, 2, 2], from: 4 },
  { proc: 0, x: 240, label: 'c', lamport: 3, vector: [3, 0, 0] },
]

type Step = { shown: number; compare?: [number, number]; note: string }

const steps: Step[] = [
  {
    shown: 0,
    note: 'Three processes, no shared clock. Each keeps a Lamport counter and a vector clock — one counter per process. Wall-clock time is deliberately absent: it cannot be trusted across machines.',
  },
  {
    shown: 1,
    note: 'P1 has a local event a. Rule 1: before any event, a process increments its own entry. Lamport 1, vector [1,0,0].',
  },
  {
    shown: 2,
    note: 'P1 sends a message to P2. Sending is an event too, so increment first — [2,0,0] — and attach the clock to the message.',
  },
  {
    shown: 3,
    note: 'P2 receives it. Rule 2: take the element-wise max of its own clock and the message\'s, then increment its own entry. max([0,0,0],[2,0,0]) → [2,0,0] → [2,1,0]. P2 now "knows about" P1\'s first two events.',
  },
  {
    shown: 4,
    note: 'Meanwhile P3 has an unrelated local event b: [0,0,1]. No message links it to anything on P1 or P2.',
  },
  {
    shown: 5,
    note: 'P2 sends to P3, stamping [2,2,0].',
  },
  {
    shown: 6,
    note: 'P3 receives: max([0,0,1],[2,2,0]) = [2,2,1], then increment → [2,2,2]. Through P2, P3\'s clock now reflects P1\'s send, even though P1 never messaged P3 directly.',
  },
  {
    shown: 7,
    note: 'Finally P1 has another local event c: [3,0,0], Lamport 3.',
  },
  {
    shown: 7,
    compare: [1, 5],
    note: 'Compare P1\'s send [2,0,0] with P3\'s recv [2,2,2]: every entry ≤, at least one <. So send happened-before recv — there is a chain of messages connecting them.',
  },
  {
    shown: 7,
    compare: [6, 5],
    note: 'Compare c [3,0,0] with P3\'s recv [2,2,2]: 3 > 2 in one entry, 0 < 2 in another. Neither dominates, so they are concurrent. Lamport clocks say 3 < 5 and would wrongly suggest an order; only the vector can tell "before" from "unrelated".',
  },
]

function arrowPath(from: Event, to: Event) {
  const y1 = ROW_Y[from.proc]
  const y2 = ROW_Y[to.proc] - 7
  return { x1: from.x, y1: y1 + 7, x2: to.x, y2 }
}

export function VectorClockVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2800}>
      {(index) => {
        const step = steps[index]
        const shown = EVENTS.slice(0, step.shown)
        const latest = step.shown > 0 ? step.shown - 1 : -1
        return (
          <>
            <svg
              viewBox="0 0 320 160"
              className="w-full"
              role="img"
              aria-label="Three process timelines with vector clock timestamps"
            >
              <defs>
                <marker
                  id="vc-arrow"
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
              {PROCS.map((p, i) => (
                <g key={p}>
                  <text
                    x={8}
                    y={ROW_Y[i] + 3}
                    className="fill-neutral-500 dark:fill-neutral-400 font-mono text-[9px]"
                  >
                    {p}
                  </text>
                  <line
                    x1={30}
                    y1={ROW_Y[i]}
                    x2={310}
                    y2={ROW_Y[i]}
                    className="stroke-neutral-200 dark:stroke-neutral-700"
                    strokeWidth={1}
                  />
                </g>
              ))}
              {shown.map((e, i) =>
                e.from !== undefined ? (
                  <line
                    key={`m${i}`}
                    {...arrowPath(EVENTS[e.from], e)}
                    markerEnd="url(#vc-arrow)"
                    className="stroke-neutral-400 dark:stroke-neutral-500"
                    strokeWidth={1.2}
                    strokeDasharray="3 2"
                  />
                ) : null
              )}
              {shown.map((e, i) => {
                const compared = step.compare?.includes(i)
                const isLatest = !step.compare && i === latest
                // Messages arrive from above, so a receive keeps its clock below the line.
                // and a send keeps both labels above, clear of its outgoing arrow.
                const clockBelow = e.from !== undefined
                const isSend = EVENTS.some((other) => other.from === i)
                return (
                  <g key={i}>
                    <circle
                      cx={e.x}
                      cy={ROW_Y[e.proc]}
                      r={5}
                      className={
                        compared
                          ? 'fill-amber-500'
                          : isLatest
                            ? 'fill-green-600 dark:fill-green-500'
                            : 'fill-neutral-400 dark:fill-neutral-500'
                      }
                    />
                    <text
                      x={e.x}
                      y={ROW_Y[e.proc] + (clockBelow ? 16 : -9)}
                      textAnchor="middle"
                      className={[
                        'font-mono text-[8px]',
                        compared
                          ? 'fill-amber-600 dark:fill-amber-400'
                          : 'fill-neutral-600 dark:fill-neutral-300',
                      ].join(' ')}
                    >
                      [{e.vector.join(',')}]
                    </text>
                    <text
                      x={e.x}
                      y={ROW_Y[e.proc] + (clockBelow ? 25 : isSend ? -18 : 16)}
                      textAnchor="middle"
                      className="fill-neutral-400 dark:fill-neutral-500 font-mono text-[7px]"
                    >
                      {e.label} · L{e.lamport}
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
