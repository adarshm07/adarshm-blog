import { SequenceDiagram, type SequenceStep } from '@/app/components/sequence-diagram'
import { CodeTrace, type TracePanel, type TraceStep } from '@/app/components/code-trace'

type Tone = 'ok' | 'warn' | 'bad' | 'muted'
const panel = (title: string, rows: [string, string, Tone?][]): TracePanel => ({
  title,
  rows: rows.map(([k, v, tone]) => ({ k, v, tone })),
})

// ── Accessibility: div vs button ───────────────────────────────────────────

const A11Y_CODE = [
  '<div class="btn" onclick="save()">',
  '  <img src="disk.svg">',
  '</div>',
  '',
  '<button type="button" onclick="save()">',
  '  <img src="disk.svg" alt="">',
  '  Save draft',
  '</button>',
  '',
  '<label for="email">Email</label>',
  '<input id="email" type="email" autocomplete="email">',
]

const tree = (rows: [string, string, Tone?][]) => panel('accessibility tree', rows)

const a11ySteps: TraceStep[] = [
  {
    lines: [0, 1, 2],
    panels: [tree([['role', 'generic (none)', 'bad'], ['name', '— (the image has no alt)', 'bad'], ['focusable', 'no', 'bad'], ['Enter / Space', 'nothing', 'bad']])],
    note: 'It looks like a button and works with a mouse. But browsers build a second tree for assistive technology, and in it this is an unnamed, unfocusable generic element. Keyboard users can\'t reach it; screen readers can\'t say what it is.',
  },
  {
    lines: [4, 5, 6, 7],
    panels: [tree([['role', 'button', 'ok'], ['name', '"Save draft"', 'ok'], ['focusable', 'yes — in tab order', 'ok'], ['Enter / Space', 'clicks', 'ok']])],
    note: 'A real <button> gets all of it for free: the role, a name from its text, a place in the tab order, keyboard activation, and disabled states. The icon has alt="" because it\'s decorative — the text already names the button.',
  },
  {
    lines: [9, 10],
    panels: [tree([['role', 'textbox'], ['name', '"Email" (from the label)', 'ok'], ['clicking the label', 'focuses the input', 'ok'], ['autofill', 'email', 'ok']])],
    note: 'Forms need labels tied to inputs. The label names the field for screen readers, gives a bigger click target, and autocomplete lets browsers and password managers fill it. A placeholder is not a label: it disappears as soon as you type.',
  },
  {
    lines: [0],
    panels: [panel('if you must use a div', [['role="button"', 'the role'], ['tabindex="0"', 'focusable'], ['keydown for Enter + Space', 'activation'], ['aria-label or text', 'a name'], ['verdict', 'four fixes to rebuild <button>', 'warn']])],
    note: 'Making the div accessible takes a role, a tabindex, two key handlers and a name — and you\'d still miss details like focus styles and disabled states. The first rule of ARIA: use the native element if one exists.',
  },
]

export function AccessibilityVisualizer() {
  return <CodeTrace code={A11Y_CODE} steps={a11ySteps} interval={3200} />
}

// ── Responsive images ──────────────────────────────────────────────────────

const IMG_CODE = [
  '<img',
  '  src="hero-800.jpg"',
  '  srcset="hero-480.jpg 480w, hero-800.jpg 800w,',
  '          hero-1200.jpg 1200w, hero-1600.jpg 1600w"',
  '  sizes="(max-width: 600px) 100vw, 600px"',
  '  width="1600" height="900"',
  '  alt="A mountain lake at sunrise"',
  '  loading="lazy" decoding="async">',
]

const pick = (device: string, slot: string, need: string, file: string, saved?: string) =>
  panel(device, [['image slot (from sizes)', slot], ['× device pixel ratio', need], ['browser picks', file, 'ok'], ...(saved ? [['vs. always 1600w', saved, 'ok'] as [string, string, Tone]] : [])])

