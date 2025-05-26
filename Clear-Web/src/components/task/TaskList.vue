<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted, nextTick } from 'vue' // 引入 onUnmounted and nextTick
import { useTaskStore } from '../../store/task'
import { useCategoryStore, type Category } from '../../store/category' // Import Category type
import { useToast } from '../../composables/useToast'
import { useRouter } from 'vue-router';
import DatePickerDrawer from '../common/DatePickerDrawer.vue'

const props = defineProps<{
  title: string
  canOperate?: boolean
}>()

const taskStore = useTaskStore()
const categoryStore = useCategoryStore()
const { showToast } = useToast()
const router = useRouter();

// --- Category Management State ---
const showAddCategoryInput = ref(false);
const newCategoryName = ref('');
const editingCategoryId = ref<string | null>(null);
const editingCategoryName = ref('');
const openedCategoryMenuId = ref<string | null>(null); // New: Tracks open actions menu
const categoryEditInputRef = ref<HTMLInputElement | null>(null);
const newCategoryInputRef = ref<HTMLInputElement | null>(null);

// --- 日期选择器抽屉状态 ---
const showStartDateDrawer = ref(false)
const showEndDateDrawer = ref(false)
const currentDatePickerType = ref<'start' | 'end' | null>(null)

// --- Category Management Methods ---

function closeAllCategoryInputsAndMenus() {
  openedCategoryMenuId.value = null;
  editingCategoryId.value = null;
  showAddCategoryInput.value = false;
}

function toggleCategoryActionsMenu(categoryId: string) {
  if (openedCategoryMenuId.value === categoryId) {
    openedCategoryMenuId.value = null;
  } else {
    closeAllCategoryInputsAndMenus(); // Close others before opening a new one
    openedCategoryMenuId.value = categoryId;
  }
}

function toggleAddCategoryInput() {
  if (!props.canOperate) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  if (showAddCategoryInput.value) {
    showAddCategoryInput.value = false;
  } else {
    closeAllCategoryInputsAndMenus();
    showAddCategoryInput.value = true;
    nextTick(() => newCategoryInputRef.value?.focus());
  }
}

async function handleAddCategory() {
  if (!props.canOperate) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  if (!newCategoryName.value.trim()) {
    showToast('分类名称不能为空', 'error');
    return;
  }
  try {
    await categoryStore.addCategory(newCategoryName.value.trim());
    newCategoryName.value = '';
    showAddCategoryInput.value = false; // Hide input after adding
  } catch (error) {
    // Error toast is handled by the store/API
    console.error('Failed to add category:', error);
  }
}

function startEditCategory(category: Category) {
  if (!props.canOperate) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  closeAllCategoryInputsAndMenus();
  editingCategoryId.value = category.categoryId;
  editingCategoryName.value = category.categoryName;
  nextTick(() => categoryEditInputRef.value?.focus());
}

function cancelEditCategory() {
  editingCategoryId.value = null;
  editingCategoryName.value = '';
}

async function handleSaveCategory() {
  if (!props.canOperate) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  if (!editingCategoryName.value.trim() || !editingCategoryId.value) {
    cancelEditCategory();
    return;
  }
  try {
    await categoryStore.updateCategory(editingCategoryId.value, editingCategoryName.value.trim());
    cancelEditCategory();
  } catch (error) {
    console.error('Failed to update category:', error);
  }
}

