import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import api from '../services/api'
import { useToast } from '../composables/useToast' // Corrected import

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
    const isLoaded = ref(false) // 新增：数据是否已加载标志
    const { showToast } = useToast() // 在 store 中获取 showToast

    // 创建一个标记来触发任务列表刷新
    const categoryChanged = ref<{ action: 'add' | 'update' | 'delete', categoryId?: string }>()

    // 获取分类列表
    async function fetchCategories() {
        // 如果数据已加载且没有强制刷新，则直接返回现有数据
        if (isLoaded.value && !loading.value) {
            return categories.value;
        }

        loading.value = true
        error.value = null

        try {
            const data = await api.getCategories()
            categories.value = data || []

            // 如果返回的分类列表为空，添加默认分类
            if (categories.value.length === 0) {
                categories.value = [{ categoryId: '0', categoryName: "默认" }]
            }

            isLoaded.value = true // 标记数据已加载
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
            const result = await api.addCategory(categoryName)
            // 本地更新分类列表，避免重复请求
            if (result && result.categoryId) {
                categories.value.push({
                    categoryId: result.categoryId.toString(),
                    categoryName: categoryName
                });

                // 标记分类已添加，触发任务列表更新
                categoryChanged.value = {
                    action: 'add',
                    categoryId: result.categoryId.toString()
                }
            } else {
                // 如果没有返回ID或其他必要信息，则刷新数据
                await fetchCategories()
            }
            showToast(`分类 "${categoryName}" 添加成功`, 'success');
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
            await api.updateCategory(categoryId, categoryName)
            // 本地更新分类数据，避免重复请求
            const index = categories.value.findIndex(c => c.categoryId === categoryId)
            if (index !== -1) {
                categories.value[index].categoryName = categoryName

                // 标记分类已更新，触发任务列表更新
                categoryChanged.value = {
                    action: 'update',
                    categoryId
                }
            }
            showToast(`分类 "${categoryName}" 更新成功`, 'success');
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
            // 本地更新分类数据，避免重复请求
            categories.value = categories.value.filter(c => c.categoryId !== categoryId)

            // 标记分类已删除，触发任务列表更新
            categoryChanged.value = {
                action: 'delete',
                categoryId
            }

            showToast('分类删除成功', 'success');
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

    // 重置加载状态（用于登出后重置状态）
    function reset() {
        categories.value = []
        isLoaded.value = false
        error.value = null
    }

    return {
        categories,
        loading,
        error,
        isLoaded,
        categoryChanged,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        defaultCategory,
        reset
    }
})