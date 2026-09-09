import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const publicRoot = new URL('../public/', import.meta.url)
const manifest = JSON.parse(readFileSync(new URL('manifest.json', publicRoot), 'utf8'))
test('manifest has a stable identity, standalone launch and app name', () => {
  assert.equal(manifest.id, '/')
  assert.equal(manifest.start_url, '/')
  assert.equal(manifest.scope, '/')
  assert.equal(manifest.display, 'standalone')
  assert.equal(manifest.short_name, 'UM Calendar')
})
test('install icons exist and PNG dimensions match manifest declarations', () => {
  for (const size of ['192x192', '512x512'])
    assert.ok(manifest.icons.some((icon) => icon.sizes === size && icon.purpose === 'any'))
  assert.ok(manifest.icons.some((icon) => icon.purpose === 'maskable'))
  for (const icon of manifest.icons.filter((icon) => icon.type === 'image/png')) {
    const png = readFileSync(new URL(icon.src.slice(1), publicRoot))
    assert.equal(png.subarray(1, 4).toString(), 'PNG')
    assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, icon.sizes)
  }
})
test('iOS touch icon is linked and is a 180px PNG', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  assert.match(html, /rel="apple-touch-icon"/)
  const png = readFileSync(new URL('icons/apple-touch-icon.png', publicRoot))
  assert.equal(png.readUInt32BE(16), 180)
  assert.equal(png.readUInt32BE(20), 180)
})
