<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useTaskStore } from '../store/task'
import AppHeader from '../components/common/AppHeader.vue'
import { useAuthStore } from '../store/auth'
import { useToast } from '../composables/useToast' // 引入 useToast

const taskStore = useTaskStore()
const authStore = useAuthStore()
const { showToast } = useToast() // 使用 useToast composable

const totalCompleted = computed(() => taskStore.totalCompletedTasks)
const totalPending = computed(() => taskStore.totalPendingTasks)

// Form state for user settings
const settingsForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  email: authStore.user?.email || '', // Assuming user object has email
  loading: false,
  error: '',
  success: ''
})

// 调色板相关
const themes = [
  {
    name: '默认浅色',
    colors: {
      '--primary-color': '#3498db',
      '--primary-light': '#5dade2',
      '--primary-rgb': '52, 152, 219',
      '--secondary-color': '#2ecc71',
      '--background-color': '#ecf0f1',
      '--card-color': '#ffffff',
      '--text-color': '#2c3e50',
      '--text-secondary': '#7f8c8d',
      '--text-on-primary': '#ffffff',
      '--border-color': '#dce4e8',
      '--success-color': '#27ae60',
      '--danger-color': '#e74c3c',
      '--warning-color': '#f39c12',
      '--info-color': '#3498db',
      // Datepicker specific colors for light theme
      '--datepicker-bg': '#ffffff',
      '--datepicker-text-color': '#2c3e50',
      '--datepicker-hover-bg': '#f0f0f0', // A slightly different hover for light mode date cells
      '--datepicker-active-text-color': '#ffffff',
    }
  },
  {
    name: '深色模式',
    colors: {
      '--primary-color': '#3498db',
      '--primary-light': '#5dade2',
      '--primary-rgb': '52, 152, 219',
      '--secondary-color': '#2ecc71',
      '--background-color': '#2c3e50',
      '--card-color': '#34495e',
      '--text-color': '#ecf0f1', // 主要文本颜色，浅色
      '--text-secondary': '#bdc3c7', // 次要文本颜色，稍暗的浅色
      '--text-on-primary': '#ffffff',
      '--border-color': '#4a6278',
      '--success-color': '#27ae60',
      '--danger-color': '#e74c3c',
      '--warning-color': '#f39c12',
      '--info-color': '#3498db',
      // 为深色模式下的日期选择器特化一些颜色
      '--datepicker-bg': '#3b5368', // 日期选择器背景
      '--datepicker-text-color': '#dde4e8', // 日期选择器文字颜色
      '--datepicker-hover-bg': '#4a6278', // 日期单元格悬浮背景
      '--datepicker-active-text-color': '#ffffff', // 选中日期的文字颜色
    }
  },
  {
    name: '活力橙',
    colors: {
      '--primary-color': '#e67e22',
      '--primary-light': '#f39c12',
      '--primary-rgb': '230, 126, 34',
      '--secondary-color': '#d35400',
      '--background-color': '#fdf3e6',
      '--card-color': '#ffffff',
      '--text-color': '#50331c',
      '--text-secondary': '#a0663a',
      '--text-on-primary': '#ffffff',
      '--border-color': '#fbe5d0',
      '--success-color': '#27ae60',
      '--danger-color': '#c0392b',
      '--warning-color': '#f39c12',
      '--info-color': '#e67e22',
      // Datepicker specific colors for orange theme (example)
      '--datepicker-bg': '#fff9f2',
      '--datepicker-text-color': '#50331c',
      '--datepicker-hover-bg': '#fbe5d0',
      '--datepicker-active-text-color': '#ffffff',
    }
  }
];

const activeThemeName = ref(localStorage.getItem('active-theme-name') || themes[0].name);

function applyTheme(themeName: string) {
  const selectedTheme = themes.find(t => t.name === themeName);
  if (selectedTheme) {
    for (const [key, value] of Object.entries(selectedTheme.colors)) {
      document.documentElement.style.setProperty(key, value);
    }
    activeThemeName.value = themeName;
    localStorage.setItem('active-theme-name', themeName); // 保存主题选择
    showToast(`已切换到 ${themeName} 主题`, 'info');
  }
}

