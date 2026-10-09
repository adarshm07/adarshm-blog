import { SequenceDiagram, type SequenceStep } from '@/app/components/sequence-diagram'
import { CodeTrace, type TraceStep } from '@/app/components/code-trace'

// ── Raft leader election ───────────────────────────────────────────────────

const cluster = (n1: string, n2: string, n3: string) => ({
  title: 'cluster state',
  lines: [`N1 ${n1}`, `N2 ${n2}`, `N3 ${n3}`],
})

const raftSteps: SequenceStep[] = [
  {
    panel: cluster('leader    · term 1', 'follower  · term 1', 'follower  · term 1'),
    note: 'Three servers keep a replicated log. Raft allows one leader at a time: it accepts writes and copies them to the followers. Time is divided into numbered terms; each term has at most one leader.',
  },
  {
    message: { from: 0, to: 1, label: 'heartbeat (term 1)' },
    panel: cluster('leader    · term 1', 'follower  · term 1', 'follower  · term 1'),
    note: 'The leader sends regular heartbeats. Each follower runs an election timer, reset by every heartbeat — with a random length (say 150–300 ms), so they rarely expire together.',
  },
  {
    message: { from: 0, to: 0, label: '✕ crashes', tone: 'bad' },
    panel: cluster('down', 'follower  · term 1', 'follower  · term 1'),
    note: 'N1 crashes. The heartbeats stop.',
  },
  {
    message: { from: 1, to: 1, label: 'timer fires → candidate, term 2, votes for self', tone: 'warn' },
    panel: cluster('down', 'candidate · term 2 · 1 vote', 'follower  · term 1'),
    note: 'N2\'s timer runs out first. It increments the term to 2, becomes a candidate, and votes for itself.',
  },
  {
    message: { from: 1, to: 2, label: 'RequestVote (term 2, my log is up to date)' },
    panel: cluster('down', 'candidate · term 2 · 1 vote', 'follower  · term 1'),
    note: 'It asks the others for votes. A server grants at most one vote per term, and only to a candidate whose log is at least as up to date as its own — so a leader can never be missing committed entries.',
  },
  {
    message: { from: 2, to: 1, label: 'vote granted', dashed: true, tone: 'ok' },
    panel: cluster('down', 'leader    · term 2 · 2/3 votes', 'follower  · term 2'),
    note: 'N3 grants it. Two votes out of three is a majority, so N2 is leader for term 2. Two candidates can\'t both win the same term: there aren\'t enough votes for two majorities.',
  },
  {
    message: { from: 1, to: 2, label: 'AppendEntries: x = 5 (term 2)' },
    panel: cluster('down', 'leader    · term 2', 'follower  · term 2'),
    note: 'A client write arrives. The new leader appends it to its log and sends it to the followers.',
  },
  {
    message: { from: 2, to: 1, label: 'ack → committed on 2 of 3', dashed: true, tone: 'ok' },
    panel: cluster('down', 'leader    · term 2 · x = 5 committed', 'follower  · term 2'),
    note: 'Once a majority has the entry, it\'s committed and the client gets success. The cluster keeps working with one server down; with five servers, it would survive two.',
  },
  {
    message: { from: 1, to: 0, label: 'heartbeat (term 2) → N1 sees higher term', tone: 'ok' },
    panel: cluster('follower  · term 2', 'leader    · term 2', 'follower  · term 2'),
    note: 'N1 restarts still believing it leads term 1. The first message it sees carries term 2, so it steps down immediately and catches up its log. Terms are what stop a stale leader from doing damage.',
  },
]

export function RaftVisualizer() {
  return <SequenceDiagram actors={['N1', 'N2', 'N3']} steps={raftSteps} interval={2800} />
}

// ── Health checks ──────────────────────────────────────────────────────────

const instance = (live: string, ready: string, traffic: string) => ({
  title: 'instance status',
  lines: [`liveness:  ${live}`, `readiness: ${ready}`, `traffic:   ${traffic}`],
})

