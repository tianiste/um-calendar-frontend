import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

const THEME_STORAGE_KEY = 'um-calendar-theme'

export const useThemeStore = defineStore('theme', () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null
  const theme = ref<'light' | 'dark'>(savedTheme === 'light' ? 'light' : 'dark')

  watch(
    theme,
    (newTheme) => {
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', newTheme === 'dark' ? '#0b1326' : '#f4f6fc')
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)

      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    { immediate: true },
  )

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return {
    theme,
    toggleTheme,
  }
})
