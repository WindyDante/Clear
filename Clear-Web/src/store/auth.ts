import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

// 用户数据类型定义
interface UserData {
  id: string | number;
  username: string;
  tk: string;
  theme: string | null;
}

export const useAuthStore = defineStore('auth', () => {
  // 从localStorage获取用户信息，包括认证token
  const user = ref<UserData | null>(JSON.parse(localStorage.getItem('user') || 'null'))
  const isAuthenticated = ref(!!user.value)

  // 登录函数，调用API进行认证
  async function login(credentials: { username: string; password: string }) {
    try {
      const userData = await api.login(credentials)
      // 保存用户数据和token
      user.value = userData
      isAuthenticated.value = true
      localStorage.setItem('user', JSON.stringify(userData))
      return userData
    } catch (error) {
      throw error
    }
  }

  // 注册函数，创建新用户账号
  async function register(userData: { username: string; password: string }) {
    try {
      const newUser = await api.register(userData)
      // 保存新用户数据和token
      user.value = newUser
      isAuthenticated.value = true
      localStorage.setItem('user', JSON.stringify(newUser))
      return newUser
    } catch (error) {
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