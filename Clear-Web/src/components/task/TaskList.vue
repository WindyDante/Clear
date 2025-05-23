<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted, nextTick } from 'vue' // 引入 onUnmounted and nextTick
import { useTaskStore } from '../../store/task'
import { useCategoryStore, type Category } from '../../store/category' // Import Category type
import { useToast } from '../../composables/useToast'
import { useRouter } from 'vue-router';

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
// const categoryActionVisible = ref<string | null>(null); // Removed
const openedCategoryMenuId = ref<string | null>(null); // New: Tracks open actions menu
const categoryEditInputRef = ref<HTMLInputElement | null>(null);
const newCategoryInputRef = ref<HTMLInputElement | null>(null);

// --- 日期选择器状态 ---
const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)
const startDatePickerContainerRef = ref<HTMLElement | null>(null)
const endDatePickerContainerRef = ref<HTMLElement | null>(null)

const pickerCurrentYear = ref(new Date().getFullYear())
const pickerCurrentMonth = ref(new Date().getMonth()) // 0-indexed

const monthNames = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月"
];

const pickerDaysInMonth = computed(() => {
  return new Date(pickerCurrentYear.value, pickerCurrentMonth.value + 1, 0).getDate();
});

const pickerCurrentMonthName = computed(() => {
  return `${monthNames[pickerCurrentMonth.value]} ${pickerCurrentYear.value}`;
});

function pickerPrevMonth() {
  if (pickerCurrentMonth.value === 0) {
    pickerCurrentMonth.value = 11;
    pickerCurrentYear.value--;
  } else {
    pickerCurrentMonth.value--;
  }
}

function pickerNextMonth() {
  if (pickerCurrentMonth.value === 11) {
    pickerCurrentMonth.value = 0;
    pickerCurrentYear.value++;
  } else {
    pickerCurrentMonth.value++;
  }
}

const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const openPicker = (type: 'start' | 'end') => {
  const today = new Date();
  let currentDateVal: string | undefined;

  if (type === 'start') {
    showStartDatePicker.value = !showStartDatePicker.value; // Toggle
    showEndDatePicker.value = false; // Close other picker
    currentDateVal = startDateInput.value;
  } else {
    showEndDatePicker.value = !showEndDatePicker.value; // Toggle
    showStartDatePicker.value = false; // Close other picker
    currentDateVal = endDateInput.value;
  }

  // Initialize picker date
  if (currentDateVal) {
    const [year, month, day] = currentDateVal.split('-').map(Number);
    if (year && month && day) {
      pickerCurrentYear.value = year;
      pickerCurrentMonth.value = month - 1; // Month is 0-indexed
    } else { // Fallback to today if date format is invalid
      pickerCurrentYear.value = today.getFullYear();
      pickerCurrentMonth.value = today.getMonth();
    }
  } else {
    pickerCurrentYear.value = today.getFullYear();
    pickerCurrentMonth.value = today.getMonth();
  }
};

const selectDate = (day: number, type: 'start' | 'end') => {
  const selectedDate = new Date(pickerCurrentYear.value, pickerCurrentMonth.value, day);
  const formattedDate = formatDateToYYYYMMDD(selectedDate);

  if (type === 'start') {
    startDateInput.value = formattedDate;
    showStartDatePicker.value = false;
  } else {
    endDateInput.value = formattedDate;
    showEndDatePicker.value = false;
  }
  taskStore.setDateRange(startDateInput.value || undefined, endDateInput.value || undefined);
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  // Check for start date picker
  if (showStartDatePicker.value && startDatePickerContainerRef.value && !startDatePickerContainerRef.value.contains(target)) {
    const startDateTrigger = document.querySelector('.start-date-input-trigger');
    if (!startDateTrigger || !startDateTrigger.contains(target)) {
      showStartDatePicker.value = false;
    }
  }
  // Check for end date picker
  if (showEndDatePicker.value && endDatePickerContainerRef.value && !endDatePickerContainerRef.value.contains(target)) {
    const endDateTrigger = document.querySelector('.end-date-input-trigger');
    if (!endDateTrigger || !endDateTrigger.contains(target)) {
      showEndDatePicker.value = false;
    }
  }
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
  document.addEventListener('click', handleClickOutside, true);
  document.addEventListener('click', closeCategoryMenuOnClickOutside, true);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true);
  document.removeEventListener('click', closeCategoryMenuOnClickOutside, true);
});

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

    // The success toast for toggling completion is now handled in the taskStore's updateTask action
    // if (task) {
    //   showToast(`任务"${task.title}"已标记为${task.completed ? '未完成' : '完成'}`, 'success')
    // }
  } catch (error) {
    // Error toast is handled by the API service or store
    // showToast('操作失败，请重试', 'error')
    console.error('Error toggling task completion:', error) // Keep console error for debugging
  }
}

