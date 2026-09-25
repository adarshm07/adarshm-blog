import { CapacityCalculator } from '@/app/components/tools/capacity-calculator'
import { baseUrl } from '@/app/sitemap'

export const metadata = {
  title: 'Back-of-the-Envelope Calculator',
  description:
    'Turn daily active users and payload size into QPS, storage, bandwidth, and cache size — the sizing numbers a system design needs.',
  alternates: { canonical: '/tools/capacity' },
  openGraph: {
    title: 'Back-of-the-Envelope Calculator',
    description: 'Turn daily actives and payload size into QPS, storage, bandwidth, and cache size.',
    url: `${baseUrl}/tools/capacity`,
    images: [{ url: `/og?title=${encodeURIComponent('Capacity Calculator')}` }],
  },
}

export default function Page() {
  return (
    <section>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        Back-of-the-envelope
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        Sizing is the part of a design interview people skip, and it is the part
        that decides every later answer. Put the scale in, and the numbers that
        follow tell you which component breaks first.
      </p>

      <CapacityCalculator />
    </section>
  )
}
