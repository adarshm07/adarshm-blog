'use client'

import { useEffect, useRef, useState } from 'react'
import { ApiKeyField } from '@/app/components/tools/api-key-field'
import { ClassDiagramEditor } from '@/app/components/tools/class-diagram-editor'
import { createClient, DEFAULT_MODEL, describeError, supportsServerFallbacks } from '@/app/lib/byok'
import { EMPTY_DIAGRAM, diagramToSvg, diagramToText, isDiagram, type Diagram } from '@/app/lib/class-diagram'
import { LLD_PROBLEMS, type LldProblem } from '@/app/lib/lld-problems'
import { LLD_REVIEW_INSTRUCTIONS, buildLldPastePrompt, buildLldUserMessage } from '@/app/lib/lld-prompt'

/*
 * This component is loaded with ssr: false (see lld-practice-loader), so the
 * lazy useState initialisers below can read localStorage directly — there is
 * no server render to mismatch.
 */

const DRAFTS_KEY = 'lld-drafts'
const LAST_KEY = 'lld-last-problem'
const LANGUAGES = ['TypeScript', 'Java', 'Python', 'C++', 'Go', 'C#'] as const

type Draft = { notes: string; code: string; language: string; diagram: Diagram }
type Tab = 'notes' | 'diagram' | 'code'

const emptyDraft = (): Draft => ({ notes: '', code: '', language: 'TypeScript', diagram: EMPTY_DIAGRAM })

function loadDrafts(): Record<string, Draft> {
  try {
    const parsed = JSON.parse(localStorage.getItem(DRAFTS_KEY) ?? '{}')
    if (!parsed || typeof parsed !== 'object') return {}
    const out: Record<string, Draft> = {}
    for (const [slug, d] of Object.entries(parsed as Record<string, Partial<Draft>>)) {
      out[slug] = {
        notes: typeof d?.notes === 'string' ? d.notes : '',
        code: typeof d?.code === 'string' ? d.code : '',
        language: typeof d?.language === 'string' ? d.language : 'TypeScript',
        diagram: isDiagram(d?.diagram) ? d.diagram : EMPTY_DIAGRAM,
      }
    }
    return out
  } catch {
    return {}
  }
}

function initialProblem(): LldProblem {
  try {
    const slug = localStorage.getItem(LAST_KEY)
    return LLD_PROBLEMS.find((p) => p.slug === slug) ?? LLD_PROBLEMS[0]
  } catch {
    return LLD_PROBLEMS[0]
  }
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false // insecure context, permission denied, or no clipboard API
  }
}

/** Renders the exported SVG to a 2× PNG blob. */
function svgToPng(svg: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas not available'))
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Export failed'))), 'image/png')
    }
    img.onerror = () => reject(new Error('Could not render the diagram'))
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  })
}

/** Minimal, safe Markdown-ish rendering of the review: text nodes only, never HTML. */
function ReviewText({ text }: { text: string }) {
  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
      {text.split('\n').map((line, i) => {
        if (/^#{1,3}\s/.test(line)) {
          return (
            <h3 key={i} className="pt-2 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              {line.replace(/^#{1,3}\s/, '')}
            </h3>
          )
        }
        if (/^\s*[-*]\s/.test(line)) {
          return (
            <p key={i} className="pl-3 -indent-3">
              · {line.replace(/^\s*[-*]\s/, '').replace(/\*\*/g, '')}
            </p>
          )
        }
        if (!line.trim()) return null
        return <p key={i}>{line.replace(/\*\*/g, '')}</p>
      })}
    </div>
  )
}

