<template>
  <div class="category-management card">
    <h3 class="form-title"><span class="icon">📁</span> 分类管理</h3>

    <div class="categories-list">
      <div v-if="categoryStore.loading" class="loading">加载中...</div>
      <div v-else-if="categoryStore.categories.length === 0" class="empty-state">
        暂无分类，请添加新分类
      </div>
      <div v-else class="category-items">
        <div v-for="category in categoryStore.categories" :key="category.categoryId" class="category-item">
          <div class="category-info" v-if="editingCategoryId !== category.categoryId">
            <span class="category-name">{{ category.categoryName }}</span>
            <div class="category-actions">
              <button @click="startEdit(category)" class="btn-action edit">编辑</button>
              <button @click="confirmDelete(category)" class="btn-action delete">删除</button>
            </div>
          </div>
          <div class="category-edit" v-else>
            <input 
              v-model="editingCategoryName" 
              class="form-control" 
              placeholder="分类名称" 
              @keyup.enter="saveEdit"
            />
            <div class="edit-actions">
              <button @click="saveEdit" class="btn-action save">保存</button>
              <button @click="cancelEdit" class="btn-action cancel">取消</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="add-category-form">
      <input 
        v-model="newCategoryName" 
        class="form-control" 
        placeholder="输入新分类名称..." 
        @keyup.enter="addCategory"
      />
      <button 
        @click="addCategory" 
        class="btn primary"
        :disabled="!canAddCategory || submitting"
      >
        {{ submitting ? '添加中...' : '添加分类' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from '../../composables/useToast';
import { useCategoryStore, Category } from '../../store/category';

const { showToast } = useToast();
const categoryStore = useCategoryStore();

// 提交状态
const submitting = ref(false);
// 新分类名称
const newCategoryName = ref('');
// 正在编辑的分类ID
const editingCategoryId = ref<string | null>(null);
// 编辑中的分类名称
const editingCategoryName = ref('');

// 是否可以添加新分类
const canAddCategory = computed(() => {
  return newCategoryName.value.trim().length > 0;
});

// 添加新分类
async function addCategory() {
  if (!canAddCategory.value || submitting.value) return;
  
  submitting.value = true;
  try {
    await categoryStore.addCategory(newCategoryName.value.trim());
    showToast(`分类"${newCategoryName.value.trim()}"添加成功`, 'success');
    newCategoryName.value = '';
  } catch (error) {
    console.error('添加分类失败:', error);
    showToast('添加分类失败，请重试', 'error');
  } finally {
    submitting.value = false;
  }
}

// 开始编辑分类
function startEdit(category: Category) {
  editingCategoryId.value = category.categoryId;
  editingCategoryName.value = category.categoryName;
}

// 取消编辑
function cancelEdit() {
  editingCategoryId.value = null;
  editingCategoryName.value = '';
}

// 保存编辑
async function saveEdit() {
  if (!editingCategoryName.value.trim() || !editingCategoryId.value) {
    cancelEdit();
    return;
  }

  try {
    await categoryStore.updateCategory(editingCategoryId.value, editingCategoryName.value.trim());
    showToast('分类更新成功', 'success');
  } catch (error) {
    console.error('更新分类失败:', error);
    showToast('更新分类失败，请重试', 'error');
  } finally {
    cancelEdit();
  }
}

// 确认删除分类
function confirmDelete(category: Category) {
  if (confirm(`确定要删除分类"${category.categoryName}"吗？此操作不可恢复，分类下的任务将被移动到默认分类。`)) {
    deleteCategory(category.categoryId);
  }
}

// 删除分类
async function deleteCategory(categoryId: string) {
  try {
    await categoryStore.deleteCategory(categoryId);
    showToast('分类删除成功', 'success');
  } catch (error) {
    console.error('删除分类失败:', error);
    showToast('删除分类失败，请重试', 'error');
  }
}

// 组件加载时获取分类列表
onMounted(() => {
  // 不再单独获取分类列表，改为使用父组件已加载的共享状态
  // categoryStore.fetchCategories();
});
</script>

<style scoped>
.category-management {
  margin: 1.5rem 0;
  padding: 1.5rem;
}

.form-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
}

.form-title .icon {
  margin-right: 0.5rem;
}

.categories-list {
  margin-bottom: 1.5rem;
}

.loading, .empty-state {
  padding: 1rem 0;
  text-align: center;
  color: #888;
}

.category-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-item {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background-color: #f9f9f9;
}

.category-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-actions, .edit-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit {
  background-color: #e7f3ff;
  color: #0066cc;
}

.edit:hover {
  background-color: #d0e7ff;
}

.delete {
  background-color: #ffe7e7;
  color: #cc0000;
}

.delete:hover {
  background-color: #ffd0d0;
}

.save {
  background-color: #e5f8e5;
  color: #006600;
}

.save:hover {
  background-color: #d0f0d0;
}

.cancel {
  background-color: #f0f0f0;
  color: #444;
}

.cancel:hover {
  background-color: #e0e0e0;
}

.category-edit {
  display: flex;
  gap: 0.5rem;
}

.category-edit input {
  flex: 1;
}

.add-category-form {
  display: flex;
  gap: 0.5rem;
}

.add-category-form input {
  flex: 1;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s, opacity 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.primary {
  background-color: var(--primary-color, #4caf50);
  color: white;
}

.primary:hover:not(:disabled) {
  background-color: var(--primary-hover-color, #388e3c);
}

.form-control {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color, #4caf50);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}
</style>