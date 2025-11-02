<script setup lang="ts">
/**
 * Header Component
 * 
 * Simple header component with navigation links.
 * Note: This component appears to be unused in the current application
 * as the main navigation is handled by the Sidebar component.
 * 
 * @component
 * @example
 * ```vue
 * <Header />
 * ```
 */

</script>

<template>
  <!-- Basic header with navigation links -->
  <header>
    <router-link to="/">Home</router-link>
    <router-link to="list">My ToDo</router-link>
  </header>
</template>

<style scoped></style>
