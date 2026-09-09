<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarEvent } from '@/types/calendar'
import { eventType, eventGroup } from '@/services/eventDisplay'
import ProgrammeBadge from './ProgrammeBadge.vue'
import { useCalendarStore } from '@/stores/calendar'
import { useLanguageStore } from '@/stores/language'
import AppIcon from './AppIcon.vue'
const props = defineProps<{ event: CalendarEvent; compact?: boolean; detail?: boolean }>()
const calendar = useCalendarStore()
const i18n = useLanguageStore()
const type = computed(() => eventType(props.event.title))
const dimmed = computed(() => calendar.dimmed(props.event))
const group = computed(() => calendar.groupFor(props.event.programme))
const conflicts = computed(() => calendar.overlaps.get(props.event.id) || [])
const change = computed(() =>
  calendar.programmes
    .find((item) => item.name === props.event.programme)
    ?.changes.find(
      (item) =>
        item.after?.sourceId === props.event.sourceId &&
        item.after &&
        +item.after.start === +props.event.start,
    ),
)
const ownGroup = computed(
  () =>
    ['lab', 'eLab'].includes(type.value) &&
    !!group.value &&
    eventGroup(props.event.title) === group.value,
)
const duration = computed(() =>
  Math.max(0, Math.round((props.event.end.getTime() - props.event.start.getTime()) / 60000)),
)
const icons = { lecture: '📚', lab: '💻', eLecture: '🌐', eLab: '🌐', exam: '📝', other: '•' }
</script>
<template>
  <article class="event-card" :class="[type, { dimmed, compact }]">
    <div class="event-meta">
      <span class="event-time"
        ><AppIcon name="clock" :size="15" />{{ i18n.time(event.start) }} –
        {{ i18n.time(event.end) }}</span
      ><span class="type-badge">{{ icons[type] }} {{ i18n.t(type) }}</span>
    </div>
    <h3>{{ event.title }}</h3>
    <span v-if="change" class="change-badge">{{ i18n.t(change.kind) }}</span>
    <template v-if="change?.before && change.after">
      <span v-if="change.before.location !== change.after.location" class="change-badge">{{
        i18n.t('roomChanged')
      }}</span>
      <span
        v-if="
          +change.before.start !== +change.after.start || +change.before.end !== +change.after.end
        "
        class="change-badge"
        >{{ i18n.t('timeChanged') }}</span
      >
    </template>
    <ProgrammeBadge v-if="event.programme" :name="event.programme" />
    <details v-if="conflicts.length" class="overlap-details">
      <summary>
        <AppIcon name="warning" :size="16" />{{ i18n.t('overlap') }} ({{ conflicts.length }})
      </summary>
      <p>{{ i18n.t('overlapsWith') }}:</p>
      <ul>
        <li v-for="conflict in conflicts" :key="conflict.id">
          <strong>{{ conflict.title }}</strong> · {{ i18n.time(conflict.start) }}–{{
            i18n.time(conflict.end)
          }}<ProgrammeBadge v-if="conflict.programme" :name="conflict.programme" />
        </li>
      </ul>
    </details>
    <div v-if="ownGroup || dimmed || detail" class="event-tags">
      <span v-if="ownGroup" class="own-group">✓ {{ i18n.t('yourGroup') }} · {{ group }}</span
      ><span v-if="dimmed">{{ i18n.t('dimmed') }}</span
      ><span v-if="detail">{{ i18n.t('duration') }}: {{ duration }} {{ i18n.t('minutes') }}</span>
    </div>
    <div v-if="event.location" class="event-location">
      <AppIcon name="pin" :size="16" /><span>{{ event.location }}</span>
    </div>
    <p v-if="detail && event.description" class="event-description">{{ event.description }}</p>
  </article>
</template>
