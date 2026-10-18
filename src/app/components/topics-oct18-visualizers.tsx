import { SequenceDiagram, type SequenceStep } from '@/app/components/sequence-diagram'
import { CodeTrace, type TracePanel, type TraceStep } from '@/app/components/code-trace'

type Tone = 'ok' | 'warn' | 'bad' | 'muted'
const panel = (title: string, rows: [string, string, Tone?][]): TracePanel => ({
  title,
  rows: rows.map(([k, v, tone]) => ({ k, v, tone })),
})

// ── Web crawler ────────────────────────────────────────────────────────────

const crawlerSteps: SequenceStep[] = [
  {
    message: { from: 0, to: 1, label: 'next URL for host blog.example (last hit 9 s ago)' },
    panel: { title: 'URL frontier', lines: ['one queue per host', 'priority by importance / freshness', 'politeness: ≥ 1 request per host every few s'] },
    note: 'The frontier holds URLs waiting to be fetched, grouped by host. A host is only handed out when enough time has passed since its last fetch — a crawler must not hammer anyone\'s server.',
  },
  {
    message: { from: 1, to: 2, label: 'robots.txt allows /posts/? DNS?', tone: 'ok' },
    note: 'Before fetching, check the site\'s robots.txt rules (cached per host) and resolve DNS from a local cache — at crawl scale, DNS lookups are a real bottleneck.',
  },
  {
    message: { from: 1, to: 1, label: 'GET /posts/42 → 200, 48 KB HTML', tone: 'ok' },
    note: 'Fetch the page with timeouts and a size limit. Thousands of fetches run concurrently on each machine; network waiting, not CPU, is the cost.',
  },
  {
    message: { from: 1, to: 3, label: 'parse: text + 37 links' },
    note: 'The parser extracts the content to store and the outgoing links, normalising each URL (lowercase host, remove fragments, resolve relative paths).',
  },
  {
    message: { from: 3, to: 4, label: 'seen? 31 known (Bloom filter) · content hash new', tone: 'ok' },
    panel: { title: 'dedupe', lines: ['URL seen-set: Bloom filter / key-value store', 'content fingerprint: catches mirrors', 'traps: calendars, session IDs in URLs'] },
    note: 'Most links point to pages already seen. A Bloom filter answers "seen this URL?" in memory for billions of URLs. A content fingerprint catches the same page under different URLs.',
  },
  {
    message: { from: 4, to: 0, label: 'enqueue 6 new URLs', dashed: true, tone: 'ok' },
    note: 'New URLs go back into the frontier, under their hosts\' queues. The loop is a breadth-first search over the web graph, with politeness and priorities deciding the order.',
  },
]

export function WebCrawlerVisualizer() {
  return <SequenceDiagram actors={['frontier', 'fetcher', 'robots + DNS', 'parser', 'dedupe + store']} steps={crawlerSteps} interval={2800} />
}

// ── Ride hailing ───────────────────────────────────────────────────────────

const rideSteps: SequenceStep[] = [
  {
    message: { from: 3, to: 2, label: 'location every ~4 s (lat, lng)' },
    panel: { title: 'location service', lines: ['in-memory index by geo cell', 'driver → cell, cell → drivers', 'only the latest position is kept hot'] },
    note: 'Every online driver\'s app sends its position every few seconds. The location service keeps only the latest position, indexed by geo cell, in memory. History goes to cheaper storage.',
  },
  {
    message: { from: 0, to: 1, label: 'request ride: pickup at cell tdr1v9' },
    note: 'A rider asks for a ride. The dispatch service needs nearby available drivers — fast.',
  },
  {
    message: { from: 1, to: 2, label: 'drivers in tdr1v9 + 8 neighbours?' },
    note: 'Query the rider\'s cell and its neighbours — the geohash or H3 lookup from the geohashing post. That returns a few dozen candidates.',
  },
  {
    message: { from: 1, to: 1, label: 'rank by ETA (road network), not distance', tone: 'warn' },
    note: 'Straight-line distance misleads: a driver across a river may be close but 15 minutes away. Rank candidates by estimated arrival time from a routing service, then offer the best one.',
  },
  {
    message: { from: 1, to: 3, label: 'offer trip (15 s to accept)' },
    note: 'Offer to one driver at a time (or a few, first to accept wins). The offer is reserved for that driver until accepted, declined or timed out — so two riders don\'t get the same driver.',
  },
  {
    message: { from: 3, to: 4, label: 'accept → trip ACCEPTED', tone: 'ok' },
    panel: { title: 'trip state machine', lines: ['REQUESTED → ACCEPTED → ARRIVED', '→ IN_PROGRESS → COMPLETED', '(or CANCELLED from early states)'] },
    note: 'The trip service owns the trip\'s lifecycle as a state machine, stored durably. Each transition is validated — you can\'t complete a trip that never started.',
  },
  {
    message: { from: 4, to: 0, label: 'live driver position over WebSocket', dashed: true, tone: 'ok' },
    note: 'The rider watches the car approach: the driver\'s position updates are pushed over a persistent connection. At the end, fare calculation and payment happen asynchronously.',
  },
]

