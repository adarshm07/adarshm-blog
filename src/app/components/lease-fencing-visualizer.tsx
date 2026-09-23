'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type ClientState = 'idle' | 'working' | 'paused' | 'holder'

type Write = { by: 'A' | 'B'; token: number; accepted: boolean }

type Step = {
  holder?: 'A' | 'B'
  token?: number
  a: ClientState
  b: ClientState
  writes: Write[]
  storageToken: number
  fencing: boolean
  note: string
}

const steps: Step[] = [
  {
    holder: 'A',
    token: 33,
    a: 'holder',
    b: 'idle',
    writes: [],
    storageToken: 0,
    fencing: false,
    note: 'Client A acquires a lock with a 10-second lease. The lock service hands back a monotonically increasing fencing token — 33 — along with the lease.',
  },
  {
    holder: 'A',
    token: 33,
    a: 'working',
    b: 'idle',
    writes: [{ by: 'A', token: 33, accepted: true }],
    storageToken: 33,
    fencing: false,
    note: 'A does its work and writes. Everything is fine — exactly one client believes it holds the lock.',
  },
  {
    holder: 'A',
    token: 33,
    a: 'paused',
    b: 'idle',
    writes: [{ by: 'A', token: 33, accepted: true }],
    storageToken: 33,
    fencing: false,
    note: 'Then A stops for 15 seconds: a stop-the-world GC pause, a hypervisor freeze, a swapped-out page. A is not crashed and does not know any time has passed.',
  },
  {
    a: 'paused',
    b: 'idle',
    writes: [{ by: 'A', token: 33, accepted: true }],
    storageToken: 33,
    fencing: false,
    note: 'The lease expires. From the lock service’s point of view A is gone, and the lock is free — this is the whole point of a lease, and also where the danger starts.',
  },
  {
    holder: 'B',
    token: 34,
    a: 'paused',
    b: 'holder',
    writes: [{ by: 'A', token: 33, accepted: true }],
    storageToken: 33,
    fencing: false,
    note: 'Client B acquires the lock and gets token 34. Two clients now believe they hold it. No amount of lock-service correctness prevents this — the failure is on the client side of the network.',
  },
  {
    holder: 'B',
    token: 34,
    a: 'paused',
    b: 'working',
    writes: [
      { by: 'A', token: 33, accepted: true },
      { by: 'B', token: 34, accepted: true },
    ],
    storageToken: 34,
    fencing: false,
    note: 'B writes with token 34. The storage system records the highest token it has seen.',
  },
  {
    holder: 'B',
    token: 34,
    a: 'working',
    b: 'working',
    writes: [
      { by: 'A', token: 33, accepted: true },
      { by: 'B', token: 34, accepted: true },
      { by: 'A', token: 33, accepted: true },
    ],
    storageToken: 34,
    fencing: false,
    note: 'A wakes up mid-operation and finishes its write, still holding token 33. Without fencing, that stale write lands on top of B’s — silent corruption, and no error anywhere.',
  },
  {
    holder: 'B',
    token: 34,
    a: 'working',
    b: 'working',
    writes: [
      { by: 'A', token: 33, accepted: true },
      { by: 'B', token: 34, accepted: true },
      { by: 'A', token: 33, accepted: false },
    ],
    storageToken: 34,
    fencing: true,
    note: 'With fencing, the storage system rejects any write whose token is lower than the highest it has seen: 33 < 34, refused. The lock became advisory; the resource itself enforces mutual exclusion.',
  },
]

const STATE_STYLE: Record<ClientState, string> = {
  idle: 'border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500',
  working: 'border-green-600/50 dark:border-green-500/50 bg-green-600/5 text-green-700 dark:text-green-400',
  holder: 'border-green-600 dark:border-green-500 bg-green-600/10 text-green-700 dark:text-green-400',
  paused: 'border-amber-500/60 bg-amber-500/5 text-amber-600 dark:text-amber-400',
}

const STATE_LABEL: Record<ClientState, string> = {
  idle: 'idle',
  working: 'writing',
  holder: 'holds lease',
  paused: 'paused (GC)',
}

export function LeaseFencingVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2300}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="mb-3 flex items-center justify-center gap-2 font-mono text-[10px]">
              <span className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-1 text-neutral-600 dark:text-neutral-300">
                lock service
              </span>
              <span className="text-neutral-300 dark:text-neutral-600">→</span>
              <span
                className={[
                  'rounded-md px-2 py-1 transition-colors duration-300',
                  step.holder
                    ? 'bg-green-600 dark:bg-green-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500',
                ].join(' ')}
              >
                {step.holder ? `holder ${step.holder} · token ${step.token}` : 'lease expired'}
              </span>
            </div>

            <div className="flex gap-2">
              {(['A', 'B'] as const).map((id) => {
                const state = id === 'A' ? step.a : step.b
                return (
                  <div
                    key={id}
                    className={[
                      'flex-1 rounded-lg border px-2.5 py-2 transition-colors duration-300',
                      STATE_STYLE[state],
                    ].join(' ')}
                  >
                    <p className="font-mono text-[11px]">client {id}</p>
                    <p className="font-mono text-[9px] opacity-80">{STATE_LABEL[state]}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-3">
              <div className="mb-1.5 flex items-baseline justify-between">
                <p className="font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  storage
                </p>
                <p className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
                  {step.fencing
                    ? `rejects tokens < ${step.storageToken}`
                    : 'accepts any write'}
                </p>
              </div>
              <div className="space-y-1">
                {step.writes.length === 0 && (
                  <p className="font-mono text-[10px] text-neutral-300 dark:text-neutral-600">
                    no writes yet
                  </p>
                )}
                {step.writes.map((w, i) => (
                  <div
                    key={i}
                    className={[
                      'flex items-center justify-between rounded-md px-2 py-1 font-mono text-[10px] transition-colors duration-300',
                      w.accepted
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400 line-through',
                    ].join(' ')}
                  >
                    <span>
                      write by {w.by} · token {w.token}
                    </span>
                    <span>{w.accepted ? 'accepted' : 'rejected — stale token'}</span>
                  </div>
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
