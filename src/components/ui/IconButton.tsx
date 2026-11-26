import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: an icon-only control must have an accessible name. */
  label: string
  tone?: 'surface' | 'ghost'
}

/** 44×44 on mobile (min touch target), 52×52 from `lg` — both straight from Figma. */
export function IconButton({ label, tone = 'surface', className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-md text-ink transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 lg:size-[52px] lg:rounded-lg',
        tone === 'surface' ? 'bg-surface hover:bg-selected' : 'hover:bg-surface',
        className,
      )}
      {...rest}
    />
  )
}
