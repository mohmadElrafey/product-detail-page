import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { makeProduct } from '../../../test/fixtures'
import { VariationSelector } from './VariationSelector'

const sizes = makeProduct().variations.find((variation) => variation.name === 'size')!

function Harness({ unavailable = [] as string[], error }: { unavailable?: string[]; error?: string }) {
  const [value, setValue] = useState<string | undefined>()
  return (
    <VariationSelector
      variation={sizes}
      value={value}
      isAvailable={(option) => !unavailable.includes(option)}
      onSelect={setValue}
      error={error}
    />
  )
}

describe('VariationSelector', () => {
  it('exposes a labelled radio group and selects on click', async () => {
    render(<Harness />)
    const group = screen.getByRole('radiogroup', { name: /size/i })
    expect(group).toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: '40' }))
    expect(screen.getByRole('radio', { name: '40' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('40', { selector: 'span' })).toBeInTheDocument() // "Size: 40" label
  })

  it('uses a roving tabindex and arrow keys move + select (skipping unavailable)', async () => {
    render(<Harness unavailable={['40']} />)
    await userEvent.tab()
    expect(screen.getByRole('radio', { name: '38' })).toHaveFocus()

    await userEvent.keyboard('{ArrowRight}')
    const size42 = screen.getByRole('radio', { name: '42' })
    expect(size42).toHaveFocus()
    expect(size42).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: /40 \(unavailable\)/ })).toHaveAttribute('tabindex', '-1')
  })

  it('arrow keys resolve neighbours even when focus starts on an unavailable option', async () => {
    render(<Harness unavailable={['40']} />)
    screen.getByRole('radio', { name: /40/ }).focus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(screen.getByRole('radio', { name: '38' })).toHaveFocus()
  })

  it('does not select unavailable options', async () => {
    render(<Harness unavailable={['40']} />)
    const size40 = screen.getByRole('radio', { name: /40/ })
    expect(size40).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(size40)
    expect(size40).toHaveAttribute('aria-checked', 'false')
  })

  it('announces validation errors and links them to the group', () => {
    render(<Harness error="Please select a size" />)
    const group = screen.getByRole('radiogroup')
    expect(group).toHaveAttribute('aria-invalid', 'true')
    expect(group).toHaveAccessibleDescription('Please select a size')
  })
})
