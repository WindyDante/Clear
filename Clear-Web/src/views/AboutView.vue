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
})
</script>

<template>
  <div class="about-view">
    <AppHeader title="关于与设置" :show-home-icon="true" :show-logout-icon="true" />

    <div class="about-content">
      <div class="settings-card card">
        <h2 class="card-title">
          <span class="emoji">⚙️</span> 基本设置
        </h2>
        <form @submit.prevent="handleChangePassword" class="settings-form">
          <h3 class="form-section-title">修改密码</h3>
          <div class="form-group">
            <label for="current-password">当前密码</label>
            <input id="current-password" type="password" v-model="settingsForm.currentPassword" class="form-control" placeholder="请输入当前密码">
          </div>
          <div class="form-group">
            <label for="new-password">新密码</label>
            <input id="new-password" type="password" v-model="settingsForm.newPassword" class="form-control" placeholder="请输入新密码">
          </div>
          <div class="form-group">
            <label for="confirm-password">确认新密码</label>
            <input id="confirm-password" type="password" v-model="settingsForm.confirmPassword" class="form-control" placeholder="请再次输入新密码">
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
  margin-top: 24px; /* Add some space between forms */
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

@media (min-width: 768px) {
  .about-content {
    padding: 24px;
  }
  
  .card {
    padding: 24px;
  }
}
</style>