const healthSteps: SequenceStep[] = [
  {
    panel: instance('—', '—', 'none'),
    note: 'An orchestrator (Kubernetes, a load balancer, ECS) asks each instance two different questions. Mixing them up is one of the most common causes of outages that health checks were meant to prevent.',
  },
  {
    message: { from: 0, to: 1, label: 'GET /livez' },
    panel: instance('checking', '—', 'none'),
    note: 'Liveness: "is this process healthy, or stuck?" Failing it means restart me.',
  },
  {
    message: { from: 1, to: 0, label: '200 — process is running', dashed: true, tone: 'ok' },
    panel: instance('ok', 'starting', 'none'),
    note: 'It answers from inside the process without touching dependencies. The app is alive, but still loading caches and opening connections.',
  },
  {
    message: { from: 0, to: 1, label: 'GET /readyz' },
    panel: instance('ok', 'checking', 'none'),
    note: 'Readiness: "can you serve requests right now?" Failing it means stop sending me traffic — but don\'t kill me.',
  },
  {
    message: { from: 1, to: 2, label: 'SELECT 1' },
    panel: instance('ok', 'checking', 'none'),
    note: 'Readiness may check what the instance needs to serve a request, like its database connection.',
  },
  {
    message: { from: 1, to: 0, label: '200 — ready', dashed: true, tone: 'ok' },
    panel: instance('ok', 'ready', 'receiving requests'),
    note: 'Ready, so the load balancer starts sending it traffic. Until now it was alive but deliberately left out.',
  },
  {
    message: { from: 2, to: 2, label: '✕ database unreachable', tone: 'bad' },
    panel: instance('ok', 'ready', 'receiving requests'),
    note: 'Then the database becomes unreachable for a minute.',
  },
  {
    message: { from: 1, to: 0, label: '/readyz → 503', dashed: true, tone: 'warn' },
    panel: instance('ok', 'not ready', 'removed from rotation'),
    note: 'Readiness fails, so the instance is taken out of rotation, and comes back on its own when the database recovers. No restarts, no lost in-memory state.',
  },
  {
    message: { from: 1, to: 0, label: 'if /livez checked the DB too → restart storm', dashed: true, tone: 'bad' },
    panel: instance('failing everywhere', 'not ready', 'every instance restarting'),
    note: 'If liveness also checked the database, every instance would fail it at once and be restarted in a loop — turning a database blip into a full outage. Keep liveness about the process itself.',
  },
]

export function HealthCheckVisualizer() {
  return <SequenceDiagram actors={['orchestrator', 'app instance', 'database']} steps={healthSteps} />
}

// ── Service workers ────────────────────────────────────────────────────────

const cacheState = (lines: string[]) => ({ title: 'cache storage', lines })

const swSteps: SequenceStep[] = [
  {
    panel: cacheState(['(empty)']),
    note: 'A service worker is a script the browser runs separately from your page. Once installed, it sits between the page and the network and can answer requests itself — including when there is no network at all.',
  },
  {
    message: { from: 0, to: 1, label: "register('/sw.js')" },
    panel: cacheState(['(empty)']),
    note: 'The page registers it. The browser downloads sw.js and runs its install event.',
  },
  {
    message: { from: 1, to: 2, label: 'install: cache app shell' },
    panel: cacheState(['/', '/app.css', '/app.js', '/offline.html']),
    note: 'On install, it precaches the "app shell" — the HTML, CSS and JS needed to show the interface.',
  },
  {
    message: { from: 0, to: 1, label: 'fetch /app.css' },
    panel: cacheState(['/', '/app.css', '/app.js', '/offline.html']),
    note: 'From now on, every request from the page goes through the service worker\'s fetch event first.',
  },
  {
    message: { from: 1, to: 0, label: 'cache-first: from cache (no network)', dashed: true, tone: 'ok' },
    panel: cacheState(['/', '/app.css', '/app.js', '/offline.html']),
    note: 'For versioned static files, answer from the cache immediately. Instant, and works offline.',
  },
  {
    message: { from: 1, to: 3, label: 'network-first: GET /api/feed' },
    panel: cacheState(['/', '/app.css', '/app.js', '/offline.html']),
    note: 'For data that changes, try the network first…',
  },
  {
    message: { from: 3, to: 1, label: '200 + fresh data → also cached', dashed: true },
    panel: cacheState(['/', '/app.css', '/app.js', '/offline.html', '/api/feed (latest copy)']),
    note: '…and keep a copy of the response in the cache as a fallback.',
  },
  {
    message: { from: 1, to: 3, label: 'offline: GET /api/feed ✕', tone: 'bad' },
    panel: cacheState(['/', '/app.css', '/app.js', '/offline.html', '/api/feed (latest copy)']),
    note: 'Later the user goes offline, and the network request fails.',
  },
  {
    message: { from: 1, to: 0, label: 'fallback: last cached /api/feed', dashed: true, tone: 'ok' },
    panel: cacheState(['/', '/app.css', '/app.js', '/offline.html', '/api/feed (latest copy)']),
    note: 'The service worker serves the last copy it saw instead of an error. The page still works — that is what makes a site behave like an installed app.',
  },
]

export function ServiceWorkerVisualizer() {
  return <SequenceDiagram actors={['page', 'service worker', 'cache', 'network']} steps={swSteps} />
}

