import Image from 'next/image'
import Link from 'next/link'

export const ProductHeader = () => {
  return (
    <header className="relative mt-4 overflow-hidden border-y border-(--rule) bg-(--panel) p-4 sm:p-5">
      <div
        aria-hidden="true"
        className="theme-grain pointer-events-none absolute inset-0 bg-size-[320px]"
      />
      <div className="relative flex flex-wrap items-start justify-between gap-4 sm:gap-4.5">
        <div className="mt-6 flex min-w-0 max-md:flex-col md:items-end">
          <Link href={'/'} className="inline-flex items-center gap-3.5">
            <Image
              src="/assets/blueskills-emblem.svg"
              alt=""
              width={88}
              height={88}
              priority
              className="theme-ink size-14 shrink-0 md:size-22"
            />
            <h1 className="font-serif text-6xl leading-none font-normal tracking-[0.005em] text-(--ink) sm:text-8xl">
              BlueSkills
            </h1>
          </Link>

          <div className="mt-4 mb-2 sm:ml-13.5">
            <p className="m-0 text-base text-(--ink)">
              Inspect an agent skill before you install it.
            </p>
            <p className="mt-1 text-sm text-pretty text-(--ink-3)">
              Review its instructions, bundled files and the evidence behind the
              verdict.
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
