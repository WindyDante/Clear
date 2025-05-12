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
        duration: number = 3000
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
