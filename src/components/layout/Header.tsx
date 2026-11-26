import { useCallback, useRef, useState } from 'react'
import { useDismiss } from '../../hooks/useDismiss'
import { CartButton } from '../../features/cart/components/CartButton'
import { useWishlistStore } from '../../features/cart/store/wishlist.store'
import type { Category } from '../../features/product/model/product'
import { DashedRule } from '../ui/Dashed'
import { CountBadge } from '../ui/CountBadge'
import { Icon } from '../ui/Icon'
import { pluralize } from '../../lib/format'
import { Sheet } from '../ui/Sheet'
import { Logo } from './Logo'

const headerIconClass =
  'inline-flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface lg:size-auto lg:rounded-none lg:hover:bg-transparent lg:hover:text-secondary'

function CategoriesMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(rootRef, open, close, triggerRef)

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="categories-menu"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1 text-base leading-[1.6] font-medium hover:text-secondary"
      >
        Categories
        <Icon name="chevronDown" className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>
      {open && (
        <ul
          id="categories-menu"
          className="absolute top-full right-0 z-30 mt-3 min-w-52 animate-fade-in rounded-lg border border-hairline bg-white p-2 shadow-lg"
        >
          {categories.map((category) => (
            <li key={category.id}>
              <a
                href={`/categories/${category.slug}`}
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-surface"
                onClick={close}
              >
                {category.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function WishlistLink() {
  const count = useWishlistStore((state) => state.productIds.length)
  return (
    <a href="/wishlist" className={`relative ${headerIconClass}`} aria-label={`Wishlist, ${pluralize(count, 'item')}`}>
      <Icon name="heart" />
      <CountBadge count={count} />
    </a>
  )
}

function WishlistCount() {
  const count = useWishlistStore((state) => state.productIds.length)
  return count > 0 ? <span className="ml-auto rounded-full bg-ink px-2 text-xs leading-5 text-white">{count}</span> : null
}

export function Header({ categories }: { categories: Category[] }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="page-container pt-4 lg:pt-[22px]">
      <div className="flex items-center justify-between">
        <Logo />

        {/* Desktop: search · Categories · Sign in · wishlist · cart (32/42px gaps from Figma) */}
        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          <button type="button" className={headerIconClass} aria-label="Search">
            <Icon name="search" />
          </button>
          <CategoriesMenu categories={categories} />
          <a href="/account" className="flex items-center gap-1 text-base leading-[1.6] font-medium hover:text-secondary">
            <Icon name="user" />
            Sign in
          </a>
          <div className="flex items-center gap-[42px]">
            <WishlistLink />
            <CartButton />
          </div>
        </nav>

        {/* Mobile: search · cart · menu, 20px apart */}
        <div className="-mr-2.5 flex items-center lg:hidden">
          <button type="button" className={headerIconClass} aria-label="Search">
            <Icon name="search" />
          </button>
          <CartButton />
          <button
            type="button"
            className={headerIconClass}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>

      <DashedRule className="mt-4 lg:mt-[22px]" />

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" side="left">
        <nav aria-label="Mobile" className="flex flex-col p-5">
          <a href="/account" className="flex items-center gap-2 py-3 text-base font-medium">
            <Icon name="user" /> Sign in
          </a>
          <a href="/wishlist" className="flex items-center gap-2 py-3 text-base font-medium">
            <Icon name="heart" /> Wishlist
            <WishlistCount />
          </a>
          <p className="mt-4 mb-2 text-sm font-semibold text-muted uppercase">Categories</p>
          {categories.map((category) => (
            <a key={category.id} href={`/categories/${category.slug}`} className="py-2.5 text-base">
              {category.name}
            </a>
          ))}
        </nav>
      </Sheet>
    </header>
  )
}
