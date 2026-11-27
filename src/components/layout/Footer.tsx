import { useState, type FormEvent } from 'react'
import { DashedRule } from '../ui/Dashed'
import { Icon, type IconName } from '../ui/Icon'
import { toast } from '../../lib/toast/toast.store'
import { Logo } from './Logo'

const COLUMNS = [
  { title: 'Shop', links: ['My account', 'Login', 'Wishlist', 'Cart'] },
  { title: 'Information', links: ['Shipping Policy', 'Returns & Refunds', 'Cookies Policy', 'Frequently asked'] },
  { title: 'Company', links: ['About us', 'Privacy Policy', 'Terms & Conditions', 'Contact Us'] },
]

const SOCIALS: { icon: IconName; label: string; href: string }[] = [
  { icon: 'facebook', label: 'Facebook', href: 'https://facebook.com' },
  { icon: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/achilles.shoes' },
  { icon: 'twitter', label: 'X (Twitter)', href: 'https://x.com' },
  { icon: 'mail', label: 'Email us', href: 'mailto:hello@example.com' },
]

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-')

/** Computed once at module load — keeps render pure. */
const CURRENT_YEAR = new Date().getFullYear()

function Newsletter() {
  const [email, setEmail] = useState('')

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Native constraint validation (type=email + required) already ran before submit fires.
    toast('Thanks! You are subscribed to our offers.')
    setEmail('')
  }

  return (
    <form onSubmit={onSubmit} className="flex w-[298px] max-w-full items-center gap-8 border-b border-ink/80">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Get latest offers to your inbox"
        className="h-9 min-w-0 flex-1 bg-transparent text-base leading-[1.6] font-medium tracking-[0.01em] placeholder:text-placeholder focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Subscribe"
        className="inline-flex h-9 w-[52px] shrink-0 items-center justify-center rounded-md bg-ink text-white transition-colors hover:bg-heading lg:rounded-lg"
      >
        <Icon name="chevronRight" />
      </button>
    </form>
  )
}

export function Footer() {
  return (
    <footer className="bg-surface pt-[45px] pb-8 lg:pt-[72px] lg:pb-[29px]">
      <div className="page-container">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-10">
          <div className="flex flex-col items-start lg:h-[160px]">
            <Logo />
            <div className="mt-10">
              <Newsletter />
            </div>
            <ul className="mt-6 flex gap-4 lg:mt-5" aria-label="Social media">
              {SOCIALS.map((social) => (
                <li key={social.icon} className="flex">
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="inline-flex size-9 items-center justify-center rounded-full bg-white text-title transition-colors hover:bg-selected"
                  >
                    <Icon name={social.icon} size={36} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-x-[58px] gap-y-6 sm:grid-cols-3 lg:flex lg:gap-[120px]">
            {COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title} className="w-[134px]">
                <h3 className="text-lg leading-6 font-medium text-title lg:h-[22px] lg:text-sm lg:font-semibold">
                  {column.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a
                        href={`/${slugify(link)}`}
                        className="block text-sm leading-[22px] text-footer transition-colors hover:text-ink lg:text-ink lg:hover:text-secondary"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <DashedRule className="mt-12 lg:mt-[72px]" />

        <div className="mt-6 flex flex-col gap-6 lg:mt-[23px] lg:h-[22px] lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm leading-[22px] text-footer">© Achilles 2001 - {CURRENT_YEAR}</p>
          <div className="flex items-center gap-4 self-end lg:gap-8 lg:self-auto">
            <button type="button" className="flex items-center gap-2 text-sm leading-6 font-medium text-title">
              <UsFlag />
              English
              <Icon name="chevronDown" size={18} />
            </button>
            <button type="button" className="flex items-center gap-0.5 text-sm leading-6 font-medium text-title lg:gap-8">
              USD
              <Icon name="chevronDown" size={18} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

function UsFlag() {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true" className="rounded-[1px]">
      <rect width="18" height="14" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((y) => (
        <rect key={y} y={y} width="18" height="1.08" fill="#B22234" />
      ))}
      <rect width="8" height="7.5" fill="#3C3B6E" />
    </svg>
  )
}
