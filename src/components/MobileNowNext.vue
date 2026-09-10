<script setup lang="ts">
import { computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { useLanguageStore } from '@/stores/language'
import { useScheduleStore } from '@/stores/schedule'
import { useNow } from '@/composables/useNow'
import ProgrammeBadge from './ProgrammeBadge.vue'
const calendar = useCalendarStore()
const i18n = useLanguageStore()
const schedule = useScheduleStore()
const now = useNow()
const eligible = computed(() => calendar.visibleEvents.filter((event) => !calendar.dimmed(event)))
const current = computed(() =>
  eligible.value.filter((event) => event.start <= now.value && event.end > now.value),
)
const next = computed(() => eligible.value.find((event) => event.start > now.value))
const items = computed(() =>
  current.value.length ? current.value : next.value ? [next.value] : [],
)
</script>
<template>
  <section class="panel mobile-now-next">
    <details v-if="items.length">
      <summary>
        <small
          >{{ i18n.t(current.length ? 'currentClass' : 'nextClass')
          }}<template v-if="current.length > 1"> · {{ current.length }}</template></small
        >
        <strong>{{ items[0]!.title }}</strong>
        <ProgrammeBadge v-if="items[0]!.programme" :name="items[0]!.programme!" />
        <small v-if="calendar.usingSaved">{{ i18n.t('savedSchedule') }}</small>
        <span
          >{{ i18n.time(items[0]!.start) }}–{{ i18n.time(items[0]!.end) }} ·
          {{ items[0]!.location }}</span
        >
        <span
          v-if="current.length > 1 || calendar.overlaps.has(items[0]!.id)"
          class="overlap-note"
          >{{ i18n.t('overlap') }}</span
        >
      </summary>
      <div v-for="event in items" :key="event.id" class="mobile-class-detail">
        <strong>{{ event.title }}</strong>
        <ProgrammeBadge v-if="event.programme" :name="event.programme" />
        <p>
          {{ i18n.date(event.start) }} · {{ i18n.time(event.start) }}–{{ i18n.time(event.end) }} ·
          {{ event.location }}
        </p>
        <p>
          {{ i18n.t(current.length ? 'remaining' : 'startsIn') }}
          {{ Math.ceil(((current.length ? +event.end : +event.start) - +now) / 60000) }}
          {{ i18n.t('minutes') }}
        </p>
        <button class="text-button" @click="schedule.openDay(event.start)">
          {{ i18n.t('openDay') }}
        </button>
      </div>
      <div v-if="current.length && next" class="mobile-class-detail">
        <small>{{ i18n.t('nextClass') }}</small>
        <strong>{{ next.title }}</strong>
        <ProgrammeBadge v-if="next.programme" :name="next.programme" />
        <p>
          {{ i18n.date(next.start) }} · {{ i18n.time(next.start) }}–{{ i18n.time(next.end) }} ·
          {{ next.location }}
        </p>
        <p v-if="calendar.overlaps.has(next.id)" class="overlap-note">{{ i18n.t('overlap') }}</p>
        <button class="text-button" @click="schedule.openDay(next.start)">
          {{ i18n.t('openDay') }}
        </button>
      </div>
    </details>
    <p v-else>{{ i18n.t('noNextClass') }}</p>
  </section>
</template>