export function LldPractice() {
  const [problem, setProblem] = useState<LldProblem>(initialProblem)
  const [drafts, setDrafts] = useState<Record<string, Draft>>(loadDrafts)
  const [tab, setTab] = useState<Tab>('notes')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [review, setReview] = useState('')
  const [status, setStatus] = useState<'idle' | 'thinking' | 'streaming' | 'done'>('idle')
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')
  const [manualCopy, setManualCopy] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const draft = drafts[problem.slug] ?? emptyDraft()

  // Persist drafts and the last-opened problem (writes only — no state set here).
  useEffect(() => {
    try {
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
      localStorage.setItem(LAST_KEY, problem.slug)
    } catch {
      // storage full or blocked — the draft still lives in memory
    }
  }, [drafts, problem.slug])

  useEffect(() => () => abortRef.current?.abort(), [])

  function updateDraft(patch: Partial<Draft>) {
    setDrafts((all) => ({ ...all, [problem.slug]: { ...(all[problem.slug] ?? emptyDraft()), ...patch } }))
  }

  function pickProblem(slug: string) {
    const next = LLD_PROBLEMS.find((p) => p.slug === slug)
    if (!next) return
    abortRef.current?.abort()
    setProblem(next)
    setReview('')
    setStatus('idle')
    setError('')
  }

  function showFlash(message: string) {
    setFlash(message)
    window.setTimeout(() => setFlash(''), 2500)
  }

  const answer = {
    notes: draft.notes,
    code: draft.code,
    language: draft.language,
    diagramText: diagramToText(draft.diagram),
  }
  const isEmpty = !draft.notes.trim() && !draft.code.trim() && draft.diagram.classes.length === 0

  async function copyPrompt(openClaude: boolean) {
    const prompt = buildLldPastePrompt(problem, answer)
    // Start the clipboard write while this page still has focus (browsers can
    // refuse it once a new tab takes focus), then open Claude within the same
    // click so popup blockers allow it.
    const copied = copyText(prompt)
    if (openClaude) window.open('https://claude.ai/new', '_blank', 'noopener,noreferrer')
    if (await copied) {
      setManualCopy(null)
      showFlash(openClaude ? 'Copied — paste it into the new Claude chat' : 'Copied to clipboard')
    } else {
      setManualCopy(prompt)
    }
  }

  async function exportPng(mode: 'copy' | 'download') {
    try {
      const blob = await svgToPng(diagramToSvg(draft.diagram))
      if (mode === 'copy' && typeof ClipboardItem !== 'undefined') {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
          return showFlash('Diagram image copied — paste it into Claude alongside the prompt')
        } catch {
          // fall through to a download
        }
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${problem.slug}-class-diagram.png`
      a.click()
      URL.revokeObjectURL(url)
      showFlash(mode === 'copy' ? 'Image copy not supported here — downloaded instead' : 'Diagram downloaded')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function runReview() {
    if (!apiKey) return setError('Add your API key in the panel above — or use “Copy & open Claude” instead.')
    if (isEmpty) return setError('Write some notes, draw a diagram, or add code first.')

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setReview('')
    setError('')
    setStatus('thinking')

    try {
      const client = await createClient(apiKey)
      const base = {
        model,
        max_tokens: 16000,
        system: LLD_REVIEW_INSTRUCTIONS,
        messages: [{ role: 'user' as const, content: buildLldUserMessage(problem, answer) }],
      }
      const stream = supportsServerFallbacks(model)
        ? client.beta.messages.stream(
            { ...base, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' },
            { signal: controller.signal }
          )
        : client.beta.messages.stream(base, { signal: controller.signal })

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const text = event.delta.text
          setStatus('streaming')
          setReview((r) => r + text)
        }
      }

      const final = await stream.finalMessage()
      if (final.stop_reason === 'refusal') {
        setError('The model declined to review this. Try rephrasing your notes, or use a different model.')
      } else if (final.stop_reason === 'max_tokens') {
        setError('The review was cut off at the length limit.')
      }
      setStatus('done')
    } catch (err) {
      if (controller.signal.aborted) {
        setStatus('idle')
        return
      }
      setError(describeError(err))
      setStatus('idle')
    }
  }

  const busy = status === 'thinking' || status === 'streaming'
  const tabClass = (t: Tab) =>
    [
      'rounded-md px-3 py-1.5 text-xs transition-colors',
      tab === t
        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100',
    ].join(' ')

  return (
    <div className="space-y-6">
      {/* problem */}
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <select
            value={problem.slug}
            onChange={(e) => pickProblem(e.target.value)}
            aria-label="Problem"
            className="rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-2.5 py-1.5 text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none"
          >
            {LLD_PROBLEMS.map((p) => (
              <option key={p.slug} value={p.slug} className="bg-white dark:bg-neutral-900">
                {p.title}
              </option>
            ))}
          </select>
          <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
            drafts save automatically in this browser
          </span>
        </div>
        <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">{problem.prompt}</p>
          <ul className="mt-3 space-y-1">
            {problem.requirements.map((r) => (
              <li key={r} className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                · {r}
              </li>
            ))}
          </ul>
          <details className="mt-3 text-xs">
            <summary className="cursor-pointer text-neutral-400 dark:text-neutral-500">Hints</summary>
            <ul className="mt-2 space-y-1">
              {problem.hints.map((h) => (
                <li key={h} className="text-neutral-600 dark:text-neutral-300">
                  · {h}
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>

      {/* answer */}
      <div>
        <div className="mb-2 flex gap-1" role="tablist">
          {(['notes', 'diagram', 'code'] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={tabClass(t)}>
              {t === 'notes' ? 'Notes' : t === 'diagram' ? `Diagram (${draft.diagram.classes.length})` : 'Code'}
            </button>
          ))}
        </div>

        {tab === 'notes' ? (
          <textarea
            value={draft.notes}
            onChange={(e) => updateDraft({ notes: e.target.value })}
            rows={14}
            aria-label="Design notes"
            placeholder={`Work through it like an interview:\n\n1. Clarify requirements and scope\n2. Core entities and what each is responsible for\n3. Relationships — who owns what\n4. Key flows (e.g. park → pay → leave)\n5. Where it should be easy to change, and how (interfaces, patterns)\n6. Edge cases and concurrency`}
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent p-3 font-mono text-xs leading-relaxed text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 focus:border-green-600 dark:focus:border-green-500 focus:outline-none"
          />
        ) : null}

        {tab === 'diagram' ? (
          <ClassDiagramEditor diagram={draft.diagram} onChange={(diagram) => updateDraft({ diagram })} />
        ) : null}

        {tab === 'code' ? (
          <div className="space-y-2">
            <select
              value={draft.language}
              onChange={(e) => updateDraft({ language: e.target.value })}
              aria-label="Language"
              className="rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-2 py-1 text-xs text-neutral-700 dark:text-neutral-200 focus:outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l} className="bg-white dark:bg-neutral-900">
                  {l}
                </option>
              ))}
            </select>
            <textarea
              value={draft.code}
              onChange={(e) => updateDraft({ code: e.target.value })}
              rows={16}
              spellCheck={false}
              aria-label="Code"
              placeholder={'interface PricingPolicy {\n  fee(ticket: Ticket, exit: Date): number\n}\n\nclass ParkingLot {\n  park(vehicle: Vehicle): Ticket { … }\n}'}
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent p-3 font-mono text-xs leading-relaxed text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 focus:border-green-600 dark:focus:border-green-500 focus:outline-none"
            />
          </div>
        ) : null}
      </div>

      {/* get feedback */}
      <div className="space-y-4 rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
        <div>
          <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-50">Get feedback from Claude</h2>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            Your notes, diagram and code are turned into one review prompt with a fixed rubric, so feedback is
            comparable between attempts.
          </p>
        </div>

        <div>
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Option 1 · in Claude, free with your Claude account
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyPrompt(true)}
              disabled={isEmpty}
              className="rounded-md bg-green-600 dark:bg-green-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              Copy &amp; open Claude
            </button>
            <button
              type="button"
              onClick={() => copyPrompt(false)}
              disabled={isEmpty}
              className="rounded-md border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-50 disabled:opacity-50 transition-colors"
            >
              Copy prompt
            </button>
            <button
              type="button"
              onClick={() => exportPng('copy')}
              disabled={draft.diagram.classes.length === 0}
              className="rounded-md border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-50 disabled:opacity-50 transition-colors"
            >
              Copy diagram image
            </button>
            <button
              type="button"
              onClick={() => exportPng('download')}
              disabled={draft.diagram.classes.length === 0}
              className="rounded-md px-2 py-1.5 text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-50 transition-colors"
            >
              Download PNG
            </button>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-400 dark:text-neutral-500">
            The prompt already contains the diagram as text, which Claude reads more reliably than a picture. The image
            is optional.
          </p>
          {flash ? <p className="mt-1.5 text-xs text-green-700 dark:text-green-400">{flash}</p> : null}
          {manualCopy !== null ? (
            <div className="mt-2">
              <p className="mb-1 text-xs text-amber-700 dark:text-amber-400">
                Couldn&apos;t copy automatically — select all of this and copy it:
              </p>
              <textarea
                readOnly
                value={manualCopy}
                rows={6}
                onFocus={(e) => e.currentTarget.select()}
                aria-label="Prompt to copy"
                className="w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent p-2 font-mono text-[10px] text-neutral-600 dark:text-neutral-300"
              />
            </div>
          ) : null}
        </div>

        <div>
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Option 2 · right here, with your own API key
          </div>
          <ApiKeyField apiKey={apiKey} onKeyChange={setApiKey} model={model} onModelChange={setModel} />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={runReview}
              disabled={busy}
              className="rounded-md border border-green-600 dark:border-green-500 px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-400 hover:bg-green-600/10 disabled:opacity-50 transition-colors"
            >
              {status === 'thinking' ? 'Thinking…' : status === 'streaming' ? 'Reviewing…' : 'Review here'}
            </button>
            {busy ? (
              <button
                type="button"
                onClick={() => abortRef.current?.abort()}
                className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              >
                Stop
              </button>
            ) : null}
          </div>
        </div>

        {error ? <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p> : null}

        {review ? (
          <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900 p-4">
            <ReviewText text={review} />
            {status === 'done' ? (
              <details className="mt-4 text-xs">
                <summary className="cursor-pointer text-neutral-400 dark:text-neutral-500">
                  What strong answers usually include
                </summary>
                <ul className="mt-2 space-y-1">
                  {problem.wouldExpect.map((item) => (
                    <li key={item} className="text-neutral-600 dark:text-neutral-300">
                      · {item}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
