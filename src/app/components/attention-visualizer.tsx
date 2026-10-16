'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const TOKENS = ['the', 'cat', 'sat', 'because', 'it']

// Toy 2-dimensional vectors. Real models use hundreds of dimensions per head,
// but the arithmetic is identical. All numbers below are computed from these.
const K: Record<string, [number, number]> = {
  the: [0.1, 0.2],
  cat: [1.2, 0.9],
  sat: [0.3, -0.4],
  because: [-0.2, 0.3],
  it: [0.8, 0.4],
}
const V: Record<string, [number, number]> = {
  the: [0.0, 0.1],
  cat: [1.0, 0.0],
  sat: [0.2, 0.8],
  because: [0.1, 0.3],
  it: [0.6, 0.2],
}
const Q_IT: [number, number] = [1.0, 0.5]

const SCORES = [0.2, 1.65, 0.1, -0.05, 1.0] // q_it · k_j
const SCALED = [0.14, 1.17, 0.07, -0.04, 0.71] // ÷ √2
const WEIGHTS = [0.14, 0.38, 0.13, 0.11, 0.24] // softmax
const OUTPUT: [number, number] = [0.56, 0.2]

// Every row, with a causal mask: each token attends only to itself and earlier tokens.
const MATRIX = [
  [1],
  [0.37, 0.63],
  [0.25, 0.45, 0.3],
  [0.23, 0.34, 0.18, 0.24],
  [0.14, 0.38, 0.13, 0.11, 0.24],
]

type Mode = 'vectors' | 'scores' | 'scaled' | 'weights' | 'output' | 'matrix'
const steps: { mode: Mode; note: string }[] = [
  {
    mode: 'vectors',
    note: 'Each token has three vectors, made by multiplying its embedding by three learned matrices: a query (what am I looking for?), a key (what do I contain?) and a value (what do I pass on?). We\'ll compute attention for "it".',
  },
  {
    mode: 'scores',
    note: 'Score every earlier token by the dot product of "it"\'s query with that token\'s key. A large dot product means the vectors point the same way. "cat" scores highest: 1.0 × 1.2 + 0.5 × 0.9 = 1.65.',
  },
  {
    mode: 'scaled',
    note: 'Divide by √d, the square root of the vector length (√2 here, often √128 in real models). Without it, dot products grow with dimension and the softmax becomes nearly one-hot.',
  },
  {
    mode: 'weights',
    note: 'Softmax turns the scores into weights that are positive and add up to 1. "it" puts 38% of its attention on "cat" — the model has learned that pronouns look for the nouns they refer to.',
  },
  {
    mode: 'output',
    note: 'The output is the weighted average of the value vectors: 0.14·v(the) + 0.38·v(cat) + … = [0.56, 0.20]. "it" now carries information about the cat. This mix becomes the input to the next layer.',
  },
  {
    mode: 'matrix',
    note: 'Every token does this at once — one matrix multiplication for all queries and keys. The causal mask hides later tokens, so each row only covers the past. Real models run dozens of these "heads" in parallel, in every layer.',
  },
]

const fmt = (n: number) => (n < 0 ? '−' : '') + Math.abs(n).toFixed(2)

function Bar({ value, max, tone }: { value: number; max: number; tone: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
      <div className={`h-2 rounded-full ${tone}`} style={{ width: `${Math.max(0, (value / max) * 100)}%` }} />
    </div>
  )
}

export function AttentionVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={3200}>
      {(index) => {
        const { mode, note } = steps[index]
        if (mode === 'matrix') {
          return (
            <>
              <div className="mx-auto grid max-w-xs grid-cols-6 gap-0.5 font-mono text-[9.5px]">
                <div />
                {TOKENS.map((t) => (
                  <div key={t} className="truncate text-center text-neutral-400 dark:text-neutral-500">
                    {t}
                  </div>
                ))}
                {MATRIX.map((row, i) => (
                  <div key={i} className="contents">
                    <div className="truncate pr-1 text-right text-neutral-500 dark:text-neutral-400">{TOKENS[i]}</div>
                    {TOKENS.map((_, j) => {
                      const w = row[j]
                      return (
                        <div
                          key={j}
                          className={[
                            'rounded py-1.5 text-center',
                            w === undefined ? 'bg-neutral-50 text-neutral-300 dark:bg-neutral-900 dark:text-neutral-700' : 'text-neutral-900 dark:text-neutral-50',
                          ].join(' ')}
                          style={w === undefined ? undefined : { backgroundColor: `rgba(22, 163, 74, ${0.1 + w * 0.8})` }}
                        >
                          {w === undefined ? '·' : w.toFixed(2)}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
              <p className="mt-1 text-center font-mono text-[9.5px] text-neutral-400 dark:text-neutral-500">
                rows: query token · columns: tokens attended to · · = masked (future)
              </p>
              <StepNote>{note}</StepNote>
            </>
          )
        }
        return (
          <>
            <div className="mb-2 text-center font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
              query for “it” = [{Q_IT.join(', ')}]
            </div>
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1.5 font-mono text-[10.5px]">
              {TOKENS.map((t, j) => {
                const value =
                  mode === 'scores' ? SCORES[j] : mode === 'scaled' ? SCALED[j] : mode === 'weights' || mode === 'output' ? WEIGHTS[j] : null
                return (
                  <div key={t} className="contents">
                    <span className={j === 1 && mode !== 'vectors' ? 'text-green-700 dark:text-green-400' : 'text-neutral-700 dark:text-neutral-200'}>
                      {t}
                    </span>
                    {mode === 'vectors' ? (
                      <span className="text-neutral-500 dark:text-neutral-400">
                        k=[{K[t].join(', ')}] v=[{V[t].join(', ')}]
                      </span>
                    ) : (
                      <Bar
                        value={value ?? 0}
                        max={mode === 'scores' ? 1.65 : mode === 'scaled' ? 1.17 : 0.38}
                        tone={mode === 'weights' || mode === 'output' ? 'bg-green-600 dark:bg-green-500' : 'bg-amber-500'}
                      />
                    )}
                    <span className="text-right tabular-nums text-neutral-800 dark:text-neutral-100">
                      {value === null ? '' : mode === 'weights' || mode === 'output' ? `${Math.round(value * 100)}%` : fmt(value)}
                    </span>
                  </div>
                )
              })}
            </div>
            {mode === 'output' ? (
              <div className="mt-3 text-center font-mono text-[11px] text-green-700 dark:text-green-400">
                output for “it” = [{OUTPUT.map((n) => n.toFixed(2)).join(', ')}]
              </div>
            ) : null}
            <StepNote>{note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
