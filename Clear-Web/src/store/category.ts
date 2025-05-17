import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

// 分类数据接口
export interface Category {
    categoryId: string // 改为只使用字符串类型
    categoryName: string
}

export const useCategoryStore = defineStore('category', () => {
    // 状态
    const categories = ref<Category[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // 获取分类列表
    async function fetchCategories() {
        loading.value = true
        error.value = null

        try {
            const data = await api.getCategories()
            categories.value = data || []

            // 如果返回的分类列表为空，添加默认分类
            if (categories.value.length === 0) {
                categories.value = [{ categoryId: '0', categoryName: "默认" }]
            }

            return categories.value
        } catch (err) {
            console.error('获取分类失败:', err)
            error.value = err instanceof Error ? err.message : '获取分类失败'
            // 出错时使用默认分类
            categories.value = [{ categoryId: '0', categoryName: "默认" }]
            throw err
        } finally {
            loading.value = false
        }
    }

    // 添加分类
    async function addCategory(categoryName: string) {
        loading.value = true
        error.value = null

        try {
            // 直接传入分类名称，符合新的API接口参数格式
            await api.addCategory(categoryName)
            await fetchCategories() // 重新获取最新分类列表
            return true
        } catch (err) {
            console.error('添加分类失败:', err)
            error.value = err instanceof Error ? err.message : '添加分类失败'
            throw err
        } finally {
            loading.value = false
        }
    }

    // 更新分类
    async function updateCategory(categoryId: string, categoryName: string) {
        loading.value = true
        error.value = null

        try {
            // 直接传入ID和分类名称，符合新的API接口参数格式
            await api.updateCategory(categoryId, categoryName)
            await fetchCategories() // 重新获取最新分类列表
            return true
        } catch (err) {
            console.error('更新分类失败:', err)
            error.value = err instanceof Error ? err.message : '更新分类失败'
            throw err
        } finally {
            loading.value = false
        }
    }

    // 删除分类
    async function deleteCategory(categoryId: string) {
        loading.value = true
        error.value = null

        try {
            await api.deleteCategory(categoryId)
            await fetchCategories() // 重新获取最新分类列表
            return true
        } catch (err) {
            console.error('删除分类失败:', err)
            error.value = err instanceof Error ? err.message : '删除分类失败'
            throw err
        } finally {
            loading.value = false
        }
    }

    // 获取默认分类
    const defaultCategory = computed(() => {
        const defaultCat = categories.value.find(cat => cat.categoryName === "默认")
        return defaultCat || { categoryId: '0', categoryName: "默认" }
    })

    return {
        categories,
        loading,
        error,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        defaultCategory
    }
})