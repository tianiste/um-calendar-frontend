function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\.ics$/i, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

// Edit distance including swapped adjacent letters (e.g. "sistmei").
function distance(query: string, word: string): number {
  const rows = Array.from({ length: query.length + 1 }, (_, row) =>
    Array.from({ length: word.length + 1 }, (_, column) =>
      row === 0 ? column : column === 0 ? row : 0,
    ),
  )
  for (let row = 1; row <= query.length; row++) {
    for (let column = 1; column <= word.length; column++) {
      rows[row]![column] = Math.min(
        rows[row - 1]![column]! + 1,
        rows[row]![column - 1]! + 1,
        rows[row - 1]![column - 1]! + (query[row - 1] === word[column - 1] ? 0 : 1),
      )
      if (
        row > 1 &&
        column > 1 &&
        query[row - 1] === word[column - 2] &&
        query[row - 2] === word[column - 1]
      ) {
        rows[row]![column] = Math.min(rows[row]![column]!, rows[row - 2]![column - 2]! + 1)
      }
    }
  }
  return rows[query.length]![word.length]!
}

function tokenScore(query: string, word: string): number {
  if (query === word) return 0
  // Keep years and short programme codes precise.
  if (/^\d+$/.test(query)) return Infinity
  if (word.startsWith(query)) return 1
  if (query.length < 3) return Infinity
  if (word.includes(query)) return 2
  const tolerance = query.length >= 7 ? 2 : query.length >= 4 ? 1 : 0
  if (!tolerance || Math.abs(query.length - word.length) > tolerance) return Infinity
  const edits = distance(query, word)
  return edits <= tolerance ? 3 + edits : Infinity
}

export function searchProgrammes(
  programmes: readonly string[],
  search: string,
  label: (name: string) => string = (name) => name,
): string[] {
  const query = normalize(search)
  if (!query) return [...programmes]
  const tokens = [...new Set(query.split(' '))]
  return programmes
    .map((name, index) => {
      const normalized = normalize(name)
      const displayName = normalize(label(name))
      const words = `${normalized} ${displayName}`.split(' ')
      const score = tokens.reduce(
        (sum, token) => sum + Math.min(...words.map((word) => tokenScore(token, word))),
        0,
      )
      return { name, index, score, exact: normalized === query || displayName === query }
    })
    .filter((result) => Number.isFinite(result.score))
    .sort((a, b) => Number(b.exact) - Number(a.exact) || a.score - b.score || a.index - b.index)
    .map((result) => result.name)
}
