import axios from 'axios'
import type { CalendarName } from '@/types/calendar'
import { DEFAULT_API_ORIGIN } from './apiConfig'

// axios instance and set base url to api url
const api = axios.create({
  baseURL: import.meta.env.DEV
    ? '/api'
    : (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || DEFAULT_API_ORIGIN).replace(
        /\/$/,
        '',
      ),
  timeout: 15000,
})

export async function getCalendarNames(): Promise<CalendarName[]> {
  const response = await api.get<CalendarName[]>('/data/names')
  if (!Array.isArray(response.data) || !response.data.every((name) => typeof name === 'string')) {
    throw new Error('The calendar API did not return a programme list.')
  }
  return response.data
}

export async function getCalendar(name: string): Promise<string> {
  const response = await api.get<string>(`/data/cal/${encodeURIComponent(name)}`, {
    responseType: 'text',
  })
  return response.data
}
