<script setup lang="ts">
/**
 * Research View
 * Search-focused view for exploring and finding tasks
 */
import { ref, computed } from 'vue'
import TaskCard from '../components/TaskCard.vue'
import TaskModal from '../components/TaskModal.vue'
import HeaderSection from '@/components/HeaderSection.vue'
import KanbanBoard from '@/components/KanbanBoard.vue'
import type { Task } from '../composables/tasks'
import { loadTasks } from '../composables/tasks'
import { useTaskManagement } from '@/composables/useTaskManagement'
import { useHeaderControls } from '@/composables/useHeaderControls'

const tasks = ref<Task[]>([])

// Load tasks data
const loadTasksData = () => {
  tasks.value = loadTasks()
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
} = useHeaderControls()

// Client-side filtering for search
const filteredTasks = computed(() => {
  let list = tasks.value

  // Apply search term
  if (filter.value.searchTerm && filter.value.searchTerm.trim()) {
    const query = filter.value.searchTerm.toLowerCase()
    list = list.filter(task => {
      return (
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.id.toLowerCase().includes(query)
      )
    })
  }

  // Apply status filter
  if (filter.value.status !== undefined) {
    list = list.filter(t => t.status === filter.value.status)
  }

  return list
})

// Kanban view filtering
const kanbanTasks = computed(() => {
  if (view.value !== 'kanban') return filteredTasks.value
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
  <!-- Research view template: search-first view showing filtered results -->
  <div class="view-container">
    <HeaderSection
      titleIcon="search"
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

    <div v-if="filteredTasks.length === 0" class="empty-message">
      <p v-if="filter.searchTerm && filter.searchTerm.trim()">No tasks found matching "{{ filter.searchTerm }}"</p>
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
