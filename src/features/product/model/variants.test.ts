import { describe, expect, it } from 'vitest'
import { makeProduct, makeTrackedProduct } from '../../../test/fixtures'
import {
  applySelection,
  describeSelection,
  findVariant,
  getImageIndexForSelection,
  getInitialSelection,
  getMaxQuantity,
  getMissingVariations,
  getPrice,
  getStock,
  isOptionAvailable,
} from './variants'

describe('variant selection rules', () => {
  const product = makeProduct()

  it('pre-selects the first visual option but leaves text options (size) empty', () => {
    expect(getInitialSelection(product)).toEqual({ color: 'brown' })
  })

  it('reports which variations are still missing', () => {
    const missing = getMissingVariations(product, { color: 'brown' })
    expect(missing.map((variation) => variation.name)).toEqual(['size'])
  })

  it('finds the variant only once the selection is complete', () => {
    expect(findVariant(product, { color: 'black' })).toBeUndefined()
    const variant = findVariant(product, { color: 'black', size: '40' })
    expect(variant?.options).toEqual({ color: 'black', size: '40' })
  })

  it('keeps the product-level discount when the variant does not override it', () => {
    const variant = findVariant(product, { color: 'black', size: '40' })
    expect(getPrice(product, variant)).toEqual({ current: 160, compareAt: 190 })
    expect(getPrice(product)).toEqual({ current: 160, compareAt: 190 })
  })

  it('treats every option as available when stock is not tracked', () => {
    expect(isOptionAvailable(product, { color: 'black' }, 'size', '42')).toBe(true)
    expect(getStock(product)).toEqual({ status: 'in_stock', available: null })
    expect(getMaxQuantity(product)).toBe(10)
  })

  it('maps the selected swatch to its gallery image', () => {
    const index = getImageIndexForSelection(product, { color: 'black' })
    expect(product.images[index]?.optionKey).toBe('color:black')
  })

  it('describes the selection for the cart line', () => {
    expect(describeSelection(product, { color: 'biege', size: '42' })).toEqual([
      { label: 'Color', value: 'Biege' },
      { label: 'Size', value: '42' },
    ])
  })
})

describe('with stock tracking', () => {
  const product = makeTrackedProduct()

  it('disables a size that is sold out for the selected color only', () => {
    expect(isOptionAvailable(product, { color: 'black' }, 'size', '42')).toBe(false)
    expect(isOptionAvailable(product, { color: 'brown' }, 'size', '42')).toBe(true)
  })

  it('disables a color that is sold out for the selected size', () => {
    expect(isOptionAvailable(product, { size: '42' }, 'color', 'black')).toBe(false)
  })

  it('clears a previously chosen option that the new pick makes impossible', () => {
    const next = applySelection(product, { color: 'brown', size: '42' }, 'color', 'black')
    expect(next).toEqual({ color: 'black', size: undefined })
  })

  it('caps quantity by stock and flags low stock', () => {
    const variant = findVariant(product, { color: 'brown', size: '38' })
    expect(getStock(product, variant)).toEqual({ status: 'low_stock', available: 3 })
    expect(getMaxQuantity(product, variant)).toBe(3)
  })
})
