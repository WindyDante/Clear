<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '../store/task'
import { useCategoryStore } from '../store/category'
import AppHeader from '../components/common/AppHeader.vue'
import TaskForm from '../components/task/TaskForm.vue'
import TaskList from '../components/task/TaskList.vue'
import CategoryManagement from '../components/task/CategoryManagement.vue'

const router = useRouter()
const taskStore = useTaskStore()
const categoryStore = useCategoryStore() // 使用分类状态管理

function navigateToAbout() {
  router.push('/about')
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
    <AppHeader :show-logout-icon="true">
      <template #left-actions>
        <button class="icon-button about-button" @click="navigateToAbout">
          <img src="/about.svg" alt="关于" class="icon-img" />
        </button>
      </template>
      <template #default>
        <h1 class="app-title">Clear</h1>
      </template>
    </AppHeader>

    <div class="task-container">
      <TaskForm />
      <CategoryManagement />
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
  border: none;
  height: auto;
  min-height: 32px;
  white-space: nowrap;
  background-color: transparent !important;
  /* 强制移除默认背景色 */
}

.icon-img {
  width: 20px;
  /* 你可以根据需要调整图标大小 */
  height: 20px;
  /* 你可以根据需要调整图标大小 */
}

.about-button:hover {
  background-color: var(--background-color) !important;
  /* 恢复悬停时的背景效果 */
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