import type { Metadata } from 'next'

export const SITE_URL = 'https://blueskills.bluethroatlabs.com'
export const SITE_NAME = 'BlueSkills by Bluethroat Labs'
export const SOCIAL_IMAGE_PATH = '/opengraph-image.png'

interface PageMetadataOptions {
  title: string
  description: string
  path: `/${string}` | '/'
}

export function createPageMetadata({
  title,
  description,
  path,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      type: 'website',
      images: [
        {
          url: SOCIAL_IMAGE_PATH,
          width: 1200,
          height: 630,
          alt: 'BlueSkills by Bluethroat Labs',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SOCIAL_IMAGE_PATH],
    },
  }
}
