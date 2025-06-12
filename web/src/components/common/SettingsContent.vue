<script setup lang="ts">
import { reactive, ref, computed, onUnmounted } from 'vue'
import { useAuthStore } from '../../store/auth'
import { useToast } from '../../composables/useToast'
import { useRouter } from 'vue-router'
import api from '../../services/api'

const authStore = useAuthStore()
const { showToast } = useToast()
const router = useRouter()
const countdownTimer = ref<number | null>(null)

// Form state for user settings
const settingsForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    email: authStore.user?.email || '',
    verificationCode: '',
    codeSent: false,
    countDown: 0,
    loading: false,
    success: ''
})

// 邮箱格式验证
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 计算属性：邮箱是否有效
const isEmailValid = computed(() => {
    return settingsForm.email && isValidEmail(settingsForm.email);
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
        }, 500) // 延迟1.5秒让用户看到成功提示后再登出
    } catch (error: any) {
        // 错误时API已经自动显示了toast，无需额外处理
    } finally {
        settingsForm.loading = false
    }
}

// Function to handle email change
async function handleChangeEmail() {
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

    if (!settingsForm.codeSent) {
        sendVerificationCode()
        return
    }

    if (!settingsForm.verificationCode) {
        showToast('请输入验证码', 'error')
        return
    }

    settingsForm.loading = true
    try {
        await api.verifyEmailCode(settingsForm.email, settingsForm.verificationCode)

        if (authStore.user) {
            authStore.user.email = settingsForm.email
            localStorage.setItem('user', JSON.stringify(authStore.user))
        }

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
        await api.sendEmailCode(settingsForm.email)
        settingsForm.codeSent = true

        settingsForm.countDown = 60

        if (countdownTimer.value) {
            clearInterval(countdownTimer.value)
        }

        countdownTimer.value = window.setInterval(() => {
            if (settingsForm.countDown > 0) {
                settingsForm.countDown--
            } else {
                if (countdownTimer.value) {
                    clearInterval(countdownTimer.value)
                    countdownTimer.value = null
                }
            }
        }, 1000)
    } catch (error: any) {
        // API错误处理已经由handleApiResponse完成
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

                <form @submit.prevent="handleChangeEmail" class="settings-form email-form">
                    <h3 class="form-section-title">修改邮箱</h3>
                    <div class="form-group">
                        <label for="email">邮箱地址</label>
                        <input id="email" type="email" v-model="settingsForm.email" class="form-control"
                            placeholder="请输入新的邮箱地址">
                    </div>

                    <div class="form-group verification-group">
                        <label for="verification-code">验证码</label>
                        <div class="verification-input-group">
                            <input id="verification-code" type="text" v-model="settingsForm.verificationCode"
                                class="form-control" placeholder="请输入验证码" :disabled="!settingsForm.codeSent">
                            <button type="button" class="btn send-code-btn"
                                :class="{ 'btn-secondary': !isEmailValid, 'btn-valid': isEmailValid }"
                                @click="sendVerificationCode"
                                :disabled="settingsForm.loading || settingsForm.countDown > 0 || !isEmailValid">
                                {{ settingsForm.loading && !settingsForm.codeSent ? '发送中...' : (settingsForm.countDown >
                                    0 ?
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

.email-form {
    margin-top: 18px;
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
    /* margin-top: 12px;
    padding-top: 12px; */
}

.verification-group {
    margin-bottom: 12px;
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

.send-code-btn {
    background-color: var(--primary-color);
    color: var(--text-on-primary);
    transition: background-color 0.3s ease;
}

.send-code-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.btn-valid {
    background-color: var(--primary-color) !important;
    color: var(--text-on-primary) !important;
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