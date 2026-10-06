import { SequenceDiagram, type SequenceStep } from '@/app/components/sequence-diagram'

// IP addresses use 203.0.113.0/24, the block reserved for documentation.

const urlSteps: SequenceStep[] = [
  {
    note: 'You type example.com and press Enter. Before a single pixel changes, four separate systems are going to take part — and most of the time it all happens in well under a second.',
  },
  {
    message: { from: 0, to: 1, label: 'example.com ⏎' },
    note: 'The browser decides whether you typed an address or a search, and turns "example.com" into a full URL: https://example.com/ — scheme, host, path.',
  },
  {
    message: { from: 1, to: 1, label: 'cached? no' },
    note: 'It checks its own caches first: a recent DNS answer, an open connection, even a stored copy of the page. This time, nothing usable.',
  },
  {
    message: { from: 1, to: 2, label: 'where is example.com?' },
    note: 'Computers connect to numbers, not names. So the browser asks DNS — the internet\'s phone book — for the IP address of example.com.',
  },
  {
    message: { from: 2, to: 1, label: '203.0.113.10', dashed: true },
    note: 'DNS answers with an IP address. (How DNS finds it is a story of its own — see the DNS post.)',
  },
  {
    message: { from: 1, to: 3, label: 'TCP + TLS handshake' },
    note: 'The browser opens a connection to that address, then runs a TLS handshake so everything after this point is encrypted and the server has proved who it is. That is the "S" in HTTPS.',
  },
  {
    message: { from: 1, to: 3, label: 'GET /' },
    note: 'Now it sends an HTTP request: "GET /" — please give me the page at the root path — along with headers like which languages and formats it accepts.',
  },
  {
    message: { from: 3, to: 1, label: '200 OK + HTML', dashed: true, tone: 'ok' },
    note: 'The server responds with a status code (200 means success), some headers, and the HTML of the page.',
  },
  {
    message: { from: 1, to: 1, label: 'parse → fetch CSS, JS, images' },
    note: 'The browser reads the HTML top to bottom. Every stylesheet, script and image it references triggers more requests — often dozens — over the same connection.',
  },
  {
    message: { from: 1, to: 0, label: 'pixels on screen', tone: 'ok' },
    note: 'Finally it works out styles and layout, paints the page, and runs your JavaScript. The whole trip: name → address → secure connection → request → response → render.',
  },
]

export function UrlJourneyVisualizer() {
  return <SequenceDiagram actors={['you', 'browser', 'DNS', 'server']} steps={urlSteps} />
}

const dnsSteps: SequenceStep[] = [
  {
    note: 'DNS turns a name like example.com into an IP address. No single server knows every name — the answer is found by asking a chain of servers, each responsible for one part of the name.',
  },
  {
    message: { from: 0, to: 0, label: 'cache? miss' },
    note: 'The browser and the operating system both keep a small cache of recent answers. If either has a fresh one, the lookup ends right here. This time it doesn\'t.',
  },
  {
    message: { from: 0, to: 1, label: 'example.com?' },
    note: 'The question goes to a recursive resolver — usually run by your ISP, or a public one like 1.1.1.1 or 8.8.8.8. Its job is to do the legwork and come back with a final answer.',
  },
  {
    message: { from: 1, to: 2, label: 'example.com?' },
    note: 'With nothing cached, the resolver starts at the top: a root server. There are 13 root server names, each backed by many machines worldwide.',
  },
  {
    message: { from: 2, to: 1, label: 'ask the .com servers', dashed: true },
    note: 'The root doesn\'t know example.com. It only knows who runs each top-level domain, so it refers the resolver to the .com servers.',
  },
  {
    message: { from: 1, to: 3, label: 'example.com?' },
    note: 'The resolver asks a .com server.',
  },
  {
    message: { from: 3, to: 1, label: "ask example.com's nameservers", dashed: true },
    note: 'The .com servers don\'t store example.com\'s address either — they store which nameservers are authoritative for it, and refer the resolver there.',
  },
  {
    message: { from: 1, to: 4, label: 'example.com?' },
    note: 'Third hop: the authoritative nameserver, run by whoever manages the domain (often their DNS or hosting provider).',
  },
  {
    message: { from: 4, to: 1, label: 'A 203.0.113.10 · TTL 3600', dashed: true, tone: 'ok' },
    note: 'This server actually has the record: an A record with the IPv4 address, plus a TTL — how many seconds the answer may be cached.',
  },
  {
    message: { from: 1, to: 0, label: '203.0.113.10', dashed: true, tone: 'ok' },
    panel: {
      title: 'caches now hold',
      lines: [
        'resolver  example.com → 203.0.113.10  1 h',
        'resolver  .com nameservers          2 days',
        'browser   example.com → 203.0.113.10',
      ],
    },
    note: 'The resolver hands the answer back and caches everything it learned. The next lookup for example.com — from you or anyone using that resolver — skips all three hops until the TTL runs out.',
  },
]

