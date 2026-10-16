import { SequenceDiagram, type SequenceStep } from '@/app/components/sequence-diagram'
import { CodeTrace, type TracePanel, type TraceStep } from '@/app/components/code-trace'

type Tone = 'ok' | 'warn' | 'bad' | 'muted'
const panel = (title: string, rows: [string, string, Tone?][]): TracePanel => ({
  title,
  rows: rows.map(([k, v, tone]) => ({ k, v, tone })),
})

// ── Classes and private fields ─────────────────────────────────────────────

const CLASS_CODE = [
  'class Counter {',
  '  #count = 0',
  '  static #instances = 0',
  '',
  '  constructor() { Counter.#instances++ }',
  '  increment() { return ++this.#count }',
  '  get value() { return this.#count }',
  '  static isCounter(x) { return #count in x }',
  '}',
  '',
  'const c = new Counter()',
  'c.increment(); c.increment()',
  'c.value                         // ?',
  'Object.keys(c), JSON.stringify(c)',
  'Counter.prototype.increment.call({})',
]

const classSteps: TraceStep[] = [
  {
    lines: [0, 4, 5, 6],
    panels: [panel('Counter.prototype', [['constructor', 'Counter'], ['increment', 'method'], ['value', 'getter']])],
    note: 'A class is still prototypes underneath: methods and getters live once on Counter.prototype and every instance shares them. typeof Counter is "function".',
  },
  {
    lines: [10, 1],
    panels: [panel('c (instance)', [['#count', '0 — private'], ['own public keys', 'none', 'muted']])],
    note: 'Field initialisers run for each new instance. #count is a private field: it belongs to the instance, but it isn\'t a property — no key, no prototype lookup.',
  },
  {
    lines: [11, 12, 5, 6],
    panels: [panel('results', [['c.value', '2', 'ok'], ['c.#count outside the class', 'SyntaxError', 'bad']])],
    note: 'Methods inside the class body can read and write #count. Code outside can\'t even mention it — writing c.#count anywhere else is a syntax error, caught before the code runs.',
  },
  {
    lines: [13],
    panels: [panel('results', [['Object.keys(c)', '[]'], ['JSON.stringify(c)', '"{}"'], ['in DevTools', 'visible, for debugging', 'muted']])],
    note: 'Private fields are invisible to reflection: Object.keys, JSON.stringify, for…in and Proxy traps don\'t see them. Unlike a _count convention, this is enforced by the language.',
  },
  {
    lines: [14],
    error: true,
    panels: [panel('thrown', [['TypeError', 'Cannot read private member #count from an object whose class did not declare it', 'bad']])],
    note: 'Calling the method on a plain object throws: only objects created by this class have the #count slot. The same check makes a Proxy around an instance fail when a method touches a private field.',
  },
  {
    lines: [7],
    panels: [panel('brand check', [['Counter.isCounter(c)', 'true', 'ok'], ['Counter.isCounter({})', 'false']])],
    note: '#count in x asks "was x created by this class?" without throwing — a reliable brand check, unlike instanceof, which follows prototypes that can be changed.',
  },
]

export function PrivateFieldsVisualizer() {
  return <CodeTrace code={CLASS_CODE} steps={classSteps} interval={3000} />
}

// ── Symbols ────────────────────────────────────────────────────────────────

const SYMBOL_CODE = [
  "const id = Symbol('id')",
  "const user = { name: 'Asha', [id]: 42 }",
  '',
  "Symbol('id') === Symbol('id')",
  "Symbol.for('app.id') === Symbol.for('app.id')",
  'Object.keys(user), JSON.stringify(user)',
  '',
  'const range = {',
  '  from: 1, to: 4,',
  '  *[Symbol.iterator]() {',
  '    for (let i = this.from; i <= this.to; i++) yield i',
  '  },',
  '}',
  '[...range]',
]

