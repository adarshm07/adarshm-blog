'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

type Chunk = {
  id: string
  text: string
  score?: number
  retrieved?: boolean
  relevant?: boolean // does it actually contain the answer
}

type Step = {
  query: string
  chunks: Chunk[]
  answer?: { text: string; ok: boolean }
  note: string
}

const CHUNKS = [
  { id: 'c1', text: 'Refund policy — customers may return items within 30 days…' },
  { id: 'c2', text: '…for orders over $200, returns require a support approval…' },
  { id: 'c3', text: 'Shipping: standard delivery takes 3–5 business days…' },
  { id: 'c4', text: 'Warranty claims are handled by the manufacturer, not us…' },
  { id: 'c5', text: 'Refunds are issued to the original payment method within…' },
]

function withScores(scores: (number | undefined)[], opts: Partial<Chunk>[] = []) {
  return CHUNKS.map((c, i) => ({ ...c, score: scores[i], ...(opts[i] ?? {}) }))
}

const steps: Step[] = [
  {
    query: 'Can I return a $300 jacket after 3 weeks?',
    chunks: CHUNKS.map((c) => ({ ...c })),
    note: 'RAG has one job: put the right few paragraphs in front of the model. The document is split into chunks ahead of time, and each chunk is embedded into a vector.',
  },
  {
    query: 'Can I return a $300 jacket after 3 weeks?',
    chunks: withScores([0.81, 0.74, 0.32, 0.41, 0.69]),
    note: 'The question is embedded the same way, and every chunk is scored by cosine similarity. These are similarity numbers, not truth values — nothing here knows what the answer is.',
  },
  {
    query: 'Can I return a $300 jacket after 3 weeks?',
    chunks: withScores(
      [0.81, 0.74, 0.32, 0.41, 0.69],
      [{ retrieved: true, relevant: true }, { retrieved: true, relevant: true }, {}, {}, { retrieved: true }]
    ),
    answer: { text: 'Yes — within 30 days, and over $200 needs approval.', ok: true },
    note: 'Top-3 goes into the prompt and the model answers from it. When the answer sits inside one or two chunks, this works well and the citations are real.',
  },
  {
    query: 'How long does a refund take for an approved return?',
    chunks: withScores(
      [0.72, 0.7, 0.3, 0.38, 0.68],
      [{ retrieved: true }, { retrieved: true }, {}, {}, { relevant: true }]
    ),
    answer: { text: 'The policy allows returns within 30 days…', ok: false },
    note: 'Now the failure mode. The answer lives in c5, but two chunks about the return *policy* score higher because they share more wording with the question. The real answer is ranked fourth and never reaches the model.',
  },
  {
    query: 'How long does a refund take for an approved return?',
    chunks: withScores(
      [0.72, 0.7, 0.3, 0.38, 0.68],
      [{ retrieved: true }, { retrieved: true }, {}, {}, { retrieved: true, relevant: true }]
    ),
    answer: { text: 'Refunds reach the original payment method within 5–7 days.', ok: true },
    note: 'Raising k to 5 fixes this one — and that is the real trade: a bigger k rarely misses, but it fills the context with near-misses that dilute the prompt and cost tokens on every call.',
  },
  {
    query: 'How long does a refund take for an approved return?',
    chunks: withScores(
      [0.31, 0.29, 0.12, 0.18, 0.94],
      [{}, {}, {}, {}, { retrieved: true, relevant: true }]
    ),
    answer: { text: 'Refunds reach the original payment method within 5–7 days.', ok: true },
    note: 'The better fix is a reranker: retrieve 20 candidates cheaply, then score each one against the query with a model that reads both together. Precision at the top improves sharply, and k can go back down.',
  },
]

export function RagRetrievalVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2400}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="mb-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2">
              <p className="font-mono text-[9px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                query
              </p>
              <p className="font-mono text-[11px] text-neutral-700 dark:text-neutral-200">
                {step.query}
              </p>
            </div>

            <div className="space-y-1">
              {step.chunks.map((chunk) => (
                <div
                  key={chunk.id}
                  className={[
                    'flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors duration-500',
                    chunk.retrieved
                      ? 'border-green-600/50 dark:border-green-500/50 bg-green-600/5'
                      : 'border-neutral-200 dark:border-neutral-800',
                  ].join(' ')}
                >
                  <span className="w-5 shrink-0 font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
                    {chunk.id}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[11px] text-neutral-600 dark:text-neutral-300">
                    {chunk.text}
                  </span>
                  {chunk.relevant && (
                    <span
                      className="shrink-0 font-mono text-[9px] text-amber-500"
                      title="contains the answer"
                    >
                      ★
                    </span>
                  )}
                  <div className="hidden h-1 w-16 shrink-0 rounded-full bg-neutral-100 dark:bg-neutral-800 sm:block">
                    <div
                      className={[
                        'h-full rounded-full transition-all duration-700',
                        chunk.retrieved
                          ? 'bg-green-600 dark:bg-green-500'
                          : 'bg-neutral-300 dark:bg-neutral-600',
                      ].join(' ')}
                      style={{ width: `${(chunk.score ?? 0) * 100}%` }}
                    />
                  </div>
                  <span className="w-7 shrink-0 text-right font-mono text-[9px] tabular-nums text-neutral-400 dark:text-neutral-500">
                    {chunk.score?.toFixed(2) ?? '—'}
                  </span>
                </div>
              ))}
            </div>

            <div
              className={[
                'mt-3 rounded-lg border px-2.5 py-2 text-[11px] transition-colors duration-300',
                step.answer
                  ? step.answer.ok
                    ? 'border-green-600/50 dark:border-green-500/50 text-neutral-700 dark:text-neutral-200'
                    : 'border-red-500/50 bg-red-500/5 text-red-600 dark:text-red-400'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-300 dark:text-neutral-600',
              ].join(' ')}
            >
              <span className="font-mono text-[9px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                answer{' '}
              </span>
              {step.answer?.text ?? '—'}
            </div>
            <p className="mt-1 text-center font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
              ★ marks the chunk that actually contains the answer
            </p>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
