export interface CartLineOption {
  label: string
  value: string
}

/**
 * A cart line is a *snapshot* of what the shopper saw when adding (name, image,
 * price) so the drawer renders instantly from localStorage without refetching
 * every product. Prices are re-validated server-side at checkout anyway.
 */
export interface CartItem {
  /** Stable identity of the line: product + variant. Same variant twice = one line. */
  lineId: string
  productId: string
  variantId: string | null
  slug: string
  name: string
  image: string
  options: CartLineOption[]
  unitPrice: number
  compareAtPrice: number | null
  quantity: number
  maxQuantity: number
}

export type AddToCartInput = Omit<CartItem, 'lineId' | 'quantity'>

export const toLineId = (productId: string, variantId: string | null) =>
  variantId ? `${productId}::${variantId}` : productId
