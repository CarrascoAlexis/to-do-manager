<script setup lang="ts">
/**
 * TaskModal Component
 * 
 * A full-screen modal for viewing and editing task details.
 * Provides both view mode (read-only) and edit mode (form inputs) functionality.
 * Includes form validation with visual feedback (shake animation, error messages).
 * Supports keyboard navigation (Escape to close) and click-outside-to-close.
 * 
 * @component
 * @example
 * ```vue
 * <TaskModal 
 *   :task="selectedTask" 
 *   :is-open="isModalOpen"
 *   :open-in-edit="false"
 *   @close="handleClose"
 *   @edit="handleEdit"
 *   @delete="handleDelete"
 *   @status-change="handleStatusChange"
 * />
 * ```
 */

import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
  /** The task to display/edit, or null if modal is closed */
  task: Task | null
  /** Controls modal visibility */
  isOpen: boolean
}

const props = defineProps<Props>()

/**
 * Component events
 * 
 * @event close - Emitted when the modal should be closed
 * @event edit - Emitted when task edits are saved (includes updated task)
 * @event delete - Emitted when delete button is clicked
 * @event statusChange - Emitted when task status is changed via dropdown
 */
const emit = defineEmits<{
  close: []
  edit: [task: Task]
  delete: [task: Task]
  statusChange: [task: Task, newStatus: number]
}>()

// ==========================================
// Composables
// ==========================================

const { formatDate, formatDateShort, getTagLabel } = useTaskFormatters()
const { getDeadlineStatus, getDeadlineClass, getDeadlineLabel } = useDeadlineStatus()

// ==========================================
// Computed Properties - Deadline
// ==========================================

/**
 * Computes deadline status for the current task.
 */
const deadlineStatus = computed(() => getDeadlineStatus(props.task))

/**
 * Computes deadline CSS class for the current task.
 */
const deadlineClass = computed(() => getDeadlineClass(deadlineStatus.value))

/**
 * Computes deadline label for the current task.
 */
const deadlineLabel = computed(() => getDeadlineLabel(deadlineStatus.value))

/**
 * Returns the human-readable label for the current task status.
 * Used in the status change dropdown button.
 */
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

// ==========================================
// Event Handlers - Keyboard & Click
// ==========================================

/**
 * Closes the modal when Escape key is pressed.
 * Provides keyboard navigation support.
 * 
 * @param e - Keyboard event
 */
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close')
  }
}

/**
 * Closes the modal when clicking outside the modal content area.
 * Provides click-outside-to-close functionality.
 * 
 * @param e - Mouse event
 */
const handleBackgroundClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

// ==========================================
// Modal Focus Management
// ==========================================

/** Reference to the modal overlay for focus management */
const modalOverlayRef = ref<HTMLElement | null>(null)

/**
 * Focuses the modal overlay when it opens to ensure keyboard events are captured
 */
watch(() => props.isOpen, (newVal: boolean) => {
  if (newVal) {
    nextTick(() => {
      modalOverlayRef.value?.focus()
    })
  }
})

// ==========================================
// Status Menu - Change Status Dropdown
// ==========================================

/** Controls the visibility of the status dropdown menu */
const statusMenuOpen = ref(false)

/** Reference to the status button element for click-outside detection */
const statusBtnRef = ref<HTMLElement | null>(null)

/** Reference to the status menu element for click-outside detection */
const statusMenuRef = ref<HTMLElement | null>(null)

/**
 * List of all possible task statuses for the dropdown menu.
 */
const statuses = [
  { id: 0, label: 'To Do' },
  { id: 1, label: 'In Progress' },
  { id: 2, label: 'Done' },
  { id: 3, label: 'Cancelled' },
  { id: 4, label: 'Archived' }
]

/**
 * Toggles the status dropdown menu visibility.
 */
function toggleStatusMenu() { statusMenuOpen.value = !statusMenuOpen.value }

/**
 * Handles status selection from the dropdown menu.
 * Updates task status locally for immediate UI feedback, then emits event.
 * 
 * @param newStatus - The new status ID (0-4)
 */
function selectStatus(newStatus: number) {
  if (!props.task) return
  emit('statusChange', props.task, newStatus)
  props.task.status = newStatus // Update local task status for immediate UI feedback
  statusMenuOpen.value = false
}

/**
 * Closes the status menu when clicking outside of it.
 * Attached to document click event on mount.
 * 
 * @param e - Mouse event
 */
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

