<script setup lang="ts">
/**
 * StatusBadge Component
 * 
 * Displays a task status badge with appropriate styling.
 * Provides consistent status display across the application.
 * 
 * @component
 * @example
 * ```vue
 * <StatusBadge :status="task.status" />
 * ```
 */

import { computed } from 'vue'

/**
 * Component props
 */
const props = defineProps<{
  /** Task status (0=TODO, 1=IN_PROGRESS, 2=DONE, 3=CANCELLED, 4=ARCHIVED) */
  status: number
}>()

/**
 * Returns the CSS class for the status badge.
 */
const statusClass = computed(() => {
  switch (props.status) {
    case 0: return 'status-todo'
    case 1: return 'status-in-progress'
    case 2: return 'status-done'
    case 3: return 'status-cancelled'
    case 4: return 'status-archived'
    default: return 'status-todo'
  }
})

/**
 * Returns the human-readable label for the status.
 */
const statusLabel = computed(() => {
  switch (props.status) {
    case 0: return 'To Do'
    case 1: return 'In Progress'
    case 2: return 'Done'
    case 3: return 'Cancelled'
    case 4: return 'Archived'
    default: return 'Unknown'
  }
})

/**
 * Returns the ARIA label with full context for screen readers.
 */
const ariaLabel = computed(() => {
  return `Task status: ${statusLabel.value}`
})
</script>

<template>
  <span 
    :class="['status-badge', statusClass]"
    role="status"
    :aria-label="ariaLabel"
  >
    {{ statusLabel }}
  </span>
</template>

<style scoped>
/* Status badges inherit styles from global task-card.css and modal.css */
</style>
