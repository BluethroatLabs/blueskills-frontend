import { BlueSkillsApp } from '@/components/blueskills-app'

const webApplicationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'BlueSkills',
  alternateName: 'BlueSkills by Bluethroat Labs',
  url: 'https://blueskills.bluethroatlabs.com/',
  description:
    'BlueSkills analyzes AI agent skills before installation and returns security findings, quoted evidence, and coverage information.',
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'Any',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  creator: {
    '@type': 'Organization',
    name: 'Bluethroat Labs',
    url: 'https://bluethroatlabs.com/',
  },
  sameAs: ['https://github.com/BluethroatLabs/blueskills-public'],
  featureList: [
    'Scan a pasted SKILL.md',
    'Scan a public GitHub repository',
    'Scan a public GitLab repository',
    'Scan a ZIP package',
    'Inspect bundled code and configuration',
    'Review quoted security evidence',
    'Report analysis coverage and limitations',
  ],
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationStructuredData),
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
