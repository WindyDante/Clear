<template>
  <div v-if="false" class="category-management card">
    <!-- Content removed as it is integrated into TaskList.vue -->
  </div>
</template>

<script setup lang="ts">
// Logic remains for store interactions, but UI is removed.
// This component might be entirely removed if store actions are directly called from TaskList or a composable.
import { ref, computed, onMounted } from 'vue';
import { useCategoryStore, type Category } from '../../store/category';
import { useRouter } from 'vue-router';
import { useToast } from '../../composables/useToast';

const props = defineProps<{
  canOperate?: boolean
}>()

const categoryStore = useCategoryStore();
const router = useRouter();
const { showToast } = useToast();

const submitting = ref(false);
const newCategoryName = ref('');
const editingCategoryId = ref<string | null>(null);
const editingCategoryName = ref('');

const canAddCategory = computed(() => {
  return newCategoryName.value.trim().length > 0;
});

async function addCategory() {
  if (!props.canOperate) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  if (!canAddCategory.value || submitting.value) return;
  submitting.value = true;
  try {
    await categoryStore.addCategory(newCategoryName.value.trim());
    newCategoryName.value = '';
  } catch (error) {
    console.error('添加分类失败:', error);
  } finally {
    submitting.value = false;
  }
}

function startEdit(category: Category) {
  if (!props.canOperate) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  editingCategoryId.value = category.categoryId;
  editingCategoryName.value = category.categoryName;
}

function cancelEdit() {
  editingCategoryId.value = null;
  editingCategoryName.value = '';
}

async function saveEdit() {
  if (!props.canOperate) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  if (!editingCategoryName.value.trim() || !editingCategoryId.value) {
    cancelEdit();
    return;
  }
  try {
    await categoryStore.updateCategory(editingCategoryId.value, editingCategoryName.value.trim());
  } catch (error) {
    console.error('更新分类失败:', error);
  } finally {
    cancelEdit();
  }
}

function confirmDelete(category: Category) {
  if (!props.canOperate) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  if (window.confirm(`确定要删除分类 "${category.categoryName}" 吗？此操作不可恢复。分类下的任务将变为无分类状态。`)) {
    deleteCategory(category.categoryId);
  }
}

async function deleteCategory(categoryId: string) {
  try {
    await categoryStore.deleteCategory(categoryId);
  } catch (error) {
    console.error('删除分类失败:', error);
  }
}

onMounted(() => {
  // console.log('CategoryManagement: Component mounted, data will be initialized by App.vue or parent.');
});
</script>

<style scoped>
/* All styles removed as the template is now empty. */
/* Ensure this component is no longer imported or used in HomeView.vue if it's fully deprecated. */
</style>