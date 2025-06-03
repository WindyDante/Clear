<script setup lang="ts">
interface Props {
    isOpen: boolean
    title: string
    maxHeight?: string
}

interface Emits {
    (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
    maxHeight: '85vh'
})

const emit = defineEmits<Emits>()

// 点击遮罩层关闭抽屉
function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
        emit('close')
    }
}

// 关闭抽屉
function closeDrawer() {
    emit('close')
}
</script>

<template>
    <div v-if="isOpen" class="drawer-overlay" @click="handleOverlayClick">
        <!-- 抽屉内容 -->
        <div class="drawer-content" :style="{ maxHeight: maxHeight }">
            <div class="drawer-header">
                <h2 class="drawer-title">{{ title }}</h2>
                <button class="drawer-close-btn" @click="closeDrawer">
                    <span class="close-icon">×</span>
                </button>
            </div>
            <div class="drawer-body">
                <slot />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 抽屉样式 */
.drawer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    display: flex;
    align-items: flex-end;
    animation: fadeIn 0.3s ease;
}

.drawer-content {
    background-color: var(--card-bg);
    width: 100%;
    max-height: 85vh;
    border-radius: 16px 16px 0 0;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease;
    overflow: hidden;
}

.drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px 24px;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--card-bg);
    flex-shrink: 0;
}

.drawer-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color);
    margin: 0;
    opacity: 1;
}

.drawer-close-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background-color: var(--background-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
}

.drawer-close-btn:hover {
    background-color: var(--border-color);
}

.close-icon {
    font-size: 20px;
    color: var(--text-color);
    line-height: 1;
    opacity: 1;
}

.drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background-color: var(--card-bg);
}

/* 动画效果 */
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
    }

    to {
        transform: translateY(0);
    }
}

/* 桌面端适配 */
@media (min-width: 768px) {
    .drawer-content {
        max-width: 500px;
        margin: 0 auto;
        max-height: 75vh;
        border-radius: 16px;
        margin-bottom: 10vh;
    }

    .drawer-overlay {
        align-items: center;
    }
}

/* 大屏幕适配 */
@media (min-width: 1200px) {
    .drawer-content {
        max-width: 600px;
        max-height: 70vh;
    }
}
</style>