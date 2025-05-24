<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import AppHeader from '../components/common/AppHeader.vue'
import TabNavigation from '../components/common/TabNavigation.vue'
import SvgIcon from '../components/common/SvgIcon.vue'
import { useToast } from '../composables/useToast' // 引入 Toast 功能

const router = useRouter()
const authStore = useAuthStore()
const { showToast } = useToast() // 使用 Toast 功能

const tabs = [
  { id: 'login', name: '登录' },
  { id: 'register', name: '注册' }
]

const activeTab = ref('login')

const loginForm = reactive({
  username: '',
  password: '',
  loading: false
})

const registerForm = reactive({
  username: '',
  password: '',
  loading: false
})

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    // showToast('请输入用户名和密码', 'warning') // 已在 store 中处理
    return
  }
  try {
    await authStore.login({
      username: loginForm.username,
      password: loginForm.password
    })
    // showToast('登录成功，欢迎回来！', 'success') // 已在 store 中处理
    router.push('/')
  } catch (error: any) {
    // showToast(error.message || '登录失败，请检查用户名和密码', 'error') // 已在 store/api.ts 中处理
    console.error('Login error:', error)
  }
}

const handleRegister = async () => {
  if (!registerForm.username || !registerForm.password) {
    // showToast('请输入用户名和密码', 'warning') // 已在 store 中处理
    return
  }
  try {
    await authStore.register({
      username: registerForm.username,
      password: registerForm.password
    })
    // showToast('注册成功，欢迎加入！', 'success') // 已在 store 中处理
    router.push('/')
  } catch (error: any) {
    // showToast(error.message || '注册失败，请稍后再试', 'error') // 已在 store/api.ts 中处理
    console.error('Register error:', error)
  }
}
</script>

<template>
  <div class="auth-view">
    <AppHeader>
      <template #default>
        <h1 class="auth-header-title">
          欢迎使用 <span class="clear-text">Clear</span>
        </h1>
      </template>
      <template #right-actions>
        <button class="icon-button github-button">
          <a href="https://github.com/WindyDante/Clear" class="github-link" target="_blank" rel="noopener noreferrer">
            <SvgIcon name="github" color="default" :size="24" alt="Github" />
          </a>
        </button>
      </template>
    </AppHeader>

    <div class="auth-container">
      <div class="auth-card">
        <TabNavigation :tabs="tabs" :active-tab="activeTab" @change="tab => activeTab = tab" />

        <div v-if="activeTab === 'login'" class="auth-form">
          <p class="auth-description">请输入账号密码登录</p>

          <div class="form-group">
            <label for="username">用户名</label>
            <input id="username" v-model="loginForm.username" type="text" class="form-control" placeholder="输入用户名"
              :disabled="loginForm.loading" />
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <input id="password" v-model="loginForm.password" type="password" class="form-control" placeholder="输入密码"
              :disabled="loginForm.loading" />
          </div>

          <button class="btn btn-primary full-width" :disabled="loginForm.loading" @click="handleLogin">
            {{ loginForm.loading ? '正在登录...' : '登录' }}
          </button>
        </div>

        <div v-else-if="activeTab === 'register'" class="auth-form">
          <p class="auth-description">创建一个新账户</p>

          <div class="form-group">
            <label for="register-username">用户名</label>
            <input id="register-username" v-model="registerForm.username" type="text" class="form-control"
              placeholder="输入用户名" :disabled="registerForm.loading" />
          </div>

          <div class="form-group">
            <label for="register-password">密码</label>
            <input id="register-password" v-model="registerForm.password" type="password" class="form-control"
              placeholder="输入密码" :disabled="registerForm.loading" />
          </div>

          <button class="btn btn-primary full-width" :disabled="registerForm.loading" @click="handleRegister">
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

.github-button {
  border: none;
  background-color: transparent !important;
  /* 移除默认背景色 */
  transition: background-color 0.3s ease;
}

.github-button:hover {
  background-color: var(--background-color) !important;
  /* 保留鼠标悬停效果 */
}

.github-link {
  color: #000000;
  /* 设置链接文字为黑色 */
  text-decoration: none;
  /* 移除下划线 */
  font-weight: 500;
  /* 稍微加粗文字 */
}

.github-link:hover {
  color: #333333;
  /* 鼠标悬停时颜色略微变淡 */
}

.auth-header-title {
  font-size: 16px;
  /* Match AppHeader's default title font-size */
  font-weight: 600;
  /* Match AppHeader's default title font-weight */
  color: var(--text-color);
  /* Default text color */
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.clear-text {
  color: var(--primary-color);
}

.icon-img {
  width: 24px;
  height: 24px;
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
}
</style>