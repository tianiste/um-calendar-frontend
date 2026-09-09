<script setup lang="ts">
import { computed } from 'vue'
import { programmeLabel } from '@/services/programmeLabel'
import { useLanguageStore } from '@/stores/language'
const props = defineProps<{ name: string }>()
const i18n = useLanguageStore()
const color = computed(() => {
  let hash = 0
  for (const char of props.name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return `hsl(${hash % 360} 65% 65%)`
})
</script>
<template>
  <span class="programme-badge" :style="{ '--programme-color': color }"
    ><i aria-hidden="true" />{{ programmeLabel(name, i18n.language) }}</span
  >
</template>
