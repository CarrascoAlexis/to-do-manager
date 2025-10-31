<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
import AddTaskFab from './components/AddTaskFab.vue'
</script>

<template>
  <div class="app-container">
    <Sidebar />
    <main class="main-content">
      <router-view />
    </main>
    <AddTaskFab />
  </div>
</template>

<style src="./styles/app.css" scoped></style>
