import { createRouter, createWebHistory } from 'vue-router'

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
