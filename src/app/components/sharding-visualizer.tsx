'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Shard = {
  primary: string[]
  replica: string[]
  state: 'ok' | 'down' | 'promoted'
  hot?: boolean
}

type Step = {
  request?: { label: string; kind: 'write' | 'read' }
  target?: number
  shards: Shard[]
  note: string
}

const empty: Shard[] = [
  { primary: [], replica: [], state: 'ok' },
  { primary: [], replica: [], state: 'ok' },
  { primary: [], replica: [], state: 'ok' },
]

function s(
  p0: string[], r0: string[],
  p1: string[], r1: string[],
  p2: string[], r2: string[],
  extra: Partial<Record<0 | 1 | 2, Partial<Shard>>> = {}
): Shard[] {
  const base: Shard[] = [
    { primary: p0, replica: r0, state: 'ok' },
    { primary: p1, replica: r1, state: 'ok' },
    { primary: p2, replica: r2, state: 'ok' },
  ]
  return base.map((sh, i) => ({ ...sh, ...(extra[i as 0 | 1 | 2] ?? {}) }))
}

const steps: Step[] = [
  {
    shards: empty,
    note: 'Three shards, each with a primary and one replica. A router decides which shard owns a key — here by hashing the key and taking it modulo the shard count.',
  },
  {
    request: { label: 'PUT user:42', kind: 'write' },
    target: 1,
    shards: empty,
    note: 'hash("user:42") % 3 = 1. The write is routed to shard 1 and nowhere else: each key lives on exactly one shard.',
  },
  {
    target: 1,
    shards: s([], [], ['user:42'], [], [], []),
    note: 'The primary of shard 1 accepts the write and acknowledges it. The replica has not seen it yet.',
  },
  {
    request: { label: 'GET user:42 (replica)', kind: 'read' },
    target: 1,
    shards: s([], [], ['user:42'], [], [], []),
    note: 'A read routed to the replica right now returns nothing — this is replication lag, and it is why "read your own writes" needs either a primary read or a session guarantee.',
  },
  {
    target: 1,
    shards: s([], [], ['user:42'], ['user:42'], [], []),
    note: 'Milliseconds later the replica catches up. Asynchronous replication buys you throughput and costs you a window of staleness.',
  },
  {
    request: { label: 'PUT user:7', kind: 'write' },
    target: 0,
    shards: s([], [], ['user:42'], ['user:42'], [], []),
    note: 'A different key hashes to shard 0. Writes now spread across machines — that is the point of sharding: capacity that grows with the number of shards.',
  },
  {
    shards: s(['user:7'], ['user:7'], ['user:42'], ['user:42'], ['user:99'], ['user:99']),
    note: 'After a few more writes the data is spread roughly evenly. Hash sharding gives good balance but destroys locality: a range scan has to hit every shard.',
  },
  {
    request: { label: '10k reads celebrity:1', kind: 'read' },
    target: 1,
    shards: s(
      ['user:7'], ['user:7'],
      ['user:42', 'celebrity:1'], ['user:42', 'celebrity:1'],
      ['user:99'], ['user:99'],
      { 1: { hot: true } }
    ),
    note: 'One key takes all the traffic. Hashing balances keys, not load — a hot key makes its shard the bottleneck no matter how many shards you add.',
  },
  {
    shards: s(
      ['user:7'], ['user:7'],
      ['user:42', 'celebrity:1'], ['user:42', 'celebrity:1'],
      ['user:99'], ['user:99'],
      { 2: { state: 'down' } }
    ),
    note: 'Now shard 2 loses its primary. Only the keys on that shard are affected — the blast radius of a failure is one shard, not the whole database.',
  },
  {
    shards: s(
      ['user:7'], ['user:7'],
      ['user:42', 'celebrity:1'], ['user:42', 'celebrity:1'],
      ['user:99'], [],
      { 2: { state: 'promoted' } }
    ),
    note: 'Failover promotes the replica to primary. Any writes the old primary acknowledged but had not replicated are lost — the cost of asynchronous replication, paid at exactly the worst moment.',
  },
]

function ShardBox({ shard, index, active }: { shard: Shard; index: number; active: boolean }) {
  return (
    <div
      className={[
        'flex-1 rounded-lg border p-2 transition-colors duration-300',
        shard.state === 'down'
          ? 'border-red-500/60 bg-red-500/5'
          : active
            ? 'border-green-600/60 dark:border-green-500/60 bg-green-600/5'
            : 'border-neutral-200 dark:border-neutral-700',
      ].join(' ')}
    >
      <p className="mb-1.5 flex items-center justify-between font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
        <span>shard {index}</span>
        {shard.hot && <span className="text-amber-500">hot</span>}
        {shard.state === 'down' && <span className="text-red-500">down</span>}
        {shard.state === 'promoted' && <span className="text-green-600 dark:text-green-500">failover</span>}
      </p>
      <div className="space-y-1">
        <div
          className={[
            'rounded-md px-2 py-1',
            shard.state === 'down'
              ? 'bg-red-500/10 line-through text-neutral-400 dark:text-neutral-600'
              : 'bg-neutral-100 dark:bg-neutral-800',
          ].join(' ')}
        >
          <p className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
            {shard.state === 'promoted' ? 'primary (was replica)' : 'primary'}
          </p>
          {shard.primary.length === 0 ? (
            <p className="font-mono text-[10px] text-neutral-300 dark:text-neutral-600">—</p>
          ) : (
            shard.primary.map((k) => (
              <p key={k} className="font-mono text-[10px] text-neutral-700 dark:text-neutral-200">
                {k}
              </p>
            ))
          )}
        </div>
        <div className="rounded-md bg-neutral-50 dark:bg-neutral-900 px-2 py-1">
          <p className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
            {shard.state === 'promoted' ? 'replica (rebuilding)' : 'replica'}
          </p>
          {shard.replica.length === 0 ? (
            <p className="font-mono text-[10px] text-neutral-300 dark:text-neutral-600">—</p>
          ) : (
            shard.replica.map((k) => (
              <p key={k} className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
                {k}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export function ShardingVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={1800}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="mb-3 flex items-center justify-center gap-2">
              <span
                className={[
                  'rounded-md px-2 py-1 font-mono text-[11px] transition-colors duration-300',
                  step.request
                    ? step.request.kind === 'write'
                      ? 'bg-green-600 dark:bg-green-500 text-white'
                      : 'bg-amber-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500',
                ].join(' ')}
              >
                {step.request?.label ?? 'idle'}
              </span>
              <span className="text-neutral-300 dark:text-neutral-600">→</span>
              <span className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-1 font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                router
              </span>
            </div>
            <div className="flex gap-2">
              {step.shards.map((shard, i) => (
                <ShardBox key={i} shard={shard} index={i} active={step.target === i} />
              ))}
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