async function handleDeleteCategory(category: Category) {
  if (!props.canOperate) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  openedCategoryMenuId.value = null; // Close menu before confirm dialog
  if (confirm(`确定要删除分类 "${category.categoryName}" 吗？此操作不可恢复。分类下的任务将变为无分类状态。`)) {
    try {
      await categoryStore.deleteCategory(category.categoryId);
      if (taskStore.selectedCategoryId === category.categoryId) {
        taskStore.setCategory(undefined);
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  }
}

// --- 日期选择器方法 ---
function openDatePicker(type: 'start' | 'end') {
  if (!props.canOperate && (startDateInput.value || endDateInput.value)) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }

  currentDatePickerType.value = type;
  if (type === 'start') {
    showStartDateDrawer.value = true;
  } else {
    showEndDateDrawer.value = true;
  }
}

function handleDateSelect(date: string) {
  if (currentDatePickerType.value === 'start') {
    startDateInput.value = date;
    showStartDateDrawer.value = false;
  } else if (currentDatePickerType.value === 'end') {
    endDateInput.value = date;
    showEndDateDrawer.value = false;
  }

  // 应用日期筛选
  taskStore.setDateRange(startDateInput.value || undefined, endDateInput.value || undefined);
  currentDatePickerType.value = null;
}

function closeDatePicker() {
  showStartDateDrawer.value = false;
  showEndDateDrawer.value = false;
  currentDatePickerType.value = null;
}

function closeCategoryMenuOnClickOutside(event: MouseEvent) {
  if (openedCategoryMenuId.value) {
    const target = event.target as HTMLElement;
    const menuElement = document.querySelector(`.category-actions-menu[data-category-id="${openedCategoryMenuId.value}"]`);
    const triggerElement = document.querySelector(`.category-actions-trigger[data-category-id="${openedCategoryMenuId.value}"]`);
    if (menuElement && !menuElement.contains(target) && triggerElement && !triggerElement.contains(target)) {
      openedCategoryMenuId.value = null;
    }
  }
}

onMounted(() => {
  document.addEventListener('click', closeCategoryMenuOnClickOutside, true);
});

onUnmounted(() => {
  document.removeEventListener('click', closeCategoryMenuOnClickOutside, true);
});

// --- End Category Management Methods ---

// 本地 ref 用于绑定日期和关键字输入
const startDateInput = ref('')
const endDateInput = ref('')
const keywordInput = ref('')

// 用于UI展示的当前筛选条件
const currentFilters = computed(() => {
  const filters = []

  // 显示分类筛选条件
  if (taskStore.selectedCategoryId !== undefined) {
    const categoryName = categoryStore.categories.find(c => c.categoryId === taskStore.selectedCategoryId)?.categoryName || '未知分类'
    filters.push(`分类: ${categoryName}`)
  }

  // 显示状态筛选条件
  if (taskStore.selectedStatus !== undefined) {
    filters.push(`状态: ${taskStore.selectedStatus === 1 ? '已完成' : '未完成'}`)
  }

  // 显示日期筛选条件
  if (taskStore.selectedStartDate && taskStore.selectedEndDate) {
    filters.push(`日期: ${taskStore.selectedStartDate} 至 ${taskStore.selectedEndDate}`)
  } else if (taskStore.selectedStartDate) {
    filters.push(`日期: ${taskStore.selectedStartDate} 之后`)
  } else if (taskStore.selectedEndDate) {
    filters.push(`日期: ${taskStore.selectedEndDate} 之前`)
  }

  // 显示关键字筛选条件
  if (taskStore.searchKeyword) {
    filters.push(`关键字: "${taskStore.searchKeyword}"`)
  }

  return filters
})

// 添加对所有任务的引用，而不仅仅是待办任务
const tasksToShow = computed(() => {
  return taskStore.tasks
})

async function handleToggleCompletion(taskId: string) {
  if (!props.canOperate) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  try {
    await taskStore.toggleTaskCompletion(taskId)
  } catch (error) {
    console.error('Error toggling task completion:', error)
  }
}

async function handleDeleteTask(taskId: string) {
  if (!props.canOperate) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  try {
    await taskStore.deleteTask(taskId)
  } catch (error) {
    console.error('Error deleting task:', error)
  }
}

// 格式化创建时间的函数
function formatCreatedAt(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化截止日期的函数
function formatDueDate(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// For pagination
function goToPreviousPage() {
  taskStore.prevPage()
}

function goToNextPage() {
  taskStore.nextPage()
}

// 设置分类筛选
function filterByCategory(categoryId: number | string | undefined) {
  if (!props.canOperate && categoryId !== undefined) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  taskStore.setCategory(categoryId);
  closeAllCategoryInputsAndMenus(); // Close menus/inputs when a filter is applied
}

// 设置任务状态筛选
function filterByStatus(status: number | undefined) {
  if (!props.canOperate && status !== undefined) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  taskStore.setStatus(status)
}

// 设置关键字筛选
function applyKeywordFilter() {
  if (!props.canOperate && keywordInput.value) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  taskStore.setKeyword(keywordInput.value || undefined);
}

// 清除所有筛选条件
function clearAllFilters() {
  // No auth check here, clearing filters should always be allowed
  startDateInput.value = ''
  endDateInput.value = ''
  keywordInput.value = ''
  taskStore.clearFilters()
  closeAllCategoryInputsAndMenus(); // Clear category states
}

// 确保组件挂载时加载分类数据和任务数据
onMounted(() => {
  // 数据初始化已移至App.vue中集中处理
  console.log('TaskList: 组件已挂载，数据将由App.vue集中初始化');
})
</script>

<template>
  <div class="task-list">
    <h3 class="list-title">
      <span class="icon">📋</span> {{ title }}
    </h3>

    <!-- 筛选控件 -->
    <div class="filters-section">
      <div class="filter-controls">
        <!-- 分类筛选 -->
        <div class="filter-group category-filter-group">
          <label>分类筛选:</label>
          <div class="filter-buttons category-buttons">
            <button class="filter-btn"
              :class="{ 'active': taskStore.selectedCategoryId === undefined && !editingCategoryId && !showAddCategoryInput }"
              @click="filterByCategory(undefined)" :disabled="!!editingCategoryId || showAddCategoryInput">
              全部
            </button>
            <div v-for="category in categoryStore.categories" :key="category.categoryId" class="category-filter-item">

              <div v-if="editingCategoryId === category.categoryId" class="category-edit-mode">
                <input v-model="editingCategoryName" class="filter-input category-edit-input" ref="categoryEditInputRef"
                  placeholder="分类名称" @keyup.enter="handleSaveCategory" @keyup.esc="cancelEditCategory" />
                <button class="btn-action save-icon" @click="handleSaveCategory" title="保存">✓</button>
                <button class="btn-action cancel-icon" @click="cancelEditCategory" title="取消">✕</button>
              </div>

              <button v-else class="filter-btn category-btn"
                :class="{ 'active': taskStore.selectedCategoryId === category.categoryId }"
                @click="filterByCategory(category.categoryId)" :disabled="!!editingCategoryId || showAddCategoryInput">
                {{ category.categoryName }}
              </button>

              <div v-if="props.canOperate && editingCategoryId !== category.categoryId"
                class="category-actions-trigger-wrapper">
                <button class="btn-action category-actions-trigger" :data-category-id="category.categoryId"
                  @click.stop="toggleCategoryActionsMenu(category.categoryId)" title="更多操作"
                  :disabled="!!editingCategoryId || showAddCategoryInput">
                  ⋮
                </button>
                <div v-if="openedCategoryMenuId === category.categoryId" class="category-actions-menu"
                  :data-category-id="category.categoryId">
                  <button @click.stop="startEditCategory(category)">编辑</button>
                  <button @click.stop="handleDeleteCategory(category)">删除</button>
                </div>
              </div>
            </div>

            <div v-if="props.canOperate && !editingCategoryId" class="add-category-wrapper">
              <button v-if="!showAddCategoryInput" class="filter-btn add-category-btn-toggle"
                @click="toggleAddCategoryInput" title="添加分类">
                +
              </button>
              <div v-if="showAddCategoryInput" class="category-add-mode">
                <input v-model="newCategoryName" class="filter-input category-add-input" ref="newCategoryInputRef"
                  placeholder="新分类名称" @keyup.enter="handleAddCategory" @keyup.esc="toggleAddCategoryInput" />
                <button class="btn-action save-icon" @click="handleAddCategory" title="添加">✓</button>
                <button class="btn-action cancel-icon" @click="toggleAddCategoryInput" title="取消">✕</button>
              </div>
            </div>

          </div>
        </div>

        <!-- 状态筛选 -->
        <div class="filter-group">
          <label>状态筛选:</label>
          <div class="filter-buttons">
            <button class="filter-btn" :class="{ 'active': taskStore.selectedStatus === undefined }"
              @click="filterByStatus(undefined)">全部</button>
            <button class="filter-btn" :class="{ 'active': taskStore.selectedStatus === 0 }"
              @click="filterByStatus(0)">未完成</button>
            <button class="filter-btn" :class="{ 'active': taskStore.selectedStatus === 1 }"
              @click="filterByStatus(1)">已完成</button>
          </div>
        </div>

        <!-- 日期筛选 -->
        <div class="filter-group">
          <label>日期筛选:</label>
          <div class="date-filter-inputs">
            <div class="date-input-container">
              <input type="text" :value="startDateInput" placeholder="开始日期" @click="openDatePicker('start')" readonly
                class="filter-input date-input start-date-input-trigger">
            </div>
            <span>-</span>
            <div class="date-input-container">
              <input type="text" :value="endDateInput" placeholder="结束日期 (可选)" @click="openDatePicker('end')" readonly
                class="filter-input date-input end-date-input-trigger">
            </div>
          </div>
        </div>

        <!-- 关键字筛选 -->
        <div class="filter-group">
          <label>关键字筛选:</label>
          <input type="text" v-model="keywordInput" placeholder="输入关键字" @keyup.enter="applyKeywordFilter"
            @blur="applyKeywordFilter" class="filter-input keyword-input">
        </div>
      </div>

      <!-- 显示当前筛选 -->
      <div v-if="currentFilters.length > 0" class="active-filters">
        <span>当前筛选: </span>
        <div class="filter-tags">
          <span v-for="(filter, index) in currentFilters" :key="index" class="filter-tag">
            {{ filter }}
          </span>
          <button class="clear-filters-btn" @click="clearAllFilters">清除筛选</button>
        </div>
      </div>
    </div>

    <div v-if="taskStore.loading" class="loading-indicator">
      加载中...
    </div>

    <div v-else-if="tasksToShow.length === 0" class="empty-state">
      <p>没有任务</p>
    </div>

    <div v-else class="tasks-container">
      <div v-for="task in tasksToShow" :key="task.id" class="task-item" :class="{ 'completed': task.completed }">
        <div class="task-content">
          <div class="task-header">
            <div class="task-info">
              <span class="task-time">{{ formatCreatedAt(task.createdAt) }}</span>
              <span v-if="task.category" class="task-category">{{ task.category }}</span>
              <span class="task-status" :class="task.completed ? 'status-completed' : 'status-pending'">
                {{ task.completed ? '已完成' : '未完成' }}
              </span>
            </div>
            <div class="task-actions">
              <button class="action-btn toggle-btn" @click="handleToggleCompletion(task.id)">
                <span class="icon">{{ task.completed ? '↺' : '✓' }}</span>
              </button>
              <button class="action-btn delete-btn" @click="handleDeleteTask(task.id)">
                <span class="icon">🗑️</span>
              </button>
            </div>
          </div>
          <h4 class="task-title">{{ task.title }}</h4>
          <p v-if="task.content" class="task-description">{{ task.content }}</p>
          <p v-if="task.dueDate" class="task-due-date">截止日期: {{ formatDueDate(task.dueDate) }}</p>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="taskStore.totalPages > 1">
        <button class="pagination-btn" :disabled="taskStore.currentPage === 1" @click="goToPreviousPage">
          &lt;
        </button>
        <span class="current-page">{{ taskStore.currentPage }}</span>
        <button class="pagination-btn" :disabled="taskStore.currentPage === taskStore.totalPages" @click="goToNextPage">
          &gt;
        </button>
      </div>
    </div>

    <!-- 日期选择器抽屉组件 -->
    <DatePickerDrawer :is-open="showStartDateDrawer" :title="'选择开始日期'" :selected-date="startDateInput"
      @select="handleDateSelect" @close="closeDatePicker" />
    <DatePickerDrawer :is-open="showEndDateDrawer" :title="'选择结束日期'" :selected-date="endDateInput"
      @select="handleDateSelect" @close="closeDatePicker" />
  </div>
</template>

<style scoped>
.task-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.icon {
  margin-right: 8px;
  color: var(--text-primary);
}

/* 筛选区样式 */
.filters-section {
  margin-bottom: 16px;
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  padding: 12px 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  /* 移除max-height和overflow-y限制，让日期选择器可以正常弹出 */
}

.filter-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filter-btn {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: transparent;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-speed);
  white-space: nowrap;
}

.filter-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.filter-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background-color: var(--background-color-soft);
}

/* 新增输入框样式 */
.filter-input {
  padding: 6px 10px;
  font-size: 13px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--background-color);
  color: var(--text-primary);
  transition: border-color var(--transition-speed);
  box-sizing: border-box;
}

