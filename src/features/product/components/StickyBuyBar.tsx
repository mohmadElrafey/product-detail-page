import { useEffect, useState, type ReactNode, type RefObject } from 'react'
import { formatPrice } from '../../../lib/format'
import type { Money } from '../model/product'

interface StickyBuyBarProps {
  /** The in-page CTA; the bar only appears once it scrolls out of view. */
  targetRef: RefObject<HTMLElement | null>
  price: Money
  disabled: boolean
  onAdd: () => void
  /** Shown instead of the button once the selected variant is already in the cart. */
  inCartStepper?: ReactNode
}

/**
 * Mobile-only buy bar, driven by the store flag `is_fixed_bottom_buy`.
 * IntersectionObserver (no scroll listeners) tells us when the main CTA leaves
 * the viewport; the bar is `lg:hidden` so desktop never renders it visibly.
 */
export function StickyBuyBar({ targetRef, price, disabled, onAdd, inCartStepper }: StickyBuyBarProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return
    const observer = new IntersectionObserver(([entry]) => {
      // Show only after the CTA is *above* the viewport (scrolled past), not before reaching it.
      if (entry) setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    })
    observer.observe(target)
    return () => observer.disconnect()
  }, [targetRef])

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 animate-slide-in-up border-t border-hairline bg-white/95 px-5 py-3 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-[600px] items-center gap-4">
        <div className="flex-1">
          {price.compareAt !== null && (
            <p className="text-xs text-body line-through">{formatPrice(price.compareAt)}</p>
          )}
          <p className="text-lg leading-none font-semibold">{formatPrice(price.current)}</p>
        </div>
        {inCartStepper ?? (
          <button
            type="button"
            onClick={onAdd}
            disabled={disabled}
            className="h-12 rounded-md bg-ink px-8 text-base font-semibold text-white disabled:bg-muted"
          >
            Add To Cart
          </button>
        )}
      </div>
    </div>
  )
}
