'use client'

import dynamic from 'next/dynamic'

// Client-only: the tool reads drafts and past attempts from localStorage while
// initialising state, which has no server equivalent.
export const SystemDesignPracticeLoader = dynamic(
  () => import('@/app/components/tools/system-design-practice').then((m) => m.SystemDesignPractice),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 animate-pulse rounded-xl border border-neutral-100 dark:border-neutral-800" />
    ),
  }
)
