import { Icon } from './Icon'

interface StarRatingProps {
  value: number
  size?: number
  gap?: number
}

/** Five stars, filled up to `value` (rounded). Exposed to AT as a single image with a label. */
export function StarRating({ value, size = 20, gap = 4 }: StarRatingProps) {
  const filled = Math.round(value)
  return (
    <span role="img" aria-label={`Rated ${value} out of 5`} className="inline-flex" style={{ gap }}>
      {Array.from({ length: 5 }, (_, index) => (
        <Icon key={index} name="star" size={size} className={index < filled ? 'text-star' : 'text-hairline'} />
      ))}
    </span>
  )
}
