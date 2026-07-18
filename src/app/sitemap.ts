import { getBlogPosts } from '@/app/blog/utils'
import { getPatternQuestions } from '@/app/dsa/patterns/utils'

export const baseUrl = 'https://adarshm.com'

export default async function sitemap() {
  let blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  let questions = getPatternQuestions().map((question) => ({
    url: `${baseUrl}/dsa/patterns/${question.slug}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  let routes = ['', '/blog', '/dsa', '/dsa/patterns'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.9,
  }))

  return [...routes, ...blogs, ...questions]
}
