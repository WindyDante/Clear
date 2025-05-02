// User
export interface User {
    id: number;
    username: string;
    token?: string;
}

// Todo
export interface Todo {
    todoId: number;
    title: string;
    content: string;
    dueDate?: Date;
    status: number;
    categoryId: number;
    categoryName: string;
}

// Categort
export interface Category {
    categoryId: number;
    categoryName: string;
}

// UserToLogin
export interface UserToLogin {
    username: string;
    password: string;
}

// UserToRegister
export interface UserToRegister {
    username: string;
    password: string;
}

// Response
export interface Response<T> {
    code: number;
    msg: string;
    data: T;
}

// TodoPageQuery
export interface TodoPageQuery {
    page: number;
    pageSize: number;
    status?: number;
    categoryId?: number;
}

// TodoToAdd
export interface TodoToAdd {
    title: string;
    content: string;
    dueDate?: string | null;
    categoryId?: number;
}

// TodoToUpdate
export interface TodoToUpdate {
    id: number;
    title: string;
    content: string;
    dueDate?: string | null;
    categoryId?: number;
    status: number;
}

