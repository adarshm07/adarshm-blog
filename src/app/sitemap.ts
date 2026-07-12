import { getBlogPosts } from '@/app/blog/utils'

export const baseUrl = 'https://adarshm.com'

export default async function sitemap() {
  let blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  let routes = ['', '/blog', '/dsa'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.9,
  }))

  return [...routes, ...blogs]
}
