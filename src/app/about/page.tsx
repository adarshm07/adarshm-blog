import Link from 'next/link'
import { getAllTags, getBlogPosts } from '@/app/blog/utils'
import { getPatternQuestions } from '@/app/dsa/patterns/utils'
import { baseUrl } from '@/app/sitemap'

export const metadata = {
  title: 'About',
  description:
    'Adarsh M — software engineer in Kerala, India. What I write about here, and how this site is built.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About',
    description:
      'Adarsh M — software engineer in Kerala, India. What I write about here, and how this site is built.',
    url: `${baseUrl}/about`,
    type: 'profile',
  },
}

const STACK: { name: string; detail: string }[] = [
  { name: 'Next.js 16', detail: 'App Router, React Server Components, Turbopack' },
  { name: 'React 19', detail: 'Server components by default; client only for the interactive parts' },
  { name: 'TypeScript', detail: 'Strict mode, path alias @/* → ./src/*' },
  { name: 'Tailwind CSS 4', detail: 'CSS-first config — no tailwind.config.ts' },
  { name: 'MDX', detail: 'next-mdx-remote rendering posts as RSC, frontmatter parsed by hand' },
  { name: 'sugar-high', detail: 'Syntax highlighting, small enough to run at render time' },
  { name: 'Geist', detail: 'Sans and mono, self-hosted through next/font' },
]

const DECISIONS: { title: string; body: string }[] = [
  {
    title: 'Posts are files, not a CMS',
    body: 'Every article is an .mdx file in the repo. Frontmatter carries the title, date, summary and tags; the build reads the directory and generates a static page per post. Writing is a commit, and the history of a post is its git history.',
  },
  {
    title: 'Diagrams are components, not images',
    body: 'Each visualizer is a small client component built on one shared step player, so it animates, steps, and replays — and stays sharp, themed, and readable in both light and dark. A screenshot could not do any of that, and an image cannot be diffed in review.',
  },
  {
    title: 'Search runs in the browser',
    body: 'The index — titles, summaries, tags, headings and prose with code stripped out — is built at compile time and served as one static file, fetched the first time you press ⌘K. No search service, no query logging, and it works the same on a fork running locally.',
  },
  {
    title: 'Static where possible',
    body: 'Almost every route is prerendered at build time, including the OG images and the RSS feed. What is left is a handful of query-driven pages. The result is a site that is cheap to host and fast for the reader.',
  },
]

export default function Page() {
  const posts = getBlogPosts()
  const tags = getAllTags()
  const questions = getPatternQuestions()

  return (
    <section className="space-y-12">
      <div>
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          About
        </h1>
        <div className="space-y-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          <p>
            I&apos;m Adarsh — a software engineer based in Kerala, India, working
            mostly in JavaScript and TypeScript on the web.
          </p>
          <p>
            This site is where I write things down as I learn them. The posts
            are the explanations I wanted to find when I was first working
            through a topic: the mechanism rather than the summary, the
            trade-off rather than the recommendation, and the failure mode that
            only shows up in production.
          </p>
          <p>
            Most articles are built around an animation you can step through.
            It turns out that a stack popping, a cache prefix invalidating, or
            a search expanding across a grid is much easier to understand when
            you can watch it happen and move back a step.
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          What&apos;s here
        </h2>
        <dl className="grid grid-cols-3 gap-3">
          {[
            { value: posts.length, label: 'articles' },
            { value: questions.length, label: 'practice questions' },
            { value: tags.length, label: 'topics' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-neutral-100 dark:border-neutral-800 px-3 py-3"
            >
              <dt className="font-mono text-xl tabular-nums text-neutral-900 dark:text-neutral-50">
                {stat.value}
              </dt>
              <dd className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          The writing splits into {tags.length} areas —{' '}
          {tags.map((tag, i) => (
            <span key={tag}>
              {i > 0 && (i === tags.length - 1 ? ' and ' : ', ')}
              <Link
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="text-green-600 dark:text-green-400 hover:underline"
              >
                {tag}
              </Link>
            </span>
          ))}
          . There is also a{' '}
          <Link
            href="/dsa"
            className="text-green-600 dark:text-green-400 hover:underline"
          >
            structured DSA path
          </Link>{' '}
          that orders the algorithms articles from recursion through dynamic
          programming, and a{' '}
          <Link
            href="/dsa/patterns"
            className="text-green-600 dark:text-green-400 hover:underline"
          >
            practice set
          </Link>{' '}
          grouped by the pattern that solves each question.
        </p>
      </div>

      <div>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Stack
        </h2>
        <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {STACK.map((item) => (
            <li
              key={item.name}
              className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-4"
            >
              <span className="w-32 shrink-0 font-mono text-sm text-neutral-800 dark:text-neutral-200">
                {item.name}
              </span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {item.detail}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          How it&apos;s built
        </h2>
        <div className="space-y-5">
          {DECISIONS.map((decision) => (
            <div key={decision.title}>
              <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {decision.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                {decision.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 px-4 py-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Something wrong in a post, or want to talk about one?{' '}
          <a
            href="mailto:contact@adarshm.com"
            className="text-green-600 dark:text-green-400 hover:underline"
          >
            Email me
          </a>{' '}
          or find me on{' '}
          <a
            href="https://github.com/adarshm07"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 dark:text-green-400 hover:underline"
          >
            GitHub
          </a>
          . Corrections are genuinely welcome.
        </p>
      </div>
    </section>
  )
}
