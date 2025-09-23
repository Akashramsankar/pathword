import type { MetadataRoute } from 'next'

import { blogPosts } from '@/lib/blogPosts'

export const dynamic = 'force-static'

const siteUrl = 'https://www.pathword.co'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const latestBlogDate = blogPosts.reduce<Date | null>((latest, post) => {
    const postDate = new Date(post.date)
    if (!latest || postDate > latest) {
      return postDate
    }
    return latest
  }, null)

  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: latestBlogDate ?? now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...entries, ...blogEntries]
}
