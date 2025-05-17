<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTaskStore } from '../../store/task'
import { useCategoryStore } from '../../store/category'
import { useToast } from '../../composables/useToast' // 引入 Toast 功能

defineProps<{
  title: string
}>()

const taskStore = useTaskStore()
const categoryStore = useCategoryStore()
const { showToast } = useToast() // 使用 Toast 功能

// 添加对所有任务的引用，而不仅仅是待办任务
const tasksToShow = computed(() => {
  return taskStore.tasks
})

// 用于UI展示的当前筛选条件
const currentFilters = computed(() => {
  const filters = []
  
  // 显示分类筛选条件
  if (taskStore.selectedCategoryId !== undefined) {
    const categoryName = categoryStore.categories.find(c => c.categoryId === taskStore.selectedCategoryId)?.categoryName || '未知分类'
    filters.push(`分类: ${categoryName}`)
  }
  
  // 显示状态筛选条件
  if (taskStore.selectedStatus !== undefined) {
    filters.push(`状态: ${taskStore.selectedStatus === 1 ? '已完成' : '未完成'}`)
  }
  
  return filters
})

async function handleToggleCompletion(taskId: string) {
  try {
    const task = taskStore.getTaskById(taskId)
    await taskStore.toggleTaskCompletion(taskId)
    
    if (task) {
      // 根据任务是否完成显示对应的 Toast
      showToast(`任务"${task.title}"已标记为${task.completed ? '未完成' : '完成'}`, 'success')
    }
  } catch (error) {
    showToast('操作失败，请重试', 'error')
  }
}

async function handleDeleteTask(taskId: string) {
  try {
    const task = taskStore.getTaskById(taskId)
    await taskStore.deleteTask(taskId)
    
    if (task) {
      showToast(`任务"${task.title}"已删除`, 'info')
    }
  } catch (error) {
    showToast('删除失败，请重试', 'error')
  }
}

