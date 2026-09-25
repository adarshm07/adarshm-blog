import Link from 'next/link'
import { baseUrl } from '@/app/sitemap'

export const metadata = {
  title: 'Tools',
  description:
    'Small tools for practising system design, sizing a system, and checking a regex for catastrophic backtracking. They run in your browser.',
  alternates: { canonical: '/tools' },
  openGraph: {
    title: 'Tools',
    description:
      'Small tools for practising system design, sizing a system, and checking a regex for catastrophic backtracking.',
    url: `${baseUrl}/tools`,
    images: [{ url: `/og?title=${encodeURIComponent('Tools')}` }],
  },
}

const TOOLS = [
  {
    href: '/tools/system-design',
    name: 'System design practice',
    description:
      'Answer a real design prompt, then have Claude grade it against a six-part rubric — scores, gaps, and the questions an interviewer would ask next.',
    note: 'Needs your own API key',
  },
  {
    href: '/tools/capacity',
    name: 'Back-of-the-envelope calculator',
    description:
      'Turn daily actives and payload size into QPS, storage, bandwidth, and cache size. The numbers that should drive a design, with latencies worth memorising.',
    note: 'Runs offline',
  },
  {
    href: '/tools/regex',
    name: 'Regex backtracking checker',
    description:
      'Time a pattern against inputs of growing length to see whether it degrades exponentially. Runs in a worker, so a catastrophic pattern cannot freeze the page.',
    note: 'Runs offline',
  },
]

export default function Page() {
  return (
    <section>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        Tools
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        Small things I wanted while writing the articles. Everything runs in your
        browser — there is no backend here, nothing is uploaded, and nothing is
        logged.
      </p>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group -mx-3 block rounded-lg px-3 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {tool.name}
              </span>
              <span className="shrink-0 font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                {tool.note}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
