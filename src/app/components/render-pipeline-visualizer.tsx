'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const STAGES = ['JS', 'Style', 'Layout', 'Paint', 'Composite'] as const

type Step = {
  change: string
  stages: number[] // indices of stages that run
  cost: string
  onMainThread: boolean
  note: string
}

const steps: Step[] = [
  {
    change: '(idle frame)',
    stages: [],
    cost: '—',
    onMainThread: true,
    note: 'Every visual change runs through the same pipeline. Which stages it reaches decides whether a frame costs microseconds or milliseconds.',
  },
  {
    change: 'el.style.width = "320px"',
    stages: [0, 1, 2, 3, 4],
    cost: 'full pipeline',
    onMainThread: true,
    note: 'Changing a geometric property triggers layout — the browser recomputes the position and size of this element and anything affected by it, then repaints and composites. This is a reflow.',
  },
  {
    change: 'el.style.backgroundColor = "red"',
    stages: [0, 1, 3, 4],
    cost: 'skips layout',
    onMainThread: true,
    note: 'Colour does not change geometry, so layout is skipped. Paint still runs: the browser fills pixels for this element and any layer it shares.',
  },
  {
    change: 'el.style.transform = "translateX(40px)"',
    stages: [0, 1, 4],
    cost: 'composite only',
    onMainThread: false,
    note: 'transform and opacity can be handled by the compositor on its own thread: the layer already exists as a texture, so moving it is a matrix multiply on the GPU. This is why animations should use transform, not left/top.',
  },
  {
    change: 'read offsetHeight after a write',
    stages: [0, 1, 2, 3, 4],
    cost: 'forced synchronous layout',
    onMainThread: true,
    note: 'Reading a geometric property after writing one forces the browser to flush layout *right now* instead of batching it. One read is cheap; a read inside a loop over 200 elements is layout thrashing.',
  },
  {
    change: 'read all → then write all',
    stages: [0, 1, 2, 3, 4],
    cost: 'one layout for the batch',
    onMainThread: true,
    note: 'Separating the reads from the writes lets the browser batch: measure everything, then mutate everything, and layout runs once instead of 200 times. Same work, one flush.',
  },
  {
    change: 'will-change: transform',
    stages: [0, 1, 4],
    cost: 'promoted to its own layer',
    onMainThread: false,
    note: 'Promoting an element to its own compositor layer keeps its animation off the main thread — at the cost of GPU memory per layer. Promote the few things that actually animate, not everything.',
  },
]

export function RenderPipelineVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2200}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="mb-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2 font-mono text-[11px] text-neutral-700 dark:text-neutral-200">
              {step.change}
            </div>

            <div className="flex items-center gap-1">
              {STAGES.map((stage, i) => (
                <div key={stage} className="flex flex-1 items-center gap-1">
                  {i > 0 && (
                    <span className="text-neutral-300 dark:text-neutral-600">→</span>
                  )}
                  <div
                    className={[
                      'flex-1 rounded-md py-2 text-center font-mono text-[10px] transition-colors duration-300',
                      step.stages.includes(i)
                        ? i === 4 && !step.onMainThread
                          ? 'bg-green-600 dark:bg-green-500 text-white'
                          : i === 2
                            ? 'bg-red-500 text-white'
                            : 'bg-amber-500 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500',
                    ].join(' ')}
                  >
                    {stage}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 flex items-center justify-between font-mono text-[10px]">
              <span className="text-neutral-500 dark:text-neutral-400">{step.cost}</span>
              <span
                className={
                  step.onMainThread
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-green-600 dark:text-green-500'
                }
              >
                {step.stages.length === 0
                  ? ' '
                  : step.onMainThread
                    ? 'main thread'
                    : 'compositor thread'}
              </span>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
