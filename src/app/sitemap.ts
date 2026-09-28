import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-metadata'

const routes = [
  { path: '/', lastModified: '2026-09-28' },
  { path: '/about', lastModified: '2026-09-28' },
  { path: '/for-agents', lastModified: '2026-09-28' },
  { path: '/methodology', lastModified: '2026-09-28' },
  { path: '/privacy', lastModified: '2026-09-18' },
  { path: '/terms', lastModified: '2026-09-21' },
  { path: '/support', lastModified: '2026-09-23' },
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, lastModified }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(`${lastModified}T00:00:00.000Z`),
  }))
}
