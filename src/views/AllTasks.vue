<script setup lang="ts">
// AllTasks view
// Shows every task in the system (includes archived and cancelled items).
// Reuses the same layout as Home so the format remains consistent.

import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { Task } from '@/resources/tasks'
import { loadTasks, saveAllTasks, Status } from '@/resources/tasks'
import TaskCard from '@/components/TaskCard.vue'
import TaskModal from '@/components/TaskModal.vue'
import HeaderSection from '@/components/HeaderSection.vue'

const tasks = ref<Task[]>([])
const selectedTask = ref<Task | null>(null)
const isModalOpen = ref(false)
const selectedIsEdit = ref(false)

const filter = ref<{ searchTerm?: string; status?: number }>({})
const activeFilter = ref<number | 'all'>('all')

// Sorting controls
const sortBy = ref<'deadline' | 'createdAt' | 'updatedAt'>('deadline')
const sortOrder = ref<'asc' | 'desc'>('asc')

const getTimeValue = (task: Task) => {
  const value = (task as any)[sortBy.value] as Date | undefined
  if (!value) return sortBy.value === 'deadline' ? Infinity : 0
  return value.getTime()
}

const loadTasksData = () => {
  const all = loadTasks()

  // Apply search filter
  const q = filter.value.searchTerm ? filter.value.searchTerm.trim().toLowerCase() : ''
  let filtered = all.filter(t => {
    const matchesSearch = q
      ? (t.title.toLowerCase().includes(q) || (t.description ? t.description.toLowerCase().includes(q) : false))
      : true
    const matchesStatus = (filter.value.status !== undefined) ? t.status === filter.value.status : true
    return matchesSearch && matchesStatus
  })

  // Sort
  filtered.sort((a, b) => {
    const ta = getTimeValue(a)
    const tb = getTimeValue(b)
    const diff = ta - tb
    return sortOrder.value === 'asc' ? diff : -diff
  })

  tasks.value = filtered
}

watch([sortBy, sortOrder], () => {
  loadTasksData()
})

function setStatusFilter(status: number | 'all') {
  activeFilter.value = status
  if (status === 'all') {
    filter.value = {}
  } else {
    filter.value = { status }
  }
  loadTasksData()
}

onMounted(() => {
  loadTasksData()
  window.addEventListener('tasks-updated', loadTasksData)
})

onUnmounted(() => {
  window.removeEventListener('tasks-updated', loadTasksData)
})

function handleTaskClick(task: Task) {
  selectedTask.value = task
  isModalOpen.value = true
}

function openEditModal(task: Task) {
  selectedTask.value = task
  isModalOpen.value = true
  selectedIsEdit.value = true
}

function handleCloseModal() {
  isModalOpen.value = false
  selectedIsEdit.value = false
  setTimeout(() => { selectedTask.value = null }, 300)
}

function handleTaskEdit(task: Task) {
  const idx = tasks.value.findIndex(t => t.id === task.id)
  if (idx !== -1) {
    tasks.value[idx] = { ...tasks.value[idx], ...task, updatedAt: new Date() }
    // persist: load full list, replace item and save all
    const all = loadTasks()
    const ai = all.findIndex(a => a.id === task.id)
    if (ai !== -1) {
      all[ai] = { ...all[ai], ...task, updatedAt: new Date() }
      saveAllTasks(all)
    }
    loadTasksData()
  }
  handleCloseModal()
}

function handleTaskDelete(task: Task) {
  const all = loadTasks()
  const updated = all.filter(t => t.id !== task.id)
  saveAllTasks(updated)
  loadTasksData()
  handleCloseModal()
}

function handleStatusChange(task: Task, newStatus: number) {
  const all = loadTasks()
  const toUpdate = all.find(t => t.id === task.id)
  if (toUpdate) {
    toUpdate.status = newStatus
    toUpdate.updatedAt = new Date()
    saveAllTasks(all)
    loadTasksData()
  }
}

function onUpdateSearch(v: string) {
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
</script>

<template>
  <div class="view-container">
    <HeaderSection
      title="📋 All Tasks"
      :search="filter.searchTerm"
      :activeFilter="activeFilter"
      :sortBy="sortBy"
      :sortOrder="sortOrder"
      statusMode="dropdown"
      @update:search="onUpdateSearch"
      @update:activeFilter="onUpdateActiveFilter"
      @update:sortBy="onUpdateSortBy"
      @update:sortOrder="onUpdateSortOrder"
      @update:view="(v) => console.log('View change:', v)"
    />

    <div class="tasks-section">
      <div v-if="tasks.length === 0" class="empty-state">
        <p>No tasks found.</p>
      </div>

      <div v-else class="tasks-list">
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
