<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '../../store/auth'
import { useToast } from '../../composables/useToast'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import { useSettingsStore } from '../../store/settings'

const authStore = useAuthStore()
const { showToast } = useToast()
const router = useRouter()
const settingsStore = useSettingsStore()

// Form state for user settings
const settingsForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    loading: false,
    success: ''
})

// Function to handle password change
async function handleChangePassword() {
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
        }, 500) // 延迟0.5秒让用户看到成功提示后再登出
    } catch (error: any) {
        // 错误时API已经自动显示了toast，无需额外处理
    } finally {
        settingsForm.loading = false
    }
}
</script>

<template>
    <div class="settings-content">
        <div class="settings-card card">
            <div class="settings-form-content">
                <form @submit.prevent="handleChangePassword" class="settings-form">
                    <h3 class="form-section-title">修改密码</h3>
                    <div class="form-group">
                        <label for="current-password">当前密码</label>
                        <input id="current-password" type="password" v-model="settingsForm.currentPassword"
                            class="form-control" placeholder="请输入当前密码">
                    </div>
                    <div class="form-group">
                        <label for="new-password">新密码</label>
                        <input id="new-password" type="password" v-model="settingsForm.newPassword" class="form-control"
                            placeholder="请输入新密码">
                    </div>
                    <div class="form-group">
                        <label for="confirm-password">确认新密码</label>
                        <input id="confirm-password" type="password" v-model="settingsForm.confirmPassword"
                            class="form-control" placeholder="请再次输入新密码">
                    </div>
                    <button type="submit" class="btn btn-primary" :disabled="settingsForm.loading">
                        {{ settingsForm.loading ? '处理中...' : '修改密码' }}
                    </button>
                </form>
                <div class="form-group">
                    <label>
                        <input type="checkbox" v-model="settingsStore.redirectToLoginWhenNotAuth" @change="settingsStore.setRedirectToLogin(settingsStore.redirectToLoginWhenNotAuth)" />
                        未登录时自动跳转到登录页
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.settings-content {
    padding: 16px;
}

.card {
    margin-bottom: 16px;
    padding: 16px;
    background-color: var(--card-bg);
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
}

.card-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    color: var(--text-color);
}

.emoji {
    margin-right: 8px;
    font-size: 20px;
}

.settings-form {
    margin-bottom: 18px;
}

.form-section-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 10px;
    color: var(--text-secondary);
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-color);
    font-size: 14px;
}

.form-control {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--background-color);
    color: var(--text-color);
    font-size: 14px;
    transition: border-color 0.2s ease;
}

.form-control:focus {
    outline: none;
    border-color: var(--primary-color);
}

.btn {
    padding: 8px 16px;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.3s ease;
}

.btn-primary {
    background-color: var(--primary-color);
    color: var(--text-on-primary);
}

.btn-primary:hover:not(:disabled) {
    background-color: var(--primary-light);
}

.btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

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

.settings-form-content {
    margin-top: 12px;
    padding-top: 12px;
}

@media (max-width: 767px) {
    .settings-content {
        padding: 12px;
    }

    .card {
        padding: 12px;
        margin-bottom: 12px;
    }
}
</style>