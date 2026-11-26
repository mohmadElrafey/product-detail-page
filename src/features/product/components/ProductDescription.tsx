import { useId, useMemo, useState } from 'react'
import { useTextClamp } from '../../../hooks/useTextClamp'
import { htmlToPlainText } from '../../../lib/htmlToText'

const COLLAPSED_LINES = 4
const TEXT_CLASS = 'text-sm leading-[1.3] text-body lg:text-base'
const TOGGLE_CLASS = 'font-medium text-black'

/**
 * Plain-text description clamped to 4 lines, with "See More...." placed inline
 * right after the last visible word (Figma). Expanding shows the whole text with
 * "See Less" in the same inline position.
 */
export function ProductDescription({ html }: { html: string }) {
  const text = useMemo(() => htmlToPlainText(html), [html])
  const { measureRef, isTruncated, visibleText } = useTextClamp(text, COLLAPSED_LINES)
  const [expanded, setExpanded] = useState(false)
  const id = useId()

  return (
    <section aria-labelledby={`${id}-label`} className="flex flex-col gap-2.5">
      <h2 id={`${id}-label`} className="font-label text-lg leading-[1.2] font-bold text-heading lg:text-xl">
        Description:
      </h2>
      <div className="relative">
        <p id={id} className={TEXT_CLASS}>
          {expanded ? text : visibleText}
          {isTruncated ? (
            <>
              {' '}
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={id}
                onClick={() => setExpanded((value) => !value)}
                className={`${TOGGLE_CLASS} hover:underline`}
              >
                {expanded ? 'See Less' : 'See More....'}
              </button>
            </>
          ) : null}
        </p>

        {/* Invisible twin used only for measuring (see useTextClamp). */}
        <p ref={measureRef} aria-hidden="true" className={`${TEXT_CLASS} invisible absolute inset-x-0 top-0`}>
          <span data-clamp-text />{' '}
          <span data-clamp-suffix className={TOGGLE_CLASS}>
            See More....
          </span>
        </p>
      </div>
    </section>
  )
}
