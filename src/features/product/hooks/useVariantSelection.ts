import { useCallback, useMemo, useState } from 'react'
import type { Product, Selection } from '../model/product'
import {
  applySelection,
  findVariant,
  getInitialSelection,
  getMaxQuantity,
  getMissingVariations,
  getPrice,
  getStock,
  isOptionAvailable,
} from '../model/variants'

/**
 * Local (component) state on purpose: the selection belongs to this PDP view only.
 * Putting it in the global store would leak it to other products and cause
 * cross-page re-renders. Everything else is *derived* — never stored twice.
 */
export function useVariantSelection(product: Product) {
  const [selection, setSelection] = useState<Selection>(() => getInitialSelection(product))

  const select = useCallback(
    (variationName: string, value: string) =>
      setSelection((current) => applySelection(product, current, variationName, value)),
    [product],
  )

  const isAvailable = useCallback(
    (variationName: string, value: string) => isOptionAvailable(product, selection, variationName, value),
    [product, selection],
  )

  return useMemo(() => {
    const variant = findVariant(product, selection)
    return {
      selection,
      select,
      isAvailable,
      variant,
      missing: getMissingVariations(product, selection),
      price: getPrice(product, variant),
      stock: getStock(product, variant),
      maxQuantity: getMaxQuantity(product, variant),
    }
  }, [product, selection, select, isAvailable])
}

export type VariantSelectionState = ReturnType<typeof useVariantSelection>
