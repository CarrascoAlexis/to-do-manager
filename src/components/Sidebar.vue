
<template>
  <!-- mobile menu button (shows on small screens) -->
  <button v-if="isMobile && isCollapsed" class="mobile-menu-btn" @click="isCollapsed = false" aria-label="Open menu">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>

  <!-- overlay for mobile when sidebar is open -->
  <div v-if="isMobile && !isCollapsed" class="overlay" @click="isCollapsed = true"></div>

  <aside :class="['sidebar', { collapsed: isCollapsed, mobile: isMobile }]" :aria-expanded="!isCollapsed">
    <div class="sidebar-header">
      <div class="logo">
        <!-- simple SVG logo -->
        <span class="logo-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
            <rect x="3" y="4" width="14" height="16" rx="2" stroke="currentColor" stroke-width="1.5" />
            <path d="M7 8h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <path d="M7 12h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
        <span class="logo-text">ToDo</span>
      </div>
      <button class="toggle-btn" @click="isCollapsed = !isCollapsed" aria-label="Toggle sidebar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path v-if="!isCollapsed" d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path v-else d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <nav class="nav-section">
      <router-link to="/" class="nav-item">
        <span class="icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 10.5L12 3l9 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M9 21V12h6v9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <span class="label">Home</span>
      </router-link>

      <router-link to="/day-tasks" class="nav-item">
        <span class="icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5" />
            <path d="M16 2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <path d="M8 2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
        <span class="label">Day Tasks</span>
      </router-link>

      <router-link to="/all-tasks" class="nav-item">
        <span class="icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5" />
            <path d="M7 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <path d="M7 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
        <span class="label">All Tasks</span>
      </router-link>

      <router-link to="/archived" class="nav-item">
        <span class="icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="4" rx="1" stroke="currentColor" stroke-width="1.5" />
            <path d="M21 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M10 11h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
        <span class="label">Archived</span>
      </router-link>
    </nav>

    <div class="sidebar-footer" ref="themeBtnRef">
      <button :class="['theme-btn']" @click="toggleThemeMenu" :aria-expanded="themeMenuOpen" :aria-label="`Choose theme (current: ${currentTheme})`">
        <span class="theme-dot" :class="currentTheme"></span>
        <span v-if="!isCollapsed" class="theme-label">{{ currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1) }} theme</span>
      </button>

        <div v-if="themeMenuOpen" class="theme-menu" ref="themeMenuRef" role="menu" aria-label="Select theme">
          <button
            v-for="t in themes"
            :key="t"
            class="theme-option"
            @click="selectTheme(t)"
            :aria-pressed="currentTheme === t"
          >
            <span class="theme-dot" :class="t"></span>
            <span class="theme-option-label">{{ t.charAt(0).toUpperCase() + t.slice(1) }}</span>
            
          </button>
        </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isCollapsed = ref(false)
const isMobile = ref(false)
const themes = ['light','dark','halloween','christmas','france','italy','spain','lgbt']
const currentTheme = ref('light')
const themeMenuOpen = ref(false)
const themeBtnRef = ref<HTMLElement | null>(null)
const themeMenuRef = ref<HTMLElement | null>(null)

function applyTheme(theme: string) {
  const root = document.documentElement
  Array.from(root.classList).forEach(c => { if (c.startsWith('theme-')) root.classList.remove(c) })
  root.classList.add(`theme-${theme}`)
  localStorage.setItem('theme', theme)
  currentTheme.value = theme
}

function toggleThemeMenu() { themeMenuOpen.value = !themeMenuOpen.value }
function selectTheme(t: string) { applyTheme(t); themeMenuOpen.value = false }

function onDocClick(e: MouseEvent) {
  const btn = themeBtnRef.value
  const menu = themeMenuRef.value
  if (!btn || !menu) return
  if (btn.contains(e.target as Node) || menu.contains(e.target as Node)) return
  themeMenuOpen.value = false
}

function updateIsMobile() {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  // theme restore
  const stored = localStorage.getItem('theme')
  if (stored && themes.includes(stored)) {
    currentTheme.value = stored
    document.documentElement.classList.add(`theme-${stored}`)
  }

  // responsive setup
  updateIsMobile()
  // collapse by default on mobile
  isCollapsed.value = isMobile.value ? true : false
  window.addEventListener('resize', updateIsMobile)

  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
  document.removeEventListener('click', onDocClick)
})

 
</script>

<style src="../styles/sidebar.css" scoped></style>
