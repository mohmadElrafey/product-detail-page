import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { Sheet } from '../../../components/ui/Sheet'
import { formatPrice } from '../../../lib/format'
import { useCartStore } from '../store/cart.store'
import { selectIsOpen, selectItemCount, selectItems, selectSavings, selectSubtotal } from '../store/cart.selectors'
import { CartLine } from './CartLine'

function EmptyCart({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-8 py-16 text-center">
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-surface text-muted">
        <Icon name="bag" size={28} />
      </span>
      <p className="text-xl font-semibold text-heading">Your cart is empty</p>
      <p className="text-base text-body">Looks like you haven’t added anything yet.</p>
      <Button variant="outline" className="mt-2 h-12 lg:h-12 lg:text-base" onClick={onContinue}>
        Continue shopping
      </Button>
    </div>
  )
}

export default function CartDrawer() {
  const isOpen = useCartStore(selectIsOpen)
  const items = useCartStore(selectItems)
  const count = useCartStore(selectItemCount)
  const subtotal = useCartStore(selectSubtotal)
  const savings = useCartStore(selectSavings)
  const close = useCartStore((state) => state.close)
  const clear = useCartStore((state) => state.clear)
  const notice = useCartStore((state) => state.notice)
  const showNotice = (message: string) => useCartStore.setState({ notice: message })

  const footer =
    items.length > 0 ? (
      <div className="flex flex-col gap-3">
        {savings > 0 && (
          <p className="flex justify-between text-sm text-success">
            <span>You save</span>
            <span>{formatPrice(savings)}</span>
          </p>
        )}
        <p className="flex justify-between text-lg font-semibold text-ink">
          <span>Subtotal</span>
          <span data-testid="cart-subtotal">{formatPrice(subtotal)}</span>
        </p>
        <p className="text-xs text-body">Shipping and taxes calculated at checkout.</p>
        <Button
          className="w-full"
          onClick={() => showNotice('Checkout is out of scope for this task — the cart is ready to hand off.')}
        >
          Checkout
        </Button>
        <button type="button" onClick={clear} className="text-sm text-subtle underline underline-offset-2 hover:text-ink">
          Clear cart
        </button>
      </div>
    ) : undefined

  return (
    <Sheet open={isOpen} onClose={close} title={`Your cart (${count})`} footer={footer}>
      {/* Rendered inside the modal: content outside a showModal() dialog is inert and covered. */}
      <p role="status" className={notice ? 'mx-5 mt-4 rounded-lg bg-surface px-4 py-3 text-sm font-medium text-heading' : 'sr-only'}>
        {notice}
      </p>
      {items.length === 0 ? (
        <EmptyCart onContinue={close} />
      ) : (
        <ul className="divide-y divide-hairline px-5" aria-label="Cart items">
          {items.map((item) => (
            <CartLine key={item.lineId} item={item} />
          ))}
        </ul>
      )}
    </Sheet>
  )
}
