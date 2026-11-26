import { beforeEach, describe, expect, it } from 'vitest'
import { selectItemCount, selectSavings, selectSubtotal } from './cart.selectors'
import { CART_STORAGE_KEY, isCartItem, useCartStore } from './cart.store'
import type { AddToCartInput } from './cart.types'

const shoe = (overrides: Partial<AddToCartInput> = {}): AddToCartInput => ({
  productId: 'p1',
  variantId: 'v-black-40',
  slug: 'shoe',
  name: 'Shoe',
  image: 'shoe.webp',
  options: [{ label: 'Size', value: '40' }],
  unitPrice: 160,
  compareAtPrice: 190,
  maxQuantity: 5,
  ...overrides,
})

const state = () => useCartStore.getState()

beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false, lastAddedAt: 0 })
})

describe('cart store', () => {
  it('adds a new line', () => {
    const result = state().addItem(shoe(), 2)
    expect(result).toEqual({ added: 2, clamped: false })
    expect(state().items).toHaveLength(1)
    expect(state().items[0]).toMatchObject({ lineId: 'p1::v-black-40', quantity: 2 })
  })

  it('merges the same variant into one line', () => {
    state().addItem(shoe(), 1)
    state().addItem(shoe(), 2)
    expect(state().items).toHaveLength(1)
    expect(state().items[0]?.quantity).toBe(3)
  })

  it('keeps different variants of the same product as separate lines', () => {
    state().addItem(shoe(), 1)
    state().addItem(shoe({ variantId: 'v-brown-42' }), 1)
    expect(state().items).toHaveLength(2)
  })

  it('clamps to the max quantity and reports it', () => {
    state().addItem(shoe(), 4)
    const result = state().addItem(shoe(), 3)
    expect(result).toEqual({ added: 1, clamped: true })
    expect(state().items[0]?.quantity).toBe(5)
  })

  it('removes a line when quantity goes to 0', () => {
    state().addItem(shoe(), 1)
    state().decrement('p1::v-black-40')
    expect(state().items).toEqual([])
  })

  it('never exceeds max via setQuantity / increment', () => {
    state().addItem(shoe(), 5)
    state().increment('p1::v-black-40')
    state().setQuantity('p1::v-black-40', 99)
    expect(state().items[0]?.quantity).toBe(5)
  })

  it('produces new references on update (Immer immutability)', () => {
    state().addItem(shoe(), 1)
    const before = state().items
    state().increment('p1::v-black-40')
    expect(state().items).not.toBe(before)
    expect(before[0]?.quantity).toBe(1)
  })

  it('derives count, subtotal and savings with selectors', () => {
    state().addItem(shoe(), 2)
    state().addItem(shoe({ variantId: 'v2', unitPrice: 100, compareAtPrice: null }), 1)
    expect(selectItemCount(state())).toBe(3)
    expect(selectSubtotal(state())).toBe(420)
    expect(selectSavings(state())).toBe(60)
  })

  it('persists items only — never the drawer UI state', () => {
    state().addItem(shoe(), 1)
    state().open()
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '{}')
    expect(stored.state.items).toHaveLength(1)
    expect(stored.state).not.toHaveProperty('isOpen')
    expect(stored.version).toBe(1)
  })

  it('drops corrupt entries when rehydrating from storage', async () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        state: { items: [{ ...shoe(), lineId: 'ok', quantity: 1 }, { lineId: 'bad', quantity: -3 }, 'garbage'] },
      }),
    )
    await useCartStore.persist.rehydrate()
    expect(state().items.map((item) => item.lineId)).toEqual(['ok'])
  })

  it('clamps a stored quantity above the stored cap on hydration', async () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ version: 1, state: { items: [{ ...shoe(), lineId: 'a', quantity: 40, maxQuantity: 5 }] } }),
    )
    await useCartStore.persist.rehydrate()
    expect(state().items[0]?.quantity).toBe(5)
  })
})

describe('isCartItem', () => {
  it('rejects malformed options and a missing/zero max quantity', () => {
    expect(isCartItem({ ...shoe(), lineId: 'x', quantity: 1, options: [null] })).toBe(false)
    expect(isCartItem({ ...shoe(), lineId: 'x', quantity: 1, maxQuantity: 0 })).toBe(false)
    expect(isCartItem({ ...shoe(), lineId: 'x', quantity: 1, compareAtPrice: 'free' })).toBe(false)
  })

  it('rejects non-integer or non-positive quantities', () => {
    expect(isCartItem({ ...shoe(), lineId: 'x', quantity: 1.5 })).toBe(false)
    expect(isCartItem({ ...shoe(), lineId: 'x', quantity: 0 })).toBe(false)
    expect(isCartItem({ ...shoe(), lineId: 'x', quantity: 2 })).toBe(true)
  })
})
