<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isOpen = ref(true)
const isMobile = ref(false)

const navItems = [
  { id: 'home', label: 'Home', icon: '⌂', path: '/', name: 'home' },
  { id: 'day-tasks', label: 'Day Tasks', icon: '☀', path: '/day-tasks', name: 'day-tasks' },
  { id: 'research', label: 'Research', icon: '⚲', path: '/research', name: 'research' },
  { id: 'archived', label: 'Archived', icon: '⊞', path: '/archived', name: 'archived' }
]

function checkMobile() {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    isOpen.value = false
  }
}

function toggleSidebar() {
  isOpen.value = !isOpen.value
}

function handleNavClick() {
  // Auto-close sidebar on mobile after selection
  if (isMobile.value) {
    isOpen.value = false
  }
}

function closeOnOverlayClick() {
  if (isMobile.value && isOpen.value) {
    isOpen.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <!-- Mobile menu button (visible only on mobile when sidebar is closed) -->
  <button 
    v-if="isMobile && !isOpen"
    class="mobile-menu-btn"
    @click="toggleSidebar"
    aria-label="Open menu"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  </button>

  <!-- Mobile overlay -->
  <div 
    v-if="isMobile && isOpen" 
    class="overlay"
    @click="closeOnOverlayClick"
  ></div>

  <!-- Sidebar -->
  <aside :class="['sidebar', { collapsed: !isOpen, mobile: isMobile }]">
    <div class="sidebar-header">
      <router-link to="/" v-if="isOpen" class="logo">
        <span class="logo-icon">◈</span>
        <span class="logo-text">TaskFlow</span>
      </router-link>
      <button class="toggle-btn" @click="toggleSidebar" aria-label="Close menu">
        <svg v-if="isMobile && isOpen" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <nav class="nav-section">
      <router-link 
        v-for="item in navItems"
        :key="item.id"
        :to="item.path"
        :class="['nav-item']"
        :title="item.label"
        @click="handleNavClick"
      >
        <span class="icon">{{ item.icon }}</span>
        <span v-if="isOpen" class="label">{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<style scoped>
/* Mobile menu button (floating) */
.mobile-menu-btn {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
}

.mobile-menu-btn:hover {
  background: #f9fafb;
  color: #111827;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.mobile-menu-btn:active {
  transform: scale(0.95);
}

/* Mobile overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 240px;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  min-height: 64px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: #111827;
}

.logo-icon {
  font-size: 1.5rem;
  color: #6366f1;
}

.logo-text {
  font-size: 1.125rem;
  letter-spacing: -0.025em;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.sidebar.collapsed .logo {
  display: none;
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1.5rem 0.75rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 1rem;
  color: #6b7280;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.15s ease;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.nav-item:hover {
  background: #f9fafb;
  color: #111827;
}

.nav-item.router-link-active,
.nav-item.router-link-exact-active {
  background: #eef2ff;
  color: #6366f1;
}

.nav-item .icon {
  font-size: 1.55rem;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-item .label {
  font-size: 0.875rem;
  letter-spacing: -0.0125em;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 0.75rem;
}

.sidebar.collapsed .label {
  display: none;
}

/* Responsive behavior - Mobile */
@media (max-width: 768px) {
  .sidebar.mobile {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sidebar.mobile.collapsed {
    transform: translateX(-100%);
    width: 240px;
  }

  .sidebar.mobile:not(.collapsed) {
    width: 240px;
    transform: translateX(0);
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
  }

  /* Toggle button inside sidebar on mobile */
  .sidebar.mobile .toggle-btn {
    background: transparent;
  }

  .sidebar.mobile .toggle-btn:hover {
    background: #f3f4f6;
  }

  /* Improve touch targets on mobile */
  .nav-item {
    padding: 1rem 1.25rem;
    font-size: 1rem;
  }

  .nav-item .icon {
    font-size: 1.5rem;
  }
}

/* Tablet behavior */
@media (min-width: 769px) and (max-width: 1024px) {
  .sidebar {
    width: 64px;
  }

  .sidebar:not(.collapsed) {
    width: 240px;
  }

  .sidebar.collapsed .logo,
  .sidebar.collapsed .label {
    display: none;
  }
}

/* Small phones */
@media (max-width: 375px) {
  .sidebar.mobile:not(.collapsed) {
    width: 85vw;
    max-width: 280px;
  }
}

/* Dark mode support (optional) */
@media (prefers-color-scheme: dark) {
  .sidebar {
    background: #1f2937;
    border-right-color: #374151;
  }

  .sidebar-header {
    border-bottom-color: #374151;
  }

  .logo {
    color: #f9fafb;
    text-decoration: none;
  }

  .toggle-btn {
    color: #9ca3af;
  }

  .toggle-btn:hover {
    background: #374151;
    color: #f9fafb;
  }

  .nav-item {
    color: #9ca3af;
  }

  .nav-item:hover {
    background: #374151;
    color: #f9fafb;
  }

  .nav-item.router-link-active,
  .nav-item.router-link-exact-active {
    background: #312e81;
    color: #818cf8;
  }

  .mobile-menu-btn {
    background: #1f2937;
    border-color: #374151;
    color: #9ca3af;
  }

  .mobile-menu-btn:hover {
    background: #374151;
    color: #f9fafb;
  }
}
</style>
