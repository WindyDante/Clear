<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'

defineProps<{
  title?: string
  showHomeIcon?: boolean
  showLogoutIcon?: boolean
}>()

const router = useRouter()
const authStore = useAuthStore()

function navigateHome() {
  router.push('/')
}

function logout() {
  authStore.logout()
  router.push('/auth')
}
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <div class="left-actions">
        <button v-if="showHomeIcon" class="icon-button" @click="navigateHome">
          <span class="material-icon">🏠</span>
        </button>
      </div>
      
      <h1 class="header-title">
        <slot>{{ title }}</slot>
      </h1>
      
      <div class="right-actions">
        <button v-if="showLogoutIcon" class="icon-button" @click="logout">
          <span class="material-icon">📋</span>
        </button>
        <slot name="right-actions"></slot>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  padding: 16px;
  background-color: var(--card-color);
  border-bottom: 1px solid var(--border-color);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.left-actions,
.right-actions {
  display: flex;
  align-items: center;
  min-width: 40px;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: background-color var(--transition-speed);
}

.icon-button:hover {
  background-color: var(--background-color);
}

.material-icon {
  font-size: 20px;
}
</style>