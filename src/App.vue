<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useCalendarStore } from '@/stores/calendar'
import { useLanguageStore } from '@/stores/language'
import { useScheduleStore, type CalendarView } from '@/stores/schedule'
import AppIcon from '@/components/AppIcon.vue'
import logo from '../design/stitch/logo.svg'
import { useSwipeNavigation } from '@/composables/useSwipeNavigation'
const theme = useThemeStore()
const calendar = useCalendarStore()
const i18n = useLanguageStore()
const schedule = useScheduleStore()
const views: CalendarView[] = ['day', 'week', 'month']
const tabsSwipe = useSwipeNavigation(
  (direction) => {
    const index = Math.max(0, Math.min(views.length - 1, views.indexOf(schedule.view) + direction))
    schedule.switchView(views[index]!)
  },
  { allowButtons: true },
)
const labels = { day: 'daily', week: 'weekly', month: 'monthly' } as const
onMounted(() => calendar.loadSavedGroup())
</script>
<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="header-inner">
        <div class="brand">
          <button
            v-if="schedule.selecting && calendar.selectedCalendar"
            class="icon-button"
            :aria-label="i18n.t('back')"
            @click="schedule.selecting = false"
          >
            <AppIcon name="back" /></button
          ><img :src="logo" alt="" width="36" height="36" />
          <div>
            <h1>UM Calendar</h1>
            <p>FOV Kranj</p>
          </div>
        </div>
        <div class="header-actions">
          <div class="language-switch">
            <button
              :class="{ active: i18n.language === 'en' }"
              :aria-pressed="i18n.language === 'en'"
              aria-label="Switch to English"
              @click="i18n.language = 'en'"
            >
              EN</button
            ><button
              :class="{ active: i18n.language === 'sl' }"
              :aria-pressed="i18n.language === 'sl'"
              aria-label="Preklopi na slovenščino"
              @click="i18n.language = 'sl'"
            >
              SLO
            </button>
          </div>
          <button
            class="icon-button theme-button"
            :aria-label="i18n.t(theme.theme === 'dark' ? 'lightMode' : 'darkMode')"
            @click="theme.toggleTheme"
          >
            <AppIcon :name="theme.theme === 'dark' ? 'moon' : 'sun'" />
          </button>
        </div>
      </div>
    </header>
    <RouterView />
    <nav
      class="bottom-nav"
      :aria-label="i18n.t('navigation')"
      @touchstart.passive="tabsSwipe.touchStart"
      @touchmove.passive="tabsSwipe.touchMove"
      @touchend.passive="tabsSwipe.touchEnd"
      @touchcancel.passive="tabsSwipe.cancel"
      @click.capture="tabsSwipe.click"
    >
      <div>
        <button
          v-for="view in views"
          :key="view"
          :class="{ active: schedule.view === view && !schedule.selecting }"
          :aria-current="schedule.view === view && !schedule.selecting ? 'page' : undefined"
          @click="schedule.switchView(view)"
        >
          <AppIcon :name="view" :size="22" /><span>{{ i18n.t(labels[view]) }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>
