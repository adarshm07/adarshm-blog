import { BlogPosts } from '@/app/components/posts'

export const metadata = {
  title: 'Blog',
  description: 'Writing about JavaScript, frontend development, and the web.',
}

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        Blog
      </h1>
      <BlogPosts />
    </section>
  )
}
