import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'outline'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ink text-white font-semibold hover:bg-heading active:bg-black disabled:bg-muted',
  outline: 'bg-white text-strong font-medium border border-outline hover:border-strong hover:bg-surface',
}

/**
 * Figma CTA: 58px tall (56 on mobile), 8px radius (6 on mobile), 20px text (18 mobile).
 * Disabled is expressed with `aria-disabled` + `disabled`, and focus stays visible.
 */
export function Button({ variant = 'primary', className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-14 items-center justify-center gap-2 rounded-md px-6 text-lg leading-[1.2] transition-colors duration-150 lg:h-[58px] lg:rounded-lg lg:text-xl disabled:cursor-not-allowed',
        VARIANTS[variant],
        className,
      )}
      {...rest}
    />
  )
}
