import Link from 'next/link'
import {
  PatternQuestionList,
  type PatternGroup,
} from '@/app/components/pattern-question-list'
import { baseUrl } from '@/app/sitemap'
import { patterns } from './patterns'
import { getPatternQuestions } from './utils'

export const metadata = {
  title: 'DSA Patterns',
  description:
    'Pattern-wise DSA practice questions with LeetCode and GFG links — each solved question explained with examples, multiple approaches, and a step-by-step dry run.',
  openGraph: {
    title: 'DSA Patterns',
    description:
      'Pattern-wise DSA practice questions with LeetCode and GFG links, multiple approaches, and dry runs.',
    url: `${baseUrl}/dsa/patterns`,
    images: [{ url: `/og?title=${encodeURIComponent('DSA Patterns')}` }],
  },
}

export default function Page() {
  const questions = getPatternQuestions()

  const groups: PatternGroup[] = patterns.map((pattern) => ({
    slug: pattern.slug,
    name: pattern.name,
    description: pattern.description,
    spotIt: pattern.spotIt,
    questions: questions
      .filter((q) => q.metadata.pattern === pattern.slug)
      .map((q) => ({
        slug: q.slug,
        title: q.metadata.title,
        difficulty: q.metadata.difficulty,
        summary: q.metadata.summary,
        leetcode: q.metadata.leetcode,
        gfg: q.metadata.gfg,
      })),
    practice: pattern.practice,
  }))

  return (
    <section>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        DSA Patterns
      </h1>
      <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
        Most interview questions are variations of a small set of patterns.
        Each pattern below has fully worked questions — the problem explained
        with an example, more than one approach, and a dry run of the solution
        — plus extra practice links on LeetCode and GeeksforGeeks.
      </p>
      <p className="mb-8 text-sm text-neutral-500 dark:text-neutral-400">
        Reading up on the concepts first? Follow the{' '}
        <Link
          href="/dsa"
          className="text-green-600 dark:text-green-400 hover:underline underline-offset-2"
        >
          Learn DSA path
        </Link>{' '}
        — it covers the theory behind these patterns in order.
      </p>
      <PatternQuestionList groups={groups} />
    </section>
  )
}
