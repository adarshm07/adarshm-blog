const links = [
  { name: 'RSS', href: '/rss', external: false },
  { name: 'GitHub', href: 'https://github.com/adarshm07', external: true },
  { name: 'X', href: 'https://x.com/adarshm07', external: true },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/adarshm07/',
    external: true,
  },
]

export default function Footer() {
  return (
    <footer className="mt-20 pt-8 pb-10 border-t border-line">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} Adarsh M
          <span className="text-accent">.</span>
        </p>
        <div className="flex gap-5">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              {...(link.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="text-xs text-muted hover:text-accent transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
