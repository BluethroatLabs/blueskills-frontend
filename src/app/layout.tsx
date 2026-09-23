import type { Metadata } from 'next'
import { Geist_Mono, Instrument_Serif } from 'next/font/google'
import { Providers } from '@/app/providers'
import './globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'

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
  metadataBase: new URL('https://blueskills.bluethroatlabs.com'),
  title: 'Scan AI Agent Skills Before Installing | BlueSkills',
  description:
    'Free security scanner for AI agent skills. Check SKILL.md, a public repository, or a ZIP package before installing it. Review findings and scan coverage.',
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
