<script setup lang="ts">
/**
 * AddTaskFab Component
 * 
 * A floating action button (FAB) that opens a modal for creating new tasks.
 * Includes form validation with visual feedback (shake animation, error messages).
 * Required fields: title and deadline.
 * 
 * Features:
 * - Floating action button positioned at bottom-right
 * - Modal form with title, description, deadline, and tags
 * - Client-side validation with error messages
 * - Shake animation on validation failure
 * - Custom event dispatch to notify views of new tasks
 * 
 * @component
 * @example
 * ```vue
 * <AddTaskFab />
 * ```
 */

import { ref } from 'vue'
import { addTask, Tag, Status } from '@/composables/tasks'
import { useTaskFormatters } from '@/composables/useTaskFormatters'

// ==========================================
// Composables
// ==========================================

const { TAG_LABELS } = useTaskFormatters()

// ==========================================
// Reactive State - Form Data
// ==========================================

/** Controls the visibility of the create task modal */
const isOpen = ref(false)

/** Task title (required field) */
const title = ref('')

/** Task description (optional field) */
const description = ref('')

/** Task deadline in ISO date format (required field) */
const deadline = ref<string | null>(null)

/** Array of tag IDs assigned to the task */
const tags = ref<number[]>([])

// ==========================================
// Form Validation State
// ==========================================

/** 
 * Stores validation error messages for form fields.
 * Keys correspond to field names (e.g., 'title', 'deadline').
 */
const errors = ref<{ title?: string; deadline?: string }>({})

/** 
 * Controls the shake animation trigger for validation feedback.
 * Set to true briefly to trigger animation on validation failure.
 */
const isShaking = ref(false)

// ==========================================
// Modal Controls
// ==========================================

/**
 * Toggles the modal visibility.
 * Clears validation errors when closing the modal.
 */
function toggle() { 
  isOpen.value = !isOpen.value
  if (!isOpen.value) {
    // Clear form and errors when closing
    errors.value = {}
  }
}

/**
 * Validates the create task form.
 * Required fields: title (non-empty) and deadline.
 * 
 * @returns true if form is valid, false otherwise
 */
function validateForm(): boolean {
  errors.value = {}
  
  // Check required field: title
  if (!title.value.trim()) {
    errors.value.title = 'Title is required'
  }
  
  // Check required field: deadline
  if (!deadline.value) {
    errors.value.deadline = 'Deadline is required'
  }
  
  return Object.keys(errors.value).length === 0
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

// ==========================================
// Form Submission
// ==========================================

/**
 * Submits the create task form.
 * Validates form, creates new task object, saves to storage,
 * dispatches custom event to notify views, and resets form.
 * Triggers shake animation if validation fails.
 */
function submit() {
  // Validate form
  if (!validateForm()) {
    triggerShakeAnimation()
    return
  }
  
  // Create new task object with generated ID
  const newTask = {
    id: (crypto as any).randomUUID ? (crypto as any).randomUUID() : Date.now().toString(),
    title: title.value.trim(),
    description: description.value.trim() || undefined,
    status: Status.TODO,
    createdAt: new Date(),
    updatedAt: new Date(),
    deadline: deadline.value ? new Date(deadline.value) : undefined,
    tags: tags.value.length ? tags.value : undefined
  }

  addTask(newTask as any)
  
  // Notify all views to reload tasks data
  window.dispatchEvent(new CustomEvent('tasks-updated'))
  
  // Reset form fields and close modal
  title.value = ''
  description.value = ''
  deadline.value = null
  tags.value = []
  errors.value = {}
  isOpen.value = false
}

/**
 * Toggles a tag in the tags array.
 * If tag doesn't exist, adds it. If tag exists, removes it.
 * 
 * @param t - The tag number to toggle (0-3)
 */
function toggleTag(t: number) {
  const i = tags.value.indexOf(t)
  if (i === -1) tags.value.push(t)
  else tags.value.splice(i, 1)
}
</script>

<template>
  <div>
    <button type="button" class="fab" @click="toggle" aria-label="Add task"></button>

    <transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="toggle">
        <div class="modal-container" :class="{ shake: isShaking }">
          <div class="modal-header">
            <h3>Create task</h3>
            <button type="button" class="close-button" @click="toggle" aria-label="Close dialog">✕</button>
          </div>

          <div class="modal-body">
            <label for="task-title" class="form-label">Title <span class="required-indicator">*</span></label>
            <input id="task-title" v-model="title" class="input" :class="{ 'input-error': errors.title }" placeholder="Task title" autofocus />
            <span v-if="errors.title" class="error-message" role="alert">{{ errors.title }}</span>

            <label for="task-description" class="form-label">Description</label>
            <textarea id="task-description" v-model="description" class="input" rows="3" placeholder="Optional description"></textarea>

            <label for="task-deadline" class="form-label">Deadline <span class="required-indicator">*</span></label>
            <input id="task-deadline" v-model="deadline" type="date" class="input" :class="{ 'input-error': errors.deadline }" />
            <span v-if="errors.deadline" class="error-message" role="alert">{{ errors.deadline }}</span>

            <label class="form-label">Tags</label>
            <div class="tags-row" role="group" aria-label="Task tags selection">
              <button 
                v-for="(label, index) in TAG_LABELS" 
                :key="index"
                type="button" 
                class="tag-btn" 
                :class="{active: tags.includes(index)}"
                :aria-pressed="tags.includes(index)"
                @click="toggleTag(index)"
              >
                {{ label }}
              </button>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="toggle">Cancel</button>
            <button type="button" class="btn btn-primary" @click="submit">Create</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style src="../styles/task-modal.css" scoped></style>

<style scoped>
/* Keep FAB styling local to this component */
.fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: var(--accent-color);
  color: var(--on-accent, #fff);
  border: none;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.fab::before {
  content: '\002B';
  font-size: 32px;
  font-weight: 300;
  line-height: 1;
  margin-top: -10px;
}

/* small helpers for form inputs to match modal look */
.input { padding:0.5rem; border-radius:8px; border:2px solid var(--sidebar-border); background:var(--card-bg); color:var(--text-color); width:100% }
.tags-row { display:flex; gap:0.5rem; margin-top:0.25rem }
.tag-btn { padding:0.35rem 0.6rem; border-radius:8px; border:2px solid var(--sidebar-border); background:var(--card-bg); color:var(--text-color); cursor:pointer }
.tag-btn.active { background:var(--accent-color); color:var(--on-accent,#fff); border-color:var(--accent-color) }

/* Form Validation Styles */
.required-indicator {
  color: #ef4444;
  margin-left: 2px;
}

.input-error {
  border-color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.05);
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

/* Shake Animation */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
  20%, 40%, 60%, 80% { transform: translateX(3px); }
}

.shake {
  animation: shake 0.6s ease-in-out;
}

</style>
