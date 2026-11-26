import { MAX_QUANTITY_PER_LINE } from '../../../config/env'
import { optionKey, type Money, type Product, type Selection, type Variant, type Variation } from './product'

/**
 * Pure variant-selection rules. No React here — everything is a function of
 * (product, selection) so it is trivially unit-testable and reusable (PDP,
 * quick-view, cart editing…).
 */

const matches = (variant: Variant, selection: Selection, ignore?: string) =>
  Object.entries(selection).every(
    ([name, value]) => name === ignore || value === undefined || variant.options[name] === value,
  )

export const isVariantPurchasable = (product: Product, variant: Variant) =>
  !product.inventory.tracked || variant.stock > 0

export function isSelectionComplete(product: Product, selection: Selection) {
  return product.variations.every((variation) => selection[variation.name] !== undefined)
}

export function getMissingVariations(product: Product, selection: Selection): Variation[] {
  return product.variations.filter((variation) => selection[variation.name] === undefined)
}

/** The variant matching a *complete* selection, or undefined. */
export function findVariant(product: Product, selection: Selection): Variant | undefined {
  if (!isSelectionComplete(product, selection)) return undefined
  return product.variants.find((variant) => matches(variant, selection))
}

/**
 * Can `value` be picked for `variationName` given what is already selected in the
 * *other* variations? An option is available when at least one purchasable variant
 * contains it together with the rest of the current selection. This is what lets
 * the UI disable e.g. size 42 once "black" is chosen if black/42 is sold out.
 */
export function isOptionAvailable(
  product: Product,
  selection: Selection,
  variationName: string,
  value: string,
): boolean {
  if (product.variants.length === 0) return true
  const candidate = { ...selection, [variationName]: value }
  return product.variants.some(
    (variant) =>
      variant.options[variationName] === value &&
      matches(variant, candidate) &&
      isVariantPurchasable(product, variant),
  )
}

/**
 * Applies a pick and drops any *other* selected value that the new pick made
 * impossible, so the UI can never sit in an unpurchasable combination.
 */
export function applySelection(
  product: Product,
  selection: Selection,
  variationName: string,
  value: string,
): Selection {
  const next: Selection = { ...selection, [variationName]: value }
  for (const variation of product.variations) {
    const current = next[variation.name]
    if (variation.name === variationName || current === undefined) continue
    if (!isOptionAvailable(product, next, variation.name, current)) next[variation.name] = undefined
  }
  return next
}

/**
 * Visual variations (image/color swatches) start pre-selected so the gallery and
 * the "Color: …" label have something to show; text variations such as size stay
 * empty on purpose — the shopper must choose, and Add to Cart validates it.
 */
export function getInitialSelection(product: Product): Selection {
  const selection: Selection = {}
  for (const variation of product.variations) {
    if (variation.kind === 'text') continue
    const firstAvailable = variation.options.find((option) =>
      isOptionAvailable(product, selection, variation.name, option.value),
    )
    selection[variation.name] = firstAvailable?.value
  }
  return selection
}

export function getPrice(product: Product, variant?: Variant): Money {
  return variant?.price ?? product.price
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'
export const LOW_STOCK_THRESHOLD = 5

export function getStock(product: Product, variant?: Variant): { status: StockStatus; available: number | null } {
  if (!product.inventory.tracked) return { status: 'in_stock', available: null }
  const available = variant ? variant.stock : product.inventory.stock
  if (available <= 0) return { status: 'out_of_stock', available: 0 }
  if (available <= LOW_STOCK_THRESHOLD) return { status: 'low_stock', available }
  return { status: 'in_stock', available }
}

export function getMaxQuantity(product: Product, variant?: Variant): number {
  const { available } = getStock(product, variant)
  return available === null ? MAX_QUANTITY_PER_LINE : Math.min(available, MAX_QUANTITY_PER_LINE)
}

/** Human-readable option list for the cart line, e.g. [{ label: 'Color', value: 'Brown' }]. */
export function describeSelection(product: Product, selection: Selection) {
  return product.variations.flatMap((variation) => {
    const option = variation.options.find((candidate) => candidate.value === selection[variation.name])
    return option ? [{ label: variation.label, value: option.label }] : []
  })
}

/** Index of the gallery image that represents the selected swatch, if any. */
export function getImageIndexForSelection(product: Product, selection: Selection): number {
  for (const variation of product.variations) {
    const value = selection[variation.name]
    if (variation.kind !== 'image' || value === undefined) continue
    const index = product.images.findIndex((image) => image.optionKey === optionKey(variation.name, value))
    if (index !== -1) return index
  }
  return -1
}
