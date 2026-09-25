'use client'

import { useEffect, useState } from 'react'
import { clearKey, loadKey, MODELS, saveKey, type KeyScope } from '@/app/lib/byok'

export function ApiKeyField({
  apiKey,
  onKeyChange,
  model,
  onModelChange,
}: {
  apiKey: string
  onKeyChange: (key: string) => void
  model: string
  onModelChange: (model: string) => void
}) {
  const [scope, setScope] = useState<KeyScope>('session')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = loadKey()
    if (stored) {
      onKeyChange(stored.key)
      setScope(stored.scope)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function update(next: string, nextScope: KeyScope = scope) {
    onKeyChange(next)
    setScope(nextScope)
    saveKey(next, nextScope)
  }

  return (
    <details className="rounded-xl border border-neutral-100 dark:border-neutral-800 px-4 py-3">
      <summary className="cursor-pointer text-sm text-neutral-600 dark:text-neutral-300">
        API key{' '}
        <span className="text-neutral-400 dark:text-neutral-500">
          — {apiKey ? 'set for this ' + (scope === 'device' ? 'device' : 'tab') : 'not set'}
        </span>
      </summary>

      <div className="mt-3 space-y-3">
        <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          This tool calls the Claude API <strong>from your browser with your own
          key</strong>. The key is never sent to this site, stored on any server,
          or logged — it goes straight to api.anthropic.com. It is held in this
          tab&apos;s session storage unless you ask to keep it. Use a key you can
          rotate, and clear it when you&apos;re done.
        </p>

        <div className="flex gap-2">
          <input
            type={visible ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => update(e.target.value.trim())}
            placeholder="sk-ant-..."
            spellCheck={false}
            autoComplete="off"
            className="flex-1 rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-2.5 py-1.5 font-mono text-xs text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400 focus:border-green-600 dark:focus:border-green-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="rounded-md border border-neutral-200 dark:border-neutral-700 px-2.5 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
          >
            {visible ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <label className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
            <input
              type="checkbox"
              checked={scope === 'device'}
              onChange={(e) => update(apiKey, e.target.checked ? 'device' : 'session')}
              className="accent-green-600"
            />
            Keep on this device
          </label>

          <label className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
            Model
            <select
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              className="rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-1.5 py-1 text-xs text-neutral-700 dark:text-neutral-200 focus:outline-none"
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-white dark:bg-neutral-900">
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          {apiKey && (
            <button
              type="button"
              onClick={() => {
                clearKey()
                onKeyChange('')
              }}
              className="ml-auto text-neutral-400 dark:text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              Clear key
            </button>
          )}
        </div>
      </div>
    </details>
  )
}
