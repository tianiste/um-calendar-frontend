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
      hash.update('network-first-navigation-v2')
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
async function savedResponse(request) {
  try {
    const cache = await caches.open(CACHE);
    const response = await cache.match(request, { ignoreVary: true });
    // Cloudflare redirects /index.html to /. Rebuild the saved response so
    // navigation requests do not receive a response carrying redirect metadata.
    if (response && response.ok) return new Response(await response.arrayBuffer(), {
      status: response.status, statusText: response.statusText, headers: response.headers,
    });
  } catch { /* Cache access must never prevent an online page load. */ }
}
async function navigation(request) {
  try {
    const response = await fetch(request);
    if (response.status < 500) return response;
    return (await savedResponse(SHELL)) || response;
  } catch {
    return (await savedResponse(SHELL)) || new Response(
      '<!doctype html><meta name="viewport" content="width=device-width"><title>UM Calendar</title><h1>Unable to connect / Povezava ni na voljo</h1><p>Please reconnect and reload. / Preverite povezavo in osvežite stran.</p>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }
}
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE);
      await cache.addAll(FILES.map(file => new URL(file, BASE).href));
    } catch { /* Offline storage is optional; the network path still works. */ }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Keep older versioned shells for tabs still running their old JS chunks.
    // Their caches are isolated and never used as this version's page fallback.
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname)) return;
  // Calendar responses are saved by the app with their original update time.
  if (url.pathname.includes('/api/') || url.pathname.includes('/data/')) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(navigation(event.request));
  } else if (FILES.some(file => new URL(file, BASE).href === url.href)) {
    // Build assets do not vary by Origin; module requests can add Origin after precaching.
    event.respondWith((async () => (await savedResponse(event.request)) || fetch(event.request))());
  }
});
`,
      })
    },
  }
}
