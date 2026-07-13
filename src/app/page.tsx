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
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-ink">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-accent to-accent-2" />
            Latest writing
          </h2>
          <Link
            href="/blog"
            className="text-sm text-muted hover:text-accent transition-colors"
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
    <div className="animate-pulse space-y-6">
      <div className="h-6 w-56 rounded-full bg-line/50" />
      <div className="h-14 w-72 rounded bg-line/50" />
      <div className="space-y-2">
        <div className="h-5 w-full max-w-xl rounded bg-line/50" />
        <div className="h-5 w-80 rounded bg-line/50" />
      </div>
    </div>
  )
}
