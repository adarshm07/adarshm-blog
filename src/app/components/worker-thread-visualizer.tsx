'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const SLOTS = 12

// Without a worker the main thread runs the heavy task itself and paints nothing
// for the duration. With a worker it keeps painting every frame.
const BLOCKED_FROM = 2
const BLOCKED_TO = 8

type Cell = 'frame' | 'blocked' | 'compute' | 'idle' | 'post' | 'result'

function mainWithout(i: number): Cell {
  if (i >= BLOCKED_FROM && i < BLOCKED_TO) return 'blocked'
  return 'frame'
}
function mainWith(i: number): Cell {
  if (i === BLOCKED_FROM) return 'post'
  if (i === BLOCKED_TO) return 'result'
  return 'frame'
}
function workerLane(i: number): Cell {
  if (i >= BLOCKED_FROM && i < BLOCKED_TO) return 'compute'
  return 'idle'
}

const STYLE: Record<Cell, string> = {
  frame: 'bg-green-600/70 dark:bg-green-500/70',
  blocked: 'bg-red-500/80',
  compute: 'bg-amber-500/80',
  idle: 'bg-neutral-100 dark:bg-neutral-800',
  post: 'bg-neutral-800 dark:bg-neutral-200',
  result: 'bg-neutral-800 dark:bg-neutral-200',
}

const LABEL: Partial<Record<Cell, string>> = {
  post: '→',
  result: '←',
}

const notes = [
  'Two timelines, 16ms per slot. Green means the browser painted a frame on time; the page feels alive.',
  'The user clicks something that needs a 100ms calculation. On top, the main thread starts doing it itself.',
  'While that task runs, the main thread cannot paint, cannot run a click handler, cannot even animate a spinner — JavaScript is single-threaded and this task owns it. Every one of those red slots is a dropped frame.',
  'Below, the main thread instead posts the job to a worker (the dark cell) and returns to the event loop immediately. The worker computes on its own thread, in its own realm, with no DOM access.',
  'The main thread keeps painting the whole time. Same work, same duration — the difference is which thread pays for it.',
  'When the worker finishes it posts the result back; the message lands as an ordinary task in the main thread queue and the handler runs between frames. The data is copied (structured clone), not shared — which is why huge payloads want transferable objects instead.',
]

function Lane({
  label,
  cellAt,
  upto,
}: {
  label: string
  cellAt: (i: number) => Cell
  upto: number
}) {
  return (
    <div className="mb-3">
      <p className="mb-1 font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
        {label}
      </p>
      <div className="flex gap-0.5">
        {Array.from({ length: SLOTS }, (_, i) => {
          const cell = i < upto ? cellAt(i) : 'idle'
          return (
            <div
              key={i}
              className={[
                'flex h-6 flex-1 items-center justify-center rounded-[3px] font-mono text-[9px] text-neutral-50 dark:text-neutral-900 transition-colors duration-300',
                i < upto ? STYLE[cell] : 'bg-neutral-50 dark:bg-neutral-900',
              ].join(' ')}
            >
              {i < upto ? (LABEL[cell] ?? '') : ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function WorkerThreadVisualizer() {
  return (
    <StepPlayer length={notes.length} interval={1800}>
      {(index) => {
        const upto = [2, 3, 8, 8, 11, SLOTS][index]
        return (
          <>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              everything on the main thread
            </p>
            <Lane label="main thread" cellAt={mainWithout} upto={upto} />

            <p className="mt-4 mb-2 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              heavy work in a worker
            </p>
            <Lane label="main thread" cellAt={mainWith} upto={upto} />
            <Lane label="worker thread" cellAt={workerLane} upto={upto} />

            <p className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
              green = frame painted · red = frame dropped · amber = worker computing · dark = postMessage
            </p>
            <StepNote>{notes[index]}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
