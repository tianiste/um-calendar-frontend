<script setup lang="ts">
withDefaults(defineProps<{ name: string; size?: number }>(), { size: 20 })
const paths: Record<string, string> = {
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  eyeOff:
    'm3 3 18 18M9 5.5A12 12 0 0 1 12 5c6 0 10 7 10 7a22 22 0 0 1-3 4M6 6a22 22 0 0 0-4 6s4 7 10 7a12 12 0 0 0 5-1M10 10a3 3 0 0 0 4 4',
  day: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z',
  week: 'M3 4h18v16H3zM9 4v16m6-16v16',
  month:
    'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2ZM7 14h1m3 0h1m3 0h1M7 17h1m3 0h1m3 0h1',
  left: 'm14 6-6 6 6 6',
  right: 'm9 6 6 6-6 6',
  down: 'm6 9 6 6 6-6',
  up: 'm6 15 6-6 6 6',
  back: 'M20 12H4m6-6-6 6 6 6',
  close: 'm6 6 12 12M6 18 18 6',
  school: 'm2 9 10-5 10 5-10 5L2 9Zm4 2v6l6 3 6-3v-6m4-2v7',
  moon: 'M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1',
  search: 'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 6 6',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 2',
  pin: 'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  filter: 'M4 7h16M4 17h16M8 4v6m8 4v6',
  check: 'm5 12 4 4L19 6',
  refresh: 'M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 14 6M4 12a8 8 0 0 0 14 6',
  warning: 'm12 3 10 18H2L12 3Zm0 6v5m0 3v1',
}
</script>
<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name] || paths.day" />
  </svg>
</template>
