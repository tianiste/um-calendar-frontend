<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { CalendarEvent } from '@/types/calendar'
import ProgrammeBadge from './ProgrammeBadge.vue'
import { useCalendarStore } from '@/stores/calendar'
import { useLanguageStore } from '@/stores/language'

const props = defineProps<{ events: CalendarEvent[] }>()
const calendar = useCalendarStore()
const i18n = useLanguageStore()
const now = ref(new Date())
let timer: ReturnType<typeof setInterval>
onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 30000)
})
onUnmounted(() => clearInterval(timer))
const current = computed(() =>
  props.events.filter(
    (event) => event.start <= now.value && event.end > now.value && !calendar.dimmed(event),
  ),
)
</script>
<template>
  <div
    v-for="event in current"
    :key="event.id + event.start.toISOString()"
    class="current-class"
    role="status"
  >
    <span class="status-dot" /><strong>{{ i18n.t('currentClass') }}</strong
    ><span>{{ event.title }}</span>
    <ProgrammeBadge v-if="event.programme" :name="event.programme" />
    <small
      >{{ i18n.t('remaining') }} {{ Math.ceil((event.end.getTime() - now.getTime()) / 60000) }}
      {{ i18n.t('minutes') }}</small
    >
  </div>
</template>