export function RideHailingVisualizer() {
  return <SequenceDiagram actors={['rider', 'dispatch', 'locations', 'driver', 'trips']} steps={rideSteps} interval={2800} />
}

// ── Quorum reads and writes ────────────────────────────────────────────────

const quorumSteps: SequenceStep[] = [
  {
    message: { from: 0, to: 1, label: 'PUT cart:7 = [book] (W = 2)' },
    panel: { title: 'N = 3 replicas, W = 2, R = 2', lines: ['R + W = 4 > N = 3', 'every read quorum overlaps every write quorum'] },
    note: 'Each key is stored on N = 3 replicas. A write succeeds once W replicas confirm; a read asks R replicas. Choosing R + W > N guarantees the two sets overlap.',
  },
  {
    message: { from: 1, to: 2, label: 'write v2', tone: 'ok' },
    note: 'The coordinator sends the write to all three replicas.',
  },
  {
    message: { from: 1, to: 3, label: 'write v2', tone: 'ok' },
    note: 'Replica B confirms too. That\'s two — W is satisfied, and the client gets success.',
  },
  {
    message: { from: 1, to: 4, label: 'write v2 — slow / lost', tone: 'bad' },
    panel: { title: 'replicas', lines: ['A: v2', 'B: v2', 'C: v1 (stale)'] },
    note: 'Replica C missed the write — it was slow or briefly unreachable. The system didn\'t wait for it.',
  },
  {
    message: { from: 0, to: 1, label: 'GET cart:7 (R = 2) → asks B and C' },
    note: 'A read asks two replicas. Whichever two it picks, at least one has v2: there are only three replicas, and two of them have it.',
  },
  {
    message: { from: 1, to: 0, label: 'B: v2, C: v1 → return v2', dashed: true, tone: 'ok' },
    note: 'The coordinator compares versions and returns the newest. Versions come from timestamps or vector clocks — "newest" has to be well defined.',
  },
  {
    message: { from: 1, to: 4, label: 'read repair: write v2 to C', tone: 'ok' },
    note: 'It also fixes C in the background (read repair). Anti-entropy jobs compare replicas with Merkle trees to catch keys nobody reads.',
  },
]

export function QuorumVisualizer() {
  return <SequenceDiagram actors={['client', 'coordinator', 'replica A', 'replica B', 'replica C']} steps={quorumSteps} interval={2800} />
}

// ── Gossip ─────────────────────────────────────────────────────────────────

const GOSSIP_CODE = [
  'every 1 second, on each node:',
  '  heartbeat[self] += 1',
  '  peer = random member',
  '  send(peer, myView)          // { node → (heartbeat, lastSeen) }',
  '',
  'on receiving a view:',
  '  for each node in it:',
  '    keep the higher heartbeat; if it rose, lastSeen = now',
  '',
  'if now − lastSeen[node] > timeout: suspect(node)',
]

const ring = (informed: string, count: string) =>
  panel('8 nodes, one run', [['knows the update', informed], ['count', count, count === '8 / 8' ? 'ok' : undefined]])

