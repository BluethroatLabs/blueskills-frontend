import Image from 'next/image'
import Link from 'next/link'
import { ThemeControl } from './ThemeControl'
import { BrandAttribution } from './BrandAttribution'

export const ProductHeader = () => {
  return (
    <header className="relative overflow-hidden border-y border-(--rule) bg-(--panel) p-4 sm:p-5">
      <div
        aria-hidden="true"
        className="theme-grain pointer-events-none absolute inset-0 bg-[url('/assets/paper-base.jpg')] bg-size-[320px]"
      />
      <div className="relative flex flex-wrap items-start justify-between gap-4 sm:gap-4.5">
        <div className="min-w-0 flex-[1_1_380px]">
          <Link href={'/'} className="inline-flex items-center gap-3.5">
            <Image
              src="/assets/blueskills-emblem.svg"
              alt=""
              width={40}
              height={40}
              priority
              className="theme-ink shrink-0"
            />
            <h1 className="font-serif text-[31px] leading-none font-normal tracking-[0.005em] text-(--ink) sm:text-[38px]">
              BlueSkills
            </h1>
          </Link>
          <div className="mt-2 sm:mt-2.25 sm:ml-13.5">
            <p className="m-0 text-base text-(--ink)">
              Inspect an agent skill before you install it.
            </p>
            <p className="mt-1 max-w-[52ch] text-sm text-pretty text-(--ink-3)">
              Review its instructions, bundled files and the evidence behind the
              verdict.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-row flex-wrap items-center justify-between gap-3 sm:w-auto sm:flex-col sm:items-start">
          <ThemeControl />
          <BrandAttribution compact />
        </div>
      </div>
    </header>
  )
}
