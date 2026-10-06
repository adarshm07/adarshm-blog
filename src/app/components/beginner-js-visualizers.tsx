import { CodeTrace, type TraceStep } from '@/app/components/code-trace'

// Outputs and error messages were checked by running each snippet in Node.

const VAR_CODE = [
  'if (true) {',
  '  var a = 1',
  '  let b = 2',
  '}',
  'console.log(a)',
  'console.log(b)',
  '',
  'for (var i = 0; i < 3; i++) setTimeout(() => log(i))',
  'for (let j = 0; j < 3; j++) setTimeout(() => log(j))',
  '',
  "const user = { name: 'Ada' }",
  "user.name = 'Grace'",
  'user = {}',
]

const varSteps: TraceStep[] = [
  {
    lines: [0, 1, 2, 3],
    panels: [
      {
        title: 'variables',
        rows: [
          { k: 'a (var)', v: '1 · whole function' },
          { k: 'b (let)', v: '2 · this block only' },
        ],
      },
      { title: 'output', rows: [] },
    ],
    note: 'var belongs to the whole function (or the whole script). let and const belong to the nearest { } block. Inside the block both exist.',
  },
  {
    lines: [4],
    panels: [
      { title: 'variables', rows: [{ k: 'a (var)', v: '1' }, { k: 'b (let)', v: 'gone', tone: 'muted' }] },
      { title: 'output', rows: [{ k: '>', v: '1' }] },
    ],
    note: 'After the block, a is still there: var ignores blocks. That surprises people coming from almost any other language.',
  },
  {
    lines: [5],
    error: true,
    panels: [
      { title: 'variables', rows: [{ k: 'a (var)', v: '1' }, { k: 'b (let)', v: 'gone', tone: 'muted' }] },
      { title: 'output', rows: [{ k: '>', v: '1' }, { k: '!', v: 'ReferenceError: b is not defined', tone: 'bad' }] },
    ],
    note: 'b only existed inside the block. Reading it outside is an error — which is what you want: variables stay where they are used.',
  },
  {
    lines: [7],
    panels: [
      { title: 'variables', rows: [{ k: 'i (var)', v: 'one shared i → 3' }] },
      { title: 'output (later)', rows: [{ k: '>', v: '3' }, { k: '>', v: '3' }, { k: '>', v: '3' }] },
    ],
    note: 'The classic bug. var creates one i for the whole loop. The timers run after the loop ends, when that single i is 3 — so all three log 3.',
  },
  {
    lines: [8],
    panels: [
      { title: 'variables', rows: [{ k: 'j (let)', v: 'a new j per loop: 0, 1, 2', tone: 'ok' }] },
      { title: 'output (later)', rows: [{ k: '>', v: '0' }, { k: '>', v: '1' }, { k: '>', v: '2' }] },
    ],
    note: 'let gives each loop iteration its own j. Each timer remembers its own copy, so you get 0, 1, 2 — what you meant.',
  },
  {
    lines: [10, 11],
    panels: [
      { title: 'variables', rows: [{ k: 'user (const)', v: "→ { name: 'Grace' }", tone: 'ok' }] },
      { title: 'output', rows: [] },
    ],
    note: 'const means the variable can\'t be pointed at something else. It does not freeze the object: changing user.name is allowed.',
  },
  {
    lines: [12],
    error: true,
    panels: [
      { title: 'variables', rows: [{ k: 'user (const)', v: "→ { name: 'Grace' }" }] },
      { title: 'output', rows: [{ k: '!', v: 'TypeError: Assignment to constant variable.', tone: 'bad' }] },
    ],
    note: 'Reassigning it is what const forbids. The rule of thumb: use const by default, let when you really need to reassign, and never var in new code.',
  },
]

export function VariableScopeVisualizer() {
  return <CodeTrace code={VAR_CODE} steps={varSteps} interval={2800} />
}

const CALLBACK_CODE = [
  'function greet(name, done) {',
  "  console.log('Hi ' + name)",
  '  done()',
  '}',
  "greet('Ada', () => console.log('greeted'))",
  '',
  "console.log('A')",
  "setTimeout(() => console.log('B'), 1000)",
  "console.log('C')",
]

const out = (...lines: string[]) => ({
  title: 'output',
  rows: lines.map((v) => ({ k: '>', v })),
})

