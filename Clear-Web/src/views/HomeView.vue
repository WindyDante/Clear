<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '../store/task'
import AppHeader from '../components/common/AppHeader.vue'
import TaskForm from '../components/task/TaskForm.vue'
import TaskList from '../components/task/TaskList.vue'

const router = useRouter()
const taskStore = useTaskStore()

function navigateToAbout() {
  router.push('/about')
}

onMounted(() => {
  taskStore.fetchTasks()
})
</script>

<template>
  <div class="home-view">
    <AppHeader :show-logout-icon="true">
      <template #left-actions>
        <button class="icon-button about-button" @click="navigateToAbout">
          <span class="material-icon">📊 统计</span>
        </button>
      </template>
      <template #default>
        <h1 class="app-title">Clear</h1>
      </template>
    </AppHeader>
    
    <div class="task-container">
      <TaskForm />
      <TaskList title="待办清单" />
    </div>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-color);
}

.task-container {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.about-button {
  font-size: 14px;
  width: auto;
  padding: 0 10px;
  border-radius: 16px;
  height: auto;
  min-height: 32px;
  white-space: nowrap;
  background-color: transparent !important; /* 强制移除默认背景色 */
}

.about-button:hover {
  background-color: var(--background-color) !important; /* 恢复悬停时的背景效果 */
}

.about-button .material-icon {
  display: flex;
  align-items: center;
  flex-direction: row;
  font-size: 14px;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .task-container {
    padding: 24px;
  }
}
</style>