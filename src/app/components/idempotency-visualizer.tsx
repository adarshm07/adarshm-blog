'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type KeyRecord = { key: string; status: 'in progress' | 'done'; response?: string }

type Step = {
  arrow?: { dir: 'right' | 'left'; label: string; lost?: boolean; tone?: 'ok' | 'warn' }
  keys: KeyRecord[]
  charges: string[]
  note: string
}

const steps: Step[] = [
  {
    keys: [],
    charges: [],
    note: 'The client wants to charge a card once. It generates a unique idempotency key (k-7f3a) before the first attempt and will send the same key on every retry.',
  },
  {
    arrow: { dir: 'right', label: 'POST /charges  Idempotency-Key: k-7f3a' },
    keys: [{ key: 'k-7f3a', status: 'in progress' }],
    charges: [],
    note: 'The server first inserts the key into its key store, marked in progress. The insert is atomic on a unique index — this is what stops two copies of the request both proceeding.',
  },
  {
    keys: [{ key: 'k-7f3a', status: 'done', response: '201 ch_91' }],
    charges: ['ch_91 · $40'],
    note: 'It performs the charge, then stores the response it is about to send alongside the key.',
  },
  {
    arrow: { dir: 'left', label: '201 Created  ch_91', lost: true },
    keys: [{ key: 'k-7f3a', status: 'done', response: '201 ch_91' }],
    charges: ['ch_91 · $40'],
    note: 'The response is lost — a timeout, a dropped connection, a load balancer restart. The client cannot tell whether the charge happened. The only safe thing it can do is retry.',
  },
  {
    arrow: { dir: 'right', label: 'POST /charges  Idempotency-Key: k-7f3a' },
    keys: [{ key: 'k-7f3a', status: 'done', response: '201 ch_91' }],
    charges: ['ch_91 · $40'],
    note: 'The retry carries the same key. The server looks it up before doing anything and finds a completed record.',
  },
  {
    arrow: { dir: 'left', label: '201 Created  ch_91  (replayed)', tone: 'ok' },
    keys: [{ key: 'k-7f3a', status: 'done', response: '201 ch_91' }],
    charges: ['ch_91 · $40'],
    note: 'It replays the stored response instead of charging again. The client gets the same answer the first attempt would have given, and the ledger still has exactly one charge.',
  },
  {
    arrow: { dir: 'left', label: '409 Conflict  (still in progress)', tone: 'warn' },
    keys: [{ key: 'k-7f3a', status: 'in progress' }],
    charges: [],
    note: 'The other race: if the retry had arrived while the first attempt was still in progress, the server should not wait or run it again — it answers 409 and the client backs off and retries later.',
  },
]

export function IdempotencyVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2600}>
      {(index) => {
        const step = steps[index]
        const arrow = step.arrow
        return (
          <>
            <div className="flex items-stretch gap-2">
              <div className="flex w-16 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 font-mono text-[11px] text-neutral-700 dark:text-neutral-200">
                client
              </div>
              <div className="flex min-h-14 flex-1 flex-col justify-center">
                {arrow ? (
                  <>
                    <div
                      className={[
                        'text-center font-mono text-[10px] transition-colors',
                        arrow.lost
                          ? 'text-red-500 line-through'
                          : arrow.tone === 'ok'
                            ? 'text-green-700 dark:text-green-400'
                            : arrow.tone === 'warn'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-neutral-600 dark:text-neutral-300',
                      ].join(' ')}
                    >
                      {arrow.label}
                    </div>
                    <div
                      className={[
                        'text-center font-mono text-[14px] leading-none',
                        arrow.lost ? 'text-red-500' : 'text-neutral-400 dark:text-neutral-500',
                      ].join(' ')}
                    >
                      {arrow.dir === 'right'
                        ? '────────────▶'
                        : arrow.lost
                          ? '◀──── ✕ ─────'
                          : '◀────────────'}
                    </div>
                  </>
                ) : null}
              </div>
              <div className="flex w-16 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 font-mono text-[11px] text-neutral-700 dark:text-neutral-200">
                server
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[10px]">
              <div className="rounded-lg border border-neutral-100 dark:border-neutral-800 p-2">
                <div className="mb-1 uppercase tracking-wide text-neutral-400 dark:text-neutral-500">key store</div>
                {step.keys.length === 0 ? (
                  <div className="text-neutral-300 dark:text-neutral-600">empty</div>
                ) : (
                  step.keys.map((k) => (
                    <div key={k.key} className="text-neutral-700 dark:text-neutral-200">
                      {k.key} ·{' '}
                      <span
                        className={
                          k.status === 'done'
                            ? 'text-green-700 dark:text-green-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }
                      >
                        {k.status}
                      </span>
                      {k.response ? ` · ${k.response}` : ''}
                    </div>
                  ))
                )}
              </div>
              <div className="rounded-lg border border-neutral-100 dark:border-neutral-800 p-2">
                <div className="mb-1 uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  charges ({step.charges.length})
                </div>
                {step.charges.length === 0 ? (
                  <div className="text-neutral-300 dark:text-neutral-600">none</div>
                ) : (
                  step.charges.map((c) => (
                    <div key={c} className="text-neutral-700 dark:text-neutral-200">
                      {c}
                    </div>
                  ))
                )}
              </div>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
