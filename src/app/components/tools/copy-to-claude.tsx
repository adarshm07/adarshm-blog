'use client'

import { useState } from 'react'
import { copyText, exportPng } from '@/app/lib/clipboard-export'

/**
 * "Option 1" of the practice tools: copy a self-contained review prompt and
 * open claude.ai, plus copy or download the diagram as an image. Free with a
 * Claude account — no API key, nothing sent from this site.
 */
export function CopyToClaude({
  getPrompt,
  getSvg,
  filename,
  disabled,
}: {
  getPrompt: () => string
  /** null when there is no diagram to export */
  getSvg: (() => string) | null
  filename: string
  disabled: boolean
}) {
  const [flash, setFlash] = useState('')
  const [error, setError] = useState('')
  const [manualCopy, setManualCopy] = useState<string | null>(null)

  function showFlash(message: string) {
    setError('')
    setFlash(message)
    window.setTimeout(() => setFlash(''), 2500)
  }

  async function copyPrompt(openClaude: boolean) {
    const prompt = getPrompt()
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

  async function image(mode: 'copy' | 'download') {
    if (!getSvg) return
    try {
      const result = await exportPng(getSvg(), filename, mode)
      if (result === 'copied') showFlash('Diagram image copied — paste it into Claude alongside the prompt')
      else showFlash(mode === 'copy' ? 'Image copy not supported here — downloaded instead' : 'Diagram downloaded')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div>
      <div className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
        Option 1 · in Claude, free with your Claude account
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => copyPrompt(true)}
          disabled={disabled}
          className="rounded-md bg-green-600 dark:bg-green-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 transition-colors"
        >
          Copy &amp; open Claude
        </button>
        <button
          type="button"
          onClick={() => copyPrompt(false)}
          disabled={disabled}
          className="rounded-md border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-50 disabled:opacity-50 transition-colors"
        >
          Copy prompt
        </button>
        <button
          type="button"
          onClick={() => image('copy')}
          disabled={!getSvg}
          className="rounded-md border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-50 disabled:opacity-50 transition-colors"
        >
          Copy diagram image
        </button>
        <button
          type="button"
          onClick={() => image('download')}
          disabled={!getSvg}
          className="rounded-md px-2 py-1.5 text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-50 transition-colors"
        >
          Download PNG
        </button>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-400 dark:text-neutral-500">
        The prompt already contains the diagram as text, which Claude reads more reliably than a picture. The image is
        optional.
      </p>
      {flash ? <p className="mt-1.5 text-xs text-green-700 dark:text-green-400">{flash}</p> : null}
      {error ? <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{error}</p> : null}
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
  )
}
