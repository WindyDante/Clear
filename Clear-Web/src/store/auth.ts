import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const isAuthenticated = ref(!!user.value)

  function login(userData: any) {
    user.value = userData
    isAuthenticated.value = true
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function register(userData: any) {
    user.value = userData
    isAuthenticated.value = true
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function logout() {
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('user')
  }

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout
  }
})