// ==========================================
// Edit Mode State
// ==========================================

/** Controls whether the modal is in edit mode (form inputs) or view mode (read-only) */
const editing = ref(false)

/** 
 * Holds the edited task data during edit mode.
 * Contains form values that can be modified before saving.
 */
const edited = ref<any>(null)

// ==========================================
// Form Validation
// ==========================================

/** 
 * Stores validation error messages for form fields.
 * Keys correspond to field names (e.g., 'title').
 */
const errors = ref<{ title?: string }>({})

/** 
 * Controls the shake animation trigger for validation feedback.
 * Set to true briefly to trigger animation on validation failure.
 */
const isShaking = ref(false)

// ==========================================
// Edit Mode Functions
// ==========================================

/**
 * Enters edit mode for the current task.
 * Creates a shallow copy of task data with date formatting for form inputs.
 * Clears any previous validation errors.
 */
function startEdit() {
  if (!props.task) return
  editing.value = true
  // shallow copy and convert dates to ISO date string for inputs
  edited.value = {
    ...props.task,
    // convert deadline to yyyy-mm-dd string for date input
    deadline: props.task.deadline ? (props.task.deadline as Date).toISOString().slice(0,10) : undefined
  }
  // Clear errors when starting edit
  errors.value = {}
}

/**
 * Cancels edit mode without saving changes.
 * Resets edited data and clears validation errors.
 */
function cancelEdit() {
  editing.value = false
  edited.value = null
  errors.value = {}
}

/**
 * Validates the edit form before saving.
 * Currently checks that title field is not empty.
 * 
 * @returns true if form is valid, false otherwise
 */
function validateForm(): boolean {
  errors.value = {}
  
  // Check required field: title
  if (!edited.value?.title || edited.value.title.trim() === '') {
    errors.value.title = 'Title is required'
    return false
  }
  
  return true
}

/**
 * Triggers the shake animation for visual feedback on validation failure.
 * Animation lasts 600ms and resets automatically.
 */
function triggerShakeAnimation() {
  isShaking.value = true
  setTimeout(() => {
    isShaking.value = false
  }, 600) // Match animation duration
}

/**
 * Saves the edited task data.
 * Validates form, constructs updated task object, and emits edit event.
 * Triggers shake animation if validation fails.
 */
function saveEdit() {
  if (!props.task || !edited.value) return
  
  // Validate form
  if (!validateForm()) {
    triggerShakeAnimation()
    return
  }
  
  // Construct updated task object with edited values
  const updated: Task = {
    ...props.task,
    title: edited.value.title || props.task.title,
    description: edited.value.description || props.task.description,
    deadline: edited.value.deadline ? new Date(edited.value.deadline as any) : undefined,
    tags: edited.value.tags ? edited.value.tags : props.task.tags,
    updatedAt: new Date(),
    status: (edited.value.status as any) ?? props.task.status
  }
  emit('edit', updated)
  // Update local state and exit edit mode
  editing.value = false
  edited.value = null
  errors.value = {}
}

/**
 * Toggles a tag in the edited task's tags array.
 * If tag doesn't exist, adds it. If tag exists, removes it.
 * 
 * @param tag - The tag number to toggle (0-3)
 */
function toggleEditedTag(tag: number) {
  if (!edited.value) return
  const arr = edited.value.tags as number[] | undefined
  if (!arr) edited.value.tags = [tag]
  else {
    const i = arr.indexOf(tag)
    if (i === -1) arr.push(tag)
    else arr.splice(i, 1)
  }
}
</script>

