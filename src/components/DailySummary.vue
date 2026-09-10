<script setup lang="ts">
import { computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { useLanguageStore } from '@/stores/language'
import { dailySummary } from '@/services/scheduleInsights'
import { useMobile } from '@/composables/useMobile'
const mobile = useMobile()
const props = defineProps<{ date: Date }>()
const calendar = useCalendarStore()
const i18n = useLanguageStore()
const summary = computed(() =>
  dailySummary(
    calendar.visibleEvents.filter((event) => !calendar.dimmed(event)),
    props.date,
  ),
)
</script>
<template>
  <details class="panel daily-insights" :aria-label="i18n.t('dailySummary')" :open="!mobile">
    <summary v-show="mobile">
      {{ summary.count }} {{ i18n.t('events')
      }}<template v-if="summary.finish">
        · {{ i18n.t('finishes') }} {{ i18n.time(summary.finish) }}</template
      >
    </summary>
    <h3>{{ i18n.t('dailySummary') }}</h3>
    <p>
      {{ summary.count }} {{ i18n.t('events') }} · {{ summary.programmes }}
      {{ i18n.t('programmes') }}
    </p>
    <p>
      {{ i18n.t('classTime') }}: {{ summary.minutes }} {{ i18n.t('minutes')
      }}<template v-if="summary.finish">
        · {{ i18n.t('finishes') }} {{ i18n.time(summary.finish) }}</template
      >
    </p>
    <details v-if="summary.breaks.length">
      <summary>{{ i18n.t('breaks') }} ({{ summary.breaks.length }})</summary>
      <ul>
        <li v-for="gap in summary.breaks" :key="+gap.start">
          {{ i18n.time(gap.start) }}–{{ i18n.time(gap.end) }} · {{ gap.minutes }}
          {{ i18n.t('minutes') }}
        </li>
      </ul>
    </details>
    <p v-else-if="summary.count">{{ i18n.t('noBreaks') }}</p>
  </details>
</template>