const imgSteps: TraceStep[] = [
  {
    lines: [2, 3],
    panels: [panel('srcset', [['480w', 'hero-480.jpg'], ['800w', 'hero-800.jpg'], ['1200w', 'hero-1200.jpg'], ['1600w', 'hero-1600.jpg']])],
    note: 'srcset lists the same image at several widths, each tagged with its real pixel width (w). The browser chooses one — you describe the options, it knows the screen.',
  },
  {
    lines: [4],
    panels: [panel('sizes', [['viewport ≤ 600px', 'image is 100% of the viewport'], ['otherwise', 'image is 600 CSS px wide']])],
    note: 'sizes tells the browser how wide the image will be displayed, before CSS has loaded. Without it, the browser assumes 100vw — the full viewport — and picks images that are far too large on desktop layouts.',
  },
  {
    lines: [2, 3, 4],
    panels: [pick('phone · 390px · DPR 3', '390 CSS px', '1,170 device px', 'hero-1200.jpg')],
    note: 'A phone 390 CSS pixels wide with a 3× screen needs about 1,170 device pixels, so the browser takes the smallest candidate that covers it: 1200w.',
  },
  {
    lines: [2, 3, 4],
    panels: [pick('desktop · 1440px · DPR 1', '600 CSS px', '600 device px', 'hero-800.jpg', '¼ of the pixels to download')],
    note: 'On a 1× desktop monitor the image is 600 CSS pixels wide, so 800w is plenty. Serving the 1600-pixel file here would waste most of its bytes. (Browsers may also pick smaller files on slow or data-saver connections.)',
  },
  {
    lines: [5, 7],
    panels: [panel('the other attributes', [['width / height', 'reserve space — no layout shift', 'ok'], ['loading="lazy"', 'fetch when near the viewport', 'ok'], ['but not for the LCP image', 'it delays it', 'warn'], ['decoding="async"', 'decode off the critical path']])],
    note: 'width and height let the browser reserve the right aspect ratio before the file arrives, which prevents layout shift (CLS). loading="lazy" defers off-screen images — but never lazy-load the hero image that is your Largest Contentful Paint.',
  },
]

export function ResponsiveImagesVisualizer() {
  return <CodeTrace code={IMG_CODE} steps={imgSteps} interval={3000} />
}

// ── requestAnimationFrame ──────────────────────────────────────────────────

const RAF_CODE = [
  'const SPEED = 300 // px per second',
  'let x = 0, last = performance.now()',
  '',
  'function frame(now) {',
  '  const dt = (now - last) / 1000   // seconds since last frame',
  '  last = now',
  '  x = Math.min(x + SPEED * dt, 600)',
  '  box.style.transform = `translateX(${x}px)`',
  '  if (x < 600) requestAnimationFrame(frame)',
  '}',
  'requestAnimationFrame(frame)',
]

const rafSteps: TraceStep[] = [
  {
    lines: [10],
    panels: [panel('setInterval(fn, 16) instead', [['fires', 'on its own clock, not the display\'s'], ['result', 'frames skipped or drawn twice', 'bad'], ['in a background tab', 'keeps running (throttled)', 'warn']])],
    note: 'A timer every 16 ms drifts against the screen\'s refresh, so some frames get two updates and others none — visible as stutter. requestAnimationFrame instead runs your callback once, right before the browser paints the next frame.',
  },
  {
    lines: [3, 4, 5, 6],
    panels: [panel('60 Hz display', [['now − last', '16.7 ms'], ['dt', '0.0167 s'], ['x moves', '300 × 0.0167 = 5 px']])],
    note: 'Use the timestamp the browser passes in. Move by speed × elapsed time, not a fixed step per frame — then the animation runs at the same speed however often frames happen.',
  },
  {
    lines: [4, 6],
    panels: [panel('120 Hz display', [['now − last', '8.3 ms'], ['x moves', '2.5 px per frame'], ['speed', 'still 300 px/s', 'ok']])],
    note: 'On a 120 Hz screen frames come twice as often, each moving half as far. A fixed "5 px per frame" would run twice as fast on this device.',
  },
  {
    lines: [4],
    panels: [panel('a slow frame', [['now − last', '50 ms (main thread was busy)'], ['x moves', '15 px — catches up', 'ok'], ['tip', 'clamp dt after a long pause', 'warn']])],
    note: 'If the main thread was blocked, the next frame simply covers more distance. After a tab was hidden, though, dt can be seconds — clamp it so objects don\'t teleport.',
  },
  {
    lines: [7],
    panels: [panel('what to animate', [['transform, opacity', 'compositor only — cheap', 'ok'], ['left, top, width', 'layout every frame', 'bad'], ['in a hidden tab', 'rAF pauses — saves battery', 'ok']])],
    note: 'Change transform rather than left: it skips layout and paint and can run on the compositor. For plain transitions, CSS animations or the Web Animations API are simpler still — use rAF when each frame needs JavaScript.',
  },
]

