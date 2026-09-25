'use client'

/**
 * Local-only DSA progress, in two tracks: articles read on the learning path,
 * and practice questions solved. Stored per browser — nothing is sent
 * anywhere, and clearing site data clears it.
 *
 * v1 stored a bare array of slugs. v2 keeps the date each item was completed
 * so the dashboard can show recent activity, and migrates v1 transparently on
 * read, so existing progress survives.
 */

export const PATH_KEY = 'dsa-path-progress'
export const QUESTIONS_KEY = 'dsa-patterns-progress'
const CHANGE_EVENT = 'dsa-progress-change'

export type Progress = Record<string, string> // slug → ISO date (YYYY-MM-DD)

export const today = () => new Date().toISOString().slice(0, 10)

function migrate(parsed: unknown): Progress {
  if (Array.isArray(parsed)) {
    const date = today()
    return Object.fromEntries(
      parsed.filter((s): s is string => typeof s === 'string').map((s) => [s, date])
    )
  }
  if (parsed && typeof parsed === 'object') {
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(
        ([, v]) => typeof v === 'string'
      ) as [string, string][]
    )
  }
  return {}
}

export function createProgressStore(key: string) {
  function load(): Progress {
    try {
      const raw = localStorage.getItem(key)
      return raw ? migrate(JSON.parse(raw)) : {}
    } catch {
      return {} // private mode, blocked storage, or corrupt JSON
    }
  }

  function save(progress: Progress) {
    try {
      if (Object.keys(progress).length === 0) localStorage.removeItem(key)
      else localStorage.setItem(key, JSON.stringify(progress))
    } catch {
      // storage unavailable — the UI still reflects this session
    }
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
  }

  return {
    key,
    load,
    save,
    toggle(slug: string) {
      const progress = load()
      if (progress[slug]) delete progress[slug]
      else progress[slug] = today()
      save(progress)
      return progress
    },
    /** Clear only the slugs this view owns, so one reset cannot wipe the other track. */
    clear(slugs?: string[]) {
      if (!slugs) return save({})
      const progress = load()
      slugs.forEach((slug) => delete progress[slug])
      save(progress)
    },
  }
}

export const pathProgress = createProgressStore(PATH_KEY)
export const questionProgress = createProgressStore(QUESTIONS_KEY)

/** Subscribe to changes from this tab and from other tabs. */
export function onProgressChange(handler: () => void) {
  window.addEventListener(CHANGE_EVENT, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler)
    window.removeEventListener('storage', handler)
  }
}
