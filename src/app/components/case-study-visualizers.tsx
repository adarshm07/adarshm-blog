import { SequenceDiagram, type SequenceStep } from '@/app/components/sequence-diagram'
import { CodeTrace, type TracePanel, type TraceStep } from '@/app/components/code-trace'

type Tone = 'ok' | 'warn' | 'bad' | 'muted'
const panel = (title: string, rows: [string, string, Tone?][]): TracePanel => ({
  title,
  rows: rows.map(([k, v, tone]) => ({ k, v, tone })),
})

// ── URL shortener ──────────────────────────────────────────────────────────

const shortenerSteps: SequenceStep[] = [
  {
    message: { from: 0, to: 1, label: 'POST /links { url }' },
    note: 'Creating a link: the client sends the long URL. The service is stateless, so any instance behind the load balancer can take it.',
  },
  {
    message: { from: 1, to: 1, label: 'next ID 4,120,775,031 → base62 "4uSlPp"', tone: 'ok' },
    panel: { title: 'key generation', lines: ['counter block 4,120,000,000–4,120,999,999', 'leased by this instance', 'no database round trip per key'] },
    note: 'The key comes from a counter, encoded in base 62. Each instance leases a block of a million IDs at a time, so keys are unique without a lookup per request.',
  },
  {
    message: { from: 1, to: 3, label: 'INSERT (4uSlPp, url, owner, created)' },
    note: 'One row per link in the database — about 500 bytes. The key is the primary key, so the redirect lookup is a single index probe.',
  },
  {
    message: { from: 1, to: 0, label: '201 { short: "sho.rt/4uSlPp" }', dashed: true, tone: 'ok' },
    note: 'Done. Writes are rare (about 40 a second at this scale); reads are what the design is really for.',
  },
  {
    message: { from: 0, to: 1, label: 'GET /4uSlPp' },
    note: 'Someone clicks the link. This path runs about 100 times for every link created, so it has to be cheap.',
  },
  {
    message: { from: 1, to: 2, label: 'GET 4uSlPp → hit', tone: 'ok' },
    panel: { title: 'cache', lines: ['hot links stay in memory', '~20% of links get ~80% of clicks'] },
    note: 'Check the cache first. Popular links are almost always there, so most redirects never touch the database.',
  },
  {
    message: { from: 1, to: 0, label: '302 Location: https://…', dashed: true, tone: 'ok' },
    note: '302 (temporary) means every click comes back to us, so we can count it. A 301 would be cached by browsers — faster, but invisible to analytics.',
  },
  {
    message: { from: 1, to: 4, label: 'click event (async)', tone: 'warn' },
    note: 'Counting the click is not on the critical path: publish an event and let a separate pipeline aggregate counts. The redirect never waits for analytics.',
  },
]

export function UrlShortenerVisualizer() {
  return <SequenceDiagram actors={['client', 'service', 'cache', 'database', 'analytics']} steps={shortenerSteps} interval={2600} />
}

// ── Chat system ────────────────────────────────────────────────────────────

const chatSteps: SequenceStep[] = [
  {
    panel: { title: 'connections', lines: ['Asha → gateway 1 (WebSocket)', 'Ben  → gateway 3 (WebSocket)', 'presence: user → gateway, in Redis'] },
    note: 'Each phone holds a WebSocket open to one of many gateway servers. A presence store records which gateway each online user is connected to.',
  },
  {
    message: { from: 0, to: 1, label: 'send { chat: 42, clientId: m-77, "hi" }' },
    note: 'Asha sends a message. The client generates its own ID (m-77), so a retry after a dropped connection can be de-duplicated.',
  },
  {
    message: { from: 1, to: 2, label: 'append → seq 1,031', tone: 'ok' },
    panel: { title: 'chat 42 log', lines: ['… seq 1,030', 'seq 1,031  Asha: hi'] },
    note: 'The chat service appends it to the conversation\'s log and assigns the next sequence number. Ordering per conversation comes from that number, not from clocks.',
  },
  {
    message: { from: 1, to: 0, label: 'ack m-77 = seq 1,031', dashed: true, tone: 'ok' },
    note: 'Only once it\'s durably stored does Asha see a single tick. If the ack never arrives, the client resends m-77 and the server recognises it.',
  },
  {
    message: { from: 2, to: 3, label: 'deliver to Ben (presence: gateway 3)' },
    note: 'For each other member, look up their gateway in the presence store and forward the message there.',
  },
  {
    message: { from: 3, to: 4, label: 'push over WebSocket', tone: 'ok' },
    note: 'Gateway 3 writes it down Ben\'s socket. Ben\'s app acknowledges, and Asha sees a second tick: delivered.',
  },
  {
    message: { from: 4, to: 2, label: 'sync from seq 1,028', dashed: true },
    note: 'If Ben was offline, the message waits in the log and a push notification wakes his phone. On reconnect, the app asks for everything after the last sequence number it has — no gaps, no duplicates.',
  },
]

