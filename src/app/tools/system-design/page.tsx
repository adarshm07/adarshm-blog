import Link from 'next/link'
import { SystemDesignPracticeLoader } from '@/app/components/tools/system-design-practice-loader'
import { baseUrl } from '@/app/sitemap'

export const metadata = {
  title: 'System Design Practice',
  description:
    'Answer a system design prompt, draw the architecture, and have Claude grade it against a six-part rubric — requirements, estimation, API, architecture, scaling, and trade-offs.',
  alternates: { canonical: '/tools/system-design' },
  openGraph: {
    title: 'System Design Practice',
    description:
      'Answer a system design prompt and have Claude grade it against a six-part rubric.',
    url: `${baseUrl}/tools/system-design`,
    images: [{ url: `/og?title=${encodeURIComponent('System Design Practice')}` }],
  },
}

export default function Page() {
  return (
    <section>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        System design practice
      </h1>
      <p className="mb-6 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        Pick a prompt, write the design the way you would at a whiteboard, draw
        the architecture, and get it graded against the same six dimensions every
        time — so scores are comparable across attempts. Copy the whole thing,
        diagram included, into Claude for free, or grade it right here with{' '}
        <strong className="font-medium text-neutral-700 dark:text-neutral-200">
          your own Claude API key
        </strong>
        . Background reading:{' '}
        <Link
          href="/blog?tag=System+Design"
          className="text-green-600 dark:text-green-400 hover:underline"
        >
          the system design posts
        </Link>
        .
      </p>

      <SystemDesignPracticeLoader />
    </section>
  )
}
