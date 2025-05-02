import { defineStore } from "pinia";
import { ref } from "vue";
import type { Todo, TodoPageQuery } from "~/types/models";

export const useTodoStore = defineStore("todoStore", () => {
    const { fetchTodos } = useTodo();

  // 状态
  const todos = ref<Todo[]>([]);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(4); // 每页大小
  const isLoading = ref(false); // 加载状态

  // 获取 Todo 分页查询参数
  const getTodoPageQueryParam = (page: number): TodoPageQuery => ({
    page,
    pageSize: pageSize.value,
    status: 1, // 例如，1代表未完成的todo
  });

  // 获取分页数据
  const fetchTodosData = async () => {
    isLoading.value = true; // 开始加载数据
    try {
      const response = await fetchTodos(getTodoPageQueryParam(currentPage.value));
      if (response) {
        todos.value = response.data.records;
        total.value = response.data.total;
      }
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      isLoading.value = false; // 加载完成
    }
  };

  // 翻页时获取新的数据
  const changePage = (page: number) => {
    currentPage.value = page;
    fetchTodosData();
  };

  return {
    todos,
    total,
    currentPage,
    pageSize,
    isLoading,
    fetchTodosData,
    changePage,
  };
});