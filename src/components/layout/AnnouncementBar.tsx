import { useCountdown } from '../../hooks/useCountdown'

/** Figma "offers": 42px black bar (58px / two lines on mobile) with a countdown pill. */
export function AnnouncementBar() {
  const remaining = useCountdown()
  return (
    <aside aria-label="Promotion" className="bg-ink px-[66px] py-3 text-white lg:px-5">
      <p className="mx-auto max-w-[243px] text-center text-sm leading-[1.2] font-medium lg:max-w-none">
        New season coming! Discount 10% for all product! Checkout Now!
        <span
          className="ml-1.5 inline-flex h-4 items-center rounded-full bg-pill px-1.5 align-[1px] text-[11px] leading-none lg:ml-4 lg:h-[18px] lg:px-2 lg:align-middle lg:text-xs"
          aria-label={`Offer ends in ${remaining}`}
        >
          <time>{remaining}</time>
        </span>
      </p>
    </aside>
  )
}
