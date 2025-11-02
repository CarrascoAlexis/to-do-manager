<script setup lang="ts">
// Home view
// This view shows the main task list for the user (Home). It wires
// header controls (search, status filter, sorting) to local state and
// loads tasks using `loadTasksForHome`. Clicking a task opens the
// `TaskModal` for viewing (or editing via modal actions).
//
// Key bindings:
// - handleTaskClick(task) -> open modal for task
// - openEditModal(task) -> open modal pre-filled for editing
// - handleTaskEdit(task) -> save edited task back to storage
// - header emits update:search / update:activeFilter / update:sortBy / update:sortOrder
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import type { Task } from '@/resources/tasks'
import { loadTasksForHome, saveAllTasks, loadTasks } from '@/resources/tasks'
import TaskCard from '@/components/TaskCard.vue'
import TaskModal from '@/components/TaskModal.vue'
import HeaderSection from '@/components/HeaderSection.vue'
import KanbanBoard from '@/components/KanbanBoard.vue'

const tasks = ref<Task[]>([])
const selectedTask = ref<Task | null>(null)
const isModalOpen = ref(false)
const selectedIsEdit = ref(false)

const filter = ref<{ searchTerm?: string; status?: number }>({})
const activeFilter = ref<number | 'all'>('all')

// Sorting controls
const sortBy = ref<'deadline' | 'createdAt' | 'updatedAt'>('deadline')
const sortOrder = ref<'asc' | 'desc'>('asc')
const view = ref<'list' | 'kanban'>('list')
const dateFilter = ref<'all' | 'overdue' | 'today' | 'soon' | 'future'>('all')
const filterAnim = ref(false)

const loadTasksData = () => {
  tasks.value = loadTasksForHome(filter.value, sortBy.value, sortOrder.value)
}

const kanbanTasks = computed(() => {
  if (view.value !== 'kanban') return tasks.value
  const all = loadTasks()
  if (dateFilter.value === 'all') return all
  const now = new Date(); now.setHours(0,0,0,0)
  return all.filter(t => {
    if (!t.deadline) return false
    const dd = new Date(t.deadline); dd.setHours(0,0,0,0)
    const diff = Math.ceil((dd.getTime() - now.getTime()) / (1000*60*60*24))
    if (dateFilter.value === 'overdue') return diff < 0
    if (dateFilter.value === 'today') return diff === 0
    if (dateFilter.value === 'soon') return diff > 0 && diff <= 3
    if (dateFilter.value === 'future') return diff > 3
    return true
  })
})

// Auto-apply sorting when control values change
watch([sortBy, sortOrder], () => {
  loadTasksData()
})

const setStatusFilter = (status: number | 'all') => {
  activeFilter.value = status
  if (status === 'all') {
    filter.value = {}
  } else {
    filter.value = { status }
  }
  loadTasksData()
}

loadTasksData()

onMounted(() => {
  // load saved view preference from localStorage
  try {
    const saved = localStorage.getItem('tasks:viewMode')
    if (saved === 'kanban' || saved === 'list') view.value = saved
    const savedDate = localStorage.getItem('tasks:dateFilter')
    if (savedDate === 'all' || savedDate === 'overdue' || savedDate === 'today' || savedDate === 'soon' || savedDate === 'future') {
      dateFilter.value = savedDate as any
    }
  } catch (err) { /* ignore */ }
  window.addEventListener('tasks-updated', loadTasksData)
})

onUnmounted(() => {
  window.removeEventListener('tasks-updated', loadTasksData)
})

// Event handlers
function handleTaskClick(task: Task) {
  selectedTask.value = task
  isModalOpen.value = true
}

function openEditModal(task: Task) {
  // Open the modal pre-filled for editing when the card's Edit button is clicked
  selectedTask.value = task
  isModalOpen.value = true
  selectedIsEdit.value = true
}

function handleCloseModal() {
  isModalOpen.value = false
  selectedIsEdit.value = false
  setTimeout(() => {
    selectedTask.value = null
  }, 300) // Wait for animation to finish
}

function handleTaskEdit(task: Task) {
  // Save edited task back to storage and refresh list
  console.log('Save edited task:', task)
  const idx = tasks.value.findIndex(t => t.id === task.id)
  if (idx !== -1) {
    tasks.value[idx] = { ...tasks.value[idx], ...task, updatedAt: new Date() }
    saveAllTasks(tasks.value)
    loadTasksData()
  }
  handleCloseModal()
}

