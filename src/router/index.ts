/**
 * @file index.ts
 * @description Vue Router configuration for the To-Do Manager application.
 * Defines all application routes with lazy-loaded components for optimal performance.
 * 
 * @module router
 * @author Alexis Carrasco
 */

import { createRouter, createWebHistory } from 'vue-router'

/**
 * Vue Router instance for the To-Do Manager application.
 * 
 * Configures routing using HTML5 History mode and lazy-loads all route components
 * to improve initial load performance through code-splitting.
 * 
 * @constant {Router} router
 * 
 * Routes:
 * - `/` - Home view: Main task list with filtering capabilities
 * - `/day-tasks` - Day Tasks view: Tasks with deadlines due today
 * - `/research/:query` - Research view: Search and filter tasks (query parameter optional)
 * - `/archived` - Archived view: View archived and completed tasks
 * 
 * @remarks
 * - Uses HTML5 History API for clean URLs without hash (#)
 * - All components are lazy-loaded using dynamic imports
 * - BASE_URL is configured via Vite's environment variables
 * - Each route has a unique name for programmatic navigation
 * 
 * @example
 * // Navigate programmatically
 * import { useRouter } from 'vue-router'
 * const router = useRouter()
 * router.push({ name: 'day-tasks' })
 * 
 * @example
 * // Navigate with parameters
 * router.push({ name: 'research', params: { query: 'urgent' } })
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/day-tasks',
      name: 'day-tasks',
      component: () => import('../views/DayTasks.vue')
    },
    {
      path: '/all-tasks',
      name: 'all-tasks',
      component: () => import('../views/AllTasks.vue')
    },
    {
      path: '/research/:query',
      name: 'research',
      component: () => import('../views/Research.vue')
    },
    {
      path: '/archived',
      name: 'archived',
      component: () => import('../views/Archived.vue')
    }
  ]
})

export default router
