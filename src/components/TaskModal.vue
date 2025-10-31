<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { Task } from '@/resources/tasks'

interface Props {
  task: Task | null
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  edit: [task: Task]
  delete: [task: Task]
  statusChange: [task: Task, newStatus: number]
}>()

// Status label and class
const statusClass = computed(() => {
  if (!props.task) return ''
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
  if (!props.task) return ''
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
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatDateShort = (date: Date) => {
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

const getTagClass = (tag: number) => {
  const classes = ['tag-work', 'tag-personal', 'tag-urgent', 'tag-low-priority']
  return classes[tag] || 'tag-work'
}

// Deadline status
const deadlineStatus = computed(() => {
  if (!props.task?.deadline) return null
  
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

const deadlineLabel = computed(() => {
  if (!deadlineStatus.value) return ''
  switch (deadlineStatus.value) {
    case 'overdue': return '⚠️ Overdue'
    case 'today': return '📅 Today'
    case 'soon': return '⏰ Soon'
    default: return ''
  }
})

// Close modal on Escape key
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close')
  }
}

// Close on background click
const handleBackgroundClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

// Status menu (change status dropdown)
const statusMenuOpen = ref(false)
const statusBtnRef = ref<HTMLElement | null>(null)
const statusMenuRef = ref<HTMLElement | null>(null)

const statuses = [
  { id: 0, label: 'To Do' },
  { id: 1, label: 'In Progress' },
  { id: 2, label: 'Done' },
  { id: 3, label: 'Cancelled' },
  { id: 4, label: 'Archived' }
]

function toggleStatusMenu() { statusMenuOpen.value = !statusMenuOpen.value }
function selectStatus(newStatus: number) {
  if (!props.task) return
  emit('statusChange', props.task, newStatus)
  props.task.status = newStatus // Update local task status for immediate UI feedback
  statusMenuOpen.value = false
}

function onDocClick(e: MouseEvent) {
  const btn = statusBtnRef.value
  const menu = statusMenuRef.value
  if (!btn || !menu) return
  if (btn.contains(e.target as Node) || menu.contains(e.target as Node)) return
  statusMenuOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
})
</script>

<template>
  <Transition name="modal">
    <div 
      v-if="isOpen && task" 
      class="modal-overlay"
      @click="handleBackgroundClick"
      @keydown="handleKeydown"
    >
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">{{ task.title }}</h2>
          <button class="close-button" @click="emit('close')" aria-label="Close modal">
            ✕
          </button>
        </div>

        <div class="modal-body">
          <!-- Status Badge -->
          <div class="info-section">
            <label class="info-label">Status</label>
            <span :class="['status-badge', statusClass]">
              {{ statusLabel }}
            </span>
          </div>

          <!-- Description -->
          <div v-if="task.description" class="info-section">
            <label class="info-label">Description</label>
            <p class="description-text">{{ task.description }}</p>
          </div>

          <!-- Tags -->
          <div v-if="task.tags && task.tags.length > 0" class="info-section">
            <label class="info-label">Tags</label>
            <div class="tags-container">
              <span 
                v-for="tag in task.tags" 
                :key="tag"
                :class="['tag', getTagClass(tag)]"
              >
                {{ getTagLabel(tag) }}
              </span>
            </div>
          </div>

          <!-- Deadline -->
          <div v-if="task.deadline" class="info-section">
            <label class="info-label">Deadline</label>
            <div class="deadline-info">
              <span :class="['deadline-date', deadlineClass]">
                {{ formatDateShort(task.deadline) }}
              </span>
              <span v-if="deadlineLabel" :class="['deadline-badge', deadlineClass]">
                {{ deadlineLabel }}
              </span>
            </div>
          </div>

          <!-- Dates -->
          <div class="info-section">
            <label class="info-label">Created</label>
            <p class="date-text">{{ formatDate(task.createdAt) }}</p>
          </div>

          <div class="info-section">
            <label class="info-label">Last Updated</label>
            <p class="date-text">{{ formatDate(task.updatedAt) }}</p>
          </div>

          <!-- Task ID -->
          <div class="info-section">
            <label class="info-label">Task ID</label>
            <p class="id-text">{{ task.id }}</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="emit('close')">
            Close
          </button>
          <div class="status-dropdown" ref="statusBtnRef">
            <button class="btn btn-secondary" @click="toggleStatusMenu" :aria-expanded="statusMenuOpen" type="button">
              Change status: {{ statusLabel }}
            </button>

            <div v-if="statusMenuOpen" class="status-menu" ref="statusMenuRef" role="menu" aria-label="Change status">
              <button
                v-for="s in statuses"
                :key="s.id"
                class="status-option"
                @click="selectStatus(s.id)"
                :aria-pressed="task && task.status === s.id"
                role="menuitemradio"
              >
                {{ s.label }}
              </button>
            </div>
          </div>
          <button class="btn btn-primary" @click="emit('edit', task)">
            ✏️ Edit
          </button>
          <button class="btn btn-danger" @click="emit('delete', task)">
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style src="../styles/task-modal.css" scoped></style>
