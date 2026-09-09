import { ref } from 'vue'
import { defineStore } from 'pinia'

export type CalendarView = 'day' | 'week' | 'month'
export const useScheduleStore = defineStore('schedule', () => {
  const view = ref<CalendarView>('week')
  const previousView = ref<'week' | 'month'>('week')
  const date = ref(new Date())
  const selecting = ref(false)
  function switchView(value: CalendarView) {
    if (view.value !== 'day') previousView.value = view.value
    view.value = value
    selecting.value = false
  }
  function openDay(value: Date) {
    date.value = new Date(value)
    switchView('day')
  }
  function move(amount: number) {
    const next = new Date(date.value)
    if (view.value === 'month') {
      const day = next.getDate()
      next.setDate(1)
      next.setMonth(next.getMonth() + amount)
      next.setDate(Math.min(day, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()))
    } else next.setDate(next.getDate() + amount * (view.value === 'week' ? 7 : 1))
    date.value = next
  }
  return { view, previousView, date, selecting, switchView, openDay, move }
})
