'use client'

import { useEffect, useState } from 'react'

type Step = {
  stack: string[]
  api: string[]
  micro: string[]
  macro: string[]
  log: string[]
  note: string
}

type Scenario = 'timeout-vs-promise' | 'async-await'

const timeoutVsPromise: Step[] = [
  {
    stack: [],
    api: [],
    micro: [],
    macro: [],
    log: [],
    note: 'Press Play (or step with Next) to watch the script run.',
  },
  {
    stack: ['script'],
    api: [],
    micro: [],
    macro: [],
    log: [],
    note: 'The whole script starts running as one task — a frame goes on the call stack.',
  },
  {
    stack: ['script', 'console.log("start")'],
    api: [],
    micro: [],
    macro: [],
    log: ['start'],
    note: 'Synchronous code runs immediately, right on the stack.',
  },
  {
    stack: ['script', 'setTimeout(cb, 0)'],
    api: ['timer · 0 ms'],
    micro: [],
    macro: [],
    log: ['start'],
    note: 'setTimeout hands its callback to the browser timer. It does NOT run now — even at 0 ms.',
  },
  {
    stack: ['script', 'Promise.then(cb)'],
    api: ['timer · 0 ms'],
    micro: ['promise cb'],
    macro: [],
    log: ['start'],
    note: 'The promise is already resolved, so its .then callback goes straight to the microtask queue.',
  },
  {
    stack: ['script', 'console.log("end")'],
    api: ['timer · 0 ms'],
    micro: ['promise cb'],
    macro: [],
    log: ['start', 'end'],
    note: 'The rest of the synchronous code keeps running while both callbacks wait.',
  },
  {
    stack: ['script'],
    api: [],
    micro: ['promise cb'],
    macro: ['timeout cb'],
    log: ['start', 'end'],
    note: 'The 0 ms timer has expired — its callback moves to the task queue and waits there.',
  },
  {
    stack: [],
    api: [],
    micro: ['promise cb'],
    macro: ['timeout cb'],
    log: ['start', 'end'],
    note: 'The script finishes and the stack is empty. Now the event loop takes over.',
  },
  {
    stack: ['promise cb'],
    api: [],
    micro: [],
    macro: ['timeout cb'],
    log: ['start', 'end'],
    note: 'Microtasks first: the event loop drains the ENTIRE microtask queue before touching the task queue.',
  },
  {
    stack: ['promise cb', 'console.log("promise")'],
    api: [],
    micro: [],
    macro: ['timeout cb'],
    log: ['start', 'end', 'promise'],
    note: 'The promise callback runs to completion.',
  },
  {
    stack: [],
    api: [],
    micro: [],
    macro: ['timeout cb'],
    log: ['start', 'end', 'promise'],
    note: 'Stack empty, microtask queue empty — only now is the task queue up.',
  },
  {
    stack: ['timeout cb'],
    api: [],
    micro: [],
    macro: [],
    log: ['start', 'end', 'promise'],
    note: 'The event loop finally picks up the setTimeout callback.',
  },
  {
    stack: ['timeout cb', 'console.log("timeout")'],
    api: [],
    micro: [],
    macro: [],
    log: ['start', 'end', 'promise', 'timeout'],
    note: 'It logs last, even though its timer was 0 ms.',
  },
  {
    stack: [],
    api: [],
    micro: [],
    macro: [],
    log: ['start', 'end', 'promise', 'timeout'],
    note: 'Done. Final order: start, end, promise, timeout.',
  },
]

