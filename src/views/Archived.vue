<script setup lang="ts">
/**
 * Archived View
 * Displays tasks in archived status
 */
import { ref } from 'vue'
import TaskModal from '../components/TaskModal.vue'
import type { Task } from '../composables/tasks'
import { loadArchivedTasks } from '../composables/tasks'
import { useTaskManagement } from '@/composables/useTaskManagement'

const tasks = ref<Task[]>([])

// Load tasks data
const loadTasksData = () => {
  tasks.value = loadArchivedTasks()
}

// Use composable for shared logic
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

// Format date helper
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

// Initial load
loadTasksData()
</script>

<template>
  <!-- Archived tasks template: simple list view -->
  <div class="view-container">
    <div class="header-section">
      <h1>📦 Archived</h1>
      <p>View your archived tasks.</p>
    </div>

    <p v-if="tasks.length === 0" class="empty-message">No archived tasks. Tasks you archive will appear here.</p>
    
    <div v-else class="archived-list">
      <div 
        v-for="task in tasks" 
        :key="task.id" 
        class="archived-item"
        @click="handleTaskClick(task)"
      >
        <div class="archived-item-header">
          <h3 class="archived-item-title">{{ task.title }}</h3>
          <span class="archived-item-date">
            Archived: {{ formatDate(task.updatedAt) }}
          </span>
        </div>
        <p v-if="task.description" class="archived-item-description">
          {{ task.description }}
        </p>
        <div v-if="task.deadline" class="archived-item-deadline">
          Original deadline: {{ formatDate(task.deadline) }}
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

<style scoped>
.archived-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.archived-item {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.archived-item:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.archived-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.archived-item-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
  flex: 1;
}

.archived-item-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.archived-item-description {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 0.75rem 0;
}

.archived-item-deadline {
  font-size: 0.875rem;
  color: var(--text-secondary);
  padding: 0.5rem;
  background: var(--hover-bg);
  border-radius: 6px;
  display: inline-block;
}

/* Responsive */
@media (max-width: 768px) {
  .archived-item-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .archived-item-date {
    align-self: flex-start;
  }
}
</style>
