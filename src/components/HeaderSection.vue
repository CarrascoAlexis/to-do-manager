<script setup lang="ts">
/**
 * HeaderSection Component
 * 
 * Wrapper component for the page header that contains all task filtering,
 * sorting, and view mode controls. Acts as a pass-through component that
 * forwards props and events to the HeaderControls component.
 * 
 * Features:
 * - Search functionality
 * - Status filtering (all tasks, by status, etc.)
 * - Date-based filtering (overdue, today, soon, future)
 * - Sort controls (by deadline, created date, updated date)
 * - View mode toggle (list vs kanban)
 * - Custom title icon support
 * 
 * @component
 * @example
 * ```vue
 * <HeaderSection
 *   :search="searchTerm"
 *   :activeFilter="currentFilter"
 *   :sortBy="sortField"
 *   :sortOrder="sortDirection"
 *   :view="viewMode"
 *   :dateFilter="dateRange"
 *   :titleIcon="iconName"
 *   @update:search="handleSearch"
 *   @update:activeFilter="handleFilterChange"
 *   @update:sortBy="handleSortChange"
 *   @update:sortOrder="handleOrderChange"
 *   @update:view="handleViewChange"
 *   @update:dateFilter="handleDateFilterChange"
 * />
 * ```
 */

import HeaderControls from './HeaderControls.vue'
import { defineProps, defineEmits } from 'vue'

/**
 * Component props
 */
const props = defineProps({
  /** Search query string for filtering tasks */
  search: { type: String, default: '' },
  /** Active status filter (number for status ID, 'all' for all tasks) */
  activeFilter: { type: [Number, String], default: 'all' },
  /** Field to sort tasks by */
  sortBy: { type: String as () => 'deadline' | 'createdAt' | 'updatedAt', default: 'deadline' },
  /** Sort direction */
  sortOrder: { type: String as () => 'asc' | 'desc', default: 'asc' },
  /** Status filter display mode */
  statusMode: { type: String as () => 'buttons' | 'dropdown', default: 'dropdown' },
  /** View mode for task display */
  view: { type: String as () => 'list' | 'kanban', default: 'list' },
  /** Date-based filter for task deadlines */
  dateFilter: { type: String as () => 'all' | 'overdue' | 'today' | 'soon' | 'future', default: 'all' },
  /** Icon name to display in the header title */
  titleIcon: { type: String, default: '' }
})

/**
 * Component events
 * 
 * All events are pass-through events that forward to HeaderControls component.
 * 
 * @event update:search - Emitted when search query changes
 * @event update:activeFilter - Emitted when status filter changes
 * @event update:sortBy - Emitted when sort field changes
 * @event update:sortOrder - Emitted when sort direction changes
 * @event update:view - Emitted when view mode changes
 * @event update:dateFilter - Emitted when date filter changes
 */
const emit = defineEmits([
  'update:search',
  'update:activeFilter',
  'update:sortBy',
  'update:sortOrder',
  'update:view',
  'update:dateFilter'
])
</script>

<template>
    <header class="header-section">
    <HeaderControls
      :titleIcon="titleIcon"
      :search="search"
      :activeFilter="activeFilter"
      :sortBy="sortBy"
      :sortOrder="sortOrder"
      :statusMode="statusMode"
      :dateFilter="dateFilter"
      :view="view"
      @update:search="$emit('update:search', $event)"
      @update:activeFilter="$emit('update:activeFilter', $event)"
      @update:dateFilter="$emit('update:dateFilter', $event)"
      @update:sortBy="$emit('update:sortBy', $event)"
      @update:sortOrder="$emit('update:sortOrder', $event)"
      @update:view="$emit('update:view', $event)"
    />
  </header>
</template>

<style src="../styles/views.css"></style>