import { useCallback, useRef, useState } from 'react'
import { toast } from '../../../lib/toast/toast.store'
import { selectQuantityInCart } from '../../cart/store/cart.selectors'
import { useCartStore } from '../../cart/store/cart.store'
import { toLineId, type AddToCartInput } from '../../cart/store/cart.types'
import type { Product, Variation } from '../model/product'
import { describeSelection, getImageIndexForSelection } from '../model/variants'
import type { VariantSelectionState } from './useVariantSelection'

const QUANTITY_PER_CLICK = 1
const selectNothingInCart = () => 0

/** Immutable snapshot of what the shopper sees, written to the cart line. */
function toCartInput(product: Product, state: VariantSelectionState): AddToCartInput {
  const swatchImage = product.images[getImageIndexForSelection(product, state.selection)]
  return {
    productId: product.id,
    variantId: state.variant?.id ?? null,
    slug: product.slug,
    name: product.name,
    image: swatchImage?.src ?? product.images[0]?.src ?? '',
    options: describeSelection(product, state.selection),
    unitPrice: state.price.current,
    compareAtPrice: state.price.compareAt,
    maxQuantity: state.maxQuantity,
  }
}

/** Scroll the first incomplete group into view and focus its first selectable option. */
function focusGroup(group: HTMLElement | null | undefined) {
  group?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  group?.querySelector<HTMLElement>('[role="radio"]:not([aria-disabled="true"])')?.focus({ preventScroll: true })
}

/** Stable ref callback per variation name, so React does not detach/re-attach refs every render. */
function useGroupRefs() {
  const elements = useRef(new Map<string, HTMLDivElement | null>())
  const callbacks = useRef(new Map<string, (element: HTMLDivElement | null) => void>())

  const registerGroup = useCallback((name: string) => {
    let callback = callbacks.current.get(name)
    if (!callback) {
      callback = (element) => {
        elements.current.set(name, element)
      }
      callbacks.current.set(name, callback)
    }
    return callback
  }, [])

  const getGroup = useCallback((name: string) => elements.current.get(name), [])
  return { registerGroup, getGroup }
}

/**
 * Orchestrates "Add to cart": validate → snapshot → store → feedback.
 * The main CTA and the sticky mobile bar share this single code path.
 * Once the selected variant is in the cart, `quantityInCart` > 0 and the CTA
 * becomes a stepper: + adds one more unit, − removes one (down to removing the line).
 */
export function useAddToCart(product: Product, state: VariantSelectionState) {
  const addItem = useCartStore((store) => store.addItem)
  const openCart = useCartStore((store) => store.open)
  const setQuantity = useCartStore((store) => store.setQuantity)
  const [showErrors, setShowErrors] = useState(false)
  const { registerGroup, getGroup } = useGroupRefs()

  // The cart line the current selection maps to (none until every variation is chosen).
  const lineId = state.missing.length === 0 ? toLineId(product.id, state.variant?.id ?? null) : null
  const quantityInCart = useCartStore(lineId ? selectQuantityInCart(lineId) : selectNothingInCart)

  const errorFor = (variation: Variation) =>
    showErrors && state.missing.some((missing) => missing.name === variation.name)
      ? `Please select a ${variation.label.toLowerCase()}`
      : undefined

  const add = useCallback(
    ({ openDrawer = false, quantity = QUANTITY_PER_CLICK, silent = false } = {}) => {
      const firstMissing = state.missing[0]
      if (firstMissing) {
        setShowErrors(true)
        focusGroup(getGroup(firstMissing.name))
        return false
      }
      if (state.stock.status === 'out_of_stock') return false

      const { clamped } = addItem(toCartInput(product, state), quantity)
      setShowErrors(false)

      const limitMessage = `Only ${state.maxQuantity} per order — your cart has the maximum.`
      if (openDrawer) {
        // Toasts sit under the modal's backdrop, so the drawer shows the message itself.
        openCart(clamped ? limitMessage : undefined)
      } else if (clamped || !silent) {
        toast(clamped ? limitMessage : `${product.name} added to cart`, { label: 'View cart', onClick: () => openCart() })
      }
      return true
    },
    [addItem, openCart, product, state, getGroup],
  )

  /** The on-page stepper: going up adds units (same path as the CTA, no toast), going down removes them. */
  const changeQuantity = useCallback(
    (next: number) => {
      if (!lineId) return
      if (next > quantityInCart) add({ quantity: next - quantityInCart, silent: true })
      else setQuantity(lineId, next)
    },
    [add, lineId, quantityInCart, setQuantity],
  )

  return { add, quantityInCart, changeQuantity, errorFor, registerGroup }
}
