import { CodeTrace, type TraceStep } from '@/app/components/code-trace'

// Every type and error message below was checked by compiling the snippet
// with tsc (strict mode); error text is quoted from the compiler.

const ERASURE_CODE = [
  'function total(prices: number[]): number {',
  '  return prices.reduce((sum, p) => sum + p, 0)',
  '}',
  '',
  'total([4, 6])',
  "total(['4', 6])",
]

const erasureSteps: TraceStep[] = [
  {
    panels: [
      { title: 'type checker', rows: [] },
      { title: 'emitted JavaScript', rows: [] },
    ],
    note: 'TypeScript is JavaScript plus type annotations. The annotations are read by one program — the type checker — before your code ever runs.',
  },
  {
    lines: [0],
    panels: [
      {
        title: 'type checker',
        rows: [
          { k: 'prices', v: 'number[]' },
          { k: 'returns', v: 'number' },
        ],
      },
      { title: 'emitted JavaScript', rows: [] },
    ],
    note: 'The signature is a promise the checker will hold every caller to: total takes an array of numbers and gives back a number.',
  },
  {
    lines: [4],
    panels: [
      { title: 'type checker', rows: [{ k: 'total([4, 6])', v: '✓ ok', tone: 'ok' }] },
      { title: 'emitted JavaScript', rows: [] },
    ],
    note: 'This call matches, so there is nothing to report.',
  },
  {
    lines: [5],
    error: true,
    panels: [
      {
        title: 'type checker',
        rows: [
          { k: "'4'", v: "Type 'string' is not assignable to type 'number'.", tone: 'bad' },
        ],
      },
      { title: 'emitted JavaScript', rows: [] },
    ],
    note: 'This one would quietly produce "046" at runtime — string plus number concatenates. TypeScript catches it in your editor, before the code is run, shipped, or seen by a user.',
  },
  {
    lines: [0, 1, 2],
    panels: [
      { title: 'type checker', rows: [{ k: 'errors', v: '1', tone: 'bad' }] },
      {
        title: 'emitted JavaScript',
        rows: [
          { k: '1', v: 'function total(prices) {' },
          { k: '2', v: '  return prices.reduce(…)' },
          { k: '3', v: '}' },
        ],
      },
    ],
    note: 'Then the compiler strips every annotation and emits plain JavaScript. No types survive to runtime: the browser never sees number[]. Types are a design-time safety net, not a runtime check.',
  },
]

export function TypeErasureVisualizer() {
  return <CodeTrace code={ERASURE_CODE} steps={erasureSteps} />
}

const NARROW_CODE = [
  'function format(value: string | number | null) {',
  "  if (value === null) return '—'",
  "  if (typeof value === 'number') {",
  '    return value.toFixed(2)',
  '  }',
  '  return value.toUpperCase()',
  '}',
]

const typeHere = (v: string, tone?: 'ok' | 'warn' | 'bad') => ({
  title: 'type of value here',
  rows: [{ k: 'value', v, tone }],
})

const narrowSteps: TraceStep[] = [
  {
    lines: [0],
    panels: [typeHere('string | number | null')],
    note: 'value could be any of three types. A union type means "one of these, and you have to find out which before using it".',
  },
  {
    lines: [0],
    error: true,
    panels: [
      {
        title: 'if you called value.toUpperCase() here',
        rows: [
          { k: 'error', v: "'value' is possibly 'null'.", tone: 'bad' },
          { k: 'error', v: "Property 'toUpperCase' does not exist on type 'string | number'.", tone: 'bad' },
        ],
      },
    ],
    note: 'Using a string method straight away is rejected: it would crash for null and for numbers. TypeScript only allows what is valid for every member of the union.',
  },
  {
    lines: [1],
    panels: [typeHere('null')],
    note: 'Inside the if, the checker knows value === null. It follows your control flow — this is called narrowing.',
  },
  {
    lines: [2],
    panels: [typeHere('string | number')],
    note: 'Because that branch returned, null is ruled out on every line after it. One type down.',
  },
  {
    lines: [3],
    panels: [typeHere('number', 'ok')],
    note: 'A typeof check narrows again: inside this block value is a number, so .toFixed is allowed.',
  },
  {
    lines: [5],
    panels: [typeHere('string', 'ok')],
    note: 'Both other cases have returned, so only string is left — and .toUpperCase() is now fine. No casts needed: ordinary checks you would write anyway are what convince the compiler.',
  },
]

export function NarrowingVisualizer() {
  return <CodeTrace code={NARROW_CODE} steps={narrowSteps} />
}

