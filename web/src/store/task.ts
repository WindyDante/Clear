import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import api from '../services/api'
import { useToast } from '../composables/useToast'

export interface Task {
  id: string
  title: string
  content: string
  category: string
  categoryId?: number | string
  dueDate: string | null
  completed: boolean
  createdAt: string
}

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const currentPage = ref(1)
  const totalPages = ref(1)
  // 每页条数可配置，默认从本地存储读取，回退到10
  const persistedPageSize = localStorage.getItem('task.pageSize')
  const pageSize = ref(persistedPageSize ? parseInt(persistedPageSize) : 10)
  const selectedCategoryId = ref<string | number | undefined>(undefined)
  const selectedStatus = ref<number | undefined>(undefined)
  const selectedStartDate = ref<string | undefined>(undefined) // 新增：开始日期筛选
  const selectedEndDate = ref<string | undefined>(undefined)   // 新增：结束日期筛选
  const searchKeyword = ref<string | undefined>(undefined)    // 新增：关键字筛选
  const isInitialized = ref(false) // 新增：标记是否已初始化
  const { showToast } = useToast()

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

    // 避免重复请求的标记，但重置筛选条件或切换页码时仍需请求新数据
    loading.value = true
    try {
      const response = await api.getTasks(
        currentPage.value,
        pageSize.value,
        selectedCategoryId.value,
        selectedStatus.value,
        selectedStartDate.value, // 传递开始日期
        selectedEndDate.value,   // 传递结束日期
        searchKeyword.value      // 传递关键字
      )
      tasks.value = response.data
      totalPages.value = response.totalPages
      isInitialized.value = true
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
      const addedTask = await api.addTask(task)

      // Ensure we are on the first page to see the new task
      if (currentPage.value !== 1) {
        currentPage.value = 1
      }

      // Refresh the task list from the server
      await fetchTasks()

      showToast(`任务 \"${addedTask.title}\" 添加成功`, 'success')
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
      const success = await api.updateTask(taskId, updates)
      if (success) {
        // 判断是否是状态更新（完成/未完成）
        const isStatusUpdate = updates.completed !== undefined;

        // 如果是状态更改且用户当前正在按状态筛选
        if (isStatusUpdate && selectedStatus.value !== undefined) { // Corrected: used selectedStatus.value
          // 1. 任务从未完成变为已完成，且用户在查看未完成任务
          // 2. 任务从已完成变为未完成，且用户在查看已完成任务
          // 这两种情况下，该任务应该从当前筛选视图中被移除，需要刷新列表
          const newCompletedStatus = updates.completed;
          // 检查是否需要从当前筛选结果中移除任务
          const shouldRemoveFromFilter =
            (selectedStatus.value === 1 && newCompletedStatus === true) || // 进行中筛选，任务变为已完成
            (selectedStatus.value === 2 && newCompletedStatus === false);  // 已完成筛选，任务变为进行中

          if (shouldRemoveFromFilter) {
            showToast(`任务已标记为${updates.completed ? '完成' : '未完成'}`, 'success');
            // 需要刷新列表，因为该任务不再属于当前筛选条件
            return await fetchTasks();
          }
        }

        // 其他情况下，本地更新任务数据
        const index = tasks.value.findIndex(t => t.id === taskId);
        if (index !== -1) {
          tasks.value[index] = { ...tasks.value[index], ...updates };
          if (isStatusUpdate) {
            showToast(`任务已标记为${updates.completed ? '完成' : '未完成'}`, 'success');
          } else {
            showToast('任务更新成功', 'success');
          }
        }
      } else {
        console.error('Error updating task: API returned failure')
        throw new Error('Task update failed')
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
      showToast('任务删除成功', 'success')

      // 本地删除该任务
      tasks.value = tasks.value.filter(t => t.id !== taskId)

      // 如果删除后当前页任务数小于设定值且不是最后一页，需获取下一页的一条数据
      if (tasks.value.length < pageSize.value && currentPage.value < totalPages.value) {
        // 只需要一次网络请求，获取下一页第一条数据
        const nextPageData = await api.getTasks(
          currentPage.value + 1,
          1, // 只需要一条数据
          selectedCategoryId.value,
          selectedStatus.value,
          selectedStartDate.value,
          selectedEndDate.value,
          searchKeyword.value
        )

        // 如果有数据，添加到当前页
        if (nextPageData.data && nextPageData.data.length > 0) {
          tasks.value.push(nextPageData.data[0])
        }

        // 更新总页数，但不改变当前页码
        totalPages.value = nextPageData.totalPages
      }
      // 如果删除后没有数据且当前页不是第一页，跳到上一页
      else if (tasks.value.length === 0 && currentPage.value > 1) {
        currentPage.value--
        await fetchTasks()
      }
      // 如果删除后当前页没有数据且是第一页，更新总页数
      else if (tasks.value.length === 0 && currentPage.value === 1) {
        totalPages.value = 0
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    } finally {
      loading.value = false
    }
  }

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

  // 新增：跳转到指定页
  function goToPage(page: number) {
    const targetPage = Math.max(1, Math.min(page, totalPages.value))
    if (targetPage !== currentPage.value) {
      currentPage.value = targetPage
      fetchTasks()
    }
  }

  // 新增：设置每页条数
  function setPageSize(size: number) {
    if (size > 0 && size !== pageSize.value) {
      pageSize.value = size
      localStorage.setItem('task.pageSize', size.toString())
      currentPage.value = 1 // 重置到第一页
      fetchTasks()
    }
  }

  function setCategory(categoryId: string | number | undefined) {
    if (selectedCategoryId.value === categoryId) return
    selectedCategoryId.value = categoryId
    currentPage.value = 1 // 重置到第一页
    fetchTasks()
  }

  function setStatus(status: number | undefined) {
    if (selectedStatus.value === status) return
    selectedStatus.value = status
    currentPage.value = 1 // 重置到第一页
    fetchTasks()
  }

  function setDateRange(startDate?: string, endDate?: string) {
    // 校验日期格式 yyyy-MM-dd
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (startDate && !dateRegex.test(startDate)) {
      showToast('开始日期格式不正确，应为 yyyy-MM-dd', 'error');
      return;
    }
    if (endDate && !dateRegex.test(endDate)) {
      showToast('结束日期格式不正确，应为 yyyy-MM-dd', 'error');
      return;
    }

    selectedStartDate.value = startDate
    selectedEndDate.value = endDate
    currentPage.value = 1 // 重置到第一页
    fetchTasks()
  }

  function setKeyword(keyword?: string) {
    searchKeyword.value = keyword
    currentPage.value = 1 // 重置到第一页
    fetchTasks()
  }

  function clearFilters() {
    selectedCategoryId.value = undefined
    selectedStatus.value = undefined
    selectedStartDate.value = undefined
    selectedEndDate.value = undefined
    searchKeyword.value = undefined
    currentPage.value = 1
    fetchTasks()
  }

  // 重置状态（用于登出时）
  function reset() {
    tasks.value = []
    currentPage.value = 1
    totalPages.value = 1
    selectedCategoryId.value = undefined
    selectedStatus.value = undefined
    selectedStartDate.value = undefined
    selectedEndDate.value = undefined
    searchKeyword.value = undefined
    isInitialized.value = false
  }

  return {
    tasks,
    loading,
    currentPage,
    totalPages,
    pageSize,
    pendingTasks,
    completedTasks,
    totalCompletedTasks,
    totalPendingTasks,
    selectedCategoryId,
    selectedStatus,
    selectedStartDate,
    selectedEndDate,
    searchKeyword,
    isInitialized,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    nextPage,
    prevPage,
    goToPage,
    setPageSize,
    getTaskById,
    setCategory,
    setStatus,
    setDateRange,
    setKeyword,
    clearFilters,
    reset
  }
})