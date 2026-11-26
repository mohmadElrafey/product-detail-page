import { DashedBox } from '../../../components/ui/Dashed'
import { Icon } from '../../../components/ui/Icon'
import { StarRating } from '../../../components/ui/StarRating'
import { formatCompact, formatInteger, formatRating } from '../../../lib/format'
import type { ReviewSummary } from '../model/reviews'

/**
 * Score ring: an SVG circle whose `stroke-dasharray` encodes `average / 5`,
 * starting at 3 o'clock like the Figma arc.
 */
function RatingRing({ value }: { value: number }) {
  const strokeWidth = 5 // Figma ellipse innerRadius 0.9 → ring is 5% of the diameter
  const radius = 50 - strokeWidth / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(value / 5, 1)
  return (
    <div className="relative size-16 shrink-0 lg:size-[84px]">
      <svg viewBox="0 0 100 100" className="size-full" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-hairline)" strokeWidth={strokeWidth} />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--color-star)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference * progress} ${circumference}`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg leading-[1.4] font-semibold tracking-[-0.2px] text-deep lg:text-xl">
        {formatRating(value)}
      </span>
    </div>
  )
}

function RatingBars({ summary }: { summary: ReviewSummary }) {
  const max = Math.max(...summary.distribution.map((row) => row.count), 1)
  return (
    <ul className="flex flex-col gap-3" aria-label="Rating distribution">
      {summary.distribution.map(({ stars, count }) => (
        <li key={stars} className="flex h-[17px] items-center gap-3 lg:h-[26px] lg:gap-6">
          <span className="flex w-10 shrink-0 items-center text-xs leading-[1.6] font-medium text-deep lg:w-[49px] lg:gap-1 lg:text-base">
            {stars.toFixed(1)}
            <Icon name="star" className="size-4 text-star lg:size-5" />
          </span>
          <span
            className="h-2 flex-1 overflow-hidden bg-hairline lg:rounded-lg"
            role="meter"
            aria-label={`${stars} star reviews`}
            aria-valuemin={0}
            aria-valuemax={summary.total}
            aria-valuenow={count}
          >
            <span
              className="block h-full bg-heading transition-[width] duration-500 lg:rounded-lg"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </span>
          <span className="w-[39px] shrink-0 text-right text-xs leading-[1.6] font-medium text-deep lg:text-left lg:text-base">
            {formatInteger(count)}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function RatingSummary({ summary }: { summary: ReviewSummary }) {
  return (
    <DashedBox
      radius={8}
      className="grid gap-6 px-[17px] py-4 lg:grid-cols-[228px_1fr] lg:items-start lg:gap-[120px] lg:px-6 lg:py-6"
    >
      <div className="flex items-center gap-4">
        <RatingRing value={summary.average} />
        <div className="flex flex-col gap-1 lg:gap-2">
          <StarRating value={summary.average} size={20} />
          <p className="text-xs leading-[1.6] font-medium text-deep lg:text-base lg:font-normal lg:text-secondary">
            from {formatCompact(summary.total)} reviews
          </p>
        </div>
      </div>
      <RatingBars summary={summary} />
    </DashedBox>
  )
}