// Function to handle password change
async function handleChangePassword() {
  settingsForm.error = ''
  settingsForm.success = ''
  if (settingsForm.newPassword !== settingsForm.confirmPassword) {
    settingsForm.error = '新密码和确认密码不匹配'
    showToast('新密码和确认密码不匹配', 'error') // 显示 Toast
    return
  }
  if (settingsForm.newPassword.length < 6) { // Example validation
    settingsForm.error = '新密码长度至少为6位'
    showToast('新密码长度至少为6位', 'error') // 显示 Toast
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
    showToast('密码修改成功', 'success') // 显示 Toast
    settingsForm.currentPassword = ''
    settingsForm.newPassword = ''
    settingsForm.confirmPassword = ''
  } catch (error: any) {
    settingsForm.error = error.message || '密码修改失败，请重试'
    showToast(error.message || '密码修改失败，请重试', 'error') // 显示 Toast
  } finally {
    settingsForm.loading = false
  }
}

// Function to handle email change
async function handleChangeEmail() {
  settingsForm.error = ''
  settingsForm.success = ''
  if (!settingsForm.email) { // Example validation
    settingsForm.error = '请输入邮箱地址'
    showToast('请输入邮箱地址', 'error') // 显示 Toast
    return
  }
  settingsForm.loading = true
  try {
    // Replace with your actual API call to change email
    // await api.changeEmail(authStore.user.id, settingsForm.email)
    console.log('Email change attempt:', { email: settingsForm.email })
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Update email in auth store if your API confirms it
    if (authStore.user) {
      authStore.user.email = settingsForm.email
      localStorage.setItem('user', JSON.stringify(authStore.user)) // Update local storage
    }
    settingsForm.success = '邮箱修改成功'
    showToast('邮箱修改成功', 'success') // 显示 Toast
  } catch (error: any) {
    settingsForm.error = error.message || '邮箱修改失败，请重试'
    showToast(error.message || '邮箱修改失败，请重试', 'error') // 显示 Toast
  } finally {
    settingsForm.loading = false
  }
}

onMounted(() => {
  taskStore.fetchTasks()
  // Initialize email from store if not already done
  if (authStore.user && !settingsForm.email) {
    settingsForm.email = authStore.user.email || ''
  }
  // 应用保存的主题
  const savedThemeName = localStorage.getItem('active-theme-name');
  if (savedThemeName) {
    applyTheme(savedThemeName);
  } else {
    applyTheme(themes[0].name); // 应用默认主题
  }
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
            <div class="theme-preview" :style="{ backgroundColor: theme.colors['--primary-color'] }"></div>
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
          <button type="submit" class="btn btn-primary" :disabled="settingsForm.loading">
            {{ settingsForm.loading ? '处理中...' : '修改邮箱' }}
          </button>
        </form>
        <p v-if="settingsForm.error" class="error-message">{{ settingsForm.error }}</p>
        <p v-if="settingsForm.success" class="success-message">{{ settingsForm.success }}</p>
      </div>

      <div class="stats-card card">
        <h2 class="card-title">
          <span class="emoji">✨</span> 关于:
        </h2>

        <p class="stats-text">
          您一共完成了 <span class="highlight">{{ totalCompleted }}</span> 个任务。
          当前还剩下 <span class="highlight">{{ totalPending }}</span> 个未完成的任务。
        </p>
      </div>

      <div class="info-card card">
        <h2 class="card-title">
          <span class="emoji">💡</span> 设计理念:
        </h2>

        <p class="info-text">
          这个小程序的设计理念旨在帮助用户有效地减轻认知负担，通过提供一个简单、直观的界面来降低的复杂性和趣味任务。它的目标是帮助用户避免因现代生活中生过多的精神压力，让用户能够更加专注于重要的事务，提升工作效率和生活质量。
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

.settings-card {
  /* Styles for the settings card if needed */
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

.error-message {
  color: var(--danger-color);
  font-size: 14px;
  margin-top: 10px;
}

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
  margin-bottom: 8px;
  border: 1px solid var(--border-color);
}

.theme-option span {
  font-size: 12px;
  color: var(--text-secondary);
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