/**
 * useHeaderControls Composable
 * 
 * A reusable Vue 3 composable that manages header control state and handlers for task views.
 * This composable provides reactive state for filtering, sorting, and view mode controls,
 * along with event handlers compatible with the HeaderSection component.
 * 
 * @module composables/useHeaderControls
 * 
 * @example
 * ```typescript
 * import { useHeaderControls } from '@/composables/useHeaderControls'
 * 
 * // In your component:
 * const { 
 *   filter, 
 *   sortBy, 
 *   view, 
 *   onUpdateSearch, 
 *   onUpdateSortBy 
 * } = useHeaderControls(loadTasksData)
 * ```
 * 
 * Features:
 * - Reactive state for search, filters, sorting, and view modes
 * - Event handlers for HeaderSection component
 * - LocalStorage persistence for user preferences (view mode, date filter)
 * - Optional automatic reload on state changes
 * - Filter animation trigger for visual feedback
 */

import { ref, onMounted } from 'vue'

/**
 * Type definition for task status filter values.
 */
type StatusFilter = number | 'all'

/**
 * Type definition for sort field options.
 */
type SortByOption = 'deadline' | 'createdAt' | 'updatedAt'

/**
 * Type definition for sort order options.
 */
type SortOrder = 'asc' | 'desc'

/**
 * Type definition for view mode options.
 */
type ViewMode = 'list' | 'kanban'

/**
 * Type definition for date filter options.
 */
type DateFilter = 'all' | 'overdue' | 'today' | 'soon' | 'future'

/**
 * Creates a header controls instance with reactive state and event handlers.
 * 
 * @param {() => void} [reloadCallback] - Optional callback to invoke when filters/sorting change.
 *                                        Typically a function that reloads or re-filters task data.
 * 
 * @returns {Object} An object containing reactive state and handler functions:
 *   - filter: Ref<{searchTerm?: string, status?: number}> - Current filter state
 *   - activeFilter: Ref<StatusFilter> - Currently active status filter
 *   - sortBy: Ref<SortByOption> - Field to sort tasks by
 *   - sortOrder: Ref<SortOrder> - Sort direction (ascending/descending)
 *   - view: Ref<ViewMode> - Current view mode (list or kanban)
 *   - dateFilter: Ref<DateFilter> - Current date-based filter
 *   - filterAnim: Ref<boolean> - Animation trigger for filter changes
 *   - onUpdateSearch: (v: string) => void - Handler for search input changes
 *   - onUpdateActiveFilter: (v: StatusFilter) => void - Handler for status filter changes
 *   - onUpdateSortBy: (v: SortByOption) => void - Handler for sort field changes
 *   - onUpdateSortOrder: (v: SortOrder) => void - Handler for sort order changes
 *   - onUpdateView: (v: ViewMode) => void - Handler for view mode changes
 *   - onUpdateDateFilter: (v: DateFilter) => void - Handler for date filter changes
 */
