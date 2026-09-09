import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createJiti } from 'jiti'
const { findOverlaps } = await createJiti(import.meta.url).import(
  '../src/services/eventOverlaps.ts',
)
const event = (id, programme, start, end) => ({
  id,
  programme,
  title: id,
  start: new Date(start),
  end: new Date(end),
})

test('flags both sides of a conflict across programmes', () => {
  const a = event('a', 'A', '2026-09-09T08:00Z', '2026-09-09T10:00Z')
  const b = event('b', 'B', '2026-09-09T09:00Z', '2026-09-09T11:00Z')
  const result = findOverlaps([b, a])
  assert.deepEqual(result.get('a'), [b])
  assert.deepEqual(result.get('b'), [a])
})
test('adjacent events, zero-duration events, and events within one programme are not conflicts', () => {
  const a = event('a', 'A', '2026-09-09T08:00Z', '2026-09-09T10:00Z')
  assert.equal(findOverlaps([a, event('b', 'B', '2026-09-09T10:00Z', '2026-09-09T11:00Z')]).size, 0)
  assert.equal(findOverlaps([a, event('b', 'A', '2026-09-09T09:00Z', '2026-09-09T11:00Z')]).size, 0)
  assert.equal(findOverlaps([a, event('b', 'B', '2026-09-09T09:00Z', '2026-09-09T09:00Z')]).size, 0)
})
test('handles containment, overnight events, and three simultaneous programmes', () => {
  const a = event('a', 'A', '2026-09-09T23:00Z', '2026-09-10T03:00Z')
  const b = event('b', 'B', '2026-09-10T00:00Z', '2026-09-10T01:00Z')
  const c = event('c', 'C', '2026-09-10T00:30Z', '2026-09-10T02:00Z')
  const result = findOverlaps([a, b, c])
  for (const id of ['a', 'b', 'c']) assert.equal(result.get(id).length, 2)
})
