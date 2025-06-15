<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
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
  loading: false,
  success: ''
})

// 基本设置展开/收起状态
const isBasicSettingsExpanded = ref(false)

// 切换基本设置展开状态
function toggleBasicSettings() {
  isBasicSettingsExpanded.value = !isBasicSettingsExpanded.value
}

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
    await api.updatePassword(settingsForm.currentPassword, settingsForm.newPassword)
    // 成功时API会自动显示后端返回的msg
    settingsForm.currentPassword = ''
    settingsForm.newPassword = ''
    settingsForm.confirmPassword = ''

    // 密码修改成功后立即登出
    setTimeout(() => {
      authStore.logout()
      router.push('/auth')
    }, 500)
  } catch (error: any) {
    // 错误时API已经自动显示了toast，无需额外处理
  } finally {
    settingsForm.loading = false
  }
}

onMounted(() => {
  // 获取用户任务统计信息
  fetchUserTaskStats()
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
          <button class="arrow-toggle" @click="toggleBasicSettings" :class="{ expanded: isBasicSettingsExpanded }">
            <span class="arrow">{{ isBasicSettingsExpanded ? '▲' : '▼' }}</span>
          </button>
        </h2>
        <div v-show="isBasicSettingsExpanded" class="settings-content">
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
        </div>
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
  padding: 12px;
  /* 从16px减少到12px */
}

.card {
  margin-bottom: 12px;
  /* 从16px减少到12px */
  padding: 16px;
  /* 从20px减少到16px */
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  /* 从16px减少到12px */
  display: flex;
  align-items: center;
}

.settings-form {
  margin-bottom: 18px;
  /* 从24px减少到18px */
}

.form-section-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  /* 从12px减少到10px */
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
  gap: 12px;
  /* 从16px减少到12px */
  margin-bottom: 18px;
  /* 从24px减少到18px */
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

.btn-toggle {
  background-color: transparent;
  color: var(--primary-color);
  border: none;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* 箭头切换按钮样式 */
.arrow-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  margin-left: auto;
  font-size: 16px;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
  border-radius: 4px;
}

.arrow-toggle:hover {
  color: var(--primary-light);
  background-color: var(--primary-color-alpha, rgba(64, 158, 255, 0.1));
}

.arrow {
  display: inline-block;
  transition: transform 0.3s ease;
  font-size: 14px;
}

/* 设置内容区域样式 */
.settings-content {
  margin-top: 12px;
  /* 从16px减少到12px */
  padding-top: 12px;
  /* 从16px减少到12px */
  border-top: 1px solid var(--border-color);
}

@media (min-width: 768px) {
  .about-content {
    padding: 18px;
    /* 从24px减少到18px */
  }

  .card {
    padding: 20px;
    /* 从24px减少到20px */
  }
}
</style>