export function useHeaderControls(reloadCallback?: () => void) {
  // ==========================================
  // Reactive State
  // ==========================================
  
  /**
   * Combined filter state containing search term and status filter.
   * Used for filtering task lists by text search and status.
   * 
   * @example
   * filter.value = { searchTerm: 'meeting', status: 0 } // Search for "meeting" in TODO tasks
   */
  const filter = ref<{ searchTerm?: string; status?: number }>({})
  
  /**
   * Active status filter indicator.
   * Can be a number (0-4 for specific statuses) or 'all' to show all tasks.
   * 
   * Status values:
   * - 'all': Show all tasks
   * - 0: TODO
   * - 1: IN_PROGRESS
   * - 2: DONE
   * - 3: CANCELLED
   * - 4: ARCHIVED
   */
  const activeFilter = ref<StatusFilter>('all')
  
  /**
   * Field to sort tasks by.
   * Defaults to 'deadline' for most task views.
   */
  const sortBy = ref<SortByOption>('deadline')
  
  /**
   * Sort order direction.
   * 'asc' = ascending (oldest/earliest first)
   * 'desc' = descending (newest/latest first)
   */
  const sortOrder = ref<SortOrder>('asc')
  
  /**
   * Current view mode for task display.
   * 'list' = vertical list view (default)
   * 'kanban' = board view with columns by status
   * 
   * Persisted to localStorage for user preference.
   */
  const view = ref<ViewMode>('list')
  
  /**
   * Date-based filter for tasks with deadlines.
   * Only affects kanban view in most implementations.
   * 
   * Values:
   * - 'all': Show all tasks regardless of deadline
   * - 'overdue': Only tasks past their deadline
   * - 'today': Only tasks due today
   * - 'soon': Tasks due within 3 days
   * - 'future': Tasks due more than 3 days from now
   * 
   * Persisted to localStorage for user preference.
   */
  const dateFilter = ref<DateFilter>('all')
  
  /**
   * Animation trigger for filter changes.
   * When true, applies a CSS class to trigger visual feedback.
   * Automatically resets to false after 600ms.
   */
  const filterAnim = ref(false)

  // ==========================================
  // Lifecycle & Persistence
  // ==========================================

  /**
   * Loads saved user preferences from localStorage on component mount.
   * Restores view mode and date filter settings from previous sessions.
   * Silently fails if localStorage is unavailable or contains invalid data.
   */
  onMounted(() => {
    try {
      // Restore view mode preference
      const savedView = localStorage.getItem('tasks:viewMode')
      if (savedView === 'kanban' || savedView === 'list') {
        view.value = savedView
      }
      
      // Restore date filter preference
      const savedDate = localStorage.getItem('tasks:dateFilter')
      if (savedDate === 'all' || savedDate === 'overdue' || savedDate === 'today' || savedDate === 'soon' || savedDate === 'future') {
        dateFilter.value = savedDate as DateFilter
      }
    } catch (err) { 
      // Silently ignore localStorage errors (e.g., in private browsing mode)
    }
  })

  // ==========================================
  // Event Handlers
  // ==========================================

  /**
   * Handles search input changes from the HeaderSection component.
   * Updates the filter state and triggers a reload if callback is provided.
   * 
   * @param {string} v - The new search term
   * 
   * @example
   * ```vue
   * <HeaderSection @update:search="onUpdateSearch" />
   * ```
   */
  function onUpdateSearch(v: string) {
    filter.value = { ...(filter.value || {}), searchTerm: v }
    reloadCallback?.()
  }

  /**
   * Handles status filter changes from the HeaderSection component.
   * Updates both the activeFilter and filter.status, then triggers a reload.
   * 
   * @param {StatusFilter} v - The new status filter ('all' or 0-4)
   * 
   * @example
   * ```vue
   * <HeaderSection @update:activeFilter="onUpdateActiveFilter" />
   * ```
   */
  function onUpdateActiveFilter(v: StatusFilter) {
    activeFilter.value = v
    if (v === 'all') {
      // Remove status filter to show all tasks
      filter.value = { ...filter.value, status: undefined }
    } else {
      // Apply specific status filter
      filter.value = { ...filter.value, status: v }
    }
    reloadCallback?.()
  }

  /**
   * Handles sort field changes from the HeaderSection component.
   * Updates the sortBy field and triggers a reload.
   * 
   * @param {SortByOption} v - The field to sort by ('deadline', 'createdAt', or 'updatedAt')
   * 
   * @example
   * ```vue
   * <HeaderSection @update:sortBy="onUpdateSortBy" />
   * ```
   */
  function onUpdateSortBy(v: SortByOption) {
    sortBy.value = v
    reloadCallback?.()
  }

  /**
   * Handles sort order changes from the HeaderSection component.
   * Updates the sortOrder direction and triggers a reload.
   * 
   * @param {SortOrder} v - The sort order ('asc' or 'desc')
   * 
   * @example
   * ```vue
   * <HeaderSection @update:sortOrder="onUpdateSortOrder" />
   * ```
   */
  function onUpdateSortOrder(v: SortOrder) {
    sortOrder.value = v
    reloadCallback?.()
  }

  /**
   * Handles view mode changes from the HeaderSection component.
   * Updates the view mode and persists the preference to localStorage.
   * Does NOT trigger a reload as the view change is purely presentational.
   * 
   * @param {ViewMode} v - The view mode ('list' or 'kanban')
   * 
   * @example
   * ```vue
   * <HeaderSection @update:view="onUpdateView" />
   * ```
   */
  function onUpdateView(v: ViewMode) {
    view.value = v
    try {
      localStorage.setItem('tasks:viewMode', v)
    } catch (err) { 
      // Silently ignore localStorage errors
    }
  }

  /**
   * Handles date filter changes from the HeaderSection component.
   * Updates the date filter, persists to localStorage, and triggers a visual animation.
   * 
   * @param {DateFilter} v - The date filter value
   * 
   * @example
   * ```vue
   * <HeaderSection @update:dateFilter="onUpdateDateFilter" />
   * ```
   */
  function onUpdateDateFilter(v: DateFilter) {
    dateFilter.value = v
    try {
      localStorage.setItem('tasks:dateFilter', v)
    } catch (err) { 
      // Silently ignore localStorage errors
    }
    
    // Trigger visual feedback animation
    filterAnim.value = true
    setTimeout(() => {
      filterAnim.value = false
    }, 600) // Duration matches CSS animation timing
  }

  // ==========================================
  // Public API
  // ==========================================

  return {
    // State
    filter,
    activeFilter,
    sortBy,
    sortOrder,
    view,
    dateFilter,
    filterAnim,
    // Event handlers
    onUpdateSearch,
    onUpdateActiveFilter,
    onUpdateSortBy,
    onUpdateSortOrder,
    onUpdateView,
    onUpdateDateFilter
  }
}
