export type PracticeLink = {
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  url: string
  source: 'LeetCode' | 'GFG'
}

export type Pattern = {
  slug: string
  name: string
  description: string
  spotIt: string
  practice: PracticeLink[]
}

export const patterns: Pattern[] = [
  {
    slug: 'two-pointers',
    name: 'Two Pointers',
    description:
      'Walk two indexes toward each other (or in the same direction) instead of checking every pair — turns many O(n²) array problems into O(n).',
    spotIt:
      'Sorted array or string, and the question asks about pairs, triplets, or removing/comparing elements from both ends.',
    practice: [
      {
        title: 'Container With Most Water',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/container-with-most-water/',
        source: 'LeetCode',
      },
      {
        title: 'Remove Duplicates from Sorted Array',
        difficulty: 'Easy',
        url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/',
        source: 'LeetCode',
      },
      {
        title: 'Valid Palindrome',
        difficulty: 'Easy',
        url: 'https://leetcode.com/problems/valid-palindrome/',
        source: 'LeetCode',
      },
      {
        title: 'Trapping Rain Water',
        difficulty: 'Hard',
        url: 'https://leetcode.com/problems/trapping-rain-water/',
        source: 'LeetCode',
      },
    ],
  },
  {
    slug: 'sliding-window',
    name: 'Sliding Window',
    description:
      'Maintain a window over a contiguous run of elements and slide it forward, updating state incrementally instead of recomputing from scratch.',
    spotIt:
      'The words “subarray”, “substring”, or “contiguous” appear, and you need a longest / shortest / max-sum window that satisfies a condition.',
    practice: [
      {
        title: 'Minimum Size Subarray Sum',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/minimum-size-subarray-sum/',
        source: 'LeetCode',
      },
      {
        title: 'Longest Repeating Character Replacement',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/longest-repeating-character-replacement/',
        source: 'LeetCode',
      },
      {
        title: 'Permutation in String',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/permutation-in-string/',
        source: 'LeetCode',
      },
      {
        title: 'Minimum Window Substring',
        difficulty: 'Hard',
        url: 'https://leetcode.com/problems/minimum-window-substring/',
        source: 'LeetCode',
      },
    ],
  },
  {
    slug: 'fast-slow-pointers',
    name: 'Fast & Slow Pointers',
    description:
      'Two pointers moving at different speeds through a sequence — if there is a cycle they must eventually meet, and when the fast one finishes, the slow one is at the middle.',
    spotIt:
      'Linked list problems about cycles or middles, or any process that repeatedly feeds a value back into itself.',
    practice: [
      {
        title: 'Middle of the Linked List',
        difficulty: 'Easy',
        url: 'https://leetcode.com/problems/middle-of-the-linked-list/',
        source: 'LeetCode',
      },
      {
        title: 'Linked List Cycle II',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/linked-list-cycle-ii/',
        source: 'LeetCode',
      },
      {
        title: 'Palindrome Linked List',
        difficulty: 'Easy',
        url: 'https://leetcode.com/problems/palindrome-linked-list/',
        source: 'LeetCode',
      },
      {
        title: 'Reorder List',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/reorder-list/',
        source: 'LeetCode',
      },
    ],
  },
  {
    slug: 'merge-intervals',
    name: 'Merge Intervals',
    description:
      'Sort intervals by start time, then sweep left to right deciding whether each interval overlaps the previous one — merge, count, or discard as you go.',
    spotIt:
      'Input is a list of ranges (meetings, bookings, [start, end] pairs) and the question is about overlap, merging, or how many fit.',
    practice: [
      {
        title: 'Insert Interval',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/insert-interval/',
        source: 'LeetCode',
      },
      {
        title: 'Meeting Rooms (GFG)',
        difficulty: 'Easy',
        url: 'https://www.geeksforgeeks.org/dsa/check-if-any-two-intervals-overlap-among-a-given-set-of-intervals/',
        source: 'GFG',
      },
      {
        title: 'Minimum Number of Arrows to Burst Balloons',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/',
        source: 'LeetCode',
      },
    ],
  },
  {
    slug: 'binary-search',
    name: 'Binary Search',
    description:
      'Halve the search space every step. Works on sorted arrays — and, more powerfully, on any monotonic “answer space” where you can ask: is this guess feasible?',
    spotIt:
      'Sorted input, O(log n) required, or a “minimum X such that condition holds” question where the condition flips from false to true exactly once.',
    practice: [
      {
        title: 'Search in Rotated Sorted Array',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
        source: 'LeetCode',
      },
      {
        title: 'Find First and Last Position of Element',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/',
        source: 'LeetCode',
      },
      {
        title: 'Find Minimum in Rotated Sorted Array',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/',
        source: 'LeetCode',
      },
      {
        title: 'Capacity to Ship Packages Within D Days',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/',
        source: 'LeetCode',
      },
    ],
  },
  {
    slug: 'stack',
    name: 'Stack & Monotonic Stack',
    description:
      'Last-in-first-out matching for nested structure, and the monotonic variant: keep the stack sorted so each element instantly finds its “next greater / smaller” partner.',
    spotIt:
      'Matching brackets, undo-like nesting, or “next greater element” / “how long until a warmer day” style questions.',
    practice: [
      {
        title: 'Min Stack',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/min-stack/',
        source: 'LeetCode',
      },
      {
        title: 'Evaluate Reverse Polish Notation',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/',
        source: 'LeetCode',
      },
      {
        title: 'Next Greater Element (GFG)',
        difficulty: 'Medium',
        url: 'https://www.geeksforgeeks.org/dsa/next-greater-element/',
        source: 'GFG',
      },
      {
        title: 'Largest Rectangle in Histogram',
        difficulty: 'Hard',
        url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/',
        source: 'LeetCode',
      },
    ],
  },
  {
    slug: 'heap-top-k',
    name: 'Heap / Top-K',
    description:
      'A heap always knows its smallest (or largest) element in O(1). Keep a heap of size k while streaming through data to answer “top k” questions without full sorting.',
    spotIt:
      'The words “k largest”, “k closest”, “k most frequent”, or a stream where you repeatedly need the current min/max.',
    practice: [
      {
        title: 'Last Stone Weight',
        difficulty: 'Easy',
        url: 'https://leetcode.com/problems/last-stone-weight/',
        source: 'LeetCode',
      },
      {
        title: 'K Closest Points to Origin',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/k-closest-points-to-origin/',
        source: 'LeetCode',
      },
      {
        title: 'Kth Smallest Element in a BST',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/',
        source: 'LeetCode',
      },
      {
        title: 'Find Median from Data Stream',
        difficulty: 'Hard',
        url: 'https://leetcode.com/problems/find-median-from-data-stream/',
        source: 'LeetCode',
      },
    ],
  },
  {
    slug: 'tree-bfs-dfs',
    name: 'Tree BFS / DFS',
    description:
      'Depth-first recursion for structure questions (depth, validity, paths); breadth-first with a queue for anything organized by levels.',
    spotIt:
      'Binary tree input. “Level by level” means BFS; “depth”, “path”, or “is it valid” usually means DFS.',
    practice: [
      {
        title: 'Maximum Depth of Binary Tree',
        difficulty: 'Easy',
        url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
        source: 'LeetCode',
      },
      {
        title: 'Invert Binary Tree',
        difficulty: 'Easy',
        url: 'https://leetcode.com/problems/invert-binary-tree/',
        source: 'LeetCode',
      },
      {
        title: 'Diameter of Binary Tree',
        difficulty: 'Easy',
        url: 'https://leetcode.com/problems/diameter-of-binary-tree/',
        source: 'LeetCode',
      },
      {
        title: 'Binary Tree Right Side View',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/binary-tree-right-side-view/',
        source: 'LeetCode',
      },
    ],
  },
  {
    slug: 'graphs',
    name: 'Graph Traversal',
    description:
      'BFS/DFS over grids and adjacency lists: flood-fill connected regions, count components, and use topological ordering when tasks have prerequisites.',
    spotIt:
      'A grid of cells, a list of edges, or dependency pairs (“course a requires course b”). Count regions, check reachability, or order tasks.',
    practice: [
      {
        title: 'Flood Fill',
        difficulty: 'Easy',
        url: 'https://leetcode.com/problems/flood-fill/',
        source: 'LeetCode',
      },
      {
        title: 'Rotting Oranges',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/rotting-oranges/',
        source: 'LeetCode',
      },
      {
        title: 'Clone Graph',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/clone-graph/',
        source: 'LeetCode',
      },
      {
        title: 'Pacific Atlantic Water Flow',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/pacific-atlantic-water-flow/',
        source: 'LeetCode',
      },
    ],
  },
  {
    slug: 'backtracking',
    name: 'Backtracking',
    description:
      'Build a candidate solution one choice at a time; when a choice can no longer lead to a valid answer, undo it and try the next one. The shape behind subsets, permutations, and puzzles.',
    spotIt:
      '“All possible …” — combinations, permutations, subsets, board placements — where you must enumerate rather than count.',
    practice: [
      {
        title: 'Permutations',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/permutations/',
        source: 'LeetCode',
      },
      {
        title: 'Word Search',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/word-search/',
        source: 'LeetCode',
      },
      {
        title: 'Palindrome Partitioning',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/palindrome-partitioning/',
        source: 'LeetCode',
      },
      {
        title: 'N-Queens',
        difficulty: 'Hard',
        url: 'https://leetcode.com/problems/n-queens/',
        source: 'LeetCode',
      },
    ],
  },
  {
    slug: 'dynamic-programming',
    name: 'Dynamic Programming',
    description:
      'When a problem breaks into overlapping subproblems, solve each subproblem once and reuse the answer — top-down with memoization or bottom-up with a table.',
    spotIt:
      '“How many ways…”, “minimum cost to…”, “longest/shortest …” where today’s answer is built from smaller versions of the same question.',
    practice: [
      {
        title: 'House Robber',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/house-robber/',
        source: 'LeetCode',
      },
      {
        title: 'Longest Increasing Subsequence',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/longest-increasing-subsequence/',
        source: 'LeetCode',
      },
      {
        title: 'Longest Common Subsequence',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/longest-common-subsequence/',
        source: 'LeetCode',
      },
      {
        title: 'Word Break',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/word-break/',
        source: 'LeetCode',
      },
    ],
  },
  {
    slug: 'math',
    name: 'Math & Number Theory',
    description:
      'A small toolbox — Euclid’s GCD, the sieve of Eratosthenes, fast exponentiation, counting prime factors — that solves a surprising number of interview questions outright.',
    spotIt:
      'Primes, divisibility, powers, factorials, digit manipulation — anywhere brute-force arithmetic would overflow or time out.',
    practice: [
      {
        title: 'Palindrome Number',
        difficulty: 'Easy',
        url: 'https://leetcode.com/problems/palindrome-number/',
        source: 'LeetCode',
      },
      {
        title: 'Sqrt(x)',
        difficulty: 'Easy',
        url: 'https://leetcode.com/problems/sqrtx/',
        source: 'LeetCode',
      },
      {
        title: 'Happy Number',
        difficulty: 'Easy',
        url: 'https://leetcode.com/problems/happy-number/',
        source: 'LeetCode',
      },
      {
        title: 'Program for LCM of two numbers (GFG)',
        difficulty: 'Easy',
        url: 'https://www.geeksforgeeks.org/dsa/program-to-find-lcm-of-two-numbers/',
        source: 'GFG',
      },
    ],
  },
]
