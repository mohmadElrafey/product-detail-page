import { env } from '../config/env'

const wholePriceFormatter = new Intl.NumberFormat(env.locale, {
  style: 'currency',
  currency: env.currency,
  maximumFractionDigits: 0,
})

const fractionalPriceFormatter = new Intl.NumberFormat(env.locale, {
  style: 'currency',
  currency: env.currency,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactFormatter = new Intl.NumberFormat(env.locale, {
  notation: 'compact',
  maximumFractionDigits: 2,
})

const integerFormatter = new Intl.NumberFormat(env.locale)

const dateTimeFormatter = new Intl.DateTimeFormat(env.locale, {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

/** "EGP 160" for whole amounts, "EGP 160.50" otherwise — never "EGP 160.5". */
export const formatPrice = (value: number) =>
  (Number.isInteger(value) ? wholePriceFormatter : fractionalPriceFormatter).format(value)
export const formatCompact = (value: number) => compactFormatter.format(value)
export const formatInteger = (value: number) => integerFormatter.format(value)
export const formatDateTime = (iso: string) => dateTimeFormatter.format(new Date(iso))

/** "1 item" / "3 items" */
export const pluralize = (count: number, noun: string) => `${count} ${noun}${count === 1 ? '' : 's'}`

/** "4.5" style rating with a single decimal. */
export const formatRating = (value: number) => value.toFixed(1)

/** "biege" -> "Biege", "royal brown" -> "Royal Brown". */
export const toTitleCase = (value: string) =>
  value.replace(/\S+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1))
