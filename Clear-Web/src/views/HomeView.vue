<script setup lang="ts">
import { onMounted, watch, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '../store/task'
import { useCategoryStore } from '../store/category'
import { useAuthStore } from '../store/auth'
import AppHeader from '../components/common/AppHeader.vue'
import TaskForm from '../components/task/TaskForm.vue'
import TaskList from '../components/task/TaskList.vue'
import SvgIcon from '../components/common/SvgIcon.vue'
import AppDrawer from '../components/common/AppDrawer.vue'
import AboutContent from '../components/common/AboutContent.vue'
import SettingsContent from '../components/common/SettingsContent.vue'

const router = useRouter()
const taskStore = useTaskStore()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

// 抽屉状态管理
const isTaskDrawerOpen = ref(false)
const isAboutDrawerOpen = ref(false)
const isSettingsDrawerOpen = ref(false)

// 任务抽屉操作
function openTaskDrawer() {
  isTaskDrawerOpen.value = true
}

function closeTaskDrawer() {
  isTaskDrawerOpen.value = false
}

// 关于抽屉操作
function openAboutDrawer() {
  isAboutDrawerOpen.value = true
}

function closeAboutDrawer() {
  isAboutDrawerOpen.value = false
}

// 设置抽屉操作
function openSettingsDrawer() {
  isSettingsDrawerOpen.value = true
}

function closeSettingsDrawer() {
  isSettingsDrawerOpen.value = false
}

// 点击遮罩层关闭抽屉
function handleOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    closeTaskDrawer()
    closeAboutDrawer()
    closeSettingsDrawer()
  }
}

// 监听分类变更并刷新任务列表
watch(() => categoryStore.categoryChanged, async (newVal) => {
  if (newVal) {
    console.log(`分类变更: ${newVal.action}, ID: ${newVal.categoryId}`);

    // 如果当前正在按分类筛选，并且该分类被删除，则清除筛选条件
    if (newVal.action === 'delete' &&
      taskStore.selectedCategoryId !== undefined &&
      taskStore.selectedCategoryId.toString() === newVal.categoryId) {
      console.log('正在查看的分类已被删除，清除分类筛选');
      taskStore.setCategory(undefined);
    }
    // 如果正在筛选被更新的分类，或者没有特定筛选但分类发生变化，刷新任务列表
    else if (newVal.action === 'update' || newVal.action === 'add' ||
      taskStore.selectedCategoryId === undefined) {
      console.log('分类变更后刷新任务列表');
      await taskStore.fetchTasks();
    }
  }
}, { deep: true });

// 统一获取任务和分类数据
onMounted(() => {
  // 数据初始化已移至App.vue中集中处理
  console.log('HomeView: 组件已挂载，数据将由App.vue集中初始化');
})
</script>

<template>
  <div class="home-view">
    <AppHeader :show-logout-icon="isAuthenticated">
      <template #left-actions>
        <button class="icon-button about-button" @click="openAboutDrawer">
          <SvgIcon name="about" color="default" :size="20" alt="关于" />
        </button>
        <button v-if="isAuthenticated" class="icon-button settings-button" @click="openSettingsDrawer">
          <SvgIcon name="primary" color="primary" :size="20" alt="设置" />
        </button>
      </template>
      <template #default>
        <h1 class="app-title">Clear</h1>
      </template>
    </AppHeader>

    <div class="task-container">
      <TaskList title="待办清单" :can-operate="isAuthenticated" />
    </div>

    <!-- 浮动添加按钮 -->
    <button class="fab-button" @click="openTaskDrawer" :disabled="!isAuthenticated"
      :title="isAuthenticated ? '添加任务' : '请先登录'">
      <SvgIcon name="add" color="white" :size="24" alt="添加任务" />
    </button>

    <!-- 添加任务抽屉 -->
    <AppDrawer :is-open="isTaskDrawerOpen" title="添加新任务" @close="closeTaskDrawer">
      <TaskForm :can-operate="isAuthenticated" :is-drawer-mode="true" @task-added="closeTaskDrawer" />
    </AppDrawer>

    <!-- 关于抽屉 -->
    <AppDrawer :is-open="isAboutDrawerOpen" title="关于与主题" @close="closeAboutDrawer" max-height="90vh">
      <AboutContent />
    </AppDrawer>

    <!-- 设置抽屉 -->
    <AppDrawer :is-open="isSettingsDrawerOpen" title="设置" @close="closeSettingsDrawer" max-height="90vh">
      <SettingsContent />
    </AppDrawer>
  </div>
</template>

<style scoped>
.home-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-color);
}

.task-container {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  /* 重要：允许flex子项收缩 */
  overflow: hidden;
}

.about-button {
  font-size: 14px;
  width: auto;
  padding: 0 10px;
  border: none;
  height: auto;
  min-height: 32px;
  white-space: nowrap;
  background-color: transparent !important;
}

.settings-button {
  font-size: 14px;
  width: auto;
  padding: 0 10px;
  border: none;
  height: auto;
  min-height: 32px;
  white-space: nowrap;
  background-color: transparent !important;
  margin-left: 8px;
}

.icon-img {
  width: 20px;
  height: 20px;
}

.about-button:hover {
  background-color: var(--background-color) !important;
}

.settings-button:hover {
  background-color: var(--background-color) !important;
}

.about-button .material-icon {
  display: flex;
  align-items: center;
  flex-direction: row;
  font-size: 14px;
  white-space: nowrap;
}

/* 浮动添加按钮样式 */
.fab-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--primary-color);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1000;
}

.fab-button:hover:not(:disabled) {
  background-color: var(--primary-light);
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.fab-button:disabled {
  background-color: var(--text-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

/* 抽屉样式 */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.3s ease;
}

.drawer-content {
  background-color: var(--card-bg);
  width: 100%;
  max-height: 85vh;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
  overflow: hidden;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px 24px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--card-bg);
  flex-shrink: 0;
}

.drawer-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
  opacity: 1;
}

.drawer-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: var(--background-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.drawer-close-btn:hover {
  background-color: var(--border-color);
}

.close-icon {
  font-size: 20px;
  color: var(--text-color);
  line-height: 1;
  opacity: 1;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background-color: var(--card-bg);
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}

/* 移动端优化 */
@media (max-width: 767px) {
  .task-container {
    padding: 8px;
  }

  .fab-button {
    bottom: 16px;
    right: 16px;
    width: 48px;
    height: 48px;
  }

  .drawer-content {
    max-height: 90vh;
  }
}

/* 桌面端适配 */
@media (min-width: 768px) {
  .task-container {
    padding: 16px 24px;
  }

  .drawer-content {
    max-width: 500px;
    margin: 0 auto;
    max-height: 75vh;
    border-radius: 16px;
    margin-bottom: 10vh;
  }

  .drawer-overlay {
    align-items: center;
  }

  .fab-button {
    bottom: 32px;
    right: 32px;
  }
}

/* 大屏幕适配 */
@media (min-width: 1200px) {
  .task-container {
    padding: 20px 32px;
  }

  .drawer-content {
    max-width: 600px;
    max-height: 70vh;
  }
}
</style>