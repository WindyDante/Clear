<script setup lang="ts">
import { ref, computed, onMounted, reactive, onUnmounted } from 'vue'
import { useTaskStore } from '../store/task'
import AppHeader from '../components/common/AppHeader.vue'
import { useAuthStore } from '../store/auth'
import { useToast } from '../composables/useToast'
import { useTheme } from '../composables/useTheme' // 引入主题管理
import api from '../services/api' // 导入API服务
import { useRouter } from 'vue-router'

const taskStore = useTaskStore()
const authStore = useAuthStore()
const { showToast } = useToast()
const { themes, activeThemeName, applyTheme } = useTheme() // 使用主题管理
const router = useRouter()
const countdownTimer = ref<number | null>(null) // 倒计时定时器引用

// 任务统计数据
const taskStats = ref({
  numOfDone: 0,
  numOfUndone: 0,
  loading: false
})

// 获取用户任务统计信息
async function fetchUserTaskStats() {
  if (!authStore.isAuthenticated) {
    return
  }

  try {
    taskStats.value.loading = true
    const data = await api.getUserTaskStatus()
    taskStats.value.numOfDone = data.numOfDone
    taskStats.value.numOfUndone = data.numOfUndone
  } catch (error: any) {
    // 错误已由 API 层处理
    console.error('获取任务统计失败:', error)
  } finally {
    taskStats.value.loading = false
  }
}

// 邮箱格式验证
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 计算属性：邮箱是否有效
const isEmailValid = computed(() => {
  return settingsForm.email && isValidEmail(settingsForm.email);
})

// 获取主题预览颜色
function getThemePreviewColor(theme: any) {
  // 根据主题名称返回合适的预览颜色
  switch (theme.name) {
    case '天青':
      return '#f5f7fa'; // 月白的背景色
    case '墨玉':
      return '#1d1e20'; // 玄青的背景色
    case '胭脂':
      return '#c74c3c'; // 胭脂的主色调
    case '藤黄':
      return '#f39c12'; // 藤黄的主色调
    case '紫棠':
      return '#8e44ad'; // 紫棠的主色调
    case '青碧':
      return '#1abc9c'; // 青碧的主色调
    default:
      return theme.colors['--primary-color']; // 默认使用主色调
  }
}

// 使用API获取的统计数据替代本地计算
const totalCompleted = computed(() => taskStats.value.numOfDone)
const totalPending = computed(() => taskStats.value.numOfUndone)

// Form state for user settings
const settingsForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  email: authStore.user?.email || '',
  verificationCode: '', // 添加验证码字段
  codeSent: false, // 标记验证码是否已发送
  countDown: 0, // 倒计时计数器
  loading: false,
  success: ''
})

// Function to handle password change
async function handleChangePassword() {
  // 检查是否已登录
  if (!authStore.isAuthenticated) {
    showToast('请先登录再操作', 'warning');
    router.push('/auth');
    return;
  }

  settingsForm.success = ''
  if (settingsForm.newPassword !== settingsForm.confirmPassword) {
    showToast('新密码和确认密码不匹配', 'error')
    return
  }
  if (settingsForm.newPassword.length < 6) {
    showToast('新密码长度至少为6位', 'error')
    return
  }
  settingsForm.loading = true
  try {
    // Replace with your actual API call to change password
    // await api.changePassword(authStore.user.id, settingsForm.currentPassword, settingsForm.newPassword)
    console.log('Password change attempt:', {
      currentPassword: settingsForm.currentPassword,
      newPassword: settingsForm.newPassword
    })
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    settingsForm.success = '密码修改成功'
    showToast('密码修改成功', 'success')
    settingsForm.currentPassword = ''
    settingsForm.newPassword = ''
    settingsForm.confirmPassword = ''
  } catch (error: any) {
    showToast(error.message || '密码修改失败，请重试', 'error')
  } finally {
    settingsForm.loading = false
  }
}

