import { cn } from 'cn'
import Image from 'next/image'

export const BrandAttribution = ({
  compact = false,
  showIcon = false,
}: {
  compact?: boolean
  showIcon?: boolean
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 text-(--ink-3)',
        compact ? 'text-xs' : 'text-[13px]'
      )}
    >
      {showIcon && (
        <Image
          src="/assets/bluethroat-bird.svg"
          alt="Bluethroat Labs"
          width={20}
          height={20}
          className={cn('theme-ink h-auto', compact ? 'w-4' : 'w-5')}
        />
      )}
      <span>A public good by</span>
      <Image
        src="/assets/bluethroat-wordmark.svg"
        alt="Bluethroat Labs"
        width={155}
        height={22}
        className={cn('theme-ink h-auto', compact ? 'w-25.5' : 'w-29')}
      />
    </div>
  )
}