const GENERIC_CODE = [
  'function first<T>(items: T[]): T | undefined {',
  '  return items[0]',
  '}',
  '',
  'const n = first([1, 2, 3])',
  "const s = first(['a', 'b'])",
  'const u = first([{ id: 1 }])',
  '',
  'function longest<T extends { length: number }>(a: T, b: T): T {',
  '  return a.length >= b.length ? a : b',
  '}',
  'longest([1], [1, 2])',
  'longest(10, 20)',
]

const generic = (t: string, result: string, tone?: 'ok' | 'bad') => [
  { title: 'T is', rows: [{ k: 'T', v: t }] },
  { title: 'result', rows: [{ k: 'type', v: result, tone }] },
]

const genericSteps: TraceStep[] = [
  {
    lines: [0],
    panels: generic('(decided per call)', 'T | undefined'),
    note: 'T is a type parameter — a placeholder for a type, the way a function parameter is a placeholder for a value. first works for an array of anything, and still knows what it returns.',
  },
  {
    lines: [4],
    panels: generic('number', 'number | undefined', 'ok'),
    note: 'At each call, TypeScript infers T from the argument. Pass numbers, and T is number — so n is number | undefined, not "any".',
  },
  {
    lines: [5],
    panels: generic('string', 'string | undefined', 'ok'),
    note: 'Same function, strings in, strings out.',
  },
  {
    lines: [6],
    panels: generic('{ id: number }', '{ id: number } | undefined', 'ok'),
    note: 'Even object shapes flow through: u.id is known to be a number. Without generics you would have to choose between one function per type or losing the type entirely.',
  },
  {
    lines: [8, 11],
    panels: generic('number[]', 'number[]', 'ok'),
    note: 'extends adds a constraint: T can be anything that has a length. Arrays qualify, so this call is fine and returns number[].',
  },
  {
    lines: [12],
    error: true,
    panels: [
      { title: 'T is', rows: [{ k: 'T', v: 'number ✗', tone: 'bad' }] },
      {
        title: 'error',
        rows: [
          {
            k: '10',
            v: "Argument of type 'number' is not assignable to parameter of type '{ length: number; }'.",
            tone: 'bad',
          },
        ],
      },
    ],
    note: 'Numbers have no length, so the constraint rejects them. Generics give you "works for any type" and "only for types that make sense" in one declaration.',
  },
]

export function GenericsVisualizer() {
  return <CodeTrace code={GENERIC_CODE} steps={genericSteps} interval={2800} />
}

const UNION_CODE = [
  'type Shape =',
  "  | { kind: 'circle'; radius: number }",
  "  | { kind: 'square'; side: number }",
  "  | { kind: 'triangle'; base: number; height: number }",
  '',
  'function area(s: Shape): number {',
  '  switch (s.kind) {',
  "    case 'circle': return Math.PI * s.radius ** 2",
  "    case 'square': return s.side ** 2",
  '    default:       return assertNever(s)',
  '  }',
  '}',
]

const sIs = (v: string, tone?: 'ok' | 'bad') => ({ title: 's is', rows: [{ k: 's', v, tone }] })

const unionSteps: TraceStep[] = [
  {
    lines: [0, 1, 2],
    panels: [sIs("circle | square")],
    note: 'A discriminated union: every member has the same property — kind — holding a different literal value. That one field tells you which shape you have.',
  },
  {
    lines: [6],
    panels: [sIs("{ kind: 'circle' … } | { kind: 'square' … }")],
    note: 'Before the switch, s could be either. s.radius would be an error here, because squares do not have one.',
  },
  {
    lines: [7],
    panels: [sIs("{ kind: 'circle'; radius: number }", 'ok')],
    note: "In case 'circle', TypeScript narrows s to the circle member, so s.radius is allowed — and typo-proof.",
  },
  {
    lines: [8],
    panels: [sIs("{ kind: 'square'; side: number }", 'ok')],
    note: "In case 'square', s is a square.",
  },
  {
    lines: [9],
    panels: [sIs('never', 'ok')],
    note: 'Every possibility is handled, so in default s has the type never: this line cannot be reached. assertNever(x: never) accepts only that.',
  },
  {
    lines: [3, 9],
    error: true,
    panels: [
      sIs("{ kind: 'triangle'; base: number; height: number }", 'bad'),
      {
        title: 'error at assertNever(s)',
        rows: [{ k: 'TS2345', v: "… is not assignable to parameter of type 'never'.", tone: 'bad' }],
      },
    ],
    note: 'Months later someone adds triangle to the union. Now a triangle can reach default, and the compiler points straight at every switch that forgot it. That exhaustiveness check is why this pattern is everywhere in TypeScript code.',
  },
]

export function DiscriminatedUnionVisualizer() {
  return <CodeTrace code={UNION_CODE} steps={unionSteps} interval={2800} />
}

