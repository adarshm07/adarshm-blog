'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const LINES = [
  'function* counter() {',
  '  yield 1',
  '  yield 2',
  '  yield 3',
  '}',
]

type Step = {
  line: number // paused/active line index, -1 = not started
  log: string[]
  note: string
}

const steps: Step[] = [
  { line: -1, log: [], note: 'const g = counter() — calling a generator runs NO code. It hands back a paused iterator. Generators are lazy.' },
  { line: 1, log: ['g.next() → { value: 1, done: false }'], note: 'First g.next() runs until the first yield, hands back 1, and freezes right there — local state and all.' },
  { line: 2, log: ['g.next() → { value: 1, done: false }', 'g.next() → { value: 2, done: false }'], note: 'Next g.next() resumes exactly where it paused, runs to the second yield, returns 2, and freezes again.' },
  { line: 3, log: ['g.next() → { value: 1, done: false }', 'g.next() → { value: 2, done: false }', 'g.next() → { value: 3, done: false }'], note: 'Again: resume, run to yield 3, return 3, pause. The function body is being driven one slice at a time.' },
  { line: 4, log: ['g.next() → { value: 1, done: false }', 'g.next() → { value: 2, done: false }', 'g.next() → { value: 3, done: false }', 'g.next() → { value: undefined, done: true }'], note: 'A final g.next() runs off the end. No more yields, so value is undefined and done is true. This pause/resume machinery is exactly what async/await is built on.' },
]

export function GeneratorVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={1800}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                {LINES.map((line, i) => {
                  const isActive = step.line === i
                  return (
                    <div
                      key={i}
                      className={[
                        'rounded px-2 py-0.5 font-mono text-xs transition-colors duration-200',
                        isActive
                          ? 'bg-amber-500 text-white'
                          : 'text-neutral-600 dark:text-neutral-300',
                      ].join(' ')}
                    >
                      {line}
                      {isActive && i >= 1 && i <= 3 ? '  ⏸' : ''}
                    </div>
                  )
                })}
              </div>
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  output
                </div>
                {step.log.length === 0 ? (
                  <div className="font-mono text-xs text-neutral-300 dark:text-neutral-600">
                    (nothing yet)
                  </div>
                ) : (
                  step.log.map((line, i) => (
                    <div
                      key={i}
                      className={[
                        'font-mono text-[11px]',
                        i === step.log.length - 1
                          ? 'text-green-600 dark:text-green-500'
                          : 'text-neutral-500 dark:text-neutral-400',
                      ].join(' ')}
                    >
                      {line}
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
