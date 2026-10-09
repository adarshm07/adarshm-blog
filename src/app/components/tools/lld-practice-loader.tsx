'use client'

import dynamic from 'next/dynamic'

/**
 * The practice tool keeps drafts in localStorage and reads them while
 * initialising state, so it only renders in the browser. Loading it without
 * SSR also keeps the editor out of every other page's JavaScript.
 */
export const LldPracticeLoader = dynamic(
  () => import('@/app/components/tools/lld-practice').then((m) => m.LldPractice),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 animate-pulse rounded-xl border border-neutral-100 dark:border-neutral-800" />
    ),
  }
)
