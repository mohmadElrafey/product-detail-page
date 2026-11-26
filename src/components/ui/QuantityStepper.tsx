import { useState } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'

interface QuantityStepperProps {
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
  /** Accessible name, e.g. "Quantity" or "Quantity for Achilles Pro". */
  label: string
  size?: 'md' | 'sm'
  /** When true, going below `min` is allowed (used by the cart to remove a line). */
  allowRemove?: boolean
}

/**
 * Accessible stepper: a native number input (keyboard arrows, typing, screen
 * reader "spin button" semantics) flanked by −/+ buttons. Values are clamped to
 * [min, max] on every path, including typed and pasted input.
 */
export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  label,
  size = 'md',
  allowRemove = false,
}: QuantityStepperProps) {
  const clamp = (next: number) => Math.min(Math.max(next, min), max)
  // While typing, keep the raw text (so the field can be cleared); commit on blur/Enter.
  const [draft, setDraft] = useState<string | null>(null)
  const commit = () => {
    if (draft === null) return
    const parsed = Number.parseInt(draft, 10)
    if (!Number.isNaN(parsed)) onChange(clamp(parsed))
    setDraft(null)
  }
  const buttonClass =
    'inline-flex h-full items-center justify-center text-secondary transition-colors hover:text-ink disabled:cursor-not-allowed disabled:text-dot'

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'inline-flex items-center rounded-md border border-option bg-white lg:rounded-lg',
        size === 'md' ? 'h-10' : 'h-8',
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        className={cn(buttonClass, size === 'md' ? 'w-10' : 'w-8')}
        disabled={!allowRemove && value <= min}
        onClick={() => onChange(allowRemove ? value - 1 : clamp(value - 1))}
      >
        <Icon name="minus" size={size === 'md' ? 18 : 16} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label="Quantity"
        min={min}
        max={max}
        value={draft ?? value}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit()
        }}
        className={cn(
          'h-full border-x border-option bg-transparent text-center font-semibold text-ink [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none',
          size === 'md' ? 'w-12 text-lg' : 'w-9 text-sm',
        )}
      />
      <button
        type="button"
        aria-label="Increase quantity"
        className={cn(buttonClass, size === 'md' ? 'w-10' : 'w-8')}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + 1))}
      >
        <Icon name="plus" size={size === 'md' ? 18 : 16} />
      </button>
    </div>
  )
}
