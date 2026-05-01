'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems: Record<string, { name: string }> = {
  '/': { name: 'home' },
  '/blog': { name: 'blog' },
  'mailto:contact@adarshm.com': { name: 'contact' },
}

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="mb-12 flex items-center gap-1 border-b border-neutral-100 dark:border-neutral-800 pb-6">
      {Object.entries(navItems).map(([path, { name }]) => {
        const isActive = pathname === path
        return (
          <Link
            key={path}
            href={path}
            className={[
              'px-3 py-1.5 rounded-md text-sm transition-colors',
              isActive
                ? 'text-neutral-900 dark:text-neutral-50 font-medium bg-neutral-100 dark:bg-neutral-800'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900',
            ].join(' ')}
          >
            {name}
          </Link>
        )
      })}
    </nav>
  )
}
