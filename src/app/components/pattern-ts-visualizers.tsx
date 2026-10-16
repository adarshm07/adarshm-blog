import { CodeTrace, type TracePanel, type TraceStep } from '@/app/components/code-trace'

type Tone = 'ok' | 'warn' | 'bad' | 'muted'
const panel = (title: string, rows: [string, string, Tone?][]): TracePanel => ({
  title,
  rows: rows.map(([k, v, tone]) => ({ k, v, tone })),
})

// ── Bitmask DP: travelling salesman ────────────────────────────────────────

const TSP_CODE = [
  '// dp[mask][j]: shortest route from city 0 through exactly',
  '// the cities in mask, ending at city j',
  'dp[0b0001][0] = 0',
  'for (let mask = 1; mask < 1 << n; mask++)',
  '  for (let j = 0; j < n; j++) {',
  '    if (!(mask & (1 << j)) || dp[mask][j] === Infinity) continue',
  '    for (let k = 0; k < n; k++) {',
  '      if (mask & (1 << k)) continue          // already visited',
  '      const next = mask | (1 << k)',
  '      dp[next][k] = Math.min(dp[next][k], dp[mask][j] + dist[j][k])',
  '    }',
  '  }',
  'best = min over j of dp[0b1111][j] + dist[j][0]',
]

const DIST = panel('distances', [
  ['0–1', '10'],
  ['0–2', '15'],
  ['0–3', '20'],
  ['1–2', '35'],
  ['1–3', '25'],
  ['2–3', '30'],
])

// Values computed with the code in the post. A mask lists visited cities,
// city 3 leftmost: 0b0101 = {0, 2}.
const tspSteps: TraceStep[] = [
  {
    lines: [0, 1],
    panels: [DIST],
    note: 'Four cities, a tour that starts and ends at city 0 and visits every city once. Brute force tries all (n − 1)! orders. The DP instead remembers, for each set of visited cities and each end city, the cheapest way to get there.',
  },
  {
    lines: [2],
    panels: [panel('visited = {0}', [['dp[0001][0]', '0', 'ok']])],
    note: 'A set of cities fits in a bitmask: bit j is set if city j has been visited. Start at city 0, having visited only city 0, at cost 0.',
  },
  {
    lines: [6, 7, 8, 9],
    panels: [panel('2 cities visited', [['dp[0011][1]', '0→1 = 10'], ['dp[0101][2]', '0→2 = 15'], ['dp[1001][3]', '0→3 = 20']])],
    note: 'Extend each state by one unvisited city k: set bit k and add the edge from the current end city.',
  },
  {
    lines: [9],
    panels: [
      panel('3 cities visited', [
        ['dp[0111][1]', '0→2→1 = 50'],
        ['dp[0111][2]', '0→1→2 = 45'],
        ['dp[1011][1]', '0→3→1 = 45'],
        ['dp[1011][3]', '0→1→3 = 35', 'ok'],
        ['dp[1101][2]', '0→3→2 = 50'],
        ['dp[1101][3]', '0→2→3 = 45'],
      ]),
    ],
    note: 'Each state keeps only the best cost — not the order. That\'s the saving: once you know the cheapest way to have visited {0, 1, 3} and be at 3, how you got there no longer matters.',
  },
  {
    lines: [9],
    panels: [
      panel('all 4 visited', [
        ['dp[1111][1]', 'min(50+35, 45+25) = 70'],
        ['dp[1111][2]', 'min(45+35, 35+30) = 65'],
        ['dp[1111][3]', 'min(50+25, 45+30) = 75'],
      ]),
    ],
    note: 'Every city visited, ending at 1, 2 or 3. Each value takes the minimum over the possible previous end cities.',
  },
  {
    lines: [12],
    panels: [panel('close the loop', [['end at 1', '70 + 10 = 80', 'ok'], ['end at 2', '65 + 15 = 80', 'ok'], ['end at 3', '75 + 20 = 95'], ['best tour', '0→1→3→2→0 = 80', 'ok']])],
    note: 'Add the edge back to city 0 and take the minimum: 80. There are 2ⁿ × n states with n choices each — O(2ⁿ · n²). For 20 cities that\'s about 4 × 10⁸ steps; 19! orders would be about 1.2 × 10¹⁷.',
  },
]

export function TspBitmaskVisualizer() {
  return <CodeTrace code={TSP_CODE} steps={tspSteps} interval={3200} />
}

// ── Factory and builder ────────────────────────────────────────────────────

const CREATION_CODE = [
  '// Factory: callers ask for a notifier, not a class',
  'function createNotifier(channel: Channel): Notifier {',
  '  switch (channel) {',
  "    case 'email': return new EmailNotifier(smtpConfig)",
  "    case 'sms':   return new SmsNotifier(smsClient)",
  "    case 'push':  return new PushNotifier(fcmClient)",
  '  }',
  '}',
  '',
  '// Builder: assemble a complex object step by step',
  "const request = new RequestBuilder('https://api.example.com/orders')",
  "  .method('POST')",
  "  .header('Idempotency-Key', key)",
  '  .json({ items })',
  '  .timeout(5_000)',
  '  .build()',
]

