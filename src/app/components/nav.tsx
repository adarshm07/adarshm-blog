'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems: Record<string, { name: string }> = {
  '/blog': { name: 'Blog' },
  '/dsa': { name: 'DSA' },
  'mailto:contact@adarshm.com': { name: 'Contact' },
}

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="mb-12 flex items-center justify-between border-b border-line pb-5">
      <Link href="/" className="group flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-[13px] font-bold text-white shadow-sm">
          AM
        </span>
        <span className="font-semibold tracking-tight text-ink group-hover:text-accent transition-colors">
          Adarsh M
        </span>
      </Link>

      <div className="flex items-center gap-5">
        {Object.entries(navItems).map(([path, { name }]) => {
          const isActive =
            pathname === path || (path !== '/' && pathname.startsWith(`${path}/`))
          return (
            <Link
              key={path}
              href={path}
              className={[
                'text-sm transition-colors',
                isActive
                  ? 'font-medium text-accent'
                  : 'text-muted hover:text-ink',
              ].join(' ')}
            >
              {name}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
