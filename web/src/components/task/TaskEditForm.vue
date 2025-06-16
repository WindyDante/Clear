<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useTaskStore } from "../../store/task";
import { useCategoryStore } from "../../store/category";
import { useToast } from "../../composables/useToast";
import { useRouter } from 'vue-router';
import DatePickerDrawer from '../common/DatePickerDrawer.vue'

const props = defineProps<{
  canOperate?: boolean
  taskId: string
  isDrawerMode?: boolean
}>()

const emit = defineEmits<{
  taskUpdated: []
  close: []
}>()

const taskStore = useTaskStore();
const categoryStore = useCategoryStore();
const { showToast } = useToast();
const router = useRouter();

// 日期选择器抽屉状态
const showDatePickerDrawer = ref(false);

// 时间选择器数据
const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const selectedHour = ref('00');
const selectedMinute = ref('00');

// 编辑任务的表单数据
const editTask = reactive({
  title: "",
  content: "",
  category: "",
  categoryId: "",
  dueDate: null as string | null,
  dueTime: "00:00" as string,
});

// 添加表单验证状态
const titleError = ref('');

// 获取当前任务数据
const currentTask = computed(() => {
  return taskStore.getTaskById(props.taskId);
});

// 初始化表单数据
function initializeForm() {
  const task = currentTask.value;
  if (task) {
    editTask.title = task.title;
    editTask.content = task.content || "";
    editTask.category = task.category;
    editTask.categoryId = task.categoryId?.toString() || "";
    editTask.dueDate = task.dueDate;
    
    // 如果有截止日期，提取时间
    if (task.dueDate) {
      const date = new Date(task.dueDate);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      editTask.dueTime = `${hours}:${minutes}`;
      selectedHour.value = hours;
      selectedMinute.value = minutes;
    }
  }
}

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
function formatDateToYYYYMMDD(dateString: string | null): string {
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
  const [hours, minutes] = editTask.dueTime.split(':').map(Number);
  
  // 创建本地时间，避免时区转换
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
  
  // 直接使用本地时间字符串，避免ISO转换
  const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  editTask.dueDate = formattedDate;
  showDatePickerDrawer.value = false;
}

function closeDatePicker() {
  showDatePickerDrawer.value = false;
}

// 处理时间选择器更改
function handleTimeChange() {
  // 更新时间
  editTask.dueTime = `${selectedHour.value}:${selectedMinute.value}`;

  // 如果已经选择了日期，则更新日期时间
  if (editTask.dueDate) {
    // 解析现有日期
    const existingDate = new Date(editTask.dueDate);
    const year = existingDate.getFullYear();
    const month = existingDate.getMonth() + 1;
    const day = existingDate.getDate();
    
    // 使用新的时间
    const hours = parseInt(selectedHour.value);
    const minutes = parseInt(selectedMinute.value);
    
    // 重新构建日期字符串，避免时区转换
    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
    editTask.dueDate = formattedDate;
  }
}

// 实时验证标题输入
function validateTitle() {
  if (!editTask.title.trim()) {
    titleError.value = '请输入任务标题';
  } else {
    titleError.value = '';
  }
}

// 监听标题输入变化
watch(() => editTask.title, () => {
  if (titleError.value) {
    validateTitle();
  }
});

// 提交编辑
async function handleSubmit() {
  if (!props.canOperate) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  
  if (!editTask.title.trim()) {
    titleError.value = '请输入任务标题';
    showToast('任务标题不能为空', 'error');
    return;
  }

  // 清除标题错误状态
  titleError.value = '';

  // 校验分类是否选择
  if (!editTask.categoryId && categoryStore.categories.length > 0) {
    showToast("请选择一个分类", "error");
    return;
  }

  // 校验截止日期是否小于当前时间
  if (editTask.dueDate) {
    const selectedDueDate = new Date(editTask.dueDate);
    const now = new Date();
    const selectedDateComparable = new Date(selectedDueDate.getFullYear(), selectedDueDate.getMonth(), selectedDueDate.getDate(), selectedDueDate.getHours(), selectedDueDate.getMinutes());
    const nowDateComparable = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());

    if (selectedDateComparable < nowDateComparable) {
      showToast("截止日期不能小于当前时间", "error");
      return;
    }
  }

  try {
    // 获取分类名称 - 修复字段引用
    const category = categoryStore.categories.find(c => c.id === editTask.categoryId);
    
    await taskStore.updateTask(props.taskId, {
      title: editTask.title,
      content: editTask.content,
      category: category?.categoryName || editTask.category,
      categoryId: editTask.categoryId,
      dueDate: editTask.dueDate,
    });

    emit('taskUpdated');
    emit('close');
  } catch (error) {
    console.error('编辑任务失败:', error);
  }
}

// 取消编辑
function handleCancel() {
  emit('close');
}