const gossipSteps: TraceStep[] = [
  {
    lines: [0, 1, 2, 3],
    panels: [ring('n1', '1 / 8')],
    note: 'Node 1 learns something — a new member, a config change, a heartbeat. There\'s no central coordinator: once a second, every node tells one random peer what it knows.',
  },
  {
    lines: [2, 3],
    panels: [ring('n1 n5', '2 / 8')],
    note: 'Round 1: node 1 tells node 5.',
  },
  {
    lines: [2, 3],
    panels: [ring('n1 n5 n3 n8', '4 / 8')],
    note: 'Round 2: both informed nodes gossip, each to a random peer. The number who know roughly doubles each round — like an epidemic, which is why these are also called epidemic protocols.',
  },
  {
    lines: [2, 3],
    panels: [ring('all but n6', '7 / 8')],
    note: 'Round 3: most of the cluster knows. Some messages go to nodes that already knew — that\'s the waste you accept for having no coordinator.',
  },
  {
    lines: [5, 6, 7],
    panels: [ring('all', '8 / 8')],
    note: 'Round 4: everyone. Spreading takes about log₂ N rounds — around 10 rounds for 1,000 nodes, 20 for a million — with each node sending one small message per round.',
  },
  {
    lines: [9],
    panels: [panel('failure detection', [['n6 heartbeat', 'not increased for 10 s', 'warn'], ['status', 'suspect → dead after more time', 'bad'], ['no single detector', 'everyone\'s view converges']])],
    note: 'Heartbeats ride along. If a node\'s heartbeat counter stops rising in everyone\'s view, it\'s suspected, then declared dead. Cassandra, Consul and many others detect failures this way.',
  },
]

export function GossipVisualizer() {
  return <CodeTrace code={GOSSIP_CODE} steps={gossipSteps} interval={2800} />
}

// ── Canary deployments ─────────────────────────────────────────────────────

const canarySteps: SequenceStep[] = [
  {
    message: { from: 0, to: 1, label: '100% of traffic → v41' },
    note: 'Version 41 is serving everyone. Version 42 is built and tested — but tests never cover everything real traffic does.',
  },
  {
    message: { from: 0, to: 2, label: '1% → v42 (canary)', tone: 'warn' },
    note: 'Deploy v42 alongside v41 and send it a small slice of real traffic. If it\'s broken, 1% of users see it for a few minutes, not everyone.',
  },
  {
    message: { from: 2, to: 3, label: 'errors 0.4% (v41: 0.4%) · p99 210 ms (v41: 205 ms)', tone: 'ok' },
    panel: { title: 'automated analysis', lines: ['compare canary vs. baseline', 'error rate, latency, saturation', 'business metrics: checkouts, sign-ins'] },
    note: 'Compare the canary against the current version on the same metrics, over the same period. Automated checks decide, not someone glancing at a dashboard.',
  },
  {
    message: { from: 0, to: 2, label: '10% → 50% → 100%', tone: 'ok' },
    note: 'Healthy, so widen in steps, checking at each one. Problems that only appear under load show up at 50% rather than 100%.',
  },
  {
    message: { from: 2, to: 3, label: 'errors 3.1% at 10%', tone: 'bad' },
    note: 'In another release, errors jump at 10%.',
  },
  {
    message: { from: 0, to: 1, label: 'rollback: 100% → v41 in seconds', tone: 'ok' },
    note: 'Roll back automatically by shifting traffic — v41 never stopped running. Rollback only stays this easy if the database changes in each release are backwards compatible (expand, then contract).',
  },
]

export function CanaryVisualizer() {
  return <SequenceDiagram actors={['load balancer', 'v41 (stable)', 'v42 (canary)', 'metrics']} steps={canarySteps} interval={2800} />
}

// ── Floating point ─────────────────────────────────────────────────────────

const FLOAT_CODE = [
  '0.1 + 0.2',
  '0.1 + 0.2 === 0.3',
  '(0.1).toFixed(20)',
  '19.99 * 100',
  '(1.005).toFixed(2)',
  '2 ** 53 + 1',
  'JSON.parse(\'{"id": 1234567890123456789}\').id',
]

const out = (rows: [string, string, Tone?][]) => panel('node output', rows)

const floatSteps: TraceStep[] = [
  {
    lines: [0, 1],
    panels: [out([['0.1 + 0.2', '0.30000000000000004', 'bad'], ['=== 0.3', 'false', 'bad']])],
    note: 'Every JavaScript number is a 64-bit binary floating-point value (IEEE 754). Just as 1/3 has no exact decimal form, 0.1 has no exact binary form — so the sum of two approximations isn\'t exactly 0.3.',
  },
  {
    lines: [2],
    panels: [out([['(0.1).toFixed(20)', '0.10000000000000000555', 'warn']])],
    note: 'Ask for enough digits and you can see the stored value: slightly more than 0.1. JavaScript prints the shortest decimal that round-trips, which hides this most of the time.',
  },
  {
    lines: [3, 4],
    panels: [out([['19.99 * 100', '1998.9999999999998', 'bad'], ['(1.005).toFixed(2)', '"1.00" — not 1.01', 'bad']])],
    note: 'This is why money in floats goes wrong. ₹19.99 in paise isn\'t 1999, and 1.005 is stored as slightly less than 1.005, so it rounds down. Store money as integer minor units (paise, cents).',
  },
  {
    lines: [5, 6],
    panels: [out([['2 ** 53 + 1', '9007199254740992', 'bad'], ['big JSON id', '1234567890123456800', 'bad'], ['fix', 'BigInt, or IDs as strings', 'ok']])],
    note: 'Integers are exact only up to 2⁵³ − 1 (Number.MAX_SAFE_INTEGER). Beyond that, neighbours collapse. A 64-bit database ID parsed from JSON silently changes — send large IDs as strings.',
  },
]

