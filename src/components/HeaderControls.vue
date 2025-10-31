<script setup lang="ts">
import FiltersBar from './FiltersBar.vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  search: { type: String, default: '' },
  title: { type: String, default: '' },
  activeFilter: { type: [Number, String], default: 'all' },
  sortBy: { type: String as () => 'deadline' | 'createdAt' | 'updatedAt', default: 'deadline' },
  sortOrder: { type: String as () => 'asc' | 'desc', default: 'asc' },
  statusMode: { type: String as () => 'buttons' | 'dropdown', default: 'dropdown' },
  view: { type: String as () => 'list' | 'kanban', default: 'list' }
})

const emit = defineEmits(['update:search', 'update:activeFilter', 'update:sortBy', 'update:sortOrder', 'update:view'])

function onSearch(e: Event) {
  const v = (e.target as HTMLInputElement).value
  emit('update:search', v)
}
</script>

<template>
  <div class="header-controls">
    <div class="header-title" v-if="title">
      <h1 class="header-title-text" v-text="title"></h1>
      <div class="title-divider" aria-hidden="true"></div>
    </div>
    <div class="search-wrapper" role="search">
      <span class="search-icon" aria-hidden="true">
        <!-- simple magnifier SVG -->
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>

      <input
        class="search-input"
        :value="search"
        @input="onSearch"
        placeholder="Search tasks..."
        aria-label="Search tasks"
      />
    </div>

    <div class="controls-divider" aria-hidden="true"></div>

    <div class="right-controls" role="toolbar" aria-label="Filters and view">
      <FiltersBar
        :activeFilter="activeFilter"
        :sortBy="sortBy"
        :sortOrder="sortOrder"
        :statusMode="statusMode"
        @update:activeFilter="$emit('update:activeFilter', $event)"
        @update:sortBy="$emit('update:sortBy', $event)"
        @update:sortOrder="$emit('update:sortOrder', $event)"
      />

      <div class="view-toggle" role="tablist" aria-label="View toggle">
        <button class="view-btn" :class="{ active: view === 'list' }" @click="$emit('update:view', 'list')" :aria-pressed="view === 'list'" title="List view">
          📋
        </button>
        <button class="view-btn" :class="{ active: view === 'kanban' }" @click="$emit('update:view', 'kanban')" :aria-pressed="view === 'kanban'" title="Kanban view">
          🗂️
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

.controls-divider {
  width: 1px;
  height: 28px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.06), rgba(0,0,0,0.02));
  margin: 0 0.6rem;
  border-radius: 1px;
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

/* ensure FiltersBar's controls-row can shrink inside the right-controls container */
.right-controls .controls-row {
  min-width: 0;
}
</style>
