import Link from 'next/link'
import { LldPracticeLoader } from '@/app/components/tools/lld-practice-loader'
import { baseUrl } from '@/app/sitemap'

export const metadata = {
  title: 'LLD Practice',
  description:
    'Practise low-level (object-oriented) design: write notes, draw a class diagram, sketch code, then get a rubric-based review from Claude — in claude.ai or right here with your own key.',
  alternates: { canonical: '/tools/lld' },
  openGraph: {
    title: 'LLD Practice',
    description:
      'Practise low-level design with a class-diagram editor and rubric-based reviews from Claude.',
    url: `${baseUrl}/tools/lld`,
    images: [{ url: `/og?title=${encodeURIComponent('LLD Practice')}` }],
  },
}

export default function Page() {
  return (
    <section>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        LLD practice
      </h1>
      <p className="mb-6 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        Low-level design interviews ask you to turn a problem into classes,
        responsibilities and relationships. Pick a problem, think it through in
        notes, draw the class diagram, and sketch the key code — then get it
        reviewed against the same six-part rubric every time. Everything stays in
        your browser. Background reading:{' '}
        <Link href="/blog/lru-cache-from-scratch" className="text-green-600 dark:text-green-400 hover:underline">
          building an LRU cache
        </Link>{' '}
        and{' '}
        <Link href="/blog/rate-limiting-algorithms" className="text-green-600 dark:text-green-400 hover:underline">
          rate-limiting algorithms
        </Link>
        .
      </p>

      <LldPracticeLoader />
    </section>
  )
}