const symbolSteps: TraceStep[] = [
  {
    lines: [0, 1],
    panels: [panel('user', [['name', "'Asha'"], ['[Symbol(id)]', '42']])],
    note: 'Symbol() creates a value that is unique: no other symbol, string or number equals it. Used as a property key, it can\'t clash with any other key, even one with the same description.',
  },
  {
    lines: [3, 4],
    panels: [panel('results', [["Symbol('id') === Symbol('id')", 'false'], ["Symbol.for('app.id') === …", 'true', 'ok']])],
    note: 'The description is only a label. Two Symbol(\'id\') calls give two different symbols. Symbol.for() is the exception: it looks the key up in a global registry, so the same string returns the same symbol everywhere, even across iframes.',
  },
  {
    lines: [5],
    panels: [panel('results', [['Object.keys(user)', "['name']"], ['JSON.stringify(user)', '{"name":"Asha"}'], ['Reflect.ownKeys(user)', "['name', Symbol(id)]", 'ok']])],
    note: 'Symbol keys are skipped by Object.keys, for…in and JSON — handy for metadata that shouldn\'t leak into serialised data. They\'re not private: Object.getOwnPropertySymbols and Reflect.ownKeys still list them.',
  },
  {
    lines: [7, 8, 9, 10, 11, 12],
    panels: [panel('well-known symbol', [['Symbol.iterator', 'how for…of and ... get values'], ['range', 'now iterable', 'ok']])],
    note: 'The language itself uses symbols as hooks. Define a method under Symbol.iterator and your object works with for…of, spread and destructuring. A symbol key means it can\'t collide with an ordinary method name.',
  },
  {
    lines: [13],
    panels: [panel('results', [['[...range]', '[1, 2, 3, 4]', 'ok'], ['also', 'Symbol.toPrimitive, Symbol.toStringTag, Symbol.asyncIterator…']])],
    note: 'Spread calls range[Symbol.iterator]() and collects what the generator yields. Other well-known symbols customise conversion to primitives, the [object …] tag, async iteration and instanceof.',
  },
]

export function SymbolsVisualizer() {
  return <CodeTrace code={SYMBOL_CODE} steps={symbolSteps} interval={3000} />
}

// ── Property descriptors ───────────────────────────────────────────────────

const DESC_CODE = [
  "'use strict'",
  'const config = {}',
  "Object.defineProperty(config, 'apiUrl', { value: 'https://api.example.com' })",
  '',
  "config.apiUrl = 'https://evil.example'",
  'Object.keys(config)',
  '',
  'const settings = Object.freeze({ port: 5432, db: { host: "a" } })',
  'settings.port = 1',
  "settings.db.host = 'b'",
]

const descSteps: TraceStep[] = [
  {
    lines: [2],
    panels: [panel("descriptor of 'apiUrl'", [['value', "'https://api.example.com'"], ['writable', 'false'], ['enumerable', 'false'], ['configurable', 'false']])],
    note: 'Every property has a descriptor: its value plus three flags. Properties created by assignment get true for all three. With defineProperty, any flag you leave out defaults to false.',
  },
  {
    lines: [4],
    error: true,
    panels: [panel('thrown', [['TypeError', "Cannot assign to read only property 'apiUrl' of object '#<Object>'", 'bad'], ['sloppy mode', 'silently ignored', 'warn']])],
    note: 'writable: false makes the value read-only. In strict mode (modules and classes are strict) assignment throws; in sloppy scripts it fails silently — one more reason to use strict mode.',
  },
  {
    lines: [5],
    panels: [panel('results', [['Object.keys(config)', '[]'], ['config.apiUrl', 'still readable', 'ok']])],
    note: 'enumerable: false hides the property from Object.keys, for…in, spread and JSON.stringify. Built-in methods like Array.prototype.map are non-enumerable for exactly this reason.',
  },
  {
    lines: [7, 8],
    error: true,
    panels: [panel('Object.freeze', [['every property', 'writable: false, configurable: false'], ['object', 'not extensible'], ['settings.port = 1', 'TypeError', 'bad']])],
    note: 'Object.freeze applies those flags to every own property and stops new ones being added. Object.seal is the milder version: existing values stay writable, but nothing can be added or deleted.',
  },
  {
    lines: [9],
    panels: [panel('results', [['settings.db.host', "'b' — changed!", 'bad'], ['Object.isFrozen(settings.db)', 'false']])],
    note: 'Freezing is shallow. settings.db is a separate object, and it isn\'t frozen. Deep-freeze recursively if you need it — or rely on TypeScript\'s readonly types, which cost nothing at runtime.',
  },
]

