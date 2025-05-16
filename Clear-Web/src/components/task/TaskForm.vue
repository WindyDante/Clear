<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, watch } from "vue";
import { useTaskStore } from "../../store/task";
import { useCategoryStore } from "../../store/category";
import TabNavigation from "../common/TabNavigation.vue";
import { useToast } from "../../composables/useToast";

const taskStore = useTaskStore();
const categoryStore = useCategoryStore(); // 使用集中的分类状态管理
const { showToast } = useToast();

const tabs = [
  { id: "category", name: "分类" },
  { id: "dueDate", name: "截止日期" },
];

const activeTab = ref("category");
const showDatePicker = ref(false);
const datePickerRef = ref<HTMLElement | null>(null);

const newTask = reactive({
  title: "",
  content: "",
  category: "默认", // 存储分类名称
  categoryId: 0, // 存储分类ID
  dueDate: null as string | null,
  dueTime: "12:00" as string, // 默认时间设置为中午12点
});

// 监听分类数据变化，确保选择框始终显示正确的选中项
watch(() => categoryStore.categories, (categories) => {
  if (categories && categories.length > 0) {
    // 如果分类数据变化且有数据，设置默认选中第一个分类
    const firstCategory = categories[0];
    newTask.category = firstCategory.categoryName;
    newTask.categoryId = firstCategory.categoryId;
    console.log('已设置默认分类:', firstCategory.categoryName, firstCategory.categoryId);
  }
}, { immediate: true }); // immediate: true 确保在组件创建时立即执行一次

// 处理分类选择变化
function handleCategoryChange(event: Event) {
  const selectElement = event.target as HTMLSelectElement;
  const selectedCategoryId = selectElement.value;
  
  console.log('选择的分类ID (原始值):', selectedCategoryId);
  
  // 找到对应的分类对象
  const selectedCategory = categoryStore.categories.find(
    category => category.categoryId.toString() === selectedCategoryId
  );
  
  if (selectedCategory) {
    // 确保使用正确的类型
    // 如果后端需要数字类型，将字符串转换为数字
    newTask.categoryId = typeof selectedCategory.categoryId === 'string' 
      ? parseInt(selectedCategory.categoryId) 
      : selectedCategory.categoryId;
    newTask.category = selectedCategory.categoryName;
    
    console.log('设置任务分类:', newTask.category, '分类ID:', newTask.categoryId);
  } else {
    console.warn('未找到匹配的分类:', selectedCategoryId);
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

// 格式化时间为24小时制
function formatTimeString(timeString: string) {
  return timeString; // 已经是24小时制，保持不变
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

function handleTabChange(tabId: string) {
  activeTab.value = tabId;
  // 在切换到非日期选择器标签时，始终关闭日期选择器
  if (tabId !== "dueDate") {
    showDatePicker.value = false;
  }
}

function handleDateSelect(day: number) {
  const date = new Date(currentYear.value, currentMonth.value, day);
  // 使用当前选择的时间
  const [hours, minutes] = newTask.dueTime.split(':').map(Number);
  date.setHours(hours, minutes);

  // 格式化为ISO字符串并保存
  newTask.dueDate = date.toISOString();
}

// 处理时间选择
function handleTimeChange(event: Event) {
  const timeString = (event.target as HTMLInputElement).value;
  newTask.dueTime = timeString;

  // 如果已经选择了日期，则更新日期时间
  if (newTask.dueDate) {
    const date = new Date(newTask.dueDate);
    const [hours, minutes] = timeString.split(':').map(Number);
    date.setHours(hours, minutes);
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
    !target.closest(".date-picker-trigger") &&
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
    newTask.categoryId = firstCategory.categoryId;
  } else {
    // 如果分类列表为空，使用默认分类
    newTask.category = "默认";
    newTask.categoryId = 0;
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

async function handleSubmit() {
  if (!newTask.title.trim()) return;

  try {
    await taskStore.addTask({
      title: newTask.title,
      content: newTask.content,
      category: newTask.category,
      categoryId: newTask.categoryId, // 添加分类ID
      dueDate: newTask.dueDate,
    });

    // 显示添加成功的 Toast
    showToast(`任务"${newTask.title}"添加成功`, "success");

    // Reset form
    newTask.title = "";
    newTask.content = "";
    
    // 重置为第一个分类
    if (categoryStore.categories.length > 0) {
      const firstCategory = categoryStore.categories[0];
      newTask.category = firstCategory.categoryName;
      newTask.categoryId = firstCategory.categoryId;
    } else {
      newTask.category = "默认";
      newTask.categoryId = 0;
    }
    
    newTask.dueDate = null;
    newTask.dueTime = "12:00";
    activeTab.value = "category";
  } catch (error) {
    // 显示添加失败的 Toast
    showToast("任务添加失败，请重试", "error");
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

    <TabNavigation :tabs="tabs" :active-tab="activeTab" @change="handleTabChange" />

    <div v-if="activeTab === 'category'" class="tab-content">
      <p class="field-label">选择分类：</p>
      <div class="category-selector">
        <select 
          class="form-control select-control" 
          :disabled="categoryStore.loading"
          v-model="newTask.categoryId"
        >
          <option v-if="categoryStore.loading" value="" disabled>加载中...</option>
          <option 
            v-for="category in categoryStore.categories" 
            :key="category.categoryId" 
            :value="category.categoryId"
          >
            {{ category.categoryName }}
          </option>
        </select>
        <span class="select-arrow">▼</span>
      </div>
    </div>

    <div v-else-if="activeTab === 'dueDate'" class="tab-content">
      <p class="field-label">截止日期 ({{ newTask.category }})：</p>
      <div class="date-picker-trigger" @click="showDatePicker = true">
        <input :value="formatDateTime(newTask.dueDate)" class="form-control" placeholder="选择日期和时间" readonly />
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
        <input type="time" v-model="newTask.dueTime" class="form-control" @change="handleTimeChange" />
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
  top: 39%;
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

.time-picker input[type="time"] {
  height: 40px;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  background-color: var(--card-color);
  padding: 0 12px;
  font-size: 14px;
  color: var(--text-color);
  width: 100%;
  cursor: pointer;
  position: relative;
  box-sizing: border-box;
}

.time-picker input[type="time"]::-webkit-calendar-picker-indicator {
  background-color: transparent;
  cursor: pointer;
  position: absolute;
  right: 8px;
  opacity: 0.6;
  padding: 0;
  margin: 0;
}

::-webkit-time-picker,
::-webkit-datetime-edit,
::-webkit-datetime-edit-fields-wrapper,
::-webkit-datetime-edit-text,
::-webkit-datetime-edit-hour-field,
::-webkit-datetime-edit-minute-field,
::-webkit-datetime-edit-ampm-field {
  padding: 0;
  margin: 0;
  position: static;
  line-height: normal;
}

::-webkit-datetime-edit-ampm-field {
  min-width: 40px;
  text-align: center;
}

.time-picker input[type="time"]:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
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
  padding: 12px 0;
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
  top: 39%;
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