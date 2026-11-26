import { useLayoutEffect, useRef, useState } from 'react'

const ELLIPSIS = '…'

/**
 * Finds how many characters of `text` fit in `maxLines` lines *together with* an
 * inline suffix (e.g. "See More…"), so the suffix sits right after the last
 * visible word — something `line-clamp` cannot do.
 *
 * How: a hidden twin paragraph (same width & typography) is measured while a
 * binary search tries prefixes — O(log n) layouts instead of one per character.
 * The result is cut back to a word boundary. Re-measures on resize and once web
 * fonts finish loading (metrics change).
 *
 * The twin must render `<span data-clamp-text />` and `<span data-clamp-suffix />`.
 */
export function useTextClamp(text: string, maxLines: number) {
  const measureRef = useRef<HTMLParagraphElement>(null)
  const [visibleLength, setVisibleLength] = useState(text.length)

  useLayoutEffect(() => {
    const twin = measureRef.current
    const textSpan = twin?.querySelector<HTMLElement>('[data-clamp-text]')
    const suffix = twin?.querySelector<HTMLElement>('[data-clamp-suffix]')
    if (!twin || !textSpan || !suffix) return

    const fits = () => {
      const lineHeight = Number.parseFloat(getComputedStyle(twin).lineHeight)
      return twin.getBoundingClientRect().height <= lineHeight * maxLines + 1
    }

    const measure = () => {
      textSpan.textContent = text
      suffix.hidden = true
      if (fits()) return setVisibleLength(text.length)

      suffix.hidden = false
      let low = 0
      let high = text.length
      while (low < high) {
        const mid = Math.ceil((low + high) / 2)
        textSpan.textContent = text.slice(0, mid).trimEnd() + ELLIPSIS
        if (fits()) low = mid
        else high = mid - 1
      }
      const wordEnd = text.lastIndexOf(' ', low)
      setVisibleLength(wordEnd > 0 ? wordEnd : low)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(twin.parentElement ?? twin)
    void document.fonts?.ready.then(measure)
    return () => observer.disconnect()
  }, [text, maxLines])

  const isTruncated = visibleLength < text.length
  const visibleText = isTruncated ? text.slice(0, visibleLength).trimEnd() + ELLIPSIS : text
  return { measureRef, isTruncated, visibleText }
}
