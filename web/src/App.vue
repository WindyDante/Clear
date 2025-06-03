<script setup lang="ts">
import { onMounted, watch } from 'vue'; // 导入 watch
import { RouterView } from 'vue-router';
import { useTaskStore } from './store/task';
import { useCategoryStore } from './store/category';
import { useAuthStore } from './store/auth';
import AppToast from './components/common/AppToast.vue';
import { useTheme } from './composables/useTheme';

const authStore = useAuthStore();
const { initTheme } = useTheme(); // 获取 initTheme

// 初始化主题：在应用加载时，如果用户已登录，则加载用户的主题偏好
// 如果用户未登录，则加载默认主题。
// initTheme(); // 旧的调用位置，现在改为在 onMounted 中或 watch isAuthenticated 之后调用

const taskStore = useTaskStore();
const categoryStore = useCategoryStore();

// 在App级别初始化数据，确保全局只请求一次
onMounted(async () => {
  // 首先尝试初始化主题，这会基于 localStorage 中的用户信息（如果存在）
  initTheme();

  // 只有登录后才需要加载数据
  if (authStore.isAuthenticated) {
    console.log('App.vue: 用户已认证，检查并初始化必要的应用数据');

    // 加载分类数据（如果需要）
    if (!categoryStore.isLoaded) {
      console.log('App.vue: 初始化分类数据');
      await categoryStore.fetchCategories();
    }

    // 加载任务数据（如果需要）
    if (!taskStore.isInitialized) {
      console.log('App.vue: 初始化任务数据');
      await taskStore.fetchTasks();
    }
  }
});

// 监听登录状态变化，在用户登录后再次调用 initTheme
// 这确保了如果用户在应用启动时尚未登录，但在之后登录，其主题偏好也能被应用
watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    console.log('App.vue: 用户登录状态改变，重新初始化主题');
    initTheme();
    // 如果登录后需要立即加载其他数据，也可以在这里触发
    // 例如，如果分类和任务数据也应该在登录后立即加载，而不是等待 onMounted
    if (!categoryStore.isLoaded) {
      categoryStore.fetchCategories();
    }
    if (!taskStore.isInitialized) {
      taskStore.fetchTasks();
    }
  }
  // 对于登出情况，initTheme 也会处理（通常会应用默认主题）
  // 如果登出时需要清除特定数据，可以在这里添加逻辑
  else {
    console.log('App.vue: 用户已登出，主题将重置为默认（由 initTheme 处理）');
    initTheme(); // 确保登出后应用默认主题
  }
});
</script>

<template>
  <div class="app">
    <RouterView />
    <AppToast />
  </div>
</template>

<style>
:root {
  --primary-color: #42b883;
  --primary-light: #b8e6d4;
  --primary-dark: #34495e;
  --accent-color: #ff7043;
  --background-color: #f5f7fa;
  --card-color: #ffffff;
  --text-color: #333333;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --danger-color: #ff5252;
  --success-color: #4caf50;
  --warning-color: #ffc107;
  --border-radius: 8px;
  --transition-speed: 0.3s;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', 'PingFang SC', 'Helvetica Neue', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  width: 100%;
  height: 100%;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  background-color: var(--background-color);
}

a {
  text-decoration: none;
  color: var(--primary-color);
  transition: color var(--transition-speed);
}

a:hover {
  color: var(--primary-dark);
}

button,
.btn {
  cursor: pointer;
  border: none;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition-speed);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:hover {
  background-color: var(--primary-light);
}

.card {
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  font-size: 14px;
  transition: border-color var(--transition-speed);
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
}

.text-danger {
  color: var(--danger-color);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-speed);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>