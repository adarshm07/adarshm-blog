export default function Footer() {
  return (
    <footer className="mt-16 pt-8 border-t border-neutral-100 dark:border-neutral-800">
      <div className="flex items-center justify-between text-sm text-neutral-400 dark:text-neutral-500">
        <p>© {new Date().getFullYear()} Adarsh M.</p>
        <div className="flex gap-5">
          <a
            href="/rss"
            className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            RSS
          </a>
          <a
            href="https://github.com/adarshm07"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
