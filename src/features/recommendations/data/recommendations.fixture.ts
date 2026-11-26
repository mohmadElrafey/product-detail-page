export interface ProductSummary {
  id: string
  slug: string
  brand: string
  name: string
  price: number
  image: string
  rating: number
  soldCount: number
}

const CDN = 'https://easyorders.fra1.digitaloceanspaces.com'

/**
 * The API exposes no related/popular endpoint, so both rails use this typed
 * fixture. Images are real catalogue images from the same store CDN, so the page
 * looks coherent. Swap for an API call inside `useRecommendations` when available.
 */
export const RELATED_PRODUCTS: ProductSummary[] = [
  { id: 'p1', slug: 'achilles-classic-mule', brand: 'Achilles', name: 'Classic Suede Mule, Sand', price: 145, image: `${CDN}/1734957254865120117.webp`, rating: 4.8, soldCount: 1238 },
  { id: 'p2', slug: 'achilles-pro-black', brand: 'Achilles Pro', name: 'Genuine Suede Sneakers, Black', price: 160, image: `${CDN}/1735836957769748053.webp`, rating: 4.8, soldCount: 1238 },
  { id: 'p3', slug: 'achilles-heel', brand: 'Achilles Women', name: 'Leather Block Heel, Nude', price: 175, image: `${CDN}/1734956627919625168.webp`, rating: 4.5, soldCount: 620 },
  { id: 'p4', slug: 'achilles-moc-toe', brand: 'Achilles', name: 'Moc Toe Boots, Brown', price: 240, image: `${CDN}/1734956703585172408.webp`, rating: 4.6, soldCount: 238 },
  { id: 'p5', slug: 'achilles-pro-beige', brand: 'Achilles Pro', name: 'Genuine Suede Sneakers, Beige', price: 160, image: `${CDN}/1735836966489475540.jpg`, rating: 4.8, soldCount: 1238 },
  { id: 'p6', slug: 'achilles-runner', brand: 'Achilles', name: 'Everyday Leather Runner', price: 150, image: `${CDN}/1735823720177770018.webp`, rating: 4.7, soldCount: 940 },
]

export const POPULAR_PRODUCTS: ProductSummary[] = [
  RELATED_PRODUCTS[4]!,
  RELATED_PRODUCTS[3]!,
  { id: 'p7', slug: 'achilles-pro-brown', brand: 'Achilles Pro', name: 'Genuine Suede Sneakers, Brown', price: 160, image: `${CDN}/1735836944747077894.webp`, rating: 4.9, soldCount: 1510 },
  RELATED_PRODUCTS[0]!,
  RELATED_PRODUCTS[2]!,
  RELATED_PRODUCTS[5]!,
]
