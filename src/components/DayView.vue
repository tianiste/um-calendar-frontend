<script setup lang="ts">
import { computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { useScheduleStore } from '@/stores/schedule'
import { useLanguageStore } from '@/stores/language'
import { eventsForDay, weekNumber } from '@/services/eventDisplay'
import CurrentClassBanner from './CurrentClassBanner.vue'
import ScheduleNavigation from './ScheduleNavigation.vue'
import EventCard from './EventCard.vue'
import AppIcon from './AppIcon.vue'
import DailySummary from './DailySummary.vue'
const calendar = useCalendarStore()
const schedule = useScheduleStore()
const i18n = useLanguageStore()
const events = computed(() => eventsForDay(calendar.visibleEvents, schedule.date))
</script>
<template>
  <div class="day-breadcrumb">
    <button class="text-button" @click="schedule.switchView(schedule.previousView)">
      <AppIcon name="back" :size="16" />{{
        i18n.t(schedule.previousView === 'week' ? 'backWeek' : 'backMonth')
      }}</button
    ><span class="sync-badge">{{ i18n.t('weekNumber') }} {{ weekNumber(schedule.date) }}</span>
  </div>
  <ScheduleNavigation />
  <DailySummary :date="schedule.date" />
  <CurrentClassBanner :events="events" />
  <div class="day-agenda">
    <EventCard
      v-for="event in events"
      :key="event.id + event.start.toISOString()"
      :event="event"
      detail
    />
  </div>
  <section v-if="!events.length" class="panel state-panel">
    <AppIcon name="day" :size="40" />
    <h2>{{ i18n.t('empty') }}</h2>
    <p>{{ i18n.t('emptyHelp') }}</p>
    <button class="primary-button" @click="schedule.date = new Date()">
      {{ i18n.t('today') }}
    </button>
  </section>
</template>
