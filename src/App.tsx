import { lazy, Suspense, useEffect, useState } from 'react'
import { Toaster } from './components/ui/Toaster'
import { env } from './config/env'
import { selectIsOpen } from './features/cart/store/cart.selectors'
import { syncCartAcrossTabs, useCartStore } from './features/cart/store/cart.store'
import { ProductPage } from './pages/ProductPage'

const CartDrawer = lazy(() => import('./features/cart/components/CartDrawer'))

/** The drawer chunk is only downloaded the first time the cart is opened, then stays mounted. */
function LazyCartDrawer() {
  const isOpen = useCartStore(selectIsOpen)
  const [hasOpened, setHasOpened] = useState(false)
  if (isOpen && !hasOpened) setHasOpened(true)
  return hasOpened ? (
    <Suspense fallback={null}>
      <CartDrawer />
    </Suspense>
  ) : null
}

export default function App() {
  useEffect(syncCartAcrossTabs, [])

  return (
    <>
      <ProductPage slug={env.productSlug} />
      <LazyCartDrawer />
      <Toaster />
    </>
  )
}
