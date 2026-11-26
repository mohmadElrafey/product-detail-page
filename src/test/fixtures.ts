import { mapProduct } from '../features/product/api/product.mapper'
import type { ProductDto } from '../features/product/api/product.dto'
import type { Product } from '../features/product/model/product'
import raw from './fixtures/product.json'

/** Real response captured from the EasyOrders endpoint (Sneakers12). */
export const productDto = raw as unknown as ProductDto

export const makeProduct = (overrides: Partial<ProductDto> = {}): Product =>
  mapProduct({ ...structuredClone(productDto), ...overrides })

/** Same product with stock tracking on and black/42 sold out — for availability tests. */
export function makeTrackedProduct(): Product {
  const dto = structuredClone(productDto)
  dto.track_stock = true
  dto.disable_orders_for_no_stock = true
  dto.variants = dto.variants.map((variant) => {
    const options = Object.fromEntries(variant.variation_props.map((p) => [p.variation, p.variation_prop]))
    const soldOut = options.color === 'black' && options.size === '42'
    const lowStock = options.color === 'brown' && options.size === '38'
    return { ...variant, quantity: soldOut ? 0 : lowStock ? 3 : 20 }
  })
  return mapProduct(dto)
}
