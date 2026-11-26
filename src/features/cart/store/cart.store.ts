import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { toLineId, type AddToCartInput, type CartItem } from './cart.types'

interface CartState {
  items: CartItem[]
  /** UI state — deliberately NOT persisted (a reload should not reopen the drawer). */
  isOpen: boolean
  /** Bumped on every add so the header badge can replay its animation. */
  lastAddedAt: number
  /** One-off message rendered *inside* the drawer (toasts sit under the modal's backdrop). */
  notice: string | null
}

interface CartActions {
  addItem: (input: AddToCartInput, quantity: number) => { added: number; clamped: boolean }
  setQuantity: (lineId: string, quantity: number) => void
  increment: (lineId: string) => void
  decrement: (lineId: string) => void
  removeItem: (lineId: string) => void
  clear: () => void
  open: (notice?: string) => void
  close: () => void
}

export type CartStore = CartState & CartActions

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export const CART_STORAGE_KEY = 'pdp-cart'
const CART_STORAGE_VERSION = 1

const isPositiveInt = (value: unknown): value is number => Number.isInteger(value) && (value as number) > 0
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const isOption = (value: unknown) =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Record<string, unknown>).label === 'string' &&
  typeof (value as Record<string, unknown>).value === 'string'

/** Runtime guard: localStorage is user-controlled, never trust its shape. */
export function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.lineId === 'string' &&
    typeof item.productId === 'string' &&
    (item.variantId === null || typeof item.variantId === 'string') &&
    typeof item.slug === 'string' &&
    typeof item.name === 'string' &&
    typeof item.image === 'string' &&
    isFiniteNumber(item.unitPrice) &&
    item.unitPrice >= 0 &&
    (item.compareAtPrice === null || isFiniteNumber(item.compareAtPrice)) &&
    isPositiveInt(item.quantity) &&
    isPositiveInt(item.maxQuantity) &&
    Array.isArray(item.options) &&
    item.options.every(isOption)
  )
}

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        items: [],
        isOpen: false,
        lastAddedAt: 0,
        notice: null,

        addItem: (input, quantity) => {
          const lineId = toLineId(input.productId, input.variantId)
          const existing = get().items.find((item) => item.lineId === lineId)
          const before = existing?.quantity ?? 0
          const after = clamp(before + quantity, 1, input.maxQuantity)

          set((state) => {
            const line = state.items.find((item) => item.lineId === lineId)
            if (line) {
              // Immer: mutate the draft, a new immutable state is produced for us.
              line.quantity = after
              line.unitPrice = input.unitPrice
              line.compareAtPrice = input.compareAtPrice
              line.maxQuantity = input.maxQuantity
            } else {
              state.items.push({ ...input, lineId, quantity: after })
            }
            state.lastAddedAt = Date.now()
          })

          return { added: after - before, clamped: before + quantity > input.maxQuantity }
        },

        setQuantity: (lineId, quantity) =>
          set((state) => {
            const index = state.items.findIndex((item) => item.lineId === lineId)
            if (index === -1) return
            if (quantity <= 0) {
              state.items.splice(index, 1)
              return
            }
            const line = state.items[index]!
            line.quantity = clamp(Math.floor(quantity), 1, line.maxQuantity)
          }),

        increment: (lineId) => {
          const line = get().items.find((item) => item.lineId === lineId)
          if (line) get().setQuantity(lineId, line.quantity + 1)
        },

        decrement: (lineId) => {
          const line = get().items.find((item) => item.lineId === lineId)
          if (line) get().setQuantity(lineId, line.quantity - 1)
        },

        removeItem: (lineId) =>
          set((state) => {
            state.items = state.items.filter((item) => item.lineId !== lineId)
          }),

        clear: () =>
          set((state) => {
            state.items = []
          }),

        open: (notice) =>
          set((state) => {
            state.isOpen = true
            state.notice = notice ?? null
          }),

        close: () =>
          set((state) => {
            state.isOpen = false
            state.notice = null
          }),
      })),
      {
        name: CART_STORAGE_KEY,
        version: CART_STORAGE_VERSION,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ items: state.items }),
        // Validate on hydration instead of blindly trusting localStorage.
        merge: (persisted, current) => {
          const items = (persisted as { items?: unknown } | undefined)?.items
          const valid = Array.isArray(items) ? items.filter(isCartItem) : []
          // Never trust a stored quantity above the stored cap.
          return { ...current, items: valid.map((item) => ({ ...item, quantity: Math.min(item.quantity, item.maxQuantity) })) }
        },
        migrate: (persisted) => persisted as { items: CartItem[] },
      },
    ),
    { name: 'cart', enabled: import.meta.env.DEV },
  ),
)

/** Keep several open tabs in sync: another tab wrote the cart → rehydrate here. */
export function syncCartAcrossTabs() {
  const onStorage = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY) void useCartStore.persist.rehydrate()
  }
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}
