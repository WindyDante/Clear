import Mock from 'mockjs'
import { Task } from '../store/task'

declare global {
  interface Window {
    $mockTasks: Task[]
  }
}

// Initialize mock data
const categories = ['默认', '工作', '学习', '生活', '娱乐']

// Generate mock tasks
const mockTasks: Task[] = Array.from({ length: 15 }, (_, index) => ({
  id: (index + 1).toString(),
  title: Mock.Random.ctitle(5, 10),
  content: Mock.Random.cparagraph(1, 3),
  category: Mock.Random.pick(categories),
  dueDate: Mock.Random.boolean(0.7) 
    ? Mock.Random.date('yyyy-MM-dd') 
    : null,
  completed: Mock.Random.boolean(0.3),
  createdAt: Mock.Random.date('yyyy-MM-dd')
}))

// Add first item as shown in the UI
mockTasks.unshift({
  id: '0',
  title: '今日无事，好好休息吧！',
  content: '放松一下',
  category: '生活',
  dueDate: null,
  completed: false,
  createdAt: new Date().toISOString()
})

// Add to window for access
window.$mockTasks = mockTasks