export function FloatingPointVisualizer() {
  return <CodeTrace code={FLOAT_CODE} steps={floatSteps} interval={3000} />
}

// ── Map and Set ────────────────────────────────────────────────────────────

const MAPSET_CODE = [
  'const a = { id: 1 }, b = { id: 2 }',
  'const obj = {}; obj[a] = "A"; obj[b] = "B"',
  'Object.keys(obj), obj[a]',
  '',
  'const map = new Map([[a, "A"], [b, "B"]])',
  'map.get(a), map.size',
  '',
  'new Set([3, 1, 3, 2, 1])',
  'new Set([1, 2, 3]).intersection(new Set([2, 3, 4]))',
]

const mapSteps: TraceStep[] = [
  {
    lines: [0, 1, 2],
    panels: [out([['Object.keys(obj)', "['[object Object]']", 'bad'], ['obj[a]', '"B" — overwritten', 'bad']])],
    note: 'Object keys are always strings (or symbols). Both objects convert to the same string, "[object Object]", so the second assignment overwrote the first.',
  },
  {
    lines: [4, 5],
    panels: [out([['map.get(a)', '"A"', 'ok'], ['map.size', '2', 'ok']])],
    note: 'A Map keeps keys as they are, compared by identity — objects, functions, anything. It has a size property and no inherited keys like "toString" to trip over.',
  },
  {
    lines: [7],
    panels: [out([['new Set([3,1,3,2,1])', 'Set {3, 1, 2}', 'ok']])],
    note: 'A Set stores each value once, in insertion order. [...new Set(array)] is the standard one-line de-duplication.',
  },
  {
    lines: [8],
    panels: [out([['intersection', 'Set {2, 3}', 'ok'], ['also', 'union, difference, isSubsetOf…']])],
    note: 'Sets now have built-in set operations (union, intersection, difference, isSubsetOf and more), supported in current browsers and Node 22+.',
  },
]

export function MapSetVisualizer() {
  return <CodeTrace code={MAPSET_CODE} steps={mapSteps} interval={3000} />
}

// ── Sorting and comparators ────────────────────────────────────────────────

const SORT_CODE = [
  '[10, 9, 1, 100].sort()',
  '[10, 9, 1, 100].sort((a, b) => a - b)',
  '',
  'people.sort((x, y) => x.age - y.age)',
  '',
  "['éclair', 'apple', 'Zebra'].sort()",
  "['éclair', 'apple', 'Zebra'].sort((a, b) => a.localeCompare(b))",
  "['file10', 'file2'].sort(new Intl.Collator('en', { numeric: true }).compare)",
]

const sortSteps: TraceStep[] = [
  {
    lines: [0, 1],
    panels: [out([['.sort()', '[1, 10, 100, 9]', 'bad'], ['.sort((a, b) => a - b)', '[1, 9, 10, 100]', 'ok']])],
    note: 'Without a comparator, sort converts elements to strings and compares them as text: "100" comes before "9". For numbers, always pass (a, b) => a − b.',
  },
  {
    lines: [3],
    panels: [out([['input', 'Asha 30, Ben 25, Chen 30, Dev 25'], ['sorted by age', 'Ben, Dev, Asha, Chen', 'ok']])],
    note: 'sort is stable (guaranteed since ES2019): equal elements keep their original order. Ben stays before Dev, Asha before Chen — so sorting by one key after another works.',
  },
  {
    lines: [5, 6],
    panels: [out([['.sort()', "['Zebra', 'apple', 'éclair']", 'bad'], ['localeCompare', "['apple', 'éclair', 'Zebra']", 'ok']])],
    note: 'Default string sorting compares UTF-16 code units: uppercase before lowercase, accented letters after z. For text people read, compare with localeCompare or an Intl.Collator.',
  },
  {
    lines: [7],
    panels: [out([['numeric collation', "['file2', 'file10']", 'ok']])],
    note: 'Collator options handle "natural" ordering, so file2 comes before file10. Create the collator once and reuse its compare function — it\'s much faster than calling localeCompare repeatedly.',
  },
]

