import type { Review } from '../model/reviews'

/**
 * The EasyOrders endpoint accepts `?join=reviews` but returns no reviews for this
 * product, so the section is fed by this typed fixture. It goes through the same
 * `useProductReviews` hook a real endpoint would, so swapping the source is a
 * one-function change and the UI/filters/pagination are already exercised.
 */
export const REVIEWS_FIXTURE: Review[] = [
  { id: 'r1', rating: 5, title: 'This is amazing product I have.', body: 'The suede is soft and the sole is really comfortable for long walks.', author: 'Darrell Steward', createdAt: '2020-07-02T15:29:00', topics: ['Product Quality', 'Match with Description'], hasMedia: true, likes: 128 },
  { id: 'r2', rating: 5, title: 'This is amazing product I have.', author: 'Darlene Robertson', createdAt: '2020-07-02T13:04:00', topics: ['Shipment'], hasMedia: false, likes: 82 },
  { id: 'r3', rating: 5, title: 'This is amazing product I have.', body: 'Arrived in two days, fits true to size.', author: 'Kathryn Murphy', createdAt: '2020-06-26T22:03:00', topics: ['Shipment', 'Seller Services'], hasMedia: false, likes: 9 },
  { id: 'r4', rating: 5, title: 'This is amazing product I have.', author: 'Ronald Richards', createdAt: '2020-07-07T10:14:00', topics: ['Product Price'], hasMedia: true, likes: 124 },
  { id: 'r5', rating: 4, title: 'Great value for the price', body: 'Leather quality is good, laces could be better.', author: 'Jane Cooper', createdAt: '2020-06-21T09:40:00', topics: ['Product Price', 'Product Quality'], hasMedia: false, likes: 41 },
  { id: 'r6', rating: 5, title: 'My new everyday sneakers', author: 'Wade Warren', createdAt: '2020-06-18T18:12:00', topics: ['Product Quality'], hasMedia: true, likes: 37 },
  { id: 'r7', rating: 4, title: 'Comfortable from day one', body: 'No break-in period needed. The beige colour is lovely.', author: 'Esther Howard', createdAt: '2020-06-15T11:05:00', topics: ['Match with Description'], hasMedia: false, likes: 22 },
  { id: 'r8', rating: 3, title: 'Runs slightly small', body: 'Order half a size up if you are between sizes.', author: 'Cameron Williamson', createdAt: '2020-06-11T16:47:00', topics: ['Product Quality'], hasMedia: false, likes: 15 },
  { id: 'r9', rating: 5, title: 'Fast delivery, great support', author: 'Brooklyn Simmons', createdAt: '2020-06-09T08:30:00', topics: ['Seller Services', 'Shipment'], hasMedia: false, likes: 11 },
  { id: 'r10', rating: 5, title: 'Looks exactly like the photos', body: 'Colour matches the pictures perfectly.', author: 'Leslie Alexander', createdAt: '2020-06-04T20:18:00', topics: ['Match with Description'], hasMedia: true, likes: 8 },
  { id: 'r11', rating: 4, title: 'Solid pair of shoes', author: 'Jenny Wilson', createdAt: '2020-05-30T12:00:00', topics: ['Product Quality'], hasMedia: false, likes: 6 },
  { id: 'r12', rating: 5, title: 'Would buy again', body: 'Second pair I bought — still my favourite.', author: 'Guy Hawkins', createdAt: '2020-05-27T14:22:00', topics: ['Product Price', 'Seller Services'], hasMedia: false, likes: 4 },
]
