<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { useTaskStore } from "../../store/task";
import { useCategoryStore } from "../../store/category";
import { useToast } from "../../composables/useToast";
import { useRouter } from 'vue-router';
import DatePickerDrawer from '../common/DatePickerDrawer.vue'

const props = defineProps<{
  canOperate?: boolean
  isDrawerMode?: boolean // 新增：是否为抽屉模式
}>()

const emit = defineEmits<{
  taskAdded: [] // 新增：任务添加成功事件
}>()

// Helper to get time with an offset from now
function getOffsetTime(hoursOffset: number = 0, minutesOffset: number = 0) {
  const now = new Date();
  now.setHours(now.getHours() + hoursOffset);
  now.setMinutes(now.getMinutes() + minutesOffset);
  now.setSeconds(0, 0); // Zero out seconds and milliseconds for consistency
  return {
    date: new Date(now), // Return a new Date object
    hour: now.getHours().toString().padStart(2, '0'),
    minute: now.getMinutes().toString().padStart(2, '0'),
  };
}

const initialDefaultTimeInfo = getOffsetTime(1, 0); // Default to one hour from now

const taskStore = useTaskStore();
const categoryStore = useCategoryStore(); // 使用集中的分类状态管理
const { showToast } = useToast();
const router = useRouter(); // Added

// 日期选择器抽屉状态
const showDatePickerDrawer = ref(false);

// 时间选择器数据
const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const selectedHour = ref(initialDefaultTimeInfo.hour);
const selectedMinute = ref(initialDefaultTimeInfo.minute);

const newTask = reactive({
  title: "",
  content: "",
  category: "", // 存储分类名称
  categoryId: "", // 存储分类ID，使用字符串类型
  dueDate: initialDefaultTimeInfo.date.toISOString(), // Default to one hour from now
  dueTime: `${initialDefaultTimeInfo.hour}:${initialDefaultTimeInfo.minute}` as string, // Default to one hour from now
});

// 监听分类数据变化，确保选择框始终显示正确的选中项
watch(() => categoryStore.categories, (categories) => {
  if (categories && categories.length > 0) {
    // 如果分类数据变化且有数据，设置默认选中第一个分类
    const firstCategory = categories[0];
    newTask.category = firstCategory.categoryName;
    // 使用正确的字段名 id
    newTask.categoryId = firstCategory.id;
  } else {
    // 没有分类时，清空选择
    newTask.category = "";
    newTask.categoryId = "";
  }
}, { immediate: true }); // immediate: true 确保在组件创建时立即执行一次

