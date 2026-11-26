import { CountBadge } from '../../../components/ui/CountBadge'
import { Icon } from '../../../components/ui/Icon'
import { pluralize } from '../../../lib/format'
import { useCartStore } from '../store/cart.store'
import { selectItemCount, selectLastAddedAt } from '../store/cart.selectors'

/**
 * Header cart icon + count badge. Subscribes to the count only, so it does not
 * re-render when e.g. a price snapshot changes. `lastAddedAt` replays the bump
 * animation even when the count did not change (quantity clamped at max).
 */
export function CartButton() {
  const count = useCartStore(selectItemCount)
  const lastAddedAt = useCartStore(selectLastAddedAt)
  const open = useCartStore((state) => state.open)

  return (
    <button
      type="button"
      onClick={() => open()}
      aria-label={`Open cart, ${pluralize(count, 'item')}`}
      className="relative inline-flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface lg:size-auto lg:hover:bg-transparent lg:hover:text-secondary"
    >
      <Icon name="bag" />
      <CountBadge count={count} animationKey={lastAddedAt} />
    </button>
  )
}
