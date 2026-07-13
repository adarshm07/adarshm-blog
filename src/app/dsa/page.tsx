import { getBlogPosts, getReadingTime } from '@/app/blog/utils'
import { DsaPath, type PathPhase } from '@/app/components/dsa-path'
import { baseUrl } from '@/app/sitemap'
import { curriculum } from './curriculum'

export const metadata = {
  title: 'Learn DSA',
  description:
    'A structured path through data structures and algorithms — ordered articles with interactive visualizations, from recursion basics to dynamic programming.',
  openGraph: {
    title: 'Learn DSA',
    description:
      'A structured path through data structures and algorithms — ordered articles with interactive visualizations.',
    url: `${baseUrl}/dsa`,
    images: [{ url: `/og?title=${encodeURIComponent('Learn DSA')}` }],
  },
}

export default function Page() {
  const posts = getBlogPosts()

  const phases: PathPhase[] = curriculum.map((phase) => ({
    title: phase.title,
    description: phase.description,
    items: phase.entries.map((entry) => {
      const post = entry.slug
        ? posts.find((p) => p.slug === entry.slug)
        : undefined
      if (entry.slug && !post) {
        throw new Error(`DSA curriculum references missing post: ${entry.slug}`)
      }
      return post
        ? {
            slug: post.slug,
            title: post.metadata.title,
            summary: post.metadata.summary,
            readingTime: getReadingTime(post.content),
            difficulty: entry.difficulty,
            note: entry.note,
          }
        : {
            title: entry.title!,
            difficulty: entry.difficulty,
            note: entry.note,
          }
    }),
  }))

  return (
    <section>
      <h1 className="mb-3 text-3xl sm:text-4xl font-bold tracking-tight text-ink">
        Learn DSA
        <span className="text-accent">.</span>
      </h1>
      <p className="mb-8 leading-relaxed text-ink/70">
        A structured path through data structures and algorithms. The articles
        build on each other, so follow the order if you&apos;re starting fresh —
        or jump to whatever you want to brush up on. Most posts include
        interactive visualizations you can step through.
      </p>
      <DsaPath phases={phases} />
    </section>
  )
}
