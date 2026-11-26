import { useId } from 'react'
import type { ProductSummary } from '../data/recommendations.fixture'
import { ProductCard } from './ProductCard'

interface ProductRailProps {
  title: string
  products: ProductSummary[]
  viewAllHref: string
}

/**
 * Grid: 2 columns on mobile (3 rows), 3 on tablet, 5 on desktop (35px gaps,
 * 5 × 212 + 4 × 35 = 1200). Desktop shows one row, so the 6th card is hidden there.
 */
export function ProductRail({ title, products, viewAllHref }: ProductRailProps) {
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className="page-container defer-render">
      <div className="flex items-end justify-between gap-4">
        <h2 id={titleId} className="text-2xl leading-[1.2] font-semibold text-heading lg:text-[28px] lg:text-ink">
          {title}
        </h2>
        <a
          href={viewAllHref}
          className="text-base leading-[1.2] font-medium text-secondary underline underline-offset-2 hover:text-ink"
        >
          View All<span className="sr-only"> {title}</span>
        </a>
      </div>
      <ul className="mt-10 grid grid-cols-2 gap-x-[21px] gap-y-9 md:grid-cols-3 md:gap-x-6 lg:mt-6 lg:grid-cols-5 lg:gap-x-[35px] lg:[&>li:nth-child(n+6)]:hidden">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  )
}
