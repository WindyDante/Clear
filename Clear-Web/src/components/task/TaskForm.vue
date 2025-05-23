<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, watch } from "vue";
import { useTaskStore } from "../../store/task";
import { useCategoryStore } from "../../store/category";
// TabNavigation import removed
import { useToast } from "../../composables/useToast";
import { useRouter } from 'vue-router';

const props = defineProps<{ // Added
  canOperate?: boolean
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

// tabs array removed
// activeTab ref removed

const showDatePicker = ref(false);
const datePickerRef = ref<HTMLElement | null>(null);

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
    // 使用字符串类型的分类ID
    newTask.categoryId = firstCategory.categoryId;
    // console.log('已设置默认分类:', firstCategory.categoryName, firstCategory.categoryId); // 移除或注释掉这行
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

// 计算当前选中的日期
const selectedDay = computed(() => {
  if (!newTask.dueDate) return null;
  const dateObj = new Date(newTask.dueDate);
  return dateObj.getDate();
});

// 当前日期
const currentDate = new Date();
const currentYear = ref(currentDate.getFullYear());
const currentMonth = ref(currentDate.getMonth());

// 计算当前月份的天数
const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
});

// 月份名称
const monthNames = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月"
];

// 计算当前显示的月份名称和年份
const currentMonthName = computed(() => {
  return `${monthNames[currentMonth.value]} ${currentYear.value}`;
});

// 导航到上个月
function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
}

// 导航到下个月
function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
}

// handleTabChange function removed

function handleDateSelect(day: number) {
  const date = new Date(currentYear.value, currentMonth.value, day);
  // 使用当前选择的时间
  const [hours, minutes] = newTask.dueTime.split(':').map(Number);
  date.setHours(hours, minutes);

  // 格式化为ISO字符串并保存
  newTask.dueDate = date.toISOString();
}

// 处理时间选择器更改
function handleTimeChange() {
  // 更新时间
  newTask.dueTime = `${selectedHour.value}:${selectedMinute.value}`;

  // 如果已经选择了日期，则更新日期时间
  if (newTask.dueDate) {
    const date = new Date(newTask.dueDate);
    date.setHours(parseInt(selectedHour.value), parseInt(selectedMinute.value));
    newTask.dueDate = date.toISOString();
  }
}

// 点击外部区域关闭日期选择器
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  // 检查点击是否在日期选择器外部，且不是日期选择器触发器
  if (
    datePickerRef.value &&
    !datePickerRef.value.contains(target) &&
    !target.closest(".date-picker-trigger") && // Ensure not clicking the trigger itself
    showDatePicker.value
  ) {
    showDatePicker.value = false;
  }
}

