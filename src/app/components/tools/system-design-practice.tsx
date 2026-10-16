'use client'

import { useEffect, useRef, useState } from 'react'
import { ApiKeyField } from '@/app/components/tools/api-key-field'
import { ArchitectureDiagramEditor } from '@/app/components/tools/architecture-diagram-editor'
import { CopyToClaude } from '@/app/components/tools/copy-to-claude'
import { EMPTY_ARCH, archToSvg, archToText, isArchDiagram, type ArchDiagram } from '@/app/lib/architecture-diagram'
import { createClient, DEFAULT_MODEL, describeError, supportsServerFallbacks } from '@/app/lib/byok'
import { DIMENSIONS, PROBLEMS, type Problem } from '@/app/lib/system-design-problems'
import {
  SYSTEM_DESIGN_JSON_INSTRUCTIONS,
  buildDesignPastePrompt,
  buildDesignUserMessage,
} from '@/app/lib/system-design-prompt'

/*
 * Loaded with ssr: false (see system-design-practice-loader), so the lazy
 * useState initialisers below can read localStorage directly — there is no
 * server render to mismatch.
 */

type Score = { key: string; score: number; comment: string }
type Review = {
  scores: Score[]
  strengths: string[]
  gaps: string[]
  followUps: string[]
  verdict: string
}

type Attempt = {
  problem: string
  date: string
  total: number
  max: number
}

type Draft = { notes: string; diagram: ArchDiagram }
type Tab = 'notes' | 'diagram'

const HISTORY_KEY = 'system-design-attempts'
const DRAFTS_KEY = 'system-design-drafts'
const LAST_KEY = 'system-design-last-problem'
const LEGACY_DRAFT_KEY = 'system-design-draft' // v1: one { slug, answer } draft

const emptyDraft = (): Draft => ({ notes: '', diagram: EMPTY_ARCH })

