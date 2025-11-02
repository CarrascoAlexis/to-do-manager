<script setup lang="ts">
/**
 * KanbanBoard Component
 * 
 * Displays tasks in a Kanban board layout with drag-and-drop functionality.
 * Tasks are organized into columns by status (To Do, In Progress, Done, Cancelled, Archived).
 * Users can drag tasks between columns to update their status.
 * 
 * Features:
 * - Drag-and-drop task movement between status columns
 * - Visual feedback for drag operations (ghost class, drop highlight)
 * - Optimistic UI updates for smooth user experience
 * - Automatic persistence to local storage
 * - Custom event dispatch to notify other components
 * - Compact card display optimized for kanban view
 * 
 * Uses sortablejs library for drag-and-drop functionality.
 * 
 * @component
 * @example
 * ```vue
 * <KanbanBoard
 *   :tasks="filteredTasks"
 *   :showDescription="false"
 *   @click="handleTaskClick"
 *   @edit="handleTaskEdit"
 *   @delete="handleTaskDelete"
 *   @status-change="handleStatusChange"
 * />
 * ```
 */

import type { Task } from '@/composables/tasks'
import { Status, loadTasks, saveAllTasks } from '@/composables/tasks'
import { computed, defineProps, defineEmits, onMounted, onBeforeUnmount, nextTick, ref, watch } from 'vue'
import Sortable from 'sortablejs'
import TaskCard from './TaskCard.vue'

/**
 * Component props
 */
const props = defineProps({
  /** Array of tasks to display in the kanban board */
  tasks: { type: Array as () => Task[], default: () => [] },
  /** Whether to show task descriptions in cards (typically false for compact kanban view) */
  showDescription: { type: Boolean, default: true }
})

/**
 * Component events
 * 
 * @event click - Emitted when a task card is clicked
 * @event edit - Emitted when a task is edited
 * @event delete - Emitted when a task is deleted
 * @event status-change - Emitted when a task's status is changed via drag-and-drop
 */
const emit = defineEmits(['click', 'edit', 'delete', 'status-change'])

// ==========================================
// Reactive State - Task Management
// ==========================================

/**
 * Local copy of tasks for optimistic UI updates.
 * When a task is dragged and dropped, this local copy is updated immediately
 * for a smooth user experience, while persistence happens asynchronously.
 */
const localTasks = ref<Task[]>((props.tasks || []).slice())

/**
 * Watches for changes to the tasks prop and syncs them to the local copy.
 * Ensures the component stays in sync with parent data updates.
 */
watch(() => props.tasks, (v) => {
  // sync incoming prop changes into local copy
  localTasks.value = (v || []).slice()
})

// ==========================================
// Computed Properties - Column Layout
// ==========================================

/**
 * Computes the kanban columns with their respective tasks.
 * Each column represents a task status and contains filtered tasks.
 * 
 * @returns Array of column objects with key, label, and tasks
 */
const columns = computed(() => {
  // Define columns in the common Kanban order
  const cols = [
    { key: Status.TODO, label: 'To Do' },
    { key: Status.IN_PROGRESS, label: 'In Progress' },
    { key: Status.DONE, label: 'Done' },
    { key: Status.CANCELLED, label: 'Cancelled' },
    { key: Status.ARCHIVED, label: 'Archived' }
  ]

  return cols.map(c => ({
    ...c,
    tasks: (localTasks.value || []).filter(t => t.status === c.key)
  }))
})

// ==========================================
// Drag-and-Drop State
// ==========================================

/** Holds DOM references to each column body element for Sortable initialization */
const columnNodes = ref(new Map<number, HTMLElement>())

/** Stores Sortable.js instances for each column */
const sortableInstances = ref(new Map<number, any>())

// ==========================================
// Event Handlers - Task Actions
// ==========================================

/** Emits click event when a task card is clicked */
function onCardClick(task: Task) { emit('click', task) }

/** Emits edit event when a task is edited */
function onCardEdit(task: Task) { emit('edit', task) }

/** Emits delete event when a task is deleted */
function onCardDelete(task: Task) { emit('delete', task) }

/** Emits status-change event when a task's status is changed */
function onStatusChange(task: Task, status: number) { emit('status-change', task, status) }

// ==========================================
// Drag-and-Drop Setup
// ==========================================

/**
 * Initializes Sortable.js for a kanban column to enable drag-and-drop.
 * Handles task movement between columns and updates task status accordingly.
 * Provides visual feedback and persists changes to local storage.
 * 
 * @param colKey - The status key for the column
 * @param node - The DOM element for the column body
 */
