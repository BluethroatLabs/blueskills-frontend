import Image from 'next/image'
import { AboutDialog } from './AboutDialog'
import { ThemeControl } from './ThemeControl'

export const SiteHeader = () => {
  return (
    <header className="flex flex-wrap border-y border-(--rule) bg-(--bg)">
      <a
        href="https://bluethroatlabs.com"
        aria-label="Bluethroat Labs home"
        className="flex min-h-16 w-full shrink-0 items-center gap-3 border-b border-(--rule) px-4 sm:min-h-18 sm:px-5 xl:w-62 xl:border-r xl:border-b-0"
      >
        <Image
          src="/assets/bluethroat-bird.svg"
          alt=""
          width={72}
          height={73}
          priority
          className="theme-ink h-8 w-auto shrink-0 sm:h-9"
        />
        <Image
          src="/assets/bluethroat-wordmark.svg"
          alt="Bluethroat Labs"
          width={155}
          height={22}
          priority
          className="theme-ink h-auto w-38 sm:w-40"
        />
      </a>

      <div className="flex min-h-14 w-full items-stretch justify-end sm:ml-auto sm:w-auto md:min-h-16 xl:min-h-18">
        <AboutDialog />
        <a
          href="https://t.me/BluethroatLabsBot"
          target="_blank"
          rel="noreferrer"
          className="flex items-center border-l border-(--rule) px-4 text-sm font-semibold text-nowrap text-(--ink-2) transition-colors hover:bg-(--panel-2) hover:text-(--ink) sm:px-5 sm:text-base"
        >
          Telegram Bot
        </a>
        <div className="flex items-center border-l border-(--rule)">
          <ThemeControl />
        </div>
      </div>
    </header>
  )
}
