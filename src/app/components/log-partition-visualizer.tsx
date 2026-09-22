'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const MESSAGES = ['m1', 'm2', 'm3', 'm4', 'm5']

type Step = {
  queue: string[]
  delivered?: string
  offsets: { name: string; at: number }[]
  reading?: number
  note: string
}

const steps: Step[] = [
  {
    queue: [...MESSAGES],
    offsets: [
      { name: 'A', at: 0 },
      { name: 'B', at: 0 },
    ],
    note: 'The same five messages in a classic queue (left) and an append-only log (right). Two consumers, A and B, want them.',
  },
  {
    queue: ['m2', 'm3', 'm4', 'm5'],
    delivered: 'm1',
    offsets: [
      { name: 'A', at: 1 },
      { name: 'B', at: 0 },
    ],
    reading: 0,
    note: 'A reads m1. In the queue the message is handed out and, once acknowledged, deleted. In the log nothing is removed — A just advances its own offset from 0 to 1.',
  },
  {
    queue: ['m3', 'm4', 'm5'],
    delivered: 'm2',
    offsets: [
      { name: 'A', at: 1 },
      { name: 'B', at: 1 },
    ],
    reading: 0,
    note: 'Now B reads. The queue gives it the next message, m2 — work is split between consumers. The log gives it m1, because B has its own offset: every consumer sees every message.',
  },
  {
    queue: [],
    offsets: [
      { name: 'A', at: 5 },
      { name: 'B', at: 3 },
    ],
    note: 'A few minutes later the queue is empty — its state is "what is left to do". The log still holds all five records, and the offsets tell you exactly how far each consumer has got. B is two messages behind: that gap is consumer lag, and it is a number you can alert on.',
  },
  {
    queue: [],
    offsets: [
      { name: 'A', at: 5 },
      { name: 'B', at: 5 },
      { name: 'C', at: 0 },
    ],
    note: 'A new analytics service C comes online. The queue has nothing to offer it — those messages are gone. On the log, C starts at offset 0 and reads the entire history at its own pace, without disturbing A or B.',
  },
  {
    queue: [],
    offsets: [
      { name: 'A', at: 2 },
      { name: 'B', at: 5 },
      { name: 'C', at: 5 },
    ],
    reading: 2,
    note: 'A shipped a bug and processed m3 onwards incorrectly. Fixing it is an offset rewind: set A back to 2 and it reprocesses from there. Replay is just arithmetic when the data is still on disk.',
  },
  {
    queue: [],
    offsets: [
      { name: 'A', at: 5 },
      { name: 'B', at: 5 },
      { name: 'C', at: 5 },
    ],
    note: 'Records leave the log on a retention policy — after 7 days, or 100 GB — not when someone reads them. That is the trade: you pay for storage and get replay, fan-out, and lag metrics. A queue is cheaper and simpler when you only ever need each message handled once.',
  },
]

export function LogPartitionVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2000}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
              <div className="sm:w-40">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  queue — delete on ack
                </p>
                <div className="flex gap-1 sm:flex-col">
                  {MESSAGES.map((m) => {
                    const present = step.queue.includes(m)
                    const isDelivered = step.delivered === m
                    return (
                      <div
                        key={m}
                        className={[
                          'flex h-7 flex-1 items-center justify-center rounded-md font-mono text-[11px] transition-all duration-500 sm:flex-none',
                          isDelivered
                            ? 'bg-amber-500 text-white'
                            : present
                              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
                              : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-300 dark:text-neutral-700 line-through',
                        ].join(' ')}
                      >
                        {m}
                      </div>
                    )
                  })}
                </div>
                <p className="mt-1.5 font-mono text-[10px] text-neutral-400 dark:text-neutral-500 tabular-nums">
                  {step.queue.length} pending
                </p>
              </div>

              <div className="flex-1">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  log — append only
                </p>
                <div className="flex gap-1">
                  {MESSAGES.map((m, i) => (
                    <div key={m} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className={[
                          'flex h-7 w-full items-center justify-center rounded-md font-mono text-[11px] transition-colors duration-300',
                          step.reading === i
                            ? 'bg-amber-500 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200',
                        ].join(' ')}
                      >
                        {m}
                      </div>
                      <span className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
                        {i}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-2 space-y-1">
                  {step.offsets.map((o) => (
                    <div key={o.name} className="flex items-center gap-2">
                      <span className="w-14 font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
                        {o.name} @ {o.at}
                      </span>
                      <div className="relative h-1.5 flex-1 rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <div
                          className="h-full rounded-full bg-green-600 dark:bg-green-500 transition-all duration-700"
                          style={{ width: `${(o.at / MESSAGES.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
