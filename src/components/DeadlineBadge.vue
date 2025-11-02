<script setup lang="ts">
/**
 * DeadlineBadge Component
 * 
 * Displays a deadline urgency badge with appropriate icon and styling.
 * Shows urgency indicators for overdue, today, and soon deadlines.
 * 
 * @component
 * @example
 * ```vue
 * <DeadlineBadge :status="'overdue'" />
 * <DeadlineBadge :status="'today'" />
 * <DeadlineBadge :status="'soon'" />
 * ```
 */

import { computed } from 'vue'
import type { DeadlineStatus } from '@/composables/useDeadlineStatus'

/**
 * Component props
 */
const props = defineProps<{
  /** Deadline urgency status ('overdue', 'today', 'soon', or null) */
  status: DeadlineStatus
}>()

/**
 * Computed ARIA label for accessibility
 */
const ariaLabel = computed(() => {
  switch (props.status) {
    case 'overdue':
      return 'Deadline: Overdue'
    case 'today':
      return 'Deadline: Due today'
    case 'soon':
      return 'Deadline: Due soon'
    default:
      return ''
  }
})

/**
 * Computed role attribute - use "alert" for overdue (time-sensitive)
 */
const roleAttr = computed(() => {
  return props.status === 'overdue' ? 'alert' : 'status'
})
</script>

<template>
  <span 
    v-if="status && status !== 'normal'" 
    class="deadline-badge" 
    :class="`deadline-${status}`"
    :role="roleAttr"
    :aria-label="ariaLabel"
  >
    <!-- Overdue icon (warning triangle) -->
    <svg v-if="status === 'overdue'" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2L2 22h20L12 2z" fill="currentColor"/>
      <path d="M12 8v5" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="17" r="1" fill="#fff"/>
    </svg>
    
    <!-- Today icon (calendar) -->
    <svg v-else-if="status === 'today'" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5" fill="none" />
      <path d="M16 2v4M8 2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    
    <!-- Soon icon (clock) -->
    <svg v-else-if="status === 'soon'" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/>
      <path d="M12 7v6l4 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    
    <!-- Label text -->
    <template v-if="status === 'overdue'">Overdue</template>
    <template v-else-if="status === 'today'">Today</template>
    <template v-else-if="status === 'soon'">Soon</template>
  </span>
</template>

<style scoped>
/* Deadline badge styles inherit from global task-card.css */
</style>
