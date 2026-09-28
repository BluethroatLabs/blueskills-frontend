import Link from 'next/link'
import type { ReactNode } from 'react'

export function AboutPageEnvironment({ children }: { children: ReactNode }) {
  return <div className="about-page-environment">{children}</div>
}

export function ParchmentArticle({
  children,
  labelledBy,
}: {
  children: ReactNode
  labelledBy: string
}) {
  return (
    <article className="parchment-page" aria-labelledby={labelledBy}>
      {children}
    </article>
  )
}

export function ReadingDocumentPage({
  title,
  lead,
  labelledBy,
  children,
}: {
  title: string
  lead: string
  labelledBy: string
  children: ReactNode
}) {
  return (
    <article className="reading-document-page" aria-labelledby={labelledBy}>
      <header className="reading-document-header">
        <div>
          <h1 id={labelledBy}>{title}</h1>
          <p>{lead}</p>
        </div>
        <Link className="reading-document-scan" href="/">
          New Scan
        </Link>
      </header>

      <div className="content-copy reading-document-copy">{children}</div>
    </article>
  )
}
