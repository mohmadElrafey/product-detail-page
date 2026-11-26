import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { QuantityStepper } from './QuantityStepper'

function Harness({ max = 10 }: { max?: number }) {
  const [value, setValue] = useState(1)
  return <QuantityStepper label="Quantity" value={value} max={max} onChange={setValue} />
}

describe('QuantityStepper', () => {
  it('lets the user clear the field and type a new value, committed on blur', async () => {
    render(<Harness />)
    const input = screen.getByRole('spinbutton', { name: 'Quantity' })
    await userEvent.clear(input)
    expect(input).toHaveValue(null)
    await userEvent.type(input, '3')
    await userEvent.tab()
    expect(input).toHaveValue(3)
  })

  it('clamps typed values to max and disables + at the limit', async () => {
    render(<Harness max={4} />)
    const input = screen.getByRole('spinbutton', { name: 'Quantity' })
    await userEvent.clear(input)
    await userEvent.type(input, '99{Enter}')
    expect(input).toHaveValue(4)
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled()
  })

  it('does not go below min', async () => {
    render(<Harness />)
    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled()
  })
})
