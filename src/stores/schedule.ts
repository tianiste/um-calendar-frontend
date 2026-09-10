import { ref } from 'vue'
import { defineStore } from 'pinia'

export type CalendarView = 'day' | 'week' | 'month'
export const useScheduleStore = defineStore('schedule', () => {
  const view = ref<CalendarView>('week')
  const previousView = ref<'week' | 'month'>('week')
  const date = ref(new Date())
  const selecting = ref(false)
  const direction = ref(1)
  const transitionId = ref(0)
  function switchView(value: CalendarView) {
    direction.value =
      ['day', 'week', 'month'].indexOf(value) >= ['day', 'week', 'month'].indexOf(view.value)
        ? 1
        : -1
    transitionId.value++
    if (view.value !== 'day') previousView.value = view.value
    view.value = value
    selecting.value = false
  }
  function openDay(value: Date) {
    date.value = new Date(value)
    switchView('day')
  }
  function move(amount: number) {
    direction.value = amount < 0 ? -1 : 1
    transitionId.value++
    const next = new Date(date.value)
    if (view.value === 'month') {
      const day = next.getDate()
      next.setDate(1)
      next.setMonth(next.getMonth() + amount)
      next.setDate(Math.min(day, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()))
    } else next.setDate(next.getDate() + amount * (view.value === 'week' ? 7 : 1))
    date.value = next
  }
  return { view, previousView, date, selecting, direction, transitionId, switchView, openDay, move }
})
