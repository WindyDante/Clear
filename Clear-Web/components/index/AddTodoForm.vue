<template>
  <!-- 第二部分，显示添加Todo表单 -->
  <UCard class="mx-auto mt-4 max-w-sm">
    <div class="flex justify-between  mb-3">
      <div class="flex justify-start items-center gap-2">
        <UIcon name="i-unjs-unbuild" class="w-5 h-5" />
        <h2 class="text-lg font-semibold text-slate-900">添加任务</h2>
      </div>
      <div class="flex justify-end items-center gap-2"> 
        <!-- 清空表单 -->
        <UButton
          icon="i-fluent-broom-16-regular"
          variant="solid"
          color="gray"
          size="sm"
          @click="clearForm"
        />

        <!-- 添加Todo -->
        <UButton
          icon="i-fluent-add-12-filled"
          variant="solid"
          color="gray"
          size="sm"
          @click="addTodoData"
        />
      </div>
    </div>
    <!-- Todo Title -->
    <UInput
      icon="i-fluent-emoji-flat-thinking-face"
      size="sm"
      color="gray"
      :trailing="true"
      placeholder="输入任务标题..."
      v-model="todoTitle"
      class="mb-4"
    />

    <!-- Todo Content -->
    <UTextarea
      v-model="todoContent"
      size="sm"
      color="gray"
      placeholder="输入任务内容..."
      :rows="3"
      class="mb-4"
    />

    <!-- Todo Due Date && Todo Category && Action -->

    <UTabs :items="items" class="w-full">
      <template #item="{ item }">
        <!-- Todo 分类选择 -->
        <div
          v-if="item.key === 'category'"
          class="flex justify-between items-center gap-2 p-2"
        >
          <span class="text-md text-gray-600">选择分类 ：</span>
          <div class="flex items-end">
            <!-- 添加新分类 -->
            <!-- <UButton
            icon="i-heroicons-plus-circle-20-solid"
            variant="solid"
            color="gray"
            class="mr-2"/> -->

            <!-- 分类选择菜单 -->
            <USelectMenu
            v-model="selected"
            :options="categories"
            value-attribute="categoryId"
            option-attribute="categoryName"
            class="w-32"
          />
          </div>
        </div>

        <!-- 截止日期选择 -->
        <div
          v-else-if="item.key === 'dueDate'"
          class="flex justify-between items-center gap-2 p-2"
        >
          <span class="text-md text-gray-600">截止日期 (默认无) ： </span>

          <UPopover :popper="{ placement: 'bottom-start' }">
            <UButton
              icon="i-heroicons-calendar-days-20-solid"
              variant="solid"
              color="gray"
            />

            <template #panel="{ close }">
              <DatePicker v-model="date" is-required @close="close" />
            </template>
          </UPopover>
        </div>

        <!-- Todo 操作按钮 -->
        <!-- <div
          v-else-if="item.key === 'actions'"
          class="flex justify-between items-center gap-2 p-2"
        >
          <UButton
            color="red"
            variant="soft"
            size="md"
            icon="i-fluent-emoji-flat:broom"
            @click="clearForm"
          >
            清空表单
          </UButton>

          <UButton
            color="green"
            variant="soft"
            size="md"
            icon="i-fluent-emoji-flat:writing-hand-medium-light"
            @click="addTodoData"
          >
            添加任务
          </UButton>
        </div> -->
      </template>
    </UTabs>
  </UCard>
</template>

<script setup lang="ts">
import DatePicker from "./DatePicker.vue";
import { ref, onMounted } from "vue";
import { format } from "date-fns";
import type { Category } from "~/types/models";
import { UButton } from "#components";

const { fetchCategories, addTodo } = useTodo();

const todoStore = useTodoStore();

const items = [
  { key: "category", label: "分类", description: "选择任务所属分类" },
  { key: "dueDate", label: "截止日期", description: "选择任务的截止日期" },
  // { key: "actions", label: "其他", description: "任务操作" },
];

// 表单数据
const todoTitle = ref("");
const todoContent = ref("");
const selectedCategoryId = ref<number>();
const date = ref<Date | null>(null);

const categories = ref<Category[]>([]);
const selected = ref<Category>();
const fetchCategoriesData = async () => {
  const response = await fetchCategories();
  if (response?.data?.length) {
    // console.log("response",response.data);
    categories.value = response.data;
    selected.value = response.data[0];
    selectedCategoryId.value = selected.value?.categoryId;
  }
};

const clearForm = () => {
  todoTitle.value = "";
  todoContent.value = "";
  selectedCategoryId.value = selected.value?.categoryId;
  date.value = new Date();
};

const formatDate = (date: Date) => {
  return date.toISOString().split("T")[0]; // 只取 YYYY-MM-DD 部分
};

const addTodoData = async () => {
  const todo = {
    title: todoTitle.value,
    content: todoContent.value,
    categoryId: selectedCategoryId.value,
    dueDate: date.value ? formatDate(date.value) : null,
  };

  const response = await addTodo(todo);
  if (response) {
    clearForm();
    todoStore.currentPage = 1;
    todoStore.fetchTodosData();
  }
};
  

onMounted(() => {
  fetchCategoriesData();
  // console.log("categories",categories.value);
  if (categories.value.length) {
    selected.value = categories.value[0];
    selectedCategoryId.value = selected.value?.categoryId;
  }
});

</script>
