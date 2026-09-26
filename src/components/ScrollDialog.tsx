'use client'

import type { ReactNode } from 'react'
import { useRef } from 'react'

const dialogClasses = [
  'm-auto h-[calc(100dvh_-_2rem)] max-h-[calc(100dvh_-_2rem)]',
  'w-[min(72.5rem,calc(100%_-_2rem))] max-w-[calc(100%_-_2rem)]',
  'overflow-auto overscroll-contain border border-[#333] p-0 text-[#eee]',
  "[background:linear-gradient(#0006,#0006),url('/assets/footer-bg-dark.webp')_center/cover_fixed,#111]",
  '[scrollbar-color:#777_#151515] [&:not([open])]:hidden [&::backdrop]:bg-[#000b]',
  'max-[47.5rem]:h-[calc(100dvh_-_1rem)] max-[47.5rem]:max-h-[calc(100dvh_-_1rem)]',
  'max-[47.5rem]:w-[calc(100%_-_1rem)] max-[47.5rem]:max-w-[calc(100%_-_1rem)]',
].join(' ')

const toolbarClasses = [
  'pointer-events-none sticky top-0 z-4 flex min-h-15 justify-end px-4 pt-3',
  'max-[30rem]:min-h-14 max-[30rem]:px-2.5 max-[30rem]:pt-2',
].join(' ')

const closeButtonClasses = [
  'pointer-events-auto inline-flex min-h-12 min-w-12 items-center justify-center',
  'rounded-none border border-[#555] bg-[#0a0a0a] p-0 text-[#eee]',
  'hover:border-[#aaa] hover:bg-[#222] focus-visible:outline-white',
  'max-[30rem]:min-h-11 max-[30rem]:min-w-11',
].join(' ')

interface ScrollDialogProps {
  trigger: ReactNode
  triggerClassName?: string
  closeLabel: string
  labelledBy: string
  describedBy?: string
  children: ReactNode
}

export function ScrollDialog({
  trigger,
  triggerClassName,
  closeLabel,
  labelledBy,
  describedBy,
  children,
}: ScrollDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const openDialog = () => {
    dialogRef.current?.showModal()
  }

  const closeDialog = () => {
    dialogRef.current?.close()
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        onClick={openDialog}
      >
        {trigger}
      </button>

      <dialog
        ref={dialogRef}
        className={dialogClasses}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog()
        }}
        onClose={() => triggerRef.current?.focus()}
      >
        <div className={toolbarClasses}>
          <button
            type="button"
            className={closeButtonClasses}
            aria-label={closeLabel}
            onClick={closeDialog}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </div>
        {children}
      </dialog>
    </>
  )
}
