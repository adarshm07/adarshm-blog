'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Seg = {
  label: string
  tokens: number
  tone: 'system' | 'tools' | 'history' | 'results' | 'summary' | 'new'
}

type Step = {
  segments: Seg[]
  cachedUpTo?: number // index of the last segment covered by the cache prefix
  invalidatedFrom?: number
  cacheRead?: number
  note: string
}

const LIMIT = 200_000 // tokens drawn on the bar

const TONE: Record<Seg['tone'], string> = {
  system: 'bg-neutral-700 dark:bg-neutral-300',
  tools: 'bg-neutral-500 dark:bg-neutral-500',
  history: 'bg-green-600/70 dark:bg-green-500/70',
  results: 'bg-amber-500/80',
  summary: 'bg-green-600 dark:bg-green-500',
  new: 'bg-neutral-300 dark:bg-neutral-700',
}

const base: Seg[] = [
  { label: 'system', tokens: 2_000, tone: 'system' },
  { label: 'tools', tokens: 6_000, tone: 'tools' },
]

const steps: Step[] = [
  {
    segments: [...base, { label: 'first message', tokens: 800, tone: 'new' }],
    note: 'Every request re-sends the whole conversation: system prompt, tool definitions, and all history. The window is a budget you refill from scratch on every turn.',
  },
  {
    segments: [...base, { label: 'history', tokens: 12_000, tone: 'history' }],
    cachedUpTo: 1,
    cacheRead: 8_000,
    note: 'Prompt caching makes the re-sending cheap — but it is a prefix match. The stable part (system + tools) is cached; everything after the last breakpoint is charged in full.',
  },
  {
    segments: [
      ...base,
      { label: 'history', tokens: 12_000, tone: 'history' },
      { label: 'tool results', tokens: 46_000, tone: 'results' },
    ],
    cachedUpTo: 1,
    cacheRead: 8_000,
    note: 'Then the agent starts calling tools. Raw tool output — file contents, API payloads, search results — is what actually fills an agent’s context, usually several times faster than the conversation itself.',
  },
  {
    segments: [
      ...base,
      { label: 'history', tokens: 12_000, tone: 'history' },
      { label: 'tool results', tokens: 96_000, tone: 'results' },
    ],
    cachedUpTo: 3,
    cacheRead: 116_000,
    note: 'Move the cache breakpoint after the tool results and the whole prefix is cached: reads cost a fraction of normal input tokens. Long agent runs are affordable mostly because of this.',
  },
  {
    segments: [
      ...base,
      { label: 'history', tokens: 12_000, tone: 'history' },
      { label: 'tool results', tokens: 96_000, tone: 'results' },
      { label: 'new message', tokens: 400, tone: 'new' },
    ],
    cachedUpTo: 3,
    invalidatedFrom: 0,
    cacheRead: 0,
    note: 'Now someone puts a timestamp in the system prompt. One byte changes at the front, and the entire cache after it is invalidated — a full-price request, every turn. This is the single most common caching bug.',
  },
  {
    segments: [
      ...base,
      { label: 'history', tokens: 12_000, tone: 'history' },
      { label: 'tool results', tokens: 158_000, tone: 'results' },
    ],
    cachedUpTo: 3,
    note: 'Back to a stable prefix, but the run keeps going and the window is nearly full. Two ways out, and they are not the same thing.',
  },
  {
    segments: [
      ...base,
      { label: 'history', tokens: 12_000, tone: 'history' },
      { label: 'recent results', tokens: 24_000, tone: 'results' },
    ],
    note: 'Context editing clears old tool results outright. Cheap and lossy: the model keeps its own reasoning but can no longer re-read what those tools returned.',
  },
  {
    segments: [
      ...base,
      { label: 'summary', tokens: 9_000, tone: 'summary' },
      { label: 'recent turns', tokens: 18_000, tone: 'results' },
    ],
    note: 'Compaction instead summarizes the earlier conversation into a compact block and keeps the recent turns verbatim. It costs a model call and loses detail — but it keeps the thread of what happened.',
  },
]

export function ContextWindowVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2300}>
      {(index) => {
        const step = steps[index]
        const used = step.segments.reduce((sum, s) => sum + s.tokens, 0)
        return (
          <>
            <div className="mb-1 flex items-baseline justify-between font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
              <span>
                context window
                {step.invalidatedFrom !== undefined && (
                  <span className="ml-2 rounded bg-red-500/10 px-1.5 py-0.5 text-red-600 dark:text-red-400">
                    cache invalidated
                  </span>
                )}
              </span>
              <span className="tabular-nums">
                {used.toLocaleString()} / {LIMIT.toLocaleString()} tokens
              </span>
            </div>

            <div className="flex h-8 w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
              {step.segments.map((seg, i) => (
                <div
                  key={seg.label}
                  className={[
                    'relative h-full transition-all duration-700',
                    TONE[seg.tone],
                    step.invalidatedFrom !== undefined && i >= step.invalidatedFrom
                      ? 'opacity-40'
                      : '',
                  ].join(' ')}
                  style={{ width: `${(seg.tokens / LIMIT) * 100}%` }}
                  title={`${seg.label}: ${seg.tokens.toLocaleString()} tokens`}
                />
              ))}
            </div>

            {/* cache prefix indicator */}
            <div className="mt-1 flex h-3 w-full">
              {step.segments.map((seg, i) => {
                const cached =
                  step.cachedUpTo !== undefined &&
                  i <= step.cachedUpTo &&
                  step.invalidatedFrom === undefined
                return (
                  <div
                    key={seg.label}
                    style={{ width: `${(seg.tokens / LIMIT) * 100}%` }}
                    className="pr-px"
                  >
                    <div
                      className={[
                        'h-1 rounded-full transition-colors duration-500',
                        cached ? 'bg-green-600 dark:bg-green-500' : 'bg-transparent',
                      ].join(' ')}
                    />
                  </div>
                )
              })}
            </div>

            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[9px] text-neutral-500 dark:text-neutral-400">
              {step.segments.map((seg) => (
                <span key={seg.label} className="flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-[2px] ${TONE[seg.tone]}`} />
                  {seg.label} {seg.tokens.toLocaleString()}
                </span>
              ))}
              <span className="ml-auto">
                {step.cacheRead !== undefined
                  ? `cache_read_input_tokens: ${step.cacheRead.toLocaleString()}`
                  : ' '}
              </span>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
