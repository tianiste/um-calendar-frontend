<script setup lang="ts">
import { useCalendarStore } from '@/stores/calendar'
import { useLanguageStore } from '@/stores/language'
import ProgrammeBadge from './ProgrammeBadge.vue'
const calendar = useCalendarStore()
const i18n = useLanguageStore()
</script>
<template>
  <div class="programme-status-list" aria-live="polite">
    <div
      v-for="programme in calendar.programmes"
      :key="programme.name"
      class="programme-status"
      :class="{ stale: programme.usingSaved, failed: programme.error }"
    >
      <ProgrammeBadge :name="programme.name" />
      <span v-if="programme.loading">{{ i18n.t('refreshing') }}</span>
      <strong v-else-if="programme.error">{{ i18n.t('loadError') }}</strong>
      <strong v-else-if="programme.usingSaved">{{ i18n.t('savedSchedule') }}</strong>
      <span v-else class="sync-badge">{{ i18n.t('synced') }}</span>
      <small v-if="programme.lastSynced"
        >{{ i18n.t('lastUpdated') }}:
        {{ i18n.date(programme.lastSynced, { dateStyle: 'medium', timeStyle: 'short' }) }}</small
      >
      <small v-if="programme.usingSaved">{{ i18n.t('savedHelp') }}</small>
      <small v-if="programme.cacheUnavailable">{{ i18n.t('saveFailed') }}</small>
      <button
        v-if="!programme.loading && (programme.error || programme.usingSaved)"
        class="text-button"
        @click="calendar.loadCalendar(programme.name)"
      >
        {{ i18n.t('retry') }}
      </button>
    </div>
  </div>
</template>
