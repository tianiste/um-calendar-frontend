import { onMounted, onUnmounted, ref } from 'vue'

export function useMobile() {
  const query = window.matchMedia('(max-width: 699px)')
  const mobile = ref(query.matches)
  const update = () => {
    mobile.value = query.matches
  }
  onMounted(() => query.addEventListener('change', update))
  onUnmounted(() => query.removeEventListener('change', update))
  return mobile
}
