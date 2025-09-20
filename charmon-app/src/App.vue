<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user'
import AppLayout from '@/components/AppLayout.vue'

const userStore = useUserStore()
</script>

<template>
  <AppLayout v-if="userStore.isAuthenticated">
    <RouterView />
  </AppLayout>
  <RouterView v-else />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  width: 100vw;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
}
</style>
