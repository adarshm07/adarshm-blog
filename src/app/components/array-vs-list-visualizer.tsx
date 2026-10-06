'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Cell = { v: string; tone?: 'hot' | 'moved' | 'new' }
type ListNode = { v: string; addr: string; tone?: 'hot' | 'visited' | 'new' }

type Step = {
  title: string
  array: Cell[]
  arrayCost: string
  list: ListNode[]
  listCost: string
  note: string
}

const A = ['A', 'B', 'C', 'D']
const cells = (hot?: number, moved?: number[], fresh?: number, values = A): Cell[] =>
  values.map((v, i) => ({
    v,
    tone: i === hot ? 'hot' : fresh === i ? 'new' : moved?.includes(i) ? 'moved' : undefined,
  }))

// Node addresses are deliberately out of order: list nodes live wherever
// memory was free when each one was allocated.
const NODES: ListNode[] = [
  { v: 'A', addr: '@340' },
  { v: 'B', addr: '@108' },
  { v: 'C', addr: '@520' },
  { v: 'D', addr: '@216' },
]

const steps: Step[] = [
  {
    title: 'the same four items',
    array: cells(),
    arrayCost: 'one block, side by side',
    list: NODES,
    listCost: 'scattered, linked by pointers',
    note: 'An array stores its items in one continuous block of memory. A linked list stores each item in a separate node, anywhere in memory, and each node points to the next.',
  },
  {
    title: 'read item [3]',
    array: cells(3),
    arrayCost: '1 step · O(1)',
    list: NODES.map((n, i) => ({ ...n, tone: i === 3 ? 'hot' : 'visited' })),
    listCost: '4 steps · O(n)',
    note: 'Array: the position of item 3 is just start + 3 × item size — jump straight there. List: there is no way to know where node 3 lives except to start at the head and follow the pointers.',
  },
  {
    title: 'insert X at the front',
    array: cells(undefined, [1, 2, 3, 4], 0, ['X', 'A', 'B', 'C', 'D']),
    arrayCost: '5 writes · O(n)',
    list: [{ v: 'X', addr: '@612', tone: 'new' }, ...NODES],
    listCost: '1 node + 1 pointer · O(1)',
    note: 'Array: every item must shift one place right to make room (and the block may need to be copied somewhere bigger). List: create a node, point it at the old head. Nothing else moves.',
  },
  {
    title: 'append Y at the end',
    array: cells(undefined, undefined, 4, ['A', 'B', 'C', 'D', 'Y']),
    arrayCost: 'usually 1 write · O(1) amortized',
    list: [...NODES, { v: 'Y', addr: '@704', tone: 'new' }],
    listCost: 'O(1) if you keep a tail pointer',
    note: 'Appending is cheap for both. Arrays keep spare capacity at the end and only occasionally grow (doubling), which averages out to O(1).',
  },
  {
    title: 'loop over everything',
    array: cells(),
    arrayCost: 'O(n) · cache-friendly',
    list: NODES.map((n) => ({ ...n, tone: 'visited' })),
    listCost: 'O(n) · pointer chasing',
    note: 'Both are O(n), but arrays win in practice: the CPU loads neighbouring memory together, so the next item is usually already in cache. List nodes are scattered, so each step can be a slow memory fetch. That is why arrays are the default choice.',
  },
]

const CELL_TONE = {
  hot: 'bg-amber-500 text-white',
  moved: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  new: 'bg-green-600 dark:bg-green-500 text-white',
  visited: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
}

export function ArrayVsListVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={3000}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="mb-2 text-center font-mono text-[11px] text-neutral-700 dark:text-neutral-200">
              {step.title}
            </div>
            <div className="space-y-3 font-mono text-[11px]">
              <div>
                <div className="mb-1 flex justify-between text-[9.5px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  <span>array</span>
                  <span className="normal-case tracking-normal">{step.arrayCost}</span>
                </div>
                <div className="flex">
                  {step.array.map((c, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center">
                      <div
                        className={[
                          'flex h-9 w-full items-center justify-center border border-neutral-200 dark:border-neutral-700 transition-colors duration-300',
                          i === 0 ? 'rounded-l-lg' : '',
                          i === step.array.length - 1 ? 'rounded-r-lg' : '',
                          c.tone ? CELL_TONE[c.tone] : 'text-neutral-700 dark:text-neutral-200',
                        ].join(' ')}
                      >
                        {c.v}
                      </div>
                      <span className="mt-0.5 text-[9px] text-neutral-400 dark:text-neutral-500">[{i}]</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-[9.5px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  <span>linked list</span>
                  <span className="normal-case tracking-normal">{step.listCost}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  {step.list.map((n, i) => (
                    <div key={n.addr} className="flex flex-1 items-center gap-0.5">
                      <div className="flex flex-1 flex-col items-center">
                        <div
                          className={[
                            'flex h-9 w-full items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors duration-300',
                            n.tone ? CELL_TONE[n.tone] : 'text-neutral-700 dark:text-neutral-200',
                          ].join(' ')}
                        >
                          {n.v}
                        </div>
                        <span className="mt-0.5 text-[9px] text-neutral-400 dark:text-neutral-500">{n.addr}</span>
                      </div>
                      <span className="mb-3.5 text-neutral-400 dark:text-neutral-500">
                        {i === step.list.length - 1 ? '∅' : '→'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
