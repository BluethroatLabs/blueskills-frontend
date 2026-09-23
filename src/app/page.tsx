import { BlueSkillsApp } from '@/components/blueskills-app'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'BlueSkills by Bluethroat Labs',
    title: 'Scan AI Agent Skills Before Installing | BlueSkills',
    description:
      'Scan a SKILL.md, public repository, or ZIP package for suspicious behavior before giving an AI agent access to your environment.',
    images: [
      {
        url: '/og-blueskills.png',
        width: 1200,
        height: 630,
        alt: 'BlueSkills by Bluethroat Labs: scan an agent skill before you install it',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scan AI Agent Skills Before Installing | BlueSkills',
    description:
      'Free agent skill scanner by Bluethroat Labs. Review findings and scan coverage before installing a skill.',
    images: ['/og-blueskills.png'],
  },
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'BlueSkills',
            url: 'https://blueskills.bluethroatlabs.com/',
            description:
              'A free security scanner for AI agent skills. Submit a SKILL.md, public repository, or ZIP package and review findings and scan coverage before installation.',
            applicationCategory: 'SecurityApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Bluethroat Labs',
              url: 'https://bluethroatlabs.com/',
            },
          }),
        }}
      />
      <BlueSkillsApp
        limits={{
          textBytes: 1024 * 1024,
          fetchedArchiveBytes: 25 * 1024 * 1024,
          uploadBytes: 25 * 1024 * 1024,
          maxSkills: 5,
        }}
      />
    </>
  )
}