// 格式化日期显示为24小时制
function formatDateTime(dateString: string | null) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 格式化日期为 YYYY-MM-DD 格式（用于日期选择器抽屉）
function formatDateToYYYYMMDD(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 日期选择器相关方法
function openDatePicker() {
  if (!props.canOperate) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  showDatePickerDrawer.value = true;
}

function handleDateSelect(dateStr: string) {
  // dateStr 格式为 YYYY-MM-DD
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // 使用当前选择的时间
  const [hours, minutes] = newTask.dueTime.split(':').map(Number);
  
  // 创建本地时间，避免时区转换
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
  
  // 直接使用本地时间字符串，避免ISO转换
  const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  newTask.dueDate = formattedDate;
  showDatePickerDrawer.value = false;
}

function closeDatePicker() {
  showDatePickerDrawer.value = false;
}

// 处理时间选择器更改
function handleTimeChange() {
  // 更新时间
  newTask.dueTime = `${selectedHour.value}:${selectedMinute.value}`;

  // 如果已经选择了日期，则更新日期时间
  if (newTask.dueDate) {
    // 解析现有日期
    const existingDate = new Date(newTask.dueDate);
    const year = existingDate.getFullYear();
    const month = existingDate.getMonth() + 1;
    const day = existingDate.getDate();
    
    // 使用新的时间
    const hours = parseInt(selectedHour.value);
    const minutes = parseInt(selectedMinute.value);
    
    // 重新构建日期字符串，避免时区转换
    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
    newTask.dueDate = formattedDate;
  }
}

// 生命周期钩子
onMounted(() => {
  // 不再单独获取分类数据，而是使用父组件已加载的共享状态
  // 初始化任务的分类选项
  if (categoryStore.categories.length > 0) {
    const firstCategory = categoryStore.categories[0];
    newTask.category = firstCategory.categoryName;
    // 使用正确的字段名 id
    newTask.categoryId = firstCategory.id;
  } else {
    // 如果分类列表为空，清空选择
    newTask.category = "";
    newTask.categoryId = "";
  }

  // 初始化时间选择器的值
  if (newTask.dueTime) {
    const [hour, minute] = newTask.dueTime.split(':');
    selectedHour.value = hour;
    selectedMinute.value = minute;
  }
});

// 添加表单验证状态
const titleError = ref('');

// 新增：快速创建分类相关状态
const showAddCategoryInput = ref(false);
const newCategoryName = ref('');
const isAddingCategory = ref(false);

// 实时验证标题输入
function validateTitle() {
  if (!newTask.title.trim()) {
    titleError.value = '请输入任务标题';
  } else {
    titleError.value = '';
  }
}

// 监听标题输入变化
watch(() => newTask.title, () => {
  if (titleError.value) {
    validateTitle();
  }
});

// 新增：快速创建分类相关函数
function toggleAddCategoryInput() {
  if (!props.canOperate) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  showAddCategoryInput.value = !showAddCategoryInput.value;
  if (showAddCategoryInput.value) {
    newCategoryName.value = '';
  }
}

async function handleAddCategory() {
  if (!props.canOperate) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  
  if (!newCategoryName.value.trim()) {
    showToast('请输入分类名称', 'error');
    return;
  }

  isAddingCategory.value = true;
  try {
    await categoryStore.addCategory(newCategoryName.value.trim());
    
    // 创建成功后，自动选择新创建的分类
    const newCategory = categoryStore.categories.find(cat => cat.categoryName === newCategoryName.value.trim());
    if (newCategory) {
      newTask.category = newCategory.categoryName;
      newTask.categoryId = newCategory.id;
    }
    
    // 重置输入状态
    newCategoryName.value = '';
    showAddCategoryInput.value = false;
    showToast('分类创建成功', 'success');
  } catch (error) {
    console.error('创建分类失败:', error);
  } finally {
    isAddingCategory.value = false;
  }
}

function cancelAddCategory() {
  showAddCategoryInput.value = false;
  newCategoryName.value = '';
}

async function handleSubmit() {
  if (!props.canOperate) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  
  // 改进标题验证，添加明确的错误提示
  if (!newTask.title.trim()) {
    titleError.value = '请输入任务标题';
    showToast('请输入任务标题', 'error');
    return;
  }

  // 清除标题错误状态
  titleError.value = '';

  // 校验分类是否选择
  if (!newTask.categoryId && categoryStore.categories.length > 0) {
    showToast("请选择一个分类", "error");
    return;
  } else if (categoryStore.categories.length === 0) {
    showToast("请先添加分类后再创建任务", "error");
    return;
  }

  // 校验截止日期是否小于当前时间
  if (newTask.dueDate) {
    const selectedDueDate = new Date(newTask.dueDate);
    const now = new Date();
    const selectedDateComparable = new Date(selectedDueDate.getFullYear(), selectedDueDate.getMonth(), selectedDueDate.getDate(), selectedDueDate.getHours(), selectedDueDate.getMinutes());
    const nowDateComparable = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());

    if (selectedDateComparable < nowDateComparable) {
      showToast("截止日期不能小于当前时间", "error");
      return;
    }
  }

  try {
    await taskStore.addTask({
      title: newTask.title,
      content: newTask.content,
      category: newTask.category,
      categoryId: newTask.categoryId,
      dueDate: newTask.dueDate,
    });

    // Reset form
    newTask.title = "";
    newTask.content = "";

    // 重置为第一个分类或清空
    if (categoryStore.categories.length > 0) {
      const firstCategory = categoryStore.categories[0];
      newTask.category = firstCategory.categoryName;
      newTask.categoryId = firstCategory.id;
    } else {
      newTask.category = "";
      newTask.categoryId = "";
    }

    // 重置时间为当前时间 + 1 小时
    const resetTimeInfo = getOffsetTime(1, 0);
    newTask.dueTime = `${resetTimeInfo.hour}:${resetTimeInfo.minute}`;
    selectedHour.value = resetTimeInfo.hour;
    selectedMinute.value = resetTimeInfo.minute;
    newTask.dueDate = resetTimeInfo.date.toISOString();

    // 发射任务添加成功事件
    emit('taskAdded');
  } catch (error) {
    // 显示添加失败的 Toast
  }
}
</script>

