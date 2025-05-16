import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import api from '../services/api'

export interface Task {
  id: string
  title: string
  content: string
  category: string
  categoryId?: number | string // 添加分类ID字段
  dueDate: string | null
  completed: boolean
  createdAt: string
}

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const itemsPerPage = 10
  // 添加分类ID和任务状态筛选参数
  const selectedCategoryId = ref<string | number | undefined>(undefined)
  const selectedStatus = ref<number | undefined>(undefined)

  const authStore = useAuthStore()

  const pendingTasks = computed(() =>
    tasks.value.filter(task => !task.completed)
  )

  const completedTasks = computed(() =>
    tasks.value.filter(task => task.completed)
  )

  const totalCompletedTasks = computed(() => completedTasks.value.length)
  const totalPendingTasks = computed(() => pendingTasks.value.length)

  async function fetchTasks() {
    if (!authStore.isAuthenticated) return

    loading.value = true
    try {
      const response = await api.getTasks(
        currentPage.value,
        itemsPerPage,
        selectedCategoryId.value,
        selectedStatus.value
      )
      tasks.value = response.data
      totalPages.value = response.totalPages
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      loading.value = false
    }
  }

  async function addTask(task: Omit<Task, 'id' | 'completed' | 'createdAt'>) {
    if (!authStore.isAuthenticated) return

    loading.value = true
    try {
      const response = await api.addTask(task)
      tasks.value.unshift(response)
    } catch (error) {
      console.error('Error adding task:', error)
    } finally {
      loading.value = false
    }
  }

  async function updateTask(taskId: string, updates: Partial<Task>) {
    if (!authStore.isAuthenticated) return

    loading.value = true
    try {
      const response = await api.updateTask(taskId, updates)
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = response
      }
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      loading.value = false
    }
  }

  async function deleteTask(taskId: string) {
    if (!authStore.isAuthenticated) return

    loading.value = true
    try {
      await api.deleteTask(taskId)
      tasks.value = tasks.value.filter(t => t.id !== taskId)
    } catch (error) {
      console.error('Error deleting task:', error)
    } finally {
      loading.value = false
    }
  }

  // 根据ID获取任务的方法
  function getTaskById(taskId: string): Task | undefined {
    return tasks.value.find(task => task.id === taskId)
  }

  async function toggleTaskCompletion(taskId: string) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return

    await updateTask(taskId, { completed: !task.completed })
  }

  function nextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
      fetchTasks()
    }
  }

  function prevPage() {
    if (currentPage.value > 1) {
      currentPage.value--
      fetchTasks()
    }
  }

  // 添加设置分类筛选的方法
  function setCategory(categoryId: string | number | undefined) {
    if (selectedCategoryId.value === categoryId) return
    selectedCategoryId.value = categoryId
    currentPage.value = 1 // 重置到第一页
    fetchTasks()
  }

  // 添加设置任务状态筛选的方法
  function setStatus(status: number | undefined) {
    if (selectedStatus.value === status) return
    selectedStatus.value = status
    currentPage.value = 1 // 重置到第一页
    fetchTasks()
  }

  // 清除所有筛选条件
  function clearFilters() {
    selectedCategoryId.value = undefined
    selectedStatus.value = undefined
    currentPage.value = 1
    fetchTasks()
  }

  return {
    tasks,
    loading,
    currentPage,
    totalPages,
    pendingTasks,
    completedTasks,
    totalCompletedTasks,
    totalPendingTasks,
    selectedCategoryId,
    selectedStatus,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    nextPage,
    prevPage,
    getTaskById,
    setCategory,
    setStatus,
    clearFilters
  }
})