<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { getCalendarNames } from '@/services/api'
import { searchProgrammes } from '@/services/programmeSearch'
import { programmeLabel } from '@/services/programmeLabel'
import { useCalendarStore } from '@/stores/calendar'
import { useScheduleStore } from '@/stores/schedule'
import { useLanguageStore } from '@/stores/language'
import AppIcon from './AppIcon.vue'
import ProgrammeBadge from './ProgrammeBadge.vue'
import { readCache, writeCache, isProgrammeList } from '@/services/offlineCache'
const calendar = useCalendarStore()
const schedule = useScheduleStore()
const i18n = useLanguageStore()
const calendars = ref<string[]>([])
const search = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const error = ref(false)
const expanded = computed(() => schedule.selecting || !calendar.selectedCalendar)
const label = (name: string) => programmeLabel(name, i18n.language)
const results = computed(() => searchProgrammes(calendars.value, search.value, label))
const draft = ref<string[]>([])
watch(
  () => calendar.selectedCalendars,
  (names) => {
    draft.value = [...names]
  },
  { immediate: true },
)
function toggle(name: string) {
  draft.value = draft.value.includes(name)
    ? draft.value.filter((value) => value !== name)
    : [...draft.value, name]
}
function applySelection() {
  schedule.selecting = false
  search.value = ''
  void calendar.setCalendars(draft.value)
}
async function openSearch() {
  draft.value = [...calendar.selectedCalendars]
  schedule.selecting = true
  await nextTick()
  searchInput.value?.focus()
}
function clearSearch() {
  search.value = ''
  searchInput.value?.focus()
}
async function loadCalendars() {
  loading.value = true
  error.value = false
  const cached = readCache('um-calendar-offline-programmes', isProgrammeList)
  if (cached) calendars.value = cached
  if (!calendar.selectedCalendars.length) void calendar.setCalendars(calendar.loadSavedCalendars())
  try {
    calendars.value = await getCalendarNames()
    writeCache('um-calendar-offline-programmes', calendars.value)
  } catch {
    error.value = !cached?.length
  } finally {
    loading.value = false
  }
}
onMounted(loadCalendars)
</script>
<template>
  <div v-if="!expanded" class="programme-toolbar">
    <button class="programme-picker" @click="openSearch">
      <AppIcon name="school" /><span
        ><small>{{ i18n.t('programmes') }}</small
        ><strong>{{
          calendar.selectedCalendars.length > 1
            ? calendar.selectedCalendars.length + ' · ' + i18n.t('programmes')
            : label(calendar.selectedCalendar)
        }}</strong></span
      ><AppIcon name="down" :size="18" />
    </button>
    <div class="view-switch">
      <button :class="{ active: schedule.view === 'week' }" @click="schedule.switchView('week')">
        {{ i18n.t('week') }}</button
      ><button :class="{ active: schedule.view === 'month' }" @click="schedule.switchView('month')">
        {{ i18n.t('month') }}
      </button>
    </div>
  </div>
  <div v-if="!expanded" class="selected-programmes" :aria-label="i18n.t('selectedProgrammes')">
    <div v-for="name in calendar.selectedCalendars" :key="name" class="selected-programme-chip">
      <button
        class="text-button programme-visibility"
        :aria-pressed="!calendar.hiddenProgrammes.includes(name)"
        :aria-label="`${i18n.t(calendar.hiddenProgrammes.includes(name) ? 'showProgramme' : 'hideProgramme')}: ${label(name)}`"
        @click="calendar.toggleProgramme(name)"
      >
        <AppIcon :name="calendar.hiddenProgrammes.includes(name) ? 'eyeOff' : 'eye'" :size="18" />
        {{ i18n.t(calendar.hiddenProgrammes.includes(name) ? 'showProgramme' : 'hideProgramme') }}
      </button>
      <ProgrammeBadge :name="name" /><button
        class="icon-button"
        :aria-label="i18n.t('removeProgramme') + ': ' + label(name)"
        @click="calendar.removeCalendar(name)"
      >
        <AppIcon name="close" :size="16" />
      </button>
    </div>
  </div>
  <section v-else class="selection-page">
    <div class="selection-heading">
      <h2><span class="status-dot" />{{ i18n.t('selectProgrammes') }}</h2>
      <span>FOV Kranj</span>
    </div>
    <p class="muted">{{ i18n.t('selectionHelp') }}</p>
    <div v-if="draft.length" class="selected-programmes">
      <div v-for="name in draft" :key="name" class="selected-programme-chip">
        <ProgrammeBadge :name="name" /><button
          class="icon-button"
          :aria-label="i18n.t('removeProgramme') + ': ' + label(name)"
          @click="toggle(name)"
        >
          <AppIcon name="close" :size="16" />
        </button>
      </div>
    </div>
    <button
      class="primary-button apply-programmes"
      :disabled="!draft.length"
      @click="applySelection"
    >
      {{ i18n.t('showTimetables') }} ({{ draft.length }})
    </button>
    <div class="panel search-panel">
      <label for="programme-search"
        ><AppIcon name="search" :size="16" />{{ i18n.t('searchLabel') }}</label
      >
      <div class="search-input">
        <input
          id="programme-search"
          ref="searchInput"
          v-model="search"
          type="search"
          :placeholder="i18n.t('searchPlaceholder')"
          autocomplete="off"
        /><button
          v-if="search"
          class="icon-button"
          :aria-label="i18n.t('clearSearch')"
          @click="clearSearch"
        >
          <AppIcon name="close" :size="18" />
        </button>
      </div>
      <div v-if="loading" class="state-panel" role="status">
        <div class="spinner" />
        <p>{{ i18n.t('loadingProgrammes') }}</p>
        <div v-for="n in 3" :key="n" class="skeleton" />
      </div>
      <div v-else-if="error" class="state-panel error-state" role="alert">
        <AppIcon name="warning" :size="32" />
        <h3>{{ i18n.t('programmesError') }}</h3>
        <p>{{ i18n.t('errorHelp') }}</p>
        <button class="primary-button" @click="loadCalendars">{{ i18n.t('retry') }}</button>
      </div>
      <div v-else class="programme-results">
        <p v-if="!results.length" role="status">
          {{ i18n.t(calendars.length ? 'noResults' : 'noProgrammes') }}
        </p>
        <label
          v-for="name in results"
          :key="name"
          class="programme-option"
          :class="{ selected: draft.includes(name) }"
          ><input type="checkbox" :checked="draft.includes(name)" @change="toggle(name)" /><span>{{
            label(name)
          }}</span
          ><span v-if="draft.includes(name)" class="sync-badge">{{
            i18n.t('selected')
          }}</span></label
        >
      </div>
    </div>
  </section>
</template>
