/**
 * Task Formatters Composable
 * 
 * Provides shared formatting utilities for tasks across components.
 * Includes date formatting and tag label/class mapping functions.
 * 
 * @module useTaskFormatters
 * @example
 * ```ts
 * import { useTaskFormatters } from '@/composables/useTaskFormatters'
 * 
 * const { formatDate, formatDateShort, getTagLabel, getTagClass } = useTaskFormatters()
 * ```
 */

/**
 * Tag label mapping for all tag types
 */
export const TAG_LABELS = ['Work', 'Personal', 'Urgent', 'Low Priority'] as const

/**
 * Tag CSS class mapping for all tag types
 */
export const TAG_CLASSES = ['tag-work', 'tag-personal', 'tag-urgent', 'tag-low-priority'] as const

/**
 * Provides formatting utilities for tasks.
 * 
 * @returns Object containing formatter functions
 */
export function useTaskFormatters() {
  /**
   * Formats a date into a long, detailed format.
   * Example: "Monday, January 1, 2024, 02:30 PM"
   * 
   * @param date - The date to format
   * @returns Formatted date string
   */
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  /**
   * Formats a date into a short format.
   * Example: "Jan 1, 2024"
   * 
   * @param date - The date to format
   * @returns Formatted short date string
   */
  const formatDateShort = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  /**
   * Maps a tag number to its human-readable label.
   * 
   * @param tag - The tag number (0-3)
   * @returns The tag label string
   */
  const getTagLabel = (tag: number): string => {
    return TAG_LABELS[tag] || 'Unknown'
  }

  /**
   * Maps a tag number to its CSS class name.
   * 
   * @param tag - The tag number (0-3)
   * @returns The tag CSS class string
   */
  const getTagClass = (tag: number): string => {
    return TAG_CLASSES[tag] || 'tag-work'
  }

  return {
    formatDate,
    formatDateShort,
    getTagLabel,
    getTagClass,
    TAG_LABELS,
    TAG_CLASSES
  }
}
