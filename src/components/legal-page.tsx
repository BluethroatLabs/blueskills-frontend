import Link from 'next/link'
import type { ReactNode } from 'react'
import { BlueSkillsShell } from '@/components/blueskills-app'

export function LegalPage({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <BlueSkillsShell>
      <article className="border border-(--rule) bg-(--panel)">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-(--rule) px-4 py-3 sm:px-5">
          <h1 className="font-serif text-[31px] leading-none font-normal tracking-[0.005em] sm:text-[38px]">
            {title}
          </h1>
          <Link
            href="/"
            className="min-h-11 border border-(--control-rule) px-3 py-2 text-sm underline underline-offset-4 transition-colors hover:bg-(--panel-2)"
          >
            New Scan
          </Link>
        </header>
        <div className="legal-copy max-w-[75ch] px-4 py-5 text-sm leading-7 text-(--ink-2) sm:px-5 sm:py-7">
          {children}
        </div>
      </article>
    </BlueSkillsShell>
  )
}
