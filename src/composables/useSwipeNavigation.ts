import { ref } from 'vue'

export function useSwipeNavigation(move: (direction: number) => void) {
  const swiped = ref(false)
  let start: { x: number; y: number; time: number } | null = null
  function touchStart(event: TouchEvent) {
    swiped.value = false
    const touch = event.touches[0]
    const target = event.target as Element
    start =
      event.touches.length === 1 &&
      touch &&
      !target.closest('button, input, select, a, textarea, summary, details, [data-no-swipe]') &&
      touch.clientX > 24 &&
      touch.clientX < window.innerWidth - 24
        ? { x: touch.clientX, y: touch.clientY, time: Date.now() }
        : null
  }
  function touchMove(event: TouchEvent) {
    if (event.touches.length !== 1) start = null
    const touch = event.touches[0]
    if (start && touch && Math.abs(touch.clientY - start.y) > 40) start = null
  }
  function touchEnd(event: TouchEvent) {
    const touch = event.changedTouches[0]
    if (start && touch) {
      const dx = touch.clientX - start.x,
        dy = touch.clientY - start.y
      if (Math.abs(dx) >= 70 && Math.abs(dx) > Math.abs(dy) * 2 && Date.now() - start.time < 900) {
        swiped.value = true
        move(dx < 0 ? 1 : -1)
      }
    }
    start = null
  }
  function cancel() {
    start = null
  }
  function click(event: MouseEvent) {
    if (swiped.value) {
      event.preventDefault()
      event.stopPropagation()
      swiped.value = false
    }
  }
  return { touchStart, touchMove, touchEnd, cancel, click }
}
