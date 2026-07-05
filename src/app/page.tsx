import { Suspense } from 'react'
import Link from 'next/link'
import { BlogPosts } from '@/app/components/posts'
import { Profile } from '@/app/components/profile'
import { baseUrl } from '@/app/sitemap'

export default function Page() {
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

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Writing
          </h2>
          <Link
            href="/blog"
            className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            View all →
          </Link>
        </div>
        <BlogPosts limit={5} />
      </div>
    </section>
  )
}

function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-5 animate-pulse">
      <div className="h-16 w-16 rounded-full bg-neutral-100 dark:bg-neutral-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-6 w-40 rounded bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-4 w-64 rounded bg-neutral-100 dark:bg-neutral-800" />
      </div>
    </div>
  )
}