const callbackSteps: TraceStep[] = [
  {
    lines: [0, 1, 2, 3],
    panels: [out(), { title: 'waiting', rows: [] }],
    note: 'A callback is just a function you pass to another function, for it to call later. greet takes a name and a function called done.',
  },
  {
    lines: [4, 1],
    panels: [out('Hi Ada'), { title: 'waiting', rows: [] }],
    note: 'We call greet and pass an arrow function as done. greet prints its greeting…',
  },
  {
    lines: [2],
    panels: [out('Hi Ada', 'greeted'), { title: 'waiting', rows: [] }],
    note: '…then calls done(), which runs the function we handed it. This callback runs right away, during greet — a synchronous callback, like the ones map and forEach take.',
  },
  {
    lines: [6],
    panels: [out('Hi Ada', 'greeted', 'A'), { title: 'waiting', rows: [] }],
    note: 'Now a different kind. First, A is printed.',
  },
  {
    lines: [7],
    panels: [
      out('Hi Ada', 'greeted', 'A'),
      { title: 'waiting', rows: [{ k: 'in 1 s', v: "() => log('B')", tone: 'warn' }] },
    ],
    note: 'setTimeout doesn\'t wait. It hands the callback to the browser\'s timer and returns immediately. The callback is stored, to be called later.',
  },
  {
    lines: [8],
    panels: [
      out('Hi Ada', 'greeted', 'A', 'C'),
      { title: 'waiting', rows: [{ k: 'in 1 s', v: "() => log('B')", tone: 'warn' }] },
    ],
    note: 'So C prints before B, even though the setTimeout line comes first. JavaScript keeps going instead of blocking.',
  },
  {
    lines: [7],
    panels: [out('Hi Ada', 'greeted', 'A', 'C', 'B'), { title: 'waiting', rows: [] }],
    note: 'One second later, the timer fires and the callback finally runs: B. This is an asynchronous callback — the foundation that promises and async/await were later built on.',
  },
]

export function CallbackVisualizer() {
  return <CodeTrace code={CALLBACK_CODE} steps={callbackSteps} interval={2600} />
}

const ARRAY_CODE = [
  'const orders = [5, 12, 8, 20]',
  '',
  'const doubled  = orders.map(n => n * 2)',
  'const big      = orders.filter(n => n > 10)',
  'const total    = orders.reduce((sum, n) => sum + n, 0)',
  'const firstBig = orders.find(n => n > 10)',
]

const arr = (title: string, v: string, tone?: 'ok' | 'warn') => ({ title, rows: [{ k: '', v, tone }] })

const arraySteps: TraceStep[] = [
  {
    lines: [0],
    panels: [arr('orders', '[5, 12, 8, 20]')],
    note: 'Four array methods cover most loops you will ever write. Each takes a callback and calls it once per item.',
  },
  {
    lines: [2],
    panels: [arr('orders', '[5, 12, 8, 20]'), arr('callback', 'n => n * 2'), arr('doubled', '[10, 24, 16, 40]', 'ok')],
    note: 'map transforms every item and returns a new array of the same length. The original is untouched.',
  },
  {
    lines: [3],
    panels: [arr('orders', '[5, 12, 8, 20]'), arr('kept?', '✗  ✓  ✗  ✓'), arr('big', '[12, 20]', 'ok')],
    note: 'filter keeps the items for which the callback returns true. The result can be shorter, never longer.',
  },
  {
    lines: [4],
    panels: [arr('step', 'sum 0 + 5'), arr('sum becomes', '5', 'warn')],
    note: 'reduce boils the array down to one value. It carries an accumulator — sum — starting at the 0 you pass in. First item: 0 + 5.',
  },
  {
    lines: [4],
    panels: [arr('step', 'sum 5 + 12'), arr('sum becomes', '17', 'warn')],
    note: 'Whatever the callback returns becomes sum for the next item: 5 + 12 = 17.',
  },
  {
    lines: [4],
    panels: [arr('step', 'sum 17 + 8 → 25 + 20'), arr('total', '45', 'ok')],
    note: 'Then 25, then 45. After the last item, reduce returns the final accumulator: 45.',
  },
  {
    lines: [5],
    panels: [arr('checks', '5 ✗ → 12 ✓ stop'), arr('firstBig', '12', 'ok')],
    note: 'find returns the first item that matches and stops looking — 20 is never checked. It returns undefined if nothing matches.',
  },
]

export function ArrayMethodsVisualizer() {
  return <CodeTrace code={ARRAY_CODE} steps={arraySteps} interval={2600} />
}
