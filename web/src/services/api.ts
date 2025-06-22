import { Task } from '../store/task'
import { useToast } from '../composables/useToast'

// 从环境变量获取API基础URL，如果未定义则使用默认值
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

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
  errorMessage = '操作失败',
  showSuccessToast = false // 改名并默认为false，只在需要时显示成功Toast
): Promise<T> {
  const showToast = getToastFunction();

  try {
    const response = await apiCall();

    // 检查HTTP响应状态
    if (!response.ok) {
      // 尝试解析响应体以获取错误信息
      try {
        const errorResult = await response.json();
        // 只显示后端返回的msg，如果没有msg则不显示toast
        if (errorResult.msg) {
          showToast(errorResult.msg, 'error');
          throw new Error(errorResult.msg);
        } else {
          // 如果后端没有返回msg，抛出错误但不显示toast
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (parseError) {
        // 如果无法解析JSON，抛出错误但不显示toast
        throw new Error(`HTTP ${response.status}`);
      }
    }

    const result = await response.json();

    // 检查业务状态码
    if (result.code !== 1) {
      // 失败情况：只使用后端返回的msg，如果没有msg则不显示toast
      if (result.msg) {
        showToast(result.msg, 'error');
        throw new Error(result.msg);
      } else {
        // 如果后端没有返回msg，抛出错误但不显示toast
        throw new Error('操作失败');
      }
    }

    // 成功情况：只在明确需要时显示Toast
    if (showSuccessToast) {
      if (result.msg) {
        // 优先显示msg
        showToast(result.msg, 'success');
      } else if (result.data && typeof result.data === 'string') {
        // 如果没有msg但data是字符串，显示data内容
        showToast(result.data, 'success');
      }
    }

    return result.data;
  } catch (error) {
    // 对于网络错误等，不显示任何toast，只抛出错误
    throw error;
  }
}

// 辅助函数：将日期格式化为 "yyyy-MM-dd HH:mm:ss" 格式（避免时区转换）
function formatDateToString(dateString: string | null): string | null {
  if (!dateString) return null;

  const date = new Date(dateString);
  // 使用本地时间而非 UTC 时间，避免时区转换
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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

  // 更新用户主题
  async updateUserTheme(themeId: number) {
    const token = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user') || '{}').tk
      : null;

    if (!token) {
      // 对于主题更新，如果未登录，可以选择静默失败或不调用API
      // 这里我们选择不抛出错误，让 useTheme 自行处理
      console.warn('User not logged in, theme update not sent to API.');
      // 返回一个符合预期的成功结构，但标记为本地更改
      return { code: 1, msg: '本地主题更新（未登录）', data: '主题设置已应用（本地）' };
    }

    return handleApiResponse<{ code: number; msg: string | null; data: string }>(
      () => fetch(`${API_BASE_URL}/user/theme/${themeId}`, { // 使用模板字符串构建URL
        method: 'PUT', // 通常更新操作使用 PUT 或 PATCH
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // body: JSON.stringify({ themeId }) // 如果API需要请求体
      }),
      '更新主题失败',
      true // 在toast中显示data
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
      () => fetch(`${API_BASE_URL}/category`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
      () => fetch(`${API_BASE_URL}/category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
      () => fetch(`${API_BASE_URL}/category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
      () => fetch(`${API_BASE_URL}/category/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }),
      '删除分类失败'
    );
  },

  getTasks(page: number, limit: number, categoryId?: string | number, status?: number, startDate?: string, endDate?: string, keyword?: string) {
    const token = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user') || '{}').tk
      : null;

    if (!token) {
      throw new Error('未登录!');
    }

    // 构建URL，添加可选的categoryId和status参数
    let url = `${API_BASE_URL}/todo?page=${page}&pageSize=${limit}`;
    if (categoryId) {
      url += `&categoryId=${categoryId}`;
    }
    if (status !== undefined) {
      url += `&status=${status}`;
    }
    if (startDate) {
      url += `&startDate=${startDate}`;
    }
    if (endDate) {
      url += `&endDate=${endDate}`;
    }
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }

    return handleApiResponse<any>(
      () => fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
            completed: task.status === 2, // Backend status 2 means completed
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
      () => fetch(`${API_BASE_URL}/todo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
      updatePayload.status = updates.completed ? 2 : 1; // 2表示已完成，1表示进行中
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
        updatePayload.status = updates.completed ? 2 : 1;
      }
    }

    return handleApiResponse<any>(
      () => fetch(`${API_BASE_URL}/todo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

    return handleApiResponse<string>(
      () => fetch(`${API_BASE_URL}/todo/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }),
      '删除任务失败'
    );
  },

  // 获取用户任务统计信息
  async getUserTaskStatus() {
    const token = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user') || '{}').tk
      : null;

    if (!token) {
      throw new Error('未登录!');
    }

    return handleApiResponse<{ numOfDone: number; numOfUndone: number }>(
      () => fetch(`${API_BASE_URL}/user/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }),
      '获取任务统计失败'
    );
  },

  // 修改密码
  async updatePassword(oldPassword: string, newPassword: string) {
    const token = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user') || '{}').tk
      : null;

    if (!token) {
      throw new Error('未登录!');
    }

    return handleApiResponse<string>(
      () => fetch(`${API_BASE_URL}/user/pwd`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword,
          newPassword
        })
      }),
      '修改密码失败',
      true // 启用展示msg到toast
    );
  }
}

export default api