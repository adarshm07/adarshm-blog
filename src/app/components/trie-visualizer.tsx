'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type TNode = { id: string; char: string; x: number; y: number; end?: boolean }

const NODES: TNode[] = [
  { id: 'root', char: '•', x: 150, y: 22 },
  { id: 'c', char: 'c', x: 95, y: 78 },
  { id: 'd', char: 'd', x: 235, y: 78 },
  { id: 'ca', char: 'a', x: 95, y: 134 },
  { id: 'do', char: 'o', x: 235, y: 134 },
  { id: 'cat', char: 't', x: 45, y: 190, end: true },
  { id: 'car', char: 'r', x: 135, y: 190 },
  { id: 'dog', char: 'g', x: 235, y: 190, end: true },
  { id: 'card', char: 'd', x: 135, y: 246, end: true },
]

const EDGES: [string, string][] = [
  ['root', 'c'],
  ['root', 'd'],
  ['c', 'ca'],
  ['d', 'do'],
  ['ca', 'cat'],
  ['ca', 'car'],
  ['do', 'dog'],
  ['car', 'card'],
]

const POS = new Map(NODES.map((n) => [n.id, n]))

type Step = {
  path: string[] // matched node ids so far
  current?: string
  found?: boolean
  note: string
}

// Searching for the word "card".
const steps: Step[] = [
  { path: ['root'], current: 'root', note: 'A trie stores words as paths of characters. We search for "card", starting at the root.' },
  { path: ['root', 'c'], current: 'c', note: "Look for a child labelled 'c'. It exists — follow it. The words 'cat', 'car', 'card' all share this edge." },
  { path: ['root', 'c', 'ca'], current: 'ca', note: "Match 'a'. This one node is shared by every word starting 'ca' — that shared prefix is the whole point of a trie." },
  { path: ['root', 'c', 'ca', 'car'], current: 'car', note: "Match 'r'. We are at 'car' — but it is not marked as a word end here in our set, so 'car' alone would be a prefix, not a stored word." },
  { path: ['root', 'c', 'ca', 'car', 'card'], current: 'card', found: true, note: "Match 'd', and this node is a word end. Found 'card' in 4 steps — proportional to the word length, not the number of words stored." },
]

export function TrieVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={1600}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <svg
              viewBox="0 0 300 275"
              className="mx-auto block w-full max-w-xs"
              role="img"
              aria-label="Trie (prefix tree) with a search path highlighted"
            >
              {EDGES.map(([a, b], i) => {
                const pa = POS.get(a)!
                const pb = POS.get(b)!
                const onPath =
                  step.path.includes(a) && step.path.includes(b)
                return (
                  <line
                    key={i}
                    x1={pa.x}
                    y1={pa.y}
                    x2={pb.x}
                    y2={pb.y}
                    className={
                      onPath
                        ? 'stroke-green-500'
                        : 'stroke-neutral-200 dark:stroke-neutral-700'
                    }
                    strokeWidth={onPath ? 2 : 1.5}
                  />
                )
              })}
              {NODES.map((n) => {
                const isCurrent = step.current === n.id
                const onPath = step.path.includes(n.id)
                const isFound = isCurrent && step.found
                return (
                  <g key={n.id}>
                    {n.end && (
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={19}
                        className="fill-none stroke-neutral-300 dark:stroke-neutral-600"
                        strokeWidth={1}
                      />
                    )}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={15}
                      className={
                        isFound
                          ? 'fill-green-600 dark:fill-green-500'
                          : isCurrent
                            ? 'fill-amber-500'
                            : onPath
                              ? 'fill-green-600/70 dark:fill-green-500/70'
                              : 'fill-neutral-100 dark:fill-neutral-800'
                      }
                    />
                    <text
                      x={n.x}
                      y={n.y + 4}
                      textAnchor="middle"
                      className={[
                        'font-mono text-[12px]',
                        isCurrent || onPath || isFound
                          ? 'fill-white'
                          : 'fill-neutral-700 dark:fill-neutral-300',
                      ].join(' ')}
                    >
                      {n.char}
                    </text>
                  </g>
                )
              })}
            </svg>
            <p className="mt-1 text-center font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
              double-ringed nodes mark the end of a stored word
            </p>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
