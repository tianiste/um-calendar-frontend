// what the api returns
export type CalendarName = string

// what the generate-token returns
export interface TokenResponse {
  token: string
}

export interface CalendarEvent {
  id: string
  sourceId?: string
  title: string
  start: Date
  end: Date
  description?: string
  location?: string
  programme?: string
}
