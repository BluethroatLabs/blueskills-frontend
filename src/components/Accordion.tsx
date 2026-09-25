import type { ReactNode } from 'react'

const accordionClasses = [
  'm-0 list-none p-0',
  '[&>li]:relative [&>li]:border-t [&>li]:border-(--scroll-rule)',
  '[&>li:last-child]:border-b',
].join(' ')

const summaryClasses = [
  'flex min-h-13 list-none items-center gap-3 py-3.5',
  'text-[1.0625rem] leading-[1.55] font-[650] text-(--scroll-ink)',
  '[&::-webkit-details-marker]:hidden',
  'max-[30rem]:gap-2 max-[30rem]:text-base',
].join(' ')

const numberClasses = 'shrink-0 text-sm font-normal text-[#555] tabular-nums'

const markerClasses = 'ml-auto inline-flex shrink-0 pl-2 max-[30rem]:pl-0'

const markerIconClasses =
  'size-4.5 fill-none stroke-current [stroke-width:1.25]'

interface AccordionProps {
  children: ReactNode
  className?: string
}

interface AccordionItemProps {
  number: ReactNode
  question: ReactNode
  children: ReactNode
}

export function Accordion({ children, className }: AccordionProps) {
  return (
    <ol className={`${accordionClasses}${className ? ` ${className}` : ''}`}>
      {children}
    </ol>
  )
}

export function AccordionItem({
  number,
  question,
  children,
}: AccordionItemProps) {
  return (
    <li>
      <details className="group open:pb-3">
        <summary className={summaryClasses}>
          <span className={numberClasses} aria-hidden="true">
            {number}
          </span>
          <span>{question}</span>
          <span className={markerClasses} aria-hidden="true">
            <svg
              viewBox="0 0 18 18"
              className={`${markerIconClasses} group-open:hidden`}
            >
              <path d="M9 3v12M3 9h12" />
            </svg>
            <svg
              viewBox="0 0 18 18"
              className={`${markerIconClasses} hidden group-open:block`}
            >
              <path d="M3 9h12" />
            </svg>
          </span>
        </summary>

        {children}
      </details>
    </li>
  )
}