export function SortingVisualizer() {
  return <CodeTrace code={SORT_CODE} steps={sortSteps} interval={3000} />
}

// ── tsconfig strict flags ──────────────────────────────────────────────────

const FLAGS_CODE = [
  "const prices: Record<string, number> = { apple: 40 }",
  "prices['mango'].toFixed(2)",
  '',
  'interface Options { timeout?: number }',
  'const opts: Options = { timeout: undefined }',
  '',
  'class Child extends Base { greet() { return "hello" } }',
  '',
  'try { … } catch (err) { console.log(err.message) }',
]

const flagSteps: TraceStep[] = [
  {
    lines: [0, 1],
    error: true,
    panels: [panel('noUncheckedIndexedAccess', [['error TS2532', "Object is possibly 'undefined'.", 'bad'], ['without the flag', 'compiles — crashes at runtime', 'warn']])],
    note: 'By default, indexing a Record or an array is assumed to find something. With noUncheckedIndexedAccess, the result includes undefined, so missing keys and out-of-range indexes must be handled.',
  },
  {
    lines: [3, 4],
    error: true,
    panels: [panel('exactOptionalPropertyTypes', [['error TS2375', "'undefined' is not assignable to type 'number'", 'bad'], ['why it matters', "'timeout' in opts is now true", 'warn']])],
    note: 'An optional property may be missing, but by default it may also be explicitly undefined — which behaves differently with "in", Object.keys and spreading. This flag makes "optional" mean "may be absent" only.',
  },
  {
    lines: [6],
    error: true,
    panels: [panel('noImplicitOverride', [['error TS4114', "This member must have an 'override' modifier…", 'bad']])],
    note: 'Overriding a base method now needs the override keyword. If the base method is renamed later, the subclass method stops compiling instead of silently becoming an unrelated method.',
  },
  {
    lines: [8],
    error: true,
    panels: [panel('useUnknownInCatchVariables (in strict)', [['error TS18046', "'err' is of type 'unknown'.", 'bad'], ['fix', 'if (err instanceof Error) …', 'ok']])],
    note: 'Anything can be thrown, not just Errors, so caught values are unknown under strict. Narrow before using them. This one is already included in strict: true; the others above aren\'t.',
  },
]

export function TsconfigFlagsVisualizer() {
  return <CodeTrace code={FLAGS_CODE} steps={flagSteps} interval={3200} />
}

// ── Recursive types ────────────────────────────────────────────────────────

const REC_CODE = [
  'type Json = string | number | boolean | null | Json[] | { [key: string]: Json }',
  '',
  'type DeepPartial<T> = {',
  '  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]',
  '}',
  '',
  'type Paths<T> = T extends object',
  '  ? { [K in keyof T & string]: K | `${K}.${Paths<T[K]>}` }[keyof T & string]',
  '  : never',
  '',
  'type Config = { db: { host: string; port: number }; cache: { ttl: number } }',
  "const p: Paths<Config> = 'db.pot'",
]

const recSteps: TraceStep[] = [
  {
    lines: [0],
    panels: [panel('Json', [['{ a: [1, { b: null }] }', 'ok', 'ok'], ['{ a: () => 1 }', "error TS2322 — functions aren't JSON", 'bad']])],
    note: 'A type can refer to itself. Json is a primitive, or an array of Json, or an object whose values are Json — which covers any depth of nesting.',
  },
  {
    lines: [2, 3, 4],
    panels: [panel('DeepPartial<Config>', [['{ db: { port: 5433 } }', 'ok — every level optional', 'ok']])],
    note: 'Built-in Partial only makes the top level optional. DeepPartial recurses into nested objects — handy for config overrides and test fixtures.',
  },
  {
    lines: [6, 7, 8, 10],
    panels: [panel('Paths<Config>', [['', '"db" | "cache" | "db.host" | "db.port" | "cache.ttl"']])],
    note: 'Combined with template literal types, recursion can list every dotted path through an object — the kind of type behind typed i18n keys and form libraries.',
  },
  {
    lines: [11],
    error: true,
    panels: [panel('compiler', [['error TS2820', "'db.pot' is not assignable… Did you mean 'db.port'?", 'bad']])],
    note: 'A typo in a path is now a compile error, with a suggestion. The cost is compile time: very deep recursion stops with TS2589, "Type instantiation is excessively deep and possibly infinite".',
  },
]