export function DnsLookupVisualizer() {
  return (
    <SequenceDiagram
      actors={['browser', 'resolver', 'root', '.com', 'authority']}
      steps={dnsSteps}
    />
  )
}

const tlsSteps: SequenceStep[] = [
  {
    panel: { title: 'what someone on the network sees', lines: ['(nothing yet)'] },
    note: 'HTTPS is HTTP sent through a TLS connection. Before any HTTP is sent, client and server need two things: a shared secret key that nobody listening could know, and proof that the server is really example.com.',
  },
  {
    message: { from: 0, to: 1, label: 'TCP: SYN → SYN-ACK → ACK' },
    panel: { title: 'what someone on the network sees', lines: ['TCP handshake to 203.0.113.10:443'] },
    note: 'First, an ordinary TCP connection to port 443. This sets up a reliable byte stream — but everything on it is still readable by anyone on the path.',
  },
  {
    message: { from: 0, to: 1, label: 'ClientHello · ciphers · key share' },
    panel: {
      title: 'what someone on the network sees',
      lines: ['TCP handshake to 203.0.113.10:443', 'ClientHello: TLS 1.3, server name example.com, key share'],
    },
    note: 'The client says which TLS versions and ciphers it supports, which site it wants (so one server can host many), and sends its half of a Diffie–Hellman key exchange: a public value derived from a random secret it keeps.',
  },
  {
    message: { from: 1, to: 0, label: 'ServerHello · chosen cipher · key share', dashed: true },
    panel: {
      title: 'what someone on the network sees',
      lines: [
        'TCP handshake to 203.0.113.10:443',
        'ClientHello: TLS 1.3, server name example.com, key share',
        'ServerHello: cipher chosen, key share',
      ],
    },
    note: 'The server picks a cipher and sends its own public key share. Both sides can now combine their private secret with the other\'s public share and arrive at the same key. Someone who saw both public shares still cannot compute it.',
  },
  {
    message: { from: 1, to: 0, label: 'certificate + signature  🔒', dashed: true },
    panel: {
      title: 'what someone on the network sees',
      lines: ['… handshake …', '🔒 8f3a91c2e07b… (encrypted)'],
    },
    note: 'From here on everything is encrypted. The server sends its certificate — "this public key belongs to example.com", signed by a certificate authority — and signs the handshake with the matching private key.',
  },
  {
    message: { from: 0, to: 0, label: 'verify: trusted CA? name matches?', tone: 'ok' },
    panel: {
      title: 'what someone on the network sees',
      lines: ['… handshake …', '🔒 8f3a91c2e07b… (encrypted)'],
    },
    note: 'The client checks the certificate chains up to a root CA it already trusts, hasn\'t expired, and names example.com — and that the signature proves the server holds the private key. An impostor fails here.',
  },
  {
    message: { from: 0, to: 1, label: 'Finished  🔒' },
    panel: {
      title: 'what someone on the network sees',
      lines: ['… handshake …', '🔒 8f3a91c2e07b…', '🔒 c41d07aa5e9f…'],
    },
    note: 'Both sides send a Finished message: a checksum of the whole handshake. If anyone tampered with a message in transit, these won\'t match and the connection is dropped. In TLS 1.3 this takes one round trip.',
  },
  {
    message: { from: 0, to: 1, label: 'GET /  🔒', tone: 'ok' },
    panel: {
      title: 'what someone on the network sees',
      lines: ['… handshake …', '🔒 ciphertext, ciphertext, ciphertext…', '(the IP, and usually the hostname — not the path, cookies or content)'],
    },
    note: 'Now the HTTP request travels encrypted. An observer can see which IP you connected to, usually the hostname (it travelled unencrypted in the ClientHello), and roughly how much data moved — but not the path, cookies, form data or the page itself.',
  },
]

export function TlsHandshakeVisualizer() {
  return <SequenceDiagram actors={['client', 'server']} steps={tlsSteps} interval={3000} />
}

