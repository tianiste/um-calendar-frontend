import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createJiti } from 'jiti'

const { searchProgrammes } = await createJiti(import.meta.url).import(
  '../src/services/programmeSearch.ts',
)
const names = [
  '01---1-letnik-VS-Informacijski-sistemi-Redni.ics',
  '02---1-letnik-VS-Informacijski-sistemi-Izredni.ics',
  '03---2-letnik-VS-Kadrovsko-izobrazevalni-sistemi-Redni.ics',
]

test('empty search preserves the programme list and order', () => {
  assert.deepEqual(searchProgrammes(names, '  '), names)
})
test('matches reordered words, punctuation, accents, and partial words', () => {
  assert.deepEqual(searchProgrammes(names, 'SISTEMI informácijski 1'), names.slice(0, 2))
  assert.deepEqual(searchProgrammes(names, 'kadrovsko izobraževalni'), [names[2]])
  assert.deepEqual(searchProgrammes(names, 'inform'), names.slice(0, 2))
  assert.deepEqual(searchProgrammes(names, names[0]), [names[0]])
})
test('tolerates missing letters and transpositions', () => {
  assert.deepEqual(searchProgrammes(names, 'informacjiski sistmei'), names.slice(0, 2))
  assert.deepEqual(searchProgrammes(names, 'kadrovsko izobrazevlni'), [names[2]])
})
test('ranks exact words before partial and typo matches', () => {
  assert.deepEqual(searchProgrammes(['Sistemi', 'Sistem', 'Sistme'], 'sistem'), [
    'Sistem',
    'Sistemi',
    'Sistme',
  ])
  assert.deepEqual(searchProgrammes([...names].reverse(), 'informacijski redni'), names.slice(0, 2))
})
test('requires every query word and avoids fuzzy year/code matches', () => {
  assert.deepEqual(searchProgrammes(names, 'informacijski 2'), [])
  assert.deepEqual(searchProgrammes(names, 'informacijski UN'), [])
  assert.deepEqual(searchProgrammes(names, 'astronomy'), [])
  assert.deepEqual(searchProgrammes(['13 letnik', '1 letnik'], '1'), ['1 letnik'])
})
