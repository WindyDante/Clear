import type { User } from '@/types/models'
import { ref, watch } from 'vue'

export const useAuthStore = defineStore('authStore', () => {
    const user = ref<User | null>(null)
    const isLoaded = ref(false) // 标记是否已经加载完成

    // 仅在客户端读取 localStorage
    if (import.meta.client) {
        console.log("获取 user")
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            user.value = JSON.parse(storedUser)
        }
        isLoaded.value = true // 标记加载完成
    }

    // 监听 user 变化，自动存入 localStorage
    watch(user, (newUser) => {
        if (process.client) {
            if (newUser) {
                localStorage.setItem("user", JSON.stringify(newUser))
            } else {
                localStorage.removeItem("user")
            }
        }
    }, { deep: true })

    // 获取用户信息
    const getUser = () => user.value
    const getToken = () => user.value?.token || null
    const isAuthenticated = () => !!user.value

    // 设置用户信息
    const setUser = (newUser: User) => {
        user.value = newUser
    }

    // 清除用户信息
    const clearUser = () => {
        user.value = null
    }

    const loadUser = () => {
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem("user")
          if (storedUser) {
            user.value = JSON.parse(storedUser)
          }
          isLoaded.value = true
        }
      }

    return { user, isLoaded, getUser, getToken, isAuthenticated, setUser, clearUser, loadUser }
})
