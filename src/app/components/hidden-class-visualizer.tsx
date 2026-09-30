'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const CODE = [
  'function Point(x, y) { this.x = x; this.y = y }',
  'const p = new Point(1, 2)',
  'const q = new Point(3, 4)',
  'function getX(o) { return o.x }',
  'getX(p); getX(q)',
  'const r = { y: 5, x: 6 }',
  'getX(r)',
]

type Shape = { id: string; layout: string; from?: string }

type Step = {
  line: number | null
  shapes: Shape[]
  objects: { name: string; shape: string; values: string }[]
  cache: string[]
  cacheState: 'empty' | 'monomorphic' | 'polymorphic'
  hot?: string // shape id to highlight
  note: string
}

const S0: Shape = { id: 'S0', layout: '{ }' }
const S1: Shape = { id: 'S1', layout: '{ x @0 }', from: 'S0 + x' }
const S2: Shape = { id: 'S2', layout: '{ x @0, y @1 }', from: 'S1 + y' }
const S3: Shape = { id: 'S3', layout: '{ y @0 }', from: 'S0 + y' }
const S4: Shape = { id: 'S4', layout: '{ y @0, x @1 }', from: 'S3 + x' }

// V8 calls shapes "maps" or hidden classes; other engines use "shapes" or
// "structures". The idea is the same.
const steps: Step[] = [
  {
    line: 0,
    shapes: [S0],
    objects: [],
    cache: [],
    cacheState: 'empty',
    note: 'Objects look like dictionaries, but looking a name up in a dictionary on every property access would be slow. So the engine gives each object a hidden "shape" describing its layout: which properties it has, and at which slot.',
  },
  {
    line: 1,
    shapes: [S0, S1, S2],
    objects: [{ name: 'p', shape: 'S2', values: '[1, 2]' }],
    cache: [],
    cacheState: 'empty',
    hot: 'S2',
    note: 'new Point starts from the empty shape. Adding x moves it to S1 (x in slot 0), adding y moves it to S2 (y in slot 1). The object itself only stores the values; the shape stores the names.',
  },
  {
    line: 2,
    shapes: [S0, S1, S2],
    objects: [
      { name: 'p', shape: 'S2', values: '[1, 2]' },
      { name: 'q', shape: 'S2', values: '[3, 4]' },
    ],
    cache: [],
    cacheState: 'empty',
    hot: 'S2',
    note: 'q gets its properties added in the same order, so it follows the same transitions and ends up sharing S2. Thousands of Points can share one shape.',
  },
  {
    line: 4,
    shapes: [S0, S1, S2],
    objects: [
      { name: 'p', shape: 'S2', values: '[1, 2]' },
      { name: 'q', shape: 'S2', values: '[3, 4]' },
    ],
    cache: ['S2 → x is slot 0'],
    cacheState: 'monomorphic',
    hot: 'S2',
    note: 'The first time getX runs, o.x is looked up the slow way. The result is remembered at that exact spot in the code — an inline cache: "for shape S2, x is in slot 0". For q the shape matches, so reading x is just one comparison and a load.',
  },
  {
    line: 5,
    shapes: [S0, S1, S2, S3, S4],
    objects: [
      { name: 'p', shape: 'S2', values: '[1, 2]' },
      { name: 'q', shape: 'S2', values: '[3, 4]' },
      { name: 'r', shape: 'S4', values: '[5, 6]' },
    ],
    cache: ['S2 → x is slot 0'],
    cacheState: 'monomorphic',
    hot: 'S4',
    note: 'r has the same properties, but added in a different order: y first. That is a different path through the transitions, so it gets a different shape, S4, where x is in slot 1.',
  },
  {
    line: 6,
    shapes: [S0, S1, S2, S3, S4],
    objects: [
      { name: 'p', shape: 'S2', values: '[1, 2]' },
      { name: 'q', shape: 'S2', values: '[3, 4]' },
      { name: 'r', shape: 'S4', values: '[5, 6]' },
    ],
    cache: ['S2 → x is slot 0', 'S4 → x is slot 1'],
    cacheState: 'polymorphic',
    hot: 'S4',
    note: 'getX(r) misses the cache, does a slow lookup, and adds a second entry. The cache is now polymorphic: still fast, but it has to check more shapes. Past a handful of shapes it gives up (megamorphic) and every access is slow. Create objects the same way, in the same order, and this stays fast.',
  },
]

export function HiddenClassVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={3200}>
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
                <div className="mb-1 uppercase tracking-wide text-neutral-400 dark:text-neutral-500">hidden shapes</div>
                <div className="space-y-1">
                  {step.shapes.map((s) => (
                    <div
                      key={s.id}
                      className={[
                        'rounded-lg border px-1.5 py-1 transition-colors duration-300',
                        step.hot === s.id
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-neutral-200 dark:border-neutral-700',
                      ].join(' ')}
                    >
                      <div className="text-neutral-700 dark:text-neutral-200">
                        {s.id} <span className="text-neutral-500 dark:text-neutral-400">{s.layout}</span>
                      </div>
                      {s.from ? <div className="text-[9px] text-neutral-400 dark:text-neutral-500">{s.from}</div> : null}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 uppercase tracking-wide text-neutral-400 dark:text-neutral-500">objects</div>
                  {step.objects.length === 0 ? (
                    <div className="text-neutral-300 dark:text-neutral-600">none yet</div>
                  ) : (
                    step.objects.map((o) => (
                      <div key={o.name} className="text-neutral-700 dark:text-neutral-200">
                        {o.name} → {o.shape} · {o.values}
                      </div>
                    ))
                  )}
                </div>
                <div>
                  <div className="mb-1 uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    getX cache · {step.cacheState}
                  </div>
                  {step.cache.length === 0 ? (
                    <div className="text-neutral-300 dark:text-neutral-600">empty</div>
                  ) : (
                    step.cache.map((c) => (
                      <div
                        key={c}
                        className={
                          step.cacheState === 'polymorphic'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-green-700 dark:text-green-400'
                        }
                      >
                        {c}
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