// ── Event sourcing ─────────────────────────────────────────────────────────

const ES_CODE = [
  'const events = [',
  "  { type: 'AccountOpened', owner: 'Ada' },",
  "  { type: 'Deposited',     amount: 100 },",
  "  { type: 'Withdrew',      amount: 30 },",
  "  { type: 'Deposited',     amount: 50 },",
  ']',
  '',
  'const state = events.reduce(apply, { balance: 0 })',
]

const esSteps: TraceStep[] = [
  {
    lines: [0, 5],
    panels: [
      { title: 'stored', rows: [{ k: 'traditional', v: 'balance = 120 (latest value only)' }, { k: 'event-sourced', v: 'every change, in order' }] },
    ],
    note: 'A normal database stores the current state and overwrites it. Event sourcing stores the changes instead — an append-only log of facts — and computes the state from them.',
  },
  {
    lines: [1],
    panels: [{ title: 'state after replay', rows: [{ k: 'owner', v: 'Ada' }, { k: 'balance', v: '0' }] }],
    note: 'Replay from the start: AccountOpened creates the account.',
  },
  {
    lines: [2],
    panels: [{ title: 'state after replay', rows: [{ k: 'owner', v: 'Ada' }, { k: 'balance', v: '100' }] }],
    note: 'Deposited 100. Each event is applied by a small pure function: (state, event) → new state.',
  },
  {
    lines: [3],
    panels: [{ title: 'state after replay', rows: [{ k: 'owner', v: 'Ada' }, { k: 'balance', v: '70' }] }],
    note: 'Withdrew 30. Events are named in the past tense: they are facts that happened, never edited or deleted.',
  },
  {
    lines: [4, 7],
    panels: [{ title: 'state after replay', rows: [{ k: 'owner', v: 'Ada' }, { k: 'balance', v: '120', tone: 'ok' }] }],
    note: 'Deposited 50: balance 120. The current state is a reduce over the log — and you can stop the replay at any point to see the state on any past date.',
  },
  {
    lines: [7],
    panels: [
      {
        title: 'read models (CQRS)',
        rows: [
          { k: 'balances', v: '{ Ada: 120 }' },
          { k: 'statement', v: '+100, −30, +50' },
          { k: 'audit log', v: 'who, what, when — free' },
        ],
      },
    ],
    note: 'CQRS pairs naturally with it: the write side appends events; separate read models, each shaped for one query, are built by subscribing to the log. Add a new view later by replaying history into it.',
  },
]

export function EventSourcingVisualizer() {
  return <CodeTrace code={ES_CODE} steps={esSteps} interval={2800} />
}

// ── Browser storage ────────────────────────────────────────────────────────

const STORAGE_CODE = [
  "document.cookie = 'theme=dark; Max-Age=31536000; Secure'",
  "localStorage.setItem('draft', text)",
  "sessionStorage.setItem('step', '2')",
  "const db = await openDB('app')  // IndexedDB",
  "const cache = await caches.open('v1')  // Cache API",
]

const facts = (rows: [string, string, ('ok' | 'warn' | 'bad')?][]) => ({
  title: 'properties',
  rows: rows.map(([k, v, tone]) => ({ k, v, tone })),
})

const storageSteps: TraceStep[] = [
  {
    lines: [0],
    panels: [
      facts([
        ['size', '~4 KB per cookie'],
        ['sent to server', 'with every request', 'warn'],
        ['lifetime', 'until it expires'],
        ['JS access', 'unless HttpOnly'],
      ]),
    ],
    note: 'Cookies are the only storage the browser sends to your server automatically, on every request. That makes them right for session IDs — and wrong for anything big.',
  },
  {
    lines: [1],
    panels: [
      facts([
        ['size', '~5 MB per origin'],
        ['sent to server', 'never', 'ok'],
        ['lifetime', 'until cleared'],
        ['API', 'synchronous — blocks', 'warn'],
      ]),
    ],
    note: 'localStorage: simple key → string pairs that survive restarts, shared by every tab of the site. Synchronous, so keep values small. Never store tokens there — any injected script can read it.',
  },
  {
    lines: [2],
    panels: [
      facts([
        ['size', '~5 MB per origin'],
        ['scope', 'this tab only'],
        ['lifetime', 'until the tab closes'],
      ]),
    ],
    note: 'sessionStorage: the same API, but scoped to one tab and cleared when it closes. Good for multi-step form progress you don\'t want leaking into other tabs.',
  },
  {
    lines: [3],
    panels: [
      facts([
        ['size', 'large — a share of free disk', 'ok'],
        ['data', 'objects, blobs, indexes', 'ok'],
        ['API', 'asynchronous', 'ok'],
        ['works in', 'workers too'],
      ]),
    ],
    note: 'IndexedDB: a real database in the browser — structured objects, binary data, indexes, transactions. Its raw API is clumsy, so most people use a small wrapper library. The right choice for offline data.',
  },
  {
    lines: [4],
    panels: [
      facts([
        ['stores', 'Request → Response pairs'],
        ['used by', 'service workers'],
        ['lifetime', 'until you delete it'],
      ]),
    ],
    note: 'The Cache API stores whole HTTP responses, keyed by request. It\'s how service workers make sites work offline. All of these, except cookies, can be evicted by the browser under storage pressure unless the site asks for persistent storage.',
  },
]

