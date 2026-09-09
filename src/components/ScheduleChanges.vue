<script setup lang="ts">
import { useCalendarStore } from '@/stores/calendar'
import { useLanguageStore } from '@/stores/language'
import ProgrammeBadge from './ProgrammeBadge.vue'
const calendar = useCalendarStore()
const i18n = useLanguageStore()
</script>
<template>
  <template v-for="programme in calendar.programmes" :key="programme.name">
    <details
      v-if="programme.changes.length && !calendar.hiddenProgrammes.includes(programme.name)"
      class="panel schedule-changes"
    >
      <summary>
        {{ i18n.t('changes') }} ({{ programme.changes.length }})
        <ProgrammeBadge :name="programme.name" />
      </summary>
      <p>{{ i18n.t('changesHelp') }}</p>
      <ul>
        <li v-for="(change, index) in programme.changes" :key="index">
          <strong>{{ i18n.t(change.kind) }} · {{ (change.after || change.before)!.title }}</strong>
          <p v-if="change.before">
            {{ i18n.t('before') }}: {{ i18n.date(change.before.start) }} ·
            {{ i18n.time(change.before.start) }}–{{ i18n.time(change.before.end) }} ·
            {{ change.before.location }}
          </p>
          <p v-if="change.after">
            {{ i18n.t('after') }}: {{ i18n.date(change.after.start) }} ·
            {{ i18n.time(change.after.start) }}–{{ i18n.time(change.after.end) }} ·
            {{ change.after.location }}
          </p>
        </li>
      </ul>
      <button class="text-button" @click="calendar.dismissChanges(programme.name)">
        {{ i18n.t('dismiss') }}
      </button>
    </details>
  </template>
</template>
