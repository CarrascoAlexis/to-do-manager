<script setup lang="ts">
import HeaderControls from './HeaderControls.vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  search: { type: String, default: '' },
  activeFilter: { type: [Number, String], default: 'all' },
  sortBy: { type: String as () => 'deadline' | 'createdAt' | 'updatedAt', default: 'deadline' },
  sortOrder: { type: String as () => 'asc' | 'desc', default: 'asc' },
  statusMode: { type: String as () => 'buttons' | 'dropdown', default: 'dropdown' },
  view: { type: String as () => 'list' | 'kanban', default: 'list' },
  dateFilter: { type: String as () => 'all' | 'overdue' | 'today' | 'soon' | 'future', default: 'all' },
  titleIcon: { type: String, default: '' }
})

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