import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import api from '../services/api'

export interface Task {
  id: string
  title: string
  content: string
  category: string
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
      const response = await api.getTasks(currentPage.value, itemsPerPage)
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

  return {
    tasks,
    loading,
    currentPage,
    totalPages,
    pendingTasks,
    completedTasks,
    totalCompletedTasks,
    totalPendingTasks,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    nextPage,
    prevPage
  }
})