function setupSortableForColumn(colKey: number, node: HTMLElement) {
  // Create a Sortable instance that allows moving between columns
  const instance = new Sortable(node, {
    group: { name: 'kanban', pull: true, put: true },
    animation: 150,
    ghostClass: 'kanban-ghost',
    fallbackOnBody: true,
    swapThreshold: 0.65,
  onEnd: (evt: any) => {
      try {
        const item = evt.item as HTMLElement | null
        if (!item) return
        const taskId = item.getAttribute('data-task-id')
        if (!taskId) return
        const toColEl = evt.to?.closest('.kanban-column') as HTMLElement | null
        if (!toColEl) return
        const toKey = Number(toColEl.getAttribute('data-col-key'))
        if (Number.isFinite(toKey)) {
          // Load the authoritative tasks list, update the task status and persist
          const allTasks = loadTasks()
          const persistedTask = allTasks.find(t => t.id === taskId)
          if (persistedTask && persistedTask.status !== toKey) {
            persistedTask.status = toKey
            persistedTask.updatedAt = new Date()
            saveAllTasks(allTasks)
            // update local view immediately so the card moves without waiting for parent
            const local = localTasks.value.find(t => t.id === taskId)
            if (local) {
              local.status = toKey
              local.updatedAt = persistedTask.updatedAt
            }
            // visual feedback: highlight the moved item and the destination column briefly
            try {
              item.classList.add('drop-success')
              setTimeout(() => item.classList.remove('drop-success'), 420)
            } catch (err) { /* ignore */ }
            try {
              toColEl.classList.add('drop-highlight')
              setTimeout(() => toColEl.classList.remove('drop-highlight'), 420)
            } catch (err) { /* ignore */ }

            // emit for any listeners (parent may also update its store)
            emit('status-change', persistedTask, toKey)

            // emit a global event so other parts of the app can react to the change
            try {
              window.dispatchEvent(new CustomEvent('tasks-updated', { detail: { taskId, to: toKey } }))
            } catch (err) { /* ignore environments without window */ }
          }
        }
      } catch (err) {
        // swallow any unexpected errors to avoid breaking UI
        console.error('kanban: sortable onEnd error', err)
      }
    }
  })

  sortableInstances.value.set(colKey, instance)
}

onMounted(async () => {
  // wait for DOM to render
  await nextTick()
  // find column body nodes and initialize Sortable for each
  const cols = Array.from(document.querySelectorAll('.kanban-column')) as HTMLElement[]
  cols.forEach(colEl => {
    const keyAttr = colEl.getAttribute('data-col-key')
    if (!keyAttr) return
    const key = Number(keyAttr)
    const body = colEl.querySelector('.column-body') as HTMLElement | null
    if (body) {
      columnNodes.value.set(key, body)
      setupSortableForColumn(key, body)
    }
  })
})

onBeforeUnmount(() => {
  // destroy Sortable instances
  for (const inst of sortableInstances.value.values()) {
    try { inst.destroy() } catch (e) { /* ignore */ }
  }
  sortableInstances.value.clear()
  columnNodes.value.clear()
})
</script>

<template>
  <div class="kanban-board">
    <div class="kanban-column" v-for="col in columns" :key="String(col.key)" :data-col-key="String(col.key)">
      <div class="column-header">
        <div class="column-title">{{ col.label }}</div>
        <div class="column-count">{{ col.tasks.length }}</div>
      </div>
      <div class="column-body">
        <div v-for="task in col.tasks" :key="task.id" class="kanban-card-wrapper" :data-task-id="task.id">
          <TaskCard
            class="kanban-card"
            :task="task"
            :show-description="showDescription"
            @click="onCardClick"
            @edit="onCardEdit"
            @delete="onCardDelete"
            @status-change="onStatusChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kanban-board {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  width: 100%;
}
.kanban-column {
  flex: 1 1 0;
  min-width: 180px;
  background: var(--panel-bg);
  border: 1px solid var(--sidebar-border);
  border-radius: 10px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 220px);
  overflow: auto;
}
.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  margin-bottom: 0.5rem;
}
.column-title { font-weight: 600; font-size: 0.95rem }
.column-count { font-size: 0.85rem; color: var(--text-secondary) }
.column-body { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.25rem }

/* make sure TaskCard stretches minimally inside column */
.column-body ::v-deep .task-card { width: 100%; }

/* Compact variant for kanban cards: reduce padding, hide secondary details */
.kanban-card {
  padding: 0.5rem 0.75rem 0.5rem 1rem !important;
  margin-bottom: 0.5rem !important;
  border-radius: 6px !important;
  font-size: 0.92rem !important;
}

/* target internals of TaskCard (deep selector) to compact content */
.kanban-card ::v-deep .task-title { font-size: 0.92rem; font-weight: 600 }
.kanban-card ::v-deep .task-description { display: none }
.kanban-card ::v-deep .task-dates { display: none }
.kanban-card ::v-deep .task-tags { gap: 0.35rem }
.kanban-card ::v-deep .tag { padding: 0.125rem 0.45rem; font-size: 0.65rem }
.kanban-card ::v-deep .status-badge { padding: 0.2rem 0.5rem; font-size: 0.68rem }

/* draggable wrapper to allow native drag events while keeping TaskCard intact */
.kanban-card-wrapper { margin-bottom: 0.5rem }

/* keep column appearance simple when no drag-and-drop */
.kanban-column { transition: transform 180ms ease, box-shadow 180ms ease }

.kanban-column.drag-over-column {
  transform: translateY(-6px);
  box-shadow: 0 10px 30px rgba(2,6,23,0.06);
}

/* visual feedback for successful drop */
.drop-success {
  transform: scale(1.03) !important;
  box-shadow: 0 18px 40px rgba(2,6,23,0.12) !important;
  transition: transform 220ms ease, box-shadow 280ms ease !important;
}
.kanban-column.drop-highlight {
  outline: 2px solid rgba(99, 102, 241, 0.16);
  box-shadow: 0 8px 28px rgba(99,102,241,0.06);
  transition: outline 220ms ease, box-shadow 220ms ease;
}
</style>