<template>
  <div class="task-form" :class="{ 'drawer-mode': isDrawerMode }">
    <!-- 移除标题和切换按钮，在抽屉模式下不需要 -->
    <div v-if="!isDrawerMode" class="form-title">
      <span class="icon">📦</span> 添加任务
    </div>

    <!-- 移除条件显示，表单内容始终显示 -->
    <div class="task-form-content">
      <div class="task-inputs">
        <input v-model="newTask.title" class="form-control task-title" placeholder="输入任务标题..."
          @keyup.enter="handleSubmit" />

        <textarea v-model="newTask.content" class="form-control task-content" placeholder="输入任务内容..."
          :rows="isDrawerMode ? 2 : 3"></textarea>
      </div>

      <div class="form-section">
        <div class="field-header">
          <p class="field-label">选择分类：</p>
          <button 
            type="button" 
            class="add-category-btn"
            @click="toggleAddCategoryInput"
            :disabled="!canOperate"
            title="快速创建分类"
          >
            <span v-if="!showAddCategoryInput">+ 新建</span>
            <span v-else>取消</span>
          </button>
        </div>
        
        <div class="category-selector">
          <select class="form-control select-control"
            :disabled="categoryStore.loading || categoryStore.categories.length === 0" v-model="newTask.categoryId">
            <option v-if="categoryStore.loading" value="" disabled>加载中...</option>
            <option v-else-if="!categoryStore.loading && categoryStore.categories.length === 0" value="" disabled>
              暂无分类，请先添加</option>
            <option v-for="category in categoryStore.categories" :key="category.id"
              :value="category.id">
              {{ category.categoryName }}
            </option>
          </select>
          <span class="select-arrow">▼</span>
        </div>
        
        <!-- 快速创建分类输入区域 -->
        <div v-if="showAddCategoryInput" class="quick-add-category">
          <div class="quick-add-input-group">
            <input 
              v-model="newCategoryName"
              type="text" 
              placeholder="输入分类名称"
              class="form-control"
              maxlength="50"
              @keyup.enter="handleAddCategory"
              @keyup.esc="cancelAddCategory"
            />
            <button 
              type="button"
              class="confirm-btn"
              @click="handleAddCategory"
              :disabled="isAddingCategory || !newCategoryName.trim()"
            >
              {{ isAddingCategory ? '创建中...' : '确定' }}
            </button>
            <button 
              type="button"
              class="cancel-btn"
              @click="cancelAddCategory"
              :disabled="isAddingCategory"
            >
              取消
            </button>
          </div>
        </div>
      </div>

      <div class="form-section">
        <p class="field-label">截止日期：</p>
        <div class="date-picker-trigger" @click="openDatePicker">
          <input :value="formatDateTime(newTask.dueDate)" class="form-control" placeholder="选择日期" readonly />
          <span class="calendar-icon">📅</span>
        </div>

        <div class="time-picker">
          <p class="field-label">选择时间：</p>
          <div class="time-selectors">
            <select v-model="selectedHour" class="form-control time-select" @change="handleTimeChange">
              <option v-for="hour in hours" :key="hour" :value="hour">{{ hour }}</option>
            </select>
            <span class="separator">:</span>
            <select v-model="selectedMinute" class="form-control time-select" @change="handleTimeChange">
              <option v-for="minute in minutes" :key="minute" :value="minute">{{ minute }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary submit-btn" :disabled="!newTask.title.trim()" @click="handleSubmit">
          <span class="icon">✓</span>
          添加任务
        </button>
      </div>
    </div>

    <!-- 日期选择器抽屉组件 -->
    <DatePickerDrawer :is-open="showDatePickerDrawer" :title="'选择截止日期'"
      :selected-date="formatDateToYYYYMMDD(newTask.dueDate)" @select="handleDateSelect" @close="closeDatePicker" />
  </div>
</template>

<style scoped>
.task-form {
  padding: 16px;
}

.task-form.drawer-mode {
  padding: 16px 24px;
  background: none;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.task-form.drawer-mode .card {
  background: none;
  box-shadow: none;
  border: none;
}

.form-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.icon {
  margin-right: 8px;
}

.task-inputs {
  margin-bottom: 12px;
}

.task-title {
  margin-bottom: 10px;
  font-weight: 500;
}

.task-content {
  resize: vertical;
  min-height: 60px;
}

.field-label {
  margin-bottom: 6px;
  font-size: 14px;
  color: var(--text-secondary);
}

/* 分类字段头部样式 */
.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.add-category-btn {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-category-btn:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
}

.add-category-btn:disabled {
  background: #6c757d;
  color: #ffffff;
  cursor: not-allowed;
  transform: none;
  opacity: 0.6;
}

/* 快速创建分类区域样式 */
.quick-add-category {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.quick-add-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.quick-add-input-group .form-control {
  flex: 1;
  min-width: 0;
}

.confirm-btn {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.confirm-btn:hover:not(:disabled) {
  background: #1e7e34;
  transform: translateY(-1px);
}

.confirm-btn:disabled {
  background: #6c757d;
  color: #ffffff;
  cursor: not-allowed;
  transform: none;
  opacity: 0.6;
}

.cancel-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.cancel-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
  color: #495057;
}

.cancel-btn:disabled {
  background: #e9ecef;
  color: #6c757d;
  border-color: #dee2e6;
  cursor: not-allowed;
  opacity: 0.6;
}

.category-selector,
.date-picker-trigger {
  position: relative;
}

.calendar-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.date-picker-demo {
  position: absolute;
  z-index: 100;
  background: var(--datepicker-bg);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 320px;
  margin-top: 8px;
  padding: 16px;
  color: var(--datepicker-text-color);
  /* 移动端优化：防止超出屏幕 */
  left: 0;
  right: 0;
  max-width: calc(100vw - 48px);
  margin-left: auto;
  margin-right: auto;
}

/* 移动端特殊处理 */
@media (max-width: 480px) {
  .date-picker-demo {
    position: fixed;
    top: 40%;
    left: 20px;
    right: 20px;
    transform: translateY(-50%);
    max-width: none;
    width: calc(100vw - 40px);
    margin: 0;
    z-index: 1001;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-color);
  }

  /* 添加遮罩层 */
  .date-picker-demo::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: -1;
  }

  /* 移动端日期选择器内容优化 */
  .date-picker-demo .date-picker-header {
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-color);
  }

  .date-picker-demo .current-month {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-color);
  }

  .date-picker-demo .picker-nav {
    padding: 8px 12px;
    background-color: var(--background-color);
    color: var(--text-color);
    font-size: 16px;
  }

  .date-picker-demo .date-cell {
    height: 36px;
    width: 36px;
    font-size: 14px;
    font-weight: 500;
  }
}

