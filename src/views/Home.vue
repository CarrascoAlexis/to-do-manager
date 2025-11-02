<script setup lang="ts">
/**
 * Home View
 * Main task list view with filtering, sorting, and view mode controls
 */
import { ref, computed } from 'vue'
import type { Task } from '@/composables/tasks'
import { loadTasksForHome, loadTasks } from '@/composables/tasks'
import TaskCard from '@/components/TaskCard.vue'
import TaskModal from '@/components/TaskModal.vue'
import HeaderSection from '@/components/HeaderSection.vue'
import KanbanBoard from '@/components/KanbanBoard.vue'
import { useTaskManagement } from '@/composables/useTaskManagement'
import { useHeaderControls } from '@/composables/useHeaderControls'

const tasks = ref<Task[]>([])

// Load tasks data
const loadTasksData = () => {
  tasks.value = loadTasksForHome(filter.value, sortBy.value, sortOrder.value)
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
