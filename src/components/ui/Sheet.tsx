import { useEffect, useId, useRef, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { IconButton } from './IconButton'
import { Icon } from './Icon'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  side?: 'right' | 'left' | 'bottom'
  children: ReactNode
  footer?: ReactNode
  className?: string
}

/**
 * Side/bottom sheet built on the native <dialog> element + `showModal()`:
 * the browser gives us focus trapping, `inert` background, ESC to close, the
 * top layer (no z-index wars) and focus restoration — instead of re-implementing
 * them. We only add body scroll-lock and backdrop-click-to-close.
 */
export function Sheet({ open, onClose, title, side = 'right', children, footer, className }: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      document.documentElement.style.overflow = 'hidden'
    } else if (!open && dialog.open) {
      dialog.close()
    }
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // ESC fires `cancel`; route it through React state instead of letting the DOM close itself.
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      // A click whose target is the <dialog> itself landed on the ::backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className={cn(
        // Each side sets its own max-* so no two conflicting utilities land on the element.
        'fixed m-0 flex flex-col bg-white p-0 text-ink backdrop:bg-black/40 backdrop:animate-fade-in [&:not([open])]:hidden',
        side === 'right' && 'inset-y-0 right-0 left-auto h-dvh max-h-none w-full max-w-[420px] animate-slide-in-right',
        side === 'left' && 'inset-y-0 right-auto left-0 h-dvh max-h-none w-full max-w-[340px] animate-fade-in',
        side === 'bottom' && 'inset-x-0 top-auto bottom-0 max-h-[85dvh] w-full max-w-none animate-slide-in-up rounded-t-2xl',
        className,
      )}
    >
      <header className="flex items-center justify-between gap-4 border-b border-hairline px-5 py-4">
        <h2 id={titleId} className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-heading">
          {title}
        </h2>
        <IconButton label="Close" tone="ghost" onClick={onClose} className="size-10 lg:size-10">
          <Icon name="close" />
        </IconButton>
      </header>
      {/* Content only exists while open: no duplicate (hidden) controls in the DOM/a11y tree. */}
      {open && (
        <>
          <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
          {footer && <footer className="border-t border-hairline px-5 py-4">{footer}</footer>}
        </>
      )}
    </dialog>
  )
}
