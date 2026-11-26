import { env } from '../../../config/env'
import { getJson } from '../../../lib/http'
import type { Product } from '../model/product'
import type { ProductDto } from './product.dto'
import { mapProduct } from './product.mapper'

export function productUrl(slug: string) {
  const path = `${env.apiBaseUrl}/products/slug/${encodeURIComponent(env.storeSlug)}/${encodeURIComponent(slug)}`
  return `${path}?join=reviews`
}

export async function fetchProduct(slug: string, signal?: AbortSignal): Promise<Product> {
  const dto = await getJson<ProductDto>(productUrl(slug), signal)
  return mapProduct(dto)
}