// 监听任务变化，重新初始化表单
watch(() => props.taskId, () => {
  initializeForm();
}, { immediate: true });

// 监听分类变化，更新表单分类信息
watch(() => editTask.categoryId, (newCategoryId) => {
  const category = categoryStore.categories.find(c => c.id === newCategoryId);
  if (category) {
    editTask.category = category.categoryName;
  }
});

onMounted(() => {
  initializeForm();
});
</script>

<template>
  <div class="task-edit-form" :class="{ 'drawer-mode': isDrawerMode }">
    <div v-if="!isDrawerMode" class="form-title">
      <span class="icon">✏️</span> 编辑任务
    </div>

    <div class="task-form-content">
      <div class="task-inputs">
        <input v-model="editTask.title" class="form-control task-title" placeholder="输入任务标题..."
          @keyup.enter="handleSubmit" />
        <div v-if="titleError" class="error-message">{{ titleError }}</div>

        <textarea v-model="editTask.content" class="form-control task-content" placeholder="输入任务内容..."
          :rows="isDrawerMode ? 2 : 3"></textarea>
      </div>

      <div class="form-section">
        <p class="field-label">选择分类：</p>
        <div class="category-selector">
          <select class="form-control select-control"
            :disabled="categoryStore.loading || categoryStore.categories.length === 0" v-model="editTask.categoryId">
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
      </div>

      <div class="form-section">
        <p class="field-label">截止日期：</p>
        <div class="date-picker-trigger" @click="openDatePicker">
          <input :value="formatDateTime(editTask.dueDate)" class="form-control" placeholder="选择日期" readonly />
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
        <button class="btn btn-secondary cancel-btn" @click="handleCancel">
          <span class="icon">✕</span>
          取消
        </button>
        <button class="btn btn-primary submit-btn" :disabled="!editTask.title.trim()" @click="handleSubmit">
          <span class="icon">✓</span>
          保存
        </button>
      </div>
    </div>

    <!-- 日期选择器抽屉组件 -->
    <DatePickerDrawer :is-open="showDatePickerDrawer" :title="'选择截止日期'"
      :selected-date="formatDateToYYYYMMDD(editTask.dueDate)" @select="handleDateSelect" @close="closeDatePicker" />
  </div>
</template>

<style scoped>
.task-edit-form {
  padding: 16px;
}

.task-edit-form.drawer-mode {
  padding: 16px 24px;
  background: none;
  height: 100%;
  display: flex;
  flex-direction: column;
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
}

.time-select option {
  background-color: var(--card-bg);
  color: var(--text-color);
  font-size: 14px;
  opacity: 1;
}

.separator {
  font-size: 18px;
  color: var(--text-color);
  margin: 0 5px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  margin-bottom: 0;
}

.submit-btn,
.cancel-btn {
  flex: 1;
  min-height: 44px;
  font-weight: 500;
}

.cancel-btn {
  background-color: var(--background-color-soft);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.cancel-btn:hover {
  background-color: var(--background-color);
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
  background-color: var(--card-color) !important;
  border: 1px solid var(--border-color) !important;
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

.category-selector {
  position: relative;
  overflow: visible;
}

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
.task-edit-form.drawer-mode .task-form-content {
  margin-top: 0;
  height: 100%;
}

.task-edit-form.drawer-mode .submit-btn {
  background-color: var(--primary-color);
  color: var(--text-on-primary);
  border: none;
  border-radius: var(--border-radius);
  font-size: 16px;
  opacity: 1;
}

.task-edit-form.drawer-mode .submit-btn:hover:not(:disabled) {
  background-color: var(--primary-light);
}

.task-edit-form.drawer-mode .task-content,
.task-edit-form.drawer-mode .task-title {
  background-color: var(--card-bg);
  color: var(--text-color);
  opacity: 1;
}

.task-edit-form.drawer-mode .form-control {
  background-color: var(--card-bg) !important;
  color: var(--text-color) !important;
  opacity: 1 !important;
}

.task-edit-form.drawer-mode .field-label {
  color: var(--text-color);
  opacity: 1;
}

.task-edit-form.drawer-mode .select-control {
  background-color: var(--card-bg) !important;
  color: var(--text-color) !important;
  opacity: 1 !important;
}

/* 自适应样式 */
@media (max-width: 767px) {
  .task-edit-form {
    padding: 12px;
  }

  .task-edit-form.drawer-mode {
    padding: 12px 16px;
  }

  .form-actions {
    flex-direction: column;
    gap: 8px;
  }

  .time-selectors {
    max-width: 120px;
  }

  .field-label {
    font-size: 13px;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .task-edit-form {
    padding: 14px;
  }

  .task-edit-form.drawer-mode {
    padding: 14px 20px;
  }
}

@media (min-width: 1200px) {
  .task-edit-form {
    padding: 18px;
  }

  .task-edit-form.drawer-mode {
    padding: 18px 28px;
  }
}
</style>