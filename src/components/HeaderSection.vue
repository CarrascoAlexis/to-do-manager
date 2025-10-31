<script setup lang="ts">
import HeaderControls from './HeaderControls.vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  search: { type: String, default: '' },
  activeFilter: { type: [Number, String], default: 'all' },
  sortBy: { type: String as () => 'deadline' | 'createdAt' | 'updatedAt', default: 'deadline' },
  sortOrder: { type: String as () => 'asc' | 'desc', default: 'asc' },
  statusMode: { type: String as () => 'buttons' | 'dropdown', default: 'dropdown' },
  view: { type: String as () => 'list' | 'kanban', default: 'list' }
})

const emit = defineEmits([
  'update:search',
  'update:activeFilter',
  'update:sortBy',
  'update:sortOrder',
  'update:view'
])
</script>

<template>
  <div class="header-section">
    <HeaderControls
      :title="title"
      :search="search"
      :activeFilter="activeFilter"
      :sortBy="sortBy"
      :sortOrder="sortOrder"
      :statusMode="statusMode"
      :view="view"
      @update:search="$emit('update:search', $event)"
      @update:activeFilter="$emit('update:activeFilter', $event)"
      @update:sortBy="$emit('update:sortBy', $event)"
      @update:sortOrder="$emit('update:sortOrder', $event)"
      @update:view="$emit('update:view', $event)"
    />
  </div>
</template>

<style src="../styles/views.css"></style>