'use client'

import { useEffect, useRef, useState } from 'react'
import { ApiKeyField } from '@/app/components/tools/api-key-field'
import { createClient, describeError } from '@/app/lib/byok'
import { DIMENSIONS, PROBLEMS, type Problem } from '@/app/lib/system-design-problems'

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

const HISTORY_KEY = 'system-design-attempts'
const DRAFT_KEY = 'system-design-draft'

const SYSTEM_PROMPT = `You are a staff engineer running a system design interview. You are grading a written design against a fixed rubric.

Be specific and honest. Reward concrete numbers, named trade-offs, and identified bottlenecks. Do not reward vocabulary alone: mentioning "we'll use Kafka" with no reason is not a point. Do not invent things the candidate did not write. If an answer is short or vague, say so and score it low — an inflated score is useless to them.

Score each rubric dimension 0-3:
0 = not addressed
1 = mentioned without substance
2 = solid, with minor gaps
3 = strong, specific, with reasoning

Reply with JSON only, no prose outside it, no code fences, in exactly this shape:
{"scores":[{"key":"<dimension key>","score":<0-3>,"comment":"<one or two sentences, specific to what they wrote>"}],
 "strengths":["..."],
 "gaps":["what a strong answer would have covered that this one did not"],
 "followUps":["the question an interviewer would ask next"],
 "verdict":"<two sentences: where this lands and the single highest-leverage thing to improve>"}`

function loadHistory(): Attempt[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
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
  const [problem, setProblem] = useState<Problem>(PROBLEMS[0])
  const [answer, setAnswer] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('claude-opus-5')
  const [review, setReview] = useState<Review | null>(null)
  const [raw, setRaw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<Attempt[]>([])
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => setHistory(loadHistory()), [])

  // restore an in-progress answer across reloads
  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null')
      if (draft?.slug && draft.answer) {
        const found = PROBLEMS.find((p) => p.slug === draft.slug)
        if (found) {
          setProblem(found)
          setAnswer(draft.answer)
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ slug: problem.slug, answer }))
    } catch {}
  }, [problem.slug, answer])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  function pickProblem(slug: string) {
    const next = PROBLEMS.find((p) => p.slug === slug)
    if (!next) return
    setProblem(next)
    setAnswer('')
    setReview(null)
    setRaw('')
    setError('')
    setSeconds(0)
    setRunning(false)
  }

  async function grade() {
    if (!apiKey) return setError('Add your API key first — the panel above.')
    if (answer.trim().length < 80) return setError('Write a bit more before grading.')

    setLoading(true)
    setError('')
    setReview(null)
    setRaw('')
    setRunning(false)
    abortRef.current = new AbortController()

    try {
      const client = await createClient(apiKey)
      const rubric = DIMENSIONS.map((d) => `- ${d.key} (${d.label}): ${d.looksLike}`).join('\n')

      const response = await client.messages.create(
        {
          model,
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: `# Problem\n${problem.title}\n${problem.prompt}\nStated scale: ${problem.scale}\n\n# Rubric dimensions\n${rubric}\n\n# The candidate's written design\n${answer}`,
            },
          ],
        },
        { signal: abortRef.current.signal }
      )

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
      if ((err as Error)?.name !== 'AbortError') setError(describeError(err))
    } finally {
      setLoading(false)
    }
  }

  const total = review?.scores.reduce((sum, s) => sum + s.score, 0) ?? 0
  const max = DIMENSIONS.length * 3

  return (
    <div className="space-y-6">
      <ApiKeyField
        apiKey={apiKey}
        onKeyChange={setApiKey}
        model={model}
        onModelChange={setModel}
      />

      {/* problem picker */}
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <select
            value={problem.slug}
            onChange={(e) => pickProblem(e.target.value)}
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
        </div>

        <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
            {problem.prompt}
          </p>
          <p className="mt-2 font-mono text-xs text-neutral-500 dark:text-neutral-400">
            {problem.scale}
          </p>
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <label
            htmlFor="design-answer"
            className="text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500"
          >
            Your design
          </label>
          <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 tabular-nums">
            {answer.trim() ? answer.trim().split(/\s+/).length : 0} words
          </span>
        </div>
        <textarea
          id="design-answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={16}
          placeholder={`Work through it the way you would at a whiteboard:\n\n1. Requirements and what you are explicitly not building\n2. Back-of-envelope numbers\n3. API and data model\n4. Architecture — components and request flow\n5. Where it breaks first, and what you do about it\n6. Trade-offs you are accepting`}
          className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent p-3 font-mono text-xs leading-relaxed text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 focus:border-green-600 dark:focus:border-green-500 focus:outline-none"
        />

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={grade}
            disabled={loading}
            className="rounded-md bg-green-600 dark:bg-green-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 transition-colors"
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
          {error && <span className="text-xs text-rose-600 dark:text-rose-400">{error}</span>}
        </div>
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
                    <span className="text-sm text-neutral-700 dark:text-neutral-200">
                      {dimension.label}
                    </span>
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
                    <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                      {score.comment}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {review.verdict && (
            <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
              {review.verdict}
            </p>
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
                    <li
                      key={item}
                      className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300"
                    >
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
              <div
                key={`${attempt.date}-${i}`}
                className="flex items-baseline justify-between py-1.5 text-xs"
              >
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