const creationSteps: TraceStep[] = [
  {
    lines: [1, 2, 3, 4, 5],
    panels: [panel('createNotifier(user.channel)', [['caller knows', 'the Notifier interface'], ['caller doesn\'t know', 'class names, configs, clients', 'ok']])],
    note: 'A factory puts the "which class, built how" decision in one place. Callers depend on the interface they get back, never on the concrete classes or what each needs to be constructed.',
  },
  {
    lines: [5],
    panels: [panel('adding WhatsApp', [['files changed', 'the factory + one new class', 'ok'], ['callers changed', 'none', 'ok']])],
    note: 'A new channel is one new class and one new case. The switch hasn\'t gone away — but it exists once, instead of in every place that sends a notification.',
  },
  {
    lines: [10],
    panels: [panel('the alternative', [['new Request(url, "POST", headers, body, 5000, …)', 'which argument is which?', 'bad']])],
    note: 'Builders solve a different problem: objects with many optional parts. A constructor with eight positional parameters is easy to call wrongly, and impossible to read.',
  },
  {
    lines: [11, 12, 13, 14],
    panels: [panel('builder state', [['method', 'POST'], ['headers', 'Idempotency-Key'], ['body', 'JSON, content-type set'], ['timeout', '5,000 ms']])],
    note: 'Each call sets one named part and returns the builder, so calls chain. Optional parts are simply not called, and helpers like json() can set related fields together.',
  },
  {
    lines: [15],
    panels: [panel('build()', [['validates', 'URL present, body only with POST/PUT', 'ok'], ['returns', 'an immutable Request', 'ok']])],
    note: 'build() checks the whole object at once and returns a finished, immutable value. The builder is the mutable scaffolding; the product never is.',
  },
]

export function FactoryBuilderVisualizer() {
  return <CodeTrace code={CREATION_CODE} steps={creationSteps} interval={3000} />
}

// ── Dependency injection ───────────────────────────────────────────────────

const DI_CODE = [
  'class SignupService {',
  '  constructor(',
  '    private users: UserRepository,',
  '    private mailer: Mailer,',
  '    private clock: Clock,',
  '  ) {}',
  '',
  '  async signUp(email: string) {',
  '    const user = await this.users.create({ email, createdAt: this.clock.now() })',
  "    await this.mailer.send(email, 'Welcome!')",
  '    return user',
  '  }',
  '}',
  '',
  '// main.ts — the composition root',
  'const signup = new SignupService(new PgUsers(pool), new SesMailer(ses), systemClock)',
  '',
  '// signup.test.ts',
  'const mailer = new FakeMailer()',
  "const signup = new SignupService(new MemoryUsers(), mailer, fixedClock('2026-10-16'))",
]

const diSteps: TraceStep[] = [
  {
    lines: [7, 8, 9],
    panels: [panel('without injection', [['inside signUp', 'new PgUsers(), new SesMailer(), Date.now()', 'bad'], ['to test it', 'a real database and email account', 'bad']])],
    note: 'Imagine signUp creating what it needs: a Postgres repository, an SES mailer, the system clock. It works — but every test now needs a database, sends real email, and gets a different timestamp each run.',
  },
  {
    lines: [1, 2, 3, 4, 5],
    panels: [panel('constructor injection', [['SignupService asks for', 'UserRepository, Mailer, Clock', 'ok'], ['it never calls', 'new on its collaborators', 'ok']])],
    note: 'Dependency injection just means: receive collaborators instead of constructing them. The constructor lists exactly what the class needs — its dependencies are visible, not hidden in method bodies.',
  },
  {
    lines: [14, 15],
    panels: [panel('composition root', [['the only place that knows', 'PgUsers, SesMailer, systemClock'], ['changing email provider', 'one line here', 'ok']])],
    note: 'Somebody still has to choose the real implementations. That happens once, at startup — the composition root. It\'s the one file that knows every concrete class.',
  },
  {
    lines: [17, 18, 19],
    panels: [panel('in tests', [['users', 'in-memory'], ['mailer', 'a fake that records calls'], ['clock', 'fixed: 2026-10-16'], ['test asserts', 'mailer.sent includes the email', 'ok']])],
    note: 'Tests pass fakes. No database, no email, and time is fixed, so createdAt is predictable. The class under test can\'t tell the difference.',
  },
  {
    lines: [15],
    panels: [panel('do you need a container?', [['a few dozen classes', 'plain constructors in main.ts', 'ok'], ['hundreds, with lifetimes', 'a DI container can help'], ['the principle', 'the same either way']])],
    note: 'DI frameworks (NestJS, Spring, InversifyJS) automate the wiring. They\'re optional: "pass dependencies in" is the whole idea, and manual wiring is usually enough.',
  },
]

export function DependencyInjectionVisualizer() {
  return <CodeTrace code={DI_CODE} steps={diSteps} interval={3000} />
}

// ── Function overloads ─────────────────────────────────────────────────────

