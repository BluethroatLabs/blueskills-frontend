import type { Metadata } from 'next'
import { Geist_Mono, Instrument_Serif } from 'next/font/google'
import { Providers } from '@/app/providers'
import './globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import { createPageMetadata, SITE_URL } from '@/lib/site-metadata'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...createPageMetadata({
    title: 'BlueSkills: Scan an AI Agent Skill Before You Install It',
    description:
      'Scan an AI agent skill before installing it. BlueSkills analyzes instructions, bundled code and dependencies, with evidence, coverage and conditional runtime observation.',
    path: '/',
  }),
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body>
        <Providers>{children}</Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
