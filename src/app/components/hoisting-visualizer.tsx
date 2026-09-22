'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const CODE = [
  'console.log(count)',
  'greet()',
  'console.log(name)',
  'var count = 1',
  "let name = 'Ada'",
  "function greet() { console.log('hi') }",
]

type Binding = {
  name: string
  kind: 'var' | 'let' | 'function'
  value: string
  status: 'uninitialized' | 'tdz' | 'ready'
}

type Step = {
  line: number | null
  phase: 'creation' | 'execution'
  bindings: Binding[]
  output?: { text: string; error?: boolean }
  note: string
}

const CREATED: Binding[] = [
  { name: 'count', kind: 'var', value: 'undefined', status: 'uninitialized' },
  { name: 'name', kind: 'let', value: '—', status: 'tdz' },
  { name: 'greet', kind: 'function', value: 'ƒ greet()', status: 'ready' },
]

const steps: Step[] = [
  {
    line: null,
    phase: 'creation',
    bindings: [],
    note: 'Before a single line runs, the engine scans the scope and creates every binding it declares. "Hoisting" is not code moving upwards — it is bindings existing before execution starts.',
  },
  {
    line: null,
    phase: 'creation',
    bindings: CREATED,
    note: 'All three names now exist, but in different states: var count is initialized to undefined, function greet holds the whole function, and let name exists without a value — the temporal dead zone.',
  },
  {
    line: 0,
    phase: 'execution',
    bindings: CREATED,
    output: { text: 'undefined' },
    note: 'Line 1 reads count before its assignment. No error — the binding is there, holding undefined. This is the confusing half of var: it fails quietly.',
  },
  {
    line: 1,
    phase: 'execution',
    bindings: CREATED,
    output: { text: 'hi' },
    note: 'Calling greet() before its declaration works, because a function declaration is fully initialized during the creation phase. This is why "call it above, define it below" is legal.',
  },
  {
    line: 2,
    phase: 'execution',
    bindings: CREATED,
    output: {
      text: "ReferenceError: Cannot access 'name' before initialization",
      error: true,
    },
    note: 'Reading name throws. Note the message: not "name is not defined" — the binding exists, it is just unreachable until its let statement runs. That is the TDZ, and it turns a silent undefined into a loud error.',
  },
  {
    line: 3,
    phase: 'execution',
    bindings: [
      { name: 'count', kind: 'var', value: '1', status: 'ready' },
      { name: 'name', kind: 'let', value: '—', status: 'tdz' },
      { name: 'greet', kind: 'function', value: 'ƒ greet()', status: 'ready' },
    ],
    note: 'var count = 1 finally runs. Only the assignment happened here; the declaration happened before line 1.',
  },
  {
    line: 4,
    phase: 'execution',
    bindings: [
      { name: 'count', kind: 'var', value: '1', status: 'ready' },
      { name: 'name', kind: 'let', value: "'Ada'", status: 'ready' },
      { name: 'greet', kind: 'function', value: 'ƒ greet()', status: 'ready' },
    ],
    note: 'The let statement initializes name and the TDZ ends. From this line down it behaves like any ordinary variable — the dead zone is a region of code, not a period of time.',
  },
]

const STATUS_LABEL: Record<Binding['status'], string> = {
  uninitialized: 'hoisted',
  tdz: 'TDZ',
  ready: 'ready',
}

export function HoistingVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2000}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
              <div className="flex-1">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  {step.phase === 'creation' ? 'creation phase' : 'execution phase'}
                </p>
                <div className="overflow-hidden rounded-lg bg-neutral-50 dark:bg-neutral-900">
                  {CODE.map((line, i) => (
                    <div
                      key={i}
                      className={[
                        'flex items-center gap-2 px-2 py-1 font-mono text-[11px] transition-colors duration-300',
                        step.line === i
                          ? 'bg-green-600/15 text-neutral-900 dark:text-neutral-50'
                          : 'text-neutral-500 dark:text-neutral-400',
                      ].join(' ')}
                    >
                      <span className="w-3 shrink-0 text-right text-[9px] text-neutral-300 dark:text-neutral-600">
                        {i + 1}
                      </span>
                      <span className="truncate">{line}</span>
                    </div>
                  ))}
                </div>
                <div
                  className={[
                    'mt-2 rounded-md px-2 py-1 font-mono text-[10px] min-h-6',
                    step.output?.error
                      ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300',
                  ].join(' ')}
                >
                  {step.output?.text ?? ' '}
                </div>
              </div>

              <div className="sm:w-52">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  scope bindings
                </p>
                {step.bindings.length === 0 ? (
                  <p className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                    scanning…
                  </p>
                ) : (
                  <div className="space-y-1">
                    {step.bindings.map((b) => (
                      <div
                        key={b.name}
                        className={[
                          'rounded-md border px-2 py-1 transition-colors duration-300',
                          b.status === 'tdz'
                            ? 'border-red-500/40 bg-red-500/5'
                            : b.status === 'uninitialized'
                              ? 'border-amber-500/40 bg-amber-500/5'
                              : 'border-green-600/40 dark:border-green-500/40 bg-green-600/5',
                        ].join(' ')}
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-mono text-[11px] text-neutral-800 dark:text-neutral-100">
                            {b.name}
                          </span>
                          <span className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
                            {b.kind}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
                            {b.value}
                          </span>
                          <span
                            className={[
                              'font-mono text-[9px]',
                              b.status === 'tdz'
                                ? 'text-red-500'
                                : b.status === 'uninitialized'
                                  ? 'text-amber-500'
                                  : 'text-green-600 dark:text-green-500',
                            ].join(' ')}
                          >
                            {STATUS_LABEL[b.status]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
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
