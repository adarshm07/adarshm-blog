import type { SearchDoc } from '@/app/lib/search-index'

export type SearchHit = {
  doc: SearchDoc
  score: number
  /** The heading that matched, when the match came from inside the article. */
  matchedHeading?: string
  /** A sentence-ish window around a body match, for context in the results. */
  snippet?: string
}

// Lower-casing every body on every keystroke is wasteful; do it once per doc.
const lowerBodies = new Map<string, string>()

function lowerBody(doc: SearchDoc) {
  let cached = lowerBodies.get(doc.id)
  if (cached === undefined) {
    cached = doc.body.toLowerCase()
    lowerBodies.set(doc.id, cached)
  }
  return cached
}

function makeSnippet(body: string, at: number, termLength: number) {
  const start = Math.max(0, at - 55)
  const end = Math.min(body.length, at + termLength + 85)
  const head = start > 0 ? '…' : ''
  const tail = end < body.length ? '…' : ''
  // trim to whole words so the snippet does not start mid-syllable
  const slice = body
    .slice(start, end)
    .replace(/^\S*\s/, start > 0 ? '' : '$&')
    .replace(/\s\S*$/, end < body.length ? '' : '$&')
  return `${head}${slice.trim()}${tail}`
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#*\s]/g, ' ')

/**
 * Characters of `term` appear in order in `text` — catches "evtloop" → "event
 * loop". The span is capped so the characters have to be close together:
 * without that, a long term matches almost any long title by accident.
 */
function subsequenceMatch(text: string, term: string) {
  const maxSpan = Math.ceil(term.length * 2.5)

  // Try every possible starting point and keep the tightest match: starting
  // greedily at the first matching character finds a needlessly wide span
  // ("evtloop" would start at the "e" of "the" instead of "event").
  for (let start = 0; start < text.length; start++) {
    if (text[start] !== term[0]) continue
    let i = 1
    for (let pos = start + 1; pos < text.length && i < term.length; pos++) {
      if (text[pos] === term[i]) i++
      if (i === term.length) return pos - start + 1 <= maxSpan
      if (pos - start + 1 > maxSpan) break
    }
  }
  return false
}

function scoreTerm(
  doc: SearchDoc,
  term: string
): { score: number; matchedHeading?: string; snippet?: string } | null {
  const title = normalize(doc.title)
  const summary = normalize(doc.summary)
  const meta = doc.meta.map(normalize)

  if (title.startsWith(term)) return { score: 16 }
  if (new RegExp(`\\b${escapeRegExp(term)}`).test(title)) return { score: 12 }
  if (title.includes(term)) return { score: 9 }
  if (meta.some((m) => m.includes(term))) return { score: 7 }

  const heading = doc.headings.find((h) => normalize(h).includes(term))
  if (heading) return { score: 5, matchedHeading: heading }

  if (summary.includes(term)) return { score: 3 }

  const bodyIndex = lowerBody(doc).indexOf(term)
  if (bodyIndex !== -1) {
    return { score: 2, snippet: makeSnippet(doc.body, bodyIndex, term.length) }
  }

  if (term.length >= 3 && term.length <= 14 && subsequenceMatch(title, term))
    return { score: 1.5 }

  return null
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const KIND_BONUS: Record<SearchDoc['kind'], number> = {
  post: 1,
  question: 0.5,
  page: 0.75,
}

export function searchDocs(docs: SearchDoc[], query: string, limit = 8): SearchHit[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return []

  const hits: SearchHit[] = []

  for (const doc of docs) {
    let total = 0
    let matchedHeading: string | undefined
    let snippet: string | undefined

    for (const term of terms) {
      const result = scoreTerm(doc, term)
      if (!result) {
        total = -1 // every term must match somewhere
        break
      }
      total += result.score
      matchedHeading ??= result.matchedHeading
      snippet ??= result.snippet
    }

    if (total > 0) {
      hits.push({ doc, score: total + KIND_BONUS[doc.kind], matchedHeading, snippet })
    }
  }

  return hits
    .sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title))
    .slice(0, limit)
}

/** Split `text` into segments so matched runs can be highlighted. */
export function highlight(text: string, query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return [{ text, match: false }]

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi')
  return text
    .split(pattern)
    .filter(Boolean)
    // split() with a capture group yields the matched runs verbatim, so a set
    // membership test is enough — and avoids the stateful lastIndex of /g regexes
    .map((part) => ({ text: part, match: terms.includes(part.toLowerCase()) }))
}
