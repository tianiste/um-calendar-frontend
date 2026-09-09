<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { useScheduleStore } from '@/stores/schedule'
import { useLanguageStore } from '@/stores/language'
import { eventsForDay, sameDay } from '@/services/eventDisplay'
import ScheduleNavigation from './ScheduleNavigation.vue'
import EventCard from './EventCard.vue'
import AppIcon from './AppIcon.vue'
import CurrentClassBanner from './CurrentClassBanner.vue'
const calendar = useCalendarStore()
const schedule = useScheduleStore()
const i18n = useLanguageStore()
const collapsed = ref<Set<number>>(new Set())
const days = computed(() => {
  const start = new Date(schedule.date)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  return Array.from(
    { length: 7 },
    (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  )
})
watch(
  days,
  (weekDays) => {
    const today = new Date()
    collapsed.value = new Set(
      weekDays.flatMap((day, index) => (sameDay(day, today) ? [] : [index])),
    )
  },
  { immediate: true },
)
const weekEvents = computed(() =>
  calendar.visibleEvents.filter((event) =>
    days.value.some((day) => eventsForDay([event], day).length > 0),
  ),
)
function toggle(index: number) {
  if (collapsed.value.has(index)) collapsed.value.delete(index)
  else collapsed.value.add(index)
}
</script>
<template>
  <ScheduleNavigation />
  <CurrentClassBanner :events="weekEvents" />
  <div class="week-tools">
    <span
      >{{
        days.reduce((total, day) => total + eventsForDay(calendar.visibleEvents, day).length, 0)
      }}
      {{ i18n.t('events') }}</span
    >
    <div>
      <button class="text-button" @click="collapsed = new Set([0, 1, 2, 3, 4, 5, 6])">
        {{ i18n.t('collapseAll') }}</button
      ><button class="text-button" @click="collapsed = new Set()">{{ i18n.t('expandAll') }}</button>
    </div>
  </div>
  <div class="week-stream">
    <section
      v-for="(day, index) in days"
      :key="day.toISOString()"
      class="week-day"
      :class="{ 'is-today': sameDay(day, new Date()) }"
    >
      <button
        class="day-heading"
        :aria-expanded="!collapsed.has(index)"
        :aria-controls="'week-day-' + index"
        @click="toggle(index)"
      >
        <span class="date-number">{{ day.getDate() }}</span
        ><span class="day-heading-text"
          ><strong>{{ i18n.date(day, { weekday: 'long', month: 'short', day: 'numeric' }) }}</strong
          ><small
            >{{ eventsForDay(calendar.visibleEvents, day).length }} {{ i18n.t('events')
            }}<template v-if="sameDay(day, new Date())"> · {{ i18n.t('today') }}</template></small
          ></span
        ><AppIcon :name="collapsed.has(index) ? 'down' : 'up'" />
      </button>
      <div v-show="!collapsed.has(index)" :id="'week-day-' + index" class="day-content">
        <EventCard
          v-for="event in eventsForDay(calendar.visibleEvents, day)"
          :key="event.id + event.start.toISOString()"
          :event="event"
        />
        <p v-if="!eventsForDay(calendar.visibleEvents, day).length" class="empty-day">
          {{ i18n.t('empty') }}
        </p>
        <button class="open-day text-button" @click="schedule.openDay(day)">
          {{ i18n.t('openDay') }}<AppIcon name="right" :size="16" />
        </button>
      </div>
    </section>
  </div>
</template>
