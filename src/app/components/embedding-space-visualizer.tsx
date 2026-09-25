'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Point = { label: string; x: number; y: number; group: 'animal' | 'finance' | 'query' }

// A 2-D stand-in for a space with hundreds of dimensions.
const POINTS: Point[] = [
  { label: 'dog', x: 60, y: 60, group: 'animal' },
  { label: 'puppy', x: 78, y: 48, group: 'animal' },
  { label: 'cat', x: 96, y: 78, group: 'animal' },
  { label: 'kitten', x: 112, y: 62, group: 'animal' },
  { label: 'bank (river)', x: 190, y: 130, group: 'animal' },
  { label: 'loan', x: 236, y: 52, group: 'finance' },
  { label: 'mortgage', x: 252, y: 74, group: 'finance' },
  { label: 'bank (money)', x: 224, y: 92, group: 'finance' },
]

type Step = {
  query?: { label: string; x: number; y: number }
  neighbours?: string[]
  showGroups?: boolean
  highlight?: string[]
  note: string
}

const steps: Step[] = [
  {
    note: 'An embedding turns a piece of text into a list of numbers — a point in a space with hundreds or thousands of dimensions. This is two of them, which is a lie, but a useful one.',
  },
  {
    showGroups: true,
    note: 'The only thing that makes the space useful: texts that mean similar things end up near each other. Nobody defined the axes — the model learned an arrangement where "dog" and "puppy" sit close together.',
  },
  {
    highlight: ['bank (river)', 'bank (money)'],
    showGroups: true,
    note: 'Notice the two "bank"s. Same word, different points, because modern embedding models encode the whole string in context. Word-level vectors could not do this.',
  },
  {
    query: { label: 'query: "small dog"', x: 72, y: 40 },
    showGroups: true,
    note: 'A search query is embedded with the same model into the same space. Retrieval is then a geometry problem: which stored points are closest to this one?',
  },
  {
    query: { label: 'query: "small dog"', x: 72, y: 40 },
    neighbours: ['puppy', 'dog'],
    showGroups: true,
    note: 'Closeness is cosine similarity — the angle between the vectors, ignoring their length. "puppy" wins even though the word never appears in the query. That is the whole appeal: matching by meaning rather than by characters.',
  },
  {
    query: { label: 'query: "error code E-4021"', x: 160, y: 20 },
    neighbours: ['loan'],
    showGroups: true,
    note: 'And the limit. An exact token like an error code, a SKU, or a surname has no meaningful neighbourhood — the nearest point is arbitrary. Embeddings smooth over precisely the detail you needed, which is why keyword search still earns its place alongside them.',
  },
  {
    showGroups: true,
    note: 'Two practical consequences. The model that embeds your documents must be the model that embeds your queries — different models produce incomparable spaces. And changing embedding models means re-embedding the entire corpus, not just new documents.',
  },
]

const GROUP_FILL: Record<Point['group'], string> = {
  animal: 'fill-green-600/70 dark:fill-green-500/70',
  finance: 'fill-neutral-400 dark:fill-neutral-500',
  query: 'fill-amber-500',
}

export function EmbeddingSpaceVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2400}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <svg
              viewBox="0 0 300 160"
              className="w-full"
              role="img"
              aria-label="Words plotted as points in a two-dimensional stand-in for embedding space"
            >
              {step.query &&
                step.neighbours?.map((label) => {
                  const p = POINTS.find((pt) => pt.label === label)!
                  return (
                    <line
                      key={label}
                      x1={step.query!.x}
                      y1={step.query!.y}
                      x2={p.x}
                      y2={p.y}
                      className="stroke-amber-500"
                      strokeWidth={1}
                      strokeDasharray="3 2"
                    />
                  )
                })}

              {POINTS.map((point) => {
                const isNeighbour = step.neighbours?.includes(point.label)
                const isHighlighted = step.highlight?.includes(point.label)
                return (
                  <g key={point.label}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={isNeighbour || isHighlighted ? 5 : 3.5}
                      className={[
                        'transition-all duration-500',
                        isHighlighted
                          ? 'fill-amber-500'
                          : step.showGroups
                            ? GROUP_FILL[point.group]
                            : 'fill-neutral-300 dark:fill-neutral-600',
                      ].join(' ')}
                    />
                    <text
                      x={point.x}
                      y={point.y - 7}
                      textAnchor="middle"
                      className={[
                        'font-mono text-[7px] transition-colors duration-500',
                        isNeighbour || isHighlighted
                          ? 'fill-neutral-900 dark:fill-neutral-50'
                          : 'fill-neutral-400 dark:fill-neutral-500',
                      ].join(' ')}
                    >
                      {point.label}
                    </text>
                  </g>
                )
              })}

              {step.query && (
                <g>
                  <circle
                    cx={step.query.x}
                    cy={step.query.y}
                    r={5}
                    className="fill-amber-500"
                  />
                  <text
                    x={step.query.x}
                    y={step.query.y - 8}
                    textAnchor="middle"
                    className="font-mono text-[7px] fill-amber-600 dark:fill-amber-400"
                  >
                    {step.query.label}
                  </text>
                </g>
              )}
            </svg>
            <p className="text-center font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
              a real embedding has hundreds of dimensions — this is a projection
            </p>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