export function AnimationFrameVisualizer() {
  return <CodeTrace code={RAF_CODE} steps={rafSteps} interval={3000} />
}

// ── Runtime validation with Zod ────────────────────────────────────────────

const ZOD_CODE = [
  "import { z } from 'zod'",
  '',
  'const Order = z.object({',
  '  id: z.uuid(),',
  '  email: z.email(),',
  '  items: z.array(z.object({',
  '    sku: z.string(),',
  '    qty: z.number().int().positive(),',
  '  })).min(1),',
  '  coupon: z.string().optional(),',
  '})',
  'type Order = z.infer<typeof Order>',
  '',
  'const result = Order.safeParse(await req.json())',
]

const zodSteps: TraceStep[] = [
  {
    lines: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    panels: [panel('the problem', [['await req.json()', 'type: any'], ['as Order', 'a promise, not a check', 'bad']])],
    note: 'TypeScript\'s types vanish at runtime. Anything that crosses a boundary — a request body, an API response, localStorage, an env var — is untyped until you check it. A schema is a check you can run.',
  },
  {
    lines: [11],
    panels: [panel('z.infer<typeof Order>', [['id', 'string'], ['email', 'string'], ['items', '{ sku: string; qty: number }[]'], ['coupon', 'string | undefined']])],
    note: 'The schema also produces the TypeScript type, so the runtime check and the static type can never drift apart. Write the shape once.',
  },
  {
    lines: [13],
    error: true,
    panels: [
      panel('input', [['', '{ id: "123", email: "asha@",'], ['', '  items: [{ sku: "A1", qty: 0 },'], ['', '          { sku: 42, qty: 2 }] }']]),
      panel('result.error.issues', [['id', 'Invalid UUID', 'bad'], ['email', 'Invalid email address', 'bad'], ['items[0].qty', 'Too small: expected number to be >0', 'bad'], ['items[1].sku', 'Invalid input: expected string, received number', 'bad']]),
    ],
    note: 'safeParse never throws: it returns success: false with every problem, each with a path. That maps straight onto a 400 response or form errors next to each field.',
  },
  {
    lines: [13],
    panels: [panel('valid input', [['result.success', 'true', 'ok'], ['result.data', 'typed as Order', 'ok'], ['unknown keys', 'stripped by default'], ['strict mode', 'z.strictObject rejects them']])],
    note: 'On success, result.data is the parsed value with the Order type — and keys the schema doesn\'t know about are removed, so extra fields can\'t sneak into your database.',
  },
]

export function ZodVisualizer() {
  return <CodeTrace code={ZOD_CODE} steps={zodSteps} interval={3200} />
}

// ── Rerankers ──────────────────────────────────────────────────────────────

const RERANK_CODE = [
  'const candidates = await hybridSearch(query, { limit: 50 })',
  'const scored = await reranker.score(query, candidates.map((c) => c.text))',
  'const top = candidates',
  '  .map((c, i) => ({ ...c, score: scored[i] }))',
  '  .sort((a, b) => b.score - a.score)',
  '  .slice(0, 5)',
]

const QUERY = 'Can I get a refund after 30 days?'

const rerankSteps: TraceStep[] = [
  {
    lines: [0],
    panels: [panel(`first stage: "${QUERY}"`, [['1', 'Refund policy overview'], ['2', 'How to request a refund'], ['3', '30-day free trial terms'], ['4', 'Refunds after the return window'], ['5', 'Shipping times by region']])],
    note: 'Retrieval with embeddings or BM25 is fast because documents are encoded once, ahead of time, without seeing the query. That\'s also its weakness: "30 days" pulls in the free-trial page, and the page that actually answers the question is fourth.',
  },
  {
    lines: [1],
    panels: [panel('cross-encoder', [['input', '[query] + [document], together'], ['output', 'one relevance score'], ['cost', 'one model call per pair', 'warn']])],
    note: 'A reranker (a cross-encoder) reads the query and one candidate together, so every word of each can attend to the other. It judges whether this text answers this question — much more precisely, and much more slowly.',
  },
  {
    lines: [2, 3, 4, 5],
    panels: [panel('after reranking (example scores)', [['0.94', 'Refunds after the return window', 'ok'], ['0.81', 'Refund policy overview'], ['0.62', 'How to request a refund'], ['0.08', '30-day free trial terms', 'muted'], ['0.02', 'Shipping times by region', 'muted']])],
    note: 'Reranked, the page about refunds after the window comes first, and the free-trial page drops out. The scores here are illustrative; the pattern — the right answer moving up, keyword lookalikes falling — is what rerankers are for.',
  },
  {
    lines: [5],
    panels: [panel('the budget', [['retrieve', '50 candidates — milliseconds'], ['rerank', '50 pairs — tens to hundreds of ms', 'warn'], ['send to the LLM', 'top 5', 'ok']])],
    note: 'That cost is why it\'s a second stage: retrieve wide and cheap, rerank a short list, and send only the best few to the model. Fewer, better chunks also mean a smaller prompt.',
  },
]