// 生命周期钩子，用于添加和移除点击事件监听器
onMounted(() => {
  document.addEventListener("click", handleClickOutside);

  // 不再单独获取分类数据，而是使用父组件已加载的共享状态
  // 初始化任务的分类选项
  if (categoryStore.categories.length > 0) {
    const firstCategory = categoryStore.categories[0];
    newTask.category = firstCategory.categoryName;
    // 使用字符串类型的分类ID
    newTask.categoryId = firstCategory.categoryId;
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

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

async function handleSubmit() {
  if (!props.canOperate) {
    router.push('/auth');
    showToast('请先登录再操作', 'warning');
    return;
  }
  if (!newTask.title.trim()) return;

  // 校验分类是否选择
  if (!newTask.categoryId && categoryStore.categories.length > 0) {
    showToast("请选择一个分类", "error");
    return;
  } else if (categoryStore.categories.length === 0) {
    showToast("请先添加分类后再创建任务", "error");
    // activeTab.value = "category"; // Removed: No longer relevant
    // 更好的做法可能是引导用户到分类管理页面
    return;
  }

  // 校验截止日期是否小于当前时间
  if (newTask.dueDate) {
    const selectedDueDate = new Date(newTask.dueDate);
    const now = new Date();
    // 比较时，确保比较到分钟级别，忽略秒和毫秒
    const selectedDateComparable = new Date(selectedDueDate.getFullYear(), selectedDueDate.getMonth(), selectedDueDate.getDate(), selectedDueDate.getHours(), selectedDueDate.getMinutes());
    const nowDateComparable = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());

    if (selectedDateComparable < nowDateComparable) {
      showToast("截止日期不能小于当前时间", "error");
      return; // 阻止提交并保持当前表单状态
    }
  }

  try {
    await taskStore.addTask({
      title: newTask.title,
      content: newTask.content,
      category: newTask.category,
      categoryId: newTask.categoryId, // 添加分类ID
      dueDate: newTask.dueDate,
    });

    // Reset form
    newTask.title = "";
    newTask.content = "";

    // 重置为第一个分类或清空
    if (categoryStore.categories.length > 0) {
      const firstCategory = categoryStore.categories[0];
      newTask.category = firstCategory.categoryName;
      newTask.categoryId = firstCategory.categoryId;
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

    // activeTab.value = "category"; // Removed: No longer relevant
  } catch (error) {
    // 显示添加失败的 Toast // 已在 store 中处理，由 api.ts 抛出错误时统一处理
    // showToast("任务添加失败，请重试", "error");
  }
}
</script>

<template>
  <div class="task-form card">
    <h3 class="form-title"><span class="icon">📦</span> 添加任务</h3>

    <div class="task-inputs">
      <input v-model="newTask.title" class="form-control task-title" placeholder="输入任务标题..."
        @keyup.enter="handleSubmit" />

      <textarea v-model="newTask.content" class="form-control task-content" placeholder="输入任务内容..." rows="3"></textarea>
    </div>

    <!-- TabNavigation removed -->

    <!-- Combined content for category and due date -->
    <div class="tab-content form-section">
      <p class="field-label">选择分类：</p>
      <div class="category-selector">
        <select class="form-control select-control"
          :disabled="categoryStore.loading || categoryStore.categories.length === 0" v-model="newTask.categoryId">
          <option v-if="categoryStore.loading" value="" disabled>加载中...</option>
          <option v-else-if="!categoryStore.loading && categoryStore.categories.length === 0" value="" disabled>
            暂无分类，请先添加</option>
          <option v-for="category in categoryStore.categories" :key="category.categoryId" :value="category.categoryId">
            {{ category.categoryName }}
          </option>
        </select>
        <span class="select-arrow">▼</span>
      </div>
    </div>

    <div class="tab-content form-section"> <!-- Added class form-section for potential styling -->
      <p class="field-label">截止日期：</p> <!-- Removed ({{ newTask.category }}) as it might be confusing now -->
      <div class="date-picker-trigger" @click="showDatePicker = true">
        <input :value="formatDateTime(newTask.dueDate)" class="form-control" placeholder="选择日期" readonly />
        <span class="calendar-icon">📅</span>
      </div>

      <div v-if="showDatePicker" class="date-picker-demo" ref="datePickerRef">
        <div class="date-picker-header">
          <button class="picker-nav" @click="prevMonth">◀</button>
          <div class="current-month">{{ currentMonthName }}</div>
          <button class="picker-nav" @click="nextMonth">▶</button>
        </div>
        <div class="date-grid">
          <div v-for="day in daysInMonth" :key="day" class="date-cell" :class="{ active: day === selectedDay }"
            @click="handleDateSelect(day)">
            {{ day }}
          </div>
        </div>
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
        添加
      </button>
    </div>
  </div>
</template>

<style scoped>
.task-form {
  padding: 16px;
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
  margin-bottom: 16px;
}

.task-title {
  margin-bottom: 12px;
  font-weight: 500;
}

.task-content {
  resize: vertical;
}

.field-label {
  margin-bottom: 8px;
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
  gap: 8px;
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
  margin-top: 16px;
  position: relative;
}

.time-selectors {
  display: flex;
  justify-content: flex-start;
  /* Align to the left */
  align-items: center;
  height: 40px;
  position: relative;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  max-width: 100px;
  margin: 0;
  /* Ensure no auto margins interfere with left alignment */
}

.time-select {
  margin: 10px;
  width: 50px;
  padding: 0;
  height: 100%;
  border: none;
  border-radius: var(--border-radius);
  background-color: transparent;
  color: var(--text-color);
  font-size: 15px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  text-align: center;
  text-align-last: center;
  line-height: 40px;
}

/* Style for the dropdown list to make it scrollable and mobile-friendly */
.time-select option {
  background-color: var(--card-bg);
  color: var(--text-color);
  font-size: 14px;
  /* Reduced font size for options on mobile */
}

/* Limit height and enable scrolling for the select dropdown */
.time-select:focus {
  outline: none;
}

/* Styling for the actual dropdown list (browser-dependent, might need more specific selectors for some browsers) */
/* For Webkit browsers */
select {
  max-height: 200px;
  /* Limit the height of the dropdown */
  overflow-y: auto;
  /* Enable vertical scrolling */
}


.separator {
  font-size: 18px;
  color: var(--text-color);
  margin: 0 5px;
  /* Adjusted margin */
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.submit-btn {
  flex-grow: 1;
}

.icon-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--background-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-speed);
}

.icon-button:hover {
  background-color: var(--primary-light);
}

.tab-content {
  padding: 0 0;
}

.form-section {
  /* Added for spacing if needed */
  margin-bottom: 16px;
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
</style>