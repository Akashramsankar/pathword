import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: 'https://akashramsankar.github.io/pathword/sitemap.xml',
    host: 'https://akashramsankar.github.io',
  }
}
