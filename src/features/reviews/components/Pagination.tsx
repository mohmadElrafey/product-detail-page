import { Icon } from '../../../components/ui/Icon'
import { cn } from '../../../lib/cn'
import { getPageList } from '../model/reviews'

interface PaginationProps {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

/** 44px squares (36 on mobile); current page outlined in #333 and marked aria-current. */
export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null
  const cell =
    'inline-flex size-9 items-center justify-center rounded-md border text-[11.5px] leading-[1.6] font-medium lg:size-11 lg:rounded-lg lg:text-sm'

  return (
    <nav aria-label="Reviews pages" className="flex justify-center">
      <ul className="flex items-center gap-[6.6px] lg:gap-2">
        {getPageList(page, pageCount).map((item, index) =>
          item === 'ellipsis' ? (
            <li key={`ellipsis-${index}`} aria-hidden="true" className={cn(cell, 'border-hairline text-subtle')}>
              ...
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onChange(item)}
                className={cn(
                  cell,
                  item === page
                    ? 'border-strong bg-white text-ink'
                    : 'border-hairline text-subtle hover:border-strong hover:text-ink',
                )}
              >
                {item}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            aria-label="Next page"
            disabled={page >= pageCount}
            onClick={() => onChange(page + 1)}
            className={cn(cell, 'border-transparent text-ink disabled:opacity-30')}
          >
            <Icon name="arrowNext" size={24} className="size-5 lg:size-6" />
          </button>
        </li>
      </ul>
    </nav>
  )
}
