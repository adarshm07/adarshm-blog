import { SequenceDiagram, type SequenceStep } from '@/app/components/sequence-diagram'
import { CodeTrace, type TracePanel, type TraceStep } from '@/app/components/code-trace'

const panel = (title: string, rows: [string, string, ('ok' | 'warn' | 'bad' | 'muted')?][]): TracePanel => ({
  title,
  rows: rows.map(([k, v, tone]) => ({ k, v, tone })),
})

// ── SOLID ──────────────────────────────────────────────────────────────────

const SOLID_CODE = [
  'class OrderService {',
  '  constructor(',
  '    private repo: OrderRepository,',
  '    private payments: PaymentGateway,',
  '    private notifier: Notifier,',
  '  ) {}',
  '',
  '  async place(order: Order) {',
  '    order.validate()',
  '    const receipt = await this.payments.charge(order.total)',
  '    await this.repo.save(order.paid(receipt))',
  "    await this.notifier.send(order.customer, 'Order placed')",
  '  }',
  '}',
  '',
  'interface PaymentGateway {',
  '  charge(amount: Money): Promise<Receipt> // or throws Declined',
  '}',
  'class CardGateway implements PaymentGateway { /* … */ }',
  'class UpiGateway implements PaymentGateway { /* … */ }',
  '',
  'interface Notifier {',
  '  send(to: Customer, message: string): Promise<void>',
  '}',
]

const solidSteps: TraceStep[] = [
  {
    lines: [7, 8, 9, 10, 11],
    panels: [
      panel('before', [
        ['OrderService did', 'validation, card API calls, SQL, SMTP', 'bad'],
        ['reasons to change', '4', 'bad'],
      ]),
      panel('S — single responsibility', [
        ['OrderService now', 'coordinates the steps', 'ok'],
        ['rules live in', 'Order.validate()'],
      ]),
    ],
    note: 'S: a class should have one reason to change. The old OrderService changed whenever tax rules, the card provider, the schema or the email template changed. Now it only sequences the steps; each step lives with the object that owns it.',
  },
  {
    lines: [15, 16, 17, 18, 19],
    panels: [
      panel('O — open/closed', [
        ['add UPI payments', 'new class UpiGateway', 'ok'],
        ['edits to OrderService', 'none', 'ok'],
      ]),
    ],
    note: 'O: open for extension, closed for modification. Adding a payment method means adding a class that implements PaymentGateway — not adding another branch to an if/else inside place().',
  },
  {
    lines: [16, 18, 19],
    panels: [
      panel('L — Liskov substitution', [
        ['contract', 'returns a Receipt, or throws Declined'],
        ['CardGateway', 'honours it', 'ok'],
        ['a gateway returning null on failure', 'breaks every caller', 'bad'],
      ]),
    ],
    note: 'L: any implementation must be usable wherever the interface is expected, without the caller checking which one it got. A subtype that weakens the contract — returns null instead of throwing, or demands a stricter input — forces instanceof checks back into OrderService.',
  },
  {
    lines: [21, 22, 23],
    panels: [
      panel('I — interface segregation', [
        ['OrderService needs', 'send()', 'ok'],
        ['a fat CustomerComms interface', 'send, sendBulk, unsubscribe, templates…', 'warn'],
      ]),
    ],
    note: 'I: depend on the smallest interface you use. OrderService only sends one message, so it asks for a Notifier with one method. A fake for tests is three lines, and changes to bulk mail can\'t touch it.',
  },
  {
    lines: [1, 2, 3, 4, 5],
    panels: [
      panel('D — dependency inversion', [
        ['OrderService imports', 'interfaces only', 'ok'],
        ['who picks CardGateway?', 'the composition root (main)'],
        ['in tests', 'pass fakes in the constructor', 'ok'],
      ]),
    ],
    note: 'D: high-level policy shouldn\'t depend on low-level details; both depend on abstractions. The service receives its collaborators instead of constructing them, so main() wires real ones and tests wire fakes.',
  },
]

export function SolidVisualizer() {
  return <CodeTrace code={SOLID_CODE} steps={solidSteps} interval={3600} />
}

// ── Strategy ───────────────────────────────────────────────────────────────

const STRATEGY_CODE = [
  'interface PricingStrategy {',
  '  feeFor(ticket: Ticket): number',
  '}',
  '',
  'class Hourly implements PricingStrategy {',
  '  constructor(private rate: number) {}',
  '  feeFor(ticket: Ticket) {',
  '    return Math.ceil(ticket.hours()) * this.rate',
  '  }',
  '}',
  '',
  'class FlatRate implements PricingStrategy {',
  '  constructor(private amount: number) {}',
  '  feeFor() { return this.amount }',
  '}',
  '',
  'class ExitGate {',
  '  constructor(private pricing: PricingStrategy) {}',
  '  checkout(ticket: Ticket) {',
  '    return this.pricing.feeFor(ticket)',
  '  }',
  '}',
]

