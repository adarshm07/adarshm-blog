import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CustomMDX } from '@/app/components/mdx'
import { QuestionSolvedButton } from '@/app/components/question-solved-button'
import { baseUrl } from '@/app/sitemap'
import { patterns } from '../patterns'
import { getPatternQuestions, type QuestionDifficulty } from '../utils'

const difficultyStyles: Record<QuestionDifficulty, string> = {
  Easy: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/60',
  Medium:
    'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60',
  Hard: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60',
}

export async function generateStaticParams() {
  return getPatternQuestions().map((question) => ({ slug: question.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const question = getPatternQuestions().find((q) => q.slug === slug)
  if (!question) return

  const { title, summary: description } = question.metadata
  const ogImage = `${baseUrl}/og?title=${encodeURIComponent(title)}`

  return {
    title,
    description,
    alternates: {
      canonical: `/dsa/patterns/${question.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/dsa/patterns/${question.slug}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function Question({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const questions = getPatternQuestions()
  const question = questions.find((q) => q.slug === slug)

  if (!question) notFound()

  const pattern = patterns.find((p) => p.slug === question.metadata.pattern)
  const siblings = questions.filter(
    (q) => q.metadata.pattern === question.metadata.pattern
  )
  const index = siblings.findIndex((q) => q.slug === slug)
  const prev = index > 0 ? siblings[index - 1] : undefined
  const next = index < siblings.length - 1 ? siblings[index + 1] : undefined

  return (
    <section>
      <div className="mb-10 pb-8 border-b border-neutral-100 dark:border-neutral-800">
        <Link
          href={`/dsa/patterns#${question.metadata.pattern}`}
          className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        >
          ← DSA Patterns{pattern ? ` / ${pattern.name}` : ''}
        </Link>
        <h1 className="title mt-3 font-semibold text-2xl tracking-tight text-neutral-900 dark:text-neutral-50 mb-3">
          {question.metadata.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={[
              'rounded px-1.5 py-0.5 text-[10px] font-medium',
              difficultyStyles[question.metadata.difficulty],
            ].join(' ')}
          >
            {question.metadata.difficulty}
          </span>
          {question.metadata.leetcode && (
            <a
              href={question.metadata.leetcode}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              Solve on LeetCode ↗
            </a>
          )}
          {question.metadata.gfg && (
            <a
              href={question.metadata.gfg}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              Solve on GFG ↗
            </a>
          )}
          <QuestionSolvedButton slug={question.slug} />
        </div>
      </div>

      <article className="prose">
        {/* blockJS: false lets trusted repo-authored MDX pass object props
            (e.g. <Table data={...}>); blockDangerousJS stays on by default */}
        <CustomMDX source={question.content} options={{ blockJS: false }} />
      </article>

      <nav className="mt-12 flex items-start justify-between gap-4 border-t border-neutral-100 dark:border-neutral-800 pt-6 text-sm">
        {prev ? (
          <Link
            href={`/dsa/patterns/${prev.slug}`}
            className="text-neutral-500 dark:text-neutral-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            ← {prev.metadata.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/dsa/patterns/${next.slug}`}
            className="text-right text-neutral-500 dark:text-neutral-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            {next.metadata.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </section>
  )
}
