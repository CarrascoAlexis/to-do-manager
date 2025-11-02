<script setup lang="ts">
/**
 * TaskCard Component
 * 
 * A reusable card component that displays task information in a horizontal layout.
 * Provides quick actions for viewing, editing, deleting, and changing task status.
 * Shows task details including title, description, status, tags, deadline, and timestamps.
 * 
 * @component
 * @example
 * ```vue
 * <TaskCard 
 *   :task="task" 
 *   :show-description="true"
 *   @click="handleTaskClick"
 *   @edit="handleTaskEdit"
 *   @delete="handleTaskDelete"
 *   @status-change="handleStatusChange"
 * />
 * ```
 */

import { computed } from 'vue'
import type { Task } from '@/composables/tasks'
import { useTaskFormatters } from '@/composables/useTaskFormatters'
import { useDeadlineStatus } from '@/composables/useDeadlineStatus'
import StatusBadge from './StatusBadge.vue'
import DeadlineBadge from './DeadlineBadge.vue'
import TagsList from './TagsList.vue'

/**
 * Component props interface
 */
interface Props {
  /** The task object to display */
  task: Task
  /** Whether to show the task description (optional, defaults to false) */
  showDescription?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDescription: false
})

/**
 * Component events
 * 
 * @event click - Emitted when the card is clicked (for viewing details)
 * @event edit - Emitted when the edit button is clicked
 * @event delete - Emitted when the delete button is clicked
 * @event statusChange - Emitted when the status is changed via dropdown
 */
const emit = defineEmits<{
  click: [task: Task]
  edit: [task: Task]
  delete: [task: Task]
  statusChange: [task: Task, newStatus: number]
}>()

// ==========================================
// Composables
// ==========================================

const { formatDateShort } = useTaskFormatters()
const { getDeadlineStatus, getDeadlineClass } = useDeadlineStatus()

// ==========================================
// Event Handlers
// ==========================================

/**
 * Handles keyboard interaction for card activation.
 * Emits click event when Enter or Space is pressed.
 */
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    emit('click', props.task)
  }
}

// ==========================================
// Computed Properties
// ==========================================

/**
 * Returns the CSS class for the task status (for status side bar).
 */
const statusClass = computed(() => {
  switch (props.task.status) {
    case 0: return 'status-todo'
    case 1: return 'status-in-progress'
    case 2: return 'status-done'
    case 3: return 'status-cancelled'
    case 4: return 'status-archived'
    default: return 'status-todo'
  }
})

/**
 * Computes deadline status for the current task.
 */
const deadlineStatus = computed(() => getDeadlineStatus(props.task))

/**
 * Computes deadline CSS class for the current task.
 */
const deadlineClass = computed(() => getDeadlineClass(deadlineStatus.value))
</script>

<template>
  <!-- 
    Main task card component
    Displays task information in a card layout with:
    - Status indicator bar (left side)
    - Task title and optional description
    - Status badge
    - Tags (if present)
    - Deadline with urgency indicators
    - Created/Updated timestamps
    - Delete action button
    
    Click anywhere on the card to view/edit full details
  -->
  <div 
    class="task-card"
    @click="emit('click', task)"
    @keydown="handleKeydown"
    tabindex="0"
    role="button"
    :aria-label="`Task: ${task.title}`"
  >
    <!-- Colored status indicator bar on the left edge -->
    <!-- Styling defined in src/styles/task-card.css -->
    
    <!-- Main row layout -->
    <div class="task-row">
      <div class="status-side" :class="statusClass" aria-hidden="true"></div>
      <!-- Task content -->
      <div class="task-content">
        <h3 class="task-title">{{ task.title }}</h3>
        <p v-if="showDescription && task.description" class="task-description">
          {{ task.description }}
        </p>
        <!-- Status badge -->
        <div class="task-status-row">
          <StatusBadge :status="task.status" />
        </div>
      </div>

      <!-- Tags -->
      <div v-if="task.tags && task.tags.length > 0" class="task-tags">
        <TagsList :tags="task.tags" />
      </div>

      <!-- Dates -->
      <div class="task-dates">
        <div v-if="task.deadline" class="date-item deadline-item" :class="deadlineClass">
          <span class="date-label">Deadline:</span>
          <span class="date-value">{{ formatDateShort(task.deadline) }}</span>
          <DeadlineBadge :status="deadlineStatus" />
        </div>
        <div class="date-item">
          <span class="date-label">Created:</span>
          <span class="date-value">{{ formatDateShort(task.createdAt) }}</span>
        </div>
        <div v-if="task.updatedAt.getTime() !== task.createdAt.getTime()" class="date-item">
          <span class="date-label">Updated:</span>
          <span class="date-value">{{ formatDateShort(task.updatedAt) }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="task-actions">
        <!-- edit button removed — edits are opened via clicking the card or modal actions -->
        <button 
          type="button"
          class="action-btn delete-btn"
          @click.stop="emit('delete', task)"
          aria-label="Delete task"
          title="Delete"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style src="../styles/task-card.css" scoped></style>
