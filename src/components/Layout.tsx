import { ReactNode } from 'react'
import { Footer } from './Footer'
import { ProductHeader } from './ProductHeader'
import { SiteHeader } from './SiteHeader'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative container mx-auto border-x border-(--rule) bg-(--bg) py-12 text-(--ink)">
      <SiteHeader />
      <main className="flex w-full flex-col gap-3 sm:gap-4.5">
        <ProductHeader />
        {children}
        <Footer />
      </main>
    </div>
  )
}
