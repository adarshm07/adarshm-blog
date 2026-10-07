import { isValidElement, type ReactNode } from 'react'
import { getBlogPosts } from '@/app/blog/utils'
import { getPatternQuestions } from '@/app/dsa/patterns/utils'
import type { Guide } from '@/app/learn/guide'
import { aiGuide } from '@/app/learn/guides/ai'
import { javascriptGuide } from '@/app/learn/guides/javascript'
import { webGuide } from '@/app/learn/guides/web'

export type SearchDoc = {
  id: string
  kind: 'post' | 'question' | 'page' | 'guide'
  title: string
  href: string
  summary: string
  /** Tags for posts, pattern name + difficulty for questions, guide + part for chapters. */
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

/**
 * Guide chapter bodies are JSX (text plus inline <C> code), so walk the element
 * tree and keep only the text — no rendering needed, just props.children.
 */
function nodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (isValidElement(node)) {
    return nodeText((node.props as { children?: ReactNode }).children)
  }
  return ''
}

function guideDocs(guide: Guide): SearchDoc[] {
  const overview: SearchDoc = {
    id: `guide:${guide.slug}`,
    kind: 'guide',
    title: guide.title,
    href: `/learn/${guide.slug}`,
    summary: guide.description,
    meta: ['guide'],
    headings: guide.parts.map((part) => part.title),
    body: '',
  }
  const chapters = guide.parts.flatMap((part) =>
    part.chapters.map(
      (chapter): SearchDoc => ({
        id: `guide:${guide.slug}/${chapter.id}`,
        kind: 'guide',
        title: chapter.title,
        href: `/learn/${guide.slug}#${chapter.id}`,
        summary: chapter.keyIdea,
        meta: [guide.title, part.title],
        headings: [],
        body: nodeText(chapter.body).replace(/\s+/g, ' ').trim(),
      })
    )
  )
  return [overview, ...chapters]
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

  const guides = [webGuide, javascriptGuide, aiGuide].flatMap(guideDocs)

  return [...posts, ...guides, ...questions, ...STATIC_PAGES]
}
