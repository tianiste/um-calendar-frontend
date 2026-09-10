<script setup lang="ts">
import CalendarSelector from '@/components/CalendarSelector.vue'
import MonthView from '@/components/MonthView.vue'
import WeekView from '@/components/WeekView.vue'
import DayView from '@/components/DayView.vue'
import GroupFilter from '@/components/GroupFilter.vue'
import AppIcon from '@/components/AppIcon.vue'
import { useCalendarStore } from '@/stores/calendar'
import { useScheduleStore } from '@/stores/schedule'
import { useLanguageStore } from '@/stores/language'
import { eventTypes } from '@/services/eventDisplay'
import { computed, onMounted, onUnmounted, ref, nextTick, watch } from 'vue'
import { useMobile } from '@/composables/useMobile'
import MobileNowNext from '@/components/MobileNowNext.vue'
import { useNow } from '@/composables/useNow'
import { useSwipeNavigation } from '@/composables/useSwipeNavigation'
import NextClassCard from '@/components/NextClassCard.vue'
import ProgrammeStatus from '@/components/ProgrammeStatus.vue'
import ScheduleChanges from '@/components/ScheduleChanges.vue'
import { sameDay } from '@/services/eventDisplay'
const calendar = useCalendarStore()
const schedule = useScheduleStore()
const i18n = useLanguageStore()
const now = useNow()
const mobile = useMobile()
const motion = ref<HTMLElement | null>(null)
watch(
  () => schedule.transitionId,
  async () => {
    await nextTick()
    if (!mobile.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    motion.value?.getAnimations().forEach((animation) => animation.cancel())
    motion.value?.animate(
      [
        { opacity: 0.55, transform: `translateX(${schedule.direction * 18}px)` },
        { opacity: 1, transform: 'translateX(0)' },
      ],
      { duration: 180, easing: 'ease-out' },
    )
  },
)
const filtersOpen = ref(false)
const filterDialog = ref<HTMLDialogElement | null>(null)
let returnFocus: HTMLElement | null = null
const activeFilters = computed(
  () =>
    calendar.selectedCalendars.filter((name) => calendar.groupFor(name)).length +
    calendar.selectedCalendars.filter((name) => calendar.hiddenProgrammes.includes(name)).length +
    Number(calendar.hideOtherGroups),
)
const syncProblem = computed(() => calendar.usingSaved || calendar.failedCalendars.length > 0)
async function openFilters() {
  returnFocus = document.activeElement as HTMLElement
  filtersOpen.value = true
  filterDialog.value?.showModal()
  document.body.style.overflow = 'hidden'
  await nextTick()
  filterDialog.value?.querySelector<HTMLButtonElement>('.sheet-close')?.focus()
}
async function closeFilters() {
  filtersOpen.value = false
  schedule.selecting = false
  filterDialog.value?.close()
  document.body.style.overflow = ''
  await nextTick()
  returnFocus?.focus()
}
watch(mobile, (value) => {
  if (!value && filtersOpen.value) closeFilters()
})
onUnmounted(() => {
  document.body.style.overflow = ''
})
const swipe = useSwipeNavigation((direction) => schedule.move(direction))
const awayFromToday = computed(() => {
  if (schedule.view === 'month')
    return (
      schedule.date.getMonth() !== now.value.getMonth() ||
      schedule.date.getFullYear() !== now.value.getFullYear()
    )
  if (schedule.view === 'day') return !sameDay(schedule.date, now.value)
  const monday = new Date(schedule.date)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const end = new Date(monday)
  end.setDate(end.getDate() + 7)
  return now.value < monday || now.value >= end
})
function reconnect() {
  if (calendar.selectedCalendar && !calendar.loading) void calendar.refreshCalendars()
}
onMounted(() => window.addEventListener('online', reconnect))
onUnmounted(() => window.removeEventListener('online', reconnect))
</script>
<template>
  <main class="main-content">
    <button
      v-if="mobile && calendar.selectedCalendar"
      class="mobile-programme-summary"
      :aria-expanded="filtersOpen"
      aria-haspopup="dialog"
      @click="openFilters"
    >
      <AppIcon name="school" :size="18" /><span
        >{{ calendar.selectedCalendars.length }} {{ i18n.t('programmes')
        }}<small v-if="calendar.hasGroupFilter"> · {{ i18n.t('filtersActive') }}</small></span
      ><AppIcon name="down" :size="16" />
    </button>
    <Teleport defer to="#mobile-filter-content" :disabled="!filtersOpen">
      <div
        class="desktop-settings"
        :class="{ 'mobile-settings-hidden': mobile && !!calendar.selectedCalendar && !filtersOpen }"
      >
        <CalendarSelector />
        <GroupFilter v-if="calendar.selectedCalendar" />
        <button
          v-if="filtersOpen && calendar.hasGroupFilter"
          class="text-button"
          @click="calendar.clearGroups()"
        >
          {{ i18n.t('reset') }} · {{ i18n.t('allGroups') }}
        </button>
        <footer v-if="filtersOpen" class="legend panel">
          <h2>{{ i18n.t('legend') }}</h2>
          <div>
            <span v-for="type in eventTypes" :key="type" :class="type"
              ><i class="event-dot" />{{ i18n.t(type) }}</span
            >
          </div>
        </footer>
      </div>
    </Teleport>
    <dialog
      ref="filterDialog"
      class="mobile-filter-sheet"
      :aria-label="i18n.t('timetableSettings')"
      @cancel.prevent="closeFilters"
      @click="$event.target === filterDialog && closeFilters()"
    >
      <div class="sheet-inner">
        <header class="sheet-header">
          <h2>{{ i18n.t('timetableSettings') }}</h2>
          <button class="text-button sheet-close" @click="closeFilters">
            {{ i18n.t('closeFilters') }}
          </button>
        </header>
        <div id="mobile-filter-content" />
      </div>
    </dialog>
    <template v-if="calendar.selectedCalendar && !schedule.selecting">
      <details class="compact-sync" :open="!mobile || syncProblem">
        <summary v-show="mobile">
          <span
            >{{
              i18n.t(
                calendar.loading
                  ? 'refreshing'
                  : calendar.failedCalendars.length
                    ? 'incompleteTimetable'
                    : calendar.usingSaved
                      ? 'savedSchedule'
                      : 'syncDetails',
              )
            }}<template v-if="calendar.lastSynced && !calendar.loading && !syncProblem">
              · {{ i18n.time(calendar.lastSynced) }}</template
            ></span
          >
          <AppIcon :name="syncProblem ? 'warning' : 'down'" :size="16" />
          <button
            class="icon-button"
            :aria-label="i18n.t('refresh')"
            :disabled="calendar.loading"
            @click.stop.prevent="calendar.refreshCalendars()"
          >
            <AppIcon name="refresh" :size="16" />
          </button>
        </summary>
        <ProgrammeStatus />
      </details>
      <ScheduleChanges />
      <div
        v-if="calendar.selectedCalendars.every((name) => calendar.hiddenProgrammes.includes(name))"
        class="panel daily-insights"
      >
        <p>{{ i18n.t('allHidden') }}</p>
        <button class="text-button" @click="calendar.showAllProgrammes()">
          {{ i18n.t('showAll') }}
        </button>
      </div>
      <section
        v-if="calendar.loading && !calendar.lastSynced"
        class="panel state-panel"
        role="status"
        aria-live="polite"
      >
        <div class="spinner" />
        <h2>{{ i18n.t('loading') }}</h2>
        <div v-for="n in 3" :key="n" class="skeleton" />
      </section>
      <section v-else-if="calendar.error" class="panel state-panel error-state" role="alert">
        <AppIcon name="warning" :size="36" />
        <h2>{{ i18n.t('loadError') }}</h2>
        <p>{{ i18n.t('errorHelp') }}</p>
        <button class="primary-button" @click="calendar.refreshCalendars()">
          {{ i18n.t('retry') }}
        </button>
      </section>
      <template v-else>
        <p v-if="calendar.failedCalendars.length" class="offline-status" role="status">
          {{ i18n.t('incompleteTimetable') }}
        </p>
        <MobileNowNext v-if="mobile" />
        <NextClassCard v-else />
        <p class="swipe-hint">{{ i18n.t('swipeHint') }}</p>
        <div
          class="swipe-schedule"
          @touchstart.passive="swipe.touchStart"
          @touchmove.passive="swipe.touchMove"
          @touchend.passive="swipe.touchEnd"
          @touchcancel.passive="swipe.cancel"
          @click.capture="swipe.click"
        >
          <div ref="motion" class="schedule-motion">
            <MonthView v-if="schedule.view === 'month'" />
            <WeekView v-else-if="schedule.view === 'week'" />
            <DayView v-else />
          </div>
        </div>
        <button v-if="awayFromToday" class="floating-today" @click="schedule.date = new Date()">
          <AppIcon name="day" :size="18" />{{ i18n.t('today') }}
        </button>
        <footer v-if="!mobile" class="legend panel">
          <h2>{{ i18n.t('legend') }}</h2>
          <div>
            <span v-for="type in eventTypes" :key="type" :class="type"
              ><i class="event-dot" />{{ i18n.t(type) }}</span
            >
          </div>
        </footer>
      </template>
    </template>
    <button
      v-if="mobile && calendar.selectedCalendar"
      v-show="!filtersOpen"
      class="floating-filters"
      :aria-label="i18n.t('mobileFilters')"
      aria-haspopup="dialog"
      :aria-expanded="filtersOpen"
      @click="openFilters"
    >
      <AppIcon name="filter" :size="20" />{{ i18n.t('mobileFilters')
      }}<span v-if="activeFilters" class="filter-count">{{ activeFilters }}</span>
    </button>
  </main>
</template>
