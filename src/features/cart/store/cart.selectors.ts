import type { CartStore } from './cart.store'

/**
 * Derived values live in selectors, not in state: storing `total` next to `items`
 * would be a second source of truth that can drift. Components subscribe to the
 * smallest slice they need (`useCartStore(selectItemCount)`) so, e.g., the header
 * badge re-renders only when the count actually changes.
 */
export const selectItems = (state: CartStore) => state.items
export const selectIsOpen = (state: CartStore) => state.isOpen
export const selectLastAddedAt = (state: CartStore) => state.lastAddedAt

export const selectItemCount = (state: CartStore) =>
  state.items.reduce((count, item) => count + item.quantity, 0)

export const selectSubtotal = (state: CartStore) =>
  state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

export const selectSavings = (state: CartStore) =>
  state.items.reduce(
    (sum, item) => sum + (item.compareAtPrice ? (item.compareAtPrice - item.unitPrice) * item.quantity : 0),
    0,
  )

export const selectQuantityInCart = (lineId: string) => (state: CartStore) =>
  state.items.find((item) => item.lineId === lineId)?.quantity ?? 0