// Function to handle email change
async function handleChangeEmail() {
  // 检查是否已登录
  if (!authStore.isAuthenticated) {
    showToast('请先登录再操作', 'warning');
    router.push('/auth');
    return;
  }

  settingsForm.success = ''
  if (!settingsForm.email) {
    showToast('请输入邮箱地址', 'error')
    return
  }

  // 如果还未发送验证码，先触发发送验证码流程
  if (!settingsForm.codeSent) {
    sendVerificationCode()
    return
  }

  // 验证码不能为空
  if (!settingsForm.verificationCode) {
    showToast('请输入验证码', 'error')
    return
  }

  settingsForm.loading = true
  try {
    // 直接使用验证邮箱验证码的接口完成邮箱验证和更新
    await api.verifyEmailCode(settingsForm.email, settingsForm.verificationCode)

    // 更新用户信息中的邮箱
    if (authStore.user) {
      authStore.user.email = settingsForm.email
      localStorage.setItem('user', JSON.stringify(authStore.user))
    }

    // 重置表单状态
    settingsForm.verificationCode = ''
    settingsForm.codeSent = false
    if (countdownTimer.value) {
      clearInterval(countdownTimer.value)
      countdownTimer.value = null
    }
    settingsForm.countDown = 0
  } catch (error: any) {
    // handleApiResponse已处理错误提示
  } finally {
    settingsForm.loading = false
  }
}

// 发送邮箱验证码
async function sendVerificationCode() {
  // 检查是否已登录
  if (!authStore.isAuthenticated) {
    showToast('请先登录再操作', 'warning');
    router.push('/auth');
    return;
  }

  if (!settingsForm.email) {
    showToast('请先输入邮箱地址', 'error')
    return
  }

  try {
    settingsForm.loading = true
    // 调用发送验证码的API
    await api.sendEmailCode(settingsForm.email)
    settingsForm.codeSent = true

    // 设置倒计时60秒
    settingsForm.countDown = 60

    // 清除可能存在的定时器
    if (countdownTimer.value) {
      clearInterval(countdownTimer.value)
    }

    // 启动新的倒计时定时器
    countdownTimer.value = window.setInterval(() => {
      if (settingsForm.countDown > 0) {
        settingsForm.countDown--
      } else {
        // 倒计时结束，清除定时器
        if (countdownTimer.value) {
          clearInterval(countdownTimer.value)
          countdownTimer.value = null
        }
      }
    }, 1000)
  } catch (error: any) {
    // API错误处理已经由handleApiResponse完成，这里无需额外处理
  } finally {
    settingsForm.loading = false
  }
}

// 在组件卸载时清除定时器
onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
})

onMounted(() => {
  // 获取用户任务统计信息
  fetchUserTaskStats()

  // Initialize email from store if not already done
  if (authStore.user && !settingsForm.email) {
    settingsForm.email = authStore.user.email || ''
  }

  // 主题已在应用启动时初始化，这里不需要再次初始化
  // initTheme() - 移除
})
</script>

<template>
  <div class="about-view">
    <AppHeader title="关于与设置" :show-home-icon="true" :show-logout-icon="true" />

    <div class="about-content">
      <div class="settings-card card">
        <h2 class="card-title">
          <span class="emoji">🎨</span> 调色板
        </h2>
        <div class="theme-selector">
          <div v-for="theme in themes" :key="theme.name" class="theme-option"
            :class="{ active: theme.name === activeThemeName }" @click="applyTheme(theme.name)">
            <div class="theme-preview" :style="{
              backgroundColor: getThemePreviewColor(theme)
            }"></div>
            <span>{{ theme.name }}</span>
          </div>
        </div>
      </div>

      <div class="settings-card card">
        <h2 class="card-title">
          <span class="emoji">⚙️</span> 基本设置
        </h2>
        <form @submit.prevent="handleChangePassword" class="settings-form">
          <h3 class="form-section-title">修改密码</h3>
          <div class="form-group">
            <label for="current-password">当前密码</label>
            <input id="current-password" type="password" v-model="settingsForm.currentPassword" class="form-control"
              placeholder="请输入当前密码">
          </div>
          <div class="form-group">
            <label for="new-password">新密码</label>
            <input id="new-password" type="password" v-model="settingsForm.newPassword" class="form-control"
              placeholder="请输入新密码">
          </div>
          <div class="form-group">
            <label for="confirm-password">确认新密码</label>
            <input id="confirm-password" type="password" v-model="settingsForm.confirmPassword" class="form-control"
              placeholder="请再次输入新密码">
          </div>
          <button type="submit" class="btn btn-primary" :disabled="settingsForm.loading">
            {{ settingsForm.loading ? '处理中...' : '修改密码' }}
          </button>
        </form>

        <form @submit.prevent="handleChangeEmail" class="settings-form email-form">
          <h3 class="form-section-title">修改邮箱</h3>
          <div class="form-group">
            <label for="email">邮箱地址</label>
            <input id="email" type="email" v-model="settingsForm.email" class="form-control" placeholder="请输入新的邮箱地址">
          </div>

          <!-- 验证码输入框和按钮组 -->
          <div class="form-group verification-group">
            <label for="verification-code">验证码</label>
            <div class="verification-input-group">
              <input id="verification-code" type="text" v-model="settingsForm.verificationCode" class="form-control"
                placeholder="请输入验证码" :disabled="!settingsForm.codeSent">
              <button type="button" class="btn send-code-btn"
                :class="{ 'btn-secondary': !isEmailValid, 'btn-valid': isEmailValid }" @click="sendVerificationCode"
                :disabled="settingsForm.loading || settingsForm.countDown > 0 || !isEmailValid">
                {{ settingsForm.loading && !settingsForm.codeSent ? '发送中...' : (settingsForm.countDown > 0 ?
                  `${settingsForm.countDown}秒` : '获取验证码') }}
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary"
            :disabled="settingsForm.loading || !settingsForm.verificationCode || !settingsForm.codeSent">
            {{ settingsForm.loading && settingsForm.codeSent ? '处理中...' : '修改邮箱' }}
          </button>
        </form>
      </div>

      <div class="stats-card card">
        <h2 class="card-title">
          <span class="emoji">✨</span> 关于
        </h2>

        <div v-if="taskStats.loading" class="stats-loading">
          <p class="info-text">正在加载任务统计数据...</p>
        </div>
        <p v-else class="stats-text">
          您一共完成了 <span class="highlight">{{ totalCompleted }}</span> 个任务。
          当前还剩下 <span class="highlight">{{ totalPending }}</span> 个未完成的任务。
        </p>
      </div>

      <div class="info-card card">
        <h2 class="card-title">
          <span class="emoji">💡</span> 想法
        </h2>

        <p class="info-text">
          希望这个小工具能帮助你更好地管理任务和时间。<br>
          通过简单的界面和直观的操作，让你能快速上手。<br>
          你可以随时修改设置，调整主题，或者更改密码。<br>
          多个主题的目的是为了让你在看到不同颜色时，能有不同的心情和灵感。<br>
          <span class="highlight">如果你有任何建议或反馈，请随时告诉我！</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.about-content {
  flex: 1;
  padding: 16px;
}