export function ChatSystemVisualizer() {
  return <SequenceDiagram actors={['Asha', 'gateway 1', 'chat service', 'gateway 3', 'Ben']} steps={chatSteps} interval={2800} />
}

// ── News feed ──────────────────────────────────────────────────────────────

const feedSteps: SequenceStep[] = [
  {
    message: { from: 0, to: 1, label: 'Asha posts (300 followers)' },
    note: 'Asha publishes a post. It is stored once, in the posts table, by ID.',
  },
  {
    message: { from: 1, to: 2, label: 'enqueue fan-out(post 9001)', tone: 'warn' },
    note: 'The write returns immediately. Spreading the post to followers happens asynchronously.',
  },
  {
    message: { from: 2, to: 3, label: 'push 9001 onto 300 feed lists', tone: 'ok' },
    panel: { title: 'feed cache: ben', lines: ['9001  ← new', '8977', '8960', '… (keep newest 800 IDs)'] },
    note: 'Fan-out on write: workers prepend the post ID to each follower\'s precomputed feed — a capped list of IDs in Redis. 300 small writes now.',
  },
  {
    message: { from: 4, to: 3, label: 'GET feed (Ben) → 20 IDs', tone: 'ok' },
    note: 'When Ben opens the app, his feed is already built: read 20 IDs, then fetch those posts (mostly from cache). Reads are cheap and fast — and reads outnumber writes by a lot.',
  },
  {
    message: { from: 0, to: 1, label: 'a celebrity posts (40M followers)', tone: 'bad' },
    note: 'The catch: one post from an account with 40 million followers would mean 40 million writes, and a long delay before the last follower sees it.',
  },
  {
    message: { from: 4, to: 1, label: 'merge: cached feed + recent celebrity posts', tone: 'ok' },
    panel: { title: 'hybrid', lines: ['normal accounts → fan-out on write', 'huge accounts → fetched at read time', 'merged and ranked per request'] },
    note: 'So big accounts are skipped during fan-out. At read time, the feed service pulls recent posts from the few big accounts Ben follows and merges them in. This hybrid is what large feeds do in practice.',
  },
]

export function NewsFeedVisualizer() {
  return <SequenceDiagram actors={['author', 'post service', 'fan-out workers', 'feed cache', 'reader']} steps={feedSteps} interval={2800} />
}

// ── Notification system ────────────────────────────────────────────────────

const notifySteps: SequenceStep[] = [
  {
    message: { from: 0, to: 1, label: 'notify(user 7, "order_shipped", key=ord-55:shipped)' },
    note: 'A product service asks for a notification by type and user — not "send this email". The idempotency key means a retried request can\'t notify twice.',
  },
  {
    message: { from: 1, to: 1, label: 'dedupe ✓ · prefs: push + email · quiet hours ✗', tone: 'ok' },
    panel: { title: 'user 7 preferences', lines: ['order updates: push, email', 'marketing: off', 'quiet hours: 23:00–07:00 (not now)'] },
    note: 'The notification service owns the rules: has this key been seen, which channels the user allows for this type, quiet hours, and per-user rate limits.',
  },
  {
    message: { from: 1, to: 2, label: 'enqueue push job, email job', tone: 'ok' },
    note: 'One job per channel goes onto a queue. Channels fail and scale independently: a slow email provider must not delay push notifications.',
  },
  {
    message: { from: 2, to: 3, label: 'email job' },
    note: 'An email worker renders the template, in the user\'s language, and calls the provider.',
  },
  {
    message: { from: 3, to: 4, label: 'send → 503', tone: 'bad' },
    note: 'The provider is having a bad minute.',
  },
  {
    message: { from: 3, to: 2, label: 'retry in 30 s, 2 min, 10 min…', tone: 'warn', dashed: true },
    panel: { title: 'email job', lines: ['attempt 1 failed (503)', 'retry with backoff + jitter', 'after 6 attempts → dead-letter queue'] },
    note: 'Retry with exponential backoff and jitter. After a fixed number of attempts, the job moves to a dead-letter queue for inspection, instead of retrying forever.',
  },
  {
    message: { from: 3, to: 4, label: 'send → 202 accepted', tone: 'ok' },
    note: 'The retry succeeds. The worker records the delivery, and the provider\'s later webhooks (delivered, bounced, opened) update that record.',
  },
]