const ticket = (strategy: string, fee: string, tone?: 'ok' | 'warn') =>
  panel('checkout', [
    ['ticket', '09:00 → 12:30 (3.5 h)'],
    ['strategy', strategy],
    ['fee', fee, tone],
  ])

const strategySteps: TraceStep[] = [
  {
    lines: [0, 1, 2],
    panels: [panel('the contract', [['input', 'a ticket'], ['output', 'a fee in ₹']])],
    note: 'The thing that varies — how a fee is computed — gets its own interface. The parking lot\'s exit gate will only ever talk to this interface.',
  },
  {
    lines: [16, 17, 18, 19, 6, 7],
    panels: [ticket('new Hourly(40)', '⌈3.5⌉ × 40 = ₹160', 'ok')],
    note: 'On a weekday the gate is built with an Hourly strategy. checkout() delegates: 3.5 hours rounds up to 4, at ₹40 an hour.',
  },
  {
    lines: [19, 11, 12, 13],
    panels: [ticket('new FlatRate(100)', '₹100', 'ok')],
    note: 'On weekends main() builds the gate with FlatRate(100) instead. Same ExitGate code, same ticket, different behaviour — chosen at runtime.',
  },
  {
    lines: [16, 17, 18, 19, 20, 21],
    panels: [
      panel('adding "first hour free"', [
        ['new code', 'class FirstHourFree implements PricingStrategy', 'ok'],
        ['ExitGate changes', 'none', 'ok'],
        ['tests for old strategies', 'untouched', 'ok'],
      ]),
    ],
    note: 'A new pricing rule is a new class. ExitGate never grows a switch on pricing type, and each strategy is tested on its own with a few tickets.',
  },
]

export function StrategyVisualizer() {
  return <CodeTrace code={STRATEGY_CODE} steps={strategySteps} interval={3000} />
}

// ── State ──────────────────────────────────────────────────────────────────

const STATE_CODE = [
  'interface State {',
  '  insert(m: Machine, cents: number): void',
  '  select(m: Machine, slot: string): void',
  '}',
  '',
  'class Idle implements State {',
  '  insert(m: Machine, cents: number) {',
  '    m.balance += cents',
  '    m.state = new HasMoney()',
  '  }',
  "  select(m: Machine) { m.show('Insert coins first') }",
  '}',
  '',
  'class HasMoney implements State {',
  '  insert(m: Machine, cents: number) { m.balance += cents }',
  '  select(m: Machine, slot: string) {',
  '    const item = m.inventory.get(slot)',
  "    if (m.balance < item.price) return m.show('Add more')",
  '    m.dispense(slot, m.balance - item.price)',
  '    m.balance = 0',
  '    m.state = m.inventory.isEmpty() ? new SoldOut() : new Idle()',
  '  }',
  '}',
]

const machine = (event: string, state: string, balance: string, display: string, tone?: 'ok' | 'warn') =>
  panel('machine', [
    ['event', event],
    ['state', state, tone],
    ['balance', balance],
    ['display', display],
  ])

const stateSteps: TraceStep[] = [
  {
    lines: [0, 1, 2, 3],
    panels: [machine('—', 'Idle', '0¢', 'Ready')],
    note: 'Every state answers the same events — insert and select — in its own way. The machine holds a reference to its current state object and forwards each event to it.',
  },
  {
    lines: [10],
    panels: [machine("select('A1')", 'Idle', '0¢', 'Insert coins first', 'warn')],
    note: 'Pressing A1 with no money: Idle\'s select just shows a message. There is no "if (balance === 0)" check scattered through the machine — the state itself is the check.',
  },
  {
    lines: [6, 7, 8],
    panels: [machine('insert(100)', 'HasMoney', '100¢', '100¢')],
    note: 'Inserting a coin in Idle adds to the balance and moves the machine to HasMoney. Transitions live inside the states.',
  },
  {
    lines: [15, 16, 17],
    panels: [machine("select('A1') — 125¢", 'HasMoney', '100¢', 'Add more', 'warn')],
    note: 'A1 costs 125¢. HasMoney checks the balance and refuses. The state doesn\'t change.',
  },
  {
    lines: [14],
    panels: [machine('insert(50)', 'HasMoney', '150¢', '150¢')],
    note: 'Another coin while in HasMoney only adds to the balance — a different response to the same event than Idle gave.',
  },
  {
    lines: [17, 18, 19, 20],
    panels: [machine("select('A1')", 'Idle', '0¢', 'Dispensing A1 · change 25¢', 'ok')],
    note: 'Now it dispenses with 25¢ change, zeroes the balance and moves back to Idle — or to SoldOut if that was the last item. Adding a Maintenance state later is one new class, not an edit to every method.',
  },
]

