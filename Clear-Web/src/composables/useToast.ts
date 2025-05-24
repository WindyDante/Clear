import { ref, readonly } from 'vue'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastMessage {
    id: number
    message: string
    type: ToastType
    duration: number
}

const toasts = ref<ToastMessage[]>([])

let toastIdCounter = 0

export function useToast() {
    const showToast = (
        message: string,
        type: ToastType = 'info',
        duration: number = 1200 // 从 3000 调整为 2000 毫秒（2秒）
    ) => {
        const id = toastIdCounter++
        toasts.value.push({ id, message, type, duration })
        setTimeout(() => {
            removeToast(id)
        }, duration)
    }

    const removeToast = (id: number) => {
        toasts.value = toasts.value.filter(toast => toast.id !== id)
    }

    return {
        toasts: readonly(toasts),
        showToast,
        removeToast
    }
}
