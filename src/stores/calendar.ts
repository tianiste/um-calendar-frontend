import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { getCalendar } from '@/services/api'
import { parseICS } from '@/services/calendarParser'
import type { CalendarEvent } from '@/types/calendar'
import { isDimmed } from '@/services/eventDisplay'
import { findOverlaps } from '@/services/eventOverlaps'
import { scheduleChanges, type ScheduleChange } from '@/services/scheduleInsights'
import { readCache, writeCache, isSavedCalendar, isProgrammeList } from '@/services/offlineCache'

interface ProgrammeState {
  events: CalendarEvent[]
  loading: boolean
  error: boolean
  lastSynced: Date | null
  usingSaved: boolean
  cacheUnavailable: boolean
  changes: ScheduleChange[]
}

const SELECTION_KEY = 'um-calendar-selected-programmes'
const GROUPS_KEY = 'um-calendar-programme-groups'
const cacheKey = (name: string) => 'um-calendar-offline-v2:' + encodeURIComponent(name)
function isGroups(value: unknown): value is Record<string, string | null> {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.values(value).every((group) => group === null || typeof group === 'string')
  )
}

export const useCalendarStore = defineStore('calendar', () => {
  const selectedCalendars = ref<string[]>([])
  const hiddenProgrammes = ref(readCache('um-calendar-hidden-programmes', isProgrammeList) || [])
  function toggleProgramme(name: string) {
    hiddenProgrammes.value = hiddenProgrammes.value.includes(name)
      ? hiddenProgrammes.value.filter((item) => item !== name)
      : [...hiddenProgrammes.value, name]
    writeCache('um-calendar-hidden-programmes', hiddenProgrammes.value)
  }
  function showAllProgrammes() {
    hiddenProgrammes.value = []
    writeCache('um-calendar-hidden-programmes', [])
  }
  // Kept as a read-only convenience for existing single-programme checks.
  const selectedCalendar = computed(() => selectedCalendars.value[0] || '')
  const states = ref<Record<string, ProgrammeState>>({})
  const requests = new Map<string, number>()
  const groups = ref(readCache(GROUPS_KEY, isGroups) || {})
  const hideOtherGroups = ref(localStorage.getItem('um-calendar-hide-other-groups') === 'true')
  watch(hideOtherGroups, (value) => {
    try {
      localStorage.setItem('um-calendar-hide-other-groups', String(value))
    } catch {
      /* Optional preference. */
    }
  })
  const programmes = computed(() =>
    selectedCalendars.value.map((name) => ({ name, ...states.value[name]! })),
  )
  const events = computed(() =>
    programmes.value
      .flatMap((programme) => programme.events || [])
      .sort((a, b) => a.start.getTime() - b.start.getTime() || a.id.localeCompare(b.id)),
  )
  const loading = computed(() => programmes.value.some((programme) => programme.loading))
  const lastSynced = computed(() => {
    const dates = programmes.value.flatMap((programme) =>
      programme.lastSynced ? [programme.lastSynced.getTime()] : [],
    )
    return dates.length ? new Date(Math.min(...dates)) : null
  })
  const error = computed(
    () => !!selectedCalendars.value.length && !loading.value && !lastSynced.value,
  )
  const usingSaved = computed(() => programmes.value.some((programme) => programme.usingSaved))
  const cacheUnavailable = computed(() =>
    programmes.value.some((programme) => programme.cacheUnavailable),
  )
  const failedCalendars = computed(() => programmes.value.filter((programme) => programme.error))
  const selectedGroup = computed(() => groupFor(selectedCalendar.value))
  const hasGroupFilter = computed(() => selectedCalendars.value.some((name) => !!groupFor(name)))
  function groupFor(programme?: string): string | null {
    return groups.value[programme || selectedCalendar.value] || null
  }
  function dimmed(event: CalendarEvent): boolean {
    return isDimmed(event.title, groupFor(event.programme))
  }
  const visibleEvents = computed(() =>
    events.value.filter(
      (event) =>
        !hiddenProgrammes.value.includes(event.programme || '') &&
        (!hideOtherGroups.value || !dimmed(event)),
    ),
  )
  const overlaps = computed(() =>
    findOverlaps(visibleEvents.value.filter((event) => !dimmed(event))),
  )

  async function loadCalendar(name: string) {
    if (!selectedCalendars.value.includes(name)) return
    const request = (requests.get(name) || 0) + 1
    requests.set(name, request)
    const old = states.value[name]
    const state: ProgrammeState = {
      events: old?.events || [],
      loading: true,
      error: false,
      lastSynced: old?.lastSynced || null,
      usingSaved: !!old?.lastSynced,
      cacheUnavailable: false,
      changes: old?.changes || [],
    }
    states.value[name] = state
    const saved =
      readCache(cacheKey(name), isSavedCalendar) ||
      readCache('um-calendar-offline-calendar', isSavedCalendar)
    if (!state.lastSynced && saved?.name === name) {
      try {
        state.events = annotate(parseICS(saved.ics), name)
        state.lastSynced = new Date(saved.updated)
        state.usingSaved = true
      } catch {
        /* Ignore invalid snapshots and try the network. */
      }
    }
    const current = () => selectedCalendars.value.includes(name) && requests.get(name) === request
    try {
      const ics = await getCalendar(name)
      const parsed = annotate(parseICS(ics), name)
      if (!current()) return
      const changes = state.lastSynced ? scheduleChanges(state.events, parsed) : []
      states.value[name] = {
        changes: changes.length ? changes : state.changes,
        events: parsed,
        loading: false,
        error: false,
        usingSaved: false,
        lastSynced: new Date(),
        cacheUnavailable: false,
      }
      const updated = states.value[name]!
      updated.cacheUnavailable = !writeCache(cacheKey(name), {
        name,
        ics,
        updated: updated.lastSynced!.toISOString(),
      })
    } catch {
      if (current()) states.value[name]!.error = !states.value[name]!.lastSynced
    } finally {
      if (current()) states.value[name]!.loading = false
    }
  }

  function annotate(items: CalendarEvent[], name: string): CalendarEvent[] {
    return items.map((event, index) => ({
      ...event,
      programme: name,
      sourceId: event.id,
      id: JSON.stringify([name, event.id, event.start.toISOString(), index]),
    }))
  }

  async function setCalendars(names: string[]) {
    const unique = [...new Set(names.filter(Boolean))]
    for (const name of selectedCalendars.value) {
      if (!unique.includes(name)) {
        requests.set(name, (requests.get(name) || 0) + 1)
        delete states.value[name]
      }
    }
    for (const name of unique) {
      if (!states.value[name])
        states.value[name] = {
          events: [],
          loading: true,
          error: false,
          lastSynced: null,
          usingSaved: false,
          cacheUnavailable: false,
          changes: [],
        }
    }
    selectedCalendars.value = unique
    writeCache(SELECTION_KEY, unique)
    await Promise.all(unique.filter((name) => !states.value[name]!.lastSynced).map(loadCalendar))
  }
  async function refreshCalendars() {
    await Promise.all(selectedCalendars.value.map(loadCalendar))
  }
  function removeCalendar(name: string) {
    return setCalendars(selectedCalendars.value.filter((value) => value !== name))
  }
  function loadSavedCalendars(): string[] {
    const saved = readCache(SELECTION_KEY, isProgrammeList)
    if (saved) return saved
    const legacy = localStorage.getItem('um-calendar-selected')
    const legacyGroup = localStorage.getItem('um-calendar-selected-group')
    if (legacy && !(legacy in groups.value) && legacyGroup) {
      groups.value[legacy] = legacyGroup
      writeCache(GROUPS_KEY, groups.value)
    }
    return legacy ? [legacy] : []
  }
  function loadSavedCalendar(): string | null {
    return loadSavedCalendars()[0] || null
  }
  function setSelectedGroup(group: string | null, name = selectedCalendar.value) {
    if (!name) return
    groups.value[name] = group
    writeCache(GROUPS_KEY, groups.value)
  }
  function clearGroups() {
    for (const name of selectedCalendars.value) groups.value[name] = null
    writeCache(GROUPS_KEY, groups.value)
  }
  function loadSavedGroup() {
    return selectedGroup.value
  }

  return {
    hiddenProgrammes,
    toggleProgramme,
    showAllProgrammes,
    dismissChanges: (name: string) => {
      if (states.value[name]) states.value[name]!.changes = []
    },
    selectedCalendar,
    selectedCalendars,
    programmes,
    events,
    loading,
    error,
    lastSynced,
    usingSaved,
    cacheUnavailable,
    failedCalendars,
    hideOtherGroups,
    visibleEvents,
    overlaps,
    selectedGroup,
    hasGroupFilter,
    groupFor,
    dimmed,
    setCalendars,
    removeCalendar,
    loadCalendar,
    refreshCalendars,
    loadSavedCalendar,
    loadSavedCalendars,
    setSelectedGroup,
    clearGroups,
    loadSavedGroup,
  }
})
