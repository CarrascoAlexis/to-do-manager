<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ name: string; size?: number }>()
const size = computed(() => props.size ?? 16)
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="icon">
    <!-- Warning -->
    <g v-if="name === 'warning'" fill="currentColor">
      <path d="M1 21h22L12 2 1 21z" />
      <rect x="11" y="10" width="2" height="5" fill="#fff" />
      <rect x="11" y="16" width="2" height="2" fill="#fff" />
    </g>

    <!-- Event / calendar -->
    <g v-else-if="name === 'event'" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M16 2v4M8 2v4" />
    </g>

    <!-- Clock -->
    <g v-else-if="name === 'clock'" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </g>

    <!-- Edit (pencil) -->
    <g v-else-if="name === 'edit'" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M3 21l3-1 11-11 1-3-3 1L4 20z" />
      <path d="M14 7l3 3" />
    </g>

    <!-- Delete (trash) -->
    <g v-else-if="name === 'delete'" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M3 6h18" />
      <path d="M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </g>

    <!-- Close (X) -->
    <g v-else-if="name === 'close'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M6 6l12 12M18 6L6 18" />
    </g>

    <!-- Party / celebrate (simple star) -->
    <g v-else-if="name === 'party'" fill="currentColor">
      <path d="M12 2l2.4 5 5.6.2-4.2 3 1.4 5.2L12 13.8 6.8 15.4 8.2 10.2 4 7.2l5.6-.2L12 2z" />
    </g>

    <!-- Fallback: simple dot -->
    <g v-else>
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </g>
  </svg>
</template>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