export function StateMachineVisualizer() {
  return <CodeTrace code={STATE_CODE} steps={stateSteps} interval={3000} />
}

// ── Observer ───────────────────────────────────────────────────────────────

const subs = (...lines: string[]) => ({ title: 'BookItem observers', lines })

const observerSteps: SequenceStep[] = [
  {
    panel: subs('HoldQueue', 'SearchIndex'),
    note: 'At startup, two services subscribe to the BookItem\'s "returned" event. BookItem stores them as a list of Observer interfaces — it doesn\'t import either class.',
  },
  {
    message: { from: 0, to: 0, label: 'copy #2 of "Dune" returned' },
    panel: subs('HoldQueue', 'SearchIndex'),
    note: 'A member returns a copy. BookItem updates its own state, then tells everyone on its list. It doesn\'t know or care who is listening.',
  },
  {
    message: { from: 0, to: 1, label: 'onReturned(copy #2)' },
    panel: subs('HoldQueue', 'SearchIndex'),
    note: 'The hold queue hears about it. Asha reserved "Dune" last week and is first in line.',
  },
  {
    message: { from: 1, to: 2, label: 'held(copy #2, Asha)', tone: 'ok' },
    panel: subs('HoldQueue', 'SearchIndex'),
    note: 'HoldQueue puts the copy on the hold shelf and publishes its own event. The Mailer listens to HoldQueue, not to BookItem — events can chain without anyone knowing the whole graph.',
  },
  {
    message: { from: 0, to: 3, label: 'onReturned(copy #2)' },
    panel: subs('HoldQueue', 'SearchIndex'),
    note: 'SearchIndex hears the same event and updates availability: "Dune — on hold". Each observer reacts in its own way.',
  },
  {
    message: { from: 0, to: 0, label: 'subscribe(FinesService)', tone: 'ok' },
    panel: subs('HoldQueue', 'SearchIndex', 'FinesService  ← new'),
    note: 'Late-return fines arrive as a new requirement. FinesService subscribes too — BookItem\'s code doesn\'t change. That decoupling is the whole point of Observer.',
  },
]

export function ObserverVisualizer() {
  return <SequenceDiagram actors={['BookItem', 'HoldQueue', 'Mailer', 'SearchIndex']} steps={observerSteps} interval={2800} />
}

// ── Composition over inheritance ───────────────────────────────────────────

const COMPOSE_CODE = [
  '// inheritance: one subclass per combination',
  'class EmailNotifier extends Notifier {}',
  'class SmsNotifier extends Notifier {}',
  'class RetryingEmailNotifier extends EmailNotifier {}',
  'class RetryingSmsNotifier extends SmsNotifier {}',
  'class LoggedRetryingEmailNotifier extends RetryingEmailNotifier {}',
  '// …and so on',
  '',
  '// composition: small parts, combined at runtime',
  'interface Channel { send(msg: string): Promise<void> }',
  'class Email implements Channel { /* … */ }',
  'class Sms implements Channel { /* … */ }',
  'const withRetry = (c: Channel): Channel => ({ /* … */ })',
  'const withLogging = (c: Channel): Channel => ({ /* … */ })',
  '',
  'const notifier = withLogging(withRetry(new Email()))',
]

const counts = (channels: number, features: number, tone: 'ok' | 'warn' | 'bad') =>
  panel('classes to write', [
    ['channels × features', `${channels} × ${features}`],
    ['inheritance', `${channels} × 2^${features} = ${channels * 2 ** features}`, tone],
    ['composition', `${channels} + ${features} = ${channels + features}`, 'ok'],
  ])

