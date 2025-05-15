<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { useToast } from '../../composables/useToast' // 引入 Toast 功能

defineProps<{
  title?: string
  showHomeIcon?: boolean
  showLogoutIcon?: boolean
}>()

const router = useRouter()
const authStore = useAuthStore()
const { showToast } = useToast() // 使用 Toast 功能

function navigateHome() {
  router.push('/')
}

function logout() {
  authStore.logout()
  showToast('您已成功退出登录', 'info') // 添加退出时的 Toast 通知
  router.push('/auth')
}
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <div class="left-actions">
        <button v-if="showHomeIcon" class="icon-button home-button" @click="navigateHome">
          <img src="/primary.svg" alt="首页" class="icon-img" />
        </button>
        <slot name="left-actions"></slot>
      </div>

      <h1 class="header-title">
        <slot>{{ title }}</slot>
      </h1>

      <div class="right-actions">
        <button v-if="showLogoutIcon" class="icon-button logout-button" @click="logout">
          <img src="/exit.svg" alt="退出" class="icon-img" />
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
  font-size: 16px;
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
  /* 移除边框 */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  height: auto;
  min-height: 32px;
  border-radius: 16px;
  transition: background-color var(--transition-speed);
  padding: 0 10px;
}

.icon-button:hover {
  background-color: var(--background-color);
}

.icon-img {
  width: 20px;
  /* 你可以根据需要调整图标大小 */
  height: 20px;
  /* 你可以根据需要调整图标大小 */
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
  border: none;
  /* 确保这些按钮也没有边框 */
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
  border: none;
  /* 确保这些按钮也没有边框 */
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
}
</style>