export function BrowserStorageVisualizer() {
  return <CodeTrace code={STORAGE_CODE} steps={storageSteps} interval={2800} />
}

// ── Error handling ─────────────────────────────────────────────────────────

const ERR_CODE = [
  'function parseConfig(text) {',
  '  try {',
  '    return JSON.parse(text)',
  '  } catch (err) {',
  "    throw new Error('Invalid config', { cause: err })",
  '  } finally {',
  "    console.log('parse attempted')",
  '  }',
  '}',
  '',
  'async function loadConfig() {',
  "  const res = await fetch('/config.json')",
  '  if (!res.ok) throw new Error(`HTTP ${res.status}`)',
  '  return parseConfig(await res.text())',
  '}',
  '',
  'loadConfig().catch(reportError)',
]

const errSteps: TraceStep[] = [
  {
    lines: [16, 11],
    panels: [{ title: 'what happens', rows: [{ k: 'fetch', v: '200 OK, body: "{bad"' }] }],
    note: 'loadConfig fetches a config file. Note: fetch only rejects on network failure. A 404 or 500 still resolves — you must check res.ok yourself, as loadConfig does.',
  },
  {
    lines: [2],
    error: true,
    panels: [
      { title: 'thrown', rows: [{ k: 'SyntaxError', v: "Expected property name or '}' in JSON…", tone: 'bad' }] },
    ],
    note: 'The body is invalid JSON, so JSON.parse throws. Execution stops at that line and jumps to the nearest enclosing catch, unwinding the call stack as it goes.',
  },
  {
    lines: [3, 4],
    panels: [
      {
        title: 'thrown',
        rows: [
          { k: 'Error', v: 'Invalid config', tone: 'bad' },
          { k: '.cause', v: 'SyntaxError: Expected property name…' },
        ],
      },
    ],
    note: 'The catch wraps it in an error that says what failed at this level, keeping the original as cause. Context is added; the root cause isn\'t lost.',
  },
  {
    lines: [5, 6],
    panels: [{ title: 'console', rows: [{ k: '>', v: 'parse attempted' }] }],
    note: 'finally runs whether the try succeeded, threw, or returned — the place for cleanup like closing a file or hiding a spinner. Then the new error continues upwards.',
  },
  {
    lines: [13],
    panels: [{ title: 'promise', rows: [{ k: 'loadConfig()', v: 'rejected with Error: Invalid config', tone: 'bad' }] }],
    note: 'Inside an async function, a thrown error becomes a rejected promise. It travels to whoever awaits it — or to .catch.',
  },
  {
    lines: [16],
    panels: [
      {
        title: 'handled',
        rows: [
          { k: 'reportError', v: 'logs message + cause, shows a friendly message', tone: 'ok' },
          { k: 'without .catch', v: 'unhandledrejection warning', tone: 'warn' },
        ],
      },
    ],
    note: 'Handle errors where you can do something useful — show a message, retry, fall back. A promise nobody handles triggers an "unhandled rejection", which crashes Node by default.',
  },
]

export function ErrorHandlingVisualizer() {
  return <CodeTrace code={ERR_CODE} steps={errSteps} interval={2800} />
}

// ── Intl ───────────────────────────────────────────────────────────────────

// Outputs captured from Node 22's full ICU. Hard-coded, not computed at render:
// browsers ship different ICU versions, and formatting during render would
// risk server/client markup mismatches.
const INTL_CODE = [
  'const n = 1234567.891',
  "new Intl.NumberFormat('en-US').format(n)",
  "new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)",
  "new Intl.NumberFormat('en', { notation: 'compact' }).format(n)",
  "new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(d)",
  "new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-1, 'day')",
  "new Intl.ListFormat('en').format(['Ada', 'Grace', 'Linus'])",
]

const out = (rows: [string, string][]) => ({ title: 'output', rows: rows.map(([k, v]) => ({ k, v, tone: 'ok' as const })) })

