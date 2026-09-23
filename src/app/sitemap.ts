import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://blueskills.bluethroatlabs.com/',
    },
    {
      url: 'https://blueskills.bluethroatlabs.com/for-agents',
    },
  ]
}
