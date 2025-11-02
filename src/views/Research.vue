<script setup lang="ts">
// Research view
// A lightweight listing view focused on searching and exploring tasks.
// It mirrors the header controls for search and status filtering but
// uses a computed `filteredTasks` list to apply search and filters locally.
//
// Key behavior:
// - onSearch / onUpdateSearchFromHeader update filter state
// - handleTaskClick opens the TaskModal for inspection
// - openEditModal opens the modal ready for editing
import { ref, computed, onMounted, onUnmounted } from 'vue'
import TaskCard from '../components/TaskCard.vue'
import TaskModal from '../components/TaskModal.vue'
import HeaderSection from '@/components/HeaderSection.vue'
import KanbanBoard from '@/components/KanbanBoard.vue'
import type { Task } from '../resources/tasks'
import { loadTasks, saveAllTasks } from '../resources/tasks'

const tasks = ref<Task[]>([])
const searchQuery = ref('')
const filter = ref<{ status?: number; searchTerm?: string }>({})
const activeFilter = ref<number | 'all'>('all')
const sortBy = ref<'deadline' | 'createdAt' | 'updatedAt'>('deadline')
const sortOrder = ref<'asc' | 'desc'>('asc')
const view = ref<'list' | 'kanban'>('list')
const dateFilter = ref<'all' | 'overdue' | 'today' | 'soon' | 'future'>('all')
const filterAnim = ref(false)
const selectedTask = ref<Task | null>(null)
const isModalOpen = ref(false)
const selectedIsEdit = ref(false)

const filteredTasks = computed(() => {
  let list = tasks.value

  // searchQuery priority
  if (searchQuery.value && searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    list = list.filter(task => {
      return (
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.id.toLowerCase().includes(query)
      )
    })
  }

  // apply status filter if provided
  if (filter.value.status !== undefined) {
    list = list.filter(t => t.status === filter.value.status)
  }

  // TODO: apply sort if needed (research view currently doesn't require it)
  return list
})

const kanbanTasks = computed(() => {
  if (view.value !== 'kanban') return filteredTasks.value
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

const loadTasksData = () => {
  tasks.value = loadTasks()
}

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
  window.addEventListener('tasks-updated', loadTasksData)
})

onUnmounted(() => {
  window.removeEventListener('tasks-updated', loadTasksData)
})

function onSearch(e: Event) {
  const v = (e.target as HTMLInputElement).value
  searchQuery.value = v
  filter.value = { ...(filter.value || {}), searchTerm: v }
}

function onUpdateSearchFromHeader(v: string) {
  searchQuery.value = v
  filter.value = { ...(filter.value || {}), searchTerm: v }
}

function onUpdateActiveFilter(v: number | 'all') {
  activeFilter.value = v
  if (v === 'all') {
    filter.value = { ...(filter.value || {}), status: undefined }
  } else {
    filter.value = { ...(filter.value || {}), status: v }
  }
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
  }, 300)
}

const handleTaskEdit = (task: Task) => {
  console.log('Save edited task:', task)
  const idx = tasks.value.findIndex(t => t.id === task.id)
  if (idx !== -1) {
    tasks.value[idx] = { ...tasks.value[idx], ...task, updatedAt: new Date() }
    saveAllTasks(tasks.value)
    loadTasksData()
  }
  handleCloseModal()
}

const handleTaskDelete = (task: Task) => {
  console.log('Delete task:', task)
  // Remove from the persistent store rather than only the filtered in-memory list
  const all = loadTasks()
  const updated = all.filter(t => t.id !== task.id)
  saveAllTasks(updated)
  loadTasksData()
  handleCloseModal()
}

const handleStatusChange = (task: Task, newStatus: number) => {
  console.log('Status change:', task, newStatus)
  const taskToUpdate = tasks.value.find(t => t.id === task.id)
  if (taskToUpdate) {
    taskToUpdate.status = newStatus
    taskToUpdate.updatedAt = new Date()
    saveAllTasks(tasks.value)
    loadTasksData()
  }
}
</script>

<template>
  <!-- Research view template: search-first view showing filtered results -->
  <div class="view-container">
    <HeaderSection
      titleIcon="search"
      :search="searchQuery"
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

    <div v-if="filteredTasks.length === 0" class="empty-message">
      <p v-if="searchQuery.trim()">No tasks found matching "{{ searchQuery }}"</p>
      <p v-else>No tasks available. Create your first task to get started!</p>
    </div>
    
  <div v-else :class="{ 'filter-apply-anim': filterAnim }">
      <div v-if="view === 'list'" class="tasks-list">
        <TaskCard
          v-for="task in filteredTasks"
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
