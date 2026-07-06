'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type TokenStep = {
  tokens: number
  event?: { label: string; ok: boolean }
  note: string
}

const tokenSteps: TokenStep[] = [
  {
    tokens: 5,
    note: 'Token bucket: capacity 5, refilled at 1 token per second. Every request spends one token.',
  },
  {
    tokens: 4,
    event: { label: 'request', ok: true },
    note: 'A request arrives, a token is available — allowed.',
  },
  {
    tokens: 1,
    event: { label: 'burst of 3 requests', ok: true },
    note: 'A short burst drains three tokens at once — all allowed. Absorbing bursts is the feature, not a bug.',
  },
  {
    tokens: 0,
    event: { label: 'request', ok: true },
    note: 'The last token is spent. The bucket is now empty.',
  },
  {
    tokens: 0,
    event: { label: 'request', ok: false },
    note: 'Empty bucket → the request is rejected with 429 Too Many Requests (or queued, depending on policy).',
  },
  {
    tokens: 1,
    event: { label: 'refill (+1 token)', ok: true },
    note: 'One second passes and a token drips back in. Refill happens continuously, not at window boundaries.',
  },
  {
    tokens: 0,
    event: { label: 'request', ok: true },
    note: 'Traffic now flows at exactly the refill rate: 1 request per second, with headroom for future bursts as tokens accumulate.',
  },
]

type WindowStep = {
  dots: { pos: number; ok: boolean }[]
  note: string
}

const burst1 = [40, 42, 44, 46, 48].map((pos) => ({ pos, ok: true }))
const burst2 = [51, 53, 55, 57, 59].map((pos) => ({ pos, ok: true }))

const windowSteps: WindowStep[] = [
  {
    dots: [],
    note: 'Fixed window: limit 5 requests per 10-second window. The counter resets to zero at every boundary (the dashed line).',
  },
  {
    dots: burst1,
    note: 'Five requests land just before the boundary — all allowed, the window #1 counter hits 5/5.',
  },
  {
    dots: [...burst1, { pos: 49, ok: false }],
    note: 'A sixth request in the same window is rejected. So far, so good.',
  },
  {
    dots: [...burst1, { pos: 49, ok: false }, ...burst2],
    note: 'The window rolls over and the counter resets — five more requests are allowed immediately after the boundary.',
  },
  {
    dots: [...burst1, { pos: 49, ok: false }, ...burst2],
    note: 'Result: 10 allowed requests in about 2 seconds, despite the "5 per 10s" limit. This boundary burst is the classic fixed-window flaw — sliding windows fix it by always counting the trailing 10 seconds.',
  },
]

function TokenBucket() {
  return (
    <StepPlayer length={tokenSteps.length} interval={2000}>
      {(index) => {
        const step = tokenSteps[index]
        return (
          <>
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5 rounded-lg border border-neutral-100 dark:border-neutral-800 p-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className={[
                      'w-6 h-9 rounded transition-colors duration-300',
                      i < step.tokens
                        ? 'bg-green-600 dark:bg-green-500'
                        : 'bg-neutral-100 dark:bg-neutral-800',
                    ].join(' ')}
                  />
                ))}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                {step.tokens} / 5 tokens
              </div>
              {step.event && (
                <span
                  className={[
                    'ml-auto rounded-md px-2.5 py-1.5 font-mono text-[11px]',
                    step.event.ok
                      ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
                  ].join(' ')}
                >
                  {step.event.label} {step.event.ok ? '✓' : '✗ 429'}
                </span>
              )}
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}

function FixedWindow() {
  return (
    <StepPlayer length={windowSteps.length} interval={2400}>
      {(index) => {
        const step = windowSteps[index]
        return (
          <>
            <div className="flex justify-between text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500 mb-1">
              <span>window #1 · limit 5</span>
              <span>window #2 · limit 5</span>
            </div>
            <div className="relative h-10 rounded-md border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
              <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-neutral-300 dark:border-neutral-600" />
              {step.dots.map((dot, i) => (
                <span
                  key={i}
                  className={[
                    'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full',
                    dot.ok ? 'bg-green-600 dark:bg-green-500' : 'bg-red-500',
                  ].join(' ')}
                  style={{ left: `${dot.pos}%` }}
                />
              ))}
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}

export function RateLimiterVisualizer({
  scenario,
}: {
  scenario: 'token-bucket' | 'fixed-window'
}) {
  return scenario === 'token-bucket' ? <TokenBucket /> : <FixedWindow />
}
