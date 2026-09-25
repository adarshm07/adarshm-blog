'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type TaskState = 'idle' | 'running' | 'aborted' | 'done'

type Task = { label: string; state: TaskState }

type Step = {
  signal: 'open' | 'aborted'
  tasks: Task[]
  cleanup: string[]
  note: string
}

const steps: Step[] = [
  {
    signal: 'open',
    tasks: [
      { label: 'fetch /search?q=re', state: 'running' },
      { label: 'fetch /suggest', state: 'running' },
      { label: 'timeout 5s', state: 'running' },
    ],
    cleanup: [],
    note: 'One AbortController produces one signal, and any number of operations can listen to it. Here three async operations share a single signal.',
  },
  {
    signal: 'open',
    tasks: [
      { label: 'fetch /search?q=re', state: 'running' },
      { label: 'fetch /suggest', state: 'done' },
      { label: 'timeout 5s', state: 'running' },
    ],
    cleanup: [],
    note: 'One of them finishes normally. Nothing special happens — a signal only ever travels in one direction, from controller to listeners.',
  },
  {
    signal: 'aborted',
    tasks: [
      { label: 'fetch /search?q=re', state: 'aborted' },
      { label: 'fetch /suggest', state: 'done' },
      { label: 'timeout 5s', state: 'aborted' },
    ],
    cleanup: ['abort event fired'],
    note: 'The user types another character, so the old request is cancelled: controller.abort(). Every pending listener is notified at once — the in-flight fetch rejects with an AbortError and the timer is cleared.',
  },
  {
    signal: 'aborted',
    tasks: [
      { label: 'fetch /search?q=re', state: 'aborted' },
      { label: 'fetch /suggest', state: 'done' },
      { label: 'timeout 5s', state: 'aborted' },
    ],
    cleanup: ['abort event fired', 'event listeners removed', 'stream reader released'],
    note: 'Anything registered with { signal } is torn down automatically: addEventListener, ReadableStream reads, even event handlers you attached yourself. This is the part that stops leaks in long-lived components.',
  },
  {
    signal: 'aborted',
    tasks: [
      { label: 'fetch /search?q=re', state: 'aborted' },
      { label: 'fetch /suggest', state: 'done' },
      { label: 'timeout 5s', state: 'aborted' },
      { label: 'fetch /search?q=red', state: 'aborted' },
    ],
    cleanup: ['abort event fired', 'event listeners removed', 'stream reader released'],
    note: 'A trap: a controller is single-use. Passing an already-aborted signal to a new fetch rejects immediately, which is why the next request needs a new AbortController, not the old one reset.',
  },
  {
    signal: 'open',
    tasks: [
      { label: 'fetch /search?q=red', state: 'running' },
      { label: 'timeout 5s', state: 'running' },
    ],
    cleanup: [],
    note: 'A fresh controller for the new keystroke. The pattern is: keep a reference, abort it at the top of the next call, replace it. Three lines, and stale responses can never overwrite fresh ones.',
  },
]

const STATE_STYLE: Record<TaskState, string> = {
  idle: 'border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500',
  running: 'border-green-600/50 dark:border-green-500/50 bg-green-600/5 text-green-700 dark:text-green-400',
  aborted: 'border-red-500/50 bg-red-500/5 text-red-600 dark:text-red-400 line-through',
  done: 'border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400',
}

export function CancellationVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2200}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="mb-3 flex items-center gap-2">
              <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                controller.signal
              </span>
              <span
                className={[
                  'rounded-md px-2 py-1 font-mono text-[10px] transition-colors duration-300',
                  step.signal === 'aborted'
                    ? 'bg-red-500 text-white'
                    : 'bg-green-600 dark:bg-green-500 text-white',
                ].join(' ')}
              >
                {step.signal === 'aborted' ? 'aborted: true' : 'aborted: false'}
              </span>
            </div>

            <div className="space-y-1">
              {step.tasks.map((task) => (
                <div
                  key={task.label}
                  className={[
                    'flex items-center justify-between rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-colors duration-300',
                    STATE_STYLE[task.state],
                  ].join(' ')}
                >
                  <span>{task.label}</span>
                  <span className="text-[9px] no-underline">{task.state}</span>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <p className="mb-1 font-mono text-[9px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                cleanup performed
              </p>
              {step.cleanup.length === 0 ? (
                <p className="font-mono text-[10px] text-neutral-300 dark:text-neutral-600">—</p>
              ) : (
                step.cleanup.map((c) => (
                  <p
                    key={c}
                    className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400"
                  >
                    ✓ {c}
                  </p>
                ))
              )}
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
