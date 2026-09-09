import type { CalendarEvent } from '@/types/calendar'

export interface ScheduleChange {
  kind: 'added' | 'removed' | 'changed'
  before?: CalendarEvent
  after?: CalendarEvent
}

// Match occurrences by UID and original start first, then detect moved occurrences.
export function scheduleChanges(before: CalendarEvent[], after: CalendarEvent[]): ScheduleChange[] {
  const remaining = new Set(before)
  const matches = new Map<CalendarEvent, CalendarEvent>()
  const uid = (event: CalendarEvent) => event.sourceId || event.id
  for (const event of after) {
    const old = [...remaining].find(
      (item) => uid(item) === uid(event) && +item.start === +event.start,
    )
    if (old) {
      matches.set(event, old)
      remaining.delete(old)
    }
  }
  const changes: ScheduleChange[] = []
  for (const event of after) {
    const old = matches.get(event) || [...remaining].find((item) => uid(item) === uid(event))
    if (!old) {
      changes.push({ kind: 'added', after: event })
      continue
    }
    remaining.delete(old)
    if (
      ['title', 'location', 'description'].some(
        (key) =>
          (old[key as keyof CalendarEvent] || '') !== (event[key as keyof CalendarEvent] || ''),
      ) ||
      +old.start !== +event.start ||
      +old.end !== +event.end
    ) {
      changes.push({ kind: 'changed', before: old, after: event })
    }
  }
  for (const event of remaining) changes.push({ kind: 'removed', before: event })
  return changes
}

export function dailySummary(events: CalendarEvent[], date: Date) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  const relevant = events.filter(
    (event) => +event.start < +end && +event.end > +start && +event.end > +event.start,
  )
  const intervals = relevant
    .map((event) => ({ start: Math.max(+start, +event.start), end: Math.min(+end, +event.end) }))
    .sort((a, b) => a.start - b.start)
  const merged: typeof intervals = []
  for (const interval of intervals) {
    const last = merged[merged.length - 1]
    if (last && interval.start <= last.end) last.end = Math.max(last.end, interval.end)
    else merged.push({ ...interval })
  }
  return {
    count: relevant.length,
    programmes: new Set(relevant.map((event) => event.programme).filter(Boolean)).size,
    minutes: Math.round(
      merged.reduce((sum, interval) => sum + interval.end - interval.start, 0) / 60000,
    ),
    finish: merged.length ? new Date(merged[merged.length - 1]!.end) : null,
    breaks: merged
      .slice(1)
      .map((interval, index) => ({
        start: new Date(merged[index]!.end),
        end: new Date(interval.start),
        minutes: Math.round((interval.start - merged[index]!.end) / 60000),
      })),
  }
}

export function parseLocalDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number) as [number, number, number]
  const date = new Date(0)
  date.setFullYear(year, month - 1, day)
  date.setHours(0, 0, 0, 0)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null
}
