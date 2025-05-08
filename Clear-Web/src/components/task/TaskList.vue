<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore, Task } from '../../store/task'

defineProps<{
  title: string
}>()

const taskStore = useTaskStore()

const tasksToShow = computed(() => {
  return taskStore.pendingTasks
})

function handleToggleCompletion(taskId: string) {
  taskStore.toggleTaskCompletion(taskId)
}

function handleDeleteTask(taskId: string) {
  taskStore.deleteTask(taskId)
}

// For pagination
function goToPreviousPage() {
  taskStore.prevPage()
}

function goToNextPage() {
  taskStore.nextPage()
}
</script>

<template>
  <div class="task-list">
    <h3 class="list-title">
      <span class="icon">📋</span> {{ title }}
    </h3>
    
    <div v-if="taskStore.loading" class="loading-indicator">
      Loading...
    </div>
    
    <div v-else-if="tasksToShow.length === 0" class="empty-state">
      <p>没有待办任务</p>
    </div>
    
    <div v-else class="tasks-container">
      <div
        v-for="task in tasksToShow"
        :key="task.id"
        class="task-item"
      >
        <div class="task-content">
          <div class="task-header">
            <div class="task-number">#{{ task.id }}</div>
            <div class="task-actions">
              <button class="action-btn edit-btn" @click="handleToggleCompletion(task.id)">
                <span class="icon">✓</span>
              </button>
              <button class="action-btn delete-btn" @click="handleDeleteTask(task.id)">
                <span class="icon">🗑️</span>
              </button>
            </div>
          </div>
          <h4 class="task-title">{{ task.title }}</h4>
          <p v-if="task.content" class="task-description">{{ task.content }}</p>
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

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-number {
  font-size: 12px;
  color: var(--text-secondary);
}

.task-actions {
  display: flex;
  gap: 8px;
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

.edit-btn:hover {
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
}

.task-description {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
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
  background-color: var(--background-color);
  border: none;
  cursor: pointer;
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