import { test } from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'
const { offlinePlugin } = await createJiti(import.meta.url).import('../build/offlinePlugin.ts')
function worker({ network, cached, brokenCache = false } = {}) {
  const plugin = offlinePlugin()
  plugin.configResolved({
    base: '/',
    publicDir: fileURLToPath(new URL('../public', import.meta.url)),
  })
  let source
  plugin.generateBundle.call(
    {
      emitFile: (asset) => {
        source = asset.source
      },
    },
    {},
    { 'index.html': { type: 'asset', source: 'shell' } },
  )
  const handlers = {}
  let claimed = false,
    skipped = false
  const context = {
    URL,
    Response,
    self: {
      location: { origin: 'https://example.test' },
      addEventListener: (name, handler) => {
        handlers[name] = handler
      },
      skipWaiting: async () => {
        skipped = true
      },
      clients: {
        claim: async () => {
          claimed = true
        },
      },
    },
    caches: {
      open: async () => {
        if (brokenCache) throw new Error('Storage denied')
        return { match: async () => cached?.clone(), addAll: async () => {} }
      },
    },
    fetch: async () => {
      if (network) return network.clone()
      throw new Error('Offline')
    },
  }
  vm.runInNewContext(source, context)
  return {
    async request(path = '/', mode = 'navigate') {
      let response
      handlers.fetch({
        request: { url: `https://example.test${path}`, method: 'GET', mode },
        respondWith: (promise) => {
          response = promise
        },
      })
      return response
    },
    async activate() {
      for (const name of ['install', 'activate']) {
        let pending
        handlers[name]({
          waitUntil: (promise) => {
            pending = promise
          },
        })
        await pending
      }
      return { claimed, skipped }
    },
  }
}
test('online navigation wins over old cached HTML', async () => {
  const result = await worker({
    network: new Response('new'),
    cached: new Response('old'),
  }).request()
  assert.equal(await result.text(), 'new')
})
test('blocked cache storage does not break navigation, assets or activation', async () => {
  const instance = worker({ network: new Response('online'), brokenCache: true })
  assert.equal(await (await instance.request()).text(), 'online')
  assert.equal(await (await instance.request('/um-calendar.svg', 'cors')).text(), 'online')
  assert.deepEqual(await instance.activate(), { claimed: true, skipped: true })
})
test('offline navigation reconstructs the saved response without redirect metadata', async () => {
  const cached = new Response('saved page', {
    headers: { 'Content-Type': 'text/html', Vary: 'Origin' },
  })
  const instance = worker({ cached })
  const response = await instance.request()
  assert.equal(await response.text(), 'saved page')
  assert.equal(response.redirected, false)
  assert.equal(response.url, '')
})
test('server errors fall back offline; missing cache returns a readable 503', async () => {
  assert.equal(
    await (
      await worker({
        network: new Response('error', { status: 503 }),
        cached: new Response('saved'),
      }).request()
    ).text(),
    'saved',
  )
  assert.equal((await worker({ brokenCache: true }).request()).status, 503)
})
test('API requests are never intercepted', async () => {
  assert.equal(await worker().request('/data/names', 'cors'), undefined)
  assert.equal(await worker().request('/api/data/names', 'cors'), undefined)
})
