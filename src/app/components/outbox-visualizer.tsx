'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Store = { label: string; items: string[]; failed?: boolean }

type Step = {
  mode: 'dual-write' | 'outbox'
  db: Store
  outbox?: Store
  broker: Store
  consistent: boolean | null
  note: string
}

const steps: Step[] = [
  {
    mode: 'dual-write',
    db: { label: 'database', items: [] },
    broker: { label: 'message broker', items: [] },
    consistent: null,
    note: 'The everyday shape: save the order, then publish an OrderCreated event. Two systems, two writes, no transaction spanning them.',
  },
  {
    mode: 'dual-write',
    db: { label: 'database', items: ['order#42'] },
    broker: { label: 'message broker', items: [] },
    consistent: null,
    note: 'The database commit succeeds.',
  },
  {
    mode: 'dual-write',
    db: { label: 'database', items: ['order#42'] },
    broker: { label: 'message broker', items: [], failed: true },
    consistent: false,
    note: 'Then the publish fails — the broker is down, or the process is killed between the two calls. The order exists and nothing downstream will ever hear about it: no email, no warehouse pick, no analytics row.',
  },
  {
    mode: 'dual-write',
    db: { label: 'database', items: [], failed: true },
    broker: { label: 'message broker', items: ['OrderCreated#43'] },
    consistent: false,
    note: 'Swapping the order just swaps the failure: publish first, then a rollback, and now consumers act on an order that does not exist. Retrying either write can also double-publish. There is no ordering of two writes that makes this safe.',
  },
  {
    mode: 'outbox',
    db: { label: 'database', items: ['order#44'] },
    outbox: { label: 'outbox table', items: ['OrderCreated#44'] },
    broker: { label: 'message broker', items: [] },
    consistent: true,
    note: 'The outbox pattern makes it one write. The event is inserted into an ordinary table in the *same transaction* as the business data — so either both land or neither does.',
  },
  {
    mode: 'outbox',
    db: { label: 'database', items: ['order#44'] },
    outbox: { label: 'outbox table', items: ['OrderCreated#44'] },
    broker: { label: 'message broker', items: ['OrderCreated#44'] },
    consistent: true,
    note: 'A separate relay — a poller, or change data capture tailing the write-ahead log — reads the outbox and publishes. If the broker is down it simply retries later; nothing is lost because the event is durable in the database.',
  },
  {
    mode: 'outbox',
    db: { label: 'database', items: ['order#44'] },
    outbox: { label: 'outbox table', items: [] },
    broker: { label: 'message broker', items: ['OrderCreated#44'] },
    consistent: true,
    note: 'The row is marked sent (or deleted). Note what this buys: at-least-once delivery, not exactly-once. A crash after publishing but before marking sent re-publishes — so consumers still have to be idempotent.',
  },
]

function StoreBox({ store, highlight }: { store: Store; highlight: boolean }) {
  return (
    <div
      className={[
        'flex-1 rounded-lg border p-2 transition-colors duration-300',
        store.failed
          ? 'border-red-500/60 bg-red-500/5'
          : highlight
            ? 'border-green-600/60 dark:border-green-500/60 bg-green-600/5'
            : 'border-neutral-200 dark:border-neutral-700',
      ].join(' ')}
    >
      <p className="mb-1 font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
        {store.label}
        {store.failed ? ' · failed' : ''}
      </p>
      {store.items.length === 0 ? (
        <p className="font-mono text-[10px] text-neutral-300 dark:text-neutral-600">empty</p>
      ) : (
        store.items.map((item) => (
          <p
            key={item}
            className="font-mono text-[10px] text-neutral-700 dark:text-neutral-200"
          >
            {item}
          </p>
        ))
      )}
    </div>
  )
}

export function OutboxVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2400}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="mb-2 flex items-center justify-between font-mono text-[10px]">
              <span className="text-neutral-400 dark:text-neutral-500">
                {step.mode === 'dual-write' ? 'dual write' : 'transactional outbox'}
              </span>
              <span
                className={
                  step.consistent === false
                    ? 'text-red-500'
                    : step.consistent
                      ? 'text-green-600 dark:text-green-500'
                      : 'text-neutral-300 dark:text-neutral-600'
                }
              >
                {step.consistent === false
                  ? 'systems disagree'
                  : step.consistent
                    ? 'consistent'
                    : '—'}
              </span>
            </div>

            <div className="flex items-stretch gap-2">
              <StoreBox store={step.db} highlight={step.mode === 'outbox'} />
              {step.outbox && (
                <>
                  <span className="self-center text-neutral-300 dark:text-neutral-600">+</span>
                  <StoreBox store={step.outbox} highlight />
                </>
              )}
              <span className="self-center text-neutral-300 dark:text-neutral-600">→</span>
              <StoreBox store={step.broker} highlight={false} />
            </div>

            {step.mode === 'outbox' && (
              <p className="mt-1.5 text-center font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
                the database and the outbox share one transaction
              </p>
            )}
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
