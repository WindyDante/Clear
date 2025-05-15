import { Task } from '../store/task'

// 从环境变量获取API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// API服务
const api = {
  async login(credentials: { username: string, password: string }) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      const result = await response.json()

      if (result.code !== 1) {
        throw new Error(result.msg || '登录失败')
      }

      return result.data
    } catch (error) {
      throw error
    }
  },

  async register(userData: { username: string, password: string }) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const result = await response.json()

      if (result.code !== 1) {
        throw new Error(result.msg || '注册失败')
      }

      return result.data
    } catch (error) {
      throw error
    }
  },

  getTasks(page: number, limit: number) {
    return new Promise<{ data: Task[], totalPages: number }>((resolve) => {
      setTimeout(() => {
        // This would normally come from the server
        const mockTasks = window.$mockTasks || []

        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedTasks = mockTasks.slice(startIndex, endIndex)

        resolve({
          data: paginatedTasks,
          totalPages: Math.ceil(mockTasks.length / limit)
        })
      }, 500)
    })
  },

  addTask(task: Omit<Task, 'id' | 'completed' | 'createdAt'>) {
    return new Promise<Task>((resolve) => {
      setTimeout(() => {
        const newTask: Task = {
          id: Date.now().toString(),
          ...task,
          completed: false,
          createdAt: new Date().toISOString()
        }

        // Add to our mock data
        window.$mockTasks = [newTask, ...(window.$mockTasks || [])]

        resolve(newTask)
      }, 500)
    })
  },

  updateTask(taskId: string, updates: Partial<Task>) {
    return new Promise<Task>((resolve) => {
      setTimeout(() => {
        const mockTasks = window.$mockTasks || []
        const taskIndex = mockTasks.findIndex((t: Task) => t.id === taskId)

        if (taskIndex !== -1) {
          const updatedTask = { ...mockTasks[taskIndex], ...updates }
          mockTasks[taskIndex] = updatedTask
          window.$mockTasks = mockTasks

          resolve(updatedTask)
        } else {
          throw new Error('Task not found')
        }
      }, 500)
    })
  },

  deleteTask(taskId: string) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const mockTasks = window.$mockTasks || []
        window.$mockTasks = mockTasks.filter((t: Task) => t.id !== taskId)
        resolve()
      }, 500)
    })
  }
}

export default api