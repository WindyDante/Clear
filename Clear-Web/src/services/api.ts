import { Task } from '../store/task'

// 从环境变量获取API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// 分类数据接口
interface Category {
  categoryId: number | string;
  categoryName: string;
}

// 新分类请求参数接口，调整为与后端一致的格式
interface CategoryAddRequest {
  name: string;
}

// 更新分类请求参数接口，调整为与后端一致的格式
interface CategoryUpdateRequest {
  name: string;
  id: number | string;
}

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

  // 获取任务分类列表
  async getCategories() {
    try {
      const token = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user') || '{}').tk
        : null;

      if (!token) {
        throw new Error('未登录!');
      }

      const response = await fetch(`${API_BASE_URL}/category/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });

      const result = await response.json();

      if (result.code !== 1) {
        throw new Error(result.msg || '获取分类失败');
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  },

  // 添加分类
  async addCategory(categoryName: string) {
    try {
      const token = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user') || '{}').tk
        : null;

      if (!token) {
        throw new Error('未登录!');
      }

      // 使用正确的JSON格式 { name: "分类名称" }
      const requestBody: CategoryAddRequest = {
        name: categoryName
      };

      const response = await fetch(`${API_BASE_URL}/category/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (result.code !== 1) {
        throw new Error(result.msg || '添加分类失败');
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  },

  // 更新分类
  async updateCategory(categoryId: number | string, categoryName: string) {
    try {
      const token = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user') || '{}').tk
        : null;

      if (!token) {
        throw new Error('未登录!');
      }

      // 使用正确的JSON格式 { name: "分类名称", id: 分类ID }
      const requestBody: CategoryUpdateRequest = {
        name: categoryName,
        id: categoryId
      };

      // 调试日志
      console.log('发送分类更新请求:', requestBody);

      // 尝试不同的端点URL
      // 1. 原始URL
      const originalUrl = `${API_BASE_URL}/category/update`;
      // 2. 备选URL
      const alternativeUrl = `${API_BASE_URL}/category/updateCategory`;

      // 使用原始URL发送请求
      const response = await fetch(originalUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(requestBody)
      });

      // 调试日志
      console.log('分类更新响应状态:', response.status);

      const result = await response.json();

      // 调试日志
      console.log('分类更新响应数据:', result);

      if (result.code !== 1) {
        throw new Error(result.msg || '更新分类失败');
      }

      return result.data;
    } catch (error) {
      console.error('更新分类API错误:', error);
      throw error;
    }
  },

  // 删除分类
  async deleteCategory(categoryId: number | string) {
    try {
      const token = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user') || '{}').tk
        : null;

      if (!token) {
        throw new Error('未登录!');
      }

      const response = await fetch(`${API_BASE_URL}/category/delete/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });

      const result = await response.json();

      if (result.code !== 1) {
        throw new Error(result.msg || '删除分类失败');
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  },

  getTasks(page: number, limit: number) {
    try {
      const token = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user') || '{}').tk
        : null;

      if (!token) {
        throw new Error('未登录!');
      }

      return fetch(`${API_BASE_URL}/todo/page?page=${page}&pageSize=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      })
        .then(response => response.json())
        .then(result => {
          if (result.code !== 1) {
            throw new Error(result.msg || '获取任务列表失败');
          }

          // 适配数据模型
          if (result.data && result.data.records) {
            const formattedTasks = result.data.records.map((task: any) => ({
              id: task.todoId.toString(),
              title: task.title,
              content: task.content || '',
              category: task.categoryName || '默认',
              categoryId: task.categoryId,
              dueDate: task.dueDate ? task.dueDate : null,
              completed: task.status === 0, // 0表示已完成
              createdAt: task.createdAt
            }));

            return {
              data: formattedTasks,
              totalPages: Math.ceil(result.data.total / limit),
              currentPage: page
            };
          }

          return {
            data: [],
            totalPages: 0,
            currentPage: 1
          };
        });
    } catch (error) {
      throw error;
    }
  },

  addTask(task: Omit<Task, 'id' | 'completed' | 'createdAt'>) {
    const token = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user') || '{}').tk
      : null;

    if (!token) {
      throw new Error('未登录!');
    }

    // 将前端Task模型转换为后端TodoDTO模型
    const todoDTO = {
      title: task.title,
      content: task.content || '',
      categoryId: task.categoryId,
      dueDate: task.dueDate
    };

    return fetch(`${API_BASE_URL}/todo/addTodo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(todoDTO)
    })
      .then(response => response.json())
      .then(result => {
        if (result.code !== 1) {
          throw new Error(result.msg || '添加任务失败');
        }

        // 构造一个临时的任务对象返回
        const newTask: Task = {
          id: new Date().getTime().toString(), // 临时ID，实际上应该由后端返回
          title: task.title,
          content: task.content || '',
          category: task.category || '默认',
          categoryId: task.categoryId,
          dueDate: task.dueDate,
          completed: false,
          createdAt: new Date().toISOString()
        };

        return newTask;
      });
  },

  updateTask(taskId: string, updates: Partial<Task>) {
    const token = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user') || '{}').tk
      : null;

    if (!token) {
      throw new Error('未登录!');
    }

    // 构造更新DTO
    const updateDTO = {
      id: parseInt(taskId),
      title: updates.title,
      content: updates.content,
      categoryId: updates.categoryId,
      dueDate: updates.dueDate,
      status: updates.completed !== undefined ? (updates.completed ? 0 : 1) : undefined
    };

    return fetch(`${API_BASE_URL}/todo/updateTodo`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(updateDTO)
    })
      .then(response => response.json())
      .then(result => {
        if (result.code !== 1) {
          throw new Error(result.msg || '更新任务失败');
        }
        return true;
      });
  },

  deleteTask(taskId: string) {
    const token = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user') || '{}').tk
      : null;

    if (!token) {
      throw new Error('未登录!');
    }

    return fetch(`${API_BASE_URL}/todo/deleteTodo/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    })
      .then(response => response.json())
      .then(result => {
        if (result.code !== 1) {
          throw new Error(result.msg || '删除任务失败');
        }
        return true;
      });
  }
}

export default api