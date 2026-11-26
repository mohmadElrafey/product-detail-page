import { useRef, useState, type PointerEvent } from 'react'
import { cn } from '../../../../lib/cn'

interface ZoomableImageProps {
  src: string
  alt: string
  onSwipe?: (direction: 'next' | 'previous') => void
}

const ZOOM = 2.2
const SWIPE_THRESHOLD_PX = 40

/**
 * Main gallery image.
 * - Mouse: zoom on hover, the zoom origin follows the cursor (no extra hi-res request).
 * - Touch: tap toggles zoom at the tapped point; horizontal swipe changes image when not zoomed.
 * - Image change: `key={src}` remounts the <img> so the fade-in animation replays (crossfade feel).
 * The transform runs on the compositor (transform/opacity only), so it stays at 60fps.
 */
export function ZoomableImage({ src, alt, onSwipe }: ZoomableImageProps) {
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')
  const swipeStart = useRef<{ x: number; y: number } | null>(null)

  const updateOrigin = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setOrigin(`${x}% ${y}%`)
  }

  return (
    <div
      className={cn(
        'relative size-full touch-pan-y overflow-hidden select-none',
        zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in',
      )}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'mouse') return
        updateOrigin(event)
        setZoomed(true)
      }}
      onPointerMove={(event) => {
        if (event.pointerType === 'mouse' || zoomed) updateOrigin(event)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setZoomed(false)
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== 'mouse') swipeStart.current = { x: event.clientX, y: event.clientY }
      }}
      onPointerUp={(event) => {
        const start = swipeStart.current
        swipeStart.current = null
        if (event.pointerType === 'mouse' || !start) return
        const dx = event.clientX - start.x
        const dy = event.clientY - start.y
        if (!zoomed && Math.abs(dx) > SWIPE_THRESHOLD_PX && Math.abs(dx) > Math.abs(dy)) {
          onSwipe?.(dx < 0 ? 'next' : 'previous')
          return
        }
        updateOrigin(event)
        setZoomed((value) => !value)
      }}
    >
      <img
        key={src}
        src={src}
        alt={alt}
        width={458}
        height={610}
        fetchPriority="high"
        decoding="async"
        draggable={false}
        className="size-full animate-fade-in object-contain mix-blend-multiply transition-transform duration-200 ease-out"
        style={{ transform: zoomed ? `scale(${ZOOM})` : undefined, transformOrigin: origin }}
      />
    </div>
  )
}
