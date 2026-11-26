import { useEffect, useState } from 'react'

const pad = (value: number) => String(value).padStart(2, '0')

function endOfToday(now = new Date()) {
  const end = new Date(now)
  end.setHours(24, 0, 0, 0)
  return end
}

/** "HH:MM" left until `target` (defaults to midnight — a real daily-deal deadline, not a fake timer). */
export function useCountdown(target?: Date) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15_000)
    return () => window.clearInterval(id)
  }, [])

  const deadline = (target ?? endOfToday(new Date(now))).getTime()
  const remainingMinutes = Math.max(0, Math.floor((deadline - now) / 60_000))
  return `${pad(Math.floor(remainingMinutes / 60))}:${pad(remainingMinutes % 60)}`
}
