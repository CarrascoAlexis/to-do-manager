<script setup lang="ts">
/**
 * DayTasks View
 * Displays tasks with deadlines due today
 */
import { ref, computed } from 'vue'
import TaskCard from '../components/TaskCard.vue'
import TaskModal from '../components/TaskModal.vue'
import HeaderSection from '@/components/HeaderSection.vue'
import KanbanBoard from '@/components/KanbanBoard.vue'
import type { Task } from '../composables/tasks'
import { loadTodayTasks, loadTasks } from '../composables/tasks'
import { useTaskManagement } from '@/composables/useTaskManagement'
import { useHeaderControls } from '@/composables/useHeaderControls'

const tasks = ref<Task[]>([])

// Load tasks data with filtering and sorting
const loadTasksData = () => {
  let all = loadTodayTasks()

  // Apply search filter
  if (filter.value.searchTerm && filter.value.searchTerm.trim()) {
    const q = filter.value.searchTerm.toLowerCase()
    all = all.filter(t => (t.title + ' ' + (t.description || '')).toLowerCase().includes(q))
  }

  // Apply status filter
  if (filter.value.status !== undefined) {
    all = all.filter(t => t.status === filter.value.status)
  }

  // Apply sorting
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

// Use composables for shared logic
const {
  selectedTask,
  isModalOpen,
  selectedIsEdit,
  handleTaskClick,
  openEditModal,
  handleCloseModal,
  handleTaskEdit,
  handleTaskDelete,
  handleStatusChange
} = useTaskManagement(loadTasksData)

const {
  filter,
  activeFilter,
  sortBy,
  sortOrder,
  view,
  dateFilter,
  filterAnim,
  onUpdateSearch,
  onUpdateActiveFilter,
  onUpdateSortBy,
  onUpdateSortOrder,
  onUpdateView,
  onUpdateDateFilter
} = useHeaderControls(loadTasksData)

// Kanban view filtering
const kanbanTasks = computed(() => {
  if (view.value !== 'kanban') return tasks.value
  const all = loadTasks()
  if (dateFilter.value === 'all') return all
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return all.filter(t => {
    if (!t.deadline) return false
    const dd = new Date(t.deadline)
    dd.setHours(0, 0, 0, 0)
    const diff = Math.ceil((dd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (dateFilter.value === 'overdue') return diff < 0
    if (dateFilter.value === 'today') return diff === 0
    if (dateFilter.value === 'soon') return diff > 0 && diff <= 3
    if (dateFilter.value === 'future') return diff > 3
    return true
  })
})

// Initial load
loadTasksData()
</script>

<template>
  <!-- Day Tasks template: tasks due today with quick actions -->
  <div class="view-container">
    <HeaderSection
      titleIcon="calendar"
      :search="filter.searchTerm || ''"
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
