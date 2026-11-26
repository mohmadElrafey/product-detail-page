import { memo } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { QuantityStepper } from '../../../components/ui/QuantityStepper'
import { formatPrice } from '../../../lib/format'
import { useCartStore } from '../store/cart.store'
import type { CartItem } from '../store/cart.types'

/** Memoized: changing one line's quantity re-renders that line only, not the whole list. */
export const CartLine = memo(function CartLine({ item }: { item: CartItem }) {
  const setQuantity = useCartStore((state) => state.setQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  return (
    <li className="flex gap-4 py-4">
      <div className="h-[100px] w-[76px] shrink-0 overflow-hidden rounded-lg bg-surface">
        <img src={item.image} alt="" width={76} height={100} loading="lazy" className="size-full object-contain mix-blend-multiply" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-base leading-[1.3] font-semibold text-heading">{item.name}</p>
          <button
            type="button"
            onClick={() => removeItem(item.lineId)}
            aria-label={`Remove ${item.name} from cart`}
            className="-m-1.5 shrink-0 rounded-md p-1.5 text-subtle transition-colors hover:bg-surface hover:text-danger"
          >
            <Icon name="trash" size={18} />
          </button>
        </div>
        {item.options.length > 0 && (
          <p className="text-sm text-body">
            {item.options.map((option) => `${option.label}: ${option.value}`).join(' · ')}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <QuantityStepper
            size="sm"
            label={`Quantity for ${item.name}`}
            value={item.quantity}
            max={item.maxQuantity}
            allowRemove
            onChange={(quantity) => setQuantity(item.lineId, quantity)}
          />
          <div className="text-right">
            {item.compareAtPrice !== null && (
              <p className="text-xs text-body line-through">{formatPrice(item.compareAtPrice * item.quantity)}</p>
            )}
            <p className="text-base font-semibold text-ink">{formatPrice(item.unitPrice * item.quantity)}</p>
          </div>
        </div>
      </div>
    </li>
  )
})
