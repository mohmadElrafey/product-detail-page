import { DashedRule } from '../../../components/ui/Dashed'
import { Icon } from '../../../components/ui/Icon'
import { formatInteger, formatRating } from '../../../lib/format'
import type { VariantSelectionState } from '../hooks/useVariantSelection'
import type { Product } from '../model/product'
import { PriceTag } from './PriceTag'
import { ProductDescription } from './ProductDescription'
import { PurchasePanel } from './PurchasePanel'

interface ProductInfoProps {
  product: Product
  selection: VariantSelectionState
  rating: number
}

/** Right column on desktop / below the gallery on mobile. */
export function ProductInfo({ product, selection, rating }: ProductInfoProps) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3.5 lg:gap-5">
        <div className="flex flex-col gap-2 lg:gap-3">
          <p className="text-[13px] leading-[1.2] font-medium tracking-[0.01em] text-muted lg:text-base">{product.brand}</p>
          <h1 className="text-[23px] leading-[1.2] font-semibold tracking-[-0.005em] text-heading lg:text-4xl">
            {product.name}
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <PriceTag price={selection.price} />
          <a href="#reviews" className="flex items-center gap-1 lg:gap-2" aria-label={`${formatInteger(product.soldCount)} sold, rated ${formatRating(rating)} out of 5. Jump to reviews`}>
            <span className="text-base leading-none text-body lg:text-xl">{formatInteger(product.soldCount)} Sold</span>
            <span aria-hidden="true" className="size-1.5 rounded-full bg-dot" />
            <span className="flex items-center gap-1">
              <Icon name="starSharp" className="size-5 text-star lg:size-6" />
              <span className="text-xl leading-none font-semibold text-ink lg:text-2xl">{formatRating(rating)}</span>
            </span>
          </a>
        </div>
      </div>

      <DashedRule className="mt-7" />

      <div className="mt-6 flex flex-col gap-8 lg:mt-7 lg:gap-10">
        <ProductDescription html={product.descriptionHtml} />
        <PurchasePanel product={product} selection={selection} />
      </div>

      <a
        href="/shipping-policy"
        className="mt-[18px] hidden self-start text-base leading-[1.2] font-medium text-subtle underline underline-offset-2 hover:text-ink lg:mt-[38px] lg:block"
      >
        Delivery T&amp;C
      </a>
    </div>
  )
}
