import { useMemo } from 'react'
import { REVIEWS_FIXTURE } from './data/reviews.fixture'
import { summarize, type Review } from './model/reviews'

/**
 * Single entry point for review data. Today: fixture (the API returns none).
 * Tomorrow: `useQuery({ queryKey: ['reviews', productId], ... })` — callers don't change.
 */
export function useProductReviews(_productId: string): { reviews: Review[]; summary: ReturnType<typeof summarize> } {
  return useMemo(() => ({ reviews: REVIEWS_FIXTURE, summary: summarize(REVIEWS_FIXTURE) }), [])
}
