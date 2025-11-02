<script setup lang="ts">
/**
 * TagsList Component
 * 
 * Displays a list of task tags with consistent styling.
 * Handles tag label mapping and CSS class application.
 * 
 * @component
 * @example
 * ```vue
 * <TagsList :tags="task.tags" />
 * <TagsList :tags="[0, 2]" /> <!-- Work and Urgent tags -->
 * ```
 */

import { computed } from 'vue'
import { useTaskFormatters } from '@/composables/useTaskFormatters'

/**
 * Component props
 */
const props = defineProps<{
  /** Array of tag IDs (0=Work, 1=Personal, 2=Urgent, 3=Low Priority) */
  tags?: number | number[]
}>()

const { getTagLabel, getTagClass } = useTaskFormatters()

/**
 * Normalizes tags prop to always be an array.
 * Handles both single number and array inputs.
 */
const tagsList = computed(() => {
  if (!props.tags) return []
  return Array.isArray(props.tags) ? props.tags : [props.tags]
})

/**
 * Computed ARIA label for accessibility
 */
const ariaLabel = computed(() => {
  if (tagsList.value.length === 0) return ''
  const tagLabels = tagsList.value.map(tag => getTagLabel(tag)).join(', ')
  return `Task tags: ${tagLabels}`
})
</script>

<template>
  <div 
    v-if="tagsList.length > 0" 
    class="tags-container"
    role="list"
    :aria-label="ariaLabel"
  >
    <span 
      v-for="(tag, idx) in tagsList" 
      :key="`${tag}-${idx}`"
      :class="['tag', getTagClass(tag)]"
      role="listitem"
    >
      {{ getTagLabel(tag) }}
    </span>
  </div>
</template>

<style>
/* Not scoped - allows consistent tag styling across all uses */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Base tag styles */
.tags-container .tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Per-tag colors - WCAG AA compliant (4.5:1 contrast ratio) */
.tags-container .tag-work {
  background: var(--tag-work-bg, rgba(59,130,246,0.15));
  color: var(--tag-work-color, #075985);
  border: 1px solid var(--tag-work-border, rgba(59,130,246,0.3));
}

.tags-container .tag-personal {
  background: var(--tag-personal-bg, rgba(139,92,246,0.15));
  color: var(--tag-personal-color, #5b21b6);
  border: 1px solid var(--tag-personal-border, rgba(139,92,246,0.3));
}

.tags-container .tag-urgent {
  background: var(--tag-urgent-bg, rgba(239,68,68,0.15));
  color: var(--tag-urgent-color, #881337);
  border: 1px solid var(--tag-urgent-border, rgba(239,68,68,0.3));
}

.tags-container .tag-low-priority {
  background: var(--tag-low-priority-bg, rgba(107,114,128,0.15));
  color: var(--tag-low-priority-color, #1f2937);
  border: 1px solid var(--tag-low-priority-border, rgba(107,114,128,0.3));
}
</style>
