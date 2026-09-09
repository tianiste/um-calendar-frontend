<script setup lang="ts">
import CalendarSelector from '@/components/CalendarSelector.vue'
import MonthView from '@/components/MonthView.vue'
import WeekView from '@/components/WeekView.vue'
import DayView from '@/components/DayView.vue'
import GroupFilter from '@/components/GroupFilter.vue'
import AppIcon from '@/components/AppIcon.vue'
import { useCalendarStore } from '@/stores/calendar'
import { useScheduleStore } from '@/stores/schedule'
import { useLanguageStore } from '@/stores/language'
import { eventTypes } from '@/services/eventDisplay'
import { computed, onMounted, onUnmounted } from 'vue'
import { useNow } from '@/composables/useNow'
import { useSwipeNavigation } from '@/composables/useSwipeNavigation'
import NextClassCard from '@/components/NextClassCard.vue'
import ProgrammeStatus from '@/components/ProgrammeStatus.vue'
import ScheduleChanges from '@/components/ScheduleChanges.vue'
import { sameDay } from '@/services/eventDisplay'
const calendar = useCalendarStore()
const schedule = useScheduleStore()
const i18n = useLanguageStore()
const now = useNow()
const swipe = useSwipeNavigation((direction) => schedule.move(direction))
const awayFromToday = computed(() => {
  if (schedule.view === 'month')
    return (
      schedule.date.getMonth() !== now.value.getMonth() ||
      schedule.date.getFullYear() !== now.value.getFullYear()
    )
  if (schedule.view === 'day') return !sameDay(schedule.date, now.value)
  const monday = new Date(schedule.date)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const end = new Date(monday)
  end.setDate(end.getDate() + 7)
  return now.value < monday || now.value >= end
})
function reconnect() {
  if (calendar.selectedCalendar && !calendar.loading) void calendar.refreshCalendars()
}
onMounted(() => window.addEventListener('online', reconnect))
onUnmounted(() => window.removeEventListener('online', reconnect))
</script>
<template>
  <main class="main-content">
    <CalendarSelector />
    <template v-if="calendar.selectedCalendar && !schedule.selecting">
      <GroupFilter />
      <ProgrammeStatus />
      <ScheduleChanges />
      <div
        v-if="calendar.selectedCalendars.every((name) => calendar.hiddenProgrammes.includes(name))"
        class="panel daily-insights"
      >
        <p>{{ i18n.t('allHidden') }}</p>
        <button class="text-button" @click="calendar.showAllProgrammes()">
          {{ i18n.t('showAll') }}
        </button>
      </div>
      <section
        v-if="calendar.loading && !calendar.lastSynced"
        class="panel state-panel"
        role="status"
        aria-live="polite"
      >
        <div class="spinner" />
        <h2>{{ i18n.t('loading') }}</h2>
        <div v-for="n in 3" :key="n" class="skeleton" />
      </section>
      <section v-else-if="calendar.error" class="panel state-panel error-state" role="alert">
        <AppIcon name="warning" :size="36" />
        <h2>{{ i18n.t('loadError') }}</h2>
        <p>{{ i18n.t('errorHelp') }}</p>
        <button class="primary-button" @click="calendar.refreshCalendars()">
          {{ i18n.t('retry') }}
        </button>
      </section>
      <template v-else>
        <p v-if="calendar.failedCalendars.length" class="offline-status" role="status">
          {{ i18n.t('incompleteTimetable') }}
        </p>
        <NextClassCard />
        <p class="swipe-hint">{{ i18n.t('swipeHint') }}</p>
        <div
          class="swipe-schedule"
          @touchstart.passive="swipe.touchStart"
          @touchmove.passive="swipe.touchMove"
          @touchend.passive="swipe.touchEnd"
          @touchcancel.passive="swipe.cancel"
          @click.capture="swipe.click"
        >
          <MonthView v-if="schedule.view === 'month'" />
          <WeekView v-else-if="schedule.view === 'week'" />
          <DayView v-else />
        </div>
        <button v-if="awayFromToday" class="floating-today" @click="schedule.date = new Date()">
          <AppIcon name="day" :size="18" />{{ i18n.t('today') }}
        </button>
        <footer class="legend panel">
          <h2>{{ i18n.t('legend') }}</h2>
          <div>
            <span v-for="type in eventTypes" :key="type" :class="type"
              ><i class="event-dot" />{{ i18n.t(type) }}</span
            >
          </div>
        </footer>
      </template>
    </template>
  </main>
</template>