export function RerankerVisualizer() {
  return <CodeTrace code={RERANK_CODE} steps={rerankSteps} interval={3200} />
}

// ── Speculative decoding ───────────────────────────────────────────────────

const specSteps: SequenceStep[] = [
  {
    panel: { title: 'so far', lines: ['"The capital of France is"'] },
    note: 'A large model produces one token per forward pass, and each pass is limited by reading its weights from memory — the GPU\'s arithmetic sits mostly idle. Speculative decoding puts that idle capacity to work.',
  },
  {
    message: { from: 0, to: 0, label: 'draft 4 tokens: " Paris" "," " a" " city"', tone: 'warn' },
    note: 'A small, fast draft model guesses the next few tokens, one after another. Each guess costs a fraction of a large-model step.',
  },
  {
    message: { from: 0, to: 1, label: 'verify all 4 in ONE forward pass' },
    note: 'The large model checks every drafted position in a single pass — processing several known tokens at once costs about the same as generating one, because the bottleneck is reading the weights, not the arithmetic.',
  },
  {
    message: { from: 1, to: 1, label: '" Paris" ✓  "," ✓  " a" ✓  " city" ✕ → " known"', tone: 'ok' },
    panel: { title: 'verification', lines: ['accept while the target model agrees', 'at the first disagreement, use its token', 'discard the rest of the draft'] },
    note: 'It accepts the drafted tokens it agrees with, up to the first disagreement. At that position it substitutes its own token.',
  },
  {
    message: { from: 1, to: 2, label: '4 tokens from one large-model pass', tone: 'ok' },
    panel: { title: 'so far', lines: ['"The capital of France is Paris, a known"'] },
    note: 'One expensive pass produced four tokens instead of one. With a sampling-based acceptance rule, the output distribution is exactly the large model\'s — speed changes, quality doesn\'t.',
  },
  {
    message: { from: 0, to: 0, label: 'next round from "known"', tone: 'warn' },
    note: 'Repeat. The speed-up depends on how often the draft is right: predictable text (code, boilerplate, quoting the prompt) accepts long runs; creative text accepts fewer. Typical gains are around 2–3×.',
  },
]

export function SpeculativeDecodingVisualizer() {
  return <SequenceDiagram actors={['draft model', 'target model', 'output']} steps={specSteps} interval={2800} />
}

// ── Parking lot LLD ────────────────────────────────────────────────────────

const parkingSteps: SequenceStep[] = [
  {
    message: { from: 0, to: 1, label: 'park(car KA-01-1234)' },
    panel: { title: 'classes', lines: ['ParkingLot → Level → ParkingSpot', 'Vehicle: size (SMALL | MEDIUM | LARGE)', 'SpotAllocator, PricingPolicy (interfaces)'] },
    note: 'A car arrives at the entry gate. The gate knows nothing about levels or spots — it asks the parking lot.',
  },
  {
    message: { from: 1, to: 2, label: 'findSpot(MEDIUM)' },
    note: 'The lot delegates the choice to a SpotAllocator — a strategy. "Nearest to the entrance" and "fill lower levels first" are interchangeable implementations.',
  },
  {
    message: { from: 2, to: 3, label: 'tryReserve(spot L2-14)', tone: 'warn' },
    note: 'Two cars can arrive at once and want the same spot. Reservation must be atomic: compare-and-set on the spot\'s state, or a lock per level.',
  },
  {
    message: { from: 3, to: 2, label: 'reserved ✓', dashed: true, tone: 'ok' },
    note: 'The spot goes from FREE to OCCUPIED in one step. If another thread won the race, the allocator simply tries the next candidate.',
  },
  {
    message: { from: 1, to: 4, label: 'new Ticket(L2-14, entry 09:00)', tone: 'ok' },
    panel: { title: 'Ticket', lines: ['id, vehicle, spot', 'entryTime: 09:00', 'status: ACTIVE'] },
    note: 'The ticket records the vehicle, the spot and the entry time — everything needed to charge and free the spot later.',
  },
  {
    message: { from: 0, to: 1, label: 'leave(ticket) at 12:30' },
    note: 'On exit, the lot looks up the ticket.',
  },
  {
    message: { from: 1, to: 1, label: 'PricingPolicy.fee(ticket) → ₹160; free L2-14', tone: 'ok' },
    note: 'Pricing is another strategy (hourly, flat weekend rate…). The fee is computed, the payment taken, the spot freed and the ticket closed. New vehicle types or pricing rules add classes; none of this flow changes.',
  },
]

