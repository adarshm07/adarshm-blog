import { getGithubRepos } from '@/app/lib/github'

const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  CSS: '#563d7c',
  HTML: '#e34c26',
  PHP: '#4F5D95',
  Shell: '#89e051',
  Rust: '#dea584',
  Go: '#00ADD8',
  Ruby: '#701516',
}

function StarIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current" aria-hidden>
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
    </svg>
  )
}

export async function Projects() {
  const repos = await getGithubRepos()

  if (repos.length === 0) return null

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Projects
        </h2>
        <a
          href="https://github.com/adarshm07?tab=repositories"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
        >
          View all →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {repos.map((repo) => (
          <a
            key={repo.id}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-lg border border-neutral-100 dark:border-neutral-800 p-4 hover:border-green-200 dark:hover:border-green-900 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-all"
          >
            <span className="mb-1 font-medium text-sm text-neutral-800 dark:text-neutral-200 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors truncate">
              {repo.name}
            </span>

            {repo.description ? (
              <span className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3 flex-1">
                {repo.description}
              </span>
            ) : (
              <span className="flex-1" />
            )}

            <div className="flex items-center gap-3 text-xs text-neutral-400 dark:text-neutral-500">
              {repo.language && (
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        languageColors[repo.language] ?? '#6b7280',
                    }}
                  />
                  {repo.language}
                </span>
              )}
              {repo.stargazers_count > 0 && (
                <span className="flex items-center gap-1">
                  <StarIcon />
                  {repo.stargazers_count}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