.filter-input:focus {
  border-color: var(--primary-color);
  outline: none;
}

.date-filter-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.date-filter-inputs span {
  color: var(--text-secondary);
}

.date-input {
  width: 120px;
  cursor: pointer;
}

.date-input-container {
  position: relative;
  /* 确保日期选择器不被父容器裁剪 */
  z-index: 10;
}

.keyword-input {
  width: 100%;
  max-width: 200px;
}

/* Date Picker Styles */
.date-picker-popover {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 1000;
  background: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 280px;
  padding: 12px;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  /* 确保日期选择器可以超出父容器边界 */
  overflow: visible;
}

.date-picker-popover-end {
  left: auto;
  right: 0;
}

.date-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.current-month {
  font-weight: 500;
  font-size: 14px;
}

.picker-nav {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--primary-color);
  padding: 4px 8px;
  border-radius: var(--border-radius);
  font-size: 14px;
}

.picker-nav:hover {
  background-color: var(--primary-light);
}

.date-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  /* gap: 5px; */
}

.date-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  width: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s, color 0.2s;
}

.date-cell:hover {
  background-color: var(--primary-light);
}

.date-cell.active {
  background-color: var(--primary-color);
  color: white;
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  flex-wrap: wrap;
}

.filter-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-tag {
  padding: 3px 8px;
  background-color: var(--primary-light);
  border-radius: var(--border-radius);
  font-size: 12px;
}

