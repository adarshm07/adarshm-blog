'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type State = 'closed' | 'open' | 'half-open'
type Call = 'ok' | 'fail' | 'short' | 'trial'

type Step = {
  state: State
  failures: number
  log: Call[]
  note: string
}

const THRESHOLD = 4

const steps: Step[] = [
  {
    state: 'closed',
    failures: 0,
    log: [],
    note: 'A circuit breaker wraps a call to a dependency. Closed means traffic flows normally; it just counts how the calls go.',
  },
  {
    state: 'closed',
    failures: 0,
    log: ['ok', 'ok', 'ok'],
    note: 'Healthy responses. The failure counter stays at zero.',
  },
  {
    state: 'closed',
    failures: 1,
    log: ['ok', 'ok', 'ok', 'fail'],
    note: 'The dependency times out. One failure is noise, not a signal — the breaker stays closed.',
  },
  {
    state: 'closed',
    failures: 3,
    log: ['ok', 'ok', 'ok', 'fail', 'fail', 'fail'],
    note: 'Three in a row. Every one of these took the full timeout to fail, and each held a thread or connection the whole time.',
  },
  {
    state: 'open',
    failures: 4,
    log: ['ok', 'ok', 'ok', 'fail', 'fail', 'fail', 'fail'],
    note: `The fourth failure crosses the threshold and trips the breaker. It flips to open — the dependency is declared unhealthy.`,
  },
  {
    state: 'open',
    failures: 4,
    log: ['fail', 'fail', 'fail', 'fail', 'short', 'short', 'short'],
    note: 'While open, calls fail immediately without touching the network. Callers get a fast error (or a fallback) instead of a 30-second hang — that is the point: fail fast, not fail eventually.',
  },
  {
    state: 'open',
    failures: 4,
    log: ['fail', 'fail', 'short', 'short', 'short', 'short', 'short'],
    note: 'The struggling service also gets what it needs most: no traffic. A breaker protects the caller from hanging and the callee from being hammered while it recovers.',
  },
  {
    state: 'half-open',
    failures: 4,
    log: ['short', 'short', 'short', 'trial'],
    note: 'After the cooldown the breaker goes half-open and lets exactly one trial request through. Everything else is still short-circuited, so a still-broken service gets one request, not a flood.',
  },
  {
    state: 'open',
    failures: 5,
    log: ['short', 'short', 'trial', 'fail'],
    note: 'The trial fails. Straight back to open, and a good implementation lengthens the cooldown each time — exponential backoff at the breaker level.',
  },
  {
    state: 'half-open',
    failures: 5,
    log: ['short', 'short', 'short', 'trial'],
    note: 'Longer cooldown, another trial.',
  },
  {
    state: 'closed',
    failures: 0,
    log: ['trial', 'ok', 'ok', 'ok'],
    note: 'This one succeeds, so the breaker closes and the counters reset. Traffic resumes at full rate — which is why some implementations ramp back up gradually instead of all at once.',
  },
]

const STATES: { key: State; label: string }[] = [
  { key: 'closed', label: 'CLOSED' },
  { key: 'open', label: 'OPEN' },
  { key: 'half-open', label: 'HALF-OPEN' },
]

const CALL_STYLE: Record<Call, { cls: string; char: string }> = {
  ok: { cls: 'bg-green-600 dark:bg-green-500 text-white', char: '✓' },
  fail: { cls: 'bg-red-500 text-white', char: '✕' },
  short: { cls: 'bg-neutral-300 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300', char: '⤫' },
  trial: { cls: 'bg-amber-500 text-white', char: '?' },
}

export function CircuitBreakerVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={1800}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="flex items-center gap-1.5">
              {STATES.map((st, i) => (
                <div key={st.key} className="contents">
                  {i > 0 && (
                    <span className="text-neutral-300 dark:text-neutral-600">→</span>
                  )}
                  <div
                    className={[
                      'flex-1 rounded-lg border px-2 py-2 text-center font-mono text-[10px] transition-colors duration-300',
                      step.state !== st.key
                        ? 'border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500'
                        : st.key === 'closed'
                          ? 'border-green-600 dark:border-green-500 bg-green-600/10 text-green-700 dark:text-green-400'
                          : st.key === 'open'
                            ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400'
                            : 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400',
                    ].join(' ')}
                  >
                    {st.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                <span>consecutive failures</span>
                <span className="tabular-nums">
                  {Math.min(step.failures, THRESHOLD)} / {THRESHOLD}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className={[
                    'h-full rounded-full transition-all duration-500',
                    step.failures >= THRESHOLD ? 'bg-red-500' : 'bg-amber-500',
                  ].join(' ')}
                  style={{
                    width: `${Math.min(step.failures / THRESHOLD, 1) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                recent calls
              </p>
              <div className="flex gap-1">
                {step.log.map((call, i) => (
                  <span
                    key={i}
                    className={[
                      'flex h-6 w-6 items-center justify-center rounded-md text-xs transition-colors duration-300',
                      CALL_STYLE[call].cls,
                    ].join(' ')}
                    title={call}
                  >
                    {CALL_STYLE[call].char}
                  </span>
                ))}
                {step.log.length === 0 && (
                  <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                    none yet
                  </span>
                )}
              </div>
              <p className="mt-1 font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                ✓ success · ✕ failure · ⤫ short-circuited · ? trial
              </p>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