export function DescriptorsVisualizer() {
  return <CodeTrace code={DESC_CODE} steps={descSteps} interval={3000} />
}

// ── TypeScript decorators ──────────────────────────────────────────────────

const DECORATOR_CODE = [
  'function logged(method, context: ClassMethodDecoratorContext) {',
  '  const name = String(context.name)',
  '  return function (this: unknown, ...args: unknown[]) {',
  '    console.log(`→ ${name}(${args.join(", ")})`)',
  '    const result = method.call(this, ...args)',
  '    console.log(`← ${name} = ${result}`)',
  '    return result',
  '  }',
  '}',
  '',
  'class PriceCalculator {',
  '  constructor(private taxRate: number) {}',
  '  @logged',
  '  total(subtotal: number) {',
  '    return Math.round(subtotal * (1 + this.taxRate))',
  '  }',
  '}',
  '',
  'new PriceCalculator(0.18).total(1000)',
]

const decoratorSteps: TraceStep[] = [
  {
    lines: [12, 13],
    panels: [panel('when the class is defined', [['@logged receives', 'the original total method'], ['context.kind', "'method'"], ['context.name', "'total'"]])],
    note: 'A decorator is a function applied to a class or class member when the class is defined — once, not on every call. A method decorator gets the method and a context object describing it.',
  },
  {
    lines: [2, 3, 4, 5, 6, 7],
    panels: [panel('result', [['PriceCalculator.prototype.total', 'the wrapper returned by logged', 'ok']])],
    note: 'Whatever the decorator returns replaces the method. Here it\'s a wrapper that logs, calls the original with the same this and arguments, and logs the result.',
  },
  {
    lines: [18, 3],
    panels: [panel('console', [['', '→ total(1000)']])],
    note: 'Calling total runs the wrapper first.',
  },
  {
    lines: [4, 14],
    panels: [panel('console', [['', '→ total(1000)'], ['', '← total = 1180', 'ok']])],
    note: 'The original method runs with the right this (taxRate 0.18), and the wrapper logs its return value. Callers can\'t tell anything changed — the point of a decorator is to add behaviour around code without editing it.',
  },
  {
    lines: [0],
    panels: [panel('TypeScript 5.0+', [['standard decorators', 'no flag needed', 'ok'], ['experimentalDecorators', 'the older, different API'], ['parameter decorators', 'only in the older API', 'warn']])],
    note: 'This is the standard (TC39) decorator API that TypeScript 5.0 supports by default. Angular, NestJS and TypeORM were built on the older experimentalDecorators version, which has a different signature — check which one a library expects.',
  },
]

export function DecoratorsVisualizer() {
  return <CodeTrace code={DECORATOR_CODE} steps={decoratorSteps} interval={3000} />
}

// ── JWT ────────────────────────────────────────────────────────────────────

const JWT_CODE = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  '.',
  'eyJzdWIiOiJ1c2VyXzEyMyIsIm5hbWUiOiJBc2hhIiwicm9sZSI6ImVkaXRvciIsImlhdCI6MTc5MjE0MzAwMCwiZXhwIjoxNzkyMTQzOTAwfQ',
  '.',
  '07PX_KD64hoemCf042vQegSINh3XsdnY0essl01ITog',
]

