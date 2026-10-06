'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

/**
 * A step-through message sequence diagram: actors as columns, and each step
 * adds one message (an arrow between two columns, or a self-action when
 * `from === to`). Earlier messages stay on screen, faded, so the whole
 * exchange builds up. An optional panel shows state that changes per step —
 * a cache entry, a cookie jar, a raw HTTP message.
 */
export type SequenceMessage = {
  from: number
  to: number
  label: string
  tone?: 'ok' | 'warn' | 'bad'
  dashed?: boolean // responses
}

export type SequenceStep = {
  message?: SequenceMessage
  panel?: { title: string; lines: string[] }
  note: string
}

const TONE_TEXT = {
  ok: 'text-green-700 dark:text-green-400',
  warn: 'text-amber-600 dark:text-amber-400',
  bad: 'text-red-500',
}
const TONE_LINE = {
  ok: 'bg-green-600 dark:bg-green-500',
  warn: 'bg-amber-500',
  bad: 'bg-red-500',
}

function MessageRow({
  m,
  columns,
  current,
}: {
  m: SequenceMessage
  columns: number
  current: boolean
}) {
  const left = Math.min(m.from, m.to)
  const span = Math.abs(m.to - m.from)
  const textTone = m.tone ? TONE_TEXT[m.tone] : 'text-neutral-700 dark:text-neutral-200'
  const lineTone = current
    ? m.tone
      ? TONE_LINE[m.tone]
      : 'bg-neutral-700 dark:bg-neutral-200'
    : 'bg-neutral-300 dark:bg-neutral-600'

  if (span === 0) {
    // A self-action: a pill centred on the actor's column.
    return (
      <div className="relative h-7">
        <div
          className="absolute top-0.5 flex justify-center"
          style={{ left: `${(m.from / columns) * 100}%`, width: `${(1 / columns) * 100}%` }}
        >
          <span
            className={[
              'max-w-[180%] whitespace-nowrap rounded-md px-1.5 py-0.5 font-mono text-[9.5px] transition-opacity duration-300',
              current
                ? 'bg-amber-500/15 ' + textTone
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500',
            ].join(' ')}
          >
            {m.label}
          </span>
        </div>
      </div>
    )
  }

  const rightward = m.to > m.from
  const arrowBox = {
    left: `${((left + 0.5) / columns) * 100}%`,
    width: `${(span / columns) * 100}%`,
  }
  return (
    <div className="relative">
      {/* The current label gets the full width (and may wrap); history rows
          stay one line, truncated to their arrow, so the diagram stays compact. */}
      {current ? (
        <div className={['px-1 text-center font-mono text-[9.5px] leading-4', textTone].join(' ')}>
          {m.label}
        </div>
      ) : (
        <div className="relative h-4">
          <div
            title={m.label}
            className="absolute top-0 truncate px-1 text-center font-mono text-[9.5px] leading-4 text-neutral-400 dark:text-neutral-500"
            style={arrowBox}
          >
            {m.label}
          </div>
        </div>
      )}
      <div className="relative h-3">
        <div className="absolute top-0.5" style={arrowBox}>
          <div className="relative h-2">
            <div
              className={[
                'absolute top-1/2 h-px w-full -translate-y-1/2',
                m.dashed ? 'bg-transparent border-t border-dashed' : lineTone,
                m.dashed
                  ? current
                    ? 'border-neutral-600 dark:border-neutral-300'
                    : 'border-neutral-300 dark:border-neutral-600'
                  : '',
              ].join(' ')}
            />
            <span
              className={[
                'absolute top-1/2 -translate-y-1/2 text-[9px] leading-none',
                rightward ? '-right-0.5' : '-left-0.5',
                current ? 'text-neutral-700 dark:text-neutral-200' : 'text-neutral-300 dark:text-neutral-600',
              ].join(' ')}
            >
              {rightward ? '▶' : '◀'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SequenceDiagram({
  actors,
  steps,
  interval = 2600,
}: {
  actors: string[]
  steps: SequenceStep[]
  interval?: number
}) {
  const columns = actors.length
  return (
    <StepPlayer length={steps.length} interval={interval}>
      {(index) => {
        const shown = steps
          .slice(0, index + 1)
          .map((s, i) => ({ m: s.message, i }))
          .filter((x): x is { m: SequenceMessage; i: number } => Boolean(x.m))
        const panel = steps[index].panel
        return (
          <>
            <div className="relative">
              {/* lifelines */}
              <div className="pointer-events-none absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {actors.map((a) => (
                  <div key={a} className="flex justify-center">
                    <div className="h-full w-px bg-neutral-100 dark:bg-neutral-800" />
                  </div>
                ))}
              </div>
              <div className="relative grid gap-1" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {actors.map((a) => (
                  <div
                    key={a}
                    className="mx-auto rounded-md bg-neutral-100 dark:bg-neutral-800 px-1.5 py-1 text-center font-mono text-[10px] leading-tight text-neutral-700 dark:text-neutral-200"
                  >
                    {a}
                  </div>
                ))}
              </div>
              <div className="relative mt-2 min-h-24 space-y-0.5">
                {shown.map(({ m, i }) => (
                  <MessageRow key={i} m={m} columns={columns} current={i === index} />
                ))}
              </div>
            </div>
            {panel ? (
              <div className="mt-2 rounded-lg border border-neutral-100 dark:border-neutral-800 p-2">
                <div className="mb-1 font-mono text-[9.5px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  {panel.title}
                </div>
                <div className="overflow-x-auto whitespace-pre font-mono text-[10.5px] leading-relaxed text-neutral-700 dark:text-neutral-200">
                  {panel.lines.join('\n')}
                </div>
              </div>
            ) : null}
            <StepNote>{steps[index].note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