/* PC端样式恢复（桌面端保持原样） */
@media (min-width: 481px) {
  .date-picker-demo {
    position: absolute;
    max-width: 320px;
    margin-top: 8px;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    margin-left: 0;
    margin-right: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: none;
  }

  /* PC端不需要遮罩层 */
  .date-picker-demo::before {
    display: none;
  }
}

.date-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: var(--datepicker-text-color);
}

.current-month {
  font-weight: 500;
  color: var(--datepicker-text-color);
}

.picker-nav {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--datepicker-text-color);
  padding: 4px 8px;
  border-radius: var(--border-radius);
}

.picker-nav:hover {
  background-color: var(--datepicker-hover-bg);
}

.date-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  /* gap: 8px; */
}

.date-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  width: 32px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--datepicker-text-color);
  transition: background-color var(--transition-speed), color var(--transition-speed);
}

.date-cell:hover {
  background-color: var(--datepicker-hover-bg);
}

.date-cell.active {
  background-color: var(--primary-color);
  color: var(--datepicker-active-text-color);
}

.time-picker {
  margin-top: 12px;
  position: relative;
}

.time-selectors {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 40px;
  position: relative;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  max-width: 100px;
  margin: 0;
}

.time-select {
  margin: 10px;
  width: 50px;
  padding: 0;
  height: 100%;
  border: none;
  border-radius: var(--border-radius);
  background-color: var(--card-bg);
  /* 改为使用卡片背景色，提高可见度 */
  color: var(--text-color);
  font-size: 15px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  text-align: center;
  text-align-last: center;
  line-height: 40px;
  opacity: 1;
  /* 确保完全不透明 */
}