const jwtSteps: TraceStep[] = [
  {
    lines: [0, 1, 2, 3, 4],
    panels: [panel('a JWT', [['parts', 'header . payload . signature'], ['encoding', 'base64url — not encryption', 'warn']])],
    note: 'A JSON Web Token is three base64url strings joined by dots. Base64url is an encoding, not encryption: anyone holding the token can read the first two parts.',
  },
  {
    lines: [0],
    panels: [panel('header (decoded)', [['alg', 'HS256 (HMAC with SHA-256)'], ['typ', 'JWT']])],
    note: 'The header says how the token was signed.',
  },
  {
    lines: [2],
    panels: [panel('payload (decoded)', [['sub', 'user_123'], ['name', 'Asha'], ['role', 'editor'], ['iat', '2026-10-16 09:30:00 UTC'], ['exp', '2026-10-16 09:45:00 UTC', 'warn']])],
    note: 'The payload holds claims: who the token is about (sub), when it was issued (iat) and when it expires (exp) — here after 15 minutes. Never put secrets in it.',
  },
  {
    lines: [4],
    panels: [panel('signature', [['input', 'header + "." + payload'], ['HMAC-SHA256 with', 'the server\'s secret key'], ['result', '07PX_KD64hoe…', 'ok']])],
    note: 'The signature is an HMAC of the first two parts with a secret only the server knows. Verifying it means recomputing it and comparing — no database lookup needed.',
  },
  {
    lines: [2],
    error: true,
    panels: [panel('tampered token', [['change role to', 'admin'], ['payload becomes', '…cm9sZSI6ImFkbWluIi…'], ['signature check', 'fails — rejected', 'bad']])],
    note: 'Change one claim and the payload\'s bytes change, so the old signature no longer matches. Without the secret, an attacker can\'t compute a new one. That\'s all a JWT guarantees: the claims haven\'t been altered since signing.',
  },
  {
    lines: [0],
    error: true,
    panels: [panel('verify carefully', [['alg: "none"', 'reject — always require your algorithm', 'bad'], ['exp in the past', 'reject', 'bad'], ['iss, aud', 'check they\'re yours', 'warn']])],
    note: 'Verification must pin the algorithm (an "alg: none" or RS256-to-HS256 switch has fooled real libraries), check expiry, and check issuer and audience. Use a maintained library and pass it the algorithm explicitly.',
  },
]

export function JwtVisualizer() {
  return <CodeTrace code={JWT_CODE} steps={jwtSteps} interval={3000} />
}

// ── OAuth 2.0 with PKCE ────────────────────────────────────────────────────

const oauthSteps: SequenceStep[] = [
  {
    message: { from: 0, to: 1, label: 'click "Sign in with Example"' },
    note: 'A user wants an app to access their data at another service — say, their calendar. The app must never see their password.',
  },
  {
    message: { from: 1, to: 1, label: 'verifier = random 43–128 chars; challenge = SHA-256(verifier)', tone: 'warn' },
    panel: { title: 'PKCE', lines: ['code_verifier: dBjftJeZ4CVP-mB92K27…', 'code_challenge: E9Melhoa2OwvFrEMTJgu…', '(values from RFC 7636, appendix B)'] },
    note: 'PKCE: the app invents a random secret (the verifier) and keeps it. It sends only a hash of it (the challenge).',
  },
  {
    message: { from: 1, to: 2, label: 'redirect: /authorize?client_id&scope=calendar.read&code_challenge&state' },
    note: 'The browser is redirected to the authorization server with the app\'s ID, the permissions it wants, the challenge, and a random state value to stop forged callbacks.',
  },
  {
    message: { from: 0, to: 2, label: 'log in + approve "read your calendar"', tone: 'ok' },
    note: 'The user signs in on the provider\'s own page — the app never sees the password — and approves the requested scope.',
  },
  {
    message: { from: 2, to: 1, label: 'redirect: /callback?code=SplxlOBe…&state', dashed: true },
    note: 'The provider redirects back with a short-lived authorization code. The code passes through the browser, so it could leak — through history, logs, or a malicious app on a phone.',
  },
  {
    message: { from: 1, to: 2, label: 'POST /token { code, code_verifier }' },
    note: 'The app exchanges the code for tokens, and proves it\'s the same app that started the flow by sending the original verifier.',
  },
  {
    message: { from: 2, to: 1, label: 'SHA-256(verifier) = challenge ✓ → access + refresh tokens', dashed: true, tone: 'ok' },
    note: 'The server hashes the verifier and compares it with the challenge it saw earlier. An attacker who stole the code doesn\'t have the verifier, so the stolen code is useless.',
  },
  {
    message: { from: 1, to: 3, label: 'GET /calendar  Authorization: Bearer …', tone: 'ok' },
    note: 'The app calls the API with the access token. It\'s short-lived and limited to the approved scope. The refresh token gets new access tokens without asking the user again.',
  },
]

