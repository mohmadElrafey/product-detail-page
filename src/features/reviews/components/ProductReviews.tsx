import { useCallback, useMemo, useRef, useState } from 'react'
import { DashedBox, DashedRule } from '../../../components/ui/Dashed'
import { Icon } from '../../../components/ui/Icon'
import { Sheet } from '../../../components/ui/Sheet'
import { cn } from '../../../lib/cn'
import { EMPTY_FILTERS, filterReviews, paginate, type ReviewFilters as Filters, type ReviewTab, type Vote } from '../model/reviews'
import { useProductReviews } from '../hooks/useProductReviews'
import { Pagination } from './Pagination'
import { RatingSummary } from './RatingSummary'
import { ReviewFilters } from './ReviewFilters'
import { ReviewItem } from './ReviewItem'

const PAGE_SIZE = 4
const TABS: { id: ReviewTab; label: string }[] = [
  { id: 'all', label: 'All Reviews' },
  { id: 'media', label: 'With Photo & Video' },
  { id: 'description', label: 'With Description' },
]

/**
 * Review state (filters, page, votes) is local UI state: nothing else on the page
 * needs it, so it stays out of the global store. Filtering and pagination are pure
 * functions (model/reviews.ts) memoized on their inputs.
 */
export default function ProductReviews({ productId }: { productId: string }) {
  const { reviews, summary } = useProductReviews(productId)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [votes, setVotes] = useState<Record<string, Vote | undefined>>({})
  const [sheetOpen, setSheetOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => filterReviews(reviews, filters), [reviews, filters])
  const current = paginate(filtered, page, PAGE_SIZE)
  const activeFilterCount = filters.ratings.length + filters.topics.length

  const updateFilters = (next: Filters) => {
    setFilters(next)
    setPage(1) // a new result set always starts at page 1
  }

  const onVote = useCallback(
    (reviewId: string, vote: Vote) =>
      setVotes((state) => ({ ...state, [reviewId]: state[reviewId] === vote ? undefined : vote })),
    [],
  )

  const goToPage = (next: number) => {
    setPage(next)
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="page-container defer-render scroll-mt-6">
      <h2 id="reviews-title" className="text-2xl leading-[1.4] font-semibold tracking-[-0.2px] text-ink lg:text-[28px] lg:leading-[1.2] lg:tracking-normal">
        Product Reviews
      </h2>

      <div className="mt-4 lg:mt-6">
        <RatingSummary summary={summary} />
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-[278px_minmax(0,1fr)]">
        <DashedBox radius={8} color="#BBBBBB" className="hidden self-start p-6 lg:block">
          <h3 className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-heading">Reviews Filter</h3>
          <DashedRule className="mt-4 mb-6" />
          <ReviewFilters filters={filters} onChange={updateFilters} />
        </DashedBox>

        <div ref={listRef} className="flex scroll-mt-6 flex-col gap-8 lg:gap-[34px]">
          <div className="flex flex-col gap-4">
            <h3 className="text-base leading-[1.4] font-semibold tracking-[-0.2px] text-ink lg:text-xl lg:text-heading">
              Review Lists
            </h3>
            <div className="flex items-start justify-between gap-3">
              <div role="group" aria-label="Show" className="flex flex-wrap gap-2 lg:gap-3">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    aria-pressed={filters.tab === tab.id}
                    onClick={() => updateFilters({ ...filters, tab: tab.id })}
                    className={cn(
                      'h-8 rounded-md border px-2.5 text-xs leading-[1.6] font-medium text-ink transition-colors lg:h-[42px] lg:rounded-lg lg:px-4 lg:text-sm',
                      filters.tab === tab.id ? 'border-strong bg-selected lg:px-5' : 'border-hairline hover:border-strong',
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                aria-label={`Filter reviews${activeFilterCount ? `, ${activeFilterCount} active` : ''}`}
                className="relative inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-hairline text-deep lg:hidden"
              >
                <Icon name="filter" size={17} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 inline-flex size-4 items-center justify-center rounded-full bg-ink text-[9px] text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <p className="sr-only" aria-live="polite">
            {filtered.length} reviews match
          </p>

          {current.items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg bg-surface px-6 py-12 text-center">
              <p className="text-lg font-semibold text-heading">No reviews match these filters</p>
              <button type="button" onClick={() => updateFilters(EMPTY_FILTERS)} className="text-sm font-medium underline">
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-6 lg:gap-8">
              {current.items.map((review, index) => (
                <li key={review.id} className="flex flex-col gap-6 lg:gap-8">
                  {index > 0 && (
                    <>
                      <hr className="border-hairline lg:hidden" />
                      <DashedRule className="hidden lg:block" />
                    </>
                  )}
                  <ReviewItem review={review} vote={votes[review.id]} onVote={onVote} />
                </li>
              ))}
            </ul>
          )}

          <Pagination page={current.page} pageCount={current.pageCount} onChange={goToPage} />
        </div>
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Reviews Filter" side="bottom"
        footer={
          <button type="button" onClick={() => setSheetOpen(false)} className="h-12 w-full rounded-md bg-ink text-base font-semibold text-white">
            Show {filtered.length} reviews
          </button>
        }
      >
        <div className="p-5">
          <ReviewFilters filters={filters} onChange={updateFilters} />
        </div>
      </Sheet>
    </section>
  )
}
