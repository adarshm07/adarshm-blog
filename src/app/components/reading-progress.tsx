'use client'

import { useEffect, useState } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 z-50 h-0.5 w-full">
      <div
        className="h-full bg-green-600 dark:bg-green-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
