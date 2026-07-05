'use client'

import { useEffect, useState } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const article = document.querySelector('article')
    if (!article) return

    function updateProgress() {
      const { top, height } = article!.getBoundingClientRect()
      const total = height - window.innerHeight
      const scrolled = -top
      const pct = total > 0 ? Math.min(Math.max(scrolled / total, 0), 1) : 0
      setProgress(pct)
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 z-50">
      <div
        className="h-full bg-green-600 dark:bg-green-500"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  )
}
