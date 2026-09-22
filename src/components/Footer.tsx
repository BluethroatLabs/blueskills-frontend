import Link from 'next/link'
import { BrandAttribution } from './BrandAttribution'

const FOOTER_LINKS = [
  { name: 'Telegram Bot', href: 'https://t.me/BluehroatLabsBot' },
  { name: 'Privacy', href: '/privacy' },
  { name: 'Terms', href: '/terms' },
  { name: 'Support', href: '/support' },
]

export const Footer = () => {
  return (
    <footer className="flex flex-col gap-4 border-y border-(--rule) px-4 py-5 text-sm sm:px-5 md:flex-row md:items-center md:justify-between">
      <BrandAttribution showIcon />
      <nav
        aria-label="Policies and support"
        className="flex flex-wrap gap-x-5 gap-y-2"
      >
        {FOOTER_LINKS.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            className="text-(--ink-2) underline decoration-(--rule) underline-offset-4 transition-colors hover:text-(--ink)"
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </footer>
  )
}
