import type { Todo, Category, Response, TodoPageQuery, TodoToAdd, TodoToUpdate } from "~/types/models"
import { getRequest, postRequest, putRequest, deleteRequest } from "~/utils/api"

export const useTodo = () => {
    const toast = useToast();

    const fetchCategories = async () => {
        try {
            const response = await getRequest<Category[]>('todo/categories');
            if (!response) {
                throw new Error('Fetch categories request failed');
            }

            return response;
        } catch (error) {
            console.error(error);
        }
    }

    const fetchTodos = async (todoPageQuery: TodoPageQuery) => {
        try {
            const response = await getRequest<{total: number, records: Todo[]}>('todo/page', todoPageQuery);
            if (!response) {
                throw new Error('Fetch todos request failed');
            }

            return response;
        } catch (error) {
            console.error(error);
        }
    }

    const addTodo = async (todoToAdd : TodoToAdd) => {
        try {
            const response = await postRequest<Response<any>>('todo/addTodo', todoToAdd);
            if (!response) {
                throw new Error('Add todo request failed');
            }

            toast.add({
                title: "添加成功",
                icon: "i-fluent-checkmark-starburst-16-regular",
                color: "green",
                timeout: 1000,
            })

            return response;
        } catch (error) {
            console.error(error);
        }
    }

    const updateTodo = async (todoToUpdate: TodoToUpdate) => {
        try {
            const response = await putRequest<Response<any>>('todo/updateTodo', todoToUpdate);
            if (!response) {
                throw new Error('Update todo request failed');
            }

            return response;
        } catch (error) {
            console.error(error);
        }
    }

    const deleteTodo = async (id: number) => {
        try {

            const response = await deleteRequest<Response<any>>(`todo/deleteTodo/${id}`);
            if (!response) {
                throw new Error('Delete todo request failed');
            }

            toast.add({
                title: "删除成功",
                icon: "i-fluent-checkmark-starburst-16-regular",
                color: "green",
                timeout: 1000,
            })

            return response;
        } catch (error) {
            console.error(error);
        }
    }

    return { fetchTodos, fetchCategories, addTodo, updateTodo, deleteTodo }
}