const MAPPED_CODE = [
  'type User = { id: number; name: string; email: string }',
  '',
  'type Partial<T> = { [K in keyof T]?: T[K] }   // built in',
  '',
  'type UserPatch   = Partial<User>',
  "type PublicUser  = Omit<User, 'email'>",
  "type UserPreview = Pick<User, 'id' | 'name'>",
  'type FrozenUser  = Readonly<User>',
  'type UsersById   = Record<number, User>',
]

const result = (title: string, rows: [string, string][]) => ({
  title,
  rows: rows.map(([k, v]) => ({ k, v })),
})

const mappedSteps: TraceStep[] = [
  {
    lines: [0],
    panels: [result('User', [['id', 'number'], ['name', 'string'], ['email', 'string']])],
    note: 'Start with one type. Utility types build new types from it, so related types never drift out of sync with the original.',
  },
  {
    lines: [2],
    panels: [
      result('keyof User', [['K', "'id' | 'name' | 'email'"]]),
      result('for each K', [['K?', 'T[K]']]),
    ],
    note: 'Most of them are mapped types: keyof T is the union of T\'s property names, and [K in keyof T] loops over them, producing one property per key. T[K] looks up each property\'s type.',
  },
  {
    lines: [4],
    panels: [result('UserPatch', [['id?', 'number'], ['name?', 'string'], ['email?', 'string']])],
    note: 'Partial makes every property optional — exactly the shape of an update request where any field may be sent.',
  },
  {
    lines: [5],
    panels: [result('PublicUser', [['id', 'number'], ['name', 'string']])],
    note: 'Omit removes keys. A PublicUser literal that includes email is now an error, so private fields cannot leak into a response by accident.',
  },
  {
    lines: [6],
    panels: [result('UserPreview', [['id', 'number'], ['name', 'string']])],
    note: 'Pick is the opposite: keep only the keys you list.',
  },
  {
    lines: [7],
    panels: [result('FrozenUser', [['readonly id', 'number'], ['readonly name', 'string'], ['readonly email', 'string']])],
    note: 'Readonly forbids assignment to any property — checked at compile time only, like all types.',
  },
  {
    lines: [8],
    panels: [result('UsersById', [['[id: number]', 'User']])],
    note: 'Record<K, V> describes an object used as a dictionary: any number key maps to a User. Change User once, and every one of these follows automatically.',
  },
]

export function MappedTypeVisualizer() {
  return <CodeTrace code={MAPPED_CODE} steps={mappedSteps} interval={2800} />
}

const STRUCT_CODE = [
  'type Point = { x: number; y: number }',
  'function len(p: Point) { return Math.hypot(p.x, p.y) }',
  '',
  'const a = { x: 3, y: 4 }',
  'len(a)',
  'const b = { x: 3, y: 4, z: 5 }',
  'len(b)',
  'len({ x: 3, y: 4, z: 5 })',
  'class Vec { constructor(public x: number, public y: number) {} }',
  'len(new Vec(1, 2))',
  'len({ x: 3 })',
]

const verdict = (v: string, tone: 'ok' | 'bad', why: string) => [
  { title: 'accepted?', rows: [{ k: 'len(…)', v, tone }] },
  { title: 'why', rows: [{ k: '', v: why, tone: tone === 'bad' ? ('bad' as const) : undefined }] },
]

const structSteps: TraceStep[] = [
  {
    lines: [0, 1],
    panels: [],
    note: 'len asks for a Point. In many languages that means "an instance declared as a Point". In TypeScript it means "anything with at least x: number and y: number". Types are compared by shape, not by name.',
  },
  {
    lines: [3, 4],
    panels: verdict('✓', 'ok', 'has x and y'),
    note: 'a was never declared as a Point, but it has the right shape, so it is one.',
  },
  {
    lines: [5, 6],
    panels: verdict('✓', 'ok', 'extra z is fine'),
    note: 'Extra properties are allowed: b has everything a Point needs, plus more.',
  },
  {
    lines: [7],
    error: true,
    panels: verdict('✗', 'bad', "Object literal may only specify known properties, and 'z' does not exist in type 'Point'."),
    note: 'Except for a fresh object literal written right at the call. There, an unknown property is almost always a typo, so TypeScript runs an extra "excess property" check.',
  },
  {
    lines: [8, 9],
    panels: verdict('✓', 'ok', 'Vec has public x and y'),
    note: 'A class that never mentions Point is accepted too — its instances have the shape.',
  },
  {
    lines: [10],
    error: true,
    panels: verdict('✗', 'bad', "Property 'y' is missing in type '{ x: number; }' but required in type 'Point'."),
    note: 'Missing a required property is always an error. Structural typing matches how JavaScript is actually written — objects are judged by what they have, which is "duck typing", checked at compile time.',
  },
]

export function StructuralTypingVisualizer() {
  return <CodeTrace code={STRUCT_CODE} steps={structSteps} interval={2800} />
}
