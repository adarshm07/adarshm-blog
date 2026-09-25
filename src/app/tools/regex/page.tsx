import Link from 'next/link'
import { RegexSafetyChecker } from '@/app/components/tools/regex-safety-checker'
import { baseUrl } from '@/app/sitemap'

export const metadata = {
  title: 'Regex Backtracking Checker',
  description:
    'Time a regular expression against inputs of growing length to find catastrophic backtracking before it reaches production.',
  alternates: { canonical: '/tools/regex' },
  openGraph: {
    title: 'Regex Backtracking Checker',
    description:
      'Time a regular expression against inputs of growing length to find catastrophic backtracking.',
    url: `${baseUrl}/tools/regex`,
    images: [{ url: `/og?title=${encodeURIComponent('Regex Checker')}` }],
  },
}

export default function Page() {
  return (
    <section>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        Regex backtracking checker
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        A pattern with nested quantifiers can take exponential time on an input
        that nearly matches — a twenty-character string is enough to pin a CPU.
        This times yours as the input grows. The matching happens in a worker, so
        a catastrophic pattern gets terminated instead of freezing this page.{' '}
        <Link
          href="/blog/regex-backtracking-and-redos"
          className="text-green-600 dark:text-green-400 hover:underline"
        >
          How it works
        </Link>
        .
      </p>

      <RegexSafetyChecker />
    </section>
  )
}
