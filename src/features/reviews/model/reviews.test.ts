import { describe, expect, it } from 'vitest'
import { REVIEWS_FIXTURE } from '../data/reviews.fixture'
import { EMPTY_FILTERS, filterReviews, getPageList, paginate, summarize } from './reviews'

describe('reviews model', () => {
  it('summarizes average and distribution', () => {
    const summary = summarize(REVIEWS_FIXTURE)
    expect(summary.total).toBe(12)
    expect(summary.average).toBe(4.6)
    expect(summary.distribution).toEqual([
      { stars: 5, count: 8 },
      { stars: 4, count: 3 },
      { stars: 3, count: 1 },
      { stars: 2, count: 0 },
      { stars: 1, count: 0 },
    ])
  })

  it('handles an empty list', () => {
    expect(summarize([]).average).toBe(0)
  })

  it('ORs values within a facet and ANDs across facets', () => {
    const fourOrThree = filterReviews(REVIEWS_FIXTURE, { ...EMPTY_FILTERS, ratings: [4, 3] })
    expect(fourOrThree.every((review) => review.rating === 4 || review.rating === 3)).toBe(true)
    expect(fourOrThree).toHaveLength(4)

    const fourAndPrice = filterReviews(REVIEWS_FIXTURE, { ...EMPTY_FILTERS, ratings: [4], topics: ['Product Price'] })
    expect(fourAndPrice.map((review) => review.id)).toEqual(['r5'])
  })

  it('filters by tab', () => {
    expect(filterReviews(REVIEWS_FIXTURE, { ...EMPTY_FILTERS, tab: 'media' }).every((r) => r.hasMedia)).toBe(true)
    expect(filterReviews(REVIEWS_FIXTURE, { ...EMPTY_FILTERS, tab: 'description' }).every((r) => r.body)).toBe(true)
  })

  it('paginates and clamps out-of-range pages', () => {
    expect(paginate(REVIEWS_FIXTURE, 1, 4)).toMatchObject({ page: 1, pageCount: 3 })
    expect(paginate(REVIEWS_FIXTURE, 99, 4).page).toBe(3)
    expect(paginate([], 1, 4)).toMatchObject({ page: 1, pageCount: 1, items: [] })
  })

  it('builds a compact page list like the design (1 2 … 19)', () => {
    expect(getPageList(1, 19)).toEqual([1, 2, 'ellipsis', 19])
    expect(getPageList(10, 19)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 19])
    expect(getPageList(2, 3)).toEqual([1, 2, 3])
  })
})
