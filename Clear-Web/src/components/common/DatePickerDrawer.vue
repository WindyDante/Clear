<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
    isOpen: boolean
    title: string
    selectedDate?: string // 格式: YYYY-MM-DD
}

interface Emits {
    (e: 'close'): void
    (e: 'select', date: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 当前日期选择器状态
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth()) // 0-indexed

// 月份名称
const monthNames = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月"
]

// 计算当前月份的天数
const daysInMonth = computed(() => {
    return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

// 计算当前显示的月份名称
const currentMonthName = computed(() => {
    return `${monthNames[currentMonth.value]} ${currentYear.value}`
})

// 格式化日期为 YYYY-MM-DD
const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
}

// 检查某一天是否是选中的日期
const isSelectedDay = (day: number): boolean => {
    if (!props.selectedDate) return false
    const dateStr = formatDateToYYYYMMDD(new Date(currentYear.value, currentMonth.value, day))
    return dateStr === props.selectedDate
}

// 导航到上个月
function prevMonth() {
    if (currentMonth.value === 0) {
        currentMonth.value = 11
        currentYear.value--
    } else {
        currentMonth.value--
    }
}

// 导航到下个月
function nextMonth() {
    if (currentMonth.value === 11) {
        currentMonth.value = 0
        currentYear.value++
    } else {
        currentMonth.value++
    }
}

// 选择日期
function selectDate(day: number) {
    const selectedDate = new Date(currentYear.value, currentMonth.value, day)
    const formattedDate = formatDateToYYYYMMDD(selectedDate)
    emit('select', formattedDate)
}

// 关闭抽屉
function handleClose() {
    emit('close')
}

// 点击遮罩层关闭抽屉
function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
        emit('close')
    }
}

// 初始化选择器日期（当打开时）
function initializePicker() {
    if (props.selectedDate) {
        const [year, month, day] = props.selectedDate.split('-').map(Number)
        if (year && month && day) {
            currentYear.value = year
            currentMonth.value = month - 1 // Month is 0-indexed
        }
    } else {
        const today = new Date()
        currentYear.value = today.getFullYear()
        currentMonth.value = today.getMonth()
    }
}

// 监听抽屉打开状态
watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        initializePicker()
    }
})
</script>

<template>
    <div v-if="isOpen" class="drawer-overlay" @click="handleOverlayClick">
        <div class="drawer-content">
            <div class="drawer-header">
                <h2 class="drawer-title">{{ title }}</h2>
                <button class="drawer-close-btn" @click="handleClose">
                    <span class="close-icon">×</span>
                </button>
            </div>

            <div class="drawer-body">
                <div class="date-picker-container">
                    <!-- 月份导航 -->
                    <div class="date-picker-header">
                        <button class="picker-nav" @click="prevMonth">◀</button>
                        <div class="current-month">{{ currentMonthName }}</div>
                        <button class="picker-nav" @click="nextMonth">▶</button>
                    </div>

                    <!-- 日期网格 -->
                    <div class="date-grid">
                        <div v-for="day in daysInMonth" :key="day" class="date-cell"
                            :class="{ 'active': isSelectedDay(day) }" @click="selectDate(day)">
                            {{ day }}
                        </div>
                    </div>
                </div>
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
    /* 防止横向滚动 */
    overflow: hidden;
}

.drawer-content {
    background-color: var(--card-color);
    width: 100%;
    max-height: 60vh;
    border-radius: 16px 16px 0 0;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease;
    overflow: hidden;
    /* 确保内容不会超出容器 */
    box-sizing: border-box;
}

.drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px 24px;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--card-color);
    flex-shrink: 0;
    /* 防止内容溢出 */
    min-width: 0;
}

.drawer-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    /* 防止标题过长导致溢出 */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    margin-right: 16px;
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
    flex-shrink: 0;
}

.drawer-close-btn:hover {
    background-color: var(--border-color);
}

