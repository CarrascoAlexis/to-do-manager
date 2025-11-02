<script setup lang="ts">
/**
 * HeaderControls Component
 * 
 * Main header controls component that combines search, filtering, sorting, and view mode controls.
 * Provides a comprehensive UI for managing task list display and filtering options.
 * 
 * Features:
 * - Search input for filtering tasks by text
 * - Optional title icon display
 * - Date filter badge with pulse animation and clear button
 * - Status filtering via FiltersBar component
 * - Sort controls (deadline, created date, updated date)
 * - View mode toggle (list vs kanban)
 * - Conditional control visibility based on view mode
 * - Accessibility support with ARIA labels and roles
 * 
 * @component
 * @example
 * ```vue
 * <HeaderControls
 *   :search="searchTerm"
 *   :activeFilter="currentFilter"
 *   :sortBy="sortField"
 *   :sortOrder="sortDirection"
 *   :statusMode="'dropdown'"
 *   :view="viewMode"
 *   :dateFilter="dateRange"
 *   :titleIcon="'home'"
 *   @update:search="handleSearch"
 *   @update:activeFilter="handleFilterChange"
 *   @update:sortBy="handleSortChange"
 *   @update:sortOrder="handleOrderChange"
 *   @update:view="handleViewChange"
 *   @update:dateFilter="handleDateFilterChange"
 * />
 * ```
 */

import FiltersBar from './FiltersBar.vue'
import Icon from './Icon.vue'
import { defineProps, defineEmits, ref, watch } from 'vue'

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
  view: { type: String as () => 'list' | 'kanban', default: 'list' }
  ,
  /** Date-based filter for task deadlines */
  dateFilter: { type: String as () => 'all' | 'overdue' | 'today' | 'soon' | 'future', default: 'all' },
  /** Icon name to display in the header title */
  titleIcon: { type: String, default: '' }
  
})

/**
 * Component events
 * 
 * @event update:search - Emitted when search query changes
 * @event update:activeFilter - Emitted when status filter changes
 * @event update:sortBy - Emitted when sort field changes
 * @event update:sortOrder - Emitted when sort direction changes
 * @event update:view - Emitted when view mode changes
 * @event update:dateFilter - Emitted when date filter changes
 */
const emit = defineEmits(['update:search', 'update:activeFilter', 'update:sortBy', 'update:sortOrder', 'update:view', 'update:dateFilter'])

// ==========================================
// Reactive State - Animation
// ==========================================

/** Controls the pulse animation for the date filter badge */
const pulse = ref(false)

/**
 * Watches the dateFilter prop and triggers a pulse animation when it changes.
 * Provides visual feedback when a date filter is applied.
 */
watch(() => props.dateFilter, (val, oldVal) => {
  if (val && val !== 'all' && val !== oldVal) {
    pulse.value = true
    setTimeout(() => { pulse.value = false }, 700)
  }
})

// ==========================================
// Event Handlers
// ==========================================

/**
 * Clears the active date filter by setting it to 'all'.
 * Called when the date badge is clicked.
 */
function clearDate() {
  // emit a request to clear the date filter (set to 'all')
  emit('update:dateFilter', 'all')
}

/**
 * Handles search input changes and emits the updated search query.
 * 
 * @param e - Input event from search field
 */
function onSearch(e: Event) {
  const v = (e.target as HTMLInputElement).value
  emit('update:search', v)
}

/**
 * Maps date filter values to human-readable labels.
 * 
 * @param v - The date filter value
 * @returns Human-readable label for the date filter
 */
function getDateLabel(v: string) {
  const map: Record<string,string> = {
    overdue: 'Overdue',
    today: 'Today',
    soon: 'Soon',
    future: 'Future'
  }
  return map[v] || ''
}
</script>

<template>
  <div class="header-controls">
        <div class="header-title" v-if="titleIcon">
          <span class="header-icon" aria-hidden="true">
            <Icon :name="titleIcon" :size="18" />
          </span>

          <button v-if="dateFilter && dateFilter !== 'all'" type="button" class="date-badge" :class="{ 'badge-animate': pulse }" :title="getDateLabel(dateFilter)" @click="clearDate" aria-label="Clear date filter">
            {{ getDateLabel(dateFilter) }}
          </button>
        </div>
    <div class="search-wrapper" role="search">
      <span class="search-icon" aria-hidden="true">
        <Icon name="search" :size="16" />
      </span>

      <input
        class="search-input"
        :value="search"
        @input="onSearch"
        placeholder="Search tasks..."
        aria-label="Search tasks"
      />
    </div>

    <div class="right-controls" role="toolbar" aria-label="Filters and view">
      <FiltersBar
        :activeFilter="activeFilter"
        :sortBy="sortBy"
        :sortOrder="sortOrder"
        :statusMode="statusMode"
        :showStatus="view !== 'kanban'"
        :showDateFilter="view === 'kanban'"
        @update:activeFilter="$emit('update:activeFilter', $event)"
        @update:dateFilter="$emit('update:dateFilter', $event)"
        @update:sortBy="$emit('update:sortBy', $event)"
        @update:sortOrder="$emit('update:sortOrder', $event)"
      />

      <div class="view-toggle" role="tablist" aria-label="View toggle">
        <button class="view-btn" :class="{ active: view === 'list' }" @click="$emit('update:view', 'list')" :aria-pressed="view === 'list'" title="List view">
          <Icon name="list" :size="16" />
        </button>
        <button class="view-btn" :class="{ active: view === 'kanban' }" @click="$emit('update:view', 'kanban')" :aria-pressed="view === 'kanban'" title="Kanban view">
          <Icon name="kanban" :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<style>
/* Minimal, non-scoped helpers. Core header layout is provided by ../styles/views.css */
.search-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-right: 0.25rem;
  max-width: 36%;
  min-width: 0;
}

.header-title-text {
  margin: 0;
  font-size: 1rem;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.title-divider {
  width: 1px;
  height: 26px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.06), rgba(0,0,0,0.02));
  border-radius: 1px;
}

.search-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  padding-left: 0.25rem;
}

.view-toggle {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  margin-left: auto; /* keep toggle pinned to the right */
}

.view-btn {
  padding: 0.35rem 0.5rem;
  border-radius: 8px;
  background: transparent;
  border: 2px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.95rem;
  margin-top: -10px;
}

.view-btn:hover {
  background: var(--hover-bg);
  border-color: var(--sidebar-border);
}

.view-btn.active {
  background: var(--accent-color);
  color: var(--on-accent, #fff);
  border-color: var(--accent-color);
}

.right-controls {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-left: auto; /* push this group to the far right */
}

.date-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-color);
  color: var(--on-accent, #fff);
  font-size: 0.75rem;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  margin-left: 0.5rem;
  white-space: nowrap;
  cursor: pointer;
  border: none;
  outline: none;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.badge-animate {
  animation: badge-pop 700ms cubic-bezier(.2,.9,.2,1);
}

@keyframes badge-pop {
  0% { transform: scale(.92); opacity: 0 }
  60% { transform: scale(1.06); opacity: 1 }
  100% { transform: scale(1); opacity: 1 }
}

.date-badge:hover {
  transform: translateY(-1px) scale(1.03);
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
}

/* ensure FiltersBar's controls-row can shrink inside the right-controls container */
.right-controls .controls-row {
  min-width: 0;
}
</style>
