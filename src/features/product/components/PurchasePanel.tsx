import { useRef } from 'react'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { useAddToCart } from '../hooks/useAddToCart'
import type { VariantSelectionState } from '../hooks/useVariantSelection'
import type { Product, Variation } from '../model/product'
import { StickyBuyBar } from './StickyBuyBar'
import { StockStatus } from './StockStatus'
import { VariationSelector } from './VariationSelector'

interface PurchasePanelProps {
  product: Product
  selection: VariantSelectionState
}

/** Hoisted static JSX: only text variations (size) get the size-chart link. */
const sizeChartLink = (
  <a
    href="/size-guide"
    className="hidden text-base leading-[1.2] font-medium text-secondary underline underline-offset-2 hover:text-ink lg:inline"
  >
    View Size Chart
  </a>
)
const asideFor = (variation: Variation) => (variation.kind === 'text' ? sizeChartLink : undefined)

/**
 * Variations → CTAs (Figma): 40px between groups (32 mobile), 24px between buttons.
 * Desktop buttons follow Figma sizing: Add To Cart = Fill, Checkout Now = Fixed 200px.
 * Size → buttons is 56px (48 mobile) = the parent stack's gap (40/32) + this mt (16).
 * Quantity is chosen in the cart drawer (each click adds one unit).
 */
export function PurchasePanel({ product, selection }: PurchasePanelProps) {
  const ctaRef = useRef<HTMLDivElement>(null)
  const { add, justAdded, errorFor, registerGroup } = useAddToCart(product, selection)
  const outOfStock = selection.stock.status === 'out_of_stock'
  const hasMissing = selection.missing.length > 0

  return (
    <>
      <div className="flex flex-col gap-8 lg:gap-10">
        {product.variations.map((variation) => (
          <VariationSelector
            key={variation.id}
            ref={registerGroup(variation.name)}
            variation={variation}
            value={selection.selection[variation.name]}
            isAvailable={(value) => selection.isAvailable(variation.name, value)}
            onSelect={(value) => selection.select(variation.name, value)}
            error={errorFor(variation)}
            aside={asideFor(variation)}
          />
        ))}
      </div>

      <div ref={ctaRef} className="mt-4 flex flex-col items-start gap-[18px] lg:flex-row lg:gap-6">
        <Button
          className="w-[296px] max-w-full lg:w-auto lg:flex-1"
          disabled={outOfStock}
          onClick={() => add()}
          aria-describedby={hasMissing ? 'cta-hint' : undefined}
        >
          {outOfStock ? (
            'Out of stock'
          ) : justAdded ? (
            <>
              <Icon name="check" /> Added
            </>
          ) : (
            'Add To Cart'
          )}
        </Button>
        <Button
          variant="outline"
          className="w-[187px] max-w-full lg:w-[200px] lg:shrink-0"
          disabled={outOfStock}
          onClick={() => add({ openDrawer: true })}
        >
          Checkout Now
        </Button>
      </div>

      {/* Stock is only surfaced when it matters (tracked & low/out), so the design stays clean. */}
      {selection.stock.status !== 'in_stock' ? (
        <div className="mt-4">
          <StockStatus {...selection.stock} />
        </div>
      ) : null}

      {hasMissing ? (
        <p id="cta-hint" className="sr-only">
          Select {selection.missing.map((variation) => variation.label.toLowerCase()).join(' and ')} first.
        </p>
      ) : null}

      {product.stickyBuyBar ? (
        <StickyBuyBar targetRef={ctaRef} price={selection.price} disabled={outOfStock} onAdd={() => add()} />
      ) : null}
    </>
  )
}
