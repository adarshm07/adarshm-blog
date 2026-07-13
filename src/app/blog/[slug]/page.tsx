import { notFound } from 'next/navigation'
import { CustomMDX } from '@/app/components/mdx'
import { ReadingProgress } from '@/app/components/reading-progress'
import { TableOfContents } from '@/app/components/toc'
import { PostSidebar } from '@/app/components/post-sidebar'
import { formatDate, getBlogPosts, getReadingTime } from '@/app/blog/utils'
import { baseUrl } from '@/app/sitemap'

export async function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getBlogPosts().find((p) => p.slug === slug)
  if (!post) return

  const { title, publishedAt, summary: description, image } = post.metadata
  const ogImage = image
    ? image
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: publishedAt,
      url: `${baseUrl}/blog/${post.slug}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function Blog({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getBlogPosts().find((p) => p.slug === slug)

  if (!post) notFound()

  const readingTime = getReadingTime(post.content)
  const url = `${baseUrl}/blog/${post.slug}`

  return (
    <section>
      <ReadingProgress />
      <TableOfContents />
      <PostSidebar slug={post.slug} title={post.metadata.title} url={url} />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${baseUrl}${post.metadata.image}`
              : `${baseUrl}/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${baseUrl}/blog/${post.slug}`,
            author: {
              '@type': 'Person',
              name: 'Adarsh M.',
            },
          }),
        }}
      />

      <div className="mb-10 pb-8 border-b border-line">
        <h1 className="title font-bold text-3xl sm:text-4xl tracking-tight text-ink">
          {post.metadata.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted">
            {formatDate(post.metadata.publishedAt)} · {readingTime} min read
          </p>
          {post.metadata.tags?.map((t) => (
            <span
              key={t}
              className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-[11px] text-muted"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <article className="prose">
        <CustomMDX source={post.content} />
      </article>
    </section>
  )
}