export function RecursiveTypesVisualizer() {
  return <CodeTrace code={REC_CODE} steps={recSteps} interval={3000} />
}

// ── HTTP compression ───────────────────────────────────────────────────────

const compressionSteps: SequenceStep[] = [
  {
    message: { from: 0, to: 1, label: 'GET /api/users  Accept-Encoding: br, gzip, zstd' },
    note: 'The browser lists the compression formats it can decode. Every modern browser sends this automatically.',
  },
  {
    message: { from: 1, to: 1, label: 'pick br; compress 17,671 bytes of JSON', tone: 'warn' },
    panel: { title: 'this response (measured)', lines: ['identity: 17,671 bytes', 'gzip:     1,875 bytes', 'brotli:     847 bytes'] },
    note: 'The server chooses one it supports. Text like JSON, HTML, CSS and JavaScript is very repetitive, so it compresses dramatically — here a list of 200 users shrinks over 20×.',
  },
  {
    message: { from: 1, to: 0, label: '200  Content-Encoding: br  Vary: Accept-Encoding', dashed: true, tone: 'ok' },
    note: 'The response says how it was encoded. Vary: Accept-Encoding tells caches to store separate copies per encoding, so a gzip-only client never receives brotli.',
  },
  {
    message: { from: 0, to: 0, label: 'decompress → 17,671 bytes → parse', tone: 'ok' },
    note: 'The browser decompresses transparently before your code sees the body. Decompression is fast; the bytes saved on the network usually matter far more.',
  },
  {
    message: { from: 0, to: 1, label: 'GET /photo.jpg' },
    panel: { title: "don't compress", lines: ['JPEG, PNG, WebP, AVIF, video, zip', 'already compressed — no gain', 'tiny responses (< ~1 KB)'] },
    note: 'Images, video and archives are already compressed; compressing again wastes CPU for nothing. Small responses aren\'t worth it either.',
  },
]

export function CompressionVisualizer() {
  return <SequenceDiagram actors={['browser', 'server / CDN']} steps={compressionSteps} interval={2800} />
}

// ── URLs ───────────────────────────────────────────────────────────────────

const URL_CODE = [
  'const u = new URL(',
  "  'https://user:pw@shop.example.com:8443/search/caf%C3%A9?q=red+shoes&size=10#reviews')",
  '',
  "encodeURIComponent('a b&c=d/é?')",
  "new URLSearchParams({ q: 'red shoes & socks' }).toString()",
  '',
  "'https://site.com/?next=' + 'https://x.com/?a=1&b=2'",
]

const urlSteps: TraceStep[] = [
  {
    lines: [0, 1],
    panels: [panel('new URL(…)', [['protocol', 'https:'], ['username', 'user'], ['hostname', 'shop.example.com'], ['port', '8443'], ['pathname', '/search/caf%C3%A9'], ['search', '?q=red+shoes&size=10'], ['hash', '#reviews (never sent to the server)'], ['origin', 'https://shop.example.com:8443']])],
    note: 'A URL has fixed parts. The URL class parses them for you — don\'t split strings by hand. The fragment after # stays in the browser; it never reaches the server.',
  },
  {
    lines: [1],
    panels: [panel('decoding', [['pathname', '/search/caf%C3%A9'], ['decoded', '/search/café'], ['searchParams.get("q")', '"red shoes" — + means space here']])],
    note: 'Characters outside a small safe set are percent-encoded as UTF-8 bytes: é is two bytes, %C3%A9. In query strings from forms, + stands for a space.',
  },
  {
    lines: [3, 4],
    panels: [panel('encoding', [['encodeURIComponent', 'a%20b%26c%3Dd%2F%C3%A9%3F', 'ok'], ['URLSearchParams', 'q=red+shoes+%26+socks', 'ok']])],
    note: 'Encode each value with encodeURIComponent, or let URLSearchParams build the whole query. encodeURI is for whole URLs and deliberately leaves & = / ? alone — wrong for values.',
  },
  {
    lines: [6],
    error: true,
    panels: [panel('unencoded value', [['next param', 'https://x.com/?a=1', 'bad'], ['&b=2', 'became a separate parameter', 'bad'], ['encoded', 'https://x.com/?a=1&b=2', 'ok']])],
    note: 'Concatenating an unencoded URL into a query breaks it: the & inside the value starts a new parameter. Bugs like this cause broken redirects — and sometimes security holes.',
  },
]

