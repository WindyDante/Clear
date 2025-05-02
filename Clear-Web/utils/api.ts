import type { Response } from "~/types/models";

export const postRequest = async <T>(url: string, body: object) => {
    const BASE_API = useRuntimeConfig().public.baseApi;
    const toast = useToast();

    try {
        // console.log('BASE_API:', BASE_API);
        // console.log(JSON.stringify(body));
        const response: Response<T> = await $fetch(`${BASE_API}/${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': useAuthStore().getToken() || ''
                
            },
            body: JSON.stringify(body)
        })

        if (response.code !== 1) {
            console.log(response.msg);
            toast.add({
                title: "请求失败",
                description: response.msg,
                icon: "i-fluent-error-circle-16-filled",
                color: "red",
                timeout: 2000,
            })
            return null;
        }

        return response;
    } catch (error) {
        console.error(error);
    }
} 

export const getRequest = async <T>(url: string, params?: any) => {
    const auth = useAuthStore();
    const BASE_API = useRuntimeConfig().public.baseApi;
    const toast = useToast();
    
    try {
        // console.log('BASE_API:', BASE_API);
        // console.log(auth.getToken());

        if (!auth.getToken() || auth.getToken() === '') {
            console.log('No token');
            return null;
        }
        
        // Params Query
        const queryParamString: string = params ? "?" + Object.keys(params).map(key => key + "=" + params[key]).join("&") : "";
        // console.log('queryParamString:', queryParamString);
        const response: Response<T> = await $fetch(`${BASE_API}/${url}${queryParamString}`, {
            method: 'GET',
            headers: {
                'token': auth.getToken() || ''
            }
        })

        if (response.code !== 1) {
            console.log(response.msg);
            toast.add({
                title: "请求失败",
                description: response.msg,
                icon: "i-fluent-error-circle-16-filled",
                color: "red",
                timeout: 2000,
            })
            return null;
        }

        return response;
    } catch (error) {
        console.error(error);
    }
}

export const putRequest = async <T>(url: string, body: object) => {
    const BASE_API = useRuntimeConfig().public.baseApi;
    const toast = useToast();

    try {
        const response: Response<T> = await $fetch(`${BASE_API}/${url}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'token': useAuthStore().getToken() || ''
            },
            body: JSON.stringify(body)
        })

        if (response.code !== 1) {
            console.log(response.msg);
            toast.add({
                title: "请求失败",
                description: response.msg,
                icon: "i-fluent-error-circle-16-filled",
                color: "red",
                timeout: 2000,
            })
            return null;
        }

        return response;
    } catch (error) {
        console.error(error);
    }
}

export const deleteRequest = async <T>(url: string, params?: any) => {
    const BASE_API = useRuntimeConfig().public.baseApi;
    const toast = useToast();

    try {
        // Params Query
        const queryParamString: string = params ? "?" + Object.keys(params).map(key => key + "=" + params[key]).join("&") : "";
        const response: Response<T> = await $fetch(`${BASE_API}/${url}${queryParamString}`, {
            method: 'DELETE',
            headers: {
                'token': useAuthStore().getToken() || ''
            }
        })

        if (response.code !== 1) {
            console.log(response.msg);
            toast.add({
                title: "请求失败",
                description: response.msg,
                icon: "i-fluent-error-circle-16-filled",
                color: "red",
                timeout: 2000,
            })
            return null;
        }

        return response;
    } catch (error) {
        console.error(error);
    }
}