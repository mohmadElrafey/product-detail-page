const BLOCK_SELECTOR = 'p, li, h1, h2, h3, h4, h5, h6, blockquote'
const SENTENCE_END = /[.!?:;]$/

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim()
const endSentence = (value: string) => (SENTENCE_END.test(value) ? value : `${value}.`)

/**
 * Turns the merchant's rich-text HTML into one plain-text paragraph
 * ("<li>Made with leather</li><li>Nappa finish</li>" → "Made with leather. Nappa finish.").
 *
 * Security: `DOMParser` builds an *inert* document — scripts never run and images
 * never load — and we only read `textContent`. Nothing is ever injected as HTML,
 * so there is no XSS surface and no sanitizer dependency.
 */
export function htmlToPlainText(html: string): string {
  const body = new DOMParser().parseFromString(html, 'text/html').body
  // Leaf blocks only, so a <li> that wraps a <p> is not read twice.
  const blocks = [...body.querySelectorAll(BLOCK_SELECTOR)].filter((block) => !block.querySelector(BLOCK_SELECTOR))
  const sources = blocks.length > 0 ? blocks : [body]

  return sources
    .map((block) => normalizeWhitespace(block.textContent ?? ''))
    .filter(Boolean)
    .map(endSentence)
    .join(' ')
}
