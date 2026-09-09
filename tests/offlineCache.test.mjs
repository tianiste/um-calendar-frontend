import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createJiti } from 'jiti'

const { readCache, writeCache, isSavedCalendar, isProgrammeList } = await createJiti(
  import.meta.url,
).import('../src/services/offlineCache.ts')
const values = new Map()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      if (key === 'full') throw new Error('Quota exceeded')
      values.set(key, value)
    },
  },
})

test('preserves the saved calendar identity and original update time', () => {
  const snapshot = { name: 'Programme A', ics: 'BEGIN:VCALENDAR', updated: '2026-09-09T08:30:00Z' }
  assert.equal(writeCache('calendar', snapshot), true)
  assert.deepEqual(readCache('calendar', isSavedCalendar), snapshot)
})
test('ignores corrupted JSON and malformed snapshots', () => {
  values.set('broken', '{')
  assert.equal(readCache('broken', isSavedCalendar), null)
  for (const value of [null, {}, { name: 'A', ics: 'data', updated: 'invalid' }, ['A']]) {
    writeCache('invalid', value)
    assert.equal(readCache('invalid', isSavedCalendar), null)
  }
})
test('validates programme lists before using cached data', () => {
  writeCache('names', ['Programme A', 'Programme B'])
  assert.deepEqual(readCache('names', isProgrammeList), ['Programme A', 'Programme B'])
  writeCache('names', ['Programme A', 7])
  assert.equal(readCache('names', isProgrammeList), null)
})
test('storage quota failures do not throw or replace the previous snapshot', () => {
  values.set('full', 'previous')
  assert.equal(writeCache('full', { data: 'new' }), false)
  assert.equal(values.get('full'), 'previous')
})
