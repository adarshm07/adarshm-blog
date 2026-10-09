/**
 * Low-level design (object-oriented design) interview problems for the LLD
 * practice tool. Each one lists the requirements to design for, hints to
 * unblock without giving the answer away, and what reviewers expect to see —
 * the last is shown after a review, and sent to Claude as grading context.
 */
export type LldProblem = {
  slug: string
  title: string
  prompt: string
  requirements: string[]
  hints: string[]
  wouldExpect: string[]
}

export const LLD_PROBLEMS: LldProblem[] = [
  {
    slug: 'parking-lot',
    title: 'Parking lot',
    prompt:
      'Design the object model for a multi-level parking lot that issues tickets at the entrance and charges at the exit.',
    requirements: [
      'Several levels, each with spots of different sizes: motorcycle, compact, large',
      'Vehicles: motorcycle, car, truck — each fits only certain spot sizes',
      'Issue a ticket on entry; compute the fee on exit from the time parked',
      'Show free spots per level and type',
      'Pricing rules should be easy to change (hourly, flat weekend rate…)',
    ],
    hints: [
      'Who decides whether a vehicle fits a spot — the vehicle, the spot, or something else?',
      'How would you add electric-charging spots without editing every class?',
      'What happens when two cars arrive at the same free spot at the same moment?',
    ],
    wouldExpect: [
      'ParkingLot → Level → ParkingSpot composition; Vehicle hierarchy or a type enum',
      'A spot-allocation strategy separated from the lot (Strategy pattern)',
      'Ticket with entry time and spot; fee computed by a pluggable PricingPolicy',
      'Concurrency: assigning a spot must be atomic',
      'Reasoning about extension: new vehicle or spot types without editing everything',
    ],
  },
  {
    slug: 'elevator',
    title: 'Elevator system',
    prompt: 'Design the classes for a building with several elevators serving many floors.',
    requirements: [
      'N elevators, M floors; hall buttons (up/down) on each floor, floor buttons inside each car',
      'A dispatcher assigns hall requests to elevators',
      'Each elevator moves, stops, opens and closes doors, and tracks its direction',
      'Support maintenance mode and an emergency stop',
      'The dispatch algorithm should be replaceable',
    ],
    hints: [
      'What state does an elevator have, and which transitions are allowed between them?',
      'Where do pending stops live, and in what order are they served?',
      'Which object knows about all elevators, and which only about itself?',
    ],
    wouldExpect: [
      'Elevator with an explicit state machine (idle, moving up/down, doors open, maintenance)',
      'Separate request types: hall request (floor + direction) vs car request (floor)',
      'Dispatcher with a pluggable strategy (nearest car, SCAN/LOOK)',
      'Stops kept in ordered sets per direction',
      'Clear ownership: dispatcher coordinates, elevators execute',
    ],
  },
  {
    slug: 'lru-cache',
    title: 'LRU cache',
    prompt: 'Design a generic in-memory key-value cache with a fixed capacity that evicts the least recently used entry.',
    requirements: [
      'get(key) and put(key, value) in O(1)',
      'Evict the least recently used entry when full',
      'Generic over key and value types',
      'Optional: per-entry TTL, and eviction listeners',
      'Optional: safe to use from several threads',
    ],
    hints: [
      'Which structure gives O(1) lookup, and which gives O(1) "move to front"?',
      'How would you swap LRU for LFU without rewriting the cache?',
    ],
    wouldExpect: [
      'Hash map from key to node + doubly linked list ordered by recency',
      'Eviction policy behind an interface (LRU, LFU, FIFO)',
      'Generic types; clear handling of updates to existing keys',
      'A thread-safety approach (single lock, or striped locks) and its trade-off',
      'TTL handled lazily on read or by a background sweep, with reasoning',
    ],
  },
  {
    slug: 'vending-machine',
    title: 'Vending machine',
    prompt: 'Design the software for a vending machine that sells items, accepts coins and notes, and gives change.',
    requirements: [
      'Products in slots, each with a price and stock count',
      'Accept coins and notes; track the inserted amount',
      'Dispense the product and correct change, or refund on cancel',
      'Handle sold-out items and not being able to make change',
      'An admin can restock products and collect cash',
    ],
    hints: [
      'The machine behaves differently before payment, during payment and while dispensing — how do you model that?',
      'How do you decide which coins to return as change?',
    ],
    wouldExpect: [
      'State pattern: Idle → HasMoney → Dispensing (and SoldOut / Maintenance)',
      'Inventory separate from the payment / cash-box logic',
      'Change-making algorithm and the "cannot make change" path',
      'Money modelled as integer minor units, not floats',
      'Clear separation between customer and admin operations',
    ],
  },
  {
    slug: 'library-management',
    title: 'Library management',
    prompt: 'Design a library system where members search for, borrow, return and reserve books.',
    requirements: [
      'Books (title, author, ISBN) and individual copies on shelves',
      'Members borrow up to a limit, for a fixed period',
      'Late returns incur a fine',
      'Members can reserve a book when every copy is out, and are notified when one is returned',
      'Search by title, author or subject',
    ],
    hints: [
      'Is a "book" one object, or are there two different concepts hiding in that word?',
      'Who gets notified when a copy comes back, and how is that decoupled?',
    ],
    wouldExpect: [
      'Book (the title) vs BookItem (a physical copy) distinction',
      'Loan / BorrowRecord with due date; fine calculation behind a policy',
      'Reservation queue per book; Observer-style notification',
      'Member account with limits; librarian vs member roles',
      'Search kept separate from the catalogue model',
    ],
  },
  {
    slug: 'rate-limiter',
    title: 'Rate limiter',
    prompt: 'Design a rate-limiter library that application code calls before handling each request.',
    requirements: [
      'Limit requests per client key (user ID, API key, IP)',
      'Support several algorithms: fixed window, sliding window, token bucket',
      'Different rules per endpoint or per plan',
      'Thread-safe; fast enough to call on every request',
      'Return remaining quota and a retry-after time',
    ],
    hints: [
      'What does the caller need to know besides allow / deny?',
      'Where does the counting state live, and could it move to Redis later?',
    ],
    wouldExpect: [
      'A RateLimiter interface with interchangeable algorithm implementations (Strategy)',
      'Rule configuration separate from the algorithms (key → limit, window)',
      'A storage abstraction (in-memory now, distributed later)',
      'A Decision result object: allowed, remaining, retryAfter',
      'Concurrency handled per key',
    ],
  },
  {
    slug: 'splitwise',
    title: 'Expense sharing (Splitwise)',
    prompt: 'Design an app where friends record shared expenses and see who owes whom.',
    requirements: [
      'Users and groups; anyone can add an expense paid by one person',
      'Split equally, by exact amounts, or by percentages',
      'Show each user\'s balances, per person and overall',
      'Simplify debts so the group settles with fewer payments',
      'Record settlements (payments between users)',
    ],
    hints: [
      'Each split type validates differently — where does that logic belong?',
      'Do you store balances, or compute them from expenses?',
    ],
    wouldExpect: [
      'Expense with payer and a list of Splits; split types as subclasses or strategies',
      'Validation per split type (exact amounts sum to total, percentages to 100)',
      'A balance sheet or ledger kept consistent on each expense and settlement',
      'Debt simplification as a separate service',
      'Money as integer minor units, with rounding handled explicitly',
    ],
  },
  {
    slug: 'movie-ticket-booking',
    title: 'Movie ticket booking',
    prompt: 'Design the booking system for a cinema chain: browse shows, pick seats, pay, get tickets.',
    requirements: [
      'Cinemas with screens; movies scheduled as shows on a screen at a time',
      'A seat map per show; seats have categories and prices',
      'Users select seats, which are held briefly while they pay',
      'Two users must never book the same seat',
      'Payment, booking confirmation and cancellation',
    ],
    hints: [
      'What happens to held seats if payment never completes?',
      'Is a seat\'s status a property of the seat, or of the seat in a particular show?',
    ],
    wouldExpect: [
      'Cinema → Screen → Seat; Show links Movie, Screen and time',
      'ShowSeat (seat status per show) separate from the physical Seat',
      'Temporary seat holds with expiry, and locking / optimistic concurrency',
      'Booking lifecycle as states: pending → confirmed / cancelled / expired',
      'Payment behind an interface; pricing by seat category',
    ],
  },
]

export const LLD_RUBRIC = [
  { key: 'requirements', label: 'Requirements coverage', looksLike: 'every stated requirement is handled; scope and assumptions are explicit' },
  { key: 'responsibilities', label: 'Classes & responsibilities', looksLike: 'well-named classes, each with one clear job; no god objects' },
  { key: 'relationships', label: 'Relationships', looksLike: 'correct use of inheritance vs composition vs association; ownership is clear' },
  { key: 'extensibility', label: 'Extensibility & patterns', looksLike: 'change points behind interfaces; patterns used where they earn their place, not for show' },
  { key: 'interfaces', label: 'Method & API design', looksLike: 'clear method signatures and return types; invalid states hard to represent' },
  { key: 'edge-cases', label: 'Edge cases & concurrency', looksLike: 'failure paths, invalid input, and races identified and handled' },
] as const