export function NotificationSystemVisualizer() {
  return <SequenceDiagram actors={['order service', 'notifications', 'queue', 'email worker', 'provider']} steps={notifySteps} interval={2800} />
}

// ── Snowflake IDs ──────────────────────────────────────────────────────────

const SNOWFLAKE_CODE = [
  'const EPOCH = 1288834974657n // custom epoch (ms)',
  'let lastMs = -1n, seq = 0n',
  '',
  'function nextId(machineId: bigint) {',
  '  let now = BigInt(Date.now())',
  '  if (now < lastMs) throw new Error("clock moved backwards")',
  '  if (now === lastMs) {',
  '    seq = (seq + 1n) & 4095n          // 12 bits',
  '    if (seq === 0n) now = waitUntilAfter(lastMs)',
  '  } else {',
  '    seq = 0n',
  '  }',
  '  lastMs = now',
  '  return ((now - EPOCH) << 22n) | (machineId << 12n) | seq',
  '}',
]

const layout = (ts: string, machine: string, seq: string, id: string, tone?: Tone) =>
  panel('64-bit ID', [
    ['1 bit', '0 (sign)', 'muted'],
    ['41 bits · ms since epoch', ts],
    ['10 bits · machine', machine],
    ['12 bits · sequence', seq, tone],
    ['id', id, 'ok'],
  ])

const snowflakeSteps: TraceStep[] = [
  {
    lines: [0, 13],
    panels: [layout('—', '—', '—', '—')],
    note: 'A Snowflake ID packs three numbers into 64 bits: milliseconds since a chosen epoch, the generating machine, and a per-millisecond counter. No coordination between machines is needed.',
  },
  {
    lines: [4, 9, 10, 12, 13],
    panels: [layout('503,308,025,466', '37', '0', '2111026864444297216')],
    note: 'Machine 37 generates an ID at 2026-10-16 09:30:00.123 UTC. First ID in this millisecond, so the sequence is 0.',
  },
  {
    lines: [6, 7, 13],
    panels: [layout('503,308,025,466', '37', '1', '2111026864444297217', 'warn')],
    note: 'Another request in the same millisecond: the sequence becomes 1. Up to 4,096 IDs per millisecond per machine; beyond that, wait for the next millisecond.',
  },
  {
    lines: [9, 10, 13],
    panels: [layout('503,308,025,467', '37', '0', '2111026864448491520')],
    note: 'The next millisecond resets the sequence. Because the timestamp is in the high bits, IDs sort by creation time — handy for "newest first" and for B-tree inserts.',
  },
  {
    lines: [5],
    error: true,
    panels: [panel('the hazard', [['NTP steps the clock back', '5 ms', 'bad'], ['risk', 'reusing an ID already issued', 'bad'], ['response', 'refuse, or wait it out', 'ok']])],
    note: 'The one thing it depends on is the clock never going backwards. If it does, reusing old timestamps could repeat IDs, so the generator refuses (or waits) until time catches up.',
  },
  {
    lines: [0],
    panels: [panel('limits', [['41 bits of ms', '≈ 69.7 years from the epoch'], ['10 bits', '1,024 machines'], ['12 bits', '4,096 IDs / ms / machine']])],
    note: 'The bit split is a design choice. 41 bits of milliseconds last about 70 years from the epoch, which is why you choose a recent epoch rather than 1970.',
  },
]

export function SnowflakeVisualizer() {
  return <CodeTrace code={SNOWFLAKE_CODE} steps={snowflakeSteps} interval={3000} />
}

// ── Write-ahead logging ────────────────────────────────────────────────────

