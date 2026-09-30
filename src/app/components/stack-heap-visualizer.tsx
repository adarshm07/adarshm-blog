'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const CODE = [
  'function makeUser() {',
  '  const age = 36',
  "  const user = { name: 'Ada', tags: ['dev'] }",
  '  return user',
  '}',
  'let u = makeUser()',
  'u = null',
]

type Slot = { name: string; value: string; ref?: boolean }
type Frame = { name: string; slots: Slot[] }
type HeapObject = { id: string; lines: string[]; live: boolean }

type Step = {
  line: number | null
  frames: Frame[] // bottom first
  heap: HeapObject[]
  note: string
}

const USER: HeapObject = { id: '#1', lines: ["name: 'Ada'", 'tags: → #2'], live: true }
const TAGS: HeapObject = { id: '#2', lines: ["0: 'dev'"], live: true }

// A simplified model: real engines also keep strings and closures on the
// heap, and can keep small integers inside objects.
const steps: Step[] = [
  {
    line: 5,
    frames: [{ name: 'global', slots: [{ name: 'u', value: '<uninitialized>' }] }],
    heap: [],
    note: 'Memory has two main areas. The stack holds one frame per running function, with its local variables. The heap is a big pool where objects live for as long as something points to them.',
  },
  {
    line: 1,
    frames: [
      { name: 'global', slots: [{ name: 'u', value: '<uninitialized>' }] },
      { name: 'makeUser()', slots: [{ name: 'age', value: '36' }] },
    ],
    heap: [],
    note: 'Calling makeUser pushes a frame. A small primitive like 36 is stored right in the frame — the slot holds the value itself.',
  },
  {
    line: 2,
    frames: [
      { name: 'global', slots: [{ name: 'u', value: '<uninitialized>' }] },
      {
        name: 'makeUser()',
        slots: [
          { name: 'age', value: '36' },
          { name: 'user', value: '→ #1', ref: true },
        ],
      },
    ],
    heap: [USER, TAGS],
    note: 'An object literal is allocated on the heap. The variable user only holds a reference — an address — to it. The array inside is a separate heap object, referenced from the first.',
  },
  {
    line: 5,
    frames: [{ name: 'global', slots: [{ name: 'u', value: '→ #1', ref: true }] }],
    heap: [USER, TAGS],
    note: 'makeUser returns, and its whole frame is popped: age and user are gone instantly, with no cleanup needed. But the reference was copied into u, so the objects on the heap stay alive.',
  },
  {
    line: 6,
    frames: [{ name: 'global', slots: [{ name: 'u', value: 'null' }] }],
    heap: [
      { ...USER, live: false },
      { ...TAGS, live: false },
    ],
    note: 'Set u = null and nothing points to #1 any more — nor to #2 through it. The stack frees itself when functions return; the heap needs a garbage collector to find objects nobody can reach.',
  },
]

export function StackHeapVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2800}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="overflow-x-auto rounded-lg bg-neutral-50 dark:bg-neutral-900 p-2">
              {CODE.map((line, i) => (
                <div
                  key={i}
                  className={[
                    'whitespace-pre rounded px-1.5 font-mono text-[10.5px] leading-relaxed transition-colors duration-300',
                    step.line === i
                      ? 'bg-amber-500/20 text-neutral-900 dark:text-neutral-50'
                      : 'text-neutral-500 dark:text-neutral-400',
                  ].join(' ')}
                >
                  {line}
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 font-mono text-[10px]">
              <div>
                <div className="mb-1 uppercase tracking-wide text-neutral-400 dark:text-neutral-500">stack</div>
                <div className="flex min-h-32 flex-col-reverse justify-start gap-1">
                  {step.frames.map((frame, i) => (
                    <div
                      key={frame.name}
                      className={[
                        'rounded-lg border p-1.5 transition-colors duration-300',
                        i === step.frames.length - 1
                          ? 'border-amber-500'
                          : 'border-neutral-200 dark:border-neutral-700',
                      ].join(' ')}
                    >
                      <div className="mb-0.5 text-neutral-400 dark:text-neutral-500">{frame.name}</div>
                      {frame.slots.map((slot) => (
                        <div key={slot.name} className="flex justify-between gap-2 text-neutral-700 dark:text-neutral-200">
                          <span>{slot.name}</span>
                          <span className={slot.ref ? 'text-green-700 dark:text-green-400' : ''}>{slot.value}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 uppercase tracking-wide text-neutral-400 dark:text-neutral-500">heap</div>
                <div className="flex min-h-32 flex-col gap-1">
                  {step.heap.length === 0 ? (
                    <div className="text-neutral-300 dark:text-neutral-600">empty</div>
                  ) : (
                    step.heap.map((obj) => (
                      <div
                        key={obj.id}
                        className={[
                          'rounded-lg border p-1.5 transition-colors duration-300',
                          obj.live
                            ? 'border-green-600/60 dark:border-green-500/60 text-neutral-700 dark:text-neutral-200'
                            : 'border-dashed border-red-400 text-neutral-400 dark:text-neutral-500',
                        ].join(' ')}
                      >
                        <div className="mb-0.5 text-neutral-400 dark:text-neutral-500">
                          {obj.id} {obj.live ? '' : '· unreachable'}
                        </div>
                        {obj.lines.map((l) => (
                          <div key={l}>{l}</div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
