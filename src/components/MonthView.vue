<script setup lang="ts">
import { computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { useScheduleStore } from '@/stores/schedule'
import { useLanguageStore } from '@/stores/language'
import { eventsForDay, sameDay, eventType } from '@/services/eventDisplay'
import ScheduleNavigation from './ScheduleNavigation.vue'
import EventCard from './EventCard.vue'
import AppIcon from './AppIcon.vue'
const calendar = useCalendarStore()
const schedule = useScheduleStore()
const i18n = useLanguageStore()
const days = computed(() => {
  const year = schedule.date.getFullYear(),
    month = schedule.date.getMonth()
  const first = new Date(year, month, 1)
  const count = Math.ceil((first.getDay() + new Date(year, month + 1, 0).getDate()) / 7) * 7
  return Array.from({ length: count }, (_, i) => new Date(year, month, i - first.getDay() + 1))
})
const selectedEvents = computed(() => eventsForDay(calendar.visibleEvents, schedule.date))
</script>
<template>
  <ScheduleNavigation />
  <section class="month-calendar panel" :aria-label="i18n.t('month')">
    <div class="month-grid weekday-labels">
      <span v-for="day in 7" :key="day">{{
        i18n.date(new Date(2025, 0, day + 4), { weekday: 'short' })
      }}</span>
    </div>
    <div class="month-grid">
      <button
        v-for="day in days"
        :key="day.toISOString()"
        class="month-day"
        :class="{
          outside: day.getMonth() !== schedule.date.getMonth(),
          selected: sameDay(day, schedule.date),
          'is-today': sameDay(day, new Date()),
        }"
        :aria-pressed="sameDay(day, schedule.date)"
        :aria-label="
          i18n.date(day) +
          ', ' +
          eventsForDay(calendar.visibleEvents, day).length +
          ' ' +
          i18n.t('events')
        "
        @click="schedule.date = day"
      >
        <span class="day-number">{{ day.getDate() }}</span
        ><span class="event-dots"
          ><i
            v-for="event in eventsForDay(calendar.visibleEvents, day).slice(0, 8)"
            :key="event.id + event.start.toISOString()"
            class="event-dot"
            :class="[eventType(event.title), { dimmed: calendar.dimmed(event) }]"
        /></span>
        <span
          v-if="
            eventsForDay(calendar.visibleEvents, day).some((event) =>
              calendar.overlaps.has(event.id),
            )
          "
          class="month-overlap"
          :aria-label="i18n.t('overlap')"
          >!</span
        >
      </button>
    </div>
  </section>
  <section class="month-preview panel">
    <div class="preview-heading">
      <h2>{{ i18n.date(schedule.date) }}</h2>
      <button class="text-button" @click="schedule.openDay(schedule.date)">
        {{ i18n.t('openDay') }}<AppIcon name="right" :size="16" />
      </button>
    </div>
    <p class="muted">{{ selectedEvents.length }} {{ i18n.t('events') }}</p>
    <div class="preview-events">
      <EventCard
        v-for="event in selectedEvents"
        :key="event.id + event.start.toISOString()"
        :event="event"
        compact
      />
      <p v-if="!selectedEvents.length" class="empty-day">{{ i18n.t('empty') }}</p>
    </div>
  </section>
</template>
