import { useId, useRef, type KeyboardEvent, type ReactNode, type Ref } from 'react'
import { cn } from '../../../lib/cn'
import type { Variation, VariationOption } from '../model/product'

interface VariationSelectorProps {
  variation: Variation
  value: string | undefined
  isAvailable: (value: string) => boolean
  onSelect: (value: string) => void
  /** Shown when Add to Cart is pressed without choosing this variation. */
  error?: string
  /** Optional right-aligned link in the label row ("View Size Chart"). */
  aside?: ReactNode
  /** React 19: `ref` is a regular prop — no forwardRef needed. */
  ref?: Ref<HTMLDivElement>
}

/**
 * WAI-ARIA radio group with a roving tabindex:
 *  - Tab enters the group once (on the checked option), arrows move AND select,
 *    Home/End jump, unavailable options are skipped but still announced.
 *  - Unavailable = no purchasable variant for this option + current selection
 *    (computed in model/variants.ts), shown crossed-out and `aria-disabled`.
 * Visual variants follow Figma: image/color swatches 75×40, text options 75×40 outlined.
 */
export function VariationSelector({ variation, value, isAvailable, onSelect, error, aside, ref }: VariationSelectorProps) {
  const labelId = useId()
  const errorId = useId()
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const selected = variation.options.find((option) => option.value === value)
  const isSwatch = variation.kind !== 'text'

  const focusable = variation.options.map((option) => isAvailable(option.value))
  const checkedIndex = variation.options.findIndex((option) => option.value === value)
  const tabStop = checkedIndex !== -1 ? checkedIndex : Math.max(focusable.indexOf(true), 0)

  const moveTo = (index: number) => {
    const option = variation.options[index]
    if (!option) return
    optionRefs.current[index]?.focus()
    onSelect(option.value)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, from: number) => {
    const enabled = variation.options.map((_, index) => index).filter((index) => focusable[index])
    if (enabled.length === 0) return
    // Neighbours are resolved by *index*, so this also works when focus sits on an
    // unavailable option (a mouse click can still focus it).
    const next = enabled.find((index) => index > from) ?? enabled[0]
    const previous = enabled.findLast((index) => index < from) ?? enabled.at(-1)
    const keyMap: Record<string, number | undefined> = {
      ArrowRight: next,
      ArrowDown: next,
      ArrowLeft: previous,
      ArrowUp: previous,
      Home: enabled[0],
      End: enabled.at(-1),
    }
    const target = keyMap[event.key]
    if (target === undefined) return
    event.preventDefault()
    moveTo(target)
  }

  return (
    <div ref={ref} className="flex flex-col gap-[18px]">
      <div className="flex items-center justify-between gap-4">
        <p id={labelId} className="text-lg leading-[1.2] font-medium text-muted lg:text-xl">
          {variation.label}:{' '}
          <span className="font-semibold text-heading">{selected?.label ?? <span className="font-medium">Select</span>}</span>
        </p>
        {aside}
      </div>

      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'grid grid-cols-4 gap-x-[13.7px] lg:flex lg:flex-wrap lg:gap-[14px]',
          isSwatch ? 'gap-y-[13.7px]' : 'gap-y-[22px] lg:gap-y-[14px]',
        )}
      >
        {variation.options.map((option, index) => (
          <OptionButton
            key={option.id}
            ref={(element) => {
              optionRefs.current[index] = element
            }}
            option={option}
            kind={variation.kind}
            checked={option.value === value}
            available={focusable[index] ?? false}
            tabIndex={index === tabStop ? 0 : -1}
            onClick={() => focusable[index] && onSelect(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
          />
        ))}
      </div>

      {error && (
        <p id={errorId} role="alert" className="-mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

interface OptionButtonProps {
  option: VariationOption
  kind: Variation['kind']
  checked: boolean
  available: boolean
  tabIndex: number
  onClick: () => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
  ref?: Ref<HTMLButtonElement>
}

function OptionButton({ option, kind, checked, available, tabIndex, onClick, onKeyDown, ref }: OptionButtonProps) {
  const base =
    'relative h-[39px] w-full rounded-md transition-[background-color,border-color,box-shadow] duration-150 lg:h-10 lg:w-[75px] lg:rounded-lg'

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={checked}
      aria-disabled={!available}
      aria-label={available ? option.label : `${option.label} (unavailable)`}
      title={option.label}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={cn(
        base,
        kind === 'text'
          ? cn(
              'border text-[19.6px] leading-[1.2] font-semibold lg:text-xl',
              checked ? 'border-strong bg-selected text-ink' : 'border-option bg-white text-secondary hover:border-strong',
            )
          : cn('overflow-hidden border', checked ? 'border-ink bg-white p-[5.9px] lg:p-1.5' : 'border-transparent'),
        !available && 'cursor-not-allowed opacity-40',
      )}
    >
      {kind === 'text' ? (
        option.label
      ) : (
        <span
          className={cn(
            'block size-full overflow-hidden bg-surface',
            checked ? 'rounded-[4px] lg:rounded-md' : 'rounded-md lg:rounded-lg',
          )}
          style={kind === 'color' ? { backgroundColor: option.swatch } : undefined}
        >
          {kind === 'image' && option.swatch && (
            <img src={option.swatch} alt="" width={75} height={40} loading="lazy" className="size-full object-cover mix-blend-multiply" />
          )}
        </span>
      )}
      {!available && (
        <span aria-hidden="true" className="absolute inset-0 m-auto h-px w-[70%] -rotate-[20deg] bg-secondary" />
      )}
    </button>
  )
}
