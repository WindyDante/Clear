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
<<<<<<< HEAD
        <button v-if="showHomeIcon" class="icon-button home-button" @click="navigateHome">
          <span class="material-icon">🏠 首页</span>
        </button>
        <slot name="left-actions"></slot>
=======
        <button v-if="showHomeIcon" class="icon-button" @click="navigateHome">
          <span class="material-icon">🏠</span>
        </button>
>>>>>>> 649911e37deed67f4a8fd7afbdc44ba6cb39cda0
      </div>
      
      <h1 class="header-title">
        <slot>{{ title }}</slot>
      </h1>
      
      <div class="right-actions">
<<<<<<< HEAD
        <button v-if="showLogoutIcon" class="icon-button logout-button" @click="logout">
          <span class="material-icon">⬅️ 退出</span>
=======
        <button v-if="showLogoutIcon" class="icon-button" @click="logout">
          <span class="material-icon">📋</span>
>>>>>>> 649911e37deed67f4a8fd7afbdc44ba6cb39cda0
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
<<<<<<< HEAD
  font-size: 16px;
=======
  font-size: 18px;
>>>>>>> 649911e37deed67f4a8fd7afbdc44ba6cb39cda0
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
<<<<<<< HEAD
  width: auto;
  height: auto;
  min-height: 32px;
  border-radius: 16px;
  transition: background-color var(--transition-speed);
  padding: 0 10px;
=======
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: background-color var(--transition-speed);
>>>>>>> 649911e37deed67f4a8fd7afbdc44ba6cb39cda0
}

.icon-button:hover {
  background-color: var(--background-color);
}

.material-icon {
<<<<<<< HEAD
  font-size: 14px;
}

.logout-button {
  margin-right: 8px;
  color: var(--text-color);
  width: auto;
  padding: 0 10px;
  border-radius: 16px;
  height: auto;
  min-height: 32px;
  white-space: nowrap;
  font-size: 14px;
}

.logout-button .material-icon {
  display: flex;
  align-items: center;
  flex-direction: row;
  white-space: nowrap;
  font-size: 14px;
}

.logout-button:hover {
  background-color: rgba(255, 0, 0, 0.1);
}

.home-button {
  width: auto;
  padding: 0 10px;
  border-radius: 16px;
  height: auto;
  min-height: 32px;
  white-space: nowrap;
  font-size: 14px;
}

.home-button .material-icon {
  display: flex;
  align-items: center;
  flex-direction: row;
  white-space: nowrap;
  font-size: 14px;
}

.home-button:hover {
  background-color: var(--background-color);
=======
  font-size: 20px;
>>>>>>> 649911e37deed67f4a8fd7afbdc44ba6cb39cda0
}
</style>