const composeSteps: TraceStep[] = [
  {
    lines: [1, 2],
    panels: [counts(2, 0, 'ok')],
    note: 'Two ways to notify a user: email and SMS. Two subclasses of Notifier — inheritance looks perfectly reasonable here.',
  },
  {
    lines: [3, 4],
    panels: [counts(2, 1, 'warn')],
    note: 'Now some notifications must retry on failure. Retry is a behaviour, not a kind of channel, but with inheritance the only place to put it is another layer of subclasses.',
  },
  {
    lines: [5, 6],
    panels: [counts(2, 2, 'bad')],
    note: 'Add logging and every combination needs its own class: logged, retrying, both, neither — for each channel. The count doubles with each feature.',
  },
  {
    lines: [9, 10, 11, 12, 13],
    panels: [counts(2, 2, 'bad')],
    note: 'Composition splits the two axes. Channels implement one small interface; features are wrappers that take a Channel and return a Channel.',
  },
  {
    lines: [15],
    panels: [counts(3, 2, 'bad')],
    note: 'Any combination is one line, chosen at runtime. Adding a Push channel is one class — inheritance would need 12. Keep inheritance for true "is-a" relationships whose subtypes share an invariant.',
  },
]

export function CompositionVisualizer() {
  return <CodeTrace code={COMPOSE_CODE} steps={composeSteps} interval={3000} />
}

// ── Sagas ──────────────────────────────────────────────────────────────────

const sagaLog = (...lines: string[]) => ({ title: 'saga log (orchestrator)', lines })

const sagaSteps: SequenceStep[] = [
  {
    panel: sagaLog('order #812 · started'),
    note: 'Placing an order touches three services, each with its own database. There is no transaction that spans them, so the orchestrator runs a saga: a sequence of local transactions, each with a compensating action.',
  },
  {
    message: { from: 0, to: 1, label: 'createOrder → PENDING', tone: 'ok' },
    panel: sagaLog('order #812 · started', '1 orders.create      ✓'),
    note: 'Step 1 commits locally in the orders database. The order is PENDING — visible, but not final.',
  },
  {
    message: { from: 0, to: 2, label: 'charge ₹1,250', tone: 'ok' },
    panel: sagaLog('order #812 · started', '1 orders.create      ✓', '2 payments.charge    ✓'),
    note: 'Step 2 charges the card and commits in the payments database. The orchestrator records each completed step durably, so it can resume after a crash.',
  },
  {
    message: { from: 0, to: 3, label: 'reserve 2 × SKU-42' },
    panel: sagaLog('order #812 · started', '1 orders.create      ✓', '2 payments.charge    ✓', '3 inventory.reserve  …'),
    note: 'Step 3 asks inventory to reserve the items.',
  },
  {
    message: { from: 3, to: 0, label: 'out of stock', dashed: true, tone: 'bad' },
    panel: sagaLog('order #812 · started', '1 orders.create      ✓', '2 payments.charge    ✓', '3 inventory.reserve  ✕'),
    note: 'It fails. Steps 1 and 2 have already committed — nothing can roll them back. The saga has to undo them forwards, with new transactions.',
  },
  {
    message: { from: 0, to: 2, label: 'refund ₹1,250 (compensate 2)', tone: 'warn' },
    panel: sagaLog('order #812 · compensating', '2 payments.refund    ✓'),
    note: 'Compensations run in reverse order. The refund is a new transaction, not an erasure: the customer\'s statement shows a charge and a refund.',
  },
  {
    message: { from: 0, to: 1, label: 'cancel order (compensate 1)', tone: 'warn' },
    panel: sagaLog('order #812 · compensated', '1 orders.cancel      ✓', 'final: CANCELLED'),
    note: 'The order ends CANCELLED. The system is consistent again — eventually. Steps and compensations must be idempotent, since the orchestrator retries any it isn\'t sure finished.',
  },
]

export function SagaVisualizer() {
  return <SequenceDiagram actors={['orchestrator', 'orders', 'payments', 'inventory']} steps={sagaSteps} interval={2800} />
}

// ── Back-of-the-envelope estimation ────────────────────────────────────────

const ESTIMATE_CODE = [
  'const newLinksPerMonth = 100e6',
  'const writesPerSec = newLinksPerMonth / (30 * 86_400)',
  'const readsPerSec = writesPerSec * 100',
  'const peakReadsPerSec = readsPerSec * 3',
  'const bytesPerLink = 500',
  'const storage5y = newLinksPerMonth * 12 * 5 * bytesPerLink',
  'const cacheBytes = readsPerSec * 86_400 * 0.2 * bytesPerLink',
  'const keySpace = 62 ** 7',
]

const est = (rows: [string, string, ('ok' | 'warn' | 'bad' | 'muted')?][]) => panel('estimate', rows)

