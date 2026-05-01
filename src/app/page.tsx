import { BlogPosts } from '@/app/components/posts'

export default function Page() {
  return (
    <section className="space-y-12">
      <div>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          Hi, I&apos;m{' '}
          <span className="text-green-600 dark:text-green-500">Adarsh M.</span>
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          JavaScript developer &middot; Kerala, India
        </p>
      </div>

      <div>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Writing
        </h2>
        <BlogPosts />
      </div>
    </section>
  )
}
