import { cn } from '../../lib/cn'

/**
 * Text wordmark that occupies the logo slot of the design (170×32, 140×26 on mobile).
 * The Figma file uses a real retailer's logo, which we must not ship, so the store
 * name from the API data is set in the same wide-tracked, two-line arrangement.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <a href="/" aria-label="Achilles — home" className={cn('inline-flex flex-col items-center leading-none text-ink', className)}>
      <span className="text-[19px] font-medium tracking-[0.3em] lg:text-[23px]">ACHILLES</span>
      <span className="mt-1 text-[8px] font-semibold tracking-[0.42em] lg:text-[9.5px]">& SHOES</span>
    </a>
  )
}
