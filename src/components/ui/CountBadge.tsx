interface CountBadgeProps {
  count: number
  /** Changing this value replays the "bump" animation (the badge remounts). */
  animationKey?: string | number
}

const MAX_VISIBLE = 99

/**
 * 13px black counter from Figma, pinned to the top-right of an icon.
 * Decorative (`aria-hidden`): the parent control carries the count in its label.
 */
export function CountBadge({ count, animationKey = count }: CountBadgeProps) {
  if (count <= 0) return null
  return (
    <span
      key={animationKey}
      aria-hidden="true"
      className="absolute top-1 right-0.5 inline-flex h-[13px] min-w-[13px] animate-bump items-center justify-center rounded-full bg-ink px-[3px] text-[8px] leading-none font-medium text-white lg:-top-1 lg:-right-1.5"
    >
      {count > MAX_VISIBLE ? `${MAX_VISIBLE}+` : count}
    </span>
  )
}
