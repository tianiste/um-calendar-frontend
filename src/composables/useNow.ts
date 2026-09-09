import { ref, onMounted, onUnmounted } from 'vue'

export function useNow() {
  const now = ref(new Date())
  let timer: ReturnType<typeof setInterval>
  const update = () => {
    now.value = new Date()
  }
  onMounted(() => {
    timer = setInterval(update, 15000)
    document.addEventListener('visibilitychange', update)
  })
  onUnmounted(() => {
    clearInterval(timer)
    document.removeEventListener('visibilitychange', update)
  })
  return now
}
