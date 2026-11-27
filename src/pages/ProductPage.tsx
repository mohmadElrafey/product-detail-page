import { lazy, Suspense } from 'react'
import { AnnouncementBar } from '../components/layout/AnnouncementBar'
import { Breadcrumbs, type Crumb } from '../components/layout/Breadcrumbs'
import { Footer } from '../components/layout/Footer'
import { Header } from '../components/layout/Header'
import { DashedRule } from '../components/ui/Dashed'
import { CartButton } from '../features/cart/components/CartButton'
import { useWishlistStore } from '../features/cart/store/wishlist.store'
import { ProductDetails } from '../features/product/components/ProductDetails'
import { ProductError, ProductSkeleton } from '../features/product/components/ProductStates'
import { useProduct } from '../features/product/hooks/useProduct'
import type { Category, Product } from '../features/product/model/product'
import { ProductRail } from '../features/recommendations/components/ProductRail'
import { POPULAR_PRODUCTS, RELATED_PRODUCTS } from '../features/recommendations/data/recommendations.fixture'
import { useProductReviews } from '../features/reviews/hooks/useProductReviews'

/*
 * Page layer: the only place that composes several features (product, cart,
 * reviews, recommendations) with the shared layout. Features never import pages.
 */

// Below-the-fold and interaction-only code is split into its own chunk.
const ProductReviews = lazy(() => import('../features/reviews/components/ProductReviews'))

/** Wires the cart and wishlist features into the feature-free layout Header. */
function SiteHeader({ categories }: { categories: Category[] }) {
  // Subscribed here (not in ProductPage) so a wishlist change re-renders only the header.
  const wishlistCount = useWishlistStore((state) => state.productIds.length)
  return <Header categories={categories} cartButton={<CartButton />} wishlistCount={wishlistCount} />
}

function buildCrumbs(product: Product | undefined): Crumb[] {
  const category = product?.categories[0]
  return [
    { label: 'Homepage', href: '/' },
    ...(category ? [{ label: category.name, href: `/categories/${category.slug}` }] : []),
    { label: product?.name ?? 'Product' },
  ]
}

function LoadedProduct({ product }: { product: Product }) {
  const { summary } = useProductReviews(product.id)
  return (
    <>
      <ProductDetails product={product} rating={summary.average} />
      <div className="page-container">
        <DashedRule />
      </div>
      <ProductRail title="Related Product" products={RELATED_PRODUCTS} viewAllHref="/products?related=1" />
      <div className="page-container">
        <DashedRule />
      </div>
      <Suspense fallback={<div className="page-container h-[600px]" aria-busy="true" />}>
        <ProductReviews productId={product.id} />
      </Suspense>
      <div className="page-container">
        <DashedRule />
      </div>
      <ProductRail title="Popular this week" products={POPULAR_PRODUCTS} viewAllHref="/products?sort=popular" />
    </>
  )
}

export function ProductPage({ slug }: { slug: string }) {
  const { data: product, error, refetch, isFetching } = useProduct(slug)

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <SiteHeader categories={product?.categories ?? []} />
      <Breadcrumbs items={buildCrumbs(product)} />

      <main id="main" className="flex flex-col gap-14 pt-6 lg:gap-20 lg:pt-[31px]">
        {/* Data wins over error: a failed *background* refetch must not replace a loaded page. */}
        {product ? (
          <LoadedProduct product={product} />
        ) : error ? (
          <ProductError error={error} retrying={isFetching} onRetry={() => void refetch()} />
        ) : (
          <ProductSkeleton />
        )}
      </main>

      <div className="mt-14 lg:mt-20">
        <Footer />
      </div>
    </>
  )
}
