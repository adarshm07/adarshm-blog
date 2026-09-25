'use client'

/**
 * Bring-your-own-key storage for the AI tools.
 *
 * The key is the visitor's own and is only ever sent to api.anthropic.com,
 * directly from their browser. Default storage is sessionStorage, so it is
 * gone when the tab closes; persisting to localStorage is opt-in.
 */

const KEY = 'anthropic-api-key'

export type KeyScope = 'session' | 'device'

export function loadKey(): { key: string; scope: KeyScope } | null {
  try {
    const persisted = localStorage.getItem(KEY)
    if (persisted) return { key: persisted, scope: 'device' }
    const session = sessionStorage.getItem(KEY)
    if (session) return { key: session, scope: 'session' }
  } catch {
    // storage blocked — the key simply is not remembered
  }
  return null
}

export function saveKey(key: string, scope: KeyScope) {
  try {
    sessionStorage.removeItem(KEY)
    localStorage.removeItem(KEY)
    if (!key) return
    ;(scope === 'device' ? localStorage : sessionStorage).setItem(KEY, key)
  } catch {
    // storage blocked — the key still works for this page view
  }
}

export function clearKey() {
  saveKey('', 'session')
}

export const MODELS = [
  { id: 'claude-opus-5', label: 'Opus 5 — most capable' },
  { id: 'claude-sonnet-5', label: 'Sonnet 5 — faster, cheaper' },
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5 — cheapest' },
] as const

/**
 * The SDK is loaded on demand so it never lands in the initial bundle, and
 * dangerouslyAllowBrowser is required because this runs client-side with the
 * visitor's own key.
 */
export async function createClient(apiKey: string) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
}

export function describeError(err: unknown): string {
  const e = err as { status?: number; message?: string }
  if (e?.status === 401) return 'That key was rejected (401). Check it and try again.'
  if (e?.status === 429) return 'Rate limited (429). Wait a moment and retry.'
  if (e?.status === 400) return `Bad request: ${e.message ?? 'unknown'}`
  if (e?.status && e.status >= 500) return 'The API returned a server error. Try again shortly.'
  if (!e?.status) {
    return 'Could not reach api.anthropic.com. Check your connection, and any extension or network policy that blocks it.'
  }
  return e?.message ?? 'Something went wrong.'
}
