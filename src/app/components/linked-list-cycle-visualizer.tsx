'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

// Nodes 0..5 in a row; node 5 links back to node 2, forming a cycle.
const XS = [30, 90, 150, 210, 270, 330]
const Y = 60

type Step = {
  slow: number
  fast: number
  met?: boolean
  note: string
}

const steps: Step[] = [
  { slow: 0, fast: 0, note: 'Two pointers start at the head. The tortoise moves 1 step at a time, the hare moves 2. The list has a hidden cycle (5 → 2).' },
  { slow: 1, fast: 2, note: 'Tortoise → 1, hare → 2. The gap between them grows by one each round.' },
  { slow: 2, fast: 4, note: 'Tortoise → 2, hare → 4. The hare is about to enter the cycle from the far end.' },
  { slow: 3, fast: 2, note: 'Tortoise → 3. Hare goes 4 → 5 → 2, wrapping around the cycle. Now both are inside the loop.' },
  { slow: 4, fast: 4, met: true, note: 'Tortoise → 4. Hare goes 2 → 3 → 4. They collide! A meeting is proof the list has a cycle — O(n) time, O(1) space.' },
]

export function LinkedListCycleVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={1600}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <svg
              viewBox="0 0 360 150"
              className="mx-auto block w-full max-w-md"
              role="img"
              aria-label="Linked list with a cycle, traversed by slow and fast pointers"
            >
              {/* forward arrows */}
              {XS.slice(0, -1).map((x, i) => (
                <line
                  key={i}
                  x1={x + 16}
                  y1={Y}
                  x2={XS[i + 1] - 16}
                  y2={Y}
                  className="stroke-neutral-300 dark:stroke-neutral-600"
                  strokeWidth={1.5}
                />
              ))}
              {/* back edge 5 -> 2 */}
              <path
                d={`M ${XS[5]} ${Y + 16} C ${XS[5]} ${Y + 70}, ${XS[2]} ${Y + 70}, ${XS[2]} ${Y + 16}`}
                fill="none"
                className="stroke-neutral-300 dark:stroke-neutral-600"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              {XS.map((x, i) => {
                const isSlow = step.slow === i
                const isFast = step.fast === i
                const both = isSlow && isFast
                return (
                  <g key={i}>
                    <circle
                      cx={x}
                      cy={Y}
                      r={16}
                      className={
                        both && step.met
                          ? 'fill-green-600 dark:fill-green-500'
                          : isSlow
                            ? 'fill-sky-500'
                            : isFast
                              ? 'fill-amber-500'
                              : 'fill-neutral-100 dark:fill-neutral-800'
                      }
                    />
                    <text
                      x={x}
                      y={Y + 4}
                      textAnchor="middle"
                      className={[
                        'font-mono text-[11px]',
                        isSlow || isFast
                          ? 'fill-white'
                          : 'fill-neutral-600 dark:fill-neutral-300',
                      ].join(' ')}
                    >
                      {i}
                    </text>
                    {isSlow && (
                      <text x={x} y={Y - 24} textAnchor="middle" className="fill-sky-500 font-mono text-[10px]">
                        slow
                      </text>
                    )}
                    {isFast && (
                      <text x={x} y={both ? Y - 38 : Y - 24} textAnchor="middle" className="fill-amber-500 font-mono text-[10px]">
                        fast
                      </text>
                    )}
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
