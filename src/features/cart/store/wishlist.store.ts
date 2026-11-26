import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface WishlistStore {
  productIds: string[]
  toggle: (productId: string) => boolean
}

/** Bonus feature: persisted wishlist (heart button in the gallery and header count). */
export const useWishlistStore = create<WishlistStore>()(
  persist(
    immer((set, get) => ({
      productIds: [],
      toggle: (productId) => {
        const willAdd = !get().productIds.includes(productId)
        set((state) => {
          if (willAdd) state.productIds.push(productId)
          else state.productIds = state.productIds.filter((id) => id !== productId)
        })
        return willAdd
      },
    })),
    {
      name: 'pdp-wishlist',
      version: 1,
      merge: (persisted, current) => {
        const ids = (persisted as { productIds?: unknown } | undefined)?.productIds
        return {
          ...current,
          productIds: Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : [],
        }
      },
    },
  ),
)
