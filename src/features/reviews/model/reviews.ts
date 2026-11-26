export const REVIEW_TOPICS = [
  'Product Quality',
  'Seller Services',
  'Product Price',
  'Shipment',
  'Match with Description',
] as const

export type ReviewTopic = (typeof REVIEW_TOPICS)[number]
export type ReviewTab = 'all' | 'media' | 'description'
export type Vote = 'like' | 'dislike'

export interface Review {
  id: string
  rating: 1 | 2 | 3 | 4 | 5
  title: string
  body?: string
  author: string
  createdAt: string
  topics: ReviewTopic[]
  hasMedia: boolean
  likes: number
}

export interface ReviewFilters {
  ratings: number[]
  topics: ReviewTopic[]
  tab: ReviewTab
}

export const EMPTY_FILTERS: ReviewFilters = { ratings: [], topics: [], tab: 'all' }

export interface ReviewSummary {
  average: number
  total: number
  /** count per star, index 0 = 5 stars … index 4 = 1 star (render order). */
  distribution: { stars: number; count: number }[]
}

export function summarize(reviews: Review[]): ReviewSummary {
  const total = reviews.length
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return {
    average: total === 0 ? 0 : Math.round((sum / total) * 10) / 10,
    total,
    distribution: [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: reviews.filter((review) => review.rating === stars).length,
    })),
  }
}

/** Filters combine with AND across groups and OR within a group (standard faceted search). */
export function filterReviews(reviews: Review[], filters: ReviewFilters): Review[] {
  return reviews.filter((review) => {
    if (filters.ratings.length > 0 && !filters.ratings.includes(review.rating)) return false
    if (filters.topics.length > 0 && !review.topics.some((topic) => filters.topics.includes(topic))) return false
    if (filters.tab === 'media' && !review.hasMedia) return false
    if (filters.tab === 'description' && !review.body) return false
    return true
  })
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const current = Math.min(Math.max(page, 1), pageCount)
  return {
    items: items.slice((current - 1) * pageSize, current * pageSize),
    page: current,
    pageCount,
  }
}

/**
 * Compact page list like the design: [1, 2, '…', 19]. Always shows first, last,
 * and the current page with one neighbour; gaps collapse into a single ellipsis.
 */
export function getPageList(page: number, pageCount: number): (number | 'ellipsis')[] {
  const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pageCount))
  const sorted = [...pages].sort((a, b) => a - b)
  const result: (number | 'ellipsis')[] = []
  sorted.forEach((value, index) => {
    const previous = sorted[index - 1]
    if (previous !== undefined && value - previous > 1) result.push('ellipsis')
    result.push(value)
  })
  return result
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
