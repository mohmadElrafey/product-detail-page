import { describe, expect, it } from 'vitest'
import { htmlToPlainText } from './htmlToText'

describe('htmlToPlainText', () => {
  it('flattens lists and paragraphs into sentences', () => {
    expect(htmlToPlainText('<ul><li>Made with cowhide leather</li><li>Sole: TR</li></ul><p>Ships in 2 days!</p>')).toBe(
      'Made with cowhide leather. Sole: TR. Ships in 2 days!',
    )
  })

  it('drops empty spacer paragraphs and normalizes &nbsp;', () => {
    expect(htmlToPlainText('<p><br></p><p>Cairo&nbsp;&amp;&nbsp;Alex</p><p> </p>')).toBe('Cairo & Alex.')
  })

  it('never executes or keeps markup from the source', () => {
    const text = htmlToPlainText('<p onclick="alert(1)">Hi<script>alert(1)</script><img src=x onerror=alert(1)></p>')
    expect(text).toBe('Hialert(1).')
    expect(text).not.toContain('<')
  })

  it('does not read nested blocks twice', () => {
    expect(htmlToPlainText('<ul><li><p>Once</p></li></ul>')).toBe('Once.')
  })

  it('falls back to the body text when there are no blocks', () => {
    expect(htmlToPlainText('Plain <strong>text</strong>')).toBe('Plain text.')
  })
})