async function handleDeleteTask(taskId: string) {
  if (!props.canOperate) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  try {
    // const task = taskStore.getTaskById(taskId) // No longer needed here for toast
    await taskStore.deleteTask(taskId)

    // Success toast is now handled in the taskStore's deleteTask action
    // if (task) {
    //   showToast(`任务"${task.title}"已删除`, 'info')
    // }
  } catch (error) {
    // Error toast is handled by the API service or store
    // showToast('删除失败，请重试', 'error')
    console.error('Error deleting task:', error) // Keep console error for debugging
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
  showStartDatePicker.value = false; // Close picker
  showEndDatePicker.value = false;   // Close picker
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
              <input type="text" :value="startDateInput" placeholder="开始日期" @click="openPicker('start')" readonly
                class="filter-input date-input start-date-input-trigger">
              <div v-if="showStartDatePicker" class="date-picker-popover" ref="startDatePickerContainerRef">
                <div class="date-picker-header">
                  <button class="picker-nav" @click.stop="pickerPrevMonth">◀</button>
                  <div class="current-month">{{ pickerCurrentMonthName }}</div>
                  <button class="picker-nav" @click.stop="pickerNextMonth">▶</button>
                </div>
                <div class="date-grid">
                  <div v-for="day in pickerDaysInMonth" :key="day" class="date-cell"
                    :class="{ 'active': startDateInput === formatDateToYYYYMMDD(new Date(pickerCurrentYear, pickerCurrentMonth, day)) }"
                    @click.stop="selectDate(day, 'start')">
                    {{ day }}
                  </div>
                </div>
              </div>
            </div>
            <span>-</span>
            <div class="date-input-container">
              <input type="text" :value="endDateInput" placeholder="结束日期 (可选)" @click="openPicker('end')" readonly
                class="filter-input date-input end-date-input-trigger">
              <div v-if="showEndDatePicker" class="date-picker-popover date-picker-popover-end"
                ref="endDatePickerContainerRef">
                <div class="date-picker-header">
                  <button class="picker-nav" @click.stop="pickerPrevMonth">◀</button>
                  <div class="current-month">{{ pickerCurrentMonthName }}</div>
                  <button class="picker-nav" @click.stop="pickerNextMonth">▶</button>
                </div>
                <div class="date-grid">
                  <div v-for="day in pickerDaysInMonth" :key="day" class="date-cell"
                    :class="{ 'active': endDateInput === formatDateToYYYYMMDD(new Date(pickerCurrentYear, pickerCurrentMonth, day)) }"
                    @click.stop="selectDate(day, 'end')">
                    {{ day }}
                  </div>
                </div>
              </div>
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
  </div>
</template>

<style scoped>
.task-list {
  margin-bottom: 24px;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.icon {
  margin-right: 8px;
  color: var(--text-primary);
  /* Ensure icon color is visible */
}

/* 筛选区样式 */
.filters-section {
  margin-bottom: 20px;
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  padding: 12px 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  /* 调整整体间距 */
  margin-bottom: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-grow: 1;
  /* 让筛选组在空间足够时可以扩展 */
}

.filter-group label {
  font-size: 13px;
  color: var(--text-secondary);
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
  /* 添加默认文字颜色 */
  cursor: pointer;
  transition: all var(--transition-speed);
}

.filter-btn.active {
  background-color: var(--primary-color);
  color: white;
  /* Ensure text is white on active */
  border-color: var(--primary-color);
}

.filter-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background-color: var(--background-color-soft);
  /* Slightly different background for disabled */
}

/* 新增输入框样式 */
.filter-input {
  padding: 6px 10px;
  font-size: 13px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--background-color);
  /* 改为背景色以区分按钮 */
  color: var(--text-primary);
  transition: border-color var(--transition-speed);
  box-sizing: border-box;
  /* 确保padding和border不会增加元素总宽度 */
}

.filter-input:focus {
  border-color: var(--primary-color);
  outline: none;
}

.date-filter-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
}