function handleTaskDelete(task: Task) {
  console.log('Delete task:', task)
  // Ensure we remove the task from the full stored task list (not only the currently-visible filtered list)
  const all = loadTasks()
  const updatedTasks = all.filter(t => t.id !== task.id)
  saveAllTasks(updatedTasks)
  loadTasksData()
  handleCloseModal()
}

function handleStatusChange(task: Task, newStatus: number) {
  console.log('Status change:', task, newStatus)
  const taskToUpdate = tasks.value.find(t => t.id === task.id)
  if (taskToUpdate) {
    taskToUpdate.status = newStatus
    taskToUpdate.updatedAt = new Date()
    saveAllTasks(tasks.value)
    loadTasksData()
  }
}

// typed handlers for header control events (avoid implicit any in templates)
function onUpdateSearch(v: string) {
  // ensure filter.value exists and update searchTerm
  filter.value = { ...(filter.value || {}), searchTerm: v }
  // reload tasks immediately when search changes
  loadTasksData()
}

function onUpdateActiveFilter(v: number | 'all') {
  activeFilter.value = v
  setStatusFilter(v)
}

function onUpdateSortBy(v: 'deadline' | 'createdAt' | 'updatedAt') {
  sortBy.value = v
  // watch on [sortBy, sortOrder] will reload
}

function onUpdateSortOrder(v: 'asc' | 'desc') {
  sortOrder.value = v
  // watch on [sortBy, sortOrder] will reload
}

function onUpdateView(v: 'list' | 'kanban') {
  view.value = v
  try { localStorage.setItem('tasks:viewMode', v) } catch (err) { /* ignore */ }
}

function onUpdateDateFilter(v: 'all' | 'overdue' | 'today' | 'soon' | 'future') {
  dateFilter.value = v
  try { localStorage.setItem('tasks:dateFilter', v) } catch (err) { /* ignore */ }
  // trigger a brief animation on the list to indicate the filter was applied
  filterAnim.value = true
  setTimeout(() => { filterAnim.value = false }, 600)
}
</script>

<template>
  <!-- Home view template: lists tasks and includes the shared HeaderSection -->
  <div class="view-container">
    <HeaderSection
      titleIcon="home"
      :search="filter.searchTerm"
      :activeFilter="activeFilter"
      :sortBy="sortBy"
      :sortOrder="sortOrder"
      :dateFilter="dateFilter"
      statusMode="dropdown"
      :view="view"
      @update:search="onUpdateSearch"
      @update:activeFilter="onUpdateActiveFilter"
      @update:sortBy="onUpdateSortBy"
      @update:sortOrder="onUpdateSortOrder"
      @update:view="onUpdateView"
      @update:dateFilter="onUpdateDateFilter"
    />

  <div class="tasks-section" :class="{ 'filter-apply-anim': filterAnim }">
      <!-- Apply is now automatic when selects change -->
      <div v-if="tasks.length === 0" class="empty-state">
        <p v-if="activeFilter === 'all'">No tasks yet. Create your first task to get started!</p>
        <p v-else>No tasks found with this status filter.</p>
      </div>

      <div v-else>
        <div v-if="view === 'list'" class="tasks-list">
          <TaskCard
            v-for="task in tasks"
            :key="task.id"
            :task="task"
            :show-description="true"
            @click="handleTaskClick"
            @edit="openEditModal"
            @delete="handleTaskDelete"
            @status-change="handleStatusChange"
          />
        </div>

        <div v-else>
          <KanbanBoard
            :tasks="kanbanTasks"
            :show-description="true"
            @click="handleTaskClick"
            @edit="openEditModal"
            @delete="handleTaskDelete"
            @status-change="handleStatusChange"
          />
        </div>
      </div>
    </div>

    <!-- Task Modal -->
    <TaskModal
      :task="selectedTask"
      :is-open="isModalOpen"
      :open-in-edit="selectedIsEdit"
      @close="handleCloseModal"
      @edit="handleTaskEdit"
      @delete="handleTaskDelete"
      @status-change="handleStatusChange"
    />
  </div>
</template>

<style src="../styles/views.css" scoped></style>
