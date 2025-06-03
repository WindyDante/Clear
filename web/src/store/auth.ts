import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'
import { useToast } from '../composables/useToast' // Corrected import

// 用户数据类型定义
interface UserData {
  id: string | number;
  username: string;
  tk: string;
  theme: number; // 将 theme 类型从 string | null 修改为 number
}

export const useAuthStore = defineStore('auth', () => {
  // 从localStorage获取用户信息，包括认证token
  const storedUser = localStorage.getItem('user');
  const initialUser = storedUser ? JSON.parse(storedUser) : null;
  // 确保 theme 字段存在且为数字，如果不是则设为默认值 1
  if (initialUser && (typeof initialUser.theme !== 'number' || isNaN(initialUser.theme))) {
    initialUser.theme = 1; // 默认主题ID
  }
  const user = ref<UserData | null>(initialUser)
  const isAuthenticated = ref(!!user.value)
  const { showToast } = useToast() // 在 store 中获取 showToast

  // 登录函数，调用API进行认证
  async function login(credentials: { username: string; password: string }) {
    try {
      const userData = await api.login(credentials)
      // 确保登录返回的 userData 中 theme 是数字，如果不是则设为默认值 1
      if (userData && (typeof userData.theme !== 'number' || isNaN(userData.theme))) {
        userData.theme = 1; // 默认主题ID
      }
      // 保存用户数据和token
      user.value = userData
      isAuthenticated.value = true
      localStorage.setItem('user', JSON.stringify(userData))
      showToast('登录成功', 'success'); // 在这里显示登录成功 toast
      return userData
    } catch (error) {
      // 错误 toast 已在 api.ts 中处理
      throw error
    }
  }

  // 注册函数，创建新用户账号
  async function register(userData: { username: string; password: string }) {
    try {
      const newUser = await api.register(userData)
      // 确保注册返回的 newUser 中 theme 是数字，如果不是则设为默认值 1
      if (newUser && (typeof newUser.theme !== 'number' || isNaN(newUser.theme))) {
        newUser.theme = 1; // 默认主题ID
      }
      // 保存新用户数据和token
      user.value = newUser
      isAuthenticated.value = true
      localStorage.setItem('user', JSON.stringify(newUser))
      showToast('注册成功', 'success'); // 在这里显示注册成功 toast
      return newUser
    } catch (error) {
      // 错误 toast 已在 api.ts 中处理
      throw error
    }
  }

  // 登出函数，清除认证信息
  function logout() {
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('user')
  }

  // 获取用户认证token
  function getToken() {
    return user.value?.tk || null
  }

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    getToken
  }
})