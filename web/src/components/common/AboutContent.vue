<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTaskStore } from '../../store/task'
import { useAuthStore } from '../../store/auth'
import { useTheme } from '../../composables/useTheme'
import api from '../../services/api'

const taskStore = useTaskStore()
const authStore = useAuthStore()
const { themes, activeThemeName, applyTheme } = useTheme()

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
        console.error('获取任务统计失败:', error)
    } finally {
        taskStats.value.loading = false
    }
}

// 获取主题预览颜色
function getThemePreviewColor(theme: any) {
    switch (theme.name) {
        case '天青':
            return '#f5f7fa'
        case '墨玉':
            return '#1d1e20'
        case '胭脂':
            return '#c74c3c'
        case '藤黄':
            return '#f39c12'
        case '紫棠':
            return '#8e44ad'
        case '青碧':
            return '#1abc9c'
        default:
            return theme.colors['--primary-color']
    }
}

const totalCompleted = computed(() => taskStats.value.numOfDone)
const totalPending = computed(() => taskStats.value.numOfUndone)

onMounted(() => {
    fetchUserTaskStats()
})
</script>

<template>
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
</template>

<style scoped>
.about-content {
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

.stats-text {
    font-size: 16px;
    line-height: 1.6;
    color: var(--text-color);
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
    margin-bottom: 18px;
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

@media (max-width: 767px) {
    .about-content {
        padding: 12px;
    }

    .card {
        padding: 12px;
        margin-bottom: 12px;
    }
}
</style>