export function ParkingLotVisualizer() {
  return <SequenceDiagram actors={['entry gate', 'ParkingLot', 'SpotAllocator', 'Level 2', 'Ticket']} steps={parkingSteps} interval={2800} />
}

// ── Sweep line ─────────────────────────────────────────────────────────────

const SWEEP_CODE = [
  'const events = []',
  'for (const [start, end] of meetings) {',
  '  events.push([start, +1], [end, -1])',
  '}',
  'events.sort((a, b) => a[0] - b[0] || a[1] - b[1])  // ends first on ties',
  '',
  'let rooms = 0, maxRooms = 0',
  'for (const [, delta] of events) {',
  '  rooms += delta',
  '  maxRooms = Math.max(maxRooms, rooms)',
  '}',
]

const sweep = (rows: [string, string, Tone?][], rooms: string, max: string) =>
  panel('sweeping left to right', [...rows, ['rooms in use', rooms], ['max so far', max, 'ok']])

const sweepSteps: TraceStep[] = [
  {
    lines: [0, 1, 2, 3],
    panels: [panel('meetings', [['A', '9:00 – 10:30'], ['B', '9:30 – 11:00'], ['C', '10:00 – 10:30'], ['D', '10:30 – 12:00'], ['E', '11:00 – 12:30']])],
    note: 'How many meeting rooms do these need? Comparing every pair is O(n²). Instead, turn each meeting into two events: +1 at its start, −1 at its end.',
  },
  {
    lines: [4],
    panels: [panel('sorted events', [['9:00 +1, 9:30 +1, 10:00 +1', ''], ['10:30 −1, −1, +1', 'ends before starts'], ['11:00 −1, +1', ''], ['12:00 −1, 12:30 −1', '']])],
    note: 'Sort by time. On a tie, process ends before starts: a meeting ending at 10:30 frees its room for one starting at 10:30.',
  },
  {
    lines: [7, 8, 9],
    panels: [sweep([['9:00', 'A starts'], ['9:30', 'B starts'], ['10:00', 'C starts']], '3', '3')],
    note: 'Sweep through the events keeping a running count. By 10:00, A, B and C overlap: 3 rooms.',
  },
  {
    lines: [8, 9],
    panels: [sweep([['10:30', 'A and C end → 1'], ['10:30', 'D starts → 2']], '2', '3')],
    note: 'At 10:30 two meetings end before D starts, so the count dips to 1 and rises to 2. Had starts come first, it would wrongly reach 4.',
  },
  {
    lines: [9],
    panels: [sweep([['11:00', 'B ends, E starts'], ['12:00', 'D ends'], ['12:30', 'E ends']], '0', '3')],
    note: 'The answer is the peak: 3 rooms. Sorting dominates — O(n log n) — and the sweep itself is a single pass. The same idea finds the busiest moment in logs, the skyline of buildings, and overlapping rectangles.',
  },
]

export function SweepLineVisualizer() {
  return <CodeTrace code={SWEEP_CODE} steps={sweepSteps} interval={3000} />
}

// ── Inverted index ─────────────────────────────────────────────────────────

const INDEX_CODE = [
  'const docs = {',
  "  1: 'fast cache invalidation',",
  "  2: 'cache stampede protection',",
  "  3: 'fast retries with jitter',",
  "  4: 'stampede in the cache layer',",
  '}',
  '',
  '// term → list of [docId, position]',
  'index.cache    = [[1, 1], [2, 0], [4, 3]]',
  'index.stampede = [[2, 1], [4, 0]]',
  'index.fast     = [[1, 0], [3, 0]]',
]

