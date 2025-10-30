<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TaskCard from '../components/TaskCard.vue'
import TaskModal from '../components/TaskModal.vue'
import type { Task } from '../resources/tasks'
import { loadTasks, saveAllTasks } from '../resources/tasks'

const tasks = ref<Task[]>([])
const searchQuery = ref('')
const selectedTask = ref<Task | null>(null)
const isModalOpen = ref(false)

const filteredTasks = computed(() => {
  if (!searchQuery.value.trim()) {
    return tasks.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return tasks.value.filter(task => {
    return (
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.id.toLowerCase().includes(query)
    )
  })
})

const loadTasksData = () => {
  tasks.value = loadTasks()
}

onMounted(() => {
  loadTasksData()
})

const handleTaskClick = (task: Task) => {
  selectedTask.value = task
  isModalOpen.value = true
}

const handleCloseModal = () => {
  isModalOpen.value = false
  setTimeout(() => {
    selectedTask.value = null
  }, 300)
}

const handleTaskEdit = (task: Task) => {
  console.log('Edit task:', task)
  // TODO: Implement edit functionality
  handleCloseModal()
}

const handleTaskDelete = (task: Task) => {
  console.log('Delete task:', task)
  const updatedTasks = tasks.value.filter(t => t.id !== task.id)
  saveAllTasks(updatedTasks)
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
  <div class="view-container">
    <h1>🔍 Research</h1>
    <p>Search and find your tasks.</p>

    <!-- Search Input -->
    <div class="search-section">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by title, description, or ID..."
        class="search-input"
      />
    </div>

    <div v-if="filteredTasks.length === 0" class="empty-message">
      <p v-if="searchQuery.trim()">No tasks found matching "{{ searchQuery }}"</p>
      <p v-else>No tasks available. Create your first task to get started!</p>
    </div>
    
    <div v-else class="tasks-list">
      <TaskCard
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        :show-description="true"
        @click="handleTaskClick"
        @edit="handleTaskEdit"
        @delete="handleTaskDelete"
        @status-change="handleStatusChange"
      />
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
