<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '@/composables/useNow'
import { useCalendarStore } from '@/stores/calendar'
import { useLanguageStore } from '@/stores/language'
import { useScheduleStore } from '@/stores/schedule'
import ProgrammeBadge from './ProgrammeBadge.vue'
import AppIcon from './AppIcon.vue'
const calendar = useCalendarStore()
const i18n = useLanguageStore()
const schedule = useScheduleStore()
const now = useNow()
const next = computed(
  () =>
    calendar.visibleEvents
      .filter((event) => event.start > now.value && !calendar.dimmed(event))
      .sort((a, b) => a.start.getTime() - b.start.getTime())[0],
)
const minutes = computed(() =>
  next.value ? Math.ceil((next.value.start.getTime() - now.value.getTime()) / 60000) : 0,
)
</script>
<template>
  <section class="next-class panel">
    <div class="next-class-heading">
      <span><AppIcon name="clock" :size="18" />{{ i18n.t('nextClass') }}</span
      ><small v-if="calendar.usingSaved">{{ i18n.t('savedSchedule') }}</small>
    </div>
    <template v-if="next">
      <h2>{{ next.title }}</h2>
      <ProgrammeBadge v-if="next.programme" :name="next.programme" />
      <p v-if="calendar.overlaps.has(next.id)" class="overlap-note">{{ i18n.t('overlap') }}</p>
      <div class="next-class-details">
        <span v-if="minutes < 60"
          >{{ i18n.t('startsIn') }} {{ minutes }} {{ i18n.t('minutes') }}</span
        ><span v-else
          >{{ i18n.date(next.start, { weekday: 'short', day: 'numeric', month: 'short' }) }} ·
          {{ i18n.time(next.start) }}</span
        ><span v-if="next.location"><AppIcon name="pin" :size="16" />{{ next.location }}</span>
      </div>
      <button class="text-button" @click="schedule.openDay(next.start)">
        {{ i18n.t('openDay') }}<AppIcon name="right" :size="16" />
      </button>
    </template>
    <p v-else class="muted">{{ i18n.t('noNextClass') }}</p>
  </section>
</template>
