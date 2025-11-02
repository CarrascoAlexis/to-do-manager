<script setup lang="ts">
// DayTasks view
// Shows tasks whose deadline is today. Uses `loadTodayTasks` to fetch
// items and supports header-driven search/status filtering and sorting.
//
// Key handlers:
// - handleTaskClick -> opens TaskModal for the selected task
// - handleTaskEdit/delete/statusChange -> update persisted tasks
import { ref, onMounted, watch, computed } from 'vue'
import TaskCard from '../components/TaskCard.vue'
import TaskModal from '../components/TaskModal.vue'
import HeaderSection from '@/components/HeaderSection.vue'
import KanbanBoard from '@/components/KanbanBoard.vue'
import type { Task } from '../resources/tasks'
import { loadTodayTasks, saveAllTasks, loadTasks, Status } from '../resources/tasks'

const tasks = ref<Task[]>([])
const selectedTask = ref<Task | null>(null)
const isModalOpen = ref(false)
const selectedIsEdit = ref(false)

// Filter controls (status)
const filter = ref<{ status?: number; searchTerm?: string }>({})
const activeFilter = ref<number | 'all'>('all')

// Sorting controls
const sortBy = ref<'deadline' | 'createdAt' | 'updatedAt'>('deadline')
const sortOrder = ref<'asc' | 'desc'>('asc')
const view = ref<'list' | 'kanban'>('list')
const dateFilter = ref<'all' | 'overdue' | 'today' | 'soon' | 'future'>('all')
const filterAnim = ref(false)

const setStatusFilter = (status: number | 'all') => {
  activeFilter.value = status
  if (status === 'all') {
    filter.value = {}
  } else {
    filter.value = { status }
  }
  loadTasksData()
}

watch([sortBy, sortOrder], () => {
  loadTasksData()
})

const loadTasksData = () => {
  // load today's tasks then apply optional status filter and sorting
  let all = loadTodayTasks()

  // Apply searchTerm filter
  if (filter.value.searchTerm && filter.value.searchTerm.trim()) {
    const q = filter.value.searchTerm.toLowerCase()
    all = all.filter(t => (t.title + ' ' + (t.description || '')).toLowerCase().includes(q))
  }

  // Apply status filter
  if (filter.value.status !== undefined) {
    all = all.filter(t => t.status === filter.value.status)
  }

  // Sorting similar to loadTasksForHome
  const getTimeValue = (task: Task) => {
    const value = (task as any)[sortBy.value] as Date | undefined
    if (!value) return sortBy.value === 'deadline' ? Infinity : 0
    return value.getTime()
  }

  all.sort((a, b) => {
    const ta = getTimeValue(a)
    const tb = getTimeValue(b)
    const diff = ta - tb
    return sortOrder.value === 'asc' ? diff : -diff
  })

  tasks.value = all
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

onMounted(() => {
  // load saved view preference
  try {
    const saved = localStorage.getItem('tasks:viewMode')
    if (saved === 'kanban' || saved === 'list') view.value = saved
    const savedDate = localStorage.getItem('tasks:dateFilter')
    if (savedDate === 'all' || savedDate === 'overdue' || savedDate === 'today' || savedDate === 'soon' || savedDate === 'future') {
      dateFilter.value = savedDate as any
    }
  } catch (err) { /* ignore */ }
  loadTasksData()
})

const handleTaskClick = (task: Task) => {
  selectedTask.value = task
  isModalOpen.value = true
}

const openEditModal = (task: Task) => {
  selectedTask.value = task
  isModalOpen.value = true
  selectedIsEdit.value = true
}

const handleCloseModal = () => {
  isModalOpen.value = false
  selectedIsEdit.value = false
  setTimeout(() => {
    selectedTask.value = null
  }, 300) // Wait for animation to finish
}

const handleTaskEdit = (task: Task) => {
  console.log('Edit task:', task)
  // TODO: Implement edit functionality
  handleCloseModal()
}

const handleTaskDelete = (task: Task) => {
  console.log('Delete task:', task)
  const allTasks = loadTasks()
  const updatedTasks = allTasks.filter(t => t.id !== task.id)
  saveAllTasks(updatedTasks)
  loadTasksData()
  handleCloseModal()
}

const handleStatusChange = (task: Task, newStatus: number) => {
  console.log('Status change:', task, newStatus)
  const allTasks = loadTasks()
  const taskToUpdate = allTasks.find(t => t.id === task.id)
  if (taskToUpdate) {
    taskToUpdate.status = newStatus
    taskToUpdate.updatedAt = new Date()
    saveAllTasks(allTasks)
    loadTasksData()
  }
}

function onSearch(e: Event) {
  const v = (e.target as HTMLInputElement).value
  filter.value = { ...(filter.value || {}), searchTerm: v }
  loadTasksData()
}

function onUpdateSearchFromHeader(v: string) {
  filter.value = { ...(filter.value || {}), searchTerm: v }
  loadTasksData()
}

function onUpdateActiveFilter(v: number | 'all') {
  activeFilter.value = v
  setStatusFilter(v)
}

function onUpdateSortBy(v: 'deadline' | 'createdAt' | 'updatedAt') {
  sortBy.value = v
}

function onUpdateSortOrder(v: 'asc' | 'desc') {
  sortOrder.value = v
}

function onUpdateView(v: 'list' | 'kanban') {
  view.value = v
  try { localStorage.setItem('tasks:viewMode', v) } catch (err) { /* ignore */ }
}

function onUpdateDateFilter(v: 'all' | 'overdue' | 'today' | 'soon' | 'future') {
  dateFilter.value = v
  try { localStorage.setItem('tasks:dateFilter', v) } catch (err) { /* ignore */ }
  filterAnim.value = true
  setTimeout(() => { filterAnim.value = false }, 600)
}
</script>

<template>
  <!-- Day Tasks template: tasks due today with quick actions -->
  <div class="view-container">
    <HeaderSection
      titleIcon="calendar"
      :search="filter.searchTerm"
      :activeFilter="activeFilter"
      :sortBy="sortBy"
      :sortOrder="sortOrder"
  :dateFilter="dateFilter"
      statusMode="dropdown"
      :view="view"
      @update:search="onUpdateSearchFromHeader"
      @update:activeFilter="onUpdateActiveFilter"
      @update:sortBy="onUpdateSortBy"
      @update:sortOrder="onUpdateSortOrder"
        @update:view="onUpdateView"
        @update:dateFilter="onUpdateDateFilter"
    />

  <p v-if="tasks.length === 0" class="empty-message">No tasks due today. Enjoy your day!</p>
  <div v-else :class="{ 'filter-apply-anim': filterAnim }">
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
