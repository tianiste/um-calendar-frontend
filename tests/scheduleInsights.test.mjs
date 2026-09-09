import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createJiti } from 'jiti'
const { scheduleChanges, dailySummary, parseLocalDate } = await createJiti(import.meta.url).import(
  '../src/services/scheduleInsights.ts',
)
const event = (id, start, end, programme = 'A') => ({
  id,
  sourceId: id,
  title: id,
  start: new Date(`2026-09-09T${start}:00`),
  end: new Date(`2026-09-09T${end}:00`),
  programme,
})
test('changes detect moved, added and removed events without mistaking a reorder for a change', () => {
  const a = event('a', '09:00', '10:00'),
    b = event('b', '11:00', '12:00')
  assert.deepEqual(scheduleChanges([a, b], [b, a]), [])
  assert.equal(scheduleChanges([a], [{ ...a, location: 'New room' }])[0].kind, 'changed')
  const changes = scheduleChanges(
    [a, b],
    [event('a', '10:00', '11:00'), event('c', '12:00', '13:00')],
  )
  assert.deepEqual(
    changes.map((item) => item.kind),
    ['changed', 'added', 'removed'],
  )
})
test('shared UIDs preserve exact occurrences before matching a moved occurrence', () => {
  const a = event('a', '09:00', '10:00'),
    b = event('a', '11:00', '12:00')
  const changes = scheduleChanges([a, b], [event('a', '10:00', '11:00'), b])
  assert.equal(changes.length, 1)
  assert.equal(+changes[0].before.start, +a.start)
})
test('summary merges overlaps and touching endpoints and finds only internal breaks', () => {
  const result = dailySummary(
    [
      event('a', '09:00', '11:00'),
      event('b', '10:00', '12:00', 'B'),
      event('c', '12:00', '13:00'),
      event('d', '14:00', '15:00'),
    ],
    parseLocalDate('2026-09-09'),
  )
  assert.equal(result.count, 4)
  assert.equal(result.programmes, 2)
  assert.equal(result.minutes, 300)
  assert.equal(result.breaks.length, 1)
  assert.equal(result.breaks[0].minutes, 60)
})
test('summary clips overnight events to the selected day', () => {
  const a = event('a', '23:00', '23:59')
  a.end = new Date('2026-09-10T02:00:00')
  assert.equal(dailySummary([a], parseLocalDate('2026-09-10')).minutes, 120)
  assert.equal(dailySummary([], parseLocalDate('2026-09-10')).finish, null)
})
test('date picker uses local dates and rejects rollover or malformed dates', () => {
  assert.equal(parseLocalDate('2026-09-09').getDate(), 9)
  assert.equal(parseLocalDate('2026-02-30'), null)
  assert.equal(parseLocalDate('bad'), null)
  assert.equal(parseLocalDate('2028-02-29').getMonth(), 1)
})