export function OAuthPkceVisualizer() {
  return <SequenceDiagram actors={['user', 'app', 'auth server', 'API']} steps={oauthSteps} interval={2800} />
}

// ── CSRF ───────────────────────────────────────────────────────────────────

const csrfSteps: SequenceStep[] = [
  {
    message: { from: 0, to: 2, label: 'log in → Set-Cookie: session=abc' },
    note: 'You log in to your bank. The browser stores a session cookie and sends it with every request to bank.example — that\'s how you stay logged in.',
  },
  {
    message: { from: 0, to: 1, label: 'visit a page on evil.example' },
    note: 'Later, in another tab, you open a page on a site you don\'t trust.',
  },
  {
    message: { from: 1, to: 0, label: '<form action="https://bank.example/transfer" method=POST> auto-submits', tone: 'warn', dashed: true },
    note: 'The page contains a hidden form pointing at your bank, with the attacker\'s account number filled in, and a script that submits it.',
  },
  {
    message: { from: 0, to: 2, label: 'POST /transfer  Cookie: session=abc', tone: 'bad' },
    note: 'The browser sends the request — with your cookie attached, because it\'s a request to bank.example. The bank sees a valid session and a well-formed form post.',
  },
  {
    message: { from: 2, to: 2, label: '₹50,000 transferred', tone: 'bad' },
    note: 'That\'s cross-site request forgery. The attacker never saw your cookie or the response — they didn\'t need to. They only needed your browser to make the request.',
  },
  {
    message: { from: 0, to: 2, label: 'same POST, SameSite=Lax cookie → no cookie sent', tone: 'ok' },
    panel: { title: 'defences', lines: ['SameSite=Lax/Strict cookies', 'CSRF token in the form, checked server-side', 'check Origin / Sec-Fetch-Site headers'] },
    note: 'With SameSite=Lax, the browser doesn\'t attach the cookie to cross-site POSTs. Add a CSRF token or an Origin check as well — defence in depth, and protection for older browsers.',
  },
]

export function CsrfVisualizer() {
  return <SequenceDiagram actors={['your browser', 'evil.example', 'bank.example']} steps={csrfSteps} interval={2800} />
}

// ── KV cache ───────────────────────────────────────────────────────────────

const KV_CODE = [
  'tokens = tokenize(prompt)           // 1,000 tokens',
  'cache = prefill(tokens)             // K, V for all 1,000, in parallel',
  'while (!done) {',
  '  next = sample(forward(lastToken, cache))',
  '  cache.append(K(next), V(next))     // one new row per layer',
  '  lastToken = next',
  '}',
]

