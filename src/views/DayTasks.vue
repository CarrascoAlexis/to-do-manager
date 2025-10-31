<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TaskCard from '../components/TaskCard.vue'
import TaskModal from '../components/TaskModal.vue'
import type { Task } from '../resources/tasks'
import { loadTodayTasks, saveAllTasks, loadTasks } from '../resources/tasks'

const tasks = ref<Task[]>([])
const selectedTask = ref<Task | null>(null)
const isModalOpen = ref(false)

const loadTasksData = () => {
  tasks.value = loadTodayTasks()
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
</script>

<template>
  <div class="view-container">
  <h1>📅 Today's Tasks</h1>
  <p v-if="tasks.length === 0" class="empty-message">No tasks due today. Enjoy your day! 🎉</p>
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