// 格式化创建时间的函数
function formatCreatedAt(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化截止日期的函数
function formatDueDate(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// For pagination
function goToPreviousPage() {
  taskStore.prevPage()
}

function goToNextPage() {
  taskStore.nextPage()
}

// 设置分类筛选
function filterByCategory(categoryId: number | string | undefined) {
  taskStore.setCategory(categoryId)
}

// 设置任务状态筛选
function filterByStatus(status: number | undefined) {
  taskStore.setStatus(status)
}

// 清除所有筛选条件
function clearAllFilters() {
  taskStore.clearFilters()
}

// 确保组件挂载时加载分类数据和任务数据
onMounted(async () => {
  // 加载分类数据
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories()
  }
  
  // 加载任务数据
  await taskStore.fetchTasks()
})
</script>

<template>
  <div class="task-list">
    <h3 class="list-title">
      <span class="icon">📋</span> {{ title }}
    </h3>
    
    <!-- 筛选控件 -->
    <div class="filters-section">
      <div class="filter-controls">
        <!-- 分类筛选 -->
        <div class="filter-group">
          <label>分类筛选:</label>
          <div class="filter-buttons">
            <button class="filter-btn" 
              :class="{ 'active': taskStore.selectedCategoryId === undefined }"
              @click="filterByCategory(undefined)">全部</button>
            <button v-for="category in categoryStore.categories" 
              :key="category.categoryId"
              class="filter-btn"
              :class="{ 'active': taskStore.selectedCategoryId === category.categoryId }"
              @click="filterByCategory(category.categoryId)">
              {{ category.categoryName }}
            </button>
          </div>
        </div>
        
        <!-- 状态筛选 -->
        <div class="filter-group">
          <label>状态筛选:</label>
          <div class="filter-buttons">
            <button class="filter-btn" 
              :class="{ 'active': taskStore.selectedStatus === undefined }"
              @click="filterByStatus(undefined)">全部</button>
            <button class="filter-btn" 
              :class="{ 'active': taskStore.selectedStatus === 0 }"
              @click="filterByStatus(0)">未完成</button>
            <button class="filter-btn" 
              :class="{ 'active': taskStore.selectedStatus === 1 }"
              @click="filterByStatus(1)">已完成</button>
          </div>
        </div>
      </div>
      
      <!-- 显示当前筛选 -->
      <div v-if="currentFilters.length > 0" class="active-filters">
        <span>当前筛选: </span>
        <div class="filter-tags">
          <span v-for="(filter, index) in currentFilters" :key="index" class="filter-tag">
            {{ filter }}
          </span>
          <button class="clear-filters-btn" @click="clearAllFilters">清除筛选</button>
        </div>
      </div>
    </div>
    
    <div v-if="taskStore.loading" class="loading-indicator">
      加载中...
    </div>
    
    <div v-else-if="tasksToShow.length === 0" class="empty-state">
      <p>没有任务</p>
    </div>
    
    <div v-else class="tasks-container">
      <div
        v-for="task in tasksToShow"
        :key="task.id"
        class="task-item"
        :class="{ 'completed': task.completed }"
      >
        <div class="task-content">
          <div class="task-header">
            <div class="task-info">
              <span class="task-time">{{ formatCreatedAt(task.createdAt) }}</span>
              <span v-if="task.category" class="task-category">{{ task.category }}</span>
              <span class="task-status" :class="task.completed ? 'status-completed' : 'status-pending'">
                {{ task.completed ? '已完成' : '未完成' }}
              </span>
            </div>
            <div class="task-actions">
              <button class="action-btn toggle-btn" @click="handleToggleCompletion(task.id)">
                <span class="icon">{{ task.completed ? '↺' : '✓' }}</span>
              </button>
              <button class="action-btn delete-btn" @click="handleDeleteTask(task.id)">
                <span class="icon">🗑️</span>
              </button>
            </div>
          </div>
          <h4 class="task-title">{{ task.title }}</h4>
          <p v-if="task.content" class="task-description">{{ task.content }}</p>
          <p v-if="task.dueDate" class="task-due-date">截止日期: {{ formatDueDate(task.dueDate) }}</p>
        </div>
      </div>
      
      <!-- Pagination -->
      <div class="pagination" v-if="taskStore.totalPages > 1">
        <button 
          class="pagination-btn" 
          :disabled="taskStore.currentPage === 1"
          @click="goToPreviousPage"
        >
          &lt;
        </button>
        <span class="current-page">{{ taskStore.currentPage }}</span>
        <button 
          class="pagination-btn" 
          :disabled="taskStore.currentPage === taskStore.totalPages"
          @click="goToNextPage"
        >
          &gt;
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-list {
  margin-bottom: 24px;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.icon {
  margin-right: 8px;
  color: var(--text-primary); /* Ensure icon color is visible */
}

/* 筛选区样式 */
.filters-section {
  margin-bottom: 20px;
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  padding: 12px 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 13px;
  color: var(--text-secondary);
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filter-btn {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: transparent;
  color: var(--text-primary); /* 添加默认文字颜色 */
  cursor: pointer;
  transition: all var(--transition-speed);
}

.filter-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  flex-wrap: wrap;
}

.filter-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-tag {
  padding: 3px 8px;
  background-color: var(--primary-light);
  border-radius: var(--border-radius);
  font-size: 12px;
}

.clear-filters-btn {
  font-size: 12px;
  color: var(--primary-color);
  background: none;
  border: none;
  padding: 2px 6px;
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: background-color var(--transition-speed);
}

.clear-filters-btn:hover {
  background-color: var(--primary-light);
}

.tasks-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 12px 16px;
  transition: transform var(--transition-speed), box-shadow var(--transition-speed);
}

.task-item.completed {
  background-color: var(--background-color);
  border: 1px dashed var(--border-color);
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.task-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.task-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.task-category {
  font-size: 11px;
  background-color: var(--primary-light);
  color: var(--primary-dark); /* Changed from --primary-color for potentially better contrast */
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500; /* Added for better readability */
}

.task-status {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
}

.status-completed {
  background-color: var(--success-light);
  color: var(--success-color);
}

.status-pending {
  background-color: var(--warning-light);
  color: var(--warning-color);
}

.task-actions {
  display: flex;
  gap: 8px;
  opacity: 1;
  visibility: visible; /* Ensure actions are always visible */
}

.action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  cursor: pointer;
  transition: background-color var(--transition-speed);
}

.action-btn .icon { /* Targeting icons specifically within action buttons */
  color: var(--text-primary); /* Ensure icons in action buttons are visible */
  margin-right: 0; /* Reset margin if not needed here */
}

.toggle-btn {
  background-color: var(--primary-light);
}

.delete-btn:hover {
  background-color: var(--danger-color);
  color: white;
}

.task-title {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

.task-description {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 4px 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

.task-due-date {
  font-size: 12px;
  color: var(--primary-color);
  margin: 4px 0 0 0;
}

.loading-indicator, 
.empty-state {
  text-align: center;
  padding: 24px;
  color: var(--text-secondary);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 12px;
}

.pagination-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  background-color: var(--card-color); /* Changed to card-color for better visibility */
  border: 1px solid var(--border-color); /* Added border */
  cursor: pointer;
  color: var(--primary-color); /* Added text color for < and > */
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.current-page {
  font-weight: 600;
  color: var(--primary-color);
}
</style>