export function UrlVisualizer() {
  return <CodeTrace code={URL_CODE} steps={urlSteps} interval={3000} />
}

// ── Web components ─────────────────────────────────────────────────────────

const WC_CODE = [
  'class RatingStars extends HTMLElement {',
  "  static observedAttributes = ['value']",
  '  constructor() {',
  '    super()',
  "    this.attachShadow({ mode: 'open' })",
  '  }',
  '  connectedCallback() { this.render() }',
  '  attributeChangedCallback() { this.render() }',
  '  render() {',
  "    const v = Number(this.getAttribute('value') ?? 0)",
  "    this.shadowRoot.innerHTML = `<style>span { color: gold }</style>",
  "      <span>${'★'.repeat(v)}${'☆'.repeat(5 - v)}</span>`",
  '  }',
  '}',
  "customElements.define('rating-stars', RatingStars)",
  '',
  '<rating-stars value="3"></rating-stars>',
]

const wcSteps: TraceStep[] = [
  {
    lines: [14],
    panels: [panel('customElements.define', [['tag', 'rating-stars (must contain a hyphen)'], ['upgrades', 'every <rating-stars> on the page', 'ok']])],
    note: 'A custom element is a class extending HTMLElement, registered under a tag name with a hyphen. The browser upgrades existing and future <rating-stars> elements to instances of it.',
  },
  {
    lines: [2, 3, 4, 6],
    panels: [panel('lifecycle', [['constructor', 'set up state, attach shadow root'], ['connectedCallback', 'added to the document → render'], ['disconnectedCallback', 'removed → clean up listeners']])],
    note: 'Lifecycle callbacks run when the element is created, inserted and removed. Do DOM work in connectedCallback, not the constructor.',
  },
  {
    lines: [1, 7, 16],
    panels: [panel('attributes', [['value="3"', '★★★☆☆', 'ok'], ['setAttribute("value", "5")', 're-renders → ★★★★★', 'ok']])],
    note: 'Attributes listed in observedAttributes trigger attributeChangedCallback when they change — the element reacts like a built-in one.',
  },
  {
    lines: [4, 10],
    panels: [panel('shadow DOM', [['span { color: gold }', "only styles this element's spans", 'ok'], ['page CSS', "doesn't reach inside", 'ok'], ['theming in', 'CSS custom properties, ::part()']])],
    note: 'The shadow root is a separate DOM tree with its own scoped styles: the component\'s CSS doesn\'t leak out, and the page\'s CSS doesn\'t leak in. CSS variables and ::part() are the deliberate openings for theming.',
  },
]

export function WebComponentsVisualizer() {
  return <CodeTrace code={WC_CODE} steps={wcSteps} interval={3000} />
}

// ── Mixture of experts ─────────────────────────────────────────────────────

const MOE_CODE = [
  'scores = router(token)              // one score per expert',
  'probs  = softmax(scores)',
  'top    = the 2 highest-probability experts',
  'weights = probs[top] / sum(probs[top])',
  'output = Σ weights[i] × expert[top[i]](token)',
]

const moeSteps: TraceStep[] = [
  {
    lines: [0],
    panels: [panel('router scores (one token)', [['expert 0', '1.2'], ['expert 1', '−0.3'], ['expert 2', '2.6'], ['expert 3', '0.4'], ['expert 4', '−1.1'], ['expert 5', '2.1'], ['expert 6', '0.0'], ['expert 7', '0.7']])],
    note: 'In a mixture-of-experts layer, the usual feed-forward block is replaced by several "experts" — separate feed-forward networks — plus a small router that scores them for each token.',
  },
  {
    lines: [1],
    panels: [panel('softmax', [['expert 2', '0.441', 'ok'], ['expert 5', '0.267', 'ok'], ['expert 0', '0.109'], ['others', '0.011 – 0.066', 'muted']])],
    note: 'Softmax turns the scores into probabilities. These numbers are computed from the example scores.',
  },
  {
    lines: [2, 3],
    panels: [panel('top-2, renormalised', [['expert 2', '0.62', 'ok'], ['expert 5', '0.38', 'ok'], ['experts 0,1,3,4,6,7', 'not run at all', 'muted']])],
    note: 'Only the top 2 experts run for this token. Their weights are rescaled to sum to 1. The other six cost nothing for this token.',
  },
  {
    lines: [4],
    panels: [panel('why it matters', [['Mixtral 8×7B', '~47B params, ~13B active per token', 'ok'], ['DeepSeek-V3', '671B params, 37B active', 'ok'], ['memory', 'all experts must be loaded', 'warn']])],
    note: 'The model has the knowledge capacity of all its parameters, but each token pays the compute of only the active ones. The catch: every expert must sit in memory, and routing must keep experts evenly loaded.',
  },
]

