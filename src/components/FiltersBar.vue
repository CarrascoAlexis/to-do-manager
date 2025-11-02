<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  activeFilter: { type: [Number, String], default: 'all' },
  sortBy: { type: String as () => 'deadline' | 'createdAt' | 'updatedAt', default: 'deadline' },
  sortOrder: { type: String as () => 'asc' | 'desc', default: 'asc' },
  showStatus: { type: Boolean, default: true },
  showDateFilter: { type: Boolean, default: false },
  dateFilter: { type: String as () => 'all' | 'overdue' | 'today' | 'soon' | 'future', default: 'all' },
  showSort: { type: Boolean, default: true },
  statusMode: { type: String as () => 'buttons' | 'dropdown', default: 'dropdown' }
})

const emit = defineEmits([
  'update:activeFilter',
  'update:sortBy',
  'update:sortOrder'
  ,'update:dateFilter'
])

function setStatus(status: number | 'all') {
  emit('update:activeFilter', status)
}

function onStatusSelect(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  emit('update:activeFilter', val === 'all' ? 'all' : Number(val))
}

function updateSortCombined(e: Event) {
  const val = (e.target as HTMLSelectElement).value as string
  const [by, order] = val.split('|') as [string, string]
  emit('update:sortBy', by as any)
  emit('update:sortOrder', (order as any))
}

function onDateSelect(e: Event) {
  const val = (e.target as HTMLSelectElement).value as any
  emit('update:dateFilter', val)
}
</script>

<template>
  <div class="controls-row">
  <div v-if="showStatus" class="filter-section">
      <template v-if="statusMode === 'buttons'">
        <button :class="['filter-btn', { active: activeFilter === 'all' }]" @click="setStatus('all')">All</button>
        <button :class="['filter-btn', { active: activeFilter === 0 }]" @click="setStatus(0)">To Do</button>
        <button :class="['filter-btn', { active: activeFilter === 1 }]" @click="setStatus(1)">In Progress</button>
        <button :class="['filter-btn', { active: activeFilter === 2 }]" @click="setStatus(2)">Done</button>
        <button :class="['filter-btn', { active: activeFilter === 3 }]" @click="setStatus(3)">Cancelled</button>
      </template>
      <template v-else>
        <select :value="activeFilter" @change="onStatusSelect">
          <option value="all">All</option>
          <option value="0">To Do</option>
          <option value="1">In Progress</option>
          <option value="2">Done</option>
          <option value="3">Cancelled</option>
        </select>
      </template>
    </div>

    <div v-if="showDateFilter" class="filter-section">
      <label for="date-filter-select">Date</label>
      <select id="date-filter-select" :value="dateFilter" @change="onDateSelect">
        <option value="all">All dates</option>
        <option value="overdue">Overdue</option>
        <option value="today">Today</option>
        <option value="soon">Soon (≤3 days)</option>
        <option value="future">Future</option>
      </select>
    </div>

    <div v-if="showSort" class="sort-section">
      <label for="sort-select">Sort</label>
      <select id="sort-select" :value="`${sortBy}|${sortOrder}`" @change="updateSortCombined">
        <option value="deadline|asc">Deadline ↑</option>
        <option value="deadline|desc">Deadline ↓</option>
        <option value="createdAt|asc">Creation date ↑</option>
        <option value="createdAt|desc">Creation date ↓</option>
        <option value="updatedAt|asc">Edit date ↑</option>
        <option value="updatedAt|desc">Edit date ↓</option>
      </select>
    </div>
  </div>
</template>

<style src="../styles/filters-bar.css" scoped></style>
