import { memo } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { StarRating } from '../../../components/ui/StarRating'
import { cn } from '../../../lib/cn'
import { formatDateTime, formatInteger } from '../../../lib/format'
import { initials, type Review, type Vote } from '../model/reviews'

const AVATAR_COLORS = ['#C8D6F5', '#F5D0C5', '#CDEBD8', '#E9D5F5', '#F7E3B5']

interface ReviewItemProps {
  review: Review
  vote: Vote | undefined
  onVote: (reviewId: string, vote: Vote) => void
}

const voteButton =
  'inline-flex h-8 items-center justify-center gap-1 rounded-md border border-hairline text-xs leading-[1.6] text-deep transition-colors hover:bg-surface lg:h-[50px] lg:gap-2 lg:rounded-lg lg:text-base'

export const ReviewItem = memo(function ReviewItem({ review, vote, onVote }: ReviewItemProps) {
  const likes = review.likes + (vote === 'like' ? 1 : 0)
  const color = AVATAR_COLORS[review.author.length % AVATAR_COLORS.length]

  return (
    <article className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-3 lg:gap-4">
        <StarRating value={review.rating} />
        <div className="flex flex-col gap-0.5 lg:gap-1">
          <h3 className="text-sm leading-[1.4] font-semibold tracking-[-0.2px] text-ink lg:text-lg">{review.title}</h3>
          <time dateTime={review.createdAt} className="text-xs leading-[1.6] text-slate lg:text-base">
            {formatDateTime(review.createdAt)}
          </time>
          {review.body && <p className="mt-2 text-sm leading-[1.5] text-body lg:text-base">{review.body}</p>}
        </div>
        <div className="hidden lg:mt-2 lg:block">
          <Author name={review.author} color={color} />
        </div>
      </div>

      <div className="flex items-center justify-between lg:justify-end">
        <div className="lg:hidden">
          <Author name={review.author} color={color} />
        </div>
        <div className="flex gap-2 lg:gap-4">
          <button
            type="button"
            aria-pressed={vote === 'like'}
            aria-label={`Helpful, ${likes} people found this helpful`}
            onClick={() => onVote(review.id, 'like')}
            className={cn(voteButton, 'min-w-[62px] px-1 lg:min-w-20')}
          >
            <Icon
              name={vote === 'like' ? 'likeFilled' : 'like'}
              className={cn('size-5 lg:size-6', vote === 'like' && 'text-success lg:text-ink')}
            />
            {formatInteger(likes)}
          </button>
          <button
            type="button"
            aria-pressed={vote === 'dislike'}
            aria-label="Not helpful"
            onClick={() => onVote(review.id, 'dislike')}
            className={cn(voteButton, 'w-8 lg:w-12', vote === 'dislike' && 'bg-selected')}
          >
            <Icon name="dislike" className="size-5 lg:size-6" />
          </button>
        </div>
      </div>
    </article>
  )
})

function Author({ name, color }: { name: string; color: string | undefined }) {
  return (
    <p className="flex items-center gap-2 lg:gap-3">
      <span
        aria-hidden="true"
        className="inline-flex size-6 items-center justify-center rounded-full text-[10px] font-semibold text-heading lg:size-8 lg:text-xs"
        style={{ backgroundColor: color }}
      >
        {initials(name)}
      </span>
      <span className="text-xs leading-[1.6] font-medium text-deep lg:text-base">{name}</span>
    </p>
  )
}
