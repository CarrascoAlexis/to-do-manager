<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
</script>

<template>
  <div class="app-container">
    <Sidebar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background: #f9fafb;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-x: hidden;
  width: 100%;
}



/* Responsive - Mobile */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding-top: 4rem; /* Space for floating toggle button */
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .main-content {
    margin-left: 64px;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .app-container {
    background: #111827;
  }
}
</style>
