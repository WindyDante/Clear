import { Task } from '../store/task'
import { useToast } from '../composables/useToast'

// 从环境变量获取API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// 全局的Toast函数 - 由于组合API不能在模块作用域直接调用，我们将延迟获取它
let _showToast: ReturnType<typeof useToast>['showToast'] | null = null;

// 获取Toast函数的辅助函数
function getToastFunction() {
  if (!_showToast) {
    const { showToast } = useToast();
    _showToast = showToast;
  }
  return _showToast;
}

// 通用API响应处理函数
async function handleApiResponse<T>(
  apiCall: () => Promise<any>,
  errorMessage = '操作失败'
): Promise<T> {
  let errorToThrow: Error | null = null;
  try {
    const response = await apiCall();
    const result = await response.json();

    if (result.code !== 1) {
      // Prepare error to be thrown, toast will be shown in the catch block
      errorToThrow = new Error(result.msg || errorMessage);
      throw errorToThrow;
    }
    return result.data;
  } catch (error) {
    const showToast = getToastFunction();
    // Use message from errorToThrow if it's set (API logical error),
    // otherwise use the caught error's message or the default errorMessage.
    const message = errorToThrow ? errorToThrow.message : (error instanceof Error ? error.message : errorMessage);
    showToast(message, 'error');
    throw errorToThrow || error; // Rethrow the specific error or the caught one
  }
}

// 辅助函数：将日期格式化为 "yyyy-MM-dd HH:mm:ss" 格式
function formatDateToString(dateString: string | null): string | null {
  if (!dateString) return null;

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 分类数据接口
interface Category {
  categoryId: string; // 改为只使用字符串类型
  categoryName: string;
}

// 新分类请求参数接口，调整为与后端一致的格式
interface CategoryAddRequest {
  name: string;
}

// 更新分类请求参数接口，调整为与后端一致的格式
interface CategoryUpdateRequest {
  name: string;
  id: string; // 改为只使用字符串类型
}

// API服务
const api = {
  async login(credentials: { username: string, password: string }) {
    return handleApiResponse<any>(
      () => fetch(`${API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      }),
      '登录失败'
    );
  },

  async register(userData: { username: string, password: string }) {
    return handleApiResponse<any>(
      () => fetch(`${API_BASE_URL}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      }),
      '注册失败'
    );
  },

  // 获取任务分类列表
  async getCategories() {
    const token = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user') || '{}').tk
      : null;

    if (!token) {
      throw new Error('未登录!');
    }

    return handleApiResponse<any>(
      () => fetch(`${API_BASE_URL}/category/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      }),
      '获取分类失败'
    );
  },

  // 添加分类
  async addCategory(categoryName: string) {
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

    return handleApiResponse<any>(
      () => fetch(`${API_BASE_URL}/category/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(requestBody)
      }),
      '添加分类失败'
    );
  },

  // 更新分类
  async updateCategory(categoryId: number | string, categoryName: string) {
    const token = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user') || '{}').tk
      : null;

    if (!token) {
      throw new Error('未登录!');
    }

    // 使用正确的JSON格式 { name: "分类名称", id: 分类ID }
    const requestBody: CategoryUpdateRequest = {
      name: categoryName,
      id: categoryId.toString() // 确保ID是字符串
    };

    return handleApiResponse<any>(
      () => fetch(`${API_BASE_URL}/category/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(requestBody)
      }),
      '更新分类失败'
    );
  },

  // 删除分类
  async deleteCategory(categoryId: number | string) {
    const token = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user') || '{}').tk
      : null;

    if (!token) {
      throw new Error('未登录!');
    }

    return handleApiResponse<any>(
      () => fetch(`${API_BASE_URL}/category/delete/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      }),
      '删除分类失败'
    );
  },

  getTasks(page: number, limit: number, categoryId?: string | number, status?: number) {
    const token = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user') || '{}').tk
      : null;

    if (!token) {
      throw new Error('未登录!');
    }

    // 构建URL，添加可选的categoryId和status参数
    let url = `${API_BASE_URL}/todo/page?page=${page}&pageSize=${limit}`;
    if (categoryId) {
      url += `&categoryId=${categoryId}`;
    }
    if (status !== undefined) {
      url += `&status=${status}`;
    }

    return handleApiResponse<any>(
      () => fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      }),
      '获取任务列表失败'
    ).then(data => {
      if (data && data.records) {
        const formattedTasks = data.records.map((task: any) => {
          return {
            id: task.id ? task.id.toString() : Date.now().toString(),
            title: task.title || '',
            content: task.content || '',
            category: task.categoryName || '默认',
            categoryId: task.categoryId || 0,
            dueDate: task.dueDate ? task.dueDate : null,
            completed: task.status === 1, // Backend status 1 means completed
            createdAt: task.createdAt || new Date().toISOString()
          };
        });

        return {
          data: formattedTasks,
          totalPages: Math.ceil(data.total / limit),
          currentPage: page
        };
      }

      return {
        data: [],
        totalPages: 0,
        currentPage: 1
      };
    });
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
      dueDate: formatDateToString(task.dueDate) // 使用格式化函数转换为"yyyy-MM-dd HH:mm:ss"格式
    };

    return handleApiResponse<any>(
      () => fetch(`${API_BASE_URL}/todo/addTodo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(todoDTO)
      }),
      '添加任务失败'
    ).then(data => {
      // 构造一个任务对象返回
      const newTask: Task = {
        id: data?.id || new Date().getTime().toString(), // 如果后端返回ID则使用，否则使用临时ID
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

    let updatePayload: { id: string; status?: number; title?: string; content?: string; categoryId?: number | string; dueDate?: string | null } = { id: taskId };

    // 检查是否为状态更新（完成/未完成）
    if (updates.completed !== undefined && Object.keys(updates).length === 1 && 'completed' in updates) {
      updatePayload.status = updates.completed ? 1 : 0; // 1表示完成，0表示未完成
    } else {
      // 其他字段的更新
      if (updates.title !== undefined) {
        updatePayload.title = updates.title;
      }
      if (updates.content !== undefined) {
        updatePayload.content = updates.content;
      }
      if (updates.categoryId !== undefined) {
        updatePayload.categoryId = updates.categoryId;
      }
      if (updates.dueDate !== undefined) {
        updatePayload.dueDate = formatDateToString(updates.dueDate);
      }
      if (updates.completed !== undefined) {
        updatePayload.status = updates.completed ? 1 : 0;
      }
    }

    return handleApiResponse<any>(
      () => fetch(`${API_BASE_URL}/todo/updateTodo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(updatePayload)
      }),
      '更新任务失败'
    );
  },

  deleteTask(taskId: string) {
    const token = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user') || '{}').tk
      : null;

    if (!token) {
      throw new Error('未登录!');
    }

    return handleApiResponse<boolean>(
      () => fetch(`${API_BASE_URL}/todo/deleteTodo/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      }),
      '删除任务失败'
    ).then(() => true);
  }
}

export default api