import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createJiti } from 'jiti'
const jiti = createJiti(import.meta.url)
const { programmeLabel } = await jiti.import('../src/services/programmeLabel.ts')
const { searchProgrammes } = await jiti.import('../src/services/programmeSearch.ts')
const name = '01---1-letnik-VS-Informacijski-sistemi-Redni.ics'

test('formats the programme with year, degree, and attendance', () => {
  assert.equal(programmeLabel(name), 'Informacijski sistemi · 1. letnik · VS · Redni')
  assert.equal(
    programmeLabel('58---2-letnik-DR-Informacijski-sistemi-Izredni.ics'),
    'Informacijski sistemi · 2. letnik · DR · Izredni',
  )
})
test('localizes metadata without translating the programme subject', () => {
  assert.equal(programmeLabel(name, 'en'), 'Informacijski sistemi · Year 1 · VS · Full-time')
  assert.equal(
    programmeLabel(name.replace('Redni', 'Izredni'), 'en'),
    'Informacijski sistemi · Year 1 · VS · Part-time',
  )
})
test('handles unrecognized formats without discarding their names', () => {
  assert.equal(programmeLabel('99---Special-programme.ICS'), 'Special programme')
  assert.equal(programmeLabel('Computer Science (VS)'), 'Computer Science (VS)')
  assert.equal(programmeLabel(''), '')
})
test('searches readable labels and returns the untouched API identifier', () => {
  const labels = (id) => programmeLabel(id, 'en')
  assert.deepEqual(searchProgrammes([name], 'year 1 full time', labels), [name])
  assert.deepEqual(searchProgrammes([name], programmeLabel(name), labels), [name])
  assert.deepEqual(searchProgrammes([name], 'informacjiski sistmei', labels), [name])
  assert.deepEqual(searchProgrammes([name], name, labels), [name])
})