.clear-filters-btn {
  font-size: 12px;
  color: var(--primary-color);
  background: none;
  border: none;
  padding: 2px 6px;
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: background-color var(--transition-speed);
}

.clear-filters-btn:hover {
  background-color: var(--primary-light);
}

.tasks-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.loading-indicator,
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
}

.task-item {
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 12px 16px;
  margin-bottom: 12px;
  transition: transform var(--transition-speed), box-shadow var(--transition-speed);
  flex-shrink: 0;
}

.task-item.completed {
  background-color: var(--background-color);
  border: 1px dashed var(--border-color);
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.task-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.task-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.task-category {
  font-size: 11px;
  background-color: var(--primary-light);
  color: var(--primary-dark);
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.task-status {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
}

.status-completed {
  background-color: var(--success-light);
  color: var(--success-color);
}

.status-pending {
  background-color: var(--warning-light);
  color: var(--warning-color);
}

.task-actions {
  display: flex;
  gap: 8px;
  opacity: 1;
  visibility: visible;
}

.action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  cursor: pointer;
  transition: background-color var(--transition-speed);
}

.action-btn .icon {
  color: var(--text-primary);
  margin-right: 0;
}

.toggle-btn {
  background-color: var(--primary-light);
}

.delete-btn:hover {
  background-color: var(--danger-color);
  color: white;
}

.task-title {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

.task-description {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 4px 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

.task-due-date {
  font-size: 12px;
  color: var(--primary-color);
  margin: 4px 0 0 0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  gap: 12px;
  flex-shrink: 0;
  padding: 8px 0;
}

.pagination-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  background-color: var(--card-color);
  border: 1px solid var(--border-color);
  cursor: pointer;
  color: var(--primary-color);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.current-page {
  font-weight: 600;
  color: var(--primary-color);
}

/* Category specific styles */
.category-filter-group .filter-buttons {
  align-items: center;
}

.category-filter-item {
  position: relative;
  display: flex;
  align-items: center;
}

.category-btn {
  flex-grow: 1;
}

.category-actions-trigger-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.category-actions-trigger {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  padding: 2px 4px;
  font-size: 18px;
  line-height: 1;
  margin-left: 3px;
  border-radius: var(--border-radius-sm);
  width: 20px;
  text-align: center;
  box-sizing: border-box;
}

.category-actions-trigger:hover {
  background-color: var(--background-color-soft);
  color: var(--text-primary);
  border-color: var(--primary-color);
}

.category-actions-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 20;
  padding: 4px 0;
  min-width: 80px;
}

.category-actions-menu button {
  display: block;
  width: 100%;
  padding: 6px 12px;
  text-align: left;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 13px;
}

.category-actions-menu button:hover {
  background-color: var(--primary-light);
}

.category-edit-mode,
.category-add-mode {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 1px;
  border: 1px solid var(--primary-color);
  border-radius: var(--border-radius);
  background-color: var(--card-color);
}

.category-edit-input,
.category-add-input {
  padding: 4px 6px;
  font-size: 12px;
  border: none;
  outline: none;
  flex-grow: 1;
  min-width: 90px;
  background-color: transparent;
  color: var(--text-primary);
}

.add-category-btn-toggle {
  padding: 4px 8px;
  font-size: 14px;
  min-width: 30px;
  line-height: 1;
}

.add-category-wrapper {
  display: flex;
  align-items: center;
  margin-left: 6px;
}

.filter-buttons.category-buttons .filter-btn {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.filter-btn:disabled,
.category-actions-trigger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-action {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  cursor: pointer;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: var(--border-radius);
  transition: all var(--transition-speed);
}

.btn-action:hover {
  background-color: var(--primary-light);
}

.save-icon {
  color: var(--success-color);
}

.cancel-icon {
  color: var(--danger-color);
}

/* 响应式优化 */
@media (max-width: 767px) {
  .filters-section {
    padding: 8px 12px;
    /* 移动端添加固定高度和滚动条 */
    max-height: 200px;
    overflow-y: auto;
  }

  .filter-controls {
    grid-template-columns: 1fr;
    gap: 8px;
    /* 移动端移除margin-bottom，避免影响滚动区域 */
    margin-bottom: 8px;
  }

  .date-filter-inputs {
    flex-direction: column;
    align-items: stretch;
  }

  .date-input {
    width: 100%;
  }

  .keyword-input {
    max-width: none;
  }

  .task-item {
    padding: 10px 12px;
    margin-bottom: 8px;
  }

  .task-header {
    flex-direction: column;
    gap: 8px;
  }

  .task-actions {
    align-self: flex-end;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .filter-controls {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .filter-controls {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>