<script setup lang="ts">
import { useCalendarStore } from '@/stores/calendar'
import { useLanguageStore } from '@/stores/language'
import { eventGroup } from '@/services/eventDisplay'
import ProgrammeBadge from './ProgrammeBadge.vue'
const calendar = useCalendarStore()
const i18n = useLanguageStore()
function groups(name: string) {
  return [
    ...new Set([
      '1',
      '2',
      '3',
      '4',
      '5',
      ...calendar.events
        .filter((event) => event.programme === name)
        .map((event) => eventGroup(event.title))
        .filter((group): group is string => !!group),
      ...(calendar.groupFor(name) ? [calendar.groupFor(name)!] : []),
    ]),
  ].sort((a, b) => Number(a) - Number(b))
}
</script>
<template>
  <div class="programme-group-filters">
    <p v-if="calendar.selectedCalendars.length > 1" class="muted">
      {{ i18n.t('groupPerProgramme') }}
    </p>
    <div v-for="name in calendar.selectedCalendars" :key="name" class="programme-group-filter">
      <ProgrammeBadge v-if="calendar.selectedCalendars.length > 1" :name="name" />
      <div class="group-chips" :aria-label="i18n.t('filter')">
        <button
          :class="{ active: !calendar.groupFor(name) }"
          :aria-pressed="!calendar.groupFor(name)"
          @click="calendar.setSelectedGroup(null, name)"
        >
          {{ i18n.t('allGroups') }}
        </button>
        <button
          v-for="group in groups(name)"
          :key="group"
          :class="{ active: calendar.groupFor(name) === group }"
          :aria-pressed="calendar.groupFor(name) === group"
          @click="calendar.setSelectedGroup(group, name)"
        >
          <span v-if="calendar.groupFor(name) === group">★ </span>{{ i18n.t('group') }} {{ group }}
        </button>
      </div>
    </div>
  </div>
  <label v-if="calendar.hasGroupFilter" class="hide-groups-toggle"
    ><input v-model="calendar.hideOtherGroups" type="checkbox" />{{ i18n.t('hideGroups') }}</label
  >
</template>