.time-select option {
  background-color: var(--card-bg);
  color: var(--text-color);
  font-size: 14px;
  opacity: 1;
  /* 确保选项也不透明 */
}

select {
  max-height: 200px;
  overflow-y: auto;
}

.separator {
  font-size: 18px;
  color: var(--text-color);
  margin: 0 5px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  margin-bottom: 0;
}

.submit-btn {
  flex-grow: 1;
  min-height: 44px;
  font-weight: 500;
}

.form-section {
  margin-bottom: 12px;
}

.select-control {
  padding-right: 30px !important;
  appearance: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  background-image: none !important;
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 12px;
  color: var(--text-secondary);
}

.select-control {
  background-color: var(--card-color) !important;
  border: 1px solid var(--border-color) !important;
}

.select-control::-ms-expand {
  display: block !important;
}

.category-selector {
  position: relative;
  overflow: visible;
}

/* 任务表单内容区域样式 */
.task-form-content {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 抽屉模式下的特殊样式 */
.task-form.drawer-mode .task-form-content {
  margin-top: 0;
  height: 100%;
}

.task-form.drawer-mode .submit-btn {
  background-color: var(--primary-color);
  color: var(--text-on-primary);
  /* 使用主题定义的文字颜色 */
  border: none;
  border-radius: var(--border-radius);
  font-size: 16px;
  margin-top: auto;
  opacity: 1;
  /* 确保按钮不透明 */
}

.task-form.drawer-mode .submit-btn:hover:not(:disabled) {
  background-color: var(--primary-light);
}

.task-form.drawer-mode .task-content {
  min-height: 48px;
  background-color: var(--card-bg);
  /* 确保输入框背景不透明 */
  color: var(--text-color);
  /* 确保文字颜色清晰 */
  opacity: 1;
}

.task-form.drawer-mode .task-title {
  margin-bottom: 8px;
  background-color: var(--card-bg);
  /* 确保输入框背景不透明 */
  color: var(--text-color);
  /* 确保文字颜色清晰 */
  opacity: 1;
}

.task-form.drawer-mode .form-control {
  background-color: var(--card-bg) !important;
  color: var(--text-color) !important;
  opacity: 1 !important;
}

.task-form.drawer-mode .field-label {
  color: var(--text-color);
  /* 使用主文字颜色而不是次要颜色 */
  opacity: 1;
}

.task-form.drawer-mode .select-control {
  background-color: var(--card-bg) !important;
  color: var(--text-color) !important;
  opacity: 1 !important;
}

/* 快速创建分类按钮移动端适配 */
@media (max-width: 480px) {
  .field-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .add-category-btn {
    background: #007bff !important;
    color: white !important;
    opacity: 1 !important;
  }
  
  .add-category-btn:hover:not(:disabled) {
    background: #0056b3 !important;
  }
  
  .quick-add-input-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .quick-add-input-group .form-control {
    width: 100%;
  }
  
  .confirm-btn,
  .cancel-btn {
    width: 100%;
    padding: 10px;
    opacity: 1 !important;
  }
  
  .confirm-btn {
    background: #28a745 !important;
    color: white !important;
  }
  
  .confirm-btn:hover:not(:disabled) {
    background: #1e7e34 !important;
  }
  
  .cancel-btn {
    background: #f8f9fa !important;
    color: #6c757d !important;
    border: 1px solid #dee2e6 !important;
  }
  
  .cancel-btn:hover:not(:disabled) {
    background: #e9ecef !important;
    color: #495057 !important;
  }
  
  .quick-add-category {
    background: #f8f9fa !important;
    border: 1px solid #e9ecef !important;
  }
}
</style>