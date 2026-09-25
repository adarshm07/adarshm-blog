export type Dimension = {
  key: string
  label: string
  looksLike: string
}

export type Problem = {
  slug: string
  title: string
  prompt: string
  scale: string
  /** Hints shown only after an attempt is submitted, so they cannot be copied first. */
  wouldExpect: string[]
}

/** The same six dimensions grade every problem, so scores are comparable. */
export const DIMENSIONS: Dimension[] = [
  {
    key: 'requirements',
    label: 'Requirements & scope',
    looksLike:
      'Separates functional from non-functional, states what is out of scope, and pins down the numbers that matter before designing.',
  },
  {
    key: 'estimation',
    label: 'Back-of-envelope',
    looksLike:
      'Turns the scale into QPS, storage, and bandwidth, and lets those numbers drive the design rather than decorating it.',
  },
  {
    key: 'api',
    label: 'API & data model',
    looksLike:
      'Concrete endpoints or operations, the entities behind them, keys and indexes, and why the storage engine fits the access pattern.',
  },
  {
    key: 'architecture',
    label: 'Architecture',
    looksLike:
      'Components and how a request flows through them; where state lives; what is synchronous and what is queued.',
  },
  {
    key: 'scaling',
    label: 'Scaling & bottlenecks',
    looksLike:
      'Names the component that breaks first at the stated scale, and addresses it — partitioning, caching, replication, fan-out strategy.',
  },
  {
    key: 'tradeoffs',
    label: 'Trade-offs & failure',
    looksLike:
      'Consistency choices, what happens when a dependency is down, and an honest account of what the design gives up.',
  },
]

export const PROBLEMS: Problem[] = [
  {
    slug: 'url-shortener',
    title: 'URL shortener',
    prompt:
      'Design a service that turns a long URL into a short one and redirects visitors to the original. Users can optionally pick a custom alias and see click counts.',
    scale: '100M new links/day, 10B redirects/day, links live for 5 years.',
    wouldExpect: [
      'Read-heavy by roughly 100:1 — the redirect path is the system',
      'Key generation: counter + base62, hash with collision check, or pre-generated key pool',
      'A cache in front of the store, with the hot tail of links serving most traffic',
      '301 vs 302 and what caching the redirect costs you in analytics',
      'Click counting as an async write path, not part of the redirect',
    ],
  },
  {
    slug: 'rate-limiter',
    title: 'Distributed rate limiter',
    prompt:
      'Design a rate limiter for a public API: 1000 requests per minute per API key, enforced across a fleet of stateless servers.',
    scale: '10k API keys, 50k requests/second at peak, 40 application servers.',
    wouldExpect: [
      'Algorithm choice — token bucket vs sliding window — and what each does to bursts',
      'Where the counter lives, and the cost of a network hop on every request',
      'Atomicity: INCR with expiry, a Lua script, or local counters with reconciliation',
      'What happens when the counter store is down — fail open or fail closed',
      'Returning 429 with Retry-After, and the client behaviour you want back',
    ],
  },
  {
    slug: 'news-feed',
    title: 'News feed',
    prompt:
      'Design the home timeline for a social network: each user sees recent posts from the accounts they follow, newest first.',
    scale: '300M daily actives, average 200 follows, some accounts with 50M followers.',
    wouldExpect: [
      'Fan-out on write vs on read, and why neither alone works',
      'The celebrity problem — hybrid fan-out for high-follower accounts',
      'Feed storage: precomputed lists of post ids, hydrated at read time',
      'Pagination that survives inserts (cursors, not offsets)',
      'Ranking as a separate concern from delivery',
    ],
  },
  {
    slug: 'chat',
    title: 'Chat / messaging',
    prompt:
      'Design a one-to-one and small-group messaging service with delivery receipts, presence, and history that survives app reinstalls.',
    scale: '50M daily actives, 10B messages/day, groups up to 500 members.',
    wouldExpect: [
      'Connection model — WebSocket with a presence/session registry, and reconnection',
      'Message ordering and idempotent client-generated ids',
      'Storage partitioned by conversation, with a per-conversation sequence',
      'Offline delivery: queues, push notifications, and catch-up on reconnect',
      'Group fan-out and the read-receipt write amplification it creates',
    ],
  },
  {
    slug: 'file-storage',
    title: 'File sync & storage',
    prompt:
      'Design a Dropbox-style service: files sync between a user’s devices, with version history and sharing.',
    scale: '50M users, 10GB average storage each, files up to 5GB.',
    wouldExpect: [
      'Chunking files and content-addressed storage for dedupe and resumable upload',
      'Metadata service separate from blob storage, and why',
      'Sync protocol: change journal per user, long-poll or push notification',
      'Conflict handling when two devices edit offline',
      'Upload path going direct to object storage with signed URLs',
    ],
  },
  {
    slug: 'notification-system',
    title: 'Notification system',
    prompt:
      'Design a service other teams call to send notifications by push, email, and SMS, with user preferences and no duplicate sends.',
    scale: '100M users, 500M notifications/day, bursts of 10M in a minute.',
    wouldExpect: [
      'A queue between the API and the providers, with per-channel workers',
      'Idempotency keys so a retry cannot double-send',
      'Preference and quiet-hours checks as a filtering stage',
      'Provider failure: retries with backoff, circuit breakers, failover provider',
      'Template rendering, and the difference between transactional and bulk paths',
    ],
  },
  {
    slug: 'search-autocomplete',
    title: 'Search autocomplete',
    prompt:
      'Design the type-ahead suggestion service for a large search engine: as the user types, return the top completions.',
    scale: '5B searches/day, suggestions must return in under 100ms at p99.',
    wouldExpect: [
      'A trie of prefixes with top-k cached at each node',
      'Rebuilding the structure offline from query logs, then shipping it to the edge',
      'Why the serving path does no aggregation — everything is precomputed',
      'Debouncing on the client and the request volume it saves',
      'Handling misspellings, personalisation, and freshness as separate layers',
    ],
  },
  {
    slug: 'ride-hailing',
    title: 'Ride matching',
    prompt:
      'Design the matching half of a ride-hailing service: riders request a trip, nearby drivers are found, and one is assigned.',
    scale: '5M daily trips, 500k drivers sending location every 4 seconds.',
    wouldExpect: [
      'Geospatial indexing — geohash, S2, or quadtrees — and why a lat/long B-tree fails',
      'The write load from location pings, and keeping it out of the durable store',
      'Matching as a short-lived transaction with a lock on the driver',
      'What happens when two riders match the same driver',
      'Regional sharding, because the problem is naturally geographic',
    ],
  },
]
