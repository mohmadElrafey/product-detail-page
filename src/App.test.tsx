import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { useCartStore } from './features/cart/store/cart.store'
import { productDto } from './test/fixtures'

function renderApp() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  )
}

const cartButton = () => screen.getAllByRole('button', { name: /open cart/i })[0]!

beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false, lastAddedAt: 0 })
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(productDto), { status: 200, headers: { 'Content-Type': 'application/json' } })),
  )
})

describe('Product page — cart integration', () => {
  it('validates the variation, adds to cart and updates the badge', async () => {
    const user = userEvent.setup()
    renderApp()

    expect(await screen.findByRole('heading', { level: 1, name: productDto.name })).toBeInTheDocument()
    expect(screen.getByTestId('product-price')).toHaveTextContent('EGP 160')

    // 1) No size yet → validation error, nothing added.
    await user.click(screen.getByRole('button', { name: 'Add To Cart' }))
    expect(await screen.findByText('Please select a size')).toBeInTheDocument()
    expect(useCartStore.getState().items).toHaveLength(0)

    // 2) Choose a size, add twice → same line merges to quantity 2, badge shows 2.
    await user.click(screen.getByRole('radio', { name: '40' }))
    await user.click(screen.getByRole('button', { name: 'Add To Cart' }))
    await user.click(screen.getByRole('button', { name: /Add To Cart|Added/ }))

    expect(cartButton()).toHaveAccessibleName('Open cart, 2 items')
    expect(useCartStore.getState().items[0]).toMatchObject({
      quantity: 2,
      unitPrice: 160,
      options: [
        { label: 'Color', value: 'Brown' },
        { label: 'Size', value: '40' },
      ],
    })
    expect(await screen.findAllByText(/added to cart/i)).toHaveLength(2)
  })

  it('manages items in the drawer down to the empty state', async () => {
    const user = userEvent.setup()
    renderApp()
    await screen.findByRole('heading', { level: 1 })

    await user.click(screen.getByRole('radio', { name: '42' }))
    await user.click(screen.getByRole('button', { name: 'Checkout Now' })) // adds + opens drawer

    const drawer = await screen.findByRole('dialog', { name: /your cart/i })
    expect(within(drawer).getByTestId('cart-subtotal')).toHaveTextContent('EGP 160')

    await user.click(within(drawer).getByRole('button', { name: 'Increase quantity' }))
    expect(within(drawer).getByTestId('cart-subtotal')).toHaveTextContent('EGP 320')

    await user.click(within(drawer).getByRole('button', { name: /remove .* from cart/i }))
    expect(within(drawer).getByText('Your cart is empty')).toBeInTheDocument()
    await waitFor(() => expect(cartButton()).toHaveAccessibleName('Open cart, 0 items'))
  })

  it('retries 5xx twice, then shows a retry state', async () => {
    const fetchMock = vi.fn(async () => new Response('oops', { status: 500 }))
    vi.stubGlobal('fetch', fetchMock)
    renderApp()
    // React Query backs off 1s then 2s between attempts.
    expect(
      await screen.findByRole('heading', { name: /couldn’t load this product/i }, { timeout: 6000 }),
    ).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  }, 10_000)

  it('shows a not-found state on 404 without retrying', async () => {
    const fetchMock = vi.fn(async () => new Response('', { status: 404 }))
    vi.stubGlobal('fetch', fetchMock)
    renderApp()
    expect(await screen.findByRole('heading', { name: 'Product not found' })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
