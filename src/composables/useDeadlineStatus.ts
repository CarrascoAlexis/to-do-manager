/**
 * Deadline Status Composable
 * 
 * Provides deadline status computation for tasks.
 * Determines urgency level based on deadline date relative to current time.
 * 
 * @module useDeadlineStatus
 * @example
 * ```ts
 * import { useDeadlineStatus } from '@/composables/useDeadlineStatus'
 * import type { Task } from '@/composables/tasks'
 * 
 * const { getDeadlineStatus, getDeadlineClass, getDeadlineLabel } = useDeadlineStatus()
 * const status = getDeadlineStatus(task)
 * ```
 */

import { computed, type ComputedRef } from 'vue'
import type { Task } from './tasks'

/**
 * Deadline status types
 */
export type DeadlineStatus = 'overdue' | 'today' | 'soon' | 'normal' | null

/**
 * Provides deadline status computation utilities.
 * 
 * @returns Object containing deadline utility functions
 */
export function useDeadlineStatus() {
  /**
   * Computes the deadline status for a task.
   * Returns null for completed tasks or tasks without deadlines.
   * 
   * Status categories:
   * - 'overdue': Deadline has passed
   * - 'today': Due today
   * - 'soon': Due within 3 days
   * - 'normal': Due more than 3 days from now
   * - null: No deadline or completed task
   * 
   * @param task - The task to check
   * @returns Deadline status or null
   */
  const getDeadlineStatus = (task: Task | null): DeadlineStatus => {
    if (!task?.deadline) return null
    
    // Don't show status indicators for completed/cancelled/archived tasks
    const isCompletedStatus = task.status === 2 || task.status === 3 || task.status === 4
    if (isCompletedStatus) return null
    
    const now = new Date()
    const deadline = task.deadline
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'overdue'
    if (diffDays === 0) return 'today'
    if (diffDays <= 3) return 'soon'
    return 'normal'
  }

  /**
   * Returns the CSS class for deadline urgency styling.
   * Example: 'deadline-overdue', 'deadline-today', 'deadline-soon'
   * 
   * @param status - The deadline status
   * @returns CSS class string or empty string
   */
  const getDeadlineClass = (status: DeadlineStatus): string => {
    if (!status) return ''
    return `deadline-${status}`
  }

  /**
   * Returns the human-readable label for deadline urgency.
   * Only shows labels for urgent deadlines (overdue, today, soon).
   * 
   * @param status - The deadline status
   * @returns Label string or empty string
   */
  const getDeadlineLabel = (status: DeadlineStatus): string => {
    if (!status) return ''
    switch (status) {
      case 'overdue': return 'Overdue'
      case 'today': return 'Today'
      case 'soon': return 'Soon'
      default: return ''
    }
  }

  /**
   * Creates a computed deadline status for a task ref.
   * Useful for reactive components.
   * 
   * @param taskRef - Computed or ref containing a task
   * @returns Computed deadline status
   */
  const useComputedDeadlineStatus = (taskRef: ComputedRef<Task | null>): ComputedRef<DeadlineStatus> => {
    return computed(() => getDeadlineStatus(taskRef.value))
  }

  return {
    getDeadlineStatus,
    getDeadlineClass,
    getDeadlineLabel,
    useComputedDeadlineStatus
  }
}
