type ClassValue = string | false | null | undefined

/** Joins truthy class names. Tiny on purpose — no need for clsx/twMerge here. */
export const cn = (...classes: ClassValue[]) => classes.filter(Boolean).join(' ')
