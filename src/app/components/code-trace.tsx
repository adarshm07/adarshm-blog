'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

/**
 * A step-through code trace: the source on top with the current line(s)
 * highlighted, and below it any number of small panels of name → value rows
 * (variables, inferred types, arrays, emitted output) that change per step.
 */
export type TraceRow = {
  k: string
  v: string
  tone?: 'ok' | 'warn' | 'bad' | 'muted'
}

export type TracePanel = { title: string; rows: TraceRow[] }

export type TraceStep = {
  lines?: number[] // highlighted line indexes
  error?: boolean // highlight in red instead of amber
  panels: TracePanel[]
  note: string
}

const TONE = {
  ok: 'text-green-700 dark:text-green-400',
  warn: 'text-amber-600 dark:text-amber-400',
  bad: 'text-red-500',
  muted: 'text-neutral-400 dark:text-neutral-500',
}

export function CodeTrace({
  code,
  steps,
  interval = 2600,
}: {
  code: string[]
  steps: TraceStep[]
  interval?: number
}) {
  return (
    <StepPlayer length={steps.length} interval={interval}>
      {(index) => {
        const step = steps[index]
        const columns = Math.min(step.panels.length, 3)
        return (
          <>
            <div className="overflow-x-auto rounded-lg bg-neutral-50 dark:bg-neutral-900 p-2">
              {code.map((line, i) => {
                const active = step.lines?.includes(i)
                return (
                  <div
                    key={i}
                    className={[
                      'whitespace-pre rounded px-1.5 font-mono text-[10.5px] leading-relaxed transition-colors duration-300',
                      active
                        ? step.error
                          ? 'bg-red-500/15 text-neutral-900 dark:text-neutral-50'
                          : 'bg-amber-500/20 text-neutral-900 dark:text-neutral-50'
                        : 'text-neutral-500 dark:text-neutral-400',
                    ].join(' ')}
                  >
                    {line || ' '}
                  </div>
                )
              })}
            </div>
            {step.panels.length > 0 ? (
              <div
                className="mt-3 grid gap-2 font-mono text-[10px]"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {step.panels.map((panel) => (
                  <div
                    key={panel.title}
                    className="min-w-0 rounded-lg border border-neutral-100 dark:border-neutral-800 px-2 py-1.5"
                  >
                    <div className="mb-1 uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                      {panel.title}
                    </div>
                    {panel.rows.length === 0 ? (
                      <div className="text-neutral-300 dark:text-neutral-600">—</div>
                    ) : (
                      panel.rows.map((row, i) => {
                        const tone = row.tone ? TONE[row.tone] : 'text-neutral-800 dark:text-neutral-100'
                        // Long values (compiler errors, explanations) read
                        // better as a left-aligned line under their label.
                        if (row.v.length > 28 || !row.k) {
                          return (
                            <div key={`${row.k}-${i}`} className="mb-0.5">
                              {row.k ? (
                                <div className="text-neutral-500 dark:text-neutral-400">{row.k}</div>
                              ) : null}
                              <div className={['break-words', tone].join(' ')}>{row.v}</div>
                            </div>
                          )
                        }
                        return (
                          <div key={`${row.k}-${i}`} className="flex justify-between gap-2">
                            <span className="shrink-0 text-neutral-500 dark:text-neutral-400">{row.k}</span>
                            <span className={['min-w-0 text-right break-words', tone].join(' ')}>{row.v}</span>
                          </div>
                        )
                      })
                    )}
                  </div>
                ))}
              </div>
            ) : null}
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
