import ICAL from 'ical.js'
import type { CalendarEvent } from '@/types/calendar'

export function parseICS(icsContent: string): CalendarEvent[] {
    const jcalData = ICAL.parse(icsContent)
    const vcalendar = new ICAL.Component(jcalData)

    const vevents = vcalendar.getAllSubcomponents('vevent')

    const events: CalendarEvent[] = vevents.map(vevent => {
        const event = new ICAL.Event(vevent)

        return {
            id: event.uid,
            title: event.summary,
            start: event.startDate.toJSDate(),
            end: event.endDate.toJSDate(),
            description: event.description || undefined,
            location: event.location || undefined
        }
    })

    return events
}