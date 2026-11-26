import { formatPrice } from '../../../lib/format'
import type { Money } from '../model/product'

/**
 * Old price (18px, struck through, #666) + current price (28px semibold) — 14/20 on mobile.
 * Screen readers hear "Original price … Sale price …" instead of two bare numbers.
 */
export function PriceTag({ price }: { price: Money }) {
  return (
    <p className="flex items-center gap-4">
      {price.compareAt !== null && (
        <span className="text-sm leading-[1.2] font-medium text-body line-through lg:text-lg">
          <span className="sr-only">Original price </span>
          {formatPrice(price.compareAt)}
        </span>
      )}
      <span data-testid="product-price" className="text-xl leading-[1.2] font-semibold text-ink lg:text-[28px]">
        {price.compareAt !== null && <span className="sr-only">Sale price </span>}
        {formatPrice(price.current)}
      </span>
    </p>
  )
}
