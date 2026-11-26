import { queryOptions, useQuery } from '@tanstack/react-query'
import { HttpError } from '../../../lib/http'
import { fetchProduct } from '../api/product.api'

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ['product', slug] as const,
    queryFn: ({ signal }) => fetchProduct(slug, signal),
    staleTime: 5 * 60_000,
    // A 404 will not fix itself — only retry network/5xx failures.
    retry: (failureCount, error) =>
      !(error instanceof HttpError && error.status < 500) && failureCount < 2,
  })

export const useProduct = (slug: string) => useQuery(productQuery(slug))
