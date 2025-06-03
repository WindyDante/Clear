<script setup lang="ts">
import { useToast } from '../../composables/useToast'

const { toasts, removeToast } = useToast()

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return '✅' // Check mark
    case 'error':
      return '❌' // Cross mark
    case 'warning':
      return '⚠️' // Warning sign
    case 'info':
    default:
      return 'ℹ️' // Information sign
  }
}
</script>

<template>
  <div class="toast-container">
    <transition-group name="toast-fade" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast-message', `toast-${toast.type}`]"
      >
        <span class="toast-icon">{{ getIcon(toast.type) }}</span>
        <span class="toast-text">{{ toast.message }}</span>
        <button class="toast-close" @click="removeToast(toast.id)">&times;</button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  max-width: calc(100% - 40px); /* 防止 Toast 超出屏幕 */
}

/* Style the div rendered by transition-group to control spacing between toasts */
.toast-container > div {
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* Ensures toasts align to the right if they don't fill the width */
  gap: 10px; /* This will create space between individual toast messages */
}

.toast-message {
  display: flex;
  align-items: center;
  padding: 12px 18px;
  border-radius: var(--border-radius, 8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: white;
  font-size: 14px;
  min-width: 250px;
  max-width: 350px;
  width: 100%; /* 使宽度更加灵活 */
  transition: all 0.5s ease;
  box-sizing: border-box;
}

/* Removed .toast-container > div > .toast-message:last-child rule */

.toast-icon {
  flex-shrink: 0; /* 防止图标被压缩 */
  margin-right: 10px;
  font-size: 18px;
}

.toast-text {
  flex-grow: 1;
  white-space: nowrap; /* 确保单行显示 */
  overflow: hidden; /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 显示省略号 */
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0; /* 防止关闭按钮被压缩 */
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  margin-left: 12px; /* 增加边距使布局更美观 */
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.7;
}
.toast-close:hover {
  opacity: 1;
}

.toast-success {
  background-color: var(--success-color, #4caf50);
}

.toast-error {
  background-color: var(--danger-color, #ff5252);
}

.toast-info {
  background-color: var(--primary-color, #2196f3);
}

.toast-warning {
  background-color: var(--warning-color, #ffc107);
  color: #333; /* Darker text for better contrast on yellow */
}
.toast-warning .toast-close {
  color: #333;
}


/* Transitions */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-fade-move {
  transition: transform 0.5s ease;
}
</style>
