<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import AppHeader from '../components/common/AppHeader.vue'
import TabNavigation from '../components/common/TabNavigation.vue'

const router = useRouter()
const authStore = useAuthStore()

const tabs = [
  { id: 'login', name: '登录' },
  { id: 'register', name: '注册' }
]

const activeTab = ref('login')

const loginForm = reactive({
  username: '',
  password: '',
  loading: false,
  error: ''
})

const registerForm = reactive({
  username: '',
  password: '',
  loading: false,
  error: ''
})

async function handleLogin() {
  if (!loginForm.username || !loginForm.password) {
    loginForm.error = '请输入用户名和密码'
    return
  }
  
  loginForm.loading = true
  loginForm.error = ''
  
  try {
    const userData = await authStore.login({
      username: loginForm.username,
      password: loginForm.password
    })
    
    router.push('/')
  } catch (error) {
    loginForm.error = '登录失败，请检查用户名和密码'
  } finally {
    loginForm.loading = false
  }
}

async function handleRegister() {
  if (!registerForm.username || !registerForm.password) {
    registerForm.error = '请输入用户名和密码'
    return
  }
  
  registerForm.loading = true
  registerForm.error = ''
  
  try {
    await authStore.register({
      username: registerForm.username,
      password: registerForm.password
    })
    
    router.push('/')
  } catch (error) {
    registerForm.error = '注册失败，请稍后再试'
  } finally {
    registerForm.loading = false
  }
}
</script>

<template>
  <div class="auth-view">
    <AppHeader title="欢迎使用 Clear">
      <template #right-actions>
        <button class="icon-button">
          <span class="material-icon">🏠</span>
        </button>
      </template>
    </AppHeader>
    
    <div class="auth-container">
      <div class="auth-card">
        <TabNavigation
          :tabs="tabs"
          :active-tab="activeTab"
          @change="tab => activeTab = tab"
        />
        
        <div v-if="activeTab === 'login'" class="auth-form">
          <p class="auth-description">请输入账号密码登录</p>
          
          <div class="form-group">
            <label for="username">用户名 *</label>
            <input
              id="username"
              v-model="loginForm.username"
              type="text"
              class="form-control"
              placeholder="输入用户名"
              :disabled="loginForm.loading"
            />
          </div>
          
          <div class="form-group">
            <label for="password">密码 *</label>
            <input
              id="password"
              v-model="loginForm.password"
              type="password"
              class="form-control"
              placeholder="输入密码"
              :disabled="loginForm.loading"
            />
          </div>
          
          <p v-if="loginForm.error" class="error-message">
            {{ loginForm.error }}
          </p>
          
          <button
            class="btn btn-primary full-width"
            :disabled="loginForm.loading"
            @click="handleLogin"
          >
            {{ loginForm.loading ? '正在登录...' : '登录' }}
          </button>
        </div>
        
        <div v-else-if="activeTab === 'register'" class="auth-form">
          <p class="auth-description">创建一个新账户</p>
          
          <div class="form-group">
            <label for="register-username">用户名 *</label>
            <input
              id="register-username"
              v-model="registerForm.username"
              type="text"
              class="form-control"
              placeholder="输入用户名"
              :disabled="registerForm.loading"
            />
          </div>
          
          <div class="form-group">
            <label for="register-password">密码 *</label>
            <input
              id="register-password"
              v-model="registerForm.password"
              type="password"
              class="form-control"
              placeholder="输入密码"
              :disabled="registerForm.loading"
            />
          </div>
          
          <p v-if="registerForm.error" class="error-message">
            {{ registerForm.error }}
          </p>
          
          <button
            class="btn btn-primary full-width"
            :disabled="registerForm.loading"
            @click="handleRegister"
          >
            {{ registerForm.loading ? '正在注册...' : '注册' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.auth-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-card {
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 24px;
}

.auth-description {
  text-align: center;
  margin-bottom: 24px;
  color: var(--text-secondary);
}

.auth-form {
  margin-top: 24px;
}

.full-width {
  width: 100%;
}

.error-message {
  color: var(--danger-color);
  font-size: 14px;
  margin-bottom: 16px;
}
</style>