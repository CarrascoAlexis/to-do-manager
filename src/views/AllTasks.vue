<script setup lang="ts">
/**
 * AllTasks View
 * Shows all tasks in the system (including archived and cancelled)
 */
import { ref, computed } from 'vue'
import type { Task } from '@/composables/tasks'
import { loadTasks } from '@/composables/tasks'
import TaskCard from '@/components/TaskCard.vue'
import TaskModal from '@/components/TaskModal.vue'
import HeaderSection from '@/components/HeaderSection.vue'
import KanbanBoard from '@/components/KanbanBoard.vue'
import { useTaskManagement } from '@/composables/useTaskManagement'
import { useHeaderControls } from '@/composables/useHeaderControls'

const tasks = ref<Task[]>([])

// Load and filter tasks
const loadTasksData = () => {
  const all = loadTasks()
  const q = filter.value.searchTerm ? filter.value.searchTerm.trim().toLowerCase() : ''
  
  let filtered = all.filter(t => {
    const matchesSearch = q
      ? (t.title.toLowerCase().includes(q) || (t.description ? t.description.toLowerCase().includes(q) : false))
      : true
    const matchesStatus = (filter.value.status !== undefined) ? t.status === filter.value.status : true
    return matchesSearch && matchesStatus
  })

  // Apply sorting
  const getTimeValue = (task: Task) => {
    const value = (task as any)[sortBy.value] as Date | undefined
    if (!value) return sortBy.value === 'deadline' ? Infinity : 0
    return value.getTime()
  }

  filtered.sort((a, b) => {
    const ta = getTimeValue(a)
    const tb = getTimeValue(b)
    const diff = ta - tb
    return sortOrder.value === 'asc' ? diff : -diff
  })

  tasks.value = filtered
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
  <div class="view-container">
    <HeaderSection
      titleIcon="list"
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
      <div v-if="tasks.length === 0" class="empty-state">
        <p>No tasks found.</p>
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
