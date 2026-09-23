'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Lane = {
  buffered: number // items sitting in memory
  produced: number
  consumed: number
  producerPaused: boolean
}

type Step = {
  naive: Lane
  backpressure: Lane
  note: string
}

const CAPACITY = 16 // slots drawn

const steps: Step[] = [
  {
    naive: { buffered: 0, produced: 0, consumed: 0, producerPaused: false },
    backpressure: { buffered: 0, produced: 0, consumed: 0, producerPaused: false },
    note: 'A producer reads rows far faster than the consumer can write them. Top: no backpressure. Bottom: the producer waits for the consumer.',
  },
  {
    naive: { buffered: 4, produced: 6, consumed: 2, producerPaused: false },
    backpressure: { buffered: 4, produced: 6, consumed: 2, producerPaused: false },
    note: 'Early on both look the same — a small buffer is normal and healthy, it is what smooths out jitter between the two sides.',
  },
  {
    naive: { buffered: 11, produced: 15, consumed: 4, producerPaused: false },
    backpressure: { buffered: 8, produced: 12, consumed: 4, producerPaused: true },
    note: 'The buffer fills. The bottom stream hits its high-water mark, so write() returns false and the producer pauses. The top stream has no such signal and keeps reading.',
  },
  {
    naive: { buffered: 24, produced: 30, consumed: 6, producerPaused: false },
    backpressure: { buffered: 5, produced: 12, consumed: 7, producerPaused: false },
    note: 'The consumer drains below the low-water mark and emits "drain", so the bottom producer resumes. The top just keeps accumulating — every unconsumed item is still in memory.',
  },
  {
    naive: { buffered: 52, produced: 60, consumed: 8, producerPaused: false },
    backpressure: { buffered: 7, produced: 18, consumed: 11, producerPaused: false },
    note: 'This is the failure: unbounded buffering. The top process’s memory is now proportional to the *input size*, not the window it is working on — and the only symptom is RSS climbing.',
  },
  {
    naive: { buffered: 96, produced: 104, consumed: 8, producerPaused: false },
    backpressure: { buffered: 6, produced: 26, consumed: 20, producerPaused: false },
    note: 'On a big enough file the top ends in an out-of-memory kill. The bottom finishes the same work in the same total time, with a bounded footprint — backpressure costs nothing but the coordination.',
  },
]

function LaneView({ lane, label, danger }: { lane: Lane; label: string; danger: boolean }) {
  const shown = Math.min(lane.buffered, CAPACITY)
  const overflow = lane.buffered - shown
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <p className="font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
          {label}
        </p>
        <p
          className={[
            'font-mono text-[9px] transition-colors duration-300',
            lane.producerPaused ? 'text-amber-500' : 'text-neutral-400 dark:text-neutral-500',
          ].join(' ')}
        >
          {lane.producerPaused ? 'producer paused' : 'producer running'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-14 shrink-0 font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
          producer
        </span>
        <div className="flex flex-1 gap-0.5">
          {Array.from({ length: CAPACITY }, (_, i) => (
            <div
              key={i}
              className={[
                'h-4 flex-1 rounded-[2px] transition-colors duration-500',
                i < shown
                  ? danger && lane.buffered > CAPACITY
                    ? 'bg-red-500/80'
                    : 'bg-green-600/70 dark:bg-green-500/70'
                  : 'bg-neutral-100 dark:bg-neutral-800',
              ].join(' ')}
            />
          ))}
        </div>
        <span className="w-14 shrink-0 text-right font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
          consumer
        </span>
      </div>
      <p className="mt-1 font-mono text-[9px] tabular-nums text-neutral-500 dark:text-neutral-400">
        buffered {lane.buffered}
        {overflow > 0 && (
          <span className="text-red-500"> (+{overflow} beyond the buffer, in heap)</span>
        )}{' '}
        · produced {lane.produced} · consumed {lane.consumed}
      </p>
    </div>
  )
}

export function BackpressureVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2100}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="space-y-4">
              <LaneView lane={step.naive} label="no backpressure" danger />
              <LaneView lane={step.backpressure} label="with backpressure" danger={false} />
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