<template>
  <Transition name="modal">
    <div 
      v-if="isOpen && task"
      ref="modalOverlayRef"
      class="modal-overlay"
      @click="handleBackgroundClick"
      @keydown="handleKeydown"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
    >
      <div class="modal-container" :class="{ shake: isShaking }">
        <div class="modal-header">
          <template v-if="!editing">
            <h2 class="modal-title">{{ task.title }}</h2>
          </template>
          <template v-else>
            <input class="modal-title input" v-model="edited.title" aria-label="Task title" />
          </template>
          <button type="button" class="close-button" @click="emit('close')" aria-label="Close modal">
            ✕
          </button>
        </div>

        <div class="modal-body">
          <template v-if="!editing">
          <!-- Status Badge -->
          <div class="info-section">
            <label class="info-label">Status</label>
            <StatusBadge :status="task.status" />
          </div>

          <!-- Description -->
          <div v-if="task.description" class="info-section">
            <label class="info-label">Description</label>
            <p class="description-text">{{ task.description }}</p>
          </div>

          <!-- Tags -->
          <div v-if="task.tags && task.tags.length > 0" class="info-section">
            <label class="info-label">Tags</label>
            <TagsList :tags="task.tags" />
          </div>

          <!-- Deadline -->
          <div v-if="task.deadline" class="info-section">
            <label class="info-label">Deadline</label>
            <div class="deadline-info">
              <span :class="['deadline-date', deadlineClass]">
                {{ formatDateShort(task.deadline) }}
              </span>
              <DeadlineBadge :status="deadlineStatus" />
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
          </template>

          <template v-else>
            <div class="info-section">
              <label for="edit-task-title" class="info-label">Title <span class="required-indicator">*</span></label>
              <input id="edit-task-title" v-model="edited.title" class="input" :class="{ 'input-error': errors.title }" />
              <span v-if="errors.title" class="error-message" role="alert">{{ errors.title }}</span>
            </div>

            <div class="info-section">
              <label for="edit-task-description" class="info-label">Description</label>
              <textarea id="edit-task-description" v-model="edited.description" class="input" rows="4"></textarea>
            </div>

            <div class="info-section">
              <label for="edit-task-deadline" class="info-label">Deadline</label>
              <input id="edit-task-deadline" type="date" v-model="edited.deadline" class="input" />
            </div>

            <div class="info-section">
              <label class="info-label">Tags</label>
              <div class="tags-row" role="group" aria-label="Task tags selection">
                <button type="button" class="tag-btn" :class="{active: edited.tags && edited.tags.includes(0)}" :aria-pressed="edited.tags && edited.tags.includes(0)" @click="toggleEditedTag(0)">Work</button>
                <button type="button" class="tag-btn" :class="{active: edited.tags && edited.tags.includes(1)}" :aria-pressed="edited.tags && edited.tags.includes(1)" @click="toggleEditedTag(1)">Personal</button>
                <button type="button" class="tag-btn" :class="{active: edited.tags && edited.tags.includes(2)}" :aria-pressed="edited.tags && edited.tags.includes(2)" @click="toggleEditedTag(2)">Urgent</button>
                <button type="button" class="tag-btn" :class="{active: edited.tags && edited.tags.includes(3)}" :aria-pressed="edited.tags && edited.tags.includes(3)" @click="toggleEditedTag(3)">Low</button>
              </div>
            </div>

            <div class="info-section">
              <label for="edit-task-status" class="info-label">Status</label>
              <select id="edit-task-status" v-model.number="edited.status" class="input">
                <option v-for="s in statuses" :key="s.id" :value="s.id">{{ s.label }}</option>
              </select>
            </div>
          </template>

        </div>

        <div class="modal-footer">
          <template v-if="!editing">
            <button type="button" class="btn btn-secondary" @click="emit('close')">Close</button>
            <div class="status-dropdown" ref="statusBtnRef">
              <button class="status-toggle" @click="toggleStatusMenu" :aria-expanded="statusMenuOpen" aria-haspopup="true" type="button">
                Change status: {{ statusLabel }}
              </button>

              <div v-if="statusMenuOpen" class="status-menu" ref="statusMenuRef" role="menu" aria-label="Change status">
                <button
                  v-for="s in statuses"
                  :key="s.id"
                  type="button"
                  class="status-option"
                  @click="selectStatus(s.id)"
                  :aria-pressed="task && task.status === s.id"
                  role="menuitemradio"
                >
                  {{ s.label }}
                </button>
              </div>
            </div>
            <button type="button" class="btn btn-primary" @click="startEdit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="margin-right:6px;vertical-align:middle;">
                <path d="M3 21v-3.75L17.81 2.69a2 2 0 0 1 2.83 0l.67.67a2 2 0 0 1 0 2.83L6.5 21H3z" fill="currentColor"/>
              </svg>
              Edit
            </button>
            <button type="button" class="btn btn-danger" @click="emit('delete', task)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="margin-right:6px;vertical-align:middle;">
                <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Delete
            </button>
          </template>
          <template v-else>
            <button type="button" class="btn btn-secondary" @click="cancelEdit">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveEdit">Save</button>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style src="../styles/task-modal.css" scoped></style>