const httpSteps: SequenceStep[] = [
  {
    note: 'HTTP is a request/response protocol: the client sends one request, the server sends back one response. Both are mostly plain, readable text.',
  },
  {
    message: { from: 0, to: 1, label: 'GET /products?page=2' },
    panel: {
      title: 'request',
      lines: [
        'GET /products?page=2 HTTP/1.1',
        'Host: shop.example',
        'Accept: text/html',
        'Accept-Language: en',
        'Cookie: sid=s_8f2',
      ],
    },
    note: 'A request is a method (what to do), a path (to what), headers (extra information, one per line) and optionally a body. GET means "fetch this"; it has no body.',
  },
  {
    message: { from: 1, to: 1, label: 'route → handler' },
    note: 'The server matches the method and path to the code that handles them, reads the query string (page=2) and headers, and does the work — often querying a database.',
  },
  {
    message: { from: 1, to: 0, label: '200 OK', dashed: true, tone: 'ok' },
    panel: {
      title: 'response',
      lines: [
        'HTTP/1.1 200 OK',
        'Content-Type: text/html; charset=utf-8',
        'Content-Length: 5120',
        'Cache-Control: max-age=60',
        '',
        '<!doctype html><html>…',
      ],
    },
    note: 'A response is a status code, headers, a blank line, and the body. Content-Type tells the browser how to interpret the body; Cache-Control tells it how long it may reuse it.',
  },
  {
    message: { from: 0, to: 1, label: 'POST /cart' },
    panel: {
      title: 'request',
      lines: [
        'POST /cart HTTP/1.1',
        'Host: shop.example',
        'Content-Type: application/json',
        '',
        '{"productId": 17, "qty": 1}',
      ],
    },
    note: 'POST sends data in the body — here JSON, announced by its Content-Type. GET reads, POST creates, PUT/PATCH update, DELETE removes.',
  },
  {
    message: { from: 1, to: 0, label: '201 Created', dashed: true, tone: 'ok' },
    note: 'Status codes come in families: 2xx success, 3xx redirect ("look over there"), 4xx the client made a mistake, 5xx the server failed.',
  },
  {
    message: { from: 0, to: 1, label: 'GET /prodcts' },
    note: 'A typo in the path…',
  },
  {
    message: { from: 1, to: 0, label: '404 Not Found', dashed: true, tone: 'bad' },
    note: '…gets a 404 — a 4xx, so the problem is the request, not the server. Every HTTP request on the web, from a page load to an API call, is this same shape.',
  },
]

export function HttpExchangeVisualizer() {
  return <SequenceDiagram actors={['browser', 'server']} steps={httpSteps} />
}

const cookieSteps: SequenceStep[] = [
  {
    panel: { title: 'browser cookie jar · shop.example', lines: ['(empty)'] },
    note: 'HTTP is stateless: each request stands alone, and the server doesn\'t remember you between them. Cookies are how the browser carries a little state back every time.',
  },
  {
    message: { from: 0, to: 1, label: 'POST /login  email + password' },
    panel: { title: 'browser cookie jar · shop.example', lines: ['(empty)'] },
    note: 'You log in. The server checks your password against the stored hash.',
  },
  {
    message: { from: 1, to: 2, label: 'create s_8f2 → user 42' },
    panel: { title: 'browser cookie jar · shop.example', lines: ['(empty)'] },
    note: 'It creates a session: a long random ID mapped to your user, stored server-side (in a database or Redis). The ID itself means nothing — it\'s just a key.',
  },
  {
    message: { from: 1, to: 0, label: 'Set-Cookie: sid=s_8f2; HttpOnly; Secure', dashed: true, tone: 'ok' },
    panel: {
      title: 'browser cookie jar · shop.example',
      lines: ['sid = s_8f2', '  HttpOnly  (JavaScript cannot read it)', '  Secure    (only sent over HTTPS)', '  SameSite=Lax (not sent on most cross-site requests)'],
    },
    note: 'The response includes a Set-Cookie header. The browser stores the cookie for this site. The attributes matter for security: HttpOnly blocks scripts from stealing it, SameSite helps stop other sites from using it.',
  },
  {
    message: { from: 0, to: 1, label: 'GET /account  Cookie: sid=s_8f2' },
    panel: { title: 'browser cookie jar · shop.example', lines: ['sid = s_8f2'] },
    note: 'On every later request to shop.example, the browser attaches the cookie automatically. Your code doesn\'t do anything — that\'s the whole point.',
  },
  {
    message: { from: 1, to: 2, label: 'lookup s_8f2 → user 42' },
    panel: { title: 'browser cookie jar · shop.example', lines: ['sid = s_8f2'] },
    note: 'The server looks the session ID up and now knows who you are for this request.',
  },
  {
    message: { from: 1, to: 0, label: '200  your account', dashed: true, tone: 'ok' },
    panel: { title: 'browser cookie jar · shop.example', lines: ['sid = s_8f2'] },
    note: 'Logged-in page served. Anyone who steals the session ID can do the same — which is why it must be random, travel only over HTTPS, and expire.',
  },
  {
    message: { from: 1, to: 0, label: 'logout → delete session + expire cookie', dashed: true },
    panel: { title: 'browser cookie jar · shop.example', lines: ['(empty)'] },
    note: 'Logging out deletes the session on the server — the important part — and sends Set-Cookie with Max-Age=0 so the browser forgets it too.',
  },
]