const walSteps: SequenceStep[] = [
  {
    message: { from: 0, to: 1, label: 'UPDATE accounts SET balance = 70 WHERE id = 1' },
    panel: { title: 'state', lines: ['page 12 (memory): balance = 100', 'page 12 (disk):   balance = 100', 'WAL: …'] },
    note: 'A transaction updates a row. The row lives in page 12 of the table file, and a copy of that page is in memory.',
  },
  {
    message: { from: 1, to: 2, label: 'append LSN 881: page 12, balance 100 → 70', tone: 'warn' },
    panel: { title: 'state', lines: ['page 12 (memory): balance = 70  (dirty)', 'page 12 (disk):   balance = 100', 'WAL: … 881 update'] },
    note: 'The change is applied to the page in memory and described in a log record. Each record gets a log sequence number (LSN).',
  },
  {
    message: { from: 1, to: 2, label: 'COMMIT → append + fsync', tone: 'ok' },
    panel: { title: 'state', lines: ['page 12 (memory): balance = 70  (dirty)', 'page 12 (disk):   balance = 100', 'WAL (on disk): … 881 update, 882 commit'] },
    note: 'At commit, the log is flushed to disk with fsync — one sequential write. The table page itself is not written yet.',
  },
  {
    message: { from: 1, to: 0, label: 'COMMIT OK', dashed: true, tone: 'ok' },
    note: 'Now the commit is durable: the log on disk is enough to rebuild the change. Random writes to table pages can happen later, in batches.',
  },
  {
    message: { from: 1, to: 1, label: '✕ power loss', tone: 'bad' },
    panel: { title: 'state', lines: ['page 12 (memory): lost', 'page 12 (disk):   balance = 100  (stale)', 'WAL (on disk): … 881 update, 882 commit'] },
    note: 'The machine crashes before the dirty page is written. The table file on disk still says 100.',
  },
  {
    message: { from: 2, to: 1, label: 'recovery: redo from last checkpoint', tone: 'ok' },
    panel: { title: 'state', lines: ['replay LSN 881 → page 12 balance = 70', 'transactions without a commit record are undone'] },
    note: 'On restart, the database reads the log from the last checkpoint and re-applies committed changes. Uncommitted ones are rolled back. Nothing acknowledged is lost.',
  },
  {
    message: { from: 1, to: 3, label: 'checkpoint: flush dirty pages', tone: 'ok' },
    note: 'Periodically, a checkpoint writes dirty pages to the table files, after which older log segments can be recycled. The same log also feeds replicas and point-in-time recovery.',
  },
]

export function WalVisualizer() {
  return <SequenceDiagram actors={['client', 'database', 'WAL (disk)', 'table files']} steps={walSteps} interval={2800} />
}

// ── Read-your-writes ───────────────────────────────────────────────────────

const rywSteps: SequenceStep[] = [
  {
    message: { from: 0, to: 1, label: 'PATCH /profile { name: "Asha K" }' },
    note: 'Asha edits her display name. Writes go to the primary database; reads are spread across replicas to take load off it.',
  },
  {
    message: { from: 1, to: 2, label: 'UPDATE users … (commit at LSN 5,120)', tone: 'ok' },
    note: 'The primary commits. Replication to the replica is asynchronous, and it\'s running 800 ms behind.',
  },
  {
    message: { from: 1, to: 0, label: '200 OK', dashed: true, tone: 'ok' },
    note: 'The app says "Saved" and reloads the profile page.',
  },
  {
    message: { from: 1, to: 3, label: 'SELECT name … → "Asha"', tone: 'bad' },
    panel: { title: 'replica', lines: ['replayed up to LSN 5,090', 'the new name is not here yet'] },
    note: 'The read goes to a replica that hasn\'t replayed the write. Asha sees her old name and thinks the save failed. Replication lag broke read-your-writes.',
  },
  {
    message: { from: 1, to: 2, label: 'read own profile from primary for 5 s', tone: 'ok' },
    panel: { title: 'fix 1: route by recency', lines: ['after a user writes, send their reads', 'to the primary for a short window'] },
    note: 'Fix 1: after a user writes, route their reads to the primary for a few seconds — longer than lag usually is.',
  },
  {
    message: { from: 1, to: 3, label: 'read, wait until replica ≥ LSN 5,120', tone: 'ok' },
    panel: { title: 'fix 2: track the position', lines: ['remember the commit position in the session', 'use a replica that has reached it, or wait'] },
    note: 'Fix 2, more precise: remember the write\'s log position in the session, and only read from a replica that has replayed at least that far.',
  },
]

export function ReadYourWritesVisualizer() {
  return <SequenceDiagram actors={['Asha', 'app', 'primary', 'replica']} steps={rywSteps} interval={2800} />
}

// ── Connection pooling ─────────────────────────────────────────────────────

const POOL_CODE = [
  'const pool = new Pool({ max: 3, connectionTimeoutMillis: 2000 })',
  '',
  'async function handler(req) {',
  '  const client = await pool.connect()   // borrow',
  '  try {',
  "    return await client.query('SELECT …', [req.id])",
  '  } finally {',
  '    client.release()                     // give it back',
  '  }',
  '}',
]

const poolState = (conns: string[], waiting: string, note?: [string, string, Tone?]) =>
  panel('pool (max 3)', [
    ...conns.map((c, i) => [`conn ${i + 1}`, c, c.startsWith('busy') ? 'warn' : c === 'idle' ? 'ok' : 'muted'] as [string, string, Tone]),
    ['waiting', waiting, waiting === '—' ? 'muted' : 'bad'],
    ...(note ? [note] : []),
  ])