const indexSteps: TraceStep[] = [
  {
    lines: [0, 1, 2, 3, 4, 5],
    panels: [panel('without an index', [['query "cache stampede"', 'read every document'], ['cost', 'O(total text)', 'bad']])],
    note: 'Searching by scanning every document works for four documents and fails for four million. A search engine flips the data around ahead of time.',
  },
  {
    lines: [7, 8, 9, 10],
    panels: [panel('inverted index', [['cache', 'docs 1, 2, 4'], ['stampede', 'docs 2, 4'], ['fast', 'docs 1, 3'], ['…', 'one list per term']])],
    note: 'For every term, store the sorted list of documents containing it (a postings list), with positions. Text is first split into terms and normalised — lowercase, sometimes stemmed — the same way queries will be.',
  },
  {
    lines: [8, 9],
    panels: [panel('AND query: cache ∩ stampede', [['cache', '1, 2, 4'], ['stampede', '2, 4'], ['intersection', '2, 4', 'ok']])],
    note: 'A query only reads the postings lists of its terms. Both lists are sorted by document ID, so intersecting them is a linear merge — or faster, by skipping ahead.',
  },
  {
    lines: [8, 9],
    panels: [panel('phrase: "cache stampede"', [['doc 2', 'cache@0, stampede@1 → adjacent', 'ok'], ['doc 4', 'stampede@0, cache@3 → not a phrase', 'muted']])],
    note: 'Positions answer phrase queries: in doc 2, "stampede" comes right after "cache". Doc 4 has both words, but not as the phrase.',
  },
  {
    lines: [10],
    panels: [panel('ranking', [['BM25', 'rare terms count more, repeats saturate'], ['doc 2', 'ranks first: same terms, shorter document', 'ok']])],
    note: 'Matching documents are then ranked, typically with BM25. That is Lucene, Elasticsearch and Postgres full-text search in outline: an inverted index, set operations on postings, and a scoring function.',
  },
]

export function InvertedIndexVisualizer() {
  return <CodeTrace code={INDEX_CODE} steps={indexSteps} interval={3000} />
}

// ── Cache stampede ─────────────────────────────────────────────────────────

const stampedeSteps: SequenceStep[] = [
  {
    message: { from: 0, to: 1, label: 'GET homepage:feed → hit', tone: 'ok' },
    panel: { title: 'cache', lines: ['homepage:feed (TTL 60 s)', '2,000 reads/s, all hits', 'the query behind it takes 2 s'] },
    note: 'A popular key is read 2,000 times a second, always from cache. Computing it from the database takes a 2-second query.',
  },
  {
    message: { from: 1, to: 1, label: '⏰ TTL expires', tone: 'warn' },
    note: 'The key expires.',
  },
  {
    message: { from: 0, to: 2, label: '~4,000 requests miss → 4,000 identical queries', tone: 'bad' },
    note: 'For the two seconds it takes to recompute, every request misses — and each one runs the same expensive query. The database, sized for cache misses being rare, falls over. That\'s a cache stampede.',
  },
  {
    message: { from: 0, to: 1, label: 'miss → acquire lock "rebuild:homepage:feed"', tone: 'ok' },
    panel: { title: 'fix 1: single flight', lines: ['first miss takes a lock, recomputes', 'others: stale value, or wait', 'one query, not thousands'] },
    note: 'Fix 1: let exactly one request recompute. It takes a short-lived lock (SET NX with a TTL in Redis); everyone else waits briefly or gets the previous value.',
  },
  {
    message: { from: 0, to: 2, label: 'one rebuild query', tone: 'ok' },
    note: 'The database sees one query, not thousands. In a single process, the same idea is "coalesce concurrent calls for the same key into one promise".',
  },
  {
    message: { from: 0, to: 1, label: 'refresh early, before expiry', tone: 'ok' },
    panel: { title: 'fix 2 + 3', lines: ['serve stale, refresh in background', 'refresh early, likelier near expiry', 'jitter TTLs: no mass expiry'] },
    note: 'Better still, never let hot keys expire under load: refresh them in the background before the TTL, serve slightly stale data meanwhile, and add jitter to TTLs so many keys don\'t expire at the same second.',
  },
]

export function CacheStampedeVisualizer() {
  return <SequenceDiagram actors={['app servers', 'cache', 'database']} steps={stampedeSteps} interval={2800} />
}
