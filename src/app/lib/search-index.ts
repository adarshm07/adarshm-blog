import { getBlogPosts } from '@/app/blog/utils'
import { getPatternQuestions } from '@/app/dsa/patterns/utils'

export type SearchDoc = {
  id: string
  kind: 'post' | 'question' | 'page'
  title: string
  href: string
  summary: string
  /** Tags for posts, pattern name + difficulty for questions. */
  meta: string[]
  /** Section headings, so a search can land on a topic inside a long post. */
  headings: string[]
  /** Prose with code blocks and markup stripped, for full-text matching. */
  body: string
  date?: string
}

/**
 * Strip everything that is markup rather than prose: frontmatter is already
 * gone by this point, but code fences, JSX visualizers, and markdown syntax
 * would otherwise pollute matches and bloat the index.
 */
function toPlainText(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[`*_>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractHeadings(content: string) {
  return Array.from(content.matchAll(/^#{2,3}\s+(.+)$/gm))
    .map((m) =>
      m[1]
        .replace(/[`*_]/g, '')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .trim()
    )
    .filter(Boolean)
}

const STATIC_PAGES: SearchDoc[] = [
  {
    id: 'page:dsa',
    kind: 'page',
    title: 'DSA learning path',
    href: '/dsa',
    summary:
      'A structured, ordered route through the data structures and algorithms articles, from recursion to dynamic programming.',
    meta: ['DSA', 'curriculum'],
    headings: [],
    body: '',
  },
  {
    id: 'page:patterns',
    kind: 'page',
    title: 'DSA practice by pattern',
    href: '/dsa/patterns',
    summary:
      'Practice questions grouped by the pattern that solves them — two pointers, sliding window, binary search, graphs, and more.',
    meta: ['DSA', 'practice', 'questions'],
    headings: [],
    body: '',
  },
]

/** Built once at build time and shipped to the client for instant local search. */
export function getSearchIndex(): SearchDoc[] {
  const posts: SearchDoc[] = getBlogPosts().map((post) => ({
    id: `post:${post.slug}`,
    kind: 'post',
    title: post.metadata.title,
    href: `/blog/${post.slug}`,
    summary: post.metadata.summary,
    meta: post.metadata.tags ?? [],
    headings: extractHeadings(post.content),
    body: toPlainText(post.content),
    date: post.metadata.publishedAt,
  }))

  const questions: SearchDoc[] = getPatternQuestions().map((question) => ({
    id: `question:${question.slug}`,
    kind: 'question',
    title: question.metadata.title,
    href: `/dsa/patterns/${question.slug}`,
    summary: question.metadata.summary,
    meta: [question.metadata.pattern, question.metadata.difficulty],
    headings: [],
    body: toPlainText(question.content),
  }))

  posts.sort((a, b) => (a.date! < b.date! ? 1 : -1))

  return [...posts, ...questions, ...STATIC_PAGES]
}
