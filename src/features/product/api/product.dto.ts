/**
 * Raw shapes returned by `GET /products/slug/:store/:slug?join=reviews`.
 * Only the fields the UI consumes are typed — the response has ~40 more flags
 * (taager/ecombo integrations, cloaking…) that are irrelevant to this page.
 * These types never leave the `api/` folder: the mapper turns them into the
 * domain model in `model/product.ts`.
 */
export interface ProductDto {
  id: string
  name: string
  slug: string
  price: number
  sale_price: number
  description: string
  thumb: string
  images: string[]
  quantity: number
  track_stock: boolean
  disable_orders_for_no_stock: boolean
  is_fixed_bottom_buy: boolean
  buy_now_text: string
  variations: VariationDto[]
  variants: VariantDto[]
  categories: CategoryDto[]
  reviews?: ReviewDto[]
}

export interface VariationDto {
  id: string
  name: string
  /** "image" → swatch shows `props[].value` as a picture, "button" → text button, "color" → hex. */
  type: 'image' | 'button' | 'color' | string
  props: VariationPropDto[]
}

export interface VariationPropDto {
  id: string
  name: string
  value?: string
}

export interface VariantDto {
  id: string
  price: number
  sale_price: number
  quantity: number
  variation_props: { variation: string; variation_prop: string }[]
}

export interface CategoryDto {
  id: string
  name: string
  slug: string
  thumb: string
}

/** The endpoint advertises `join=reviews` but currently returns none; shape kept loose. */
export interface ReviewDto {
  id: string
  rating: number
  title?: string
  comment?: string
  name?: string
  created_at: string
}
