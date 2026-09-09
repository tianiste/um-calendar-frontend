<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { parseLocalDate } from '@/services/scheduleInsights'
import { useScheduleStore } from '@/stores/schedule'
import { useCalendarStore } from '@/stores/calendar'
import { useLanguageStore } from '@/stores/language'
import AppIcon from './AppIcon.vue'
import { programmeLabel } from '@/services/programmeLabel'
const schedule = useScheduleStore()
const calendar = useCalendarStore()
const i18n = useLanguageStore()
const pickerOpen = ref(false)
const dateInput = ref<HTMLInputElement | null>(null)
const dateValue = computed(
  () =>
    `${schedule.date.getFullYear()}-${String(schedule.date.getMonth() + 1).padStart(2, '0')}-${String(schedule.date.getDate()).padStart(2, '0')}`,
)
async function openPicker() {
  pickerOpen.value = !pickerOpen.value
  if (pickerOpen.value) {
    await nextTick()
    dateInput.value?.focus()
  }
}
function selectDate(event: Event) {
  const date = parseLocalDate((event.target as HTMLInputElement).value)
  if (date) schedule.date = date
}
const heading = computed(() => {
  if (schedule.view === 'month') return i18n.date(schedule.date, { month: 'long', year: 'numeric' })
  if (schedule.view === 'day') return i18n.date(schedule.date)
  const start = new Date(schedule.date)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return `${i18n.date(start, { month: 'short', day: 'numeric' })} – ${i18n.date(end, { month: 'short', day: 'numeric', year: 'numeric' })}`
})
</script>
<template>
  <section class="overview panel">
    <div class="overview-top">
      <div>
        <h2>
          <button
            class="date-heading"
            :aria-label="`${i18n.t('jumpDate')}: ${heading}`"
            :aria-expanded="pickerOpen"
            @click="openPicker"
          >
            {{ heading }} <AppIcon name="day" :size="18" />
          </button>
        </h2>
        <label v-if="pickerOpen" class="date-picker"
          >{{ i18n.t('jumpDate') }}
          <input
            ref="dateInput"
            type="date"
            :value="dateValue"
            @change="selectDate"
            @keydown.esc="pickerOpen = false"
        /></label>
        <p class="today-label">
          <span class="status-dot" />{{ i18n.t('today') }}: {{ i18n.date(new Date()) }}
        </p>
      </div>
      <div class="date-controls">
        <button
          class="icon-button"
          :aria-label="`${i18n.t('previous')} · ${i18n.t(schedule.view)}`"
          @click="schedule.move(-1)"
        >
          <AppIcon name="left" /></button
        ><button class="today-button" @click="schedule.date = new Date()">
          {{ i18n.t(schedule.view === 'week' ? 'thisWeek' : 'today') }}</button
        ><button
          class="icon-button"
          :aria-label="`${i18n.t('next')} · ${i18n.t(schedule.view)}`"
          @click="schedule.move(1)"
        >
          <AppIcon name="right" />
        </button>
      </div>
    </div>
    <div class="sync-row">
      <span class="programme-name"
        ><AppIcon name="school" :size="18" />{{
          calendar.selectedCalendars.length > 1
            ? calendar.selectedCalendars.length + ' · ' + i18n.t('programmes')
            : programmeLabel(calendar.selectedCalendar, i18n.language)
        }}</span
      ><span
        v-if="
          calendar.lastSynced &&
          !calendar.usingSaved &&
          !calendar.failedCalendars.length &&
          !calendar.loading
        "
        class="sync-badge"
        ><AppIcon name="check" :size="14" />{{ i18n.t('synced') }}</span
      ><button
        class="icon-button"
        :aria-label="i18n.t('refresh')"
        :disabled="calendar.loading"
        @click="calendar.refreshCalendars()"
      >
        <AppIcon name="refresh" :size="17" />
      </button>
    </div>
    <div v-if="calendar.hasGroupFilter" class="filter-banner">
      <span
        ><AppIcon name="filter" :size="16" /><strong
          >{{ i18n.t('filter')
          }}<template v-if="calendar.selectedCalendars.length === 1"
            >: {{ i18n.t('group') }} {{ calendar.selectedGroup }}</template
          ></strong
        ><small>{{ i18n.t(calendar.hideOtherGroups ? 'hiddenHelp' : 'dimmedHelp') }}</small></span
      ><button class="text-button" @click="calendar.clearGroups()">
        <AppIcon name="close" :size="14" />{{ i18n.t('reset') }}
      </button>
    </div>
  </section>
</template>
