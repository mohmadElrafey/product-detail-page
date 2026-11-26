import type { Product } from '../model/product'
import { getImageIndexForSelection } from '../model/variants'
import { useVariantSelection } from '../hooks/useVariantSelection'
import { ProductGallery } from './gallery/ProductGallery'
import { ProductInfo } from './ProductInfo'

/**
 * Hero section: gallery (545px) + info (520px), 135px apart at 1200px.
 * The two tracks are `minmax(0, Npx)` so they shrink proportionally on smaller
 * desktops instead of overflowing; below `lg` they stack (mobile/tablet frame).
 */
export function ProductDetails({ product, rating }: { product: Product; rating: number }) {
  const selection = useVariantSelection(product)

  return (
    <section aria-label="Product" className="page-container">
      <div className="grid gap-14 md:grid-cols-2 md:gap-8 lg:grid-cols-[minmax(0,545px)_minmax(0,520px)] lg:justify-between lg:gap-10">
        <div className="md:sticky md:top-6 md:self-start">
          <ProductGallery product={product} preferredIndex={getImageIndexForSelection(product, selection.selection)} />
        </div>
        <div className="lg:pt-[9px]">
          <ProductInfo product={product} selection={selection} rating={rating} />
        </div>
      </div>
    </section>
  )
}
