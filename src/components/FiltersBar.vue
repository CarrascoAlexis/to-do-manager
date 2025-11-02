<script setup lang="ts">
/**
 * FiltersBar Component
 * 
 * A configurable filter and sort controls bar for task lists.
 * Provides status filtering, date filtering, and sorting options.
 * Can be configured to show/hide specific controls and switch between
 * button or dropdown mode for status filtering.
 * 
 * Features:
 * - Status filtering (All, To Do, In Progress, Done, Cancelled)
 * - Date-based filtering (All, Overdue, Today, Soon, Future)
 * - Sort controls (by deadline, created date, updated date, ascending/descending)
 * - Flexible display modes (buttons vs dropdowns)
 * - Optional sections (can hide status, date, or sort controls)
 * 
 * @component
 * @example
 * ```vue
 * <FiltersBar
 *   :activeFilter="currentFilter"
 *   :sortBy="sortField"
 *   :sortOrder="sortDirection"
 *   :showStatus="true"
 *   :showDateFilter="true"
 *   :showSort="true"
 *   :statusMode="'dropdown'"
 *   :dateFilter="dateRange"
 *   @update:activeFilter="handleFilterChange"
 *   @update:sortBy="handleSortChange"
 *   @update:sortOrder="handleOrderChange"
 *   @update:dateFilter="handleDateFilterChange"
 * />
 * ```
 */

import { defineProps, defineEmits } from 'vue'

/**
 * Component props
 */
const props = defineProps({
  /** Active status filter (number for status ID, 'all' for all tasks) */
  activeFilter: { type: [Number, String], default: 'all' },
  /** Field to sort tasks by */
  sortBy: { type: String as () => 'deadline' | 'createdAt' | 'updatedAt', default: 'deadline' },
  /** Sort direction */
  sortOrder: { type: String as () => 'asc' | 'desc', default: 'asc' },
  /** Whether to show the status filter section */
  showStatus: { type: Boolean, default: true },
  /** Whether to show the date filter section */
  showDateFilter: { type: Boolean, default: false },
  /** Active date filter */
  dateFilter: { type: String as () => 'all' | 'overdue' | 'today' | 'soon' | 'future', default: 'all' },
  /** Whether to show the sort section */
  showSort: { type: Boolean, default: true },
  /** Display mode for status filter (buttons or dropdown) */
  statusMode: { type: String as () => 'buttons' | 'dropdown', default: 'dropdown' }
})

/**
 * Component events
 * 
 * @event update:activeFilter - Emitted when status filter changes
 * @event update:sortBy - Emitted when sort field changes
 * @event update:sortOrder - Emitted when sort direction changes
 * @event update:dateFilter - Emitted when date filter changes
 */
const emit = defineEmits([
  'update:activeFilter',
  'update:sortBy',
  'update:sortOrder'
  ,'update:dateFilter'
])

// ==========================================
// Event Handlers
// ==========================================

/**
 * Updates the active status filter when a status button is clicked.
 * 
 * @param status - The status to filter by (0-3) or 'all'
 */
function setStatus(status: number | 'all') {
  emit('update:activeFilter', status)
}

/**
 * Handles status selection from the dropdown.
 * Converts string value to number or 'all'.
 * 
 * @param e - Change event from select element
 */
function onStatusSelect(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  emit('update:activeFilter', val === 'all' ? 'all' : Number(val))
}

/**
 * Updates both sort field and order from a combined dropdown value.
 * The dropdown value format is "field|order" (e.g., "deadline|asc").
 * 
 * @param e - Change event from select element
 */
function updateSortCombined(e: Event) {
  const val = (e.target as HTMLSelectElement).value as string
  const [by, order] = val.split('|') as [string, string]
  emit('update:sortBy', by as any)
  emit('update:sortOrder', (order as any))
}

/**
 * Handles date filter selection from the dropdown.
 * 
 * @param e - Change event from select element
 */
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
        <select :value="activeFilter" @change="onStatusSelect" aria-label="Filter tasks by status">
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
