import { memo } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { formatInteger, formatPrice, formatRating } from '../../../lib/format'
import type { ProductSummary } from '../data/recommendations.fixture'

/**
 * Card: 212×284 image well (157×210 mobile), brand / price / name / rating rows.
 * The whole card is one link (single tab stop); `memo` because rails re-render
 * with the page but their props never change.
 */
export const ProductCard = memo(function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <article className="group relative flex flex-col gap-3 lg:gap-4">
      <div className="aspect-[212/284] overflow-hidden rounded-md bg-surface lg:rounded-lg">
        <img
          src={product.image}
          alt=""
          width={212}
          height={284}
          loading="lazy"
          decoding="async"
          className="size-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-1.5 lg:gap-2">
        <div className="flex flex-col gap-1 lg:gap-1.5">
          <p className="text-sm leading-[1.4] font-semibold tracking-[-0.1px] text-heading lg:text-lg lg:tracking-[-0.2px]">
            {product.brand}
          </p>
          <p className="text-base leading-[1.4] font-semibold tracking-[-0.1px] text-ink lg:text-xl lg:tracking-[-0.2px]">
            {formatPrice(product.price)}
          </p>
          <h3 className="line-clamp-2 text-[13px] leading-[1.2] text-subtle lg:text-base">
            <a href={`/products/${product.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
              {product.name}
            </a>
          </h3>
        </div>
        <p className="flex items-center gap-1.5 text-xs leading-[1.6] lg:gap-2 lg:text-base">
          <Icon name="star" className="size-3.5 text-star lg:size-6" />
          <span className="text-deep">{formatRating(product.rating)}</span>
          <span aria-hidden="true" className="size-[3px] rounded-full bg-dot lg:size-1" />
          <span className="text-body">{formatInteger(product.soldCount)} Sold</span>
        </p>
      </div>
    </article>
  )
})
