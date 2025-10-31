<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Task } from '@/resources/tasks'
import { loadTasksForHome, saveAllTasks } from '@/resources/tasks'
import TaskCard from '@/components/TaskCard.vue'
import TaskModal from '@/components/TaskModal.vue'

const tasks = ref<Task[]>([])
const selectedTask = ref<Task | null>(null)
const isModalOpen = ref(false)

const filter = ref<{ searchTerm?: string; status?: number }>({})
const activeFilter = ref<number | 'all'>('all')

// Sorting controls
const sortBy = ref<'deadline' | 'createdAt' | 'updatedAt'>('deadline')
const sortOrder = ref<'asc' | 'desc'>('asc')

const loadTasksData = () => {
  tasks.value = loadTasksForHome(filter.value, sortBy.value, sortOrder.value)
}

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

// Event handlers
function handleTaskClick(task: Task) {
  selectedTask.value = task
  isModalOpen.value = true
}

function handleCloseModal() {
  isModalOpen.value = false
  setTimeout(() => {
    selectedTask.value = null
  }, 300) // Wait for animation to finish
}

function handleTaskEdit(task: Task) {
  console.log('Edit task:', task)
  // TODO: Open edit modal/form
  handleCloseModal()
}

function handleTaskDelete(task: Task) {
  console.log('Delete task:', task)
  const updatedTasks = tasks.value.filter(t => t.id !== task.id)
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
</script>

<template>
  <div class="view-container">
    <div class="header-section">
      <h1>🏠 Home</h1>
      <p>Welcome to your task manager!</p>
    </div>

    <!-- Controls: Filter buttons and Sort controls (responsive wrapper) -->
    <div class="controls-row">
      <div class="filter-section">
        <button 
          :class="['filter-btn', { active: activeFilter === 'all' }]"
          @click="setStatusFilter('all')"
        >
          All
        </button>
        <button 
          :class="['filter-btn', { active: activeFilter === 0 }]"
          @click="setStatusFilter(0)"
        >
          To Do
        </button>
        <button 
          :class="['filter-btn', { active: activeFilter === 1 }]"
          @click="setStatusFilter(1)"
        >
          In Progress
        </button>
        <button 
          :class="['filter-btn', { active: activeFilter === 2 }]"
          @click="setStatusFilter(2)"
        >
          Done
        </button>
        <button 
          :class="['filter-btn', { active: activeFilter === 3 }]"
          @click="setStatusFilter(3)"
        >
          Cancelled
        </button>
      </div>

      <div class="sort-section">
        <label for="sort-field">Sort by</label>
        <select id="sort-field" v-model="sortBy">
          <option value="deadline">Deadline</option>
          <option value="createdAt">Creation date</option>
          <option value="updatedAt">Edit date</option>
        </select>

        <label for="sort-order">Order</label>
        <select id="sort-order" v-model="sortOrder">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        <!-- Apply is now automatic when selects change -->
      </div>
    </div>

    <div class="tasks-section">
          <!-- Apply is now automatic when selects change -->
      <div class="sort-info">Currently sorting by <strong>{{ sortBy }}</strong> (<em>{{ sortOrder }}</em>)</div>
      <div v-if="tasks.length === 0" class="empty-state">
        <p v-if="activeFilter === 'all'">No tasks yet. Create your first task to get started!</p>
        <p v-else>No tasks found with this status filter.</p>
      </div>

      <div v-else class="tasks-list">
        <TaskCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          :show-description="true"
          @click="handleTaskClick"
          @edit="handleTaskEdit"
          @delete="handleTaskDelete"
          @status-change="handleStatusChange"
        />
      </div>
    </div>

    <!-- Task Modal -->
    <TaskModal
      :task="selectedTask"
      :is-open="isModalOpen"
      @close="handleCloseModal"
      @edit="handleTaskEdit"
      @delete="handleTaskDelete"
      @status-change="handleStatusChange"
    />
  </div>
</template>

<style src="../styles/views.css" scoped></style>
