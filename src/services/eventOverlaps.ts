import type { CalendarEvent } from '@/types/calendar'

/** Cross-programme conflicts; touching endpoints and zero-duration events do not overlap. */
export function findOverlaps(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const result = new Map<string, CalendarEvent[]>()
  const sorted = events
    .filter((event) => event.programme && event.end > event.start)
    .slice()
    .sort((a, b) => a.start.getTime() - b.start.getTime())
  let active: CalendarEvent[] = []
  for (const event of sorted) {
    active = active.filter((other) => other.end > event.start)
    for (const other of active) {
      if (other.programme === event.programme) continue
      result.set(event.id, [...(result.get(event.id) || []), other])
      result.set(other.id, [...(result.get(other.id) || []), event])
    }
    active.push(event)
  }
  return result
}