const OVERLOAD_CODE = [
  'function parse(input: string): Date',
  'function parse(input: number): Date',
  'function parse(input: string[]): Date[]',
  'function parse(input: string | number | string[]): Date | Date[] {',
  '  if (Array.isArray(input)) return input.map((s) => new Date(s))',
  '  return new Date(input)',
  '}',
  '',
  "const a = parse('2026-10-16')     // ?",
  "const b = parse(['2026-10-16'])   // ?",
  'const c = parse(true)             // ?',
  'declare const id: string | number',
  'const d = parse(id)               // ?',
]

const overloadSteps: TraceStep[] = [
  {
    lines: [0, 1, 2, 3],
    panels: [panel('what callers see', [['signatures', '3 overloads', 'ok'], ['implementation signature', 'hidden from callers', 'muted']])],
    note: 'Overloads are several call signatures for one function, followed by one implementation. Callers only see the overload list; the implementation signature must be compatible with all of them but can\'t be called directly.',
  },
  {
    lines: [8, 0],
    panels: [panel('compiler', [['parse(string)', 'matches overload 1'], ['type of a', 'Date', 'ok']])],
    note: 'TypeScript checks the overloads top to bottom and uses the first that fits. A string matches the first: a is a Date.',
  },
  {
    lines: [9, 2],
    panels: [panel('compiler', [['parse(string[])', 'skips 1 and 2, matches 3'], ['type of b', 'Date[]', 'ok']])],
    note: 'An array skips the first two and matches the third, so b is Date[]. That\'s the point of overloads: the return type depends on the argument type.',
  },
  {
    lines: [10],
    error: true,
    panels: [panel('compiler', [['error TS2769', 'No overload matches this call.', 'bad']])],
    note: 'A boolean matches none of them. The error lists why each overload failed.',
  },
  {
    lines: [11, 12],
    error: true,
    panels: [panel('compiler', [['argument', 'string | number'], ['error TS2769', 'No overload matches this call.', 'bad'], ['why', 'each overload is tried with the whole union']])],
    note: 'The surprise: a value that is "string or number" also fails, even though both cases are handled. Overload resolution doesn\'t split a union. Add a fourth overload taking string | number, or use a single union signature instead.',
  },
]

export function OverloadsVisualizer() {
  return <CodeTrace code={OVERLOAD_CODE} steps={overloadSteps} interval={3000} />
}

// ── Variance ───────────────────────────────────────────────────────────────

const VARIANCE_CODE = [
  "class Animal { name = '' }",
  'class Dog extends Animal { bark() {} }',
  '',
  'let dogs: Dog[] = [new Dog()]',
  'let animals: Animal[] = dogs',
  'animals.push(new Animal())',
  'dogs[1].bark()',
  '',
  'type Handler<T> = (value: T) => void',
  'const handleAnimal: Handler<Animal> = (a) => console.log(a.name)',
  'const handleDog: Handler<Dog> = handleAnimal',
  'const bad: Handler<Animal> = (d: Dog) => d.bark()',
]

const varianceSteps: TraceStep[] = [
  {
    lines: [0, 1],
    panels: [panel('subtyping', [['Dog', 'is an Animal (has name, plus bark)'], ['question', 'is Box<Dog> a Box<Animal>?']])],
    note: 'A Dog can be used wherever an Animal is expected. Variance is the question of what that means for types built from them: a list of dogs, a function that takes a dog.',
  },
  {
    lines: [3, 4],
    panels: [panel('compiler', [['Dog[] → Animal[]', 'allowed', 'ok'], ['arrays are', 'covariant (same direction)']])],
    note: 'TypeScript treats arrays as covariant: Dog[] can be assigned to Animal[]. Reading from it is safe — every element really is an Animal.',
  },
  {
    lines: [5, 6],
    error: true,
    panels: [panel('runtime', [['animals.push(new Animal())', 'compiles'], ['dogs[1].bark()', 'TypeError: dogs[1].bark is not a function', 'bad']])],
    note: 'But writing isn\'t safe. Through the Animal[] alias you can push a plain Animal into what is really a Dog[]. This is a known, deliberate hole: strictly typed mutable arrays would be invariant, which TypeScript chose not to enforce. Use readonly Dog[] where you can.',
  },
  {
    lines: [8, 9, 10],
    panels: [panel('compiler', [['Handler<Animal> → Handler<Dog>', 'allowed', 'ok'], ['parameters are', 'contravariant (opposite direction)']])],
    note: 'Functions flip the direction for their parameters. Something that can handle any Animal can certainly handle a Dog, so Handler<Animal> is usable as a Handler<Dog>.',
  },
  {
    lines: [11],
    error: true,
    panels: [panel('compiler', [['error TS2322', "'(d: Dog) => void' is not assignable to 'Handler<Animal>'", 'bad'], ['why', 'it could be called with a plain Animal, which has no bark()']])],
    note: 'The reverse is rejected under strictFunctionTypes: a function that needs a Dog can\'t stand in for one that accepts any Animal. One exception remains — parameters of methods declared with method syntax stay bivariant, for compatibility.',
  },
]

export function VarianceVisualizer() {
  return <CodeTrace code={VARIANCE_CODE} steps={varianceSteps} interval={3200} />
}
