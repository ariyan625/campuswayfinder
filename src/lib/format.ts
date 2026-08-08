import type { TimetableEntry } from '../types'

// ── Date & time helpers ──────────────────────────────────────────────────────

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const DAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatDateLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatTime12(time24: string): string {
  const [h, m] = time24.split(':').map(Number)
  if (Number.isNaN(h)) return time24
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m ?? 0).padStart(2, '0')} ${suffix}`
}

export function timeToMinutes(time24: string): number {
  const [h, m] = time24.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function isSameDay(a: string, b: string): boolean {
  return a === b
}

export interface NextClass {
  entry: TimetableEntry
  dayLabel: string
  /** Minutes from "now" until class starts (>= 0). */
  minutesUntil: number
  isToday: boolean
}

/** Find the next upcoming class from the timetable given the current time. */
export function findNextClass(entries: TimetableEntry[], now = new Date()): NextClass | null {
  if (entries.length === 0) return null

  const nowMin = now.getHours() * 60 + now.getMinutes()
  const todayName = WEEKDAY_NAMES[now.getDay()] // getDay(): 0=Sun … 6=Sat

  const sorted = [...entries].sort((a, b) => {
    const dayDiff = DAY_INDEX[a.day] - DAY_INDEX[b.day]
    if (dayDiff !== 0) return dayDiff
    return timeToMinutes(a.time) - timeToMinutes(b.time)
  })

  // Candidate within the same (or upcoming) week
  const candidates = sorted.map((e) => {
    const dayIdx = DAY_INDEX[e.day]
    let dayOffset = dayIdx - DAY_INDEX[todayName]
    if (dayOffset < 0) dayOffset += 7
    return { entry: e, dayOffset }
  })

  // Prefer today's later classes, else the next day with classes.
  const sameDayFuture = candidates
    .filter((c) => c.dayOffset === 0 && timeToMinutes(c.entry.time) > nowMin)
    .sort((a, b) => timeToMinutes(a.entry.time) - timeToMinutes(b.entry.time))

  let best: (typeof candidates)[number]
  if (sameDayFuture.length > 0) {
    best = sameDayFuture[0]
  } else {
    best = candidates.filter((c) => c.dayOffset > 0).sort((a, b) => a.dayOffset - b.dayOffset)[0]
    if (!best) return null
  }

  const startMin = timeToMinutes(best.entry.time)
  const minutesUntil = best.dayOffset * 24 * 60 + (startMin - nowMin)

  let dayLabel = best.entry.day
  if (best.dayOffset === 0) dayLabel = 'Today'
  else if (best.dayOffset === 1) dayLabel = 'Tomorrow'

  return {
    entry: best.entry,
    dayLabel,
    minutesUntil,
    isToday: best.dayOffset === 0,
  }
}

export function formatCountdown(minutes: number): string {
  if (minutes < 60) return `in ${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `in ${h} hr` : `in ${h} hr ${m} min`
}
