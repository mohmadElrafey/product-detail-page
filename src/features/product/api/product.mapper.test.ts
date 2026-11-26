import { describe, expect, it } from 'vitest'
import { makeProduct, productDto } from '../../../test/fixtures'
import { mapProduct, resolveMoney } from './product.mapper'

describe('resolveMoney', () => {
  it('uses the sale price as current price when it is a real discount', () => {
    expect(resolveMoney(190, 160)).toEqual({ current: 160, compareAt: 190 })
  })

  it('ignores 0 ("not set") and non-discount sale prices', () => {
    expect(resolveMoney(190, 0)).toEqual({ current: 190, compareAt: null })
    expect(resolveMoney(190, 200)).toEqual({ current: 190, compareAt: null })
  })
})

describe('mapProduct', () => {
  const product = makeProduct()

  it('maps variations to typed kinds with display labels', () => {
    expect(product.variations.map((variation) => [variation.name, variation.kind])).toEqual([
      ['color', 'image'],
      ['size', 'text'],
    ])
    expect(product.variations[0]?.options.map((option) => option.label)).toEqual(['Brown', 'Black', 'Biege'])
  })

  it('de-duplicates gallery images and tags swatch images', () => {
    const sources = product.images.map((image) => image.src)
    expect(new Set(sources).size).toBe(sources.length)
    expect(product.images.filter((image) => image.optionKey)).toHaveLength(3)
  })

  it('turns variant props into an option map', () => {
    expect(product.variants).toHaveLength(9)
    expect(product.variants[0]?.options).toEqual({ color: 'brown', size: '38' })
  })

  it('never applies the product sale to a variant with its own price (no fake discounts)', () => {
    const dto = structuredClone(productDto)
    dto.variants[0] = { ...dto.variants[0]!, price: 250, sale_price: 0 }
    dto.variants[1] = { ...dto.variants[1]!, price: 250, sale_price: 220 }
    const [own, ownSale, inherited] = mapProduct(dto).variants
    expect(own?.price).toEqual({ current: 250, compareAt: null })
    expect(ownSale?.price).toEqual({ current: 220, compareAt: 250 })
    expect(inherited?.price).toEqual({ current: 160, compareAt: 190 })
  })

  it('only enforces stock when both API flags say so', () => {
    expect(product.inventory.tracked).toBe(false)
    expect(makeProduct({ track_stock: true, disable_orders_for_no_stock: false }).inventory.tracked).toBe(false)
    expect(makeProduct({ track_stock: true, disable_orders_for_no_stock: true }).inventory.tracked).toBe(true)
  })
})
