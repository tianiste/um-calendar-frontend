/** Presentation only: the original filename remains the calendar identifier. */
export function programmeLabel(filename: string, language: 'en' | 'sl' = 'sl'): string {
  const name = filename
    .trim()
    .replace(/\.ics$/i, '')
    .replace(/^\d+---/, '')
  const match = name.match(/^(\d+)-letnik-([a-z]+)-(.+)-(redni|izredni)$/i)
  if (!match) return name.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()

  const [, year, degree, subject, attendance] = match
  const title = subject!.replace(/-+/g, ' ').trim()
  const yearLabel = language === 'sl' ? `${year}. letnik` : `Year ${year}`
  const fullTime = attendance!.toLowerCase() === 'redni'
  const attendanceLabel =
    language === 'sl' ? (fullTime ? 'Redni' : 'Izredni') : fullTime ? 'Full-time' : 'Part-time'
  return [title, yearLabel, degree!.toUpperCase(), attendanceLabel].join(' · ')
}