const kvSteps: TraceStep[] = [
  {
    lines: [0],
    panels: [panel('without a cache', [['token 1,001', 'recompute K, V for 1,000 tokens'], ['token 1,002', '…for 1,001 tokens'], ['total work', 'grows with the square of the length', 'bad']])],
    note: 'A model generates one token at a time, and each new token attends to every earlier one. Done naively, every step recomputes the keys and values of the whole sequence — the same numbers, over and over.',
  },
  {
    lines: [1],
    panels: [panel('prefill', [['work', 'all prompt tokens at once', 'ok'], ['bound by', 'compute (big matrix multiplies)'], ['you notice it as', 'time to first token']])],
    note: 'Prefill: process the whole prompt in one parallel pass and store every token\'s key and value vectors, in every layer. This is why long prompts delay the first token.',
  },
  {
    lines: [3, 4, 5],
    panels: [panel('decode step', [['new work', 'K, V for 1 token only', 'ok'], ['reads', 'the whole cache', 'warn'], ['bound by', 'memory bandwidth']])],
    note: 'Decode: for each new token, compute its query, key and value, append the key and value to the cache, and attend over the cached ones. Each step is cheap in arithmetic but reads the entire cache from GPU memory.',
  },
  {
    lines: [4],
    panels: [panel('cache size per token', [['formula', '2 × layers × kv_heads × head_dim × bytes'], ['Llama 2 7B (fp16)', '2 × 32 × 32 × 128 × 2 = 512 KB'], ['4,096 tokens', '2 GB', 'warn']])],
    note: 'The cost is memory. A 7B model like Llama 2 stores half a megabyte per token. A 4,096-token conversation needs 2 GB of cache — per conversation, on top of the model\'s weights.',
  },
  {
    lines: [4],
    panels: [panel('making it smaller', [['grouped-query attention', 'Llama 3 8B: 8 KV heads → 128 KB/token', 'ok'], ['quantised cache', 'fp8 / int8 → half again', 'ok'], ['paged attention', 'no wasted, fragmented memory', 'ok']])],
    note: 'So models and servers shrink it: grouped-query attention shares keys and values across query heads, caches can be quantised, and vLLM-style paging allocates cache in blocks so more requests fit. Prompt caching reuses the prefill for repeated prefixes.',
  },
]

export function KvCacheVisualizer() {
  return <CodeTrace code={KV_CODE} steps={kvSteps} interval={3200} />
}

// ── Model Context Protocol ─────────────────────────────────────────────────

const mcpSteps: SequenceStep[] = [
  {
    message: { from: 1, to: 2, label: 'initialize { protocolVersion, capabilities }' },
    panel: { title: 'transport', lines: ['local server: stdio (a child process)', 'remote server: Streamable HTTP', 'messages: JSON-RPC 2.0'] },
    note: 'An AI application (the host) starts an MCP client for each server it\'s configured to use. They open with a handshake, agreeing on the protocol version and what each side supports.',
  },
  {
    message: { from: 2, to: 1, label: 'result { capabilities: { tools, resources } }', dashed: true, tone: 'ok' },
    note: 'This server says it offers tools and resources. The client confirms with an initialized notification, and the session is ready.',
  },
  {
    message: { from: 1, to: 2, label: 'tools/list' },
    note: 'The client asks which tools exist.',
  },
  {
    message: { from: 2, to: 1, label: '[{ name: "search_issues", inputSchema: {…} }]', dashed: true, tone: 'ok' },
    note: 'Each tool has a name, a description and a JSON Schema for its input. The host passes these to the model as tool definitions — the same mechanism as ordinary tool calling.',
  },
  {
    message: { from: 0, to: 0, label: 'model: call search_issues({ query: "login bug" })', tone: 'warn' },
    note: 'The user asks about open login bugs. The model decides a tool would help and produces a tool call. The host can ask the user to approve it first.',
  },
  {
    message: { from: 1, to: 2, label: 'tools/call { name, arguments }' },
    note: 'The client sends the call to the server that owns the tool.',
  },
  {
    message: { from: 2, to: 3, label: 'GET /issues?q=login+bug' },
    note: 'The server does the real work with its own credentials — here, calling an issue tracker\'s API. The model and host never see those credentials.',
  },
  {
    message: { from: 2, to: 1, label: 'result { content: [{ type: "text", … }] }', dashed: true, tone: 'ok' },
    note: 'The client hands the result to the host, which adds it to the model\'s context as a tool result, and the model writes its answer. Any MCP-compatible app can now use this server — write the integration once, use it everywhere.',
  },
]

export function McpVisualizer() {
  return <SequenceDiagram actors={['host + model', 'MCP client', 'MCP server', 'issue tracker']} steps={mcpSteps} interval={2800} />
}
