<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
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
});

function handleTabChange(tabId: string) {
  activeTab.value = tabId;
  // 在切换到非日期选择器标签时，始终关闭日期选择器
  if (tabId !== "dueDate") {
    showDatePicker.value = false;
  }
}

function handleDateSelect(date: string) {
  newTask.dueDate = date;
  showDatePicker.value = false;
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
          :value="newTask.dueDate || ''"
          class="form-control"
          placeholder="选择日期"
          readonly
        />
        <span class="calendar-icon">📅</span>
      </div>

      <!-- This would be replaced with a real date picker component -->
      <div v-if="showDatePicker" class="date-picker-demo" ref="datePickerRef">
        <div class="date-picker-header">
          <button class="picker-nav">◀</button>
          <div class="current-month">May 2025</div>
          <button class="picker-nav">▶</button>
        </div>
        <div class="date-grid">
          <!-- A simple representation of the date picker UI -->
          <div
            v-for="day in 31"
            :key="day"
            class="date-cell"
            :class="{ active: day === 15 }"
            @click="handleDateSelect(`2025-05-${day}`)"
          >
            {{ day }}
          </div>
        </div>
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

      <button class="icon-button">
        <span class="icon">+</span>
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

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.submit-btn {
  flex-grow: 1;
  margin-right: 12px;
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