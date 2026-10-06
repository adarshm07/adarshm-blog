import Link from 'next/link'
import type { ReactNode } from 'react'
import { getBlogPosts, getReadingTime } from '@/app/blog/utils'
import { baseUrl } from '@/app/sitemap'
import { ReadingProgress } from '@/app/components/reading-progress'
import { TableOfContents } from '@/app/components/toc'
import {
  ChapterDoneButton,
  GuideProgressBar,
  GuideProgressCount,
} from '@/app/components/learn-progress'

export type Chapter = {
  id: string
  title: string
  body: ReactNode
  demo: ReactNode
  keyIdea: string
  post?: string // blog slug for the full article; checked at build time
}

export type Part = { id: string; title: string; blurb: string; chapters: Chapter[] }

export type Guide = {
  slug: string // route segment under /learn, and the progress-key prefix
  title: string
  description: string
  intro: ReactNode
  outro: ReactNode
  parts: Part[]
}

/** Inline code inside chapter text (the guide pages aren't .prose). */
export function C({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 font-mono text-[0.85em] text-neutral-800 dark:text-neutral-200">
      {children}
    </code>
  )
}

/** Progress keys are `guide/chapter`, so the same chapter id in two guides is tracked separately. */
export const progressId = (guide: Guide, chapter: Chapter) => `${guide.slug}/${chapter.id}`

export const guideProgressIds = (guide: Guide) =>
  guide.parts.flatMap((part) => part.chapters.map((chapter) => progressId(guide, chapter)))

export function guideMetadata(guide: Guide) {
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/learn/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${baseUrl}/learn/${guide.slug}`,
      images: [{ url: `/og?title=${encodeURIComponent(guide.title)}` }],
    },
  }
}

export function GuideView({ guide }: { guide: Guide }) {
  const posts = new Map(getBlogPosts().map((p) => [p.slug, p]))

  for (const part of guide.parts) {
    for (const chapter of part.chapters) {
      if (chapter.post && !posts.has(chapter.post)) {
        throw new Error(`/learn/${guide.slug} references missing post: ${chapter.post}`)
      }
    }
  }

  // Chapters are numbered straight through, across parts.
  const chapterNumber = new Map(
    guide.parts.flatMap((part) => part.chapters).map((chapter, i) => [chapter.id, i + 1])
  )

  return (
    <section>
      <ReadingProgress />
      <TableOfContents />

      <div className="mb-10 border-b border-neutral-100 dark:border-neutral-800 pb-8">
        <Link
          href="/learn"
          className="mb-3 inline-block text-xs text-neutral-400 transition-colors hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200"
        >
          ← All guides
        </Link>
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          {guide.title}
        </h1>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {guide.intro} {chapterNumber.size} short chapters, each with an animation.
        </p>
        <p className="mt-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-500 dark:text-neutral-400">
          Press <strong className="font-medium text-neutral-700 dark:text-neutral-200">Play</strong>{' '}
          on any animation, or use <strong className="font-medium text-neutral-700 dark:text-neutral-200">Next</strong>{' '}
          and <strong className="font-medium text-neutral-700 dark:text-neutral-200">Back</strong>{' '}
          to go at your own pace. Mark chapters as done to track where you are —
          progress is saved in this browser.
        </p>

        <div className="mt-6">
          <GuideProgressBar ids={guideProgressIds(guide)} />
        </div>

        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {guide.parts.map((part, i) => (
            <li key={part.id}>
              <a
                href={`#${part.id}`}
                className="group block h-full rounded-xl border border-neutral-100 dark:border-neutral-800 p-3 transition-colors hover:border-green-600/40 dark:hover:border-green-500/40"
              >
                <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
                  Part {i + 1} ·{' '}
                  <GuideProgressCount ids={part.chapters.map((c) => progressId(guide, c))} />
                </span>
                <span className="mt-0.5 block text-sm font-medium text-neutral-900 dark:text-neutral-50 transition-colors group-hover:text-green-600 dark:group-hover:text-green-400">
                  {part.title}
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                  {part.blurb}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>

      <article>
        {guide.parts.map((part, partIndex) => (
          <div key={part.id} className="mb-14">
            <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-green-600 dark:text-green-500">
              Part {partIndex + 1}
            </p>
            <h2
              id={part.id}
              className="mb-2 scroll-mt-24 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50"
            >
              {part.title}
            </h2>
            <p className="mb-8 text-sm text-neutral-500 dark:text-neutral-400">{part.blurb}</p>

            <div className="space-y-12">
              {part.chapters.map((chapter) => {
                const post = chapter.post ? posts.get(chapter.post) : undefined
                return (
                  <div key={chapter.id}>
                    <h3
                      id={chapter.id}
                      className="mb-2 flex scroll-mt-24 items-baseline gap-2 text-lg font-medium tracking-tight text-neutral-900 dark:text-neutral-50"
                    >
                      <span className="font-mono text-xs text-neutral-400 dark:text-neutral-500">
                        {String(chapterNumber.get(chapter.id)).padStart(2, '0')}{' '}
                      </span>
                      {chapter.title}
                    </h3>
                    <p className="text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                      {chapter.body}
                    </p>

                    {chapter.demo}

                    <div className="rounded-lg border-l-2 border-green-600 dark:border-green-500 bg-green-600/5 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <span className="font-medium text-green-700 dark:text-green-400">Key idea: </span>
                      {chapter.keyIdea}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <ChapterDoneButton id={progressId(guide, chapter)} />
                      {post ? (
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-xs text-neutral-500 dark:text-neutral-400 transition-colors hover:text-green-600 dark:hover:text-green-400"
                        >
                          Go deeper: {post.metadata.title} · {getReadingTime(post.content)} min read →
                        </Link>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </article>

      <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 p-4 text-sm text-neutral-600 dark:text-neutral-400">
        {guide.outro}
      </div>
    </section>
  )
}
