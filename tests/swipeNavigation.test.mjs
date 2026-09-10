import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createJiti } from 'jiti'
const { useSwipeNavigation } = await createJiti(import.meta.url).import(
  '../src/composables/useSwipeNavigation.ts',
)
globalThis.window = { innerWidth: 390 }
const touch = (x, y = 100) => ({ clientX: x, clientY: y })
function gesture(handler, target, from = touch(300), to = touch(100)) {
  handler.touchStart({
    touches: [from],
    target: { closest: (selector) => (selector.split(', ').includes(target) ? {} : null) },
  })
  handler.touchMove({ touches: [to] })
  handler.touchEnd({ changedTouches: [to] })
}
test('calendar swipes navigate, but ordinary buttons and vertical/edge gestures do not', () => {
  const moves = []
  const handler = useSwipeNavigation((direction) => moves.push(direction))
  gesture(handler, 'article')
  gesture(handler, 'button')
  gesture(handler, 'article', touch(300), touch(100, 180))
  gesture(handler, 'article', touch(10), touch(180))
  assert.deepEqual(moves, [1])
})
test('opt-in toolbar buttons support swipe, inputs remain safe and click is suppressed once', () => {
  const moves = []
  const handler = useSwipeNavigation((direction) => moves.push(direction), { allowButtons: true })
  gesture(handler, 'input')
  gesture(handler, 'button')
  let blocked = 0
  const click = { preventDefault: () => blocked++, stopPropagation() {} }
  handler.click(click)
  handler.click(click)
  assert.deepEqual(moves, [1])
  assert.equal(blocked, 1)
})

test('a completed swipe does not swallow an unrelated later click', () => {
  const originalNow = Date.now
  let now = 1000
  Date.now = () => now
  try {
    const handler = useSwipeNavigation(() => {})
    gesture(handler, 'article')
    now += 1000
    let blocked = false
    handler.click({
      preventDefault: () => {
        blocked = true
      },
      stopPropagation() {},
    })
    assert.equal(blocked, false)
  } finally {
    Date.now = originalNow
  }
})
