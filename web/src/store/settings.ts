import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', () => {
    // 未登录时是否自动跳转到登录页
    const redirectToLoginWhenNotAuth = ref(true);

    function setRedirectToLogin(val: boolean) {
        redirectToLoginWhenNotAuth.value = val;
        // 可选：持久化到localStorage
        localStorage.setItem('redirectToLoginWhenNotAuth', val ? '1' : '0');
    }

    // 初始化时从localStorage读取
    if (localStorage.getItem('redirectToLoginWhenNotAuth')) {
        redirectToLoginWhenNotAuth.value = localStorage.getItem('redirectToLoginWhenNotAuth') === '1';
    }

    return {
        redirectToLoginWhenNotAuth,
        setRedirectToLogin,
    };
});
