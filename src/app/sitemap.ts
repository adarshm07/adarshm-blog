import { getBlogPosts } from '@/app/blog/utils'
import { getPatternQuestions } from '@/app/dsa/patterns/utils'

export const baseUrl = 'https://adarshm.com'

export default async function sitemap() {
  const blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const questions = getPatternQuestions().map((question) => ({
    url: `${baseUrl}/dsa/patterns/${question.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const routes = [
    '',
    '/blog',
    '/about',
    '/learn',
    '/learn/web',
    '/learn/javascript',
    '/learn/ai',
    '/tools',
    '/tools/system-design',
    '/tools/lld',
    '/tools/capacity',
    '/tools/regex',
    '/dsa',
    '/dsa/patterns',
    // /dsa/progress is left out on purpose: it renders from the visitor's
    // localStorage, so crawlers see an empty page. It is also noindex.
  ].map((route) => ({
    // No lastModified: stamping the build date on pages that didn't change
    // teaches Google to ignore lastmod for the whole sitemap. Blog posts keep
    // their real publishedAt date above.
    url: `${baseUrl}${route}`,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.9,
  }))

  return [...routes, ...blogs, ...questions]
}
