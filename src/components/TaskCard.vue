<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/resources/tasks'
import { Tag } from '@/resources/tasks'

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

const TAG_LABELS: Record<string | number, string> = {
  [Tag.WORK as any]: 'Work',
  [Tag.PERSONAL as any]: 'Personal',
  [Tag.URGENT as any]: 'Urgent',
  [Tag.LOW_PRIORITY as any]: 'Low priority',
}

const getTagLabel = (tag: Tag) => {
  // allow numeric or string tags; try mapping first, then fallback to enum name or a generic label
  const mapped = TAG_LABELS[tag as any]
  if (mapped) return mapped
  // if tag is numeric enum value, try to get the enum key name
  try {
    const key = (Tag as any)[tag]
    if (key) return String(key).replace(/_/g, ' ').toLowerCase().replace(/^(.)/, s => s.toUpperCase())
  } catch (e) {
    // ignore
  }
  return String(tag ?? '')
}

const getTagClass = (tag: Tag) => {
  switch (tag) {
    case Tag.WORK: return 'tag-work'
    case Tag.PERSONAL: return 'tag-personal'
    case Tag.URGENT: return 'tag-urgent'
    case Tag.LOW_PRIORITY: return 'tag-low-priority'
    default: return ''
  }
}

// Normalize tags so TaskCard can accept either a single tag or an array of tags
const tagsList = computed(() => {
  const t = (props as any).task?.tags
  if (!t) return [] as Tag[]
  return Array.isArray(t) ? t as Tag[] : [t as Tag]
})

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
    <!-- small colored side bar that reflects the task status -->
    <!-- kept inside the card so it moves with the card and uses the same status classes -->
    <!-- Note: styling for .status-side is in src/styles/task-card.css -->
    
    <!-- Main row layout -->
    <div class="task-row">
      <div class="status-side" :class="statusClass" aria-hidden="true"></div>
      <!-- Task content -->
      <div class="task-content">
        <h3 class="task-title">{{ task.title }}</h3>
        <p v-if="showDescription && task.description" class="task-description">
          {{ task.description }}
        </p>
        <!-- Status label placed under the title/description for clearer grouping -->
        <div class="task-status-row">
          <span :class="['status-badge', statusClass]">{{ statusLabel }}</span>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="tagsList.length > 0" class="task-tags">
        <span 
          v-for="(tag, idx) in tagsList" 
          :key="`${tag}-${idx}`"
          :class="['tag', getTagClass(tag)]"
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
        <!-- edit button removed — edits are opened via clicking the card or modal actions -->
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
