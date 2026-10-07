'use client'

import { StepNote, StepPlayer } from '@/app/components/step-player'
import { SequenceDiagram, type SequenceStep } from '@/app/components/sequence-diagram'
import { CodeTrace, type TraceStep } from '@/app/components/code-trace'

// ── Token probability bars (sampling, hallucination) ─────────────────────────

type Candidate = { t: string; p: number }

type BarStep = {
  context: string
  label: string
  candidates: Candidate[]
  kept?: string[] // tokens still eligible after top-p; others greyed
  chosen?: string
  note: string
}

function softmax(logits: number[], temperature: number) {
  const scaled = logits.map((l) => l / temperature)
  const max = Math.max(...scaled)
  const exps = scaled.map((s) => Math.exp(s - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map((e) => e / sum)
}

const NEXT = ['mat', 'floor', 'sofa', 'roof', 'moon']
const LOGITS = [3.0, 2.2, 1.8, 1.0, -0.5]
// Rounded so server and client render identical widths even if Math.exp
// differs in the last bits between engines.
const at = (temperature: number): Candidate[] =>
  softmax(LOGITS, temperature).map((p, i) => ({ t: NEXT[i], p: Math.round(p * 1e4) / 1e4 }))

// Top-p at T = 1: keep the smallest set of tokens whose probabilities add up to ≥ p.
function topP(cands: Candidate[], p: number) {
  const sorted = [...cands].sort((a, b) => b.p - a.p)
  const kept: string[] = []
  let total = 0
  for (const c of sorted) {
    kept.push(c.t)
    total += c.p
    if (total >= p) break
  }
  return kept
}

const T1 = at(1)

const samplingSteps: BarStep[] = [
  {
    context: 'The cat sat on the',
    label: 'raw scores (logits) → probabilities at temperature 1',
    candidates: T1,
    note: 'A language model never outputs a word directly. It scores every token in its vocabulary, and those scores are turned into a probability for each possible next token. Here are the top five.',
  },
  {
    context: 'The cat sat on the',
    label: 'temperature 0.2 — sharpened',
    candidates: at(0.2),
    note: 'Temperature divides the scores before they become probabilities. Low temperature exaggerates the gaps: "mat" now takes almost everything. Output becomes predictable and repetitive.',
  },
  {
    context: 'The cat sat on the',
    label: 'temperature 1.5 — flattened',
    candidates: at(1.5),
    note: 'High temperature shrinks the gaps, so unlikely tokens get a real chance. More variety — and more chance of nonsense like "moon".',
  },
  {
    context: 'The cat sat on the',
    label: 'top-p 0.9 at temperature 1',
    candidates: T1,
    kept: topP(T1, 0.9),
    note: 'Top-p (nucleus sampling) keeps only the most likely tokens whose probabilities add up to 90%, and discards the long tail. It cuts the nonsense without making the output rigid.',
  },
  {
    context: 'The cat sat on the',
    label: 'sample one token',
    candidates: T1,
    kept: topP(T1, 0.9),
    chosen: 'floor',
    note: 'Then one token is drawn at random, weighted by probability. This time it is "floor" — not the single most likely word. Run the same prompt again and you may get "mat". That draw is why the same prompt gives different answers.',
  },
  {
    context: 'The cat sat on the floor',
    label: 'repeat for every token',
    candidates: [
      { t: '.', p: 0.46 },
      { t: ',', p: 0.21 },
      { t: 'and', p: 0.17 },
      { t: 'next', p: 0.1 },
      { t: 'by', p: 0.06 },
    ],
    note: 'The chosen token is appended and the whole process runs again for the next one. A paragraph is hundreds of these weighted draws in a row — every one a small fork in the road.',
  },
]

const hallucinationSteps: BarStep[] = [
  {
    context: 'The capital of Australia is',
    label: 'a well-known fact',
    candidates: [
      { t: 'Canberra', p: 0.91 },
      { t: 'Sydney', p: 0.06 },
      { t: 'Melbourne', p: 0.02 },
      { t: 'a', p: 0.01 },
    ],
    chosen: 'Canberra',
    note: 'For a fact that appears thousands of times in training data, the probability piles up on the right answer. The model is confident, and it is right.',
  },
  {
    context: "Dr. Meera Rao's thesis was submitted in",
    label: 'an obscure fact — no strong memory',
    candidates: [
      { t: '2014', p: 0.24 },
      { t: '2016', p: 0.22 },
      { t: '2012', p: 0.2 },
      { t: '2018', p: 0.18 },
      { t: '2010', p: 0.16 },
    ],
    note: 'For something the model has barely seen, the probability is spread across many plausible answers. There is no "I don\'t know" pressure built into next-token prediction — something has to be chosen.',
  },
  {
    context: "Dr. Meera Rao's thesis was submitted in",
    label: 'one plausible guess wins the draw',
    candidates: [
      { t: '2014', p: 0.24 },
      { t: '2016', p: 0.22 },
      { t: '2012', p: 0.2 },
      { t: '2018', p: 0.18 },
      { t: '2010', p: 0.16 },
    ],
    chosen: '2016',
    note: 'The sampled year is written in exactly the same fluent, confident sentence as the Canberra answer. Nothing in the text marks it as a guess. That is a hallucination: fluent, plausible, and unsupported.',
  },
  {
    context: '[source: "…the thesis, submitted in 2014, examined…"]  Dr. Meera Rao\'s thesis was submitted in',
    label: 'grounded — the answer is in the context',
    candidates: [
      { t: '2014', p: 0.96 },
      { t: '2016', p: 0.01 },
      { t: '2012', p: 0.01 },
      { t: '2018', p: 0.01 },
      { t: '2010', p: 0.01 },
    ],
    chosen: '2014',
    note: 'Put a source document in the prompt and the model can copy from it instead of recalling. The probability collapses onto the supported answer. Grounding — retrieval, tools, quoted sources — is the main defence against hallucination.',
  },
]

function TokenBars({ steps, interval = 2800 }: { steps: BarStep[]; interval?: number }) {
  return (
    <StepPlayer length={steps.length} interval={interval}>
      {(index) => {
        const step = steps[index]
        return (
          <>
            <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900 px-3 py-2 font-mono text-[12px] text-neutral-800 dark:text-neutral-100">
              {step.context} <span className="animate-pulse text-green-600 dark:text-green-500">▍</span>
            </div>
            <div className="mb-1.5 mt-3 font-mono text-[9.5px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              {step.label}
            </div>
            <div className="space-y-1">
              {step.candidates.map((c) => {
                const out = step.kept && !step.kept.includes(c.t)
                const chosen = step.chosen === c.t
                return (
                  <div key={c.t} className="flex items-center gap-2 font-mono text-[11px]">
                    <span
                      className={[
                        'w-20 shrink-0 truncate text-right',
                        chosen
                          ? 'font-medium text-green-700 dark:text-green-400'
                          : out
                            ? 'text-neutral-300 line-through dark:text-neutral-600'
                            : 'text-neutral-700 dark:text-neutral-200',
                      ].join(' ')}
                    >
                      {c.t}
                    </span>
                    <div className="h-4 flex-1 overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className={[
                          'h-full rounded transition-[width] duration-500',
                          chosen
                            ? 'bg-green-600 dark:bg-green-500'
                            : out
                              ? 'bg-neutral-200 dark:bg-neutral-700'
                              : 'bg-amber-500/70',
                        ].join(' ')}
                        style={{ width: `${Math.max(c.p * 100, 0.5)}%` }}
                      />
                    </div>
                    <span className="w-12 shrink-0 text-right tabular-nums text-neutral-500 dark:text-neutral-400">
                      {(c.p * 100).toFixed(c.p < 0.01 ? 2 : 0)}%
                    </span>
                  </div>
                )
              })}
            </div>
            <StepNote>{step.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}

export function SamplingVisualizer() {
  return <TokenBars steps={samplingSteps} />
}

export function HallucinationVisualizer() {
  return <TokenBars steps={hallucinationSteps} interval={3000} />
}

// ── Streaming ───────────────────────────────────────────────────────────────

const screen = (text: string, timing: string) => ({ title: `what the user sees · ${timing}`, lines: [text || '(waiting…)'] })

const streamingSteps: SequenceStep[] = [
  {
    panel: screen('', '0.0 s'),
    note: 'A model generates one token at a time. A long answer can take many seconds to finish — but the first words exist almost immediately. Streaming is about showing them as they arrive.',
  },
  {
    message: { from: 0, to: 1, label: 'POST /chat  "Explain DNS"' },
    panel: screen('', '0.0 s'),
    note: 'The browser sends the question to your server. (Never call the model API straight from a public page with your own key — the key would be visible to anyone.)',
  },
  {
    message: { from: 1, to: 2, label: 'messages.stream({ … })' },
    panel: screen('', '0.0 s'),
    note: 'Your server opens a streaming request. Instead of one response at the end, the API keeps the connection open and sends events as server-sent events.',
  },
  {
    message: { from: 2, to: 1, label: 'text_delta: "DNS turns"', dashed: true, tone: 'ok' },
    panel: screen('DNS turns', '0.4 s — time to first token'),
    note: 'The first text delta arrives in well under a second. Time to first token is the latency users actually feel; total time matters much less once text is moving.',
  },
  {
    message: { from: 1, to: 0, label: 'forward chunk', dashed: true },
    panel: screen('DNS turns', '0.4 s'),
    note: 'Your server forwards each chunk to the browser as it comes in — usually over its own stream (SSE or a streamed fetch response).',
  },
  {
    message: { from: 2, to: 1, label: 'text_delta: " a name like example.com into"', dashed: true },
    panel: screen('DNS turns a name like example.com into', '0.9 s'),
    note: 'More deltas follow, each a few tokens long. The page appends them, so the answer appears to type itself out.',
  },
  {
    message: { from: 2, to: 1, label: 'text_delta: " an IP address…"', dashed: true },
    panel: screen('DNS turns a name like example.com into an IP address…', '1.4 s'),
    note: 'The user is already reading while the model is still writing. They can also stop it early if it is heading the wrong way — which saves tokens and money.',
  },
  {
    message: { from: 2, to: 1, label: 'message_delta: stop_reason end_turn', dashed: true },
    panel: screen('DNS turns a name like example.com into an IP address… (full answer)', '6.2 s — complete'),
    note: 'At the end comes the stop reason and final token usage. Check stop_reason: max_tokens means the answer was cut off. Without streaming, the user would have stared at a spinner for all 6.2 seconds.',
  },
]

export function StreamingVisualizer() {
  return <SequenceDiagram actors={['browser', 'your server', 'model API']} steps={streamingSteps} />
}

// ── Structured outputs ──────────────────────────────────────────────────────

const STRUCT_CODE = [
  'const Invoice = z.object({',
  '  vendor: z.string(),',
  '  total: z.number(),',
  '  dueDate: z.string(),',
  '})',
  '',
  'const res = await client.messages.parse({',
  "  model: 'claude-opus-5-5',",
  '  max_tokens: 1024,',
  "  messages: [{ role: 'user', content: email }],",
  '  output_config: { format: zodOutputFormat(Invoice) },',
  '})',
  'const invoice = res.parsed_output',
]

const structSteps: TraceStep[] = [
  {
    lines: [],
    panels: [
      {
        title: 'asking for JSON in the prompt only',
        rows: [{ k: 'reply', v: 'Sure! Here\'s the invoice data: ```json { "vendor": "Acme", "total": "1,240.00", … } ``` Let me know if…', tone: 'bad' }],
      },
    ],
    note: 'Ask a model for JSON in plain words and you usually get it — wrapped in chatty prose, sometimes with a string where you wanted a number, occasionally with a missing brace. Fine for a demo; painful to parse at scale.',
  },
  {
    lines: [0, 1, 2, 3, 4],
    panels: [
      {
        title: 'schema',
        rows: [
          { k: 'vendor', v: 'string' },
          { k: 'total', v: 'number' },
          { k: 'dueDate', v: 'string' },
        ],
      },
    ],
    note: 'Instead, describe the shape you want as a schema. Zod lets one definition serve as both a runtime validator and a TypeScript type.',
  },
  {
    lines: [6, 7, 8, 9, 10, 11],
    panels: [
      {
        title: 'while generating',
        rows: [
          { k: 'next token must fit', v: '{ "vendor": "…", "total": <number>, … }' },
          { k: 'prose allowed?', v: 'no', tone: 'ok' },
        ],
      },
    ],
    note: 'With output_config.format, the API constrains generation to the schema: at each step, tokens that would break it are not allowed. The result is valid JSON of exactly this shape — not just usually.',
  },
  {
    lines: [12],
    panels: [
      {
        title: 'invoice (typed)',
        rows: [
          { k: 'vendor', v: '"Acme Supplies"', tone: 'ok' },
          { k: 'total', v: '1240', tone: 'ok' },
          { k: 'dueDate', v: '"2026-11-01"', tone: 'ok' },
        ],
      },
    ],
    note: 'messages.parse validates the reply and returns parsed_output already typed as the schema\'s type. (It is null if parsing failed, so guard it.)',
  },
  {
    lines: [12],
    panels: [
      {
        title: 'still your job',
        rows: [
          { k: 'shape correct?', v: 'guaranteed', tone: 'ok' },
          { k: 'values correct?', v: 'not guaranteed — check them', tone: 'warn' },
        ],
      },
    ],
    note: 'Structure is guaranteed; truth is not. The total is a number — but is it the right number? Validate business rules (totals add up, dates in range) and send doubtful cases for review.',
  },
]

export function StructuredOutputVisualizer() {
  return <CodeTrace code={STRUCT_CODE} steps={structSteps} interval={3000} />
}

// ── Prompting vs RAG vs fine-tuning ─────────────────────────────────────────

type Fit = 'good' | 'ok' | 'poor'

type Need = {
  need: string
  fits: [Fit, Fit, Fit] // prompting, RAG, fine-tuning
  note: string
}

const APPROACHES = ['Prompting', 'RAG', 'Fine-tuning']

const needs: Need[] = [
  {
    need: 'Try an idea this afternoon',
    fits: ['good', 'ok', 'poor'],
    note: 'Prompting is instant: change the instructions, run it again. RAG needs a retrieval pipeline. Fine-tuning needs a dataset, a training run, and an evaluation before you know if it helped. Start with prompting, always.',
  },
  {
    need: 'Answer from 10,000 internal docs',
    fits: ['poor', 'good', 'poor'],
    note: 'Too much to paste into every prompt, and fine-tuning is a poor way to store facts — the model blurs them, and can\'t tell you where they came from. RAG fetches only the relevant passages for each question.',
  },
  {
    need: 'Facts that change daily',
    fits: ['ok', 'good', 'poor'],
    note: 'Fine-tuned knowledge is frozen at training time; updating it means training again. With RAG you update the index and the next answer uses the new data.',
  },
  {
    need: 'Cite the source of each answer',
    fits: ['ok', 'good', 'poor'],
    note: 'Retrieved passages come with their document IDs, so the answer can point at them and a reader can check. Knowledge baked into weights has no source to cite.',
  },
  {
    need: 'A consistent tone or output format',
    fits: ['good', 'poor', 'good'],
    note: 'Usually solved with instructions and examples in the prompt, or structured outputs for formats. Fine-tuning helps when a narrow style must be perfectly consistent across huge volumes.',
  },
  {
    need: 'A small, cheap model for one narrow task',
    fits: ['ok', 'ok', 'good'],
    note: 'This is fine-tuning\'s real strength: teaching a smaller, faster model to do one well-defined job — classification, extraction — as well as a larger general model, at a fraction of the cost per request.',
  },
]

const FIT_STYLE: Record<Fit, string> = {
  good: 'bg-green-600 dark:bg-green-500 text-white',
  ok: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  poor: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500',
}
const FIT_LABEL: Record<Fit, string> = { good: 'best fit', ok: 'workable', poor: 'poor fit' }

export function ApproachVisualizer() {
  return (
    <StepPlayer length={needs.length} interval={3200}>
      {(index) => {
        const item = needs[index]
        return (
          <>
            <div className="mb-3 text-center font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
              need {index + 1} of {needs.length}
            </div>
            <div className="mb-3 text-center text-sm font-medium text-neutral-900 dark:text-neutral-50">
              {item.need}
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
              {APPROACHES.map((name, i) => (
                <div
                  key={name}
                  className={[
                    'flex flex-col items-center gap-1 rounded-lg px-1 py-2.5 text-center transition-colors duration-300',
                    FIT_STYLE[item.fits[i]],
                  ].join(' ')}
                >
                  <span className="font-medium">{name}</span>
                  <span className="text-[10px] opacity-90">{FIT_LABEL[item.fits[i]]}</span>
                </div>
              ))}
            </div>
            <StepNote>{item.note}</StepNote>
          </>
        )
      }}
    </StepPlayer>
  )
}