function loadHistory(): Attempt[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function loadDrafts(): Record<string, Draft> {
  const out: Record<string, Draft> = {}
  try {
    const parsed = JSON.parse(localStorage.getItem(DRAFTS_KEY) ?? '{}')
    if (parsed && typeof parsed === 'object') {
      for (const [slug, d] of Object.entries(parsed as Record<string, Partial<Draft>>)) {
        out[slug] = {
          notes: typeof d?.notes === 'string' ? d.notes : '',
          diagram: isArchDiagram(d?.diagram) ? d.diagram : EMPTY_ARCH,
        }
      }
    }
    // Carry over the single draft the first version of this tool kept.
    const legacy = JSON.parse(localStorage.getItem(LEGACY_DRAFT_KEY) ?? 'null')
    if (legacy?.slug && typeof legacy.answer === 'string' && legacy.answer && !out[legacy.slug]?.notes) {
      out[legacy.slug] = { ...(out[legacy.slug] ?? emptyDraft()), notes: legacy.answer }
    }
  } catch {
    // corrupt or blocked storage — start empty
  }
  return out
}

function initialProblem(): Problem {
  try {
    const slug = localStorage.getItem(LAST_KEY) ?? JSON.parse(localStorage.getItem(LEGACY_DRAFT_KEY) ?? 'null')?.slug
    return PROBLEMS.find((p) => p.slug === slug) ?? PROBLEMS[0]
  } catch {
    return PROBLEMS[0]
  }
}

/** Models sometimes wrap JSON in a fence despite instructions; recover rather than fail. */
function parseReview(text: string): Review | null {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '')
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1))
    if (!Array.isArray(parsed.scores)) return null
    return {
      scores: parsed.scores.filter((s: Score) => typeof s?.score === 'number'),
      strengths: parsed.strengths ?? [],
      gaps: parsed.gaps ?? [],
      followUps: parsed.followUps ?? [],
      verdict: parsed.verdict ?? '',
    }
  } catch {
    return null
  }
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function SystemDesignPractice() {
  const [problem, setProblem] = useState<Problem>(initialProblem)
  const [drafts, setDrafts] = useState<Record<string, Draft>>(loadDrafts)
  const [tab, setTab] = useState<Tab>('notes')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [review, setReview] = useState<Review | null>(null)
  const [raw, setRaw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<Attempt[]>(loadHistory)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const draft = drafts[problem.slug] ?? emptyDraft()

  // Persist drafts and the last-opened problem (writes only — no state set here).
  useEffect(() => {
    try {
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
      localStorage.setItem(LAST_KEY, problem.slug)
      localStorage.removeItem(LEGACY_DRAFT_KEY)
    } catch {
      // storage full or blocked — the draft still lives in memory
    }
  }, [drafts, problem.slug])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => () => abortRef.current?.abort(), [])

  function updateDraft(patch: Partial<Draft>) {
    setDrafts((all) => ({ ...all, [problem.slug]: { ...(all[problem.slug] ?? emptyDraft()), ...patch } }))
  }

  function pickProblem(slug: string) {
    const next = PROBLEMS.find((p) => p.slug === slug)
    if (!next) return
    abortRef.current?.abort()
    setProblem(next)
    setReview(null)
    setRaw('')
    setError('')
    setSeconds(0)
    setRunning(false)
  }

  const answer = { notes: draft.notes, diagramText: archToText(draft.diagram) }
  const hasDiagram = draft.diagram.nodes.length > 0
  const isEmpty = !draft.notes.trim() && !hasDiagram

  async function grade() {
    if (!apiKey) return setError('Add your API key first — or use “Copy & open Claude” instead.')
    if (draft.notes.trim().length < 80 && draft.diagram.nodes.length < 3) {
      return setError('Write a bit more, or draw the architecture, before grading.')
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setError('')
    setReview(null)
    setRaw('')
    setRunning(false)

    try {
      const client = await createClient(apiKey)
      const base = {
        model,
        max_tokens: 4000,
        system: SYSTEM_DESIGN_JSON_INSTRUCTIONS,
        messages: [{ role: 'user' as const, content: buildDesignUserMessage(problem, answer) }],
      }
      const response = supportsServerFallbacks(model)
        ? await client.beta.messages.create(
            { ...base, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' },
            { signal: controller.signal }
          )
        : await client.beta.messages.create(base, { signal: controller.signal })

      if (response.stop_reason === 'refusal') {
        setError('The model declined to grade this. Try rephrasing, or use a different model.')
        return
      }

      const text = response.content
        .filter((block) => block.type === 'text')
        .map((block) => (block as { text: string }).text)
        .join('')

      const parsed = parseReview(text)
      if (!parsed) {
        setRaw(text)
      } else {
        setReview(parsed)
        const total = parsed.scores.reduce((sum, s) => sum + s.score, 0)
        const attempt: Attempt = {
          problem: problem.title,
          date: new Date().toISOString().slice(0, 10),
          total,
          max: DIMENSIONS.length * 3,
        }
        const next = [attempt, ...loadHistory()].slice(0, 20)
        setHistory(next)
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
        } catch {}
      }
    } catch (err) {
      if (!controller.signal.aborted) setError(describeError(err))
    } finally {
      setLoading(false)
    }
  }

  const total = review?.scores.reduce((sum, s) => sum + s.score, 0) ?? 0
  const max = DIMENSIONS.length * 3
  const tabClass = (t: Tab) =>
    [
      'rounded-md px-3 py-1.5 text-xs transition-colors',
      tab === t
        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100',
    ].join(' ')

  return (
    <div className="space-y-6">
      {/* problem picker */}
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <select
            value={problem.slug}
            onChange={(e) => pickProblem(e.target.value)}
            aria-label="Problem"
            className="rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-2.5 py-1.5 text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none"
          >
            {PROBLEMS.map((p) => (
              <option key={p.slug} value={p.slug} className="bg-white dark:bg-neutral-900">
                {p.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => pickProblem(PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)].slug)}
            className="rounded-md border border-neutral-200 dark:border-neutral-700 px-2.5 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
          >
            Random
          </button>
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="rounded-md border border-neutral-200 dark:border-neutral-700 px-2.5 py-1.5 font-mono text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors tabular-nums"
          >
            {running ? '⏸' : '▶'} {formatTime(seconds)}
          </button>
          <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
            drafts save automatically in this browser
          </span>
        </div>

        <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">{problem.prompt}</p>
          <p className="mt-2 font-mono text-xs text-neutral-500 dark:text-neutral-400">{problem.scale}</p>
        </div>
      </div>

      {/* answer */}
      <div>
        <div className="mb-2 flex items-center gap-1" role="tablist">
          {(['notes', 'diagram'] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={tabClass(t)}>
              {t === 'notes' ? 'Notes' : `Diagram (${draft.diagram.nodes.length})`}
            </button>
          ))}
          {tab === 'notes' ? (
            <span className="ml-auto font-mono text-[10px] text-neutral-400 dark:text-neutral-500 tabular-nums">
              {draft.notes.trim() ? draft.notes.trim().split(/\s+/).length : 0} words
            </span>
          ) : null}
        </div>

        {tab === 'notes' ? (
          <textarea
            id="design-answer"
            value={draft.notes}
            onChange={(e) => updateDraft({ notes: e.target.value })}
            rows={16}
            aria-label="Your design"
            placeholder={`Work through it the way you would at a whiteboard:\n\n1. Requirements and what you are explicitly not building\n2. Back-of-envelope numbers\n3. API and data model\n4. Architecture — components and request flow (draw it in the Diagram tab)\n5. Where it breaks first, and what you do about it\n6. Trade-offs you are accepting`}
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent p-3 font-mono text-xs leading-relaxed text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 focus:border-green-600 dark:focus:border-green-500 focus:outline-none"
          />
        ) : (
          <ArchitectureDiagramEditor diagram={draft.diagram} onChange={(diagram) => updateDraft({ diagram })} />
        )}
      </div>

      {/* get feedback */}
      <div className="space-y-4 rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
        <div>
          <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-50">Get feedback from Claude</h2>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            Your notes and diagram are turned into one grading prompt with the same six-part rubric every time, so
            scores are comparable between attempts.
          </p>
        </div>

        <CopyToClaude
          getPrompt={() => buildDesignPastePrompt(problem, answer)}
          getSvg={hasDiagram ? () => archToSvg(draft.diagram) : null}
          filename={`${problem.slug}-architecture.png`}
          disabled={isEmpty}
        />

        <div>
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Option 2 · right here, with your own API key
          </div>
          <ApiKeyField apiKey={apiKey} onKeyChange={setApiKey} model={model} onModelChange={setModel} />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={grade}
              disabled={loading}
              className="rounded-md border border-green-600 dark:border-green-500 px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-400 hover:bg-green-600/10 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Grading…' : 'Grade my design'}
            </button>
            {loading && (
              <button
                type="button"
                onClick={() => abortRef.current?.abort()}
                className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      </div>

      {review && (
        <div className="space-y-5 rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Scorecard
            </h2>
            <span className="font-mono text-lg tabular-nums text-neutral-900 dark:text-neutral-50">
              {total}/{max}
            </span>
          </div>

          <div className="space-y-2.5">
            {DIMENSIONS.map((dimension) => {
              const score = review.scores.find((s) => s.key === dimension.key)
              const value = score?.score ?? 0
              return (
                <div key={dimension.key}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm text-neutral-700 dark:text-neutral-200">{dimension.label}</span>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-neutral-400 dark:text-neutral-500">
                      {value}/3
                    </span>
                  </div>
                  <div className="mt-1 flex gap-1">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={[
                          'h-1.5 flex-1 rounded-full',
                          value >= step
                            ? value === 3
                              ? 'bg-green-600 dark:bg-green-500'
                              : value === 2
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            : 'bg-neutral-100 dark:bg-neutral-800',
                        ].join(' ')}
                      />
                    ))}
                  </div>
                  {score?.comment && (
                    <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{score.comment}</p>
                  )}
                </div>
              )
            })}
          </div>

          {review.verdict && (
            <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">{review.verdict}</p>
          )}

          {([
            ['What worked', review.strengths],
            ['Gaps', review.gaps],
            ['An interviewer would ask next', review.followUps],
          ] as const).map(([label, items]) =>
            items.length ? (
              <div key={label}>
                <h3 className="mb-1 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  {label}
                </h3>
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item} className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                      · {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null
          )}

          <details className="text-xs">
            <summary className="cursor-pointer text-neutral-400 dark:text-neutral-500">
              What a strong answer usually covers
            </summary>
            <ul className="mt-2 space-y-1">
              {problem.wouldExpect.map((item) => (
                <li key={item} className="text-neutral-600 dark:text-neutral-300">
                  · {item}
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}

      {raw && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
          <p className="mb-2 text-xs text-amber-700 dark:text-amber-400">
            The response did not parse as a scorecard. Here it is unformatted:
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-neutral-600 dark:text-neutral-300">
            {raw}
          </pre>
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Past attempts
          </h2>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {history.slice(0, 8).map((attempt, i) => (
              <div key={`${attempt.date}-${i}`} className="flex items-baseline justify-between py-1.5 text-xs">
                <span className="text-neutral-600 dark:text-neutral-300">{attempt.problem}</span>
                <span className="font-mono tabular-nums text-neutral-400 dark:text-neutral-500">
                  {attempt.date} · {attempt.total}/{attempt.max}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
