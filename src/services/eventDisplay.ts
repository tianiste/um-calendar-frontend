import type { CalendarEvent } from '@/types/calendar'

export const eventTypes = ['exam', 'lecture', 'lab', 'eLecture', 'eLab', 'other'] as const
export type EventType = (typeof eventTypes)[number]
export function eventType(title: string): EventType {
  const value = title.trim().toLowerCase()
  if (/izpit|kolokvij|exam|midterm/.test(value)) return 'exam'
  if (/^e-v[- ]/.test(value)) return 'eLab'
  if (/^e-p[- ]/.test(value)) return 'eLecture'
  if (/^v-/.test(value)) return 'lab'
  if (/^p-/.test(value)) return 'lecture'
  return 'other'
}
export function eventGroup(title: string): string | null {
  return title.match(/(\d+)\.\s*skupina/i)?.[1] ?? title.match(/group\s+(\d+)/i)?.[1] ?? null
}
export function isDimmed(title: string, group: string | null): boolean {
  return (
    ['lab', 'eLab'].includes(eventType(title)) &&
    !!group &&
    !!eventGroup(title) &&
    eventGroup(title) !== group
  )
}
export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
export function eventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate())
  const end = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)
  return events
    .filter((event) => event.start < end && (event.end > start || sameDay(event.start, day)))
    .sort((a, b) => a.start.getTime() - b.start.getTime())
}
export function weekNumber(value: Date): number {
  const date = new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  return Math.ceil(((date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7)
}
