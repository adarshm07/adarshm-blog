export type GithubProfile = {
  login: string
  name: string
  bio: string | null
  avatar_url: string
  location: string | null
  blog: string | null
  twitter_username: string | null
  public_repos: number
  followers: number
  following: number
  html_url: string
}

export type GithubRepo = {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  topics: string[]
  updated_at: string
  fork: boolean
}

const USERNAME = 'adarshm07'
const BASE = 'https://api.github.com'
const opts: RequestInit = {
  next: { revalidate: 3600 },
  headers: { Accept: 'application/vnd.github.v3+json' },
}

export async function getGithubProfile(): Promise<GithubProfile | null> {
  try {
    const res = await fetch(`${BASE}/users/${USERNAME}`, opts)
    if (!res.ok) return null
    return res.json() as Promise<GithubProfile>
  } catch {
    return null
  }
}

export async function getGithubRepos(): Promise<GithubRepo[]> {
  try {
    const res = await fetch(
      `${BASE}/users/${USERNAME}/repos?sort=pushed&per_page=100`,
      opts
    )
    if (!res.ok) return []
    const repos = (await res.json()) as GithubRepo[]
    return repos
      .filter((r) => !r.fork && r.name !== 'adarshm-blog')
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6)
  } catch {
    return []
  }
}