const asyncAwait: Step[] = [
  {
    stack: [],
    api: [],
    micro: [],
    macro: [],
    log: [],
    note: 'Press Play (or step with Next) to watch the script run.',
  },
  {
    stack: ['script'],
    api: [],
    micro: [],
    macro: [],
    log: [],
    note: 'The script runs top to bottom as one task.',
  },
  {
    stack: ['script', 'console.log("A")'],
    api: [],
    micro: [],
    macro: [],
    log: ['A'],
    note: 'Plain synchronous logging.',
  },
  {
    stack: ['script', 'loadUser()'],
    api: [],
    micro: [],
    macro: [],
    log: ['A'],
    note: 'Calling an async function pushes it onto the stack like any normal function.',
  },
  {
    stack: ['script', 'loadUser()', 'console.log("loading")'],
    api: [],
    micro: [],
    macro: [],
    log: ['A', 'loading'],
    note: 'An async function runs synchronously until it hits the first await.',
  },
  {
    stack: ['script'],
    api: [],
    micro: ['resume loadUser'],
    macro: [],
    log: ['A', 'loading'],
    note: 'await suspends loadUser and schedules its continuation as a microtask. Control returns to the caller.',
  },
  {
    stack: ['script', 'console.log("B")'],
    api: [],
    micro: ['resume loadUser'],
    macro: [],
    log: ['A', 'loading', 'B'],
    note: 'The caller keeps going — "B" logs before the await line finishes.',
  },
  {
    stack: [],
    api: [],
    micro: ['resume loadUser'],
    macro: [],
    log: ['A', 'loading', 'B'],
    note: 'The script finishes and the stack empties.',
  },
  {
    stack: ['loadUser (resumed)'],
    api: [],
    micro: [],
    macro: [],
    log: ['A', 'loading', 'B'],
    note: 'The event loop drains the microtask queue: loadUser resumes right after the await.',
  },
  {
    stack: ['loadUser (resumed)', 'console.log("hello", user)'],
    api: [],
    micro: [],
    macro: [],
    log: ['A', 'loading', 'B', 'hello Ada'],
    note: 'The rest of the function body runs with the awaited value.',
  },
  {
    stack: [],
    api: [],
    micro: [],
    macro: [],
    log: ['A', 'loading', 'B', 'hello Ada'],
    note: 'Done. Final order: A, loading, B, hello Ada — await is promise.then in nicer clothes.',
  },
]

const scenarios: Record<Scenario, Step[]> = {
  'timeout-vs-promise': timeoutVsPromise,
  'async-await': asyncAwait,
}

function Panel({
  title,
  items,
  highlightFirst = false,
}: {
  title: string
  items: string[]
  highlightFirst?: boolean
}) {
  return (
    <div className="rounded-lg border border-neutral-100 dark:border-neutral-800 p-2 min-h-28">
      <div className="text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500 mb-1.5">
        {title}
      </div>
      <div className="flex flex-col gap-1">
        {items.length === 0 ? (
          <span className="text-[11px] text-neutral-300 dark:text-neutral-600">
            (empty)
          </span>
        ) : (
          items.map((item, i) => {
            const isHighlight = highlightFirst && i === 0
            return (
              <div
                key={`${item}-${i}`}
                className={[
                  'rounded px-2 py-1 font-mono text-[11px] leading-tight transition-colors duration-200',
                  isHighlight
                    ? 'bg-amber-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
                ].join(' ')}
              >
                {item}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export function EventLoopVisualizer({ scenario }: { scenario: Scenario }) {
  const steps = scenarios[scenario]
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const step = steps[index]

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setIndex((i) => Math.min(i + 1, steps.length - 1))
    }, 1600)
    return () => clearInterval(id)
  }, [playing, steps])

  useEffect(() => {
    if (index >= steps.length - 1) setPlaying(false)
  }, [index, steps])

  return (
    <div className="not-prose my-6 rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Panel
          title="Call stack"
          items={[...step.stack].reverse()}
          highlightFirst
        />
        <Panel title="Web APIs" items={step.api} />
        <Panel title="Microtask queue" items={step.micro} />
        <Panel title="Task queue" items={step.macro} />
      </div>

      <div className="mt-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-2 font-mono text-[11px] min-h-16">
        <div className="text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500 mb-1.5 font-sans">
          Console
        </div>
        {step.log.map((line, i) => (
          <div key={i} className="text-green-600 dark:text-green-500">
            › {line}
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-400 min-h-8">
        {step.note}
      </p>

      <div className="mt-3 flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          {playing ? 'Pause' : index >= steps.length - 1 ? 'Replay' : 'Play'}
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false)
            setIndex((i) => Math.max(i - 1, 0))
          }}
          className="px-3 py-1.5 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false)
            setIndex((i) => Math.min(i + 1, steps.length - 1))
          }}
          className="px-3 py-1.5 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          Next
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false)
            setIndex(0)
          }}
          className="px-3 py-1.5 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          Reset
        </button>
        <span className="ml-auto text-neutral-400 dark:text-neutral-500 tabular-nums">
          {index} / {steps.length - 1}
        </span>
      </div>
    </div>
  )
}