const poolSteps: TraceStep[] = [
  {
    lines: [0],
    panels: [poolState([], '—', ['open cost', 'TCP + TLS + auth ≈ 20–50 ms'])],
    note: 'Opening a database connection costs several round trips plus authentication, and each one uses memory on the server. Doing that per request is slow; holding thousands is expensive for the database.',
  },
  {
    lines: [3, 5],
    panels: [poolState(['busy · req A', 'not opened', 'not opened'], '—')],
    note: 'Request A borrows a connection. The pool opens one the first time, then keeps it.',
  },
  {
    lines: [3, 5],
    panels: [poolState(['busy · req A', 'busy · req B', 'busy · req C'], '—')],
    note: 'B and C arrive at the same time. The pool grows to its maximum of 3.',
  },
  {
    lines: [3],
    panels: [poolState(['busy · req A', 'busy · req B', 'busy · req C'], 'req D')],
    note: 'D finds every connection busy and waits in a queue. This is the point of the limit: the database sees at most 3 concurrent queries from this process, however busy the app gets.',
  },
  {
    lines: [7],
    panels: [poolState(['busy · req D', 'busy · req B', 'busy · req C'], '—')],
    note: 'A finishes and releases its connection — already open, already authenticated — and D gets it immediately.',
  },
  {
    lines: [6, 7],
    panels: [poolState(['idle', 'idle', 'idle'], '—', ['next request', 'reuses an open connection', 'ok'])],
    note: 'Everything is released and the connections sit idle, ready. The finally block matters: a code path that forgets release() leaks a connection, and after three leaks every request waits until timeout.',
  },
]

export function ConnectionPoolVisualizer() {
  return <CodeTrace code={POOL_CODE} steps={poolSteps} interval={2800} />
}

// ── Load shedding ──────────────────────────────────────────────────────────

const SHED_CODE = [
  'const MAX_IN_FLIGHT = 100',
  'const MAX_QUEUE = 50',
  'let inFlight = 0',
  'const queue: Waiter[] = []',
  '',
  'async function admit(req: Request) {',
  '  if (inFlight < MAX_IN_FLIGHT) return start(req)',
  "  if (queue.length >= MAX_QUEUE) return reject(req, 503) // shed",
  '  if (req.deadline - Date.now() < expectedWait()) return reject(req, 503)',
  '  return enqueue(req)',
  '}',
]

const server = (rps: string, inflight: string, queue: string, p99: string, outcome: [string, string, Tone]) =>
  panel('server (capacity ≈ 1,000 req/s)', [
    ['incoming', rps],
    ['in flight', inflight],
    ['queued', queue],
    ['p99 latency', p99],
    outcome,
  ])

const shedSteps: TraceStep[] = [
  {
    lines: [6],
    panels: [server('600/s', '60', '0', '80 ms', ['outcome', 'everything served', 'ok'])],
    note: 'Under normal load every request starts immediately.',
  },
  {
    lines: [6, 9],
    panels: [server('1,100/s', '100', '30', '240 ms', ['outcome', 'short queue absorbs the burst', 'ok'])],
    note: 'A burst exceeds capacity. A short queue absorbs it — fine, as long as the burst ends.',
  },
  {
    lines: [],
    panels: [
      server('2,000/s', '400', '9,000', '45 s', ['without shedding', 'every request times out', 'bad']),
    ],
    note: 'Without limits, the overload doesn\'t end: the queue grows without bound, latency climbs past every client\'s timeout, and the server spends its time on requests whose callers have already given up. Throughput of useful work drops toward zero.',
  },
  {
    lines: [7],
    panels: [server('2,000/s', '100', '50', '300 ms', ['with shedding', '~1,000/s served, ~1,000/s get a fast 503', 'ok'])],
    note: 'With a bounded queue, excess requests are rejected immediately with a 503. Half the traffic fails fast, but the other half is served at normal latency — far better than everyone timing out.',
  },
  {
    lines: [8],
    panels: [panel('smarter shedding', [['deadline already too close', 'reject before doing the work'], ['priority', 'shed background jobs before checkout'], ['clients', 'back off on 503 + Retry-After', 'ok']])],
    note: 'Better still: reject work that can\'t finish before its deadline, shed low-priority traffic first, and have clients back off when they see 503s instead of retrying instantly.',
  },
]

export function LoadSheddingVisualizer() {
  return <CodeTrace code={SHED_CODE} steps={shedSteps} interval={3000} />
}
