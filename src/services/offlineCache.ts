export function readCache<T>(key: string, valid: (value: unknown) => value is T): T | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || 'null')
    return valid(value) ? value : null
  } catch {
    return null
  }
}

export function writeCache(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export interface SavedCalendar {
  name: string
  ics: string
  updated: string
}
export function isSavedCalendar(value: unknown): value is SavedCalendar {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<SavedCalendar>
  return (
    typeof item.name === 'string' &&
    typeof item.ics === 'string' &&
    typeof item.updated === 'string' &&
    Number.isFinite(Date.parse(item.updated))
  )
}
export function isProgrammeList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((name) => typeof name === 'string')
}
