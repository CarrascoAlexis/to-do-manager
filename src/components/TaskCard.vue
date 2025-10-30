<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/resources/tasks'

interface Props {
  task: Task
  showDescription?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDescription: false
})

const emit = defineEmits<{
  click: [task: Task]
  edit: [task: Task]
  delete: [task: Task]
  statusChange: [task: Task, newStatus: number]
}>()

// Status badge styling
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

const statusLabel = computed(() => {
  switch (props.task.status) {
    case 0: return 'To Do'
    case 1: return 'In Progress'
    case 2: return 'Done'
    case 3: return 'Cancelled'
    case 4: return 'Archived'
    default: return 'Unknown'
  }
})

// Format date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

// Tag label mapping
const getTagLabel = (tag: number) => {
  const labels = ['Work', 'Personal', 'Urgent', 'Low Priority']
  return labels[tag] || 'Unknown'
}

// Deadline status
const deadlineStatus = computed(() => {
  if (!props.task.deadline) return null
  
  // Don't show status indicators for completed/cancelled/archived tasks
  const isCompletedStatus = props.task.status === 2 || props.task.status === 3 || props.task.status === 4 // DONE, CANCELLED, ARCHIVED
  
  if (isCompletedStatus) return null // No badge for completed tasks
  
  const now = new Date()
  const deadline = props.task.deadline
  const diffTime = deadline.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'today'
  if (diffDays <= 3) return 'soon'
  return 'normal'
})

const deadlineClass = computed(() => {
  if (!deadlineStatus.value) return ''
  return `deadline-${deadlineStatus.value}`
})
</script>

<template>
  <div 
    class="task-card"
    @click="emit('click', task)"
    role="article"
    :aria-label="`Task: ${task.title}`"
  >
    <!-- Main row layout -->
    <div class="task-row">
      <!-- Status badge -->
      <div class="task-status">
        <span :class="['status-badge', statusClass]">
          {{ statusLabel }}
        </span>
      </div>

      <!-- Task content -->
      <div class="task-content">
        <h3 class="task-title">{{ task.title }}</h3>
        <p v-if="showDescription && task.description" class="task-description">
          {{ task.description }}
        </p>
      </div>

      <!-- Tags -->
      <div v-if="task.tags && task.tags.length > 0" class="task-tags">
        <span 
          v-for="tag in task.tags" 
          :key="tag"
          class="tag"
        >
          {{ getTagLabel(tag) }}
        </span>
      </div>

      <!-- Dates -->
      <div class="task-dates">
        <div v-if="task.deadline" class="date-item deadline-item" :class="deadlineClass">
          <span class="date-label">Deadline:</span>
          <span class="date-value">{{ formatDate(task.deadline) }}</span>
          <span v-if="deadlineStatus === 'overdue'" class="deadline-badge">⚠️ Overdue</span>
          <span v-else-if="deadlineStatus === 'today'" class="deadline-badge">📅 Today</span>
          <span v-else-if="deadlineStatus === 'soon'" class="deadline-badge">⏰ Soon</span>
        </div>
        <div class="date-item">
          <span class="date-label">Created:</span>
          <span class="date-value">{{ formatDate(task.createdAt) }}</span>
        </div>
        <div v-if="task.updatedAt.getTime() !== task.createdAt.getTime()" class="date-item">
          <span class="date-label">Updated:</span>
          <span class="date-value">{{ formatDate(task.updatedAt) }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="task-actions">
        <button 
          class="action-btn edit-btn"
          @click.stop="emit('edit', task)"
          aria-label="Edit task"
          title="Edit"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button 
          class="action-btn delete-btn"
          @click.stop="emit('delete', task)"
          aria-label="Delete task"
          title="Delete"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style src="../styles/task-card.css" scoped></style>
