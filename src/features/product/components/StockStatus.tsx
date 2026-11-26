import { cn } from '../../../lib/cn'
import type { StockStatus as Status } from '../model/variants'

const COPY: Record<Status, (available: number | null) => string> = {
  in_stock: () => 'In stock',
  low_stock: (available) => `Only ${available} left`,
  out_of_stock: () => 'Out of stock',
}

export function StockStatus({ status, available }: { status: Status; available: number | null }) {
  return (
    <p
      data-testid="stock-status"
      className={cn(
        'flex items-center gap-1.5 text-sm font-medium lg:text-base',
        status === 'in_stock' && 'text-success',
        status === 'low_stock' && 'text-star',
        status === 'out_of_stock' && 'text-danger',
      )}
    >
      <span aria-hidden="true" className="size-2 rounded-full bg-current" />
      {COPY[status](available)}
    </p>
  )
}