export function MoeVisualizer() {
  return <CodeTrace code={MOE_CODE} steps={moeSteps} interval={3000} />
}

// ── Semantic caching ───────────────────────────────────────────────────────

const semanticSteps: SequenceStep[] = [
  {
    message: { from: 0, to: 1, label: '"How do I reset my password?"' },
    note: 'A support assistant gets the same questions over and over, worded differently. An exact-match cache misses all the rephrasings.',
  },
  {
    message: { from: 1, to: 2, label: 'embed → nearest cached question? none', tone: 'warn' },
    note: 'Embed the question and search a vector index of previously answered questions. Nothing close yet.',
  },
  {
    message: { from: 1, to: 3, label: 'call the model', tone: 'warn' },
    note: 'Call the LLM as usual — seconds of latency, and the full token cost.',
  },
  {
    message: { from: 1, to: 2, label: 'store (embedding, answer)', tone: 'ok' },
    note: 'Store the question\'s embedding with the answer.',
  },
  {
    message: { from: 0, to: 1, label: '"I forgot my password, how to change it"' },
    note: 'Later, someone asks the same thing in different words.',
  },
  {
    message: { from: 1, to: 2, label: 'similarity 0.93 ≥ threshold 0.90 → hit', tone: 'ok' },
    panel: { title: 'example scores', lines: ['"forgot password…" vs cached: 0.93 → hit', '"reset my 2FA device" vs cached: 0.84 → miss', 'the threshold is the whole design'] },
    note: 'Close enough: return the cached answer in milliseconds, for free. The danger is the threshold: "reset my 2FA device" is similar in wording but needs a different answer. (Scores here are illustrative.)',
  },
]

export function SemanticCacheVisualizer() {
  return <SequenceDiagram actors={['user', 'app', 'vector cache', 'LLM']} steps={semanticSteps} interval={2800} />
}

// ── LLM cost and latency ───────────────────────────────────────────────────

const COST_CODE = [
  '// example prices: $3 / M input tokens, $15 / M output tokens',
  'request = 10,000 input tokens (9,000 of them a fixed prefix) + 500 output',
  '',
  'input  = 10,000 × $3 / 1M        = $0.0300',
  'output =    500 × $15 / 1M       = $0.0075',
  '',
  'cached prefix: 9,000 × $0.30 / 1M + 1,000 × $3 / 1M = $0.0057',
]

const costSteps: TraceStep[] = [
  {
    lines: [0, 1, 3, 4],
    panels: [panel('per request', [['input', '$0.0300'], ['output', '$0.0075'], ['total', '$0.0375'], ['× 1M requests', '$37,500', 'warn']])],
    note: 'Cost is tokens × price, with output tokens typically several times the price of input. These prices are examples — check your provider\'s current pricing — but the shape of the arithmetic is general.',
  },
  {
    lines: [6],
    panels: [panel('with prompt caching', [['input', '$0.0057', 'ok'], ['total', '$0.0132', 'ok'], ['× 1M requests', '$13,200', 'ok']])],
    note: 'Most of this prompt is a fixed prefix: instructions, tool definitions, a document. With prompt caching, cache reads are billed at a fraction of the input price (here 10%), and prefill is faster too. Cache writes usually cost a bit more, once.',
  },
  {
    lines: [4],
    panels: [panel('other levers', [['shorter outputs', 'output tokens cost most and set latency'], ['smaller model', 'route easy requests to it'], ['batch API', 'about half price, results within hours'], ['fewer calls', 'cache whole answers when safe']])],
    note: 'After caching: ask for concise output (each output token is a decode step), send easy requests to a smaller model, use batch APIs for anything that can wait, and avoid repeated calls entirely where you can.',
  },
]

export function LlmCostVisualizer() {
  return <CodeTrace code={COST_CODE} steps={costSteps} interval={3200} />
}
