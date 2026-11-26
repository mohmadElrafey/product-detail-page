/**
 * Domain model the UI works with. It is decoupled from the API DTOs so that a
 * backend rename only touches the mapper, and so components get ready-to-use
 * data (resolved prices, de-duplicated images, typed variation kinds).
 */
export interface Product {
  id: string
  slug: string
  name: string
  brand: string
  descriptionHtml: string
  price: Money
  images: ProductImage[]
  variations: Variation[]
  variants: Variant[]
  categories: Category[]
  inventory: Inventory
  /** Store setting: pin the buy bar to the bottom on small screens. */
  stickyBuyBar: boolean
  /** Social proof shown next to the price (not provided by the API yet). */
  soldCount: number
}

export interface Money {
  /** What the customer pays. */
  current: number
  /** Crossed-out reference price; null when there is no discount. */
  compareAt: number | null
}

export interface ProductImage {
  src: string
  alt: string
  /** Set when the image belongs to a variation option (e.g. the "black" swatch). */
  optionKey?: OptionKey
}

export type VariationKind = 'image' | 'color' | 'text'

export interface Variation {
  id: string
  /** Machine name used to match variants, e.g. "color". */
  name: string
  /** Human label, e.g. "Color". */
  label: string
  kind: VariationKind
  options: VariationOption[]
}

export interface VariationOption {
  id: string
  /** Raw value used by variants, e.g. "biege". */
  value: string
  /** Display label, e.g. "Biege". */
  label: string
  /** Image URL or hex color for visual swatches. */
  swatch?: string
}

export interface Variant {
  id: string
  price: Money
  stock: number
  /** variation name → option value, e.g. { color: 'brown', size: '40' } */
  options: Record<string, string>
}

export interface Category {
  id: string
  name: string
  slug: string
  image: string
}

export interface Inventory {
  tracked: boolean
  /** Stock when the product has no variants. */
  stock: number
}

/** "color:brown" — identifies an option across variations. */
export type OptionKey = `${string}:${string}`
export const optionKey = (variation: string, value: string): OptionKey => `${variation}:${value}`

/** variation name → selected value (undefined = not chosen yet). */
export type Selection = Record<string, string | undefined>
