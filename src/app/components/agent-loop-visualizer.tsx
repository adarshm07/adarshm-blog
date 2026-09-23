'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Msg = {
  role: 'user' | 'assistant'
  kind: 'text' | 'tool_use' | 'tool_result'
  label: string
}

type Step = {
  stage: 0 | 1 | 2 | 3
  messages: Msg[]
  stopReason?: string
  turn: number
  tokens: number
  note: string
}

const STAGES = ['call model', 'read stop_reason', 'run tools', 'append results']

const steps: Step[] = [
  {
    stage: 0,
    turn: 1,
    tokens: 1_240,
    messages: [{ role: 'user', kind: 'text', label: '"How many open PRs need review?"' }],
    note: 'The loop starts with one user message. Everything the model will ever know about this task lives in that array — the API itself is stateless.',
  },
  {
    stage: 1,
    turn: 1,
    tokens: 1_310,
    stopReason: 'tool_use',
    messages: [
      { role: 'user', kind: 'text', label: '"How many open PRs need review?"' },
      { role: 'assistant', kind: 'tool_use', label: 'list_pull_requests({ state: "open" })' },
    ],
    note: 'The model answers with a tool_use block instead of text, and stop_reason comes back as "tool_use". That field — not the text — is what drives the loop.',
  },
  {
    stage: 2,
    turn: 1,
    tokens: 1_310,
    stopReason: 'tool_use',
    messages: [
      { role: 'user', kind: 'text', label: '"How many open PRs need review?"' },
      { role: 'assistant', kind: 'tool_use', label: 'list_pull_requests({ state: "open" })' },
    ],
    note: 'Your code runs the function. This is the part people forget: the model never executes anything. It emits a request, and the harness decides whether to honour it.',
  },
  {
    stage: 3,
    turn: 1,
    tokens: 2_980,
    stopReason: 'tool_use',
    messages: [
      { role: 'user', kind: 'text', label: '"How many open PRs need review?"' },
      { role: 'assistant', kind: 'tool_use', label: 'list_pull_requests({ state: "open" })' },
      { role: 'user', kind: 'tool_result', label: '[ 23 pull requests… ]  +1,670 tokens' },
    ],
    note: 'The result goes back as a tool_result block in a user message. Note the token jump — tool output is usually the biggest thing in an agent transcript.',
  },
  {
    stage: 1,
    turn: 2,
    tokens: 3_050,
    stopReason: 'tool_use',
    messages: [
      { role: 'user', kind: 'text', label: '"How many open PRs need review?"' },
      { role: 'assistant', kind: 'tool_use', label: 'list_pull_requests({ state: "open" })' },
      { role: 'user', kind: 'tool_result', label: '[ 23 pull requests… ]' },
      { role: 'assistant', kind: 'tool_use', label: 'get_reviews(…) ×3  (parallel)' },
    ],
    note: 'Second iteration. One assistant message can hold several tool_use blocks — run them concurrently, and return every result in a single user message, or the model learns to stop batching.',
  },
  {
    stage: 3,
    turn: 2,
    tokens: 4_420,
    stopReason: 'tool_use',
    messages: [
      { role: 'user', kind: 'text', label: '"How many open PRs need review?"' },
      { role: 'assistant', kind: 'tool_use', label: 'list_pull_requests({ state: "open" })' },
      { role: 'user', kind: 'tool_result', label: '[ 23 pull requests… ]' },
      { role: 'assistant', kind: 'tool_use', label: 'get_reviews(…) ×3' },
      { role: 'user', kind: 'tool_result', label: '3 results (1 is_error: true)' },
    ],
    note: 'One call failed. Return it as a tool_result with is_error — never drop it. A missing result breaks the block pairing, and the model reacts to a stated error far better than to silence.',
  },
  {
    stage: 1,
    turn: 3,
    tokens: 4_600,
    stopReason: 'end_turn',
    messages: [
      { role: 'user', kind: 'text', label: '"How many open PRs need review?"' },
      { role: 'assistant', kind: 'tool_use', label: 'list_pull_requests({ state: "open" })' },
      { role: 'user', kind: 'tool_result', label: '[ 23 pull requests… ]' },
      { role: 'assistant', kind: 'tool_use', label: 'get_reviews(…) ×3' },
      { role: 'user', kind: 'tool_result', label: '3 results (1 is_error: true)' },
      { role: 'assistant', kind: 'text', label: '"7 PRs are waiting on a reviewer…"' },
    ],
    note: 'stop_reason flips to "end_turn" and the loop exits. Three model calls, one answer — and the whole transcript is resent on every one of them, which is why the token count only ever goes up.',
  },
]

const KIND_STYLE: Record<Msg['kind'], string> = {
  text: 'border-neutral-200 dark:border-neutral-700',
  tool_use: 'border-green-600/50 dark:border-green-500/50 bg-green-600/5',
  tool_result: 'border-amber-500/50 bg-amber-500/5',
}

export function AgentLoopVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2200}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-1">
              {STAGES.map((stage, i) => (
                <div key={stage} className="flex items-center gap-1">
                  {i > 0 && <span className="text-neutral-300 dark:text-neutral-600">→</span>}
                  <span
                    className={[
                      'rounded-md px-2 py-1 font-mono text-[10px] transition-colors duration-300',
                      step.stage === i
                        ? 'bg-green-600 dark:bg-green-500 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500',
                    ].join(' ')}
                  >
                    {stage}
                  </span>
                </div>
              ))}
              <span className="ml-auto font-mono text-[10px] text-neutral-400 dark:text-neutral-500 tabular-nums">
                turn {step.turn}
              </span>
            </div>

            <div className="space-y-1">
              {step.messages.map((msg, i) => (
                <div
                  key={i}
                  className={[
                    'rounded-lg border px-2.5 py-1.5 transition-colors duration-300',
                    KIND_STYLE[msg.kind],
                  ].join(' ')}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate font-mono text-[11px] text-neutral-700 dark:text-neutral-200">
                      {msg.label}
                    </span>
                    <span className="shrink-0 font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
                      {msg.role} · {msg.kind}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-3 font-mono text-[10px]">
              <span className="text-neutral-400 dark:text-neutral-500">stop_reason:</span>
              <span
                className={
                  step.stopReason === 'end_turn'
                    ? 'text-green-600 dark:text-green-500'
                    : step.stopReason
                      ? 'text-amber-500'
                      : 'text-neutral-300 dark:text-neutral-600'
                }
              >
                {step.stopReason ?? '—'}
              </span>
              <span className="ml-auto tabular-nums text-neutral-400 dark:text-neutral-500">
                {step.tokens.toLocaleString()} input tokens resent
              </span>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
