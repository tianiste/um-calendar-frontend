import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

export function offlinePlugin(): Plugin {
  let base = '/'
  let publicDir = ''
  const publicFiles = [
    'um-calendar.svg',
    'manifest.json',
    'icons/calendar-192.png',
    'icons/calendar-512.png',
    'icons/calendar-maskable-512.png',
    'icons/apple-touch-icon.png',
  ]
  return {
    name: 'um-calendar-offline',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      base = config.base
      publicDir = config.publicDir
    },
    generateBundle(_, bundle) {
      const hash = createHash('sha256')
      for (const file of publicFiles) hash.update(readFileSync(resolve(publicDir, file)))
      for (const entry of Object.values(bundle))
        hash.update(entry.type === 'chunk' ? entry.code : entry.source)
      const version = hash.digest('hex').slice(0, 12)
      const files = [
        ...Object.keys(bundle).filter((name) => !name.endsWith('.map')),
        ...publicFiles,
      ]
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: `
const CACHE = 'um-calendar-shell-${version}';
const FILES = ${JSON.stringify(files)};
const BASE = new URL(${JSON.stringify(base)}, self.location.origin);
const SHELL = new URL('index.html', BASE).href;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES.map(file => new URL(file, BASE).href))));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith('um-calendar-shell-') && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname)) return;
  // Calendar responses are saved by the app with their original update time.
  if (url.pathname.includes('/api/') || url.pathname.includes('/data/')) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(SHELL)) || fetch(event.request)));
  } else if (FILES.some(file => new URL(file, BASE).href === url.href)) {
    // Build assets do not vary by Origin; module requests can add Origin after precaching.
    event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(event.request, { ignoreVary: true })) || fetch(event.request)));
  }
});
`,
      })
    },
  }
}
