'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Span = {
  name: string
  service: string
  start: number // ms
  duration: number // ms
  depth: number
  slow?: boolean
  error?: boolean
}

const TOTAL = 820

const ALL_SPANS: Span[] = [
  { name: 'GET /checkout', service: 'gateway', start: 0, duration: 815, depth: 0 },
  { name: 'auth.verify', service: 'auth', start: 12, duration: 38, depth: 1 },
  { name: 'cart.load', service: 'cart', start: 55, duration: 120, depth: 1 },
  { name: 'SELECT cart_items', service: 'postgres', start: 70, duration: 95, depth: 2 },
  { name: 'pricing.quote', service: 'pricing', start: 180, duration: 530, depth: 1, slow: true },
  { name: 'SELECT product ×47', service: 'postgres', start: 195, duration: 470, depth: 2, slow: true },
  { name: 'tax.calculate', service: 'tax', start: 715, duration: 60, depth: 1 },
  { name: 'inventory.check', service: 'inventory', start: 720, duration: 55, depth: 1, error: true },
]

type Step = {
  visible: number
  focus?: number[]
  note: string
}

const steps: Step[] = [
  {
    visible: 1,
    note: 'A trace is one request. The root span covers the whole thing: 815ms at the gateway, which is all a latency metric would ever tell you.',
  },
  {
    visible: 3,
    note: 'Child spans are created by each service and stitched together by a shared trace id, with each span naming its parent. Auth and cart are quick.',
  },
  {
    visible: 4,
    note: 'Spans nest arbitrarily deep — the cart’s own database query is a span inside the cart span. Depth is the parent relationship, not timing.',
  },
  {
    visible: 6,
    focus: [4, 5],
    note: 'Here is the cost. Pricing takes 530ms, and almost all of it is one database span repeated 47 times — the N+1 query pattern, visible instantly in a waterfall and invisible in an average.',
  },
  {
    visible: 8,
    focus: [6, 7],
    note: 'Tax and inventory overlap in time, which tells you they run concurrently. Sequential bars mean sequential calls — a waterfall shows you parallelism you did not ask about.',
  },
  {
    visible: 8,
    focus: [7],
    note: 'Inventory returned an error, yet the request succeeded: the caller swallowed it. Traces surface this class of bug, where the symptom never reaches the user but the behaviour is wrong.',
  },
  {
    visible: 8,
    focus: [0, 4, 5],
    note: 'The critical path is root → pricing → the repeated query. Fix that one span and the request drops to roughly 350ms; optimising anything else changes almost nothing.',
  },
]

export function TraceWaterfallVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2300}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="space-y-1">
              {ALL_SPANS.slice(0, step.visible).map((span, i) => {
                const focused = step.focus?.includes(i)
                const dimmed = step.focus !== undefined && !focused
                return (
                  <div key={span.name} className="flex items-center gap-2">
                    <span
                      className="w-20 shrink-0 truncate font-mono text-[9px] text-neutral-500 dark:text-neutral-400 sm:w-32"
                      style={{ paddingLeft: span.depth * 8 }}
                    >
                      {span.name}
                    </span>
                    <div className="relative h-4 flex-1 rounded bg-neutral-50 dark:bg-neutral-900">
                      <div
                        className={[
                          'absolute inset-y-0 rounded transition-all duration-500',
                          span.error
                            ? 'bg-red-500/80'
                            : span.slow
                              ? 'bg-amber-500/90'
                              : 'bg-green-600/70 dark:bg-green-500/70',
                          dimmed ? 'opacity-25' : '',
                          focused ? 'ring-1 ring-neutral-900 dark:ring-neutral-100' : '',
                        ].join(' ')}
                        style={{
                          left: `${(span.start / TOTAL) * 100}%`,
                          width: `${(span.duration / TOTAL) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="hidden w-12 shrink-0 text-right font-mono text-[9px] tabular-nums text-neutral-400 dark:text-neutral-500 sm:block">
                      {span.duration}ms
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="mt-2 flex justify-between font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
              <span>0ms</span>
              <span>service · span name · duration</span>
              <span>{TOTAL}ms</span>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
