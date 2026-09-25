export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export type CurriculumEntry = {
  slug?: string
  title?: string // used for coming-soon entries with no post yet
  difficulty: Difficulty
  note: string
}

export type CurriculumPhase = {
  title: string
  description: string
  entries: CurriculumEntry[]
}

export const curriculum: CurriculumPhase[] = [
  {
    title: 'Foundations',
    description:
      'How to reason about running time, recursion, and the two search/sort ideas everything else builds on.',
    entries: [
      {
        slug: 'recursion-and-the-call-stack',
        difficulty: 'Beginner',
        note: 'Start here — the call stack model explains how every recursive algorithm in later phases actually runs.',
      },
      {
        slug: 'sorting-algorithms-explained',
        difficulty: 'Beginner',
        note: 'Bubble, insertion, and merge sort as a first tour of comparing algorithms by their complexity.',
      },
      {
        slug: 'binary-search-and-bst',
        difficulty: 'Beginner',
        note: 'The halve-the-problem idea, first over arrays and then as a tree structure.',
      },
      {
        slug: 'bit-manipulation-fundamentals',
        difficulty: 'Beginner',
        note: 'AND, OR, XOR, and shifts — a small toolbox that keeps reappearing in hashing and optimization tricks.',
      },
    ],
  },
  {
    title: 'Core data structures',
    description:
      'The structures behind almost every practical program — and most interview questions.',
    entries: [
      {
        slug: 'linked-lists-and-cycle-detection',
        difficulty: 'Beginner',
        note: 'Pointer manipulation basics plus the classic fast/slow-pointer cycle trick.',
      },
      {
        slug: 'hash-maps-under-the-hood',
        difficulty: 'Intermediate',
        note: 'What actually makes lookups O(1): hashing, buckets, collisions, and resizing.',
      },
      {
        slug: 'heaps-and-priority-queues',
        difficulty: 'Intermediate',
        note: 'The array-backed tree that always knows its minimum — the engine behind schedulers and top-K problems.',
      },
      {
        slug: 'tries-prefix-trees',
        difficulty: 'Intermediate',
        note: 'A tree keyed by characters instead of comparisons; the structure behind autocomplete.',
      },
    ],
  },
  {
    title: 'Algorithmic patterns',
    description:
      'Reusable solution shapes — recognizing the pattern is most of the work in solving a new problem.',
    entries: [
      {
        slug: 'two-pointers-and-sliding-window',
        difficulty: 'Intermediate',
        note: 'The pattern that turns a whole family of O(n²) array and string problems into O(n).',
      },
      {
        slug: 'prefix-sums-and-difference-arrays',
        difficulty: 'Intermediate',
        note: 'Precompute once, answer range queries with a subtraction — the cheapest big win in array problems.',
      },
      {
        slug: 'binary-search-on-the-answer',
        difficulty: 'Intermediate',
        note: 'Binary search without a sorted array: search the range of possible answers, using a yes/no check that flips exactly once.',
      },
      {
        slug: 'monotonic-stack',
        difficulty: 'Intermediate',
        note: 'A stack that stays ordered, and the four "nearest greater/smaller element" questions it answers in O(n).',
      },
      {
        slug: 'quick-sort-and-heap-sort',
        difficulty: 'Intermediate',
        note: 'Divide-and-conquer and heap ideas applied back to sorting — partitioning shows up far beyond sort itself.',
      },
      {
        slug: 'graph-traversal-bfs-dfs',
        difficulty: 'Intermediate',
        note: 'BFS and DFS are the entry point to every graph problem: reachability, shortest paths, cycles.',
      },
      {
        slug: 'longest-increasing-subsequence',
        difficulty: 'Advanced',
        note: 'The same problem solved twice — an O(n²) dynamic program, then the O(n log n) version built on a binary search.',
      },
      {
        slug: 'dynamic-programming-intro',
        difficulty: 'Advanced',
        note: 'Overlapping subproblems, memoization, and tabulation — the pattern people find hardest, made mechanical.',
      },
    ],
  },
  {
    title: 'Putting it together',
    description:
      'Problems that combine several structures at once — the shape real systems (and hard interviews) take.',
    entries: [
      {
        slug: 'lru-cache-from-scratch',
        difficulty: 'Advanced',
        note: 'A hash map and a doubly linked list working together for O(1) everything — a capstone for phases 1–3.',
      },
      {
        slug: 'backtracking-explained',
        difficulty: 'Advanced',
        note: 'Systematic search over choice trees: permutations, subsets, and constraint problems.',
      },
      {
        slug: 'union-find-disjoint-set',
        difficulty: 'Advanced',
        note: 'Near-constant-time connectivity queries, and the trick behind Kruskal’s algorithm.',
      },
      {
        slug: 'fenwick-tree-binary-indexed-tree',
        difficulty: 'Advanced',
        note: 'Prefix sums that survive updates — the same range queries in O(log n), built out of one bit trick.',
      },
      {
        slug: 'minimum-spanning-trees',
        difficulty: 'Advanced',
        note: 'Kruskal and Prim: union-find and priority queues applied to the cheapest way to connect everything.',
      },
      {
        slug: 'dijkstra-shortest-paths',
        difficulty: 'Advanced',
        note: 'Weighted graphs — where BFS stops working and priority queues take over.',
      },
      {
        slug: 'a-star-pathfinding',
        difficulty: 'Advanced',
        note: 'Dijkstra plus a heuristic: the same loop, guided toward the goal, and the conditions that keep it optimal.',
      },
    ],
  },
]