.close-icon {
    font-size: 20px;
    color: var(--text-primary);
    line-height: 1;
}

.drawer-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    /* 防止横向滚动 */
    padding: 20px 16px;
    /* 减少左右内边距防止溢出 */
    background-color: var(--card-color);
    min-height: 0;
    /* 确保flex布局正常工作 */
}

/* 日期选择器样式 */
.date-picker-container {
    max-width: 320px;
    margin: 0 auto;
    width: 100%;
    /* 确保容器不会超出父元素 */
    box-sizing: border-box;
}

.date-picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-color);
    /* 防止内容溢出 */
    min-width: 0;
}

.current-month {
    font-weight: 600;
    font-size: 16px;
    color: var(--text-primary);
    /* 确保月份文字居中且不会溢出 */
    flex: 1;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0 8px;
}

.picker-nav {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--primary-color);
    padding: 8px 12px;
    border-radius: var(--border-radius);
    font-size: 16px;
    transition: background-color var(--transition-speed);
    flex-shrink: 0;
    min-width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.picker-nav:hover {
    background-color: var(--background-color-soft);
}

.date-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    /* gap: 6px; */
    /* 减少间距防止溢出 */
    width: 100%;
    /* 确保网格不会超出容器 */
    box-sizing: border-box;
    justify-items: center;
}

.date-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    /* 稍微减小高度 */
    width: 40px;
    /* 稍微减小宽度 */
    border-radius: 50%;
    cursor: pointer;
    color: var(--text-primary);
    transition: all var(--transition-speed);
    font-size: 14px;
    font-weight: 500;
    /* 确保日期单元格不会变形 */
    flex-shrink: 0;
    box-sizing: border-box;
}

.date-cell:hover {
    background-color: var(--background-color-soft);
}

.date-cell.active {
    background-color: var(--primary-color);
    color: white;
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
        max-width: 400px;
        margin: 0 auto;
        max-height: none;
        /* 移除最大高度限制 */
        min-height: auto;
        /* 允许内容自适应高度 */
        border-radius: 16px;
        margin-bottom: 20vh;
        /* 确保内容不会超出视口 */
        max-height: calc(100vh - 40vh);
        /* 最多占用60%的视口高度 */
    }

    .drawer-overlay {
        align-items: center;
        justify-content: center;
        /* 确保桌面端完全居中 */
    }

    .drawer-body {
        padding: 24px;
        /* 桌面端恢复正常内边距 */
        overflow-y: visible;
        /* 在桌面端不显示滚动条 */
        overflow-x: hidden;
        /* 只有当内容确实超出容器时才显示滚动条 */
        max-height: none;
        flex: none;
        /* 让内容自然伸展 */
    }

    .date-grid {
        /* gap: 8px; */
        /* 桌面端恢复正常间距 */
    }

    .date-cell {
        height: 44px;
        /* 桌面端恢复正常大小 */
        width: 44px;
    }

    /* 桌面端日期选择器容器优化 */
    .date-picker-container {
        max-width: 320px;
        margin: 0 auto;
        width: 100%;
        /* 确保容器适应内容 */
        min-height: auto;
    }

    /* 确保桌面端日期网格不会产生滚动 */
    .date-picker-header {
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border-color);
        flex-shrink: 0;
    }
}

/* 小屏幕优化 */
@media (max-width: 480px) {
    .drawer-body {
        padding: 16px 12px;
        /* 更小的内边距 */
    }

    .date-picker-container {
        max-width: 280px;
        /* 限制最大宽度 */
    }

    .date-grid {
        gap: 4px;
        /* 更小的间距 */
    }

    .date-cell {
        height: 36px;
        /* 更小的尺寸 */
        width: 36px;
        font-size: 13px;
    }

    .current-month {
        font-size: 15px;
    }

    .picker-nav {
        padding: 6px 8px;
        font-size: 14px;
        min-width: 32px;
    }
}
</style>