import Link from 'next/link'
import {
  DsaProgressDashboard,
  type ArticleMeta,
  type QuestionMeta,
} from '@/app/components/dsa-progress-dashboard'
import { getBlogPosts } from '@/app/blog/utils'
import { curriculum } from '@/app/dsa/curriculum'
import { patterns } from '@/app/dsa/patterns/patterns'
import { getPatternQuestions } from '@/app/dsa/patterns/utils'
import { baseUrl } from '@/app/sitemap'

export const metadata = {
  title: 'DSA Progress',
  description:
    'Track how far you are through the DSA learning path and the pattern-wise practice set. Progress is stored in your browser.',
  alternates: { canonical: '/dsa/progress' },
  openGraph: {
    title: 'DSA Progress',
    description:
      'Track how far you are through the DSA learning path and the pattern-wise practice set.',
    url: `${baseUrl}/dsa/progress`,
    images: [{ url: `/og?title=${encodeURIComponent('DSA Progress')}` }],
  },
}

export default function Page() {
  const patternName = new Map(patterns.map((p) => [p.slug, p.name]))

  const questions: QuestionMeta[] = getPatternQuestions().map((question) => ({
    slug: question.slug,
    title: question.metadata.title,
    pattern: question.metadata.pattern,
    patternName: patternName.get(question.metadata.pattern) ?? question.metadata.pattern,
    difficulty: question.metadata.difficulty,
  }))

  const posts = new Map(getBlogPosts().map((post) => [post.slug, post.metadata.title]))

  const articles: ArticleMeta[] = curriculum.flatMap((phase) =>
    phase.entries
      .filter((entry) => entry.slug)
      .map((entry) => ({
        slug: entry.slug!,
        title: posts.get(entry.slug!) ?? entry.slug!,
        phase: phase.title,
      }))
  )

  return (
    <section>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        Progress
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        Everything you have marked complete on the{' '}
        <Link
          href="/dsa"
          className="text-green-600 dark:text-green-400 hover:underline"
        >
          learning path
        </Link>{' '}
        and in the{' '}
        <Link
          href="/dsa/patterns"
          className="text-green-600 dark:text-green-400 hover:underline"
        >
          practice set
        </Link>
        , in one place. It lives in this browser&apos;s local storage — no
        account, nothing sent anywhere, and it will not follow you to another
        device.
      </p>

      <DsaProgressDashboard questions={questions} articles={articles} />
    </section>
  )
}
