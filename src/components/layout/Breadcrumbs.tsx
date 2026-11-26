import { Fragment } from 'react'
import { Icon } from '../ui/Icon'

export interface Crumb {
  label: string
  href?: string
}

/**
 * Semantic breadcrumb (nav > ol, aria-current on the last item). On mobile the
 * current page drops to its own line exactly like the Figma mobile frame.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail = items.slice(0, -1)
  const current = items.at(-1)

  return (
    <nav aria-label="Breadcrumb" className="page-container pt-6 lg:pt-[31px]">
      <ol className="flex flex-wrap items-center gap-x-2 text-[13px] leading-[1.6] font-medium text-muted lg:text-base">
        {trail.map((crumb) => (
          <Fragment key={crumb.label}>
            <li>
              <a href={crumb.href} className="transition-colors hover:text-heading">
                {crumb.label}
              </a>
            </li>
            <li aria-hidden="true" className="text-slate">
              <Icon name="breadcrumb" size={12} />
            </li>
          </Fragment>
        ))}
        {current && (
          <li aria-current="page" className="w-full text-sm text-heading lg:w-auto lg:text-base">
            {current.label}
          </li>
        )}
      </ol>
    </nav>
  )
}
