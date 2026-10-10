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

const READING: [string, string][] = [
  ['/blog/solid-principles', 'SOLID'],
  ['/blog/strategy-pattern', 'Strategy'],
  ['/blog/state-pattern-and-state-machines', 'State'],
  ['/blog/observer-pattern', 'Observer'],
  ['/blog/composition-over-inheritance', 'composition over inheritance'],
  ['/blog/lru-cache-from-scratch', 'building an LRU cache'],
]

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
        {READING.map(([href, label], i) => (
          <span key={href}>
            {i > 0 ? (i === READING.length - 1 ? ' and ' : ', ') : null}
            <Link href={href} className="text-green-600 dark:text-green-400 hover:underline">
              {label}
            </Link>
          </span>
        ))}
        .
      </p>

      <LldPracticeLoader />
    </section>
  )
}
