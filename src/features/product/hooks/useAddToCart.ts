import { useCallback, useRef, useState } from 'react'
import { toast } from '../../../components/ui/toast.store'
import { useCartStore } from '../../cart/store/cart.store'
import type { AddToCartInput } from '../../cart/store/cart.types'
import type { Product, Variation } from '../model/product'
import { describeSelection, getImageIndexForSelection } from '../model/variants'
import type { VariantSelectionState } from './useVariantSelection'

const ADDED_FEEDBACK_MS = 1800
const QUANTITY_PER_CLICK = 1

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

/** Short-lived "✓ Added" state on the button. */
function useAddedFeedback() {
  const [justAdded, setJustAdded] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const flash = useCallback(() => {
    setJustAdded(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setJustAdded(false), ADDED_FEEDBACK_MS)
  }, [])

  return { justAdded, flash }
}

/**
 * Orchestrates "Add to cart": validate → snapshot → store → feedback.
 * The main CTA and the sticky mobile bar share this single code path.
 */
export function useAddToCart(product: Product, state: VariantSelectionState) {
  const addItem = useCartStore((store) => store.addItem)
  const openCart = useCartStore((store) => store.open)
  const [showErrors, setShowErrors] = useState(false)
  const { registerGroup, getGroup } = useGroupRefs()
  const { justAdded, flash } = useAddedFeedback()

  const errorFor = (variation: Variation) =>
    showErrors && state.missing.some((missing) => missing.name === variation.name)
      ? `Please select a ${variation.label.toLowerCase()}`
      : undefined

  const add = useCallback(
    ({ openDrawer = false } = {}) => {
      const firstMissing = state.missing[0]
      if (firstMissing) {
        setShowErrors(true)
        focusGroup(getGroup(firstMissing.name))
        return false
      }
      if (state.stock.status === 'out_of_stock') return false

      const { added, clamped } = addItem(toCartInput(product, state), QUANTITY_PER_CLICK)
      setShowErrors(false)
      if (added > 0) flash()

      const limitMessage = `Only ${state.maxQuantity} per order — your cart has the maximum.`
      if (openDrawer) {
        // Toasts sit under the modal's backdrop, so the drawer shows the message itself.
        openCart(clamped ? limitMessage : undefined)
      } else {
        toast(clamped ? limitMessage : `${product.name} added to cart`, { label: 'View cart', onClick: () => openCart() })
      }
      return true
    },
    [addItem, openCart, product, state, getGroup, flash],
  )

  return { add, justAdded, errorFor, registerGroup }
}
