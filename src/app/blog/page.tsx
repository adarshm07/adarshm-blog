import { BlogPosts } from '@/app/components/posts'

export const metadata = {
  title: 'Blog',
  description: 'Writing about JavaScript, frontend development, and the web.',
}

export default function Page() {
  return (
    <section>
      <h1 className="mb-3 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        Blog
      </h1>
      <p className="mb-8 text-sm text-neutral-500 dark:text-neutral-400">
        Notes on JavaScript, frontend architecture, and things I learn
        building on the web.
      </p>
      <BlogPosts showSummary />
    </section>
  )
}
