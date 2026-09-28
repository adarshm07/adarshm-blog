'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'

const COUNTS: Record<string, number> = { low: 5, lower: 2, newest: 6, widest: 3 }

type Step = {
  seqs: Record<string, string[]>
  merges: string[]
  merged?: string // token produced by this step's merge
  pairCount?: number
  note: string
}

// Produced by running the training loop in the post on this corpus; ties go
// to the pair seen first.
const steps: Step[] = [
  {
    seqs: {
      low: ['l', 'o', 'w'],
      lower: ['l', 'o', 'w', 'e', 'r'],
      newest: ['n', 'e', 'w', 'e', 's', 't'],
      widest: ['w', 'i', 'd', 'e', 's', 't'],
    },
    merges: [],
    note: 'A tiny training corpus: four words with their frequencies. Start by splitting every word into single characters. The vocabulary is just the alphabet.',
  },
  {
    seqs: {
      low: ['l', 'o', 'w'],
      lower: ['l', 'o', 'w', 'e', 'r'],
      newest: ['n', 'e', 'w', 'es', 't'],
      widest: ['w', 'i', 'd', 'es', 't'],
    },
    merges: ['e + s'],
    merged: 'es',
    pairCount: 9,
    note: 'Count every adjacent pair, weighted by word frequency. "e s" appears 6 times in newest and 3 in widest — 9, the most. Merge it everywhere into a new token, es.',
  },
  {
    seqs: {
      low: ['l', 'o', 'w'],
      lower: ['l', 'o', 'w', 'e', 'r'],
      newest: ['n', 'e', 'w', 'est'],
      widest: ['w', 'i', 'd', 'est'],
    },
    merges: ['e + s', 'es + t'],
    merged: 'est',
    pairCount: 9,
    note: 'Recount. Now "es t" is the top pair (9). Merging it creates est — a suffix the algorithm discovered on its own, without knowing any English.',
  },
  {
    seqs: {
      low: ['lo', 'w'],
      lower: ['lo', 'w', 'e', 'r'],
      newest: ['n', 'e', 'w', 'est'],
      widest: ['w', 'i', 'd', 'est'],
    },
    merges: ['e + s', 'es + t', 'l + o'],
    merged: 'lo',
    pairCount: 7,
    note: '"l o" appears 5 + 2 = 7 times. Merge.',
  },
  {
    seqs: {
      low: ['low'],
      lower: ['low', 'e', 'r'],
      newest: ['n', 'e', 'w', 'est'],
      widest: ['w', 'i', 'd', 'est'],
    },
    merges: ['e + s', 'es + t', 'l + o', 'lo + w'],
    merged: 'low',
    pairCount: 7,
    note: '"lo w" (7) → low. The frequent word low is now a single token, and lower is low + e + r.',
  },
  {
    seqs: {
      low: ['low'],
      lower: ['low', 'e', 'r'],
      newest: ['new', 'est'],
      widest: ['w', 'i', 'd', 'est'],
    },
    merges: ['e + s', 'es + t', 'l + o', 'lo + w', 'n + e', 'ne + w'],
    merged: 'new',
    pairCount: 6,
    note: 'Two more rounds give ne, then new. Training stops when the vocabulary reaches its target size — for real models, somewhere around 50,000 to 200,000 tokens.',
  },
  {
    seqs: {
      lowest: ['low', 'est'],
    },
    merges: ['e + s', 'es + t', 'l + o', 'lo + w', 'n + e', 'ne + w'],
    note: 'Encoding a word never seen in training: apply the learned merges, in order, to "lowest". l o w e s t → l o w es t → l o w est → lo w est → low est. Two tokens, both meaningful — and no word is ever out of vocabulary, since single characters are always available.',
  },
]

export function BPEVisualizer() {
  return (
    <StepPlayer length={steps.length} interval={2600}>
      {(index) => {
        const step = steps[index]
        const words = Object.keys(step.seqs)
        return (
          <>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 space-y-1.5">
                {words.map((w) => (
                  <div key={w} className="flex items-center gap-2">
                    <span className="w-8 shrink-0 text-right font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                      {COUNTS[w] ? `×${COUNTS[w]}` : 'new'}
                    </span>
                    <div className="flex flex-wrap gap-0.5">
                      {step.seqs[w].map((tok, i) => (
                        <span
                          key={`${w}-${i}-${tok}`}
                          className={[
                            'rounded px-1.5 py-1 font-mono text-[12px] transition-colors duration-300',
                            tok === step.merged
                              ? 'bg-amber-500 text-white'
                              : tok.length > 1
                                ? 'bg-green-600/80 dark:bg-green-500/80 text-white'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200',
                          ].join(' ')}
                        >
                          {tok}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="sm:w-32">
                <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  merges, in order
                </div>
                <div className="space-y-0.5 font-mono text-[10px] text-neutral-600 dark:text-neutral-300">
                  {step.merges.length === 0 ? (
                    <div className="text-neutral-300 dark:text-neutral-600">none yet</div>
                  ) : (
                    step.merges.map((m, i) => (
                      <div
                        key={m}
                        className={
                          i === step.merges.length - 1 && step.merged
                            ? 'text-amber-600 dark:text-amber-400'
                            : ''
                        }
                      >
                        {i + 1}. {m}
                      </div>
                    ))
                  )}
                </div>
                {step.pairCount ? (
                  <div className="mt-1.5 font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                    pair count: {step.pairCount}
                  </div>
                ) : null}
              </div>
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
