import type { MetadataRoute } from 'next'

const siteUrl = 'https://www.pathword.co'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
  ]
}

