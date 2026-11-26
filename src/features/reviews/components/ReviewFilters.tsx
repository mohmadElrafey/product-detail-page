import { useId, useState, type ReactNode } from 'react'
import { DashedRule } from '../../../components/ui/Dashed'
import { Icon } from '../../../components/ui/Icon'
import { REVIEW_TOPICS, type ReviewFilters as Filters, type ReviewTopic } from '../model/reviews'

const toggle = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value]

/** Collapsible group — header button with aria-expanded, like the Figma chevron. */
function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true)
  const panelId = useId()
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="contents">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between text-base leading-[1.4] font-semibold tracking-[-0.2px] text-ink"
        >
          {title}
          <Icon name="chevronUp" size={12} className={open ? 'transition-transform' : 'rotate-180 transition-transform'} />
        </button>
      </legend>
      <div id={panelId} hidden={!open} className="flex flex-col gap-3">
        {children}
      </div>
    </fieldset>
  )
}

/** Native checkbox (keyboard + AT for free) visually styled as the Figma "tick-square". */
function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-base leading-[1.6] font-semibold text-slate hover:text-heading">
      <span className="relative inline-flex size-6 shrink-0 items-center justify-center">
        <input type="checkbox" checked={checked} onChange={onChange} className="peer absolute inset-0 cursor-pointer opacity-0" />
        <span
          aria-hidden="true"
          className="size-[16.5px] border-[1.5px] border-checkbox transition-colors peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink"
        />
        <Icon name="check" size={14} className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100" />
      </span>
      {children}
    </label>
  )
}

interface ReviewFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

export function ReviewFilters({ filters, onChange }: ReviewFiltersProps) {
  return (
    <div className="flex flex-col gap-6">
      <FilterGroup title="Rating">
        {[5, 4, 3, 2, 1].map((stars) => (
          <Checkbox
            key={stars}
            checked={filters.ratings.includes(stars)}
            onChange={() => onChange({ ...filters, ratings: toggle(filters.ratings, stars) })}
          >
            <span className="flex items-center gap-1">
              <Icon name="star" size={18} className="text-star" />
              <span>
                {stars}
                <span className="sr-only"> stars</span>
              </span>
            </span>
          </Checkbox>
        ))}
      </FilterGroup>
      <DashedRule />
      <FilterGroup title="Review Topics">
        {REVIEW_TOPICS.map((topic: ReviewTopic) => (
          <Checkbox
            key={topic}
            checked={filters.topics.includes(topic)}
            onChange={() => onChange({ ...filters, topics: toggle(filters.topics, topic) })}
          >
            {topic}
          </Checkbox>
        ))}
      </FilterGroup>
    </div>
  )
}
