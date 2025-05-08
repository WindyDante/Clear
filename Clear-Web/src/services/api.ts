import { Task } from '../store/task'

// This is a mock API service that will be replaced with real API calls
// when connecting to a backend
const api = {
  login(credentials: { username: string, password: string }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: '1',
          username: credentials.username,
          token: 'mock-jwt-token'
        })
      }, 500)
    })
  },
  
  register(userData: { username: string, password: string }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: '1',
          username: userData.username,
          token: 'mock-jwt-token'
        })
      }, 500)
    })
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