.card {
  margin-bottom: 16px;
  padding: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.settings-form {
  margin-bottom: 24px;
}

.email-form {
  margin-top: 24px;
  /* Add some space between forms */
}

.form-section-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--text-secondary);
}

/* error-message style removed as we're using toast instead */

.success-message {
  color: var(--success-color);
  font-size: 14px;
  margin-top: 10px;
}

.emoji {
  margin-right: 8px;
  font-size: 20px;
}

.stats-text {
  font-size: 16px;
  line-height: 1.6;
}

.info-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.highlight {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 18px;
}

.theme-selector {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: var(--border-radius);
  border: 2px solid transparent;
  transition: border-color var(--transition-speed);
}

.theme-option.active {
  border-color: var(--primary-color);
}

.theme-preview {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  /* 改为圆形预览 */
  margin-bottom: 8px;
  border: 1px solid var(--border-color);
  /* 移除背景色，让它在循环中动态设置 */
}

.theme-option span {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 验证码相关样式 */
.standalone-btn {
  margin: 8px 0 16px 0;
  width: 100%;
  max-width: 140px;
}

.send-code-btn {
  background-color: var(--primary-color);
  /* 修改为使用主题的primary-color */
  color: var(--text-on-primary);
  /* 确保文字颜色与背景形成对比 */
  font-size: 14px;
  transition: background-color 0.3s ease;
  /* 添加过渡效果 */
}

.send-code-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 邮箱验证通过的按钮样式 */
.btn-valid {
  background-color: var(--primary-color) !important;
  /* 使用主题的primary-color替换硬编码颜色 */
  color: var(--text-on-primary) !important;
  /* 文字颜色与背景形成对比 */
}

.verification-group {
  margin-bottom: 16px;
}

.verification-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.verification-input-group .form-control {
  flex: 1;
}

.verification-input-group .send-code-btn {
  white-space: nowrap;
  min-width: 90px;
  height: 38px;
  padding: 0 12px;
  font-size: 14px;
}

/* 添加修改密码和修改邮箱按钮的样式 */
.btn-primary {
  background-color: var(--primary-color);
  color: var(--text-on-primary);
  border: none;
  padding: 8px 16px;
  border-radius: var(--border-radius, 4px);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: var(--primary-light);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (min-width: 768px) {
  .about-content {
    padding: 24px;
  }

  .card {
    padding: 24px;
  }
}
</style>