.date-filter-inputs span {
  color: var(--text-secondary);
}

.date-input {
  width: 120px;
  /* 根据需要调整日期输入框宽度 */
  cursor: pointer;
  /* Indicate it's clickable */
}

.date-input-container {
  position: relative;
  /* For positioning the date picker */
}

.keyword-input {
  width: 100%;
  /* 关键字输入框可以更宽 */
  max-width: 200px;
  /* 但也给一个最大宽度 */
}


/* Date Picker Styles (adapted from TaskForm.vue) */
.date-picker-popover {
  position: absolute;
  top: calc(100% + 8px);
  /* Position below the input */
  left: 0;
  z-index: 1000;
  /* Ensure it's above other elements */
  background: var(--card-color);
  /* Use card color for background */
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 280px;
  /* Adjust width as needed */
  padding: 12px;
  color: var(--text-primary);
  /* Use primary text color */
  border: 1px solid var(--border-color);
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
  gap: 5px;
  /* Adjust gap as needed */
}

.date-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  /* Adjust size as needed */
  width: 30px;
  /* Adjust size as needed */
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
  /* Ensure text is white on active */
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
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 12px 16px;
  transition: transform var(--transition-speed), box-shadow var(--transition-speed);
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
  /* Changed from --primary-color for potentially better contrast */
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
  /* Added for better readability */
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
  /* Ensure actions are always visible */
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
  /* Targeting icons specifically within action buttons */
  color: var(--text-primary);
  /* Ensure icons in action buttons are visible */
  margin-right: 0;
  /* Reset margin if not needed here */
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

.loading-indicator,
.empty-state {
  text-align: center;
  padding: 24px;
  color: var(--text-secondary);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 12px;
}

.pagination-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  background-color: var(--card-color);
  /* Changed to card-color for better visibility */
  border: 1px solid var(--border-color);
  /* Added border */
  cursor: pointer;
  color: var(--primary-color);
  /* Added text color for < and > */
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
  /* Align items for better layout with add/edit inputs */
}

.category-filter-item {
  position: relative;
  display: flex;
  /* Changed to flex for better alignment of button and actions trigger */
  align-items: center;
}

.category-btn {
  /* Adjust if needed, ensure it doesn't overlap with actions trigger */
  flex-grow: 1;
  /* Allow button to take space if category name is long */
}

/* Removed .category-actions-overlay styles */

.category-actions-trigger-wrapper {
  position: relative;
  /* For positioning the menu */
  display: flex;
  align-items: center;
}

.category-actions-trigger {
  background: none;
  /* border: none; */
  /* Removed to add a new border */
  border: 1px solid var(--border-color);
  /* Added border */
  color: var(--text-secondary);
  cursor: pointer;
  padding: 2px 4px;
  font-size: 18px;
  line-height: 1;
  margin-left: 3px;
  /* Adjusted margin to account for the new border */
  border-radius: var(--border-radius-sm);
  width: 20px;
  text-align: center;
  box-sizing: border-box;
  /* Ensure padding and border are included in the element's total width and height */
}

.category-actions-trigger:hover {
  background-color: var(--background-color-soft);
  color: var(--text-primary);
  border-color: var(--primary-color);
  /* Optional: highlight border on hover */
}

.category-actions-menu {
  position: absolute;
  top: 100%;
  /* Position below the trigger */
  right: 0;
  /* Align to the right of the trigger wrapper */
  background-color: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 20;
  /* Ensure it's above other filter items */
  padding: 4px 0;
  /* Padding for menu items */
  min-width: 80px;
  /* Minimum width for the menu */
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
  /* Minimal padding */
  border: 1px solid var(--primary-color);
  border-radius: var(--border-radius);
  background-color: var(--card-color);
  /* margin-right: 4px; */
  /* Ensure space if it replaces a button */
}

.category-edit-input,
.category-add-input {
  padding: 4px 6px;
  font-size: 12px;
  border: none;
  outline: none;
  flex-grow: 1;
  min-width: 90px;
  /* Adjusted min-width */
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
  /* Space from the last category or 'All' button */
}

/* Ensure filter buttons are not overly affected by flex changes if names are long */
.filter-buttons.category-buttons .filter-btn {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
  /* Adjust as needed, prevents very long names from breaking layout */
}

.filter-btn:disabled,
.category-actions-trigger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  /* background-color: var(--background-color-soft) !important; */
}

/* ...rest of the existing styles... */
</style>