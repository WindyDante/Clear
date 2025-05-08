<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from "vue";
import { useTaskStore } from "../../store/task";
import TabNavigation from "../common/TabNavigation.vue";

const taskStore = useTaskStore();

const tabs = [
  { id: "category", name: "分类" },
  { id: "dueDate", name: "截止日期" },
];

const activeTab = ref("category");
const showDatePicker = ref(false);
const datePickerRef = ref<HTMLElement | null>(null);
const categories = ["默认", "工作", "学习", "生活", "娱乐"];

const newTask = reactive({
  title: "",
  content: "",
  category: "默认",
  dueDate: null as string | null,
  dueTime: "12:00" as string, // 默认时间设置为中午12点
});

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
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

async function handleSubmit() {
  if (!newTask.title.trim()) return;

  await taskStore.addTask({
    title: newTask.title,
    content: newTask.content,
    category: newTask.category,
    dueDate: newTask.dueDate,
  });

  // Reset form
  newTask.title = "";
  newTask.content = "";
  newTask.category = "默认";
  newTask.dueDate = null;
  newTask.dueTime = "12:00";
  activeTab.value = "category";
}
</script>

<template>
  <div class="task-form card">
    <h3 class="form-title"><span class="icon">📦</span> 添加任务</h3>

    <div class="task-inputs">
      <input
        v-model="newTask.title"
        class="form-control task-title"
        placeholder="输入任务标题..."
        @keyup.enter="handleSubmit"
      />

      <textarea
        v-model="newTask.content"
        class="form-control task-content"
        placeholder="输入任务内容..."
        rows="3"
      ></textarea>
    </div>

    <TabNavigation
      :tabs="tabs"
      :active-tab="activeTab"
      @change="handleTabChange"
    />

    <div v-if="activeTab === 'category'" class="tab-content">
      <p class="field-label">选择分类：</p>
      <div class="category-selector">
        <select v-model="newTask.category" class="form-control select-control">
          <option
            v-for="category in categories"
            :key="category"
            :value="category"
          >
            {{ category }}
          </option>
        </select>
        <span class="select-arrow">▼</span>
      </div>
    </div>

    <div v-else-if="activeTab === 'dueDate'" class="tab-content">
      <p class="field-label">截止日期 ({{ newTask.category }})：</p>
      <div class="date-picker-trigger" @click="showDatePicker = true">
        <input
          :value="formatDateTime(newTask.dueDate)"
          class="form-control"
          placeholder="选择日期和时间"
          readonly
        />
        <span class="calendar-icon">📅</span>
      </div>

      <!-- This would be replaced with a real date picker component -->
      <div v-if="showDatePicker" class="date-picker-demo" ref="datePickerRef">
        <div class="date-picker-header">
          <button class="picker-nav" @click="prevMonth">◀</button>
          <div class="current-month">{{ currentMonthName }}</div>
          <button class="picker-nav" @click="nextMonth">▶</button>
        </div>
        <div class="date-grid">
          <!-- A simple representation of the date picker UI -->
          <div
            v-for="day in daysInMonth"
            :key="day"
            class="date-cell"
            :class="{ active: day === selectedDay }"
            @click="handleDateSelect(day)"
          >
            {{ day }}
          </div>
        </div>
      </div>

      <div class="time-picker">
        <p class="field-label">选择时间：</p>
        <input
          type="time"
          v-model="newTask.dueTime"
          class="form-control"
          @change="handleTimeChange"
        />
      </div>
    </div>

    <div class="form-actions">
      <button
        class="btn btn-primary submit-btn"
        :disabled="!newTask.title.trim()"
        @click="handleSubmit"
      >
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
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 320px; /* Constrain width to a more typical date picker size */
  margin-top: 8px;
  padding: 16px;
}

.date-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.current-month {
  font-weight: 500;
}

.picker-nav {
  background: none;
  border: none;
  cursor: pointer;
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
}

.date-cell:hover {
  background-color: var(--background-color);
}

.date-cell.active {
  background-color: var(--primary-color);
  color: white;
}

.time-picker {
  margin-top: 16px;
  position: relative; /* 确保定位上下文 */
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

/* 修复时间选择框样式问题 */
.time-picker input[type="time"]::-webkit-calendar-picker-indicator {
  background-color: transparent;
  cursor: pointer;
  position: absolute;
  right: 8px;
  opacity: 0.6;
  padding: 0; /* 移除默认内边距 */
  margin: 0; /* 移除默认外边距 */
}

/* 时间选择器弹出层样式修复 */
::-webkit-time-picker,
::-webkit-datetime-edit,
::-webkit-datetime-edit-fields-wrapper,
::-webkit-datetime-edit-text,
::-webkit-datetime-edit-hour-field,
::-webkit-datetime-edit-minute-field,
::-webkit-datetime-edit-ampm-field {
  padding: 0;
  margin: 0;
  position: static; /* 防止位置偏移 */
  line-height: normal; /* 规范行高 */
}

/* 防止AMPM切换导致布局变化 */
::-webkit-datetime-edit-ampm-field {
  min-width: 40px; /* 给AM/PM预留固定宽度 */
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

/* 自定义下拉箭头相关样式 */
.select-control {
  padding-right: 30px !important;
  appearance: none !important; /* 移除浏览器原生下拉箭头 */
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  background-image: none !important;
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none; /* 确保箭头不会干扰下拉框的点击 */
  font-size: 12px;
  color: var(--text-secondary);
}

.select-control {
  background-color: var(--card-color) !important; /* 设置背景色 */
  border: 1px solid var(--border-color) !important; /* 确保边框正确显示 */
}

/* 单独为IE设置下拉箭头 */
.select-control::-ms-expand {
  display: block !important;
}

/* 确保下拉框容器不会干扰下拉箭头的显示 */
.category-selector {
  position: relative;
  overflow: visible;
}
</style>