/**
 * useTaskManagement Composable
 * 
 * A reusable Vue 3 composable that provides shared task management logic for views.
 * This composable handles modal state, CRUD operations, and automatic reloading when
 * tasks are updated via custom events.
 * 
 * @module composables/useTaskManagement
 * 
 * @example
 * ```typescript
 * import { useTaskManagement } from '@/composables/useTaskManagement'
 * 
 * // In your component:
 * const { 
 *   selectedTask, 
 *   isModalOpen, 
 *   handleTaskClick, 
 *   handleTaskEdit 
 * } = useTaskManagement(loadTasksData)
 * ```
 * 
 * Features:
 * - Modal state management (open, close, edit mode)
 * - Task CRUD operations (create, read, update, delete)
 * - Event handlers compatible with TaskCard and TaskModal components
 * - Automatic reload on 'tasks-updated' custom event
 * - Lifecycle management with Vue's onMounted/onUnmounted
 */

import { ref, onMounted, onUnmounted } from 'vue'
import type { Task } from '@/composables/tasks'
import { saveAllTasks, loadTasks } from '@/composables/tasks'

/**
 * Creates a task management instance with modal state and CRUD handlers.
 * 
 * @param {() => void} reloadCallback - Function to call when tasks need to be reloaded.
 *                                      Typically a function that fetches/filters tasks.
 * 
 * @returns {Object} An object containing reactive state and handler functions:
 *   - selectedTask: Ref<Task | null> - Currently selected task for modal display
 *   - isModalOpen: Ref<boolean> - Whether the task modal is currently open
 *   - selectedIsEdit: Ref<boolean> - Whether modal is in edit mode
 *   - handleTaskClick: (task: Task) => void - Opens modal to view a task
 *   - openEditModal: (task: Task) => void - Opens modal in edit mode
 *   - handleCloseModal: () => void - Closes the modal
 *   - handleTaskEdit: (task: Task) => void - Saves edited task to storage
 *   - handleTaskDelete: (task: Task) => void - Removes task from storage
 *   - handleStatusChange: (task: Task, newStatus: number) => void - Updates task status
 */
export function useTaskManagement(reloadCallback: () => void) {
  // ==========================================
  // Reactive State
  // ==========================================
  
  /**
   * Currently selected task for viewing/editing in the modal.
   * Null when no task is selected.
   */
  const selectedTask = ref<Task | null>(null)
  
  /**
   * Controls the visibility of the TaskModal component.
   */
  const isModalOpen = ref(false)
  
  /**
   * Indicates whether the modal should open in edit mode.
   * When true, the modal displays form inputs instead of read-only information.
   */
  const selectedIsEdit = ref(false)

  // ==========================================
  // Modal Management Functions
  // ==========================================

  /**
   * Opens the task modal to view task details.
   * This is typically called when a TaskCard is clicked.
   * 
   * @param {Task} task - The task to display in the modal
   * 
   * @example
   * ```vue
   * <TaskCard @click="handleTaskClick" :task="task" />
   * ```
   */
  function handleTaskClick(task: Task) {
    selectedTask.value = task
    isModalOpen.value = true
  }

  /**
   * Opens the task modal in edit mode.
   * This is typically called when the Edit button on a TaskCard is clicked.
   * 
   * @param {Task} task - The task to edit
   * 
   * @example
   * ```vue
   * <TaskCard @edit="openEditModal" :task="task" />
   * ```
   */
  function openEditModal(task: Task) {
    selectedTask.value = task
    isModalOpen.value = true
    selectedIsEdit.value = true
  }

  /**
   * Closes the task modal and resets state.
   * Uses a 300ms delay before clearing selectedTask to allow for
   * smooth CSS transition animations.
   */
  function handleCloseModal() {
    isModalOpen.value = false
    selectedIsEdit.value = false
    // Delay clearing selected task to allow modal close animation to complete
    setTimeout(() => {
      selectedTask.value = null
    }, 300)
  }

  // ==========================================
  // CRUD Operations
  // ==========================================

  /**
   * Saves an edited task to localStorage and reloads the task list.
   * Merges the edited task data with the existing task, updates the
   * updatedAt timestamp, and persists to storage.
   * 
   * @param {Task} task - The edited task with updated properties
   * 
   * @example
   * ```vue
   * <TaskModal @edit="handleTaskEdit" :task="selectedTask" />
   * ```
   */
  function handleTaskEdit(task: Task) {
    const all = loadTasks()
    const idx = all.findIndex(t => t.id === task.id)
    if (idx !== -1) {
      // Merge edited properties with existing task and update timestamp
      all[idx] = { ...all[idx], ...task, updatedAt: new Date() }
      saveAllTasks(all)
      reloadCallback()
    }
    handleCloseModal()
  }

  /**
   * Deletes a task from storage and reloads the task list.
   * Removes the task from localStorage and triggers a reload callback
   * to update the UI.
   * 
   * @param {Task} task - The task to delete
   * 
   * @example
   * ```vue
   * <TaskModal @delete="handleTaskDelete" :task="selectedTask" />
   * ```
   */
  function handleTaskDelete(task: Task) {
    const all = loadTasks()
    const updatedTasks = all.filter(t => t.id !== task.id)
    saveAllTasks(updatedTasks)
    reloadCallback()
    handleCloseModal()
  }

  /**
   * Updates a task's status and saves to storage.
   * Finds the task in storage, updates its status and updatedAt timestamp,
   * persists changes, and reloads the task list.
   * 
   * @param {Task} task - The task to update
   * @param {number} newStatus - The new status value (0=TODO, 1=IN_PROGRESS, 2=DONE, etc.)
   * 
   * @example
   * ```vue
   * <TaskCard @status-change="handleStatusChange" :task="task" />
   * ```
   */
  function handleStatusChange(task: Task, newStatus: number) {
    const all = loadTasks()
    const taskToUpdate = all.find(t => t.id === task.id)
    if (taskToUpdate) {
      taskToUpdate.status = newStatus
      taskToUpdate.updatedAt = new Date()
      saveAllTasks(all)
      reloadCallback()
    }
  }

  // ==========================================
  // Lifecycle Hooks
  // ==========================================

  /**
   * Automatically listens for 'tasks-updated' custom events and reloads tasks.
   * This allows other parts of the application (like AddTaskFab) to trigger
   * a reload without direct coupling.
   */
  onMounted(() => {
    window.addEventListener('tasks-updated', reloadCallback)
  })

  /**
   * Cleans up event listener when component is unmounted.
   */
  onUnmounted(() => {
    window.removeEventListener('tasks-updated', reloadCallback)
  })

  // ==========================================
  // Public API
  // ==========================================

  return {
    // State
    selectedTask,
    isModalOpen,
    selectedIsEdit,
    // Modal handlers
    handleTaskClick,
    openEditModal,
    handleCloseModal,
    // CRUD handlers
    handleTaskEdit,
    handleTaskDelete,
    handleStatusChange
  }
}