const intlSteps: TraceStep[] = [
  {
    lines: [0, 1],
    panels: [out([['en-US', '1,234,567.891'], ['de-DE', '1.234.567,891'], ['en-IN', '12,34,567.891']])],
    note: 'The same number is written differently around the world: different separators, and India groups digits in lakhs and crores. Intl.NumberFormat knows all of these — no string concatenation, no libraries.',
  },
  {
    lines: [2],
    panels: [out([['INR', '₹12,34,567.89'], ['USD (en-US)', '$1,234,567.89'], ['JPY (ja-JP)', '￥1,234,568']])],
    note: 'Currencies get the right symbol, position and number of decimal places. The yen has no minor unit, so it rounds to a whole number automatically.',
  },
  {
    lines: [3],
    panels: [out([['compact', '1.2M'], ['percent (0.256)', '26%'], ['unit (512 kB)', '512 kB']])],
    note: 'Compact notation, percentages and units are built in too.',
  },
  {
    lines: [4],
    panels: [out([['en-US', 'Oct 9, 2026, 2:30 PM'], ['en-GB', '9 Oct 2026, 14:30'], ['ja-JP', '2026年10月9日']])],
    note: 'Dates and times follow each locale\'s order and clock, and the timeZone option converts for display. Never build date strings by hand.',
  },
  {
    lines: [5, 6],
    panels: [out([['relative', 'yesterday · in 3 hours'], ['list (en)', 'Ada, Grace, and Linus'], ['list (de)', 'Ada, Grace und Linus']])],
    note: '"Yesterday", "in 3 hours", "Ada, Grace, and Linus" — the small phrases that hand-written code gets wrong in other languages. PluralRules and Collator handle plurals and alphabetical sorting the same way.',
  },
]

export function IntlVisualizer() {
  return <CodeTrace code={INTL_CODE} steps={intlSteps} interval={2800} />
}

// ── Declaration files ──────────────────────────────────────────────────────

const DTS_CODE = [
  '// legacy-math.js — plain JavaScript',
  'export function clamp(n, min, max) {',
  '  return Math.min(Math.max(n, min), max)',
  '}',
  '',
  '// legacy-math.d.ts — types only',
  'export declare function clamp(n: number, min: number, max: number): number',
  '',
  '// app.ts',
  "import { clamp } from './legacy-math'",
  "clamp('5', 0, 10)",
]

const dtsSteps: TraceStep[] = [
  {
    lines: [0, 1, 2, 3],
    panels: [{ title: 'type checker', rows: [{ k: 'clamp', v: 'unknown — it\'s JavaScript', tone: 'warn' }] }],
    note: 'Plenty of code you depend on is plain JavaScript, with no types for TypeScript to read.',
  },
  {
    lines: [9],
    error: true,
    panels: [
      {
        title: 'without a .d.ts (strict)',
        rows: [{ k: 'TS7016', v: "Could not find a declaration file for module './legacy-math'. … implicitly has an 'any' type.", tone: 'bad' }],
      },
    ],
    note: 'Import it from TypeScript in strict mode and the compiler refuses to guess: there\'s no declaration file, so everything from it would be any.',
  },
  {
    lines: [5, 6],
    panels: [{ title: 'type checker', rows: [{ k: 'clamp', v: '(n: number, min: number, max: number) => number', tone: 'ok' }] }],
    note: 'A declaration file (.d.ts) describes the types of JavaScript that lives elsewhere — signatures only, no implementation. declare means "this exists at runtime; trust me about its shape".',
  },
  {
    lines: [10],
    error: true,
    panels: [{ title: 'type checker', rows: [{ k: 'TS2345', v: "Argument of type 'string' is not assignable to parameter of type 'number'.", tone: 'bad' }] }],
    note: 'Now calls are checked against it. Note the .d.ts is a promise, not a guarantee — if it doesn\'t match the real JavaScript, the types are wrong and nothing will tell you.',
  },
  {
    lines: [],
    panels: [
      {
        title: 'where .d.ts files come from',
        rows: [
          { k: 'library ships them', v: '"types" in package.json' },
          { k: 'DefinitelyTyped', v: 'npm i -D @types/lodash' },
          { k: 'your TS library', v: 'tsc --declaration' },
          { k: 'globals, env vars', v: 'declare global { … }' },
        ],
      },
    ],
    note: 'Most come from the library itself or from @types packages on DefinitelyTyped. Your own TypeScript generates them when published, and a small hand-written one covers untyped scripts and globals.',
  },
]

export function DeclarationFileVisualizer() {
  return <CodeTrace code={DTS_CODE} steps={dtsSteps} interval={2800} />
}
