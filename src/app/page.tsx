import { Suspense } from 'react'
import Link from 'next/link'
import { BlogPosts } from '@/app/components/posts'
import { Profile } from '@/app/components/profile'
import { getAllTags, getBlogPosts, getSortedPosts } from '@/app/blog/utils'
import { getPatternQuestions } from '@/app/dsa/patterns/utils'
import { baseUrl } from '@/app/sitemap'

export default function Page() {
  const posts = getBlogPosts()
  const questions = getPatternQuestions()
  const tags = getAllTags().map((tag) => ({
    name: tag,
    count: getSortedPosts(tag).length,
  }))

  const destinations = [
    {
      href: '/blog',
      name: 'Writing',
      count: `${posts.length} articles`,
      description: 'Explanations built around an animation you can step through.',
    },
    {
      href: '/dsa',
      name: 'DSA path',
      count: `${questions.length} questions`,
      description: 'An ordered route through the algorithms, with practice by pattern.',
    },
    {
      href: '/tools',
      name: 'Tools',
      count: '3 tools',
      description: 'Design practice, capacity sizing, and a regex safety check.',
    },
  ]

  return (
    <section className="space-y-14">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebSite',
                name: 'adarshm.com',
                url: baseUrl,
                description:
                  'Adarsh M. — JavaScript developer writing about the web.',
                author: { '@id': `${baseUrl}/#person` },
              },
              {
                '@type': 'Person',
                '@id': `${baseUrl}/#person`,
                name: 'Adarsh M.',
                url: baseUrl,
                jobTitle: 'Software Engineer',
                sameAs: [
                  'https://github.com/adarshm07',
                  'https://x.com/adarshm07',
                  'https://www.linkedin.com/in/adarshm07/',
                ],
              },
            ],
          }),
        }}
      />
      <Suspense fallback={<ProfileSkeleton />}>
        <Profile />
      </Suspense>

      <div className="grid gap-3 sm:grid-cols-3">
        {destinations.map((destination) => (
          <Link
            key={destination.href}
            href={destination.href}
            className="group rounded-xl border border-neutral-100 dark:border-neutral-800 px-4 py-3.5 hover:border-green-600/40 dark:hover:border-green-500/40 transition-colors"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {destination.name}
              </span>
              <span className="shrink-0 font-mono text-[10px] tabular-nums text-neutral-400 dark:text-neutral-500">
                {destination.count}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              {destination.description}
            </p>
          </Link>
        ))}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Latest
          </h2>
          <Link
            href="/blog"
            className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            All {posts.length} →
          </Link>
        </div>
        <BlogPosts limit={4} showSummary />
      </div>

      <div>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Topics
        </h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.name}
              href={`/blog?tag=${encodeURIComponent(tag.name)}`}
              className="group flex items-baseline gap-1.5 rounded-lg border border-neutral-100 dark:border-neutral-800 px-3 py-1.5 hover:border-green-600/40 dark:hover:border-green-500/40 transition-colors"
            >
              <span className="text-sm text-neutral-700 dark:text-neutral-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {tag.name}
              </span>
              <span className="font-mono text-[10px] tabular-nums text-neutral-400 dark:text-neutral-500">
                {tag.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-6 w-40 rounded bg-neutral-100 dark:bg-neutral-800" />
      <div className="h-4 w-64 rounded bg-neutral-100 dark:bg-neutral-800" />
    </div>
  )
}