export function CookieSessionVisualizer() {
  return <SequenceDiagram actors={['browser', 'server', 'sessions']} steps={cookieSteps} />
}

const corsSteps: SequenceStep[] = [
  {
    note: 'A page on app.example wants data from api.example. The two have different origins (scheme + host + port), so the browser applies the same-origin policy — and CORS is the way a server relaxes it.',
  },
  {
    message: { from: 0, to: 1, label: "fetch('https://api.example/me')" },
    note: 'The page\'s JavaScript makes a request to another origin.',
  },
  {
    message: { from: 1, to: 2, label: 'GET /me  Origin: https://app.example' },
    note: 'The browser sends it — with an Origin header saying which site is asking. A simple GET like this goes straight out.',
  },
  {
    message: { from: 2, to: 1, label: '200 + data  (no CORS headers)', dashed: true },
    note: 'The server answers normally, but without an Access-Control-Allow-Origin header.',
  },
  {
    message: { from: 1, to: 0, label: '✕ blocked by CORS policy', tone: 'bad' },
    note: 'The browser refuses to hand the response to the page. Note the request already happened — CORS doesn\'t protect the server, it stops one site\'s scripts from reading another site\'s responses (which may contain your private data).',
  },
  {
    message: { from: 0, to: 1, label: "fetch(…, { method: 'PUT', JSON })" },
    note: 'Now the server is configured for CORS, and the page sends a PUT with a JSON body. That is not a "simple" request, so the browser checks permission first.',
  },
  {
    message: { from: 1, to: 2, label: 'OPTIONS  preflight: may app.example PUT?' },
    note: 'The preflight: an OPTIONS request carrying Origin, Access-Control-Request-Method: PUT and the headers it wants to send. No body, no cookies.',
  },
  {
    message: { from: 2, to: 1, label: '204  Allow-Origin: app.example · Allow-Methods: PUT', dashed: true, tone: 'ok' },
    note: 'The server says yes, for this origin and this method. The browser can cache that answer for a while (Access-Control-Max-Age).',
  },
  {
    message: { from: 1, to: 2, label: 'PUT /me  {json}' },
    note: 'Only now is the real request sent.',
  },
  {
    message: { from: 2, to: 1, label: '200 + Allow-Origin: app.example', dashed: true },
    note: 'The response also carries the allow header…',
  },
  {
    message: { from: 1, to: 0, label: '✓ response delivered', tone: 'ok' },
    note: '…so the page gets it. CORS errors are always fixed on the server that is being called, by sending the right headers — never by the calling page.',
  },
]

export function CorsVisualizer() {
  return <SequenceDiagram actors={['app.example page', 'browser', 'api.example']} steps={corsSteps} />
}