const estimateSteps: TraceStep[] = [
  {
    lines: [0, 1],
    panels: [est([['month', '30 × 86,400 s ≈ 2.6M s'], ['writes/s', '100M ÷ 2.6M ≈ 40']])],
    note: 'A URL shortener gets 100 million new links a month. A month is about 2.6 million seconds, so that is roughly 40 writes a second. Round freely — the goal is the order of magnitude.',
  },
  {
    lines: [2, 3],
    panels: [est([['reads/s', '≈ 4,000'], ['peak reads/s', '≈ 12,000', 'warn']])],
    note: 'Links are read far more than created; assume 100 reads per write. Traffic isn\'t flat, so size for a peak of about 3× the average. 12,000 reads a second is one well-cached service, not a fleet.',
  },
  {
    lines: [4, 5],
    panels: [est([['links in 5 years', '6 billion'], ['× 500 B', '≈ 3 TB', 'ok']])],
    note: 'Each record — short key, long URL, owner, timestamps — is about 500 bytes. Five years is 6 billion links: about 3 TB. That fits on one large database server, though you would replicate it.',
  },
  {
    lines: [6],
    panels: [est([['reads/day', '≈ 350M'], ['cache 20%', '≈ 35 GB', 'ok']])],
    note: 'Reads follow a power law: a small share of links get most clicks. Caching 20% of a day\'s reads is about 35 GB — it fits in memory on a single cache node.',
  },
  {
    lines: [7],
    panels: [est([['62^7', '≈ 3.5 trillion'], ['needed', '6 billion', 'ok'], ['key length', '7 characters']])],
    note: 'Base-62 keys (a–z, A–Z, 0–9) of 7 characters give 3.5 trillion combinations — hundreds of times more than needed, so collisions stay rare. Each number shaped a design decision.',
  },
]

export function EstimationVisualizer() {
  return <CodeTrace code={ESTIMATE_CODE} steps={estimateSteps} interval={3200} />
}

// ── Hybrid search with reciprocal rank fusion ──────────────────────────────

const HYBRID_CODE = [
  'function rrf(lists: string[][], k = 60) {',
  '  const score = new Map<string, number>()',
  '  for (const list of lists) {',
  '    list.forEach((id, i) => {',
  '      const rank = i + 1',
  '      score.set(id, (score.get(id) ?? 0) + 1 / (k + rank))',
  '    })',
  '  }',
  '  return [...score].sort((a, b) => b[1] - a[1])',
  '}',
  '',
  'rrf([bm25(query), vectorSearch(query)])',
]

const BM25 = panel('BM25 (keywords)', [
  ['1', 'D3 ECONNRESET error codes'],
  ['2', 'D1 Retrying failed fetch calls'],
  ['3', 'D5 fetch() options reference'],
  ['4', 'D2 Handling flaky networks'],
])
const VECTOR = panel('vectors (meaning)', [
  ['1', 'D2 Handling flaky networks'],
  ['2', 'D1 Retrying failed fetch calls'],
  ['3', 'D4 Timeouts and cancellation'],
  ['4', 'D6 Circuit breakers'],
])

// 1/(60 + rank), summed per document.
const hybridSteps: TraceStep[] = [
  {
    lines: [11],
    panels: [BM25],
    note: 'Query: "fetch ECONNRESET retry". BM25 scores exact terms, so the page that literally contains the rare token ECONNRESET ranks first.',
  },
  {
    lines: [11],
    panels: [VECTOR],
    note: 'Vector search matches meaning. It finds "Handling flaky networks", which never says ECONNRESET, but misses the error-code page — the token means little to an embedding model.',
  },
  {
    lines: [2, 3, 4, 5],
    panels: [
      panel('score = Σ 1 / (60 + rank)', [
        ['D1', '1/62 + 1/62'],
        ['D2', '1/64 + 1/61'],
        ['D3', '1/61'],
      ]),
    ],
    note: 'The two scores are on different scales — BM25 is unbounded, cosine similarity is −1 to 1 — so don\'t add them. Reciprocal rank fusion uses only positions: each list gives a document 1/(k + rank).',
  },
  {
    lines: [8],
    panels: [
      panel('fused ranking', [
        ['1  D1', '0.0323', 'ok'],
        ['2  D2', '0.0320', 'ok'],
        ['3  D3', '0.0164'],
        ['4  D4, D5', '0.0159'],
        ['6  D6', '0.0156'],
      ]),
    ],
    note: 'D1 ranks high in both lists, so it wins. D2 and D3 each led one list and both stay near the top. k = 60 flattens the curve, so being decent in both lists beats being first in one.',
  },
]

export function HybridSearchVisualizer() {
  return <CodeTrace code={HYBRID_CODE} steps={hybridSteps} interval={3200} />
}
