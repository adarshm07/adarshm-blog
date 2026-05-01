import { Suspense } from 'react'
import { BlogPosts } from '@/app/components/posts'
import { Profile } from '@/app/components/profile'
import { Projects } from '@/app/components/projects'

export default function Page() {
  return (
    <section className="space-y-12">
      <Suspense fallback={<ProfileSkeleton />}>
        <Profile />
      </Suspense>

      <Suspense fallback={null}>
        <Projects />
      </Suspense>

      <div>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Writing
        </h2>
        <BlogPosts />
      </div>
    </section>
  )
}

function ProfileSkeleton() {
  return (
    <div className="flex items-start gap-5 animate-pulse">
      <div className="h-20 w-20 rounded-full bg-neutral-100 dark:bg-neutral-800 shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-5 w-32 rounded bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-4 w-48 rounded bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-4 w-24 rounded bg-neutral-100 dark:bg-neutral-800" />
      </div>
    </div>
  )
}
