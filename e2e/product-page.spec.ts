import { expect, test } from '@playwright/test'
import { store } from '../src/config/store.ts'
import product from '../src/test/fixtures/product.json' with { type: 'json' }

/** Same formatting as `formatPrice` in the app, from the same store settings. */
const wholePrice = new Intl.NumberFormat(store.locale, {
  style: 'currency',
  currency: store.currency,
  maximumFractionDigits: 0,
})
const price = (value: number) => wholePrice.format(value).replace(/\s/g, ' ')

// Deterministic E2E: the product API is answered from the captured fixture.
test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/products/slug/**', (route) => route.fulfill({ json: product }))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(product.name)
})

test('select variation → add to cart → manage cart → persists across reload', async ({ page }) => {
  const addToCart = page.getByRole('button', { name: 'Add To Cart' }).first()

  await addToCart.click()
  await expect(page.getByText('Please select a size')).toBeVisible()

  await page.getByRole('radio', { name: 'Black' }).click()
  await page.getByRole('radio', { name: '40' }).click()
  await addToCart.click()
  // The button turns into a − 1 + stepper; + adds another unit of the same variant.
  const stepper = page.getByRole('group', { name: /in cart/ }).first()
  await expect(stepper.getByRole('spinbutton')).toHaveValue('1')
  await stepper.getByRole('button', { name: 'Increase quantity' }).click()
  await expect(stepper.getByRole('spinbutton')).toHaveValue('2')

  const cartButton = page.getByRole('button', { name: /Open cart/ }).filter({ visible: true })
  await expect(cartButton).toHaveAccessibleName('Open cart, 2 items')
  await expect(page.getByRole('status')).toContainText('added to cart')

  await cartButton.click()
  const drawer = page.getByRole('dialog', { name: /Your cart/ })
  await expect(drawer).toBeVisible()
  await expect(drawer.getByText('Color: Black · Size: 40')).toBeVisible()
  await expect(drawer.getByTestId('cart-subtotal')).toHaveText(price(320))

  await drawer.getByRole('button', { name: 'Decrease quantity' }).click()
  await expect(drawer.getByTestId('cart-subtotal')).toHaveText(price(160))

  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()

  await page.reload()
  await expect(page.getByRole('button', { name: /Open cart/ }).filter({ visible: true })).toHaveAccessibleName(
    'Open cart, 1 item',
  )
})

test('gallery follows the selected color and supports keyboard browsing', async ({ page }) => {
  await page.getByRole('radio', { name: 'Biege' }).click()
  const gallery = page.getByRole('region', { name: 'Product images' })
  await expect(gallery.locator('img').first()).toHaveAttribute('alt', /Biege/)

  const viewer = gallery.getByLabel(/Image \d of \d/)
  await viewer.focus()
  await page.keyboard.press('ArrowRight')
  await expect(gallery.locator('img').first()).not.toHaveAttribute('alt', /Biege/)
})

test('review filters narrow the list and reset pagination', async ({ page, isMobile }) => {
  const reviews = page.locator('#reviews')
  await reviews.scrollIntoViewIfNeeded()

  if (isMobile) {
    await reviews.getByRole('button', { name: /Filter reviews/ }).click()
    await page.getByRole('dialog', { name: 'Reviews Filter' }).getByLabel('3 stars').check()
    await page.getByRole('button', { name: /Show \d+ reviews/ }).click()
  } else {
    await reviews.getByLabel('3 stars').check()
  }

  await expect(reviews.getByRole('article')).toHaveCount(1)
  await expect(reviews.getByRole('article')).toContainText('Runs slightly small')
})
