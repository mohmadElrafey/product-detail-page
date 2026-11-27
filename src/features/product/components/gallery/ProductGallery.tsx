import { useState, type KeyboardEvent } from 'react'
import { Icon } from '../../../../components/ui/Icon'
import { IconButton } from '../../../../components/ui/IconButton'
import { toast } from '../../../../lib/toast/toast.store'
import { cn } from '../../../../lib/cn'
import { useWishlistStore } from '../../../cart/store/wishlist.store'
import type { Product } from '../../model/product'
import { ZoomableImage } from './ZoomableImage'

interface ProductGalleryProps {
  product: Product
  /** Image the current swatch selection points to (-1 = none). */
  preferredIndex: number
}

async function shareProduct(name: string) {
  const url = window.location.href
  try {
    if (navigator.share) {
      await navigator.share({ title: name, url })
      return
    }
    await navigator.clipboard.writeText(url)
    toast('Link copied to clipboard')
  } catch {
    // The user dismissed the native share sheet — not an error worth surfacing.
  }
}

/**
 * Layout (from Figma): [main image | action column] with thumbnails underneath.
 * Desktop: 458×610 image, 52px actions, 35px gap, 76×100 thumbs.
 * Mobile: 279×372 image, 44px actions, 12px gap, thumbs span the full width.
 */
export function ProductGallery({ product, preferredIndex }: ProductGalleryProps) {
  const { images } = product
  const [activeIndex, setActiveIndex] = useState(Math.max(preferredIndex, 0))
  const [lastPreferred, setLastPreferred] = useState(preferredIndex)

  // Picking a swatch jumps to its photo. Adjusting state during render (instead of
  // an effect) avoids a flash of the old image — the React-recommended pattern.
  if (preferredIndex !== lastPreferred) {
    setLastPreferred(preferredIndex)
    if (preferredIndex >= 0) setActiveIndex(preferredIndex)
  }

  const saved = useWishlistStore((state) => state.productIds.includes(product.id))
  const toggleWishlist = useWishlistStore((state) => state.toggle)

  const count = images.length
  const go = (delta: number) => setActiveIndex((index) => (index + delta + count) % count)
  const active = images[activeIndex] ?? images[0]

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') go(1)
    if (event.key === 'ArrowLeft') go(-1)
  }

  if (!active) {
    return <div className="aspect-[3/4] rounded-lg bg-surface" aria-label="No image available" />
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Product images"
      className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-5 lg:gap-x-[35px] lg:gap-y-6"
    >
      <div
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label={`Image ${activeIndex + 1} of ${count}. Use left and right arrow keys to browse.`}
        className="aspect-[458/610] overflow-hidden rounded-lg bg-surface"
      >
        <ZoomableImage key={active.src} src={active.src} alt={active.alt} onSwipe={(direction) => go(direction === 'next' ? 1 : -1)} />
      </div>

      <div className="flex flex-col justify-between">
        <div className="flex flex-col gap-5">
          <IconButton label="Share" onClick={() => void shareProduct(product.name)}>
            <Icon name="share" />
          </IconButton>
          <IconButton
            label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={saved}
            onClick={() => toast(toggleWishlist(product.id) ? 'Saved to your wishlist' : 'Removed from your wishlist')}
          >
            <Icon name={saved ? 'heartFilled' : 'heart'} className={saved ? 'text-danger' : undefined} />
          </IconButton>
        </div>
        {count > 1 && (
          <div className="flex flex-col gap-4 lg:gap-5">
            <IconButton label="Previous image" onClick={() => go(-1)}>
              <Icon name="chevronLeft" />
            </IconButton>
            <IconButton label="Next image" onClick={() => go(1)}>
              <Icon name="chevronRight" />
            </IconButton>
          </div>
        )}
      </div>

      {count > 1 && (
        <ul
          aria-label="Choose image"
          className="col-span-2 grid snap-x auto-cols-[calc((100%-4*14.7px)/5)] grid-flow-col gap-[14.7px] overflow-x-auto [scrollbar-width:none] lg:col-span-1 lg:auto-cols-[calc((100%-4*20px)/5)] lg:gap-5"
        >
          {images.map((image, index) => (
            <li key={image.src} className="snap-start">
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show image ${index + 1}: ${image.alt}`}
                aria-current={index === activeIndex}
                className={cn(
                  'block aspect-[76/100] w-full overflow-hidden rounded-md bg-surface ring-inset transition-shadow lg:rounded-lg',
                  index === activeIndex ? 'ring-1 ring-ink' : 'hover:ring-1 hover:ring-option',
                )}
              >
                <img
                  src={image.src}
                  alt=""
                  width={76}
                  height={100}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-contain mix-blend-multiply"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