const cacheSteps: SequenceStep[] = [
  {
    panel: { title: 'browser cache', lines: ['(empty)'] },
    note: 'The fastest request is the one never sent. HTTP caching lets the browser keep responses and reuse them — controlled entirely by headers the server sends.',
  },
  {
    message: { from: 0, to: 1, label: 'need /app.css' },
    panel: { title: 'browser cache', lines: ['(empty)'] },
    note: 'The page needs a stylesheet. The browser checks its cache: nothing there.',
  },
  {
    message: { from: 1, to: 2, label: 'GET /app.css' },
    panel: { title: 'browser cache', lines: ['(empty)'] },
    note: 'So it goes to the server.',
  },
  {
    message: { from: 2, to: 1, label: '200 · max-age=60 · ETag "v1"', dashed: true },
    panel: { title: 'browser cache', lines: ['/app.css   ETag "v1"', '            fresh for 60 s'] },
    note: 'The response says: Cache-Control: max-age=60 — reuse this for 60 seconds without asking — and ETag: "v1", a version fingerprint for later.',
  },
  {
    message: { from: 1, to: 0, label: 'app.css' },
    panel: { title: 'browser cache', lines: ['/app.css   ETag "v1"', '            fresh for 60 s'] },
    note: 'Stored and delivered.',
  },
  {
    message: { from: 1, to: 0, label: '30 s later: served from cache (0 requests)', tone: 'ok' },
    panel: { title: 'browser cache', lines: ['/app.css   ETag "v1"', '            age 30 s · fresh'] },
    note: 'Another page needs app.css 30 seconds later. The copy is still fresh, so the browser uses it without touching the network at all.',
  },
  {
    message: { from: 1, to: 1, label: '90 s later: stale' },
    panel: { title: 'browser cache', lines: ['/app.css   ETag "v1"', '            age 90 s · stale'] },
    note: 'After 60 seconds the copy is stale. It may still be correct — the browser just has to check.',
  },
  {
    message: { from: 1, to: 2, label: 'GET /app.css  If-None-Match: "v1"' },
    panel: { title: 'browser cache', lines: ['/app.css   ETag "v1"', '            age 90 s · stale'] },
    note: 'It revalidates: "I have version v1 — has it changed?"',
  },
  {
    message: { from: 2, to: 1, label: '304 Not Modified  (no body)', dashed: true, tone: 'ok' },
    panel: { title: 'browser cache', lines: ['/app.css   ETag "v1"', '            fresh for 60 s again'] },
    note: 'Unchanged, so the server replies 304 with no body. A round trip, but almost no bytes. The cached copy is fresh again.',
  },
  {
    message: { from: 1, to: 0, label: 'app.css (revalidated)', tone: 'ok' },
    panel: { title: 'browser cache', lines: ['/app.css   ETag "v1"', '            fresh for 60 s again'] },
    note: 'Best practice for build assets: put a content hash in the filename (app.3f9a.css) and cache it for a year with immutable. A new version gets a new URL, so the old cache can never be wrong.',
  },
]

export function HttpCacheVisualizer() {
  return <SequenceDiagram actors={['page', 'browser cache', 'server']} steps={cacheSteps} />
}

const apiSteps: SequenceStep[] = [
  {
    note: 'An API is a set of requests one program agrees to answer for another. A web API is usually just HTTP: your app sends requests to URLs, and gets structured data — usually JSON — back.',
  },
  {
    message: { from: 0, to: 1, label: 'GET /users/42  Authorization: Bearer …' },
    note: 'Your app asks for user 42. The URL names the resource; the method says what to do with it; a token says who is asking.',
  },
  {
    message: { from: 1, to: 1, label: 'check token · validate input' },
    note: 'The API checks the token is valid and allowed to read this user, and that the input makes sense. It is the gatekeeper — your app never touches the database directly.',
  },
  {
    message: { from: 1, to: 2, label: 'SELECT … WHERE id = 42' },
    note: 'It fetches the data from wherever it really lives.',
  },
  {
    message: { from: 2, to: 1, label: 'row', dashed: true },
    note: 'The database returns a row.',
  },
  {
    message: { from: 1, to: 0, label: '200  {"id": 42, "name": "Ada"}', dashed: true, tone: 'ok' },
    panel: { title: 'response body (JSON)', lines: ['{', '  "id": 42,', '  "name": "Ada",', '  "plan": "pro"', '}'] },
    note: 'The API turns it into JSON — only the fields the caller should see — and returns it with a status code. Your app neither knows nor cares what database is behind it.',
  },
  {
    message: { from: 0, to: 1, label: 'POST /users  {"name": "Grace"}' },
    note: 'Same API, different method: POST to the collection creates a new user from the JSON body.',
  },
  {
    message: { from: 1, to: 0, label: '201 Created  {"id": 43, …}', dashed: true, tone: 'ok' },
    note: '201 Created, with the new resource in the body.',
  },
  {
    message: { from: 0, to: 1, label: 'GET /users/999' },
    note: 'Asking for something that does not exist…',
  },
  {
    message: { from: 1, to: 0, label: '404  {"error": "user not found"}', dashed: true, tone: 'bad' },
    note: '…gets a 404 and an error body. That predictable shape — resources as URLs, actions as methods, results as status codes and JSON — is what people mean by a REST API.',
  },
]

export function ApiRequestVisualizer() {
  return <SequenceDiagram actors={['your app', 'API', 'database']} steps={apiSteps} />
}
