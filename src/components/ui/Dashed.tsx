import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

/** Horizontal 0.5px divider with the Figma [6, 6] dash pattern (see `dashed-rule` in index.css). */
export function DashedRule({ className }: { className?: string }) {
  return <div role="separator" className={cn('dashed-rule w-full', className)} />
}

interface DashedBoxProps extends HTMLAttributes<HTMLDivElement> {
  radius?: number
  color?: string
}

/**
 * Container with a dashed rounded border. A CSS dashed border can't match the
 * designer's 6px/6px dashes, so an absolutely-positioned SVG <rect> draws it —
 * `stroke-dasharray` gives exact control and it scales with the box.
 */
export function DashedBox({ radius = 8, color = 'var(--color-outline)', className, children, ...rest }: DashedBoxProps) {
  return (
    <div className={cn('relative', className)} {...rest}>
      <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden="true">
        <rect
          x="0.4"
          y="0.4"
          // Geometry as CSS so calc() works and the stroke stays inside the box.
          style={{ width: 'calc(100% - 0.8px)', height: 'calc(100% - 0.8px)' }}
          rx={radius}
          fill="none"
          stroke={color}
          strokeWidth="0.8"
          strokeDasharray="6 6"
        />
      </svg>
      {children}
    </div>
  )
}
