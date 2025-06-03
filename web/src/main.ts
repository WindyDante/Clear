import { createApp } from 'vue'
import { createPinia } from 'pinia' // 导入 createPinia
import App from './App.vue'
import router from './router'
import './style.css'
import { useTheme } from './composables/useTheme' // 引入主题管理

// 创建应用实例
const app = createApp(App)

// 创建并使用 Pinia
const pinia = createPinia()
app.use(pinia)

// 尝试初始化主题 - 在应用挂载前应用主题
try {
    const { initTheme } = useTheme()
    initTheme()
    console.log('主题初始化成功')
} catch (error) {
    console.error('主题初始化失败，但应用程序将继续运行:', error)
    // 应用基础样式确保可用性
    document.documentElement.style.setProperty('--background-color', '#f5f7fa')
    document.documentElement.style.setProperty('--text-color', '#3c4858')
    document.documentElement.style.setProperty('--card-color', '#ffffff')
}

// 挂载应用
